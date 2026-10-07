import re


SYMPTOM_MAP = {

    # =========================
    # FEVER / GENERAL
    # =========================
    "fever": "fever",
    "high fever": "high_fever",
    "high temperature": "high_fever",
    "very high temperature": "high_fever",
    "temperature": "fever",
    "body temperature": "fever",
    "mild fever": "mild_fever",
    "slight fever": "mild_fever",
    "feeling feverish": "fever",
    "feverish": "fever",
    "chills": "chills",
    "shivering": "shivering",
    "feeling cold": "cold_hands_and_feets",
    "cold hands": "cold_hands_and_feets",
    "cold feet": "cold_hands_and_feets",

    # =========================
    # HEAD / NEUROLOGICAL
    # =========================
    "headache": "headache",
    "head pain": "headache",
    "pain in head": "headache",
    "my head hurts": "headache",
    "head is hurting": "headache",
    "migraine": "headache",

    "dizziness": "dizziness",
    "dizzy": "dizziness",
    "feeling dizzy": "dizziness",
    "lightheaded": "dizziness",

    "spinning sensation": "spinning_movements",
    "spinning movements": "spinning_movements",
    "room is spinning": "spinning_movements",
    "everything is spinning": "spinning_movements",

    "loss of balance": "loss_of_balance",
    "balance problem": "loss_of_balance",
    "difficulty balancing": "loss_of_balance",
    "unsteady": "unsteadiness",
    "unsteadiness": "unsteadiness",

    "blurred vision": "blurred_and_distorted_vision",
    "blurry vision": "blurred_and_distorted_vision",
    "distorted vision": "blurred_and_distorted_vision",

    "visual disturbance": "visual_disturbances",
    "vision problems": "visual_disturbances",

    "slurred speech": "slurred_speech",

    "weakness in limbs": "weakness_in_limbs",
    "weakness in my limbs": "weakness_in_limbs",
    "weak arms": "weakness_in_limbs",
    "weak legs": "weakness_in_limbs",

    "weakness on one side": "weakness_of_one_body_side",
    "one side of body is weak": "weakness_of_one_body_side",

    # =========================
    # COUGH / COLD / THROAT
    # =========================
    "cough": "cough",
    "coughing": "cough",
    "dry cough": "cough",
    "continuous cough": "cough",

    "cold": "cold",
    "common cold": "cold",

    "runny nose": "runny_nose",
    "running nose": "runny_nose",
    "nose is running": "runny_nose",

    "sneezing": "continuous_sneezing",
    "continuous sneezing": "continuous_sneezing",
    "sneezing a lot": "continuous_sneezing",

    "sore throat": "throat_irritation",
    "throat pain": "throat_irritation",
    "pain in throat": "throat_irritation",
    "throat irritation": "throat_irritation",
    "irritated throat": "throat_irritation",

    "patches in throat": "patches_in_throat",

    "phlegm": "phlegm",
    "mucus": "mucoid_sputum",
    "mucus in chest": "mucoid_sputum",
    "mucus sputum": "mucoid_sputum",

    "blood in sputum": "blood_in_sputum",
    "coughing blood": "blood_in_sputum",
    "blood while coughing": "blood_in_sputum",

    "rusty sputum": "rusty_sputum",

    # =========================
    # VOMITING / STOMACH
    # =========================
    "vomiting": "vomiting",
    "vomit": "vomiting",
    "throwing up": "vomiting",
    "threw up": "vomiting",
    "feeling like vomiting": "nausea",

    "nausea": "nausea",
    "feeling nauseous": "nausea",
    "feeling sick": "nausea",

    "stomach pain": "stomach_pain",
    "pain in stomach": "stomach_pain",
    "stomach hurts": "stomach_pain",

    "abdominal pain": "abdominal_pain",
    "pain in abdomen": "abdominal_pain",
    "belly pain": "belly_pain",
    "pain in belly": "belly_pain",

    "acidity": "acidity",
    "acid reflux": "acidity",
    "heartburn": "acidity",

    "indigestion": "indigestion",
    "gas": "passage_of_gases",
    "passing gas": "passage_of_gases",

    "diarrhea": "diarrhoea",
    "diarrhoea": "diarrhoea",
    "loose motion": "diarrhoea",
    "loose motions": "diarrhoea",
    "loose stools": "diarrhoea",

    "constipation": "constipation",
    "difficulty passing stool": "constipation",
    "hard stools": "constipation",

    "bloody stool": "bloody_stool",
    "blood in stool": "bloody_stool",

    "stomach bleeding": "stomach_bleeding",

    "swollen stomach": "swelling_of_stomach",
    "stomach swelling": "swelling_of_stomach",
    "distended abdomen": "distention_of_abdomen",
    "bloated stomach": "distention_of_abdomen",

    # =========================
    # URINARY
    # =========================
    "burning while urinating": "burning_micturition",
    "burning while passing urine": "burning_micturition",
    "burning urination": "burning_micturition",
    "pain while urinating": "burning_micturition",
    "painful urination": "burning_micturition",

    "bladder discomfort": "bladder_discomfort",
    "bladder pain": "bladder_discomfort",

    "frequent urination": "continuous_feel_of_urine",
    "feeling like urinating continuously": "continuous_feel_of_urine",

    "blood in urine": "spotting_ urination",

    "foul smelling urine": "foul_smell_of urine",
    "bad smell in urine": "foul_smell_of urine",

    # =========================
    # BREATHING / HEART
    # =========================
    "breathlessness": "breathlessness",
    "shortness of breath": "breathlessness",
    "difficulty breathing": "breathlessness",
    "difficulty in breathing": "breathlessness",
    "cannot breathe properly": "breathlessness",
    "can't breathe properly": "breathlessness",

    "chest pain": "chest_pain",
    "pain in chest": "chest_pain",
    "chest hurts": "chest_pain",

    "fast heart rate": "fast_heart_rate",
    "heart beating fast": "fast_heart_rate",
    "heart beats very fast": "fast_heart_rate",
    "rapid heartbeat": "fast_heart_rate",

    "palpitations": "palpitations",
    "heart palpitations": "palpitations",

    # =========================
    # PAIN / MUSCLES / JOINTS
    # =========================
    "back pain": "back_pain",
    "pain in back": "back_pain",

    "joint pain": "joint_pain",
    "pain in joints": "joint_pain",

    "knee pain": "knee_pain",
    "pain in knee": "knee_pain",

    "hip pain": "hip_joint_pain",
    "pain in hip": "hip_joint_pain",

    "neck pain": "neck_pain",
    "pain in neck": "neck_pain",

    "muscle pain": "muscle_pain",
    "body pain": "muscle_pain",
    "body aches": "muscle_pain",
    "body ache": "muscle_pain",

    "muscle weakness": "muscle_weakness",
    "weak muscles": "muscle_weakness",

    "stiff neck": "stiff_neck",
    "neck stiffness": "stiff_neck",

    "joint swelling": "swelling_joints",
    "swollen joints": "swelling_joints",

    "painful walking": "painful_walking",
    "pain while walking": "painful_walking",

    # =========================
    # FATIGUE / GENERAL
    # =========================
    "fatigue": "fatigue",
    "tired": "fatigue",
    "very tired": "fatigue",
    "feeling tired": "fatigue",
    "exhausted": "fatigue",
    "no energy": "fatigue",

    "weakness": "fatigue",
    "feeling weak": "fatigue",
    "very weak": "fatigue",

    "lethargy": "lethargy",
    "feeling lethargic": "lethargy",

    "loss of appetite": "loss_of_appetite",
    "no appetite": "loss_of_appetite",
    "not feeling hungry": "loss_of_appetite",

    "increased appetite": "increased_appetite",
    "very hungry": "excessive_hunger",
    "excessive hunger": "excessive_hunger",

    "weight loss": "weight_loss",
    "losing weight": "weight_loss",

    "weight gain": "weight_gain",
    "gaining weight": "weight_gain",

    "dehydration": "dehydration",
    "dehydrated": "dehydration",

    "sweating": "sweating",
    "excessive sweating": "sweating",

    # =========================
    # SKIN
    # =========================
    "itching": "itching",
    "itchy": "itching",
    "skin itching": "itching",

    "skin rash": "skin_rash",
    "rash": "skin_rash",
    "skin rashes": "skin_rash",

    "blisters": "blister",
    "blister": "blister",

    "red spots": "red_spots_over_body",
    "red spots on body": "red_spots_over_body",

    "redness of eyes": "redness_of_eyes",
    "red eyes": "redness_of_eyes",
    "eyes are red": "redness_of_eyes",

    "watering eyes": "watering_from_eyes",
    "watery eyes": "watering_from_eyes",
    "eyes watering": "watering_from_eyes",

    "blackheads": "blackheads",
    "pimples": "pus_filled_pimples",
    "pus filled pimples": "pus_filled_pimples",

    "skin peeling": "skin_peeling",
    "peeling skin": "skin_peeling",

    "silver like dusting": "silver_like_dusting",

    # =========================
    # OTHER
    # =========================
    "anxiety": "anxiety",
    "feeling anxious": "anxiety",

    "depression": "depression",
    "feeling depressed": "depression",

    "irritability": "irritability",
    "irritable": "irritability",

    "mood swings": "mood_swings",

    "lack of concentration": "lack_of_concentration",
    "difficulty concentrating": "lack_of_concentration",

    "restlessness": "restlessness",
    "restless": "restlessness",

    "swollen legs": "swollen_legs",
    "swelling in legs": "swollen_legs",

    "swollen feet": "swollen_extremities",
    "swollen hands": "swollen_extremities",
    "swollen extremities": "swollen_extremities",

    "yellow skin": "yellowish_skin",
    "yellowish skin": "yellowish_skin",
    "yellowing of skin": "yellowish_skin",

    "yellow eyes": "yellowing_of_eyes",
    "yellow eyes": "yellowing_of_eyes",
    "eyes are yellow": "yellowing_of_eyes",

    "dark urine": "dark_urine",
    "yellow urine": "yellow_urine",
}


def normalize_symptoms(text):
    if not text:
        return []

    text = text.lower().strip()

    found = []

    # Check longer phrases first.
    # This prevents a shorter phrase from interfering
    # with a more specific symptom phrase.
    phrases = sorted(
        SYMPTOM_MAP.items(),
        key=lambda item: len(item[0]),
        reverse=True
    )

    for phrase, symptom in phrases:

        pattern = r"(?<!\w)" + re.escape(phrase) + r"(?!\w)"

        if re.search(pattern, text):

            if symptom not in found:
                found.append(symptom)

    return found