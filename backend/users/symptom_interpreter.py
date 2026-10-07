import re

from .symptom_normalizer import SYMPTOM_MAP


# =========================================================
# Additional model-feature mappings
# =========================================================

EXTRA_SYMPTOM_MAP = {

    # Canonical fever feature used by the retrained model.
    # Generic, mild, and high fever are represented by one
    # shared feature: "fever".
    "fever": "fever",
    "high fever": "fever",
    "mild fever": "fever",
    "high_fever": "fever",
    "mild_fever": "fever",


    "abnormal menstruation": "abnormal_menstruation",
    "irregular menstruation": "abnormal_menstruation",
    "period problems": "abnormal_menstruation",

    "acute liver failure": "acute_liver_failure",
    "liver failure": "acute_liver_failure",

    "altered sensorium": "altered_sensorium",
    "confusion": "altered_sensorium",
    "changed mental state": "altered_sensorium",

    "brittle nails": "brittle_nails",
    "weak nails": "brittle_nails",

    "bruising": "bruising",
    "easy bruising": "bruising",

    "coma": "coma",

    "congestion": "congestion",
    "nasal congestion": "congestion",
    "blocked nose": "congestion",

    "cramps": "cramps",
    "muscle cramps": "cramps",
    "stomach cramps": "cramps",

    # Canonical spelling used by the retrained model.
    "dischromic patches": "dischromic_patches",
    "discolored patches": "dischromic_patches",
    "dark patches on skin": "dischromic_patches",

    "drying and tingling lips": "drying_and_tingling_lips",
    "dry and tingling lips": "drying_and_tingling_lips",
    "tingling lips": "drying_and_tingling_lips",

    "enlarged thyroid": "enlarged_thyroid",
    "swollen thyroid": "enlarged_thyroid",
    "thyroid swelling": "enlarged_thyroid",

    "extra marital contacts": "extra_marital_contacts",
    "extra-marital contacts": "extra_marital_contacts",

    "family history": "family_history",
    "family medical history": "family_history",

    "fluid overload": "fluid_overload",
    "too much fluid in body": "fluid_overload",

    "history of alcohol consumption": "history_of_alcohol_consumption",
    "history of alcohol use": "history_of_alcohol_consumption",
    "regular alcohol consumption": "history_of_alcohol_consumption",

    "inflammatory nails": "inflammatory_nails",
    "inflamed nails": "inflammatory_nails",

    "internal itching": "internal_itching",
    "itching inside": "internal_itching",

    "irregular sugar level": "irregular_sugar_level",
    "abnormal sugar level": "irregular_sugar_level",
    "blood sugar is irregular": "irregular_sugar_level",

    "irritation in anus": "irritation_in_anus",
    "anal irritation": "irritation_in_anus",

    "loss of smell": "loss_of_smell",
    "cannot smell": "loss_of_smell",
    "can't smell": "loss_of_smell",

    "malaise": "malaise",
    "feeling unwell": "malaise",
    "general discomfort": "malaise",

    "movement stiffness": "movement_stiffness",
    "stiff movements": "movement_stiffness",
    "difficulty moving": "movement_stiffness",

    "muscle wasting": "muscle_wasting",
    "muscles getting smaller": "muscle_wasting",
    "loss of muscle": "muscle_wasting",

    "nodal skin eruptions": "nodal_skin_eruptions",
    "skin nodules": "nodal_skin_eruptions",
    "nodules on skin": "nodal_skin_eruptions",

    "obesity": "obesity",
    "obese": "obesity",

    "pain behind the eyes": "pain_behind_the_eyes",
    "pain behind my eyes": "pain_behind_the_eyes",
    "eyes hurt behind": "pain_behind_the_eyes",

    "pain during bowel movements": "pain_during_bowel_movements",
    "pain while passing stool": "pain_during_bowel_movements",
    "pain when passing stool": "pain_during_bowel_movements",

    "pain in anal region": "pain_in_anal_region",
    "anal pain": "pain_in_anal_region",
    "pain around anus": "pain_in_anal_region",

    # Important: use the NEW model feature name.
    # This intentionally overrides the old normalizer's
    # "frequent urination" mapping.
    "frequent urination": "polyuria",
    "urinating frequently": "polyuria",
    "passing urine frequently": "polyuria",

    "prominent veins on calf": "prominent_veins_on_calf",
    "visible veins on calf": "prominent_veins_on_calf",
    "bulging veins on calf": "prominent_veins_on_calf",

    "puffy face and eyes": "puffy_face_and_eyes",
    "puffy face": "puffy_face_and_eyes",
    "puffy eyes": "puffy_face_and_eyes",

    "receiving blood transfusion": "receiving_blood_transfusion",
    "blood transfusion": "receiving_blood_transfusion",

    "receiving unsterile injections": "receiving_unsterile_injections",
    "unsterile injections": "receiving_unsterile_injections",

    "red sore around nose": "red_sore_around_nose",
    "red sore near nose": "red_sore_around_nose",

    "scurring": "scurring",

    "sinus pressure": "sinus_pressure",
    "pressure around sinuses": "sinus_pressure",

    "small dents in nails": "small_dents_in_nails",
    "small dents in my nails": "small_dents_in_nails",
    "tiny dents in nails": "small_dents_in_nails",
    "nail dents": "small_dents_in_nails",
    "my nails have small dents": "small_dents_in_nails",

    "sunken eyes": "sunken_eyes",
    "sunken eye": "sunken_eyes",

    "swollen lymph nodes": "swelled_lymph_nodes",
    "swollen glands": "swelled_lymph_nodes",
    "enlarged lymph nodes": "swelled_lymph_nodes",
    "lymph nodes are swollen": "swelled_lymph_nodes",
    "my lymph nodes are swollen": "swelled_lymph_nodes",

    "swollen blood vessels": "swollen_blood_vessels",
    "enlarged blood vessels": "swollen_blood_vessels",

    "swelling of extremities": "swollen_extremities",
    "swollen extremities": "swollen_extremities",
    "swelling in hands and feet": "swollen_extremities",
    "swollen hands and feet": "swollen_extremities",
    "swollen arms and legs": "swollen_extremities",

    "toxic look": "toxic_look_(typhos)",
    "looks very ill": "toxic_look_(typhos)",

    "ulcers on tongue": "ulcers_on_tongue",
    "ulcers on my tongue": "ulcers_on_tongue",
    "tongue ulcers": "ulcers_on_tongue",
    "sores on tongue": "ulcers_on_tongue",
    "sores on my tongue": "ulcers_on_tongue",

    "yellow crust and ooze": "yellow_crust_ooze",
    "yellow crust": "yellow_crust_ooze",
    "yellow ooze": "yellow_crust_ooze",
}


# =========================================================
# Important phrases that contain "no"/"not"
# but actually describe a positive symptom.
# =========================================================

POSITIVE_SYMPTOM_PHRASES = {
    "no energy",
    "no appetite",
    "not feeling hungry",
}


# =========================================================
# Negation phrases
# =========================================================

NEGATION_PHRASES = [
    "do not have",
    "don't have",
    "does not have",
    "doesn't have",
    "did not have",
    "didn't have",
    "do not feel",
    "don't feel",
    "does not feel",
    "doesn't feel",
    "not experiencing",
    "not having",
    "without",
    "no",
    "never had",
    "never experienced",
]


# =========================================================
# Split natural language into clauses
# =========================================================

def split_into_clauses(text):
    """
    Example:

    I don't have fever but I have stomach pain

    becomes:

    I don't have fever
    I have stomach pain
    """

    pattern = r"\s+(?:but|however|although|except|yet)\s+"

    return [
        clause.strip()
        for clause in re.split(pattern, text)
        if clause.strip()
    ]


# =========================================================
# Check whether a symptom is negated
# =========================================================

def is_negated_inside_clause(clause, symptom_start):

    before = clause[:symptom_start].strip()

    matched_text = clause[symptom_start:].lower()

    # "no energy", "no appetite", etc. are positive symptoms.
    for phrase in POSITIVE_SYMPTOM_PHRASES:
        if matched_text.startswith(phrase):
            return False

    recent_context = before[-35:]

    for phrase in NEGATION_PHRASES:

        pattern = r"\b" + re.escape(phrase) + r"\b"

        matches = list(re.finditer(pattern, recent_context))

        if not matches:
            continue

        match = matches[-1]

        text_after_negation = recent_context[match.end():].strip()

        # A positive statement after the negation means the
        # symptom currently being examined is not negated.
        if re.search(
            r"\b(?:have|feel|am having|experiencing)\b",
            text_after_negation
        ):
            continue

        return True

    return False


# =========================================================
# Main interpreter
# =========================================================

def interpret_symptoms(text, model_symptom_list=None):

    if not text:
        return {
            "present": [],
            "absent": [],
            "unknown": []
        }

    text = text.lower().strip()

    # ---------------------------------------------------------
    # Combine existing mappings with the additional mappings.
    # Extra mappings come last so they can override conflicting
    # mappings when required by the new model.
    # ---------------------------------------------------------

    combined_map = {
        **SYMPTOM_MAP,
        **EXTRA_SYMPTOM_MAP,
    }

    # ---------------------------------------------------------
    # Also accept canonical model tokens.
    #
    # Example:
    # stomach_pain
    # headache
    # pain_behind_the_eyes
    # ---------------------------------------------------------

    if model_symptom_list is not None:

        for model_symptom in model_symptom_list:

            canonical = str(model_symptom).strip().lower()

            if not canonical:
                continue

            # Exact canonical form
            combined_map.setdefault(
                canonical,
                canonical
            )

            # Human-readable form
            readable = canonical.replace("_", " ")

            readable = re.sub(
                r"\s+",
                " ",
                readable
            ).strip()

            combined_map.setdefault(
                readable,
                canonical
            )

    # ---------------------------------------------------------
    # Longer phrases first
    # ---------------------------------------------------------

    phrases = sorted(
        combined_map.items(),
        key=lambda item: len(item[0]),
        reverse=True
    )

    present = []
    absent = []

    # ---------------------------------------------------------
    # Split into clauses
    # ---------------------------------------------------------

    clauses = split_into_clauses(text)

    # ---------------------------------------------------------
    # Detect symptoms
    # ---------------------------------------------------------

    for clause in clauses:

        for phrase, symptom in phrases:

            pattern = (
                r"(?<!\w)"
                + re.escape(phrase)
                + r"(?!\w)"
            )

            for match in re.finditer(pattern, clause):

                if is_negated_inside_clause(
                    clause,
                    match.start()
                ):

                    if symptom not in absent:
                        absent.append(symptom)

                else:

                    if symptom not in present:
                        present.append(symptom)

    # ---------------------------------------------------------
    # Explicitly absent symptoms must never be present.
    # ---------------------------------------------------------

    present = [
        symptom
        for symptom in present
        if symptom not in absent
    ]

    # ---------------------------------------------------------
    # Calculate unknown symptoms from the model feature list.
    # ---------------------------------------------------------

    if model_symptom_list is not None:

        model_symptoms = set(model_symptom_list)

        unknown = sorted(
            model_symptoms
            - set(present)
            - set(absent)
        )

    else:

        unknown = []

    return {
        "present": sorted(present),
        "absent": sorted(absent),
        "unknown": unknown
    }