from .symptom_normalizer import normalize_symptoms
from .symptom_interpreter import interpret_symptoms
from .profile_matcher import find_best_profile_match
from .report_analyzer import analyze_medical_report
from rest_framework import viewsets
from django.db.models import Count
from django.db.models.functions import TruncDate
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view
from rest_framework.response import Response
from faster_whisper import WhisperModel
from deep_translator import GoogleTranslator
import tempfile
import os
from .models import Patient, Prediction, MedicalReport
from .serializers import PatientSerializer, PredictionSerializer
class PredictionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Prediction.objects.all().order_by("-created_at")
    serializer_class = PredictionSerializer
    permission_classes = [IsAuthenticated]
import cv2
import numpy as np
import pandas as pd
import joblib
import re
import io
import subprocess
from pathlib import Path
from django.http import HttpResponse

import fitz
import pytesseract

pytesseract.pytesseract.tesseract_cmd = (
    r"C:\Program Files\Tesseract-OCR\tesseract.exe"
)

from PIL import Image, ImageOps

# Load AI Model and Encoders
model = joblib.load("model.pkl")
symptom_encoders = joblib.load("symptom_encoders.pkl")
disease_encoder = joblib.load("disease_encoder.pkl")

# New order-independent disease prediction model
general_model = joblib.load("model_general.pkl")
general_disease_encoder = joblib.load("disease_encoder_general.pkl")
symptom_list = joblib.load("symptom_list.pkl")
# Whisper speech model
#speech_model = WhisperModel(
 #   "medium",
  #  device="cpu",
   # compute_type="int8"
#)

class PatientViewSet(viewsets.ModelViewSet):
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer
    permission_classes = [IsAuthenticated]


from rest_framework.parsers import JSONParser, MultiPartParser, FormParser
from rest_framework.decorators import parser_classes

@api_view(["POST"])
@parser_classes([JSONParser, MultiPartParser, FormParser])
def predict_disease(request):

    symptoms = request.data.get("symptoms", [])

    # -----------------------------------------------------
    # Convert frontend input into one natural-language text
    # -----------------------------------------------------

    if isinstance(symptoms, str):
        raw_text = symptoms

    elif isinstance(symptoms, list):
        raw_text = "\n".join(
            str(item)
            for item in symptoms
        )

    else:
        raw_text = ""


    print("\n" + "=" * 60)
    print("RURALCAREAI PROFILE-BASED PREDICTION")
    print("=" * 60)

    print("RAW SYMPTOM TEXT:")
    print(raw_text)


    # -----------------------------------------------------
    # Interpret natural-language symptoms
    # -----------------------------------------------------

    analysis = interpret_symptoms(
        raw_text,
        symptom_list
    )

    present_symptoms = sorted(
        set(analysis.get("present", []))
    )

    absent_symptoms = sorted(
        set(analysis.get("absent", []))
    )

    unknown_symptoms = sorted(
        set(analysis.get("unknown", []))
    )


    print("PRESENT SYMPTOMS:")
    print(present_symptoms)

    print("ABSENT SYMPTOMS:")
    print(absent_symptoms)

    print("UNKNOWN SYMPTOMS:")
    print(unknown_symptoms)


    # -----------------------------------------------------
    # No recognized symptoms
    # -----------------------------------------------------

    if not present_symptoms:

        return Response(
            {
                "status": "insufficient_evidence",
                "needs_more_information": True,
                "error": (
                    "No recognized symptoms were found. "
                    "Please describe your symptoms more clearly."
                ),
                "recognized_symptoms": [],
                "absent_symptoms": absent_symptoms,
                "unknown_symptoms": unknown_symptoms,
                "message": (
                    "Please describe the symptoms you are actually "
                    "experiencing in more detail."
                ),
                "can_add_more_symptoms": True,
            },
            status=400
        )


    # -----------------------------------------------------
    # Profile-based evidence matching
    # -----------------------------------------------------

    match = find_best_profile_match(
        present_symptoms
    )


    print("PROFILE MATCH STATUS:")
    print(match.get("status"))

    print("PROFILE MATCH SCORE:")
    print(match.get("match_score"))


    # -----------------------------------------------------
    # Insufficient evidence
    # -----------------------------------------------------

    if match.get("status") != "match":

        print("INSUFFICIENT EVIDENCE")
        print("REASON:")
        print(match.get("reason"))


        # Do not force the user to select symptoms they do not have.
        # The frontend can use this response to let the user add any other
        # symptoms they are actually experiencing.
        return Response(
            {
                "status": "insufficient_evidence",
                "needs_more_information": True,
                "error": match.get(
                    "reason",
                    "More information is needed."
                ),
                "message": (
                    "The reported symptoms are not sufficient for a supported "
                    "symptom-profile match. Please add any other symptoms you "
                    "are actually experiencing. Do not select symptoms that "
                    "you do not have."
                ),
                "recognized_symptoms": present_symptoms,
                "absent_symptoms": absent_symptoms,
                "unknown_symptoms": unknown_symptoms,
                "match_score": match.get(
                    "match_score",
                    0.0
                ),
                "can_add_more_symptoms": True,
            },
            status=400
        )


    # -----------------------------------------------------
    # Supported possible condition
    # -----------------------------------------------------

    disease = match["disease"]

    match_score = float(
        match.get("match_score", 0.0)
    )

    evidence_match = (
        f"{match_score * 100:.1f}%"
    )


    print("SUPPORTED POSSIBLE CONDITION:")
    print(disease)

    print("EVIDENCE MATCH:")
    print(evidence_match)

    print("=" * 60)


    # -----------------------------------------------------
    # Supported Disease Information
    #
    # IMPORTANT:
    # These values describe the condition only when RuralCareAI
    # has explicitly supported information for that condition.
    # The evidence-match score is calculated separately by the
    # profile matcher and is NEVER treated as clinical confidence.
    # -----------------------------------------------------
    disease_info = {

        "Fungal infection": {
            "description": (
                "A fungal infection is caused by fungi and can affect "
                "the skin, hair or nails."
            ),
            "doctor": "Dermatologist",
            "risk": "Needs evaluation",
            "precautions": [
                "Keep the affected area clean and dry",
                "Avoid sharing towels or personal items",
                "Wear clean, dry clothes",
                "Consult a healthcare professional if symptoms persist or worsen"
            ]
        },

        "Allergy": {
            "description": (
                "An allergy is an immune response to a substance that "
                "the body considers harmful."
            ),
            "doctor": "General Physician",
            "risk": "Needs evaluation",
            "precautions": [
                "Avoid known or suspected triggers",
                "Monitor whether symptoms are getting worse",
                "Follow medicines prescribed by a healthcare professional",
                "Seek urgent medical care for severe breathing difficulty or swelling"
            ]
        },

        "GERD": {
            "description": (
                "Gastroesophageal reflux disease (GERD) occurs when "
                "stomach contents repeatedly flow back into the food pipe."
            ),
            "doctor": "Gastroenterologist",
            "risk": "Needs evaluation",
            "precautions": [
                "Avoid foods that clearly trigger your symptoms",
                "Eat smaller meals if large meals worsen symptoms",
                "Avoid lying down immediately after eating",
                "Consult a healthcare professional if symptoms are frequent or persistent"
            ]
        },

        "AIDS": {
            "description": (
                "AIDS is the most advanced stage of HIV infection. "
                "A symptom-profile match cannot confirm HIV or AIDS; "
                "confirmation requires appropriate medical testing and "
                "evaluation by a qualified healthcare professional."
            ),
            "doctor": "Infectious Disease Specialist",
            "risk": "Requires medical evaluation",
            "precautions": [
                "Do not treat this symptom match as a confirmed diagnosis",
                "Arrange appropriate medical testing and professional evaluation",
                "Follow the treatment plan provided by a qualified healthcare professional",
                "Seek urgent medical care if severe or rapidly worsening symptoms occur"
            ]
        }

    }

    if disease in disease_info:
        info = {
            **disease_info[disease],
            "information_supported": True
        }
    else:
        # Keep strong profile matches possible, but do not invent
        # disease-specific medical information for unsupported conditions.
        info = {
            "description": (
                "This is a possible condition identified by matching "
                "the reported symptoms with a supported symptom profile "
                "in the project's training dataset. Disease-specific "
                "information for this matched condition has not been "
                "configured in RuralCareAI. This is not a confirmed diagnosis."
            ),
            "doctor": "Qualified healthcare professional",
            "risk": "Requires medical evaluation",
            "precautions": [
                "Use this result only as preliminary health information",
                "Consult a qualified healthcare professional for evaluation",
                "Do not start or stop treatment based only on this result",
                "Seek urgent medical care if severe or worsening symptoms occur"
            ],
            "information_supported": False
        }
    Prediction.objects.create(
    patient_name="Unknown Patient",
    disease=disease,
    confidence=evidence_match,
    doctor=info["doctor"][:20],
    risk=info["risk"][:20]
)
    return Response({
        "prediction": disease,
        "recognized_symptoms": present_symptoms,
        "matched_profile": match.get("matched_profile", []),
        "evidence_match": evidence_match,
        "match_score": match_score,
        "information_supported": info["information_supported"],
        "description": info["description"],
        "doctor": info["doctor"],
        "risk": info["risk"],
        "precautions": info["precautions"]
    })
@api_view(["GET"])
def dashboard_stats(request):

    total_patients = Patient.objects.count()
    total_predictions = Prediction.objects.count()
    total_reports = Prediction.objects.count()
    high_risk = Prediction.objects.filter(risk="High").count()

    return Response({
        "patients": total_patients,
        "predictions": total_predictions,
        "reports": total_reports,
        "high_risk": high_risk,
    })
from rest_framework.decorators import api_view
from rest_framework.response import Response
import tempfile
import os

@api_view(["POST"])
def transcribe_audio(request):

    audio = request.FILES.get("audio")

    if not audio:
        return Response(
            {"error": "No audio uploaded"},
            status=400
        )

    with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as temp_audio:
        for chunk in audio.chunks():
            temp_audio.write(chunk)

        temp_path = temp_audio.name

    try:
        speech_model = WhisperModel(
            "small",
            device="cpu",
            compute_type="int8"
        )

        segments, info = speech_model.transcribe(
            temp_path,
            language=request.data.get("language") or None,
            beam_size=5,
            vad_filter=True,
        )

        text = " ".join(segment.text for segment in segments).strip()

        translated_text = text

        if info.language != "en" and text:
            try:
                translated_text = GoogleTranslator(
                    source="auto",
                    target="en"
                ).translate(text)
            except Exception:
                translated_text = text

        print("Detected language:", info.language)
        print("Original:", text)
        print("Translated:", translated_text)

        normalized = normalize_symptoms(translated_text)

        print("Normalized Symptoms:", normalized)

        return Response({
            "text": translated_text,
            "normalized_symptoms": normalized,
            "original_text": text,
            "language": info.language
        })

    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response({"error": str(e)}, status=500)

    finally:
        os.remove(temp_path)


@api_view(["GET"])
def prediction_trend(request):
    trend = (
        Prediction.objects
        .annotate(date=TruncDate("created_at"))
        .values("date")
        .annotate(count=Count("id"))
        .order_by("date")
    )

    data = []

    for item in trend:
        data.append({
            "date": item["date"].strftime("%Y-%m-%d"),
            "count": item["count"]
        })

    return Response(data)
# ============================================================
# BLOOD REPORT ANALYSIS API
# ============================================================

# ============================================================
# BLOOD REPORT ANALYSIS API
# ============================================================

@api_view(["POST"])
@parser_classes([JSONParser, MultiPartParser, FormParser])
def analyze_report(request):

    report = request.FILES.get("report")

    if not report:
        return Response(
            {"error": "No report uploaded."},
            status=400
        )
    patient_id = request.data.get("patient_id")

    if not patient_id:
        return Response(
            {"error": "Please select a patient."},
            status=400
        )

    try:
        patient = Patient.objects.get(id=patient_id)
    except Patient.DoesNotExist:
        return Response(
            {"error": "Selected patient was not found."},
            status=404
        )

    allowed_types = {
        "application/pdf",
        "image/jpeg",
        "image/png"
    }

    if report.content_type not in allowed_types:
        return Response(
            {
                "error": "Please upload a PDF, JPG, JPEG or PNG medical report."
            },
            status=400
        )

    language = str(
        request.data.get("language", "en")
    ).lower().strip()

    if language not in {"en", "te", "hi", "kn", "ta"}:
        language = "en"

    try:

        result = analyze_medical_report(
            report,
            language
        )

        if not isinstance(result, dict):
            return Response(
                {
                    "error": "The report analyzer returned an invalid response."
                },
                status=500
            )
        MedicalReport.objects.create(
    patient=patient,
    report_name=report.name,
    report_type=result.get(
        "report_type",
        "Other Medical Report"
    ),
    summary=result.get("summary", ""),
    analysis_data=result,
    language=language,
)

        result.setdefault(
            "disclaimer",
            "This analysis is for informational purposes only. "
            "It extracts and explains information from the uploaded report "
            "and does not provide a confirmed diagnosis. "
            "Please consult a qualified healthcare professional for medical decisions."
        )

        return Response(
            result,
            status=200
        )

    except Exception as e:

        import traceback
        traceback.print_exc()

        return Response(
            {
                "success": False,
                "error": "Unable to analyze the uploaded medical report.",
                "details": str(e)
            },
            status=500
        )


# ============================================================
# MULTILINGUAL TEXT-TO-SPEECH API
# Uses the separate tts_env so the main .venv dependency
# environment remains compatible with faster-whisper.
# ============================================================

@api_view(["POST"])
def text_to_speech(request):
    text = str(request.data.get("text", "")).strip()
    language = str(request.data.get("language", "en")).lower().strip()

    allowed_languages = {"en", "te", "hi", "kn", "ta"}

    if not text:
        return Response(
            {"error": "No text provided."},
            status=400
        )

    if language not in allowed_languages:
        language = "en"

    # Project root:
    # D:\Projects\RuralCareAI
    project_root = Path(__file__).resolve().parents[2]

    # Separate TTS Python environment
    if os.name == "nt":
      tts_python = project_root / "tts_env" / "Scripts" / "python.exe"
    else:
      tts_python = project_root / "tts_env" / "bin" / "python"

    # TTS helper script
    tts_script = project_root / "tts_service.py"

    if not tts_python.exists():
        return Response(
            {"error": "TTS environment not found."},
            status=500
        )

    if not tts_script.exists():
        return Response(
            {"error": "tts_service.py not found."},
            status=500
        )

    temp_file = None

    try:
        with tempfile.NamedTemporaryFile(
            suffix=".mp3",
            delete=False
        ) as f:
            temp_file = f.name

        result = subprocess.run(
            [
                str(tts_python),
                str(tts_script),
                language,
                temp_file,
                text,
            ],
            capture_output=True,
            text=True,
            timeout=30,
        )

        if result.returncode != 0:
            print("TTS ERROR:", result.stdout)
            print("TTS ERROR:", result.stderr)

            return Response(
                {
                    "error": "TTS generation failed.",
                    "details": result.stderr or result.stdout,
                },
                status=500,
            )

        if not os.path.exists(temp_file):
            return Response(
                {"error": "TTS audio file was not created."},
                status=500
            )

        with open(temp_file, "rb") as audio_file:
            audio_data = audio_file.read()

        response = HttpResponse(
            audio_data,
            content_type="audio/mpeg"
        )

        response["Content-Disposition"] = (
            'inline; filename="voice_explanation.mp3"'
        )
        response["Cache-Control"] = "no-cache"

        return response

    except subprocess.TimeoutExpired:
        return Response(
            {"error": "TTS generation timed out."},
            status=504
        )

    except Exception as e:
        import traceback
        traceback.print_exc()

        return Response(
            {
                "error": "Multilingual TTS failed.",
                "details": str(e),
            },
            status=500,
        )

    finally:
        if temp_file and os.path.exists(temp_file):
            try:
                os.remove(temp_file)
            except Exception:
                pass
@api_view(["GET"])
def medical_reports(request):

    reports = (
        MedicalReport.objects
        .select_related("patient")
        .order_by("-created_at")
    )

    data = []

    for report in reports:
        data.append({
            "id": report.id,
            "patient_id": report.patient.id,
            "patient_name": report.patient.name,
            "report_name": report.report_name,
            "report_type": report.report_type,
            "summary": report.summary,
            "language": report.language,
            "created_at": report.created_at,
        })

    return Response(data)
