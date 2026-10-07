from pathlib import Path
import pandas as pd


# =========================================================
# CONFIGURATION
# =========================================================

MIN_SYMPTOMS = 3

# This is an evidence-match threshold.
# It is NOT a medical probability.
MIN_MATCH_SCORE = 0.85


# =========================================================
# CANONICAL SYMPTOM NAMES
# =========================================================

CANONICAL_MAP = {
    "high_fever": "fever",
    "mild_fever": "fever",
    "dischromic _patches": "dischromic_patches",
    "foul_smell_of urine": "foul_smell_of_urine",
    "spotting_ urination": "spotting_urination",
}


def clean_symptom(value):
    value = str(value).strip().lower()
    return CANONICAL_MAP.get(value, value)


# =========================================================
# LOAD DATASET PROFILES
# =========================================================

DATASET_PATH = (
    Path(__file__).resolve().parent.parent / "dataset.csv"
)


def load_profiles():

    if not DATASET_PATH.exists():
        raise FileNotFoundError(
            f"Dataset not found: {DATASET_PATH}"
        )

    df = pd.read_csv(DATASET_PATH)

    symptom_columns = df.columns[1:]

    profile_to_disease = {}

    for _, row in df[symptom_columns].iterrows():

        profile = tuple(
            sorted(
                set(
                    clean_symptom(value)
                    for value in row
                    if pd.notna(value)
                    and str(value).strip()
                )
            )
        )

        if not profile:
            continue

        disease = str(
            df.loc[row.name, "Disease"]
        ).strip()

        # Same complete profile should not belong
        # to two different diseases.
        if profile in profile_to_disease:

            previous = profile_to_disease[profile]

            if previous != disease:

                raise ValueError(
                    "Conflicting dataset profile found: "
                    f"{profile} -> "
                    f"{previous} / {disease}"
                )

        else:

            profile_to_disease[profile] = disease

    profiles = [
        {
            "disease": disease,
            "profile": set(profile),
        }
        for profile, disease
        in profile_to_disease.items()
    ]

    return profiles


PROFILES = load_profiles()


# =========================================================
# SIMILARITY FUNCTIONS
# =========================================================

def jaccard_similarity(user_symptoms, profile):

    user = set(user_symptoms)
    candidate = set(profile)

    union = user | candidate

    if not union:
        return 0.0

    return len(user & candidate) / len(union)


def containment_score(user_symptoms, profile):

    user = set(user_symptoms)
    candidate = set(profile)

    if not user:
        return 0.0

    return len(user & candidate) / len(user)


def combined_score(user_symptoms, profile):

    jaccard = jaccard_similarity(
        user_symptoms,
        profile
    )

    containment = containment_score(
        user_symptoms,
        profile
    )

    # -----------------------------------------------------
    # IMPORTANT
    # -----------------------------------------------------
    #
    # Real users normally report only SOME symptoms from
    # a training profile.
    #
    # Therefore, containment is more important than
    # complete-profile similarity.
    #
    # 75% -> how much of the user's reported symptoms
    #        are explained by the profile
    #
    # 25% -> overall overlap with the complete profile
    #
    # This prevents large training profiles from unfairly
    # penalizing users who do not have every symptom.
    # -----------------------------------------------------

    return (
        0.25 * jaccard +
        0.75 * containment
    )


# =========================================================
# MAIN MATCHING FUNCTION
# =========================================================

def find_best_profile_match(present_symptoms):

    # -----------------------------------------------------
    # Clean and remove duplicates
    # -----------------------------------------------------

    cleaned = sorted(
        set(
            clean_symptom(symptom)
            for symptom in present_symptoms
            if str(symptom).strip()
        )
    )

    # -----------------------------------------------------
    # Minimum information check
    # -----------------------------------------------------

    if len(cleaned) < MIN_SYMPTOMS:

        return {
            "status": "insufficient_evidence",

            "reason": (
                f"At least {MIN_SYMPTOMS} "
                "recognized symptoms are required "
                "for a supported profile match."
            ),

            "symptoms": cleaned,

            "disease": None,

            "match_score": 0.0,

            "jaccard_score": 0.0,

            "containment_score": 0.0,
        }


    # -----------------------------------------------------
    # Compare user symptoms with every dataset profile
    # -----------------------------------------------------

    candidates = []

    user_set = set(cleaned)

    for item in PROFILES:

        profile = item["profile"]

        score = combined_score(
            user_set,
            profile
        )

        jaccard = jaccard_similarity(
            user_set,
            profile
        )

        containment = containment_score(
            user_set,
            profile
        )

        matched_symptoms = sorted(
            user_set & profile
        )

        candidates.append({

            "disease": item["disease"],

            "profile": sorted(profile),

            "score": score,

            "jaccard": jaccard,

            "containment": containment,

            "matched_symptoms": matched_symptoms,

            "matched_count": len(
                matched_symptoms
            ),
        })


    # -----------------------------------------------------
    # Sort candidates
    # -----------------------------------------------------

    candidates.sort(
        key=lambda item: (
            item["score"],
            item["containment"],
            item["jaccard"],
            item["matched_count"],
        ),
        reverse=True,
    )


    best = candidates[0]

    best_score = best["score"]


    # -----------------------------------------------------
    # Check for genuinely equal strongest matches
    # -----------------------------------------------------

    tied_diseases = sorted(
        set(
            item["disease"]
            for item in candidates
            if abs(
                item["score"] - best_score
            ) < 1e-12
        )
    )


    if len(tied_diseases) > 1:

        return {

            "status": "insufficient_evidence",

            "reason": (
                "The reported symptoms match "
                "multiple training profiles equally well."
            ),

            "symptoms": cleaned,

            "disease": None,

            "match_score": round(
                best_score,
                4
            ),

            "jaccard_score": round(
                best["jaccard"],
                4
            ),

            "containment_score": round(
                best["containment"],
                4
            ),

            "ambiguous_conditions":
                tied_diseases,
        }


    # -----------------------------------------------------
    # Evidence threshold
    # -----------------------------------------------------

    if best_score < MIN_MATCH_SCORE:

        return {

            "status": "insufficient_evidence",

            "reason": (
                "The reported symptoms do not provide "
                "enough evidence for a supported "
                "symptom-profile match."
            ),

            "symptoms": cleaned,

            "disease": None,

            "match_score": round(
                best_score,
                4
            ),

            "jaccard_score": round(
                best["jaccard"],
                4
            ),

            "containment_score": round(
                best["containment"],
                4
            ),

            # Keep this internally available for debugging,
            # but the frontend does not need to display it.
            "best_candidate": best["disease"],

            "matched_symptoms":
                best["matched_symptoms"],
        }


    # -----------------------------------------------------
    # SUPPORTED MATCH
    # -----------------------------------------------------

    return {

        "status": "match",

        "reason": (
            "Strong symptom-profile match."
        ),

        "symptoms": cleaned,

        "disease": best["disease"],

        "match_score": round(
            best_score,
            4
        ),

        "jaccard_score": round(
            best["jaccard"],
            4
        ),

        "containment_score": round(
            best["containment"],
            4
        ),

        "matched_profile":
            best["profile"],

        "matched_symptoms":
            best["matched_symptoms"],
    }
