import io
import re

import cv2
import fitz
import numpy as np
import pytesseract

from deep_translator import GoogleTranslator
from PIL import Image


TESSERACT_PATH = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
pytesseract.pytesseract.tesseract_cmd = TESSERACT_PATH


SUPPORTED_LANGUAGES = {
    "en": "English",
    "te": "Telugu",
    "hi": "Hindi",
    "kn": "Kannada",
    "ta": "Tamil",
}


# =========================================================
# TEXT EXTRACTION
# =========================================================

def extract_report_text(uploaded_file):
    """
    Extract text from:
      PDF with selectable text
      PDF scanned pages
      JPG / JPEG / PNG
    """

    content_type = (
        getattr(uploaded_file, "content_type", "") or ""
    ).lower()

    filename = (
        getattr(uploaded_file, "name", "") or ""
    ).lower()

    file_bytes = uploaded_file.read()

    is_pdf = (
        content_type == "application/pdf"
        or filename.endswith(".pdf")
    )

    if is_pdf:

        document = fitz.open(
            stream=file_bytes,
            filetype="pdf"
        )

        text_parts = []

        # First try selectable text.
        for page in document:
            page_text = page.get_text("text")

            if page_text and page_text.strip():
                text_parts.append(page_text)

        extracted_text = "\n".join(text_parts).strip()

        # If selectable text is absent, OCR every page.
        if not extracted_text:

            ocr_parts = []

            for page in document:

                pix = page.get_pixmap(
                    matrix=fitz.Matrix(2.5, 2.5)
                )

                image = Image.open(
                    io.BytesIO(
                        pix.tobytes("png")
                    )
                ).convert("RGB")

                image = image.convert("L")

                image = np.array(image)

                image = cv2.normalize(
                    image,
                    None,
                    0,
                    255,
                    cv2.NORM_MINMAX
                )

                image = cv2.resize(
                    image,
                    None,
                    fx=1.5,
                    fy=1.5,
                    interpolation=cv2.INTER_CUBIC
                )

                page_text = pytesseract.image_to_string(
                    image,
                    config="--oem 3 --psm 6"
                )

                if page_text.strip():
                    ocr_parts.append(page_text)

            extracted_text = "\n".join(ocr_parts).strip()

        document.close()

        return extracted_text

    # -----------------------------------------------------
    # IMAGE
    # -----------------------------------------------------

    image_array = np.frombuffer(
        file_bytes,
        dtype=np.uint8
    )

    image = cv2.imdecode(
        image_array,
        cv2.IMREAD_COLOR
    )

    if image is None:
        raise ValueError(
            "Unable to read the uploaded image."
        )

    gray = cv2.cvtColor(
        image,
        cv2.COLOR_BGR2GRAY
    )

    # Improve OCR quality.
    gray = cv2.resize(
        gray,
        None,
        fx=2.5,
        fy=2.5,
        interpolation=cv2.INTER_CUBIC
    )

    gray = cv2.normalize(
        gray,
        None,
        0,
        255,
        cv2.NORM_MINMAX
    )

    gray = cv2.GaussianBlur(
        gray,
        (3, 3),
        0
    )

    text = pytesseract.image_to_string(
        gray,
        config="--oem 3 --psm 6"
    )

    return text.strip()


# =========================================================
# REPORT TYPE DETECTION
# =========================================================

REPORT_TYPES = {

    "Complete Blood Count / Blood Report": [
        "complete blood count",
        "cbc",
        "hemoglobin",
        "haemoglobin",
        "wbc",
        "rbc",
        "platelet",
        "hematocrit",
        "haematocrit",
    ],

    "Lipid Profile": [
        "lipid profile",
        "total cholesterol",
        "triglycerides",
        "hdl cholesterol",
        "ldl cholesterol",
        "vldl",
    ],

    "Liver Function Test": [
        "liver function",
        "lft",
        "bilirubin",
        "sgot",
        "sgpt",
        "ast",
        "alt",
        "alkaline phosphatase",
        "albumin",
    ],

    "Kidney Function Test": [
        "kidney function",
        "kft",
        "renal function",
        "creatinine",
        "blood urea",
        "urea",
        "egfr",
    ],

    "Thyroid Function Test": [
        "thyroid profile",
        "thyroid function",
        "tsh",
        "free t3",
        "free t4",
        "thyroxine",
        "triiodothyronine",
    ],

    "Diabetes / Glucose Report": [
        "hba1c",
        "blood sugar",
        "fasting blood sugar",
        "fasting glucose",
        "post prandial",
        "glucose tolerance",
    ],

    "Urine Examination": [
        "urine examination",
        "urine routine",
        "urinalysis",
        "pus cells",
        "epithelial cells",
        "urine protein",
        "urine glucose",
        "ketone bodies",
    ],

    "ECG Report": [
        "electrocardiogram",
        "ecg",
        "ekg",
        "qrs",
        "qt interval",
        "pr interval",
        "ventricular rate",
        "heart rate",
    ],

    "Radiology / Imaging Report": [
        "x-ray",
        "x ray",
        "radiograph",
        "ct scan",
        "computed tomography",
        "mri",
        "magnetic resonance",
        "ultrasound",
        "sonography",
        "impression",
        "findings",
    ],

    "Pathology / Biopsy Report": [
        "histopathology",
        "pathology",
        "biopsy",
        "specimen",
        "microscopic examination",
        "microscopy",
        "final diagnosis",
    ],

    "Discharge Summary": [
        "discharge summary",
        "date of admission",
        "date of discharge",
        "hospital course",
        "discharge medications",
        "condition at discharge",
    ],

    "Prescription": [
        "prescription",
        "rx",
        "tablet",
        "capsule",
        "dosage",
        "dose",
        "frequency",
        "duration",
    ],

    "Medical Consultation": [
        "consultation",
        "chief complaint",
        "history of present illness",
        "clinical examination",
        "assessment",
        "plan",
    ],
}


def detect_report_type(text):
    lower_text = text.lower()

    scores = {}

    for report_type, keywords in REPORT_TYPES.items():

        score = 0

        for keyword in keywords:
            if keyword in lower_text:
                score += 1

        scores[report_type] = score

    best_type = max(
        scores,
        key=scores.get
    )

    if scores[best_type] == 0:
        return "Other Medical Report"

    return best_type


# =========================================================
# NORMALIZE TEXT
# =========================================================

def clean_text(text):

    text = text.replace(
        "\x00",
        " "
    )

    text = re.sub(
        r"[ \t]+",
        " ",
        text
    )

    text = re.sub(
        r"\n{3,}",
        "\n\n",
        text
    )

    return text.strip()


# =========================================================
# SECTION EXTRACTION
# =========================================================

SECTION_HEADINGS = {
    "Findings",
    "Impression",
    "Conclusion",
    "Diagnosis",
    "Final Diagnosis",
    "Recommendations",
    "Recommendation",
    "Observations",
    "Clinical Findings",
    "Clinical Impression",
    "Assessment",
    "Plan",
    "History",
    "Clinical History",
    "Specimen",
    "Microscopic Examination",
    "Hospital Course",
    "Discharge Diagnosis",
    "Discharge Medications",
}


def extract_sections(text):

    lines = [
        line.strip()
        for line in text.splitlines()
        if line.strip()
    ]

    sections = {}

    current_heading = None
    current_lines = []

    def save_current():

        nonlocal current_heading, current_lines

        if current_heading and current_lines:

            content = " ".join(
                current_lines
            ).strip()

            if content:
                sections[current_heading] = content[:4000]

        current_heading = None
        current_lines = []

    for line in lines:

        matched_heading = None

        for heading in SECTION_HEADINGS:

            pattern = (
                r"^"
                + re.escape(heading)
                + r"\s*:?\s*(.*)$"
            )

            match = re.match(
                pattern,
                line,
                re.IGNORECASE
            )

            if match:
                matched_heading = heading

                save_current()

                remainder = match.group(1).strip()

                current_heading = heading

                if remainder:
                    current_lines.append(
                        remainder
                    )

                break

        if matched_heading:
            continue

        if current_heading:
            current_lines.append(line)

    save_current()

    return sections


# =========================================================
# LAB TEST HELPERS
# =========================================================

IGNORED_TEST_NAMES = {
    "patient",
    "name",
    "age",
    "gender",
    "sex",
    "date",
    "time",
    "doctor",
    "hospital",
    "laboratory",
    "lab",
    "report",
    "sample",
    "invoice",
    "bill",
    "receipt",
    "phone",
    "email",
}


def parse_reference_range(text):

    patterns = [

        r"(\d+(?:\.\d+)?)\s*[--]\s*(\d+(?:\.\d+)?)",

        r"(\d+(?:\.\d+)?)\s*to\s*(\d+(?:\.\d+)?)",

    ]

    for pattern in patterns:

        match = re.search(
            pattern,
            text,
            re.IGNORECASE
        )

        if match:

            return (
                float(match.group(1)),
                float(match.group(2))
            )

    return None, None


def find_numeric_value(text):

    # Avoid interpreting a range as the measured value.
    range_match = re.search(
        r"(\d+(?:\.\d+)?)\s*[--]\s*(\d+(?:\.\d+)?)",
        text
    )

    if range_match:

        before_range = text[:range_match.start()]

        numbers = re.findall(
            r"(?<![\d/])\d+(?:\.\d+)?",
            before_range
        )

        if numbers:
            return float(numbers[-1])


    numbers = re.findall(
        r"(?<![\d/])\d+(?:\.\d+)?",
        text
    )

    for number in numbers:

        value = float(number)

        # Ignore obvious years.
        if 1900 <= value <= 2100:
            continue

        return value

    return None


def extract_unit(text):

    unit_pattern = (
        r"\b("
        r"mg/dL|mg/L|g/dL|g/L|"
        r"mmol/L|µmol/L|umol/L|"
        r"U/L|IU/L|mIU/L|"
        r"ng/mL|pg/mL|"
        r"cells/µL|cells/uL|"
        r"fL|pg|%"
        r")\b"
    )

    match = re.search(
        unit_pattern,
        text,
        re.IGNORECASE
    )

    if match:
        return match.group(1)

    return ""


def determine_status(
    value,
    low,
    high
):

    if low is None or high is None:
        return "Not determined"

    if value < low:
        return "Low"

    if value > high:
        return "High"

    return "Normal"


def looks_like_lab_line(line):

    lower = line.lower()

    # Obvious metadata is not a lab result.
    if lower.strip().split(":")[0] in IGNORED_TEST_NAMES:
        return False

    if any(
        keyword in lower
        for keyword in [
            "patient id",
            "accession",
            "invoice",
            "phone",
            "address",
            "date of birth",
        ]
    ):
        return False

    # A unit or reference interval gives us stronger evidence.
    has_unit = bool(extract_unit(line))
    low, high = parse_reference_range(line)
    has_range = (
        low is not None and
        high is not None
    )

    return has_unit or has_range


def extract_lab_values(text):

    results = []
    seen = set()

    for line in text.splitlines():

        line = re.sub(
            r"\s+",
            " ",
            line
        ).strip()

        if not line:
            continue

        if not looks_like_lab_line(line):
            continue

        value = find_numeric_value(line)

        if value is None:
            continue

        # Find first numeric token.
        match = re.search(
            r"(?<![\d/])\d+(?:\.\d+)?",
            line
        )

        if not match:
            continue

        parameter = line[:match.start()].strip(
            " :-|."
        )

        parameter = re.sub(
            r"\s+",
            " ",
            parameter
        ).strip()

        if not parameter:
            continue

        if len(parameter) > 80:
            continue

        if parameter.lower() in IGNORED_TEST_NAMES:
            continue

        key = parameter.lower()

        if key in seen:
            continue

        low, high = parse_reference_range(
            line[match.end():]
        )

        unit = extract_unit(
            line[match.end():]
        )

        # Support qualitative results such as Positive/Negative
        # only when the line contains them.
        qualitative = re.search(
            r"\b("
            r"positive|negative|reactive|"
            r"non-reactive|detected|not detected|"
            r"present|absent"
            r")\b",
            line,
            re.IGNORECASE
        )

        status = determine_status(
            value,
            low,
            high
        )

        if qualitative and low is None:

            status = (
                qualitative.group(1)
                .strip()
                .title()
            )

        if low is not None and high is not None:

            reference_range = (
                f"{low:g} - {high:g}"
            )

        else:

            reference_range = (
                "Not available"
            )

        display_value = (
            int(value)
            if value.is_integer()
            else value
        )

        results.append({
            "parameter": parameter,
            "value": display_value,
            "unit": unit,
            "reference_range": reference_range,
            "status": status,
        })

        seen.add(key)

    return results


# =========================================================
# SIMPLE EXPLANATIONS
# =========================================================

TEST_EXPLANATIONS = {

    "hemoglobin":
        "Hemoglobin is part of red blood cells and helps carry oxygen around the body.",

    "rbc":
        "RBC means red blood cells. They carry oxygen to body tissues.",

    "wbc":
        "WBC means white blood cells. They are involved in the body's immune response.",

    "platelets":
        "Platelets help blood clot and help control bleeding.",

    "hematocrit":
        "Hematocrit shows the percentage of blood made up of red blood cells.",

    "mcv":
        "MCV describes the average size of red blood cells.",

    "mch":
        "MCH describes the average amount of hemoglobin in a red blood cell.",

    "mchc":
        "MCHC describes the concentration of hemoglobin inside red blood cells.",

    "creatinine":
        "Creatinine is a waste product commonly measured to help assess kidney function.",

    "blood urea":
        "Urea is a waste product commonly measured when evaluating kidney function.",

    "urea":
        "Urea is a waste product commonly measured when evaluating kidney function.",

    "glucose":
        "Glucose is a type of sugar in the blood that provides energy to the body.",

    "fasting blood sugar":
        "This measures blood glucose after fasting for the period specified by the test.",

    "hba1c":
        "HbA1c reflects average blood glucose levels over a period of roughly the previous two to three months.",

    "total cholesterol":
        "Total cholesterol measures the amount of cholesterol in the blood.",

    "hdl cholesterol":
        "HDL is a type of cholesterol involved in transporting cholesterol in the bloodstream.",

    "ldl cholesterol":
        "LDL is a type of cholesterol carried in the bloodstream.",

    "triglycerides":
        "Triglycerides are a type of fat found in the blood.",

    "bilirubin":
        "Bilirubin is a substance produced when red blood cells are broken down and is commonly measured in liver-related testing.",

    "sgot / ast":
        "AST is an enzyme measured in several types of tissue and is commonly included in liver-related testing.",

    "sgpt / alt":
        "ALT is an enzyme commonly included in liver-related testing.",

    "tsh":
        "TSH is a hormone used to help assess thyroid function.",

}


def explain_test(parameter):

    key = parameter.lower().strip()

    if key in TEST_EXPLANATIONS:
        return TEST_EXPLANATIONS[key]

    return (
        f"{parameter} is a medical test or measurement reported "
        "in the uploaded document. The value should be interpreted "
        "using the reference information provided by the report."
    )


# =========================================================
# REPORT SUMMARY
# =========================================================

def build_summary(
    report_type,
    values,
    sections
):

    if values:

        high = [
            item["parameter"]
            for item in values
            if item["status"] == "High"
        ]

        low = [
            item["parameter"]
            for item in values
            if item["status"] == "Low"
        ]

        if high or low:

            parts = [
                f"The report was identified as {report_type}.",
                f"{len(values)} measurable result(s) were extracted."
            ]

            if high:
                parts.append(
                    "The report's supplied reference ranges "
                    "show some results above their stated ranges: "
                    + ", ".join(high) + "."
                )

            if low:
                parts.append(
                    "The report's supplied reference ranges "
                    "show some results below their stated ranges: "
                    + ", ".join(low) + "."
                )

            parts.append(
                "These findings should be reviewed in the context "
                "of the person's history and by a qualified healthcare professional."
            )

            return " ".join(parts)

        return (
            f"The report was identified as {report_type}. "
            f"{len(values)} measurable result(s) were extracted. "
            "The displayed status is based only on reference information "
            "available in the uploaded report."
        )

    important_sections = []

    for heading in [
        "Diagnosis",
        "Final Diagnosis",
        "Impression",
        "Conclusion",
        "Findings",
        "Recommendations",
    ]:

        if heading in sections:
            important_sections.append(
                heading
            )

    if important_sections:

        return (
            f"The report was identified as {report_type}. "
            "Important sections such as "
            + ", ".join(important_sections)
            + " were found and extracted. "
              "The explanation below is a simplified presentation "
              "of the report text and does not create a new diagnosis."
        )

    return (
        f"The report was identified as {report_type}. "
        "Text was extracted from the uploaded document, "
        "but no structured laboratory values were reliably detected."
    )


# =========================================================
# EASY EXPLANATIONS FOR NARRATIVE REPORTS
# =========================================================

def build_easy_explanations(
    report_type,
    sections
):

    explanations = []

    for heading in [
        "Findings",
        "Impression",
        "Conclusion",
        "Diagnosis",
        "Final Diagnosis",
        "Recommendations",
        "Discharge Diagnosis",
        "Hospital Course",
        "Assessment",
        "Plan",
    ]:

        content = sections.get(heading)

        if not content:
            continue

        explanations.append({
            "title": heading,
            "text": content,
        })

    if not explanations:

        explanations.append({
            "title": "Extracted Information",
            "text": (
                "The report text was successfully extracted. "
                "Please refer to the original report for details."
            ),
        })

    return explanations


# =========================================================
# TRANSLATION
# =========================================================

def translate_text(
    text,
    language
):

    if not text:
        return text, "not_needed"

    language = (
        language or "en"
    ).lower()

    if language == "en":
        return text, "not_needed"

    if language not in SUPPORTED_LANGUAGES:
        language = "en"

    try:

        translated = GoogleTranslator(
            source="en",
            target=language
        ).translate(text)

        if translated:
            return translated, "translated"

    except Exception as exc:

        print(
            "Report translation failed:",
            exc
        )

    return text, "english_fallback"


def translate_result(
    result,
    language
):

    if language == "en":
        return result

    status = "translated"

    result["summary"], summary_status = translate_text(
        result["summary"],
        language
    )

    if summary_status == "english_fallback":
        status = "english_fallback"

    for item in result["easy_explanations"]:

        item["text"], item_status = translate_text(
            item["text"],
            language
        )

        if item_status == "english_fallback":
            status = "english_fallback"

    for item in result["values"]:

        item["easy_explanation"], item_status = (
            translate_text(
                item["easy_explanation"],
                language
            )
        )

        if item_status == "english_fallback":
            status = "english_fallback"

    result["translation_status"] = status

    return result


# =========================================================
# MAIN ANALYZER
# =========================================================

def analyze_medical_report(
    uploaded_file,
    language="en"
):

    extracted_text = extract_report_text(
        uploaded_file
    )

    extracted_text = clean_text(
        extracted_text
    )

    if not extracted_text:

        raise ValueError(
            "No readable text was found in the uploaded report."
        )

    report_type = detect_report_type(
        extracted_text
    )

    sections = extract_sections(
        extracted_text
    )

    lab_report_types = {
        "Complete Blood Count / Blood Report",
        "Lipid Profile",
        "Liver Function Test",
        "Kidney Function Test",
        "Thyroid Function Test",
        "Diabetes / Glucose Report",
        "Urine Examination",
    }

    if report_type in lab_report_types:

        values = extract_lab_values(
            extracted_text
        )

    else:

        values = []

    for item in values:

        item["easy_explanation"] = explain_test(
            item["parameter"]
        )

    summary = build_summary(
        report_type,
        values,
        sections
    )

    easy_explanations = build_easy_explanations(
        report_type,
        sections
    )

    result = {
        "success": True,
        "report_type": report_type,
        "language": language,
        "translation_status": "not_needed",
        "overall_status": (
            "Report information extracted"
        ),
        "summary": summary,
        "values": values,
        "easy_explanations": easy_explanations,
        "sections": sections,
        "extracted_text": extracted_text[:10000],
    }

    result = translate_result(
        result,
        language
    )

    return result
