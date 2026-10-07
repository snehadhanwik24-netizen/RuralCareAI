import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { jsPDF } from "jspdf";
import axios from "axios";
import { API_URL } from "../config";
function Prediction() {
const navigate = useNavigate();
  const [symptoms, setSymptoms] = useState("");
    const [selectedLanguage, setSelectedLanguage] = useState("te");
    const [hospitals, setHospitals] = useState([]);
const [hospitalLoading, setHospitalLoading] = useState(false);
const [hospitalError, setHospitalError] = useState("");
  const [originalSpeech, setOriginalSpeech] = useState("");
const [detectedLanguage, setDetectedLanguage] = useState("");
  const [listening, setListening] = useState(false);
const [recording, setRecording] = useState(false);
  const [result, setResult] = useState(null);
  const [selectedAdditionalSymptoms, setSelectedAdditionalSymptoms] = useState([]);
const [additionalSymptomText, setAdditionalSymptomText] = useState("");
const recognitionRef = useRef(null);

    // Show only a small set of symptoms that are commonly related to the
    // symptoms the user has already entered. These are suggestions only;
    // the user must tick/type them only if they actually have them.
const symptomTranslations = {
    "abdominal_pain": { en: "abdominal pain", te: "కడుపు నొప్పి", hi: "पेट दर्द", kn: "ಹೊಟ್ಟೆ ನೋವು", ta: "வயிற்று வலி" },
    "abnormal_menstruation": { en: "abnormal menstruation", te: "అసాధారణ రుతుస్రావం", hi: "असामान्य मासिक धर्म", kn: "ಅಸಾಮಾನ್ಯ ಮಾಸಿಕ ಧರ್ಮ", ta: "அசாதாரண மாதவிடாய்" },
    "acidity": { en: "acidity", te: "ఆమ్లత్వం", hi: "अम्लता", kn: "ಆಮ್ಲತೆ", ta: "அமிலத்தன்மை" },
    "acute_liver_failure": { en: "acute liver failure", te: "తీవ్రమైన కాలేయ వైఫల్యం", hi: "तीव्र यकृत विफलता", kn: "ತೀವ್ರ ಯಕೃತ್ ವೈಫಲ್ಯ", ta: "தீவிர கல்லீரல் செயலிழப்பு" },
    "altered_sensorium": { en: "altered consciousness", te: "స్పృహలో మార్పు", hi: "चेतना में बदलाव", kn: "ಪ್ರಜ್ಞೆಯಲ್ಲಿ ಬದಲಾವಣೆ", ta: "உணர்வு நிலையில் மாற்றம்" },
    "anxiety": { en: "anxiety", te: "ఆందోళన", hi: "चिंता", kn: "ಆತಂಕ", ta: "பதட்டம்" },
    "back_pain": { en: "back pain", te: "వెన్ను నొప్పి", hi: "पीठ दर्द", kn: "ಬೆನ್ನು ನೋವು", ta: "முதுகுவலி" },
    "belly_pain": { en: "belly pain", te: "కడుపు నొప్పి", hi: "पेट दर्द", kn: "ಹೊಟ್ಟೆ ನೋವು", ta: "வயிற்று வலி" },
    "blackheads": { en: "blackheads", te: "బ్లాక్‌హెడ్స్", hi: "ब्लैकहेड्स", kn: "ಬ್ಲ್ಯಾಕ್‌ಹೆಡ್ಸ್", ta: "கரும்புள்ளிகள்" },
    "bladder_discomfort": { en: "bladder discomfort", te: "మూత్రాశయంలో అసౌకర్యం", hi: "मूत्राशय में असुविधा", kn: "ಮೂತ್ರಕೋಶದಲ್ಲಿ ಅಸ್ವಸ್ಥತೆ", ta: "சிறுநீர்ப்பையில் அசௌகரியம்" },
    "blister": { en: "blister", te: "పొక్కు", hi: "छाला", kn: "ಗುಳ್ಳೆ", ta: "கொப்புளம்" },
    "blood_in_sputum": { en: "blood in sputum", te: "కఫంలో రక్తం", hi: "बलगम में खून", kn: "ಕಫದಲ್ಲಿ ರಕ್ತ", ta: "சளியில் இரத்தம்" },
    "bloody_stool": { en: "bloody stool", te: "మలంలో రక్తం", hi: "मल में खून", kn: "ಮಲದಲ್ಲಿ ರಕ್ತ", ta: "மலத்தில் இரத்தம்" },
    "blurred_and_distorted_vision": { en: "blurred and distorted vision", te: "మసకగా మరియు వక్రీకరించిన చూపు", hi: "धुंधली और विकृत दृष्टि", kn: "ಮಸುಕಾದ ಮತ್ತು ವಿಕೃತ ದೃಷ್ಟಿ", ta: "மங்கலான மற்றும் சிதைந்த பார்வை" },
    "breathlessness": { en: "breathlessness", te: "శ్వాస తీసుకోవడంలో ఇబ్బంది", hi: "सांस लेने में कठिनाई", kn: "ಉಸಿರಾಟದ ತೊಂದರೆ", ta: "மூச்சுத்திணறல்" },
    "brittle_nails": { en: "brittle nails", te: "పెళుసైన గోర్లు", hi: "भंगुर नाखून", kn: "ಸುಲಭವಾಗಿ ಮುರಿಯುವ ಉಗುರುಗಳು", ta: "உடையக்கூடிய நகங்கள்" },
    "bruising": { en: "bruising", te: "గాయాల మచ్చలు", hi: "नील पड़ना", kn: "ಗಾಯದ ಕಲೆಗಳು", ta: "காயத் தடங்கள்" },
    "burning_micturition": { en: "burning urination", te: "మూత్ర విసర్జనలో మంట", hi: "पेशाब करते समय जलन", kn: "ಮೂತ್ರ ವಿಸರ್ಜನೆಯಾಗುವಾಗ ಉರಿ", ta: "சிறுநீர் கழிக்கும்போது எரிச்சல்" },
    "chest_pain": { en: "chest pain", te: "ఛాతీ నొప్పి", hi: "सीने में दर्द", kn: "ಎದೆ ನೋವು", ta: "மார்பு வலி" },
    "chills": { en: "chills", te: "చలి వణుకు", hi: "ठंड लगना", kn: "ಚಳಿ ನಡುಕ", ta: "குளிர் நடுக்கம்" },
    "cold_hands_and_feets": { en: "cold hands and feet", te: "చేతులు మరియు కాళ్లు చల్లగా ఉండటం", hi: "हाथ और पैर ठंडे होना", kn: "ಕೈ ಮತ್ತು ಕಾಲುಗಳು ತಣ್ಣಗಾಗುವುದು", ta: "கைகள் மற்றும் கால்கள் குளிர்ச்சியாக இருப்பது" },
    "coma": { en: "coma", te: "కోమా", hi: "कोमा", kn: "ಕೋಮಾ", ta: "கோமா" },
    "congestion": { en: "congestion", te: "ముక్కు దిబ్బడ", hi: "जमाव", kn: "ಮೂಗು ಕಟ್ಟಿಕೊಳ್ಳುವುದು", ta: "மூக்கடைப்பு" },
    "constipation": { en: "constipation", te: "మలబద్ధకం", hi: "कब्ज", kn: "ಮಲಬದ್ಧತೆ", ta: "மலச்சிக்கல்" },
    "continuous_feel_of_urine": { en: "continuous urge to urinate", te: "తరచుగా మూత్రం రావాలనిపించడం", hi: "बार-बार पेशाब की इच्छा", kn: "ನಿರಂತರ ಮೂತ್ರ ವಿಸರ್ಜನೆಯ ಭಾವನೆ", ta: "தொடர்ந்து சிறுநீர் கழிக்க வேண்டும் என்ற உணர்வு" },
    "continuous_sneezing": { en: "continuous sneezing", te: "తరచుగా తుమ్ములు రావడం", hi: "लगातार छींक आना", kn: "ನಿರಂತರ ಸೀನುವಿಕೆ", ta: "தொடர்ந்து தும்மல்" },
    "cough": { en: "cough", te: "దగ్గు", hi: "खांसी", kn: "ಕೆಮ್ಮು", ta: "இருமல்" },
    "cramps": { en: "cramps", te: "కండరాల పట్టివేత", hi: "ऐंठन", kn: "ಸ್ನಾಯು ಸೆಳೆತ", ta: "தசைப்பிடிப்பு" },
    "dark_urine": { en: "dark urine", te: "ముదురు రంగు మూత్రం", hi: "गहरे रंग का पेशाब", kn: "ಗಾಢ ಬಣ್ಣದ ಮೂತ್ರ", ta: "அடர் நிற சிறுநீர்" },
    "dehydration": { en: "dehydration", te: "శరీరంలో నీరు తగ్గడం", hi: "निर्जलीकरण", kn: "ದೇಹದಲ್ಲಿ ನೀರಿನ ಕೊರತೆ", ta: "நீரிழப்பு" },
    "depression": { en: "depression", te: "నిరాశ", hi: "अवसाद", kn: "ಖಿನ್ನತೆ", ta: "மனச்சோர்வு" },
    "diarrhoea": { en: "diarrhoea", te: "విరేచనాలు", hi: "दस्त", kn: "ಅತಿಸಾರ", ta: "வயிற்றுப்போக்கு" },
    "dischromic _patches": { en: "discolored patches", te: "చర్మంపై రంగు మారిన మచ్చలు", hi: "त्वचा पर रंग बदले हुए धब्बे", kn: "ಚರ್ಮದ ಬಣ್ಣ ಬದಲಾಗಿರುವ ಕಲೆಗಳು", ta: "தோலில் நிறம் மாறிய திட்டுகள்" },
    "distention_of_abdomen": { en: "abdominal distension", te: "కడుపు ఉబ్బరం", hi: "पेट फूलना", kn: "ಹೊಟ್ಟೆ ಉಬ್ಬರ", ta: "வயிற்று வீக்கம்" },
    "dizziness": { en: "dizziness", te: "తల తిరగడం", hi: "चक्कर आना", kn: "ತಲೆ ಸುತ್ತುವುದು", ta: "தலைச்சுற்றல்" },
    "drying_and_tingling_lips": { en: "dry and tingling lips", te: "పెదవులు పొడిబారడం మరియు చిమ్మటగా అనిపించడం", hi: "होंठ सूखना और झनझनाहट होना", kn: "ತುಟಿಗಳು ಒಣಗುವುದು ಮತ್ತು ಜುಮ್ಮೆನಿಸುವುದು", ta: "உதடுகள் உலர்ந்து கூச்சமடைவது" },
    "enlarged_thyroid": { en: "enlarged thyroid", te: "థైరాయిడ్ గ్రంథి పెరగడం", hi: "थायरॉइड बढ़ना", kn: "ಥೈರಾಯ್ಡ್ ಗ್ರಂಥಿ ದೊಡ್ಡದಾಗುವುದು", ta: "தைராய்டு சுரப்பி பெரிதாகுதல்" },
    "excessive_hunger": { en: "excessive hunger", te: "అధిక ఆకలి", hi: "अत्यधिक भूख", kn: "ಅತಿಯಾದ ಹಸಿವು", ta: "அதிகப்படியான பசி" },
    "extra_marital_contacts": { en: "extra-marital sexual contacts", te: "వివాహేతర లైంగిక సంబంధాలు", hi: "विवाहेतर यौन संबंध", kn: "ವಿವಾಹೇತರ ಲೈಂಗಿಕ ಸಂಪರ್ಕಗಳು", ta: "திருமணத்திற்கு வெளியான பாலியல் தொடர்புகள்" },
    "family_history": { en: "family history", te: "కుటుంబ వైద్య చరిత్ర", hi: "पारिवारिक चिकित्सा इतिहास", kn: "ಕುಟುಂಬದ ವೈದ್ಯಕೀಯ ಇತಿಹಾಸ", ta: "குடும்ப மருத்துவ வரலாறு" },
    "fast_heart_rate": { en: "fast heart rate", te: "వేగంగా గుండె కొట్టుకోవడం", hi: "तेज हृदय गति", kn: "ವೇಗವಾದ ಹೃದಯ ಬಡಿತ", ta: "வேகமான இதயத் துடிப்பு" },
    "fever": { en: "fever", te: "జ్వరం", hi: "बुखार", kn: "ಜ್ವರ", ta: "காய்ச்சல்" },
    "fatigue": { en: "fatigue", te: "అలసట", hi: "थकान", kn: "ಆಯಾಸ", ta: "சோர்வு" },
    "fluid_overload": { en: "fluid overload", te: "శరీరంలో అధిక ద్రవం చేరడం", hi: "शरीर में अतिरिक्त द्रव", kn: "ದೇಹದಲ್ಲಿ ಹೆಚ್ಚುವರಿ ದ್ರವ ಸಂಗ್ರಹ", ta: "உடலில் அதிகப்படியான திரவம்" },
    "foul_smell_of urine": { en: "foul-smelling urine", te: "దుర్వాసన వచ్చే మూత్రం", hi: "बदबूदार पेशाब", kn: "ದುರ್ವಾಸನೆಯ ಮೂತ್ರ", ta: "துர்நாற்றமுள்ள சிறுநீர்" },
    "headache": { en: "headache", te: "తలనొప్పి", hi: "सिरदर्द", kn: "ತಲೆನೋವು", ta: "தலைவலி" },
    "high_fever": { en: "high fever", te: "అధిక జ్వరం", hi: "तेज बुखार", kn: "ಹೆಚ್ಚಿನ ಜ್ವರ", ta: "அதிக காய்ச்சல்" },
    "hip_joint_pain": { en: "hip joint pain", te: "తుంటి కీళ్ల నొప్పి", hi: "कूल्हे के जोड़ में दर्द", kn: "ಸೊಂಟದ ಕೀಲು ನೋವು", ta: "இடுப்பு மூட்டு வலி" },
    "history_of_alcohol_consumption": { en: "history of alcohol consumption", te: "మద్యం సేవించిన చరిత్ర", hi: "शराब सेवन का इतिहास", kn: "ಮದ್ಯಪಾನ ಮಾಡಿದ ಇತಿಹಾಸ", ta: "மது அருந்திய வரலாறு" },
    "increased_appetite": { en: "increased appetite", te: "ఆకలి పెరగడం", hi: "भूख बढ़ना", kn: "ಹಸಿವು ಹೆಚ್ಚಾಗುವುದು", ta: "பசி அதிகரித்தல்" },
    "indigestion": { en: "indigestion", te: "అజీర్ణం", hi: "अपच", kn: "ಅಜೀರ್ಣ", ta: "அஜீரணம்" },
    "inflammatory_nails": { en: "inflamed nails", te: "గోళ్లలో వాపు", hi: "नाखूनों में सूजन", kn: "ಉಗುರುಗಳಲ್ಲಿ ಉರಿಯೂತ", ta: "நகங்களில் அழற்சி" },
    "internal_itching": { en: "internal itching", te: "లోపల దురద", hi: "अंदरूनी खुजली", kn: "ಒಳಭಾಗದಲ್ಲಿ ತುರಿಕೆ", ta: "உட்புற அரிப்பு" },
    "irregular_sugar_level": { en: "irregular blood sugar level", te: "రక్తంలో చక్కెర స్థాయి అసమానంగా ఉండటం", hi: "रक्त शर्करा का अनियमित स्तर", kn: "ರಕ್ತದಲ್ಲಿನ ಸಕ್ಕರೆ ಮಟ್ಟ ಅಸಮವಾಗಿರುವುದು", ta: "ஒழுங்கற்ற இரத்த சர்க்கரை அளவு" },
    "irritability": { en: "irritability", te: "చిరాకు", hi: "चिड़चिड़ापन", kn: "ಕಿರಿಕಿರಿ", ta: "எரிச்சல்" },
    "irritation_in_anus": { en: "irritation in anus", te: "మలద్వారంలో చికాకు", hi: "गुदा में जलन", kn: "ಗುದದ್ವಾರದಲ್ಲಿ ಕಿರಿಕಿರಿ", ta: "மலவாயில் எரிச்சல்" },
    "itching": { en: "itching", te: "దురద", hi: "खुजली", kn: "ತುರಿಕೆ", ta: "அரிப்பு" },
    "joint_pain": { en: "joint pain", te: "కీళ్ల నొప్పి", hi: "जोड़ों का दर्द", kn: "ಕೀಲು ನೋವು", ta: "மூட்டு வலி" },
    "knee_pain": { en: "knee pain", te: "మోకాలి నొప్పి", hi: "घुटने का दर्द", kn: "ಮೊಣಕಾಲು ನೋವು", ta: "முழங்கால் வலி" },
    "lack_of_concentration": { en: "lack of concentration", te: "ఏకాగ్రత లోపం", hi: "एकाग्रता की कमी", kn: "ಏಕಾಗ್ರತೆಯ ಕೊರತೆ", ta: "கவனம் செலுத்துவதில் குறைவு" },
    "lethargy": { en: "lethargy", te: "బద్ధకం", hi: "सुस्ती", kn: "ಆಲಸ್ಯ", ta: "சோம்பல்" },
    "loss_of_appetite": { en: "loss of appetite", te: "ఆకలి తగ్గడం", hi: "भूख न लगना", kn: "ಹಸಿವಿನ ಕೊರತೆ", ta: "பசியின்மை" },
    "loss_of_balance": { en: "loss of balance", te: "సంతులనం కోల్పోవడం", hi: "संतुलन खोना", kn: "ಸಮತೋಲನ ಕಳೆದುಕೊಳ್ಳುವುದು", ta: "சமநிலை இழப்பு" },
    "loss_of_smell": { en: "loss of smell", te: "వాసన కోల్పోవడం", hi: "गंध की कमी", kn: "ವಾಸನೆ ಕಳೆದುಕೊಳ್ಳುವುದು", ta: "வாசனை இழப்பு" },
    "malaise": { en: "malaise", te: "అస్వస్థత", hi: "अस्वस्थ महसूस होना", kn: "ಅಸ್ವಸ್ಥತೆ", ta: "உடல்நலக்குறைவு" },
    "mild_fever": { en: "mild fever", te: "స్వల్ప జ్వరం", hi: "हल्का बुखार", kn: "ಸೌಮ್ಯ ಜ್ವರ", ta: "லேசான காய்ச்சல்" },
    "mood_swings": { en: "mood swings", te: "మానసిక స్థితిలో మార్పులు", hi: "मूड में बदलाव", kn: "ಮನಸ್ಥಿತಿಯಲ್ಲಿ ಬದಲಾವಣೆ", ta: "மனநிலை மாற்றங்கள்" },
    "movement_stiffness": { en: "movement stiffness", te: "కదలికల్లో బిగుతు", hi: "चलने-फिरने में अकड़न", kn: "ಚಲನವಲನದಲ್ಲಿ ಬಿಗಿತ", ta: "இயக்கத்தில் விறைப்பு" },
    "mucoid_sputum": { en: "mucus-like sputum", te: "శ్లేష్మం కలిగిన కఫం", hi: "बलगम जैसा थूक", kn: "ಲೋಳೆಯಂತಹ ಕಫ", ta: "சளி போன்ற சளிக்கட்டி" },
    "muscle_pain": { en: "muscle pain", te: "కండరాల నొప్పి", hi: "मांसपेशियों में दर्द", kn: "ಸ್ನಾಯು ನೋವು", ta: "தசை வலி" },
    "muscle_wasting": { en: "muscle wasting", te: "కండరాలు క్షీణించడం", hi: "मांसपेशियों का क्षय", kn: "ಸ್ನಾಯು ಕ್ಷಯ", ta: "தசைச் சிதைவு" },
    "muscle_weakness": { en: "muscle weakness", te: "కండరాల బలహీనత", hi: "मांसपेशियों की कमजोरी", kn: "ಸ್ನಾಯು ದೌರ್ಬಲ್ಯ", ta: "தசை பலவீனம்" },
    "nausea": { en: "nausea", te: "వాంతి భావం", hi: "जी मिचलाना", kn: "ವಾಕರಿಕೆ", ta: "குமட்டல்" },
    "neck_pain": { en: "neck pain", te: "మెడ నొప్పి", hi: "गर्दन में दर्द", kn: "ಕುತ್ತಿಗೆ ನೋವು", ta: "கழுத்து வலி" },
    "nodal_skin_eruptions": { en: "nodal skin eruptions", te: "చర్మంపై చిన్న గడ్డల వంటి దద్దుర్లు", hi: "त्वचा पर गांठ जैसे चकत्ते", kn: "ಚರ್ಮದ ಮೇಲೆ ಗುಳ್ಳೆಗಳಂತಹ ದದ್ದುಗಳು", ta: "தோலில் முடிச்சுகள் போன்ற தடிப்புகள்" },
    "obesity": { en: "obesity", te: "స్థూలకాయం", hi: "मोटापा", kn: "ಸ್ಥೂಲಕಾಯ", ta: "உடல் பருமன்" },
    "pain_behind_the_eyes": { en: "pain behind the eyes", te: "కళ్ల వెనుక నొప్పి", hi: "आंखों के पीछे दर्द", kn: "ಕಣ್ಣುಗಳ ಹಿಂದೆ ನೋವು", ta: "கண்களுக்குப் பின்னால் வலி" },
    "pain_during_bowel_movements": { en: "pain during bowel movements", te: "మల విసర్జన సమయంలో నొప్పి", hi: "मल त्याग के समय दर्द", kn: "ಮಲ ವಿಸರ್ಜನೆಯಾಗುವಾಗ ನೋವು", ta: "மலம் கழிக்கும் போது வலி" },
    "pain_in_anal_region": { en: "pain in anal region", te: "మలద్వార ప్రాంతంలో నొప్పి", hi: "गुदा क्षेत्र में दर्द", kn: "ಗುದದ್ವಾರ ಪ್ರದೇಶದಲ್ಲಿ ನೋವು", ta: "மலவாய் பகுதியில் வலி" },
    "painful_walking": { en: "painful walking", te: "నడిచేటప్పుడు నొప్పి", hi: "चलने में दर्द", kn: "ನಡೆಯುವಾಗ ನೋವು", ta: "நடக்கும்போது வலி" },
    "palpitations": { en: "palpitations", te: "గుండె దడ", hi: "दिल की धड़कन तेज महसूस होना", kn: "ಹೃದಯ ಬಡಿತ ಜೋರಾಗಿ ಅನಿಸುವುದು", ta: "இதயத் துடிப்பு அதிகமாக உணரப்படுதல்" },
    "passage_of_gases": { en: "passage of gases", te: "గ్యాస్ బయటకు వెళ్లడం", hi: "गैस निकलना", kn: "ಗ್ಯಾಸ್ ಹೊರಹೋಗುವುದು", ta: "வாயு வெளியேறுதல்" },
    "patches_in_throat": { en: "patches in throat", te: "గొంతులో మచ్చలు", hi: "गले में धब्बे", kn: "ಗಂಟಲಿನಲ್ಲಿ ಕಲೆಗಳು", ta: "தொண்டையில் திட்டுகள்" },
    "phlegm": { en: "phlegm", te: "కఫం", hi: "बलगम", kn: "ಕಫ", ta: "சளி" },
    "polyuria": { en: "frequent urination", te: "తరచుగా మూత్ర విసర్జన", hi: "बार-बार पेशाब आना", kn: "ಆಗಾಗ್ಗೆ ಮೂತ್ರ ವಿಸರ್ಜನೆ", ta: "அடிக்கடி சிறுநீர் கழித்தல்" },
    "prominent_veins_on_calf": { en: "prominent calf veins", te: "కాలిలోని రక్తనాళాలు స్పష్టంగా కనిపించడం", hi: "पिंडली की नसें उभरी होना", kn: "ಕಾಲಿನ ಪಿಂಡಲಿಯ ರಕ್ತನಾಳಗಳು ಎದ್ದು ಕಾಣುವುದು", ta: "கால் தசைப்பகுதி நரம்புகள் புடைத்துக் காணப்படுதல்" },
    "puffy_face_and_eyes": { en: "puffy face and eyes", te: "ముఖం మరియు కళ్ల చుట్టూ వాపు", hi: "चेहरे और आंखों के आसपास सूजन", kn: "ಮುಖ ಮತ್ತು ಕಣ್ಣುಗಳ ಸುತ್ತ ಊತ", ta: "முகம் மற்றும் கண்களைச் சுற்றி வீக்கம்" },
    "pus_filled_pimples": { en: "pus-filled pimples", te: "చీముతో నిండిన మొటిమలు", hi: "मवाद भरे मुंहासे", kn: "ಕೀವು ತುಂಬಿದ ಮೊಡವೆಗಳು", ta: "சீழ் நிறைந்த பருக்கள்" },
    "receiving_blood_transfusion": { en: "receiving blood transfusion", te: "రక్త మార్పిడి చేయించుకోవడం", hi: "रक्त चढ़वाना", kn: "ರಕ್ತ ವರ್ಗಾವಣೆ ಮಾಡಿಸಿಕೊಳ್ಳುವುದು", ta: "இரத்தம் ஏற்றிக்கொள்வது" },
    "receiving_unsterile_injections": { en: "receiving unsterile injections", te: "శుభ్రత లేని ఇంజెక్షన్లు తీసుకోవడం", hi: "अस्वच्छ इंजेक्शन लेना", kn: "ಅಶುದ್ಧ ಇಂಜೆಕ್ಷನ್ ಪಡೆಯುವುದು", ta: "சுத்தமற்ற ஊசி செலுத்திக்கொள்வது" },
    "red_sore_around_nose": { en: "red sore around nose", te: "ముక్కు చుట్టూ ఎర్రటి పుండు", hi: "नाक के आसपास लाल घाव", kn: "ಮೂಗಿನ ಸುತ್ತ ಕೆಂಪು ಹುಣ್ಣು", ta: "மூக்கைச் சுற்றி சிவப்பு புண்" },
    "red_spots_over_body": { en: "red spots over body", te: "శరీరంపై ఎర్రటి మచ్చలు", hi: "शरीर पर लाल धब्बे", kn: "ದೇಹದ ಮೇಲೆ ಕೆಂಪು ಕಲೆಗಳು", ta: "உடல் முழுவதும் சிவப்பு புள்ளிகள்" },
    "redness_of_eyes": { en: "redness of eyes", te: "కళ్ల ఎర్రబడటం", hi: "आंखों का लाल होना", kn: "ಕಣ್ಣುಗಳು ಕೆಂಪಾಗುವುದು", ta: "கண்கள் சிவத்தல்" },
    "restlessness": { en: "restlessness", te: "చంచలత్వం", hi: "बेचैनी", kn: "ಚಡಪಡಿಕೆ", ta: "அமைதியின்மை" },
    "runny_nose": { en: "runny nose", te: "ముక్కు కారడం", hi: "नाक बहना", kn: "ಮೂಗು ಸೋರುವುದು", ta: "மூக்கு ஒழுகுதல்" },
    "rusty_sputum": { en: "rust-colored sputum", te: "తుప్పు రంగు కఫం", hi: "जंग जैसे रंग का बलगम", kn: "ತುಕ್ಕು ಬಣ್ಣದ ಕಫ", ta: "துரு நிற சளி" },
    "scurring": { en: "scarring", te: "మచ్చలు ఏర్పడటం", hi: "दाग पड़ना", kn: "ಗಾಯದ ಗುರುತುಗಳು", ta: "தழும்புகள்" },
    "shivering": { en: "shivering", te: "వణుకు", hi: "कंपकंपी", kn: "ನಡುಕ", ta: "நடுக்கம்" },
    "silver_like_dusting": { en: "silver-like skin scaling", te: "వెండి రంగు పొరల వంటి చర్మం", hi: "चांदी जैसी त्वचा की परतें", kn: "ಬೆಳ್ಳಿಯಂತಹ ಚರ್ಮದ ಪದರಗಳು", ta: "வெள்ளி போன்ற தோல் செதில்கள்" },
    "sinus_pressure": { en: "sinus pressure", te: "సైనస్ ఒత్తిడి", hi: "साइनस में दबाव", kn: "ಸೈನಸ್ ಒತ್ತಡ", ta: "சைனஸ் அழுத்தம்" },
    "skin_peeling": { en: "skin peeling", te: "చర్మం పొట్టు ఊడటం", hi: "त्वचा छिलना", kn: "ಚರ್ಮ ಸಿಪ್ಪೆ ಸುಲಿಯುವುದು", ta: "தோல் உரிதல்" },
    "skin_rash": { en: "skin rash", te: "చర్మంపై దద్దుర్లు", hi: "त्वचा पर चकत्ते", kn: "ಚರ್ಮದ ದದ್ದು", ta: "தோல் தடிப்பு" },
    "slurred_speech": { en: "slurred speech", te: "మాటలు స్పష్టంగా రాకపోవడం", hi: "बोलने में अस्पष्टता", kn: "ಮಾತು ಸ್ಪಷ್ಟವಾಗಿರದಿರುವುದು", ta: "பேச்சு தெளிவில்லாமல் இருப்பது" },
    "small_dents_in_nails": { en: "small dents in nails", te: "గోళ్లలో చిన్న గుంటలు", hi: "नाखूनों में छोटे गड्ढे", kn: "ಉಗುರುಗಳಲ್ಲಿ ಸಣ್ಣ ಗುಳಿಗಳು", ta: "நகங்களில் சிறிய குழிகள்" },
    "spinning_movements": { en: "spinning sensation", te: "తిరుగుతున్నట్లుగా అనిపించడం", hi: "घूमने जैसा महसूस होना", kn: "ತಿರುಗುತ್ತಿರುವಂತೆ ಅನಿಸುವುದು", ta: "சுற்றுவது போன்ற உணர்வு" },
    "spotting_ urination": { en: "spotting during urination", te: "మూత్ర విసర్జనలో రక్తపు చుక్కలు రావడం", hi: "पेशाब में रक्त के धब्बे", kn: "ಮೂತ್ರ ವಿಸರ್ಜನೆಯಾಗುವಾಗ ರಕ್ತದ ಚುಕ್ಕೆಗಳು", ta: "சிறுநீர் கழிக்கும் போது இரத்தத் துளிகள்" },
    "stiff_neck": { en: "stiff neck", te: "మెడ బిగుతు", hi: "गर्दन में अकड़न", kn: "ಕುತ್ತಿಗೆ ಬಿಗಿತ", ta: "கழுத்து விறைப்பு" },
    "stomach_bleeding": { en: "stomach bleeding", te: "కడుపులో రక్తస్రావం", hi: "पेट में रक्तस्राव", kn: "ಹೊಟ್ಟೆಯಲ್ಲಿ ರಕ್ತಸ್ರಾವ", ta: "வயிற்றில் இரத்தக்கசிவு" },
    "stomach_pain": { en: "stomach pain", te: "కడుపు నొప్పి", hi: "पेट दर्द", kn: "ಹೊಟ್ಟೆ ನೋವು", ta: "வயிற்று வலி" },
    "sunken_eyes": { en: "sunken eyes", te: "కళ్లు లోపలికి కనిపించడం", hi: "आंखें धंसी होना", kn: "ಕಣ್ಣುಗಳು ಒಳಗೆ ಕುಸಿದಂತೆ ಕಾಣುವುದು", ta: "கண்கள் உள்ளிழுந்து காணப்படுதல்" },
    "sweating": { en: "sweating", te: "చెమట పట్టడం", hi: "पसीना आना", kn: "ಬೆವರುವುದು", ta: "வியர்வை" },
    "swelled_lymph_nodes": { en: "swollen lymph nodes", te: "లింఫ్ గ్రంథులు వాపు", hi: "लिम्फ नोड्स में सूजन", kn: "ಲಿಂಫ್ ಗ್ರಂಥಿಗಳ ಊತ", ta: "நிணநீர் சுரப்பிகள் வீக்கம்" },
    "swelling_joints": { en: "swollen joints", te: "కీళ్ల వాపు", hi: "जोड़ों में सूजन", kn: "ಕೀಲುಗಳಲ್ಲಿ ಊತ", ta: "மூட்டுகளில் வீக்கம்" },
    "swelling_of_stomach": { en: "swelling of stomach", te: "కడుపు వాపు", hi: "पेट में सूजन", kn: "ಹೊಟ್ಟೆ ಊತ", ta: "வயிற்று வீக்கம்" },
    "swollen_blood_vessels": { en: "swollen blood vessels", te: "రక్తనాళాలు వాపు", hi: "रक्त वाहिकाओं में सूजन", kn: "ರಕ್ತನಾಳಗಳ ಊತ", ta: "இரத்த நாளங்கள் வீக்கம்" },
    "swollen_extremeties": { en: "swollen extremities", te: "చేతులు లేదా కాళ్ల చివరల్లో వాపు", hi: "हाथ-पैर के सिरों में सूजन", kn: "ಕೈಕಾಲುಗಳ ತುದಿಗಳಲ್ಲಿ ಊತ", ta: "கைகள் அல்லது கால்களின் முனைகளில் வீக்கம்" },
    "swollen_legs": { en: "swollen legs", te: "కాళ్ల వాపు", hi: "पैरों में सूजन", kn: "ಕಾಲುಗಳಲ್ಲಿ ಊತ", ta: "கால்களில் வீக்கம்" },
    "throat_irritation": { en: "throat irritation", te: "గొంతు చికాకు", hi: "गले में जलन", kn: "ಗಂಟಲಿನಲ್ಲಿ ಕಿರಿಕಿರಿ", ta: "தொண்டை எரிச்சல்" },
    "toxic_look_(typhos)": { en: "toxic appearance", te: "అనారోగ్యంగా కనిపించడం", hi: "बहुत बीमार दिखाई देना", kn: "ತೀವ್ರ ಅನಾರೋಗ್ಯದಂತೆ ಕಾಣುವುದು", ta: "கடுமையாக நோயுற்றது போல் தோன்றுதல்" },
    "ulcers_on_tongue": { en: "ulcers on tongue", te: "నాలుకపై పుండ్లు", hi: "जीभ पर छाले", kn: "ನಾಲಿಗೆಯ ಮೇಲೆ ಹುಣ್ಣುಗಳು", ta: "நாக்கில் புண்கள்" },
    "unsteadiness": { en: "unsteadiness", te: "స్థిరంగా నిలబడలేకపోవడం", hi: "अस्थिरता", kn: "ಅಸ್ಥಿರತೆ", ta: "நிலையற்ற தன்மை" },
    "visual_disturbances": { en: "visual disturbances", te: "చూపులో ఇబ్బందులు", hi: "दृष्टि में परेशानी", kn: "ದೃಷ್ಟಿಯಲ್ಲಿ ತೊಂದರೆ", ta: "பார்வை தொந்தரவுகள்" },
    "vomiting": { en: "vomiting", te: "వాంతులు", hi: "उल्टी", kn: "ವಾಂತಿ", ta: "வாந்தி" },
    "watering_from_eyes": { en: "watering from eyes", te: "కళ్లలో నీరు కారడం", hi: "आंखों से पानी आना", kn: "ಕಣ್ಣುಗಳಿಂದ ನೀರು ಬರುವುದು", ta: "கண்களில் நீர் வடிதல்" },
    "weakness_in_limbs": { en: "weakness in limbs", te: "చేతులు లేదా కాళ్లలో బలహీనత", hi: "हाथ-पैरों में कमजोरी", kn: "ಕೈಕಾಲುಗಳಲ್ಲಿ ದೌರ್ಬಲ್ಯ", ta: "கைகள் அல்லது கால்களில் பலவீனம்" },
    "weakness_of_one_body_side": { en: "weakness of one side of body", te: "శరీరంలోని ఒక వైపు బలహీనత", hi: "शरीर के एक तरफ कमजोरी", kn: "ದೇಹದ ಒಂದು ಬದಿಯಲ್ಲಿ ದೌರ್ಬಲ್ಯ", ta: "உடலின் ஒரு பக்கத்தில் பலவீனம்" },
    "weight_gain": { en: "weight gain", te: "బరువు పెరగడం", hi: "वजन बढ़ना", kn: "ತೂಕ ಹೆಚ್ಚಾಗುವುದು", ta: "எடை அதிகரிப்பு" },
    "weight_loss": { en: "weight loss", te: "బరువు తగ్గడం", hi: "वजन कम होना", kn: "ತೂಕ ಇಳಿಯುವುದು", ta: "எடை குறைதல்" },
    "yellow_crust_ooze": { en: "yellow crust and oozing", te: "పసుపు రంగు పొర మరియు ద్రవం కారడం", hi: "पीली पपड़ी और रिसाव", kn: "ಹಳದಿ ಪದರ ಮತ್ತು ದ್ರವ ಸ್ರಾವ", ta: "மஞ்சள் படலம் மற்றும் திரவம் கசிதல்" },
    "yellow_urine": { en: "yellow urine", te: "పసుపు రంగు మూత్రం", hi: "पीला पेशाब", kn: "ಹಳದಿ ಬಣ್ಣದ ಮೂತ್ರ", ta: "மஞ்சள் நிற சிறுநீர்" },
    "yellowing_of_eyes": { en: "yellowing of eyes", te: "కళ్లు పసుపు రంగులోకి మారడం", hi: "आंखों का पीला होना", kn: "ಕಣ್ಣುಗಳು ಹಳದಿಯಾಗುವುದು", ta: "கண்கள் மஞ்சள் நிறமாகுதல்" },
    "yellowish_skin": { en: "yellowish skin", te: "చర్మం పసుపు రంగులోకి మారడం", hi: "त्वचा पीली होना", kn: "ಚರ್ಮ ಹಳದಿಯಾಗುವುದು", ta: "தோல் மஞ்சள் நிறமாகுதல்" },
};

    const relatedSymptomMap = {
        fever: ["chills", "sweating", "fatigue", "headache", "muscle_pain", "sore_throat"],
        cough: ["sore_throat", "congestion", "runny_nose", "fever", "breathlessness", "fatigue"],
        headache: ["dizziness", "fever", "nausea", "vomiting", "fatigue", "sweating"],
        itching: ["skin_rash", "fatigue", "fever", "sweating", "nausea", "dizziness"],
        skin_rash: ["itching", "fever", "sweating", "fatigue", "headache", "nausea"],
        nausea: ["vomiting", "stomach_pain", "indigestion", "dizziness", "fatigue", "acidity"],
        vomiting: ["nausea", "stomach_pain", "dizziness", "fatigue", "fever", "diarrhoea"],
        stomach_pain: ["nausea", "vomiting", "indigestion", "acidity", "diarrhoea", "constipation"],
        chest_pain: ["breathlessness", "sweating", "dizziness", "fatigue", "nausea", "cough"],
        breathlessness: ["cough", "chest_pain", "fatigue", "dizziness", "fever", "sore_throat"],
        fatigue: ["fever", "headache", "dizziness", "muscle_pain", "sweating", "nausea"],
        dizziness: ["headache", "nausea", "vomiting", "fatigue", "sweating", "weakness"],
        diarrhoea: ["stomach_pain", "vomiting", "nausea", "fever", "fatigue", "dizziness"],
        constipation: ["stomach_pain", "indigestion", "acidity", "nausea", "fatigue", "back_pain"],
        acidity: ["indigestion", "stomach_pain", "nausea", "vomiting", "chest_pain", "sore_throat"],
        indigestion: ["acidity", "stomach_pain", "nausea", "vomiting", "constipation", "fatigue"],
        joint_pain: ["muscle_pain", "back_pain", "fatigue", "fever", "swelling", "weakness"],
        muscle_pain: ["joint_pain", "back_pain", "fever", "fatigue", "chills", "weakness"],
        back_pain: ["muscle_pain", "joint_pain", "fatigue", "fever", "weakness", "dizziness"],
        sore_throat: ["cough", "fever", "runny_nose", "congestion", "headache", "fatigue"],
        runny_nose: ["congestion", "sore_throat", "cough", "fever", "headache", "sneezing"],
        congestion: ["runny_nose", "sore_throat", "cough", "headache", "fever", "breathlessness"],
        chills: ["fever", "sweating", "fatigue", "muscle_pain", "headache", "nausea"],
        sweating: ["fever", "chills", "dizziness", "fatigue", "nausea", "headache"]
    };

    const getRelatedSymptoms = (symptomText) => {
        const entered = symptomText
            .split(",")
            .map((item) => item.trim().toLowerCase())
            .filter(Boolean);

        const suggestions = [];

        entered.forEach((symptom) => {
            const related = relatedSymptomMap[symptom] || [];
            related.forEach((item) => {
                if (!entered.includes(item) && !suggestions.includes(item)) {
                    suggestions.push(item);
                }
            });
        });

        return suggestions.slice(0, 6);
    };




    const audioRef = useRef(null);
    const audioUrlRef = useRef(null);
    const ttsAbortRef = useRef(null);
    const voiceRequestRef = useRef(0);
    const [isVoicePlaying, setIsVoicePlaying] = useState(false);
    const [loadingVoice, setLoadingVoice] = useState(false);

    const normalizeSymptomKey = (symptom) => {
        return String(symptom || "")
            .trim()
            .toLowerCase()
            .replace(/\s+/g, "_")
            .replace(/_+/g, "_");
    };

    const translateSymptomForVoice = (symptom, language) => {
        const key = normalizeSymptomKey(symptom);
        const entry =
            symptomTranslations[key] ||
            symptomTranslations[String(symptom || "").trim().toLowerCase()];

        if (entry?.[language]) {
            return entry[language];
        }

        return String(symptom || "")
            .replace(/_/g, " ")
            .replace(/\s+/g, " ")
            .trim();
    };

    const buildVoiceMessage = (predictionResult) => {
        if (!predictionResult?.prediction) return "";

        const disease = predictionResult.prediction || "";
        const match = predictionResult.evidence_match || "not available";
        const language = selectedLanguage || "en";

        const translatedSymptoms = (predictionResult.recognized_symptoms || [])
            .map((symptom) =>
                translateSymptomForVoice(symptom, language)
            )
            .filter(Boolean)
            .join(", ");

        const messages = {
            en:
                `The possible condition is ${disease}. ` +
                `The evidence match is ${match}. ` +
                `The symptoms used were ${translatedSymptoms}. ` +
                `Please consult a qualified healthcare professional for proper evaluation. ` +
                `If you want to contact a doctor, select Find Hospitals to find nearby hospitals for consultation.`,

            te:
                `సంభావ్య ఆరోగ్య పరిస్థితి ${disease}. ` +
                `లక్షణాల ఆధారిత సరిపోలిక ${match}. ` +
                `పరిశీలించిన లక్షణాలు ${translatedSymptoms}. ` +
                `సరైన వైద్య నిర్ధారణ కోసం అర్హత కలిగిన వైద్య నిపుణులను సంప్రదించండి. ` +
                `మీరు డాక్టర్‌ను సంప్రదించాలనుకుంటే, Find Hospitals ను ఎంచుకోండి. మీకు సమీపంలోని ఆసుపత్రులను కనుగొని సంప్రదించవచ్చు.`,

            hi:
                `संभावित स्वास्थ्य स्थिति ${disease} है। ` +
                `लक्षणों के आधार पर मिलान ${match} है। ` +
                `जिन लक्षणों पर विचार किया गया है वे हैं ${translatedSymptoms}। ` +
                `सही चिकित्सकीय जांच के लिए योग्य स्वास्थ्य विशेषज्ञ से संपर्क करें। ` +
                `अगर आप डॉक्टर से सलाह लेना चाहते हैं, तो Find Hospitals चुनें। आपको अपने पास के अस्पताल मिल जाएंगे, जहाँ आप डॉक्टर से सलाह ले सकते हैं।`,

            kn:
                `ಸಂಭಾವ್ಯ ಆರೋಗ್ಯ ಸ್ಥಿತಿ ${disease}. ` +
                `ಲಕ್ಷಣಗಳ ಆಧಾರದ ಹೊಂದಾಣಿಕೆ ${match}. ` +
                `ಪರಿಗಣಿಸಲಾದ ಲಕ್ಷಣಗಳು ${translatedSymptoms}. ` +
                `ಸರಿಯಾದ ವೈದ್ಯಕೀಯ ಮೌಲ್ಯಮಾಪನಕ್ಕಾಗಿ ಅರ್ಹ ವೈದ್ಯಕೀಯ ತಜ್ಞರನ್ನು ಸಂಪರ್ಕಿಸಿ. ` +
                `ನೀವು ವೈದ್ಯರನ್ನು ಸಂಪರ್ಕಿಸಲು ಬಯಸಿದರೆ, Find Hospitals ಆಯ್ಕೆಮಾಡಿ. ನಿಮ್ಮ ಸಮೀಪದ ಆಸ್ಪತ್ರೆಗಳನ್ನು ಹುಡುಕಿ ವೈದ್ಯರನ್ನು ಸಂಪರ್ಕಿಸಬಹುದು.`,

            ta:
                `சாத்தியமான உடல்நிலை ${disease}. ` +
                `அறிகுறிகளின் அடிப்படையிலான பொருத்தம் ${match}. ` +
                `கருத்தில் கொள்ளப்பட்ட அறிகுறிகள் ${translatedSymptoms}. ` +
                `சரியான மருத்துவ மதிப்பீட்டிற்காக தகுதியான மருத்துவ நிபுணரை அணுகவும். ` +
                `நீங்கள் மருத்துவரை அணுக விரும்பினால், Find Hospitals என்பதைத் தேர்ந்தெடுக்கவும். உங்களுக்கு அருகிலுள்ள மருத்துவமனைகளைக் கண்டறிந்து மருத்துவரை அணுகலாம்.`
        };

        return messages[language] || messages.en;
    };

    const stopVoice = () => {
        voiceRequestRef.current += 1;

        if (ttsAbortRef.current) {
            ttsAbortRef.current.abort();
            ttsAbortRef.current = null;
        }

        window.speechSynthesis?.cancel();

        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            audioRef.current = null;
        }

        if (audioUrlRef.current) {
            URL.revokeObjectURL(audioUrlRef.current);
            audioUrlRef.current = null;
        }

        setLoadingVoice(false);
        setIsVoicePlaying(false);
    };

    const speakText = async (text) => {
        if (!text) return;

        stopVoice();

        const requestId = ++voiceRequestRef.current;
        const controller = new AbortController();
        ttsAbortRef.current = controller;

        setLoadingVoice(true);

        const languageMap = {
            en: "en",
            te: "te",
            hi: "hi",
            kn: "kn",
            ta: "ta"
        };

        const language = languageMap[selectedLanguage] || "en";

        try {
            const response = await axios.post(
               `${API_URL}/api/tts/`,
                {
                    text,
                    language
                },
                {
                    responseType: "blob",
                    headers: {
                        Authorization:
                            "Bearer " + localStorage.getItem("access")
                    },
                    signal: controller.signal
                }
            );

            if (requestId !== voiceRequestRef.current) return;

            const audioUrl = URL.createObjectURL(response.data);
            const audio = new Audio(audioUrl);

            audioRef.current = audio;
            audioUrlRef.current = audioUrl;

            audio.onended = () => {
                URL.revokeObjectURL(audioUrl);
                if (audioRef.current === audio) {
                    audioRef.current = null;
                    audioUrlRef.current = null;
                }
                setIsVoicePlaying(false);
                setLoadingVoice(false);
            };

            audio.onerror = () => {
                URL.revokeObjectURL(audioUrl);
                if (audioRef.current === audio) {
                    audioRef.current = null;
                    audioUrlRef.current = null;
                }
                setIsVoicePlaying(false);
                setLoadingVoice(false);
            };

            setLoadingVoice(false);

            try {
                await audio.play();

                if (requestId === voiceRequestRef.current) {
                    setIsVoicePlaying(true);
                }
            } catch (playError) {
                console.log("Automatic audio playback was blocked:", playError);
                setIsVoicePlaying(false);
            }
        } catch (error) {
            if (error?.code === "ERR_CANCELED" || controller.signal.aborted) {
                return;
            }

            console.error("Server TTS Error:", error);
            console.error("TTS response:", error.response);

            setLoadingVoice(false);
            setIsVoicePlaying(false);

            // Browser fallback is used only for English and Hindi.
            // Telugu, Kannada and Tamil must not silently switch to English.
            if (selectedLanguage === "en" || selectedLanguage === "hi") {
                if (!window.speechSynthesis) return;

                const utterance = new SpeechSynthesisUtterance(text);
                utterance.lang =
                    selectedLanguage === "hi" ? "hi-IN" : "en-IN";
                utterance.rate = 0.92;
                utterance.pitch = 1;

                const voices = window.speechSynthesis.getVoices();
                const preferredVoice = voices.find((voice) =>
                    voice.lang?.toLowerCase().startsWith(
                        utterance.lang.split("-")[0]
                    )
                );

                if (preferredVoice) {
                    utterance.voice = preferredVoice;
                }

                utterance.onstart = () => setIsVoicePlaying(true);
                utterance.onend = () => setIsVoicePlaying(false);
                utterance.onerror = () => setIsVoicePlaying(false);

                window.speechSynthesis.speak(utterance);
            }
        }
    };

    const toggleVoice = () => {
        if (isVoicePlaying || loadingVoice) {
            stopVoice();
            return;
        }

        const message = buildVoiceMessage(result);
        if (message) {
            speakText(message);
        }
    };

    useEffect(() => {
        if (
            result?.status === "insufficient_evidence" ||
            result?.needs_more_information ||
            !result?.prediction
        ) {
            return () => {
                stopVoice();
            };
        }

        const voiceMessage = buildVoiceMessage(result);

        // Automatically start the explanation after a successful prediction.
        // The Play/Stop button can be used at any time afterwards.
        const timer = setTimeout(() => {
            speakText(voiceMessage);
        }, 250);

        return () => {
            clearTimeout(timer);
            stopVoice();
        };
    }, [result, selectedLanguage]);

    useEffect(() => {
        return () => {
            stopVoice();
        };
    }, []);

    const runPrediction = async (symptomText) => {
        const symptomList = symptomText
            .split(",")
            .map((item) => item.trim().toLowerCase())
            .filter(Boolean);

        if (symptomList.length === 0) {
            return;
        }

        try {
            const response = await axios.post(
                `${API_URL}/api/predict/`,
                {
                    symptoms: symptomList,
                    language: selectedLanguage,
                },
                {
                    headers: {
                        Authorization:
                            "Bearer " + localStorage.getItem("access"),
                    },
                }
            );

            setResult(response.data);
        } catch (error) {
            console.log("Prediction Error:", error);
            console.log("Response:", error.response);
            console.log("Response Data:", error.response?.data);

            if (
                error.response?.status === 400 &&
                error.response?.data?.needs_more_information
            ) {
                setResult(error.response.data);
            } else {
                setResult({
                    status: "error",
                    needs_more_information: false,
                    error:
                        error.response?.data?.message ||
                        error.response?.data?.error ||
                        error.response?.data?.detail ||
                        "Prediction failed. Please try again."
                });
            }
        }
    };

    const predictDisease = async () => {
        console.log("PREDICT BUTTON CLICKED", symptoms);
        setSelectedAdditionalSymptoms([]);
        await runPrediction(symptoms);
    };

    const analyzeWithAdditionalSymptoms = async () => {
        const additional = selectedAdditionalSymptoms
            .map((item) => item.trim())
            .filter(Boolean);

        if (additional.length === 0) {
            return;
        }

        const existing = symptoms
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean);

        const combined = [
            ...existing,
            ...additional,
        ];

        const uniqueSymptoms = [...new Set(combined)];
        const combinedText = uniqueSymptoms.join(", ");

        setSymptoms(combinedText);
        setAdditionalSymptomText("");
        setSelectedAdditionalSymptoms([]);
        await runPrediction(combinedText);
    };

    const downloadReport = () => {

    if (!result) {
      alert("Please predict a disease first.");
      return;
    }

    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text("RuralCareAI Medical Report", 20, 20);

    doc.setFontSize(12);

    doc.text("Date: " + new Date().toLocaleString(), 20, 35);
    doc.text("Disease: " + result.prediction, 20, 50);
    doc.text("Evidence Match: " + (result.evidence_match ?? "Not available"), 20, 60);
    doc.text("Recommended Doctor: " + result.doctor, 20, 70);
    doc.text("Risk Level: " + result.risk, 20, 80);
    doc.text("Symptoms Used for Assessment:", 20, 95);

let symptomY = 105;

if (
  result.recognized_symptoms &&
  result.recognized_symptoms.length > 0
) {
  result.recognized_symptoms.forEach((symptom) => {
    symptomY += 7;

    const readableSymptom = symptom
      .replaceAll("_", " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());

    doc.text("• " + readableSymptom, 25, symptomY);
  });
} else {
  symptomY += 7;
  doc.text("• No recognized symptoms available.", 25, symptomY);
}

symptomY += 12;

doc.text("Description:", 20, symptomY);
    doc.text("Description:", 20, 95);

    const description = doc.splitTextToSize(
      result.description,
      170
    );

    doc.text(description, 20, symptomY + 10);

    let y = symptomY + 35;

    doc.text("Precautions:", 20, y);

    result.precautions.forEach((item) => {
      y += 10;
      doc.text("• " + item, 25, y);
    });

    y += 20;

    doc.setFontSize(10);

    doc.text(
      "This report is an evidence-match assessment and should not replace professional medical advice.",
      20,
      y
    );

    doc.save("Medical_Report.pdf");

  };
 const mediaRecorderRef = useRef(null);
const audioChunksRef = useRef([]);

const startListening = () => {
    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        alert(
            "Live speech recognition is not supported in this browser. Please use Google Chrome."
        );
        return;
    }

    const recognition = new SpeechRecognition();

    recognitionRef.current = recognition;

    const languageMap = {
        en: "en-IN",
        te: "te-IN",
        hi: "hi-IN",
        kn: "kn-IN",
        ta: "ta-IN"
    };

    recognition.lang =
        languageMap[selectedLanguage] || "en-IN";

    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onstart = () => {
        console.log("Live microphone started");

        setListening(true);
        setRecording(true);
        setDetectedLanguage(selectedLanguage);
    };

    recognition.onresult = (event) => {
        let finalText = "";

        for (
            let i = event.resultIndex;
            i < event.results.length;
            i++
        ) {
            if (event.results[i].isFinal) {
                finalText +=
                    event.results[i][0].transcript + " ";
            }
        }

        finalText = finalText.trim();

        if (!finalText) {
            return;
        }

        console.log("VOICE RECEIVED:", finalText);

        setOriginalSpeech((previous) =>
            `${previous} ${finalText}`.trim()
        );

        let detectedSymptoms = [];

        const text = finalText.toLowerCase().trim();

        /* =========================
           ENGLISH SYMPTOMS
           ========================= */

        const symptomMap = {
            fever: ["fever", "high fever", "temperature"],
            cough: ["cough", "coughing"],
            headache: ["headache", "head pain"],
            itching: ["itching", "itchy"],
            skin_rash: ["skin rash", "rash"],
            nausea: ["nausea", "feeling sick"],
            vomiting: ["vomiting", "vomit"],
            stomach_pain: [
                "stomach pain",
                "stomach ache",
                "abdominal pain"
            ],
            chest_pain: ["chest pain"],
            breathlessness: [
                "breathlessness",
                "shortness of breath",
                "difficulty breathing"
            ],
            fatigue: ["fatigue", "tired", "tiredness", "weakness"],
            dizziness: ["dizziness", "dizzy"],
            diarrhoea: ["diarrhea", "diarrhoea", "loose motion"],
            constipation: ["constipation"],
            acidity: ["acidity", "acid reflux"],
            indigestion: ["indigestion"],
            joint_pain: ["joint pain"],
            muscle_pain: ["muscle pain"],
            back_pain: ["back pain"],
            sore_throat: ["sore throat", "throat pain"],
            runny_nose: ["runny nose"],
            congestion: ["congestion"],
            chills: ["chills", "shivering"],
            sweating: ["sweating"]
        };

        Object.keys(symptomMap).forEach((symptom) => {
            const words = symptomMap[symptom];

            words.forEach((word) => {
                if (text.includes(word)) {
                    detectedSymptoms.push(symptom);
                }
            });
        });

        /* =========================
           TELUGU / TELUGU
           TRANSCRIPTION PHRASES
           ========================= */

        /* =========================
   TELUGU SYMPTOM DETECTION
   ========================= */

if (selectedLanguage === "te") {

    // Fever
    if (
        text.includes("జ్వరం") ||
        text.includes("కుజ్వరం") ||
        text.includes("జ్వరము") ||
        text.includes("కుజ్వరము") ||
        text.includes("వేడి")
    ) {
        detectedSymptoms.push("fever");
    }

    // Cough
    if (
        text.includes("దగ్గు") ||
        text.includes("దగ్గు ఉంది") ||
        text.includes("దగ్గు వస్తుంది")
    ) {
        detectedSymptoms.push("cough");
    }

    // Headache
    if (
        text.includes("తలనొప్పి") ||
        text.includes("తల నొప్పి")
    ) {
        detectedSymptoms.push("headache");
    }

    // Vomiting
    if (
        text.includes("వాంతులు") ||
        text.includes("వాంతి") ||
        text.includes("వాంతులు ఉన్నాయి")
    ) {
        detectedSymptoms.push("vomiting");
    }

    // Nausea
    if (
        text.includes("వికారం") ||
        text.includes("వికారం ఉంది")
    ) {
        detectedSymptoms.push("nausea");
    }

    // Stomach pain
    if (
        text.includes("కడుపు నొప్పి") ||
        text.includes("కడుపునొప్పి") ||
        text.includes("కడుపులో నొప్పి")
    ) {
        detectedSymptoms.push("stomach_pain");
    }

    // Chest pain
    if (
        text.includes("ఛాతి నొప్పి") ||
        text.includes("ఛాతీలో నొప్పి") ||
        text.includes("గుండెలో నొప్పి") ||
        text.includes("గుండె నొప్పి")
    ) {
        detectedSymptoms.push("chest_pain");
    }

    // Breathlessness
    if (
        text.includes("ఊపిరి తీసుకోవడం కష్టం") ||
        text.includes("ఊపిరి ఆడటం లేదు") ||
        text.includes("శ్వాస తీసుకోవడం కష్టం") ||
        text.includes("శ్వాస ఇబ్బంది")
    ) {
        detectedSymptoms.push("breathlessness");
    }

    // Itching
    if (
        text.includes("దురద") ||
        text.includes("దురదగా ఉంది") ||
        text.includes("దురద ఉంది")
    ) {
        detectedSymptoms.push("itching");
    }

    // Skin rash
    if (
        text.includes("చర్మంపై దద్దుర్లు") ||
        text.includes("దద్దుర్లు") ||
        text.includes("చర్మం మీద దద్దుర్లు")
    ) {
        detectedSymptoms.push("skin_rash");
    }

    // Dizziness
    if (
        text.includes("తల తిరగడం") ||
        text.includes("తల తిరుగుతుంది") ||
        text.includes("తల తిరుగుతోంది")
    ) {
        detectedSymptoms.push("dizziness");
    }

    // Weakness / fatigue
    if (
        text.includes("బలహీనంగా ఉంది") ||
        text.includes("బలహీనత") ||
        text.includes("అలసట") ||
        text.includes("నీరసం")
    ) {
        detectedSymptoms.push("fatigue");
    }

    // Diarrhoea
    if (
        text.includes("విరేచనాలు") ||
        text.includes("లూజ్ మోషన్స్") ||
        text.includes("లూజ్ మోషన్")
    ) {
        detectedSymptoms.push("diarrhoea");
    }

    // Constipation
    if (
        text.includes("మలబద్ధకం") ||
        text.includes("మలబద్దకం")
    ) {
        detectedSymptoms.push("constipation");
    }

    // Acidity
    if (
        text.includes("ఎసిడిటీ") ||
        text.includes("ఆమ్లత్వం") ||
        text.includes("ఆమ్లం")
    ) {
        detectedSymptoms.push("acidity");
    }

    // Indigestion
    if (
        text.includes("అజీర్ణం") ||
        text.includes("జీర్ణం కావడం లేదు")
    ) {
        detectedSymptoms.push("indigestion");
    }

    // Joint pain
    if (
        text.includes("కీళ్ల నొప్పి") ||
        text.includes("కీళ్లలో నొప్పి")
    ) {
        detectedSymptoms.push("joint_pain");
    }

    // Muscle pain
    if (
        text.includes("కండరాల నొప్పి") ||
        text.includes("కండరాల్లో నొప్పి")
    ) {
        detectedSymptoms.push("muscle_pain");
    }

    // Back pain
    if (
        text.includes("వెన్ను నొప్పి") ||
        text.includes("వీపు నొప్పి")
    ) {
        detectedSymptoms.push("back_pain");
    }

    // Chills
    if (
        text.includes("చలి") ||
        text.includes("చలిగా ఉంది") ||
        text.includes("వణుకు")
    ) {
        detectedSymptoms.push("chills");
    }

    // Sweating
    if (
        text.includes("చెమటలు") ||
        text.includes("చెమట పడుతుంది")
    ) {
        detectedSymptoms.push("sweating");
    }

}

        /* =========================
           REMOVE DUPLICATES
           ========================= */

        detectedSymptoms = [
            ...new Set(detectedSymptoms)
        ];

        console.log(
            "EXTRACTED SYMPTOMS:",
            detectedSymptoms
        );

        if (detectedSymptoms.length > 0) {
            setSymptoms((previous) => {
                const existing = previous
                    ? previous
                          .split(",")
                          .map((item) => item.trim())
                          .filter(Boolean)
                    : [];

                const combined = [
                    ...existing,
                    ...detectedSymptoms
                ];

                return [
                    ...new Set(combined)
                ].join(", ");
            });
        } else {
            console.log(
                "No known symptoms detected from voice."
            );
        }
    };

    recognition.onerror = (event) => {
        console.log(
            "Speech recognition error:",
            event.error
        );

        setListening(false);
        setRecording(false);

        if (event.error === "not-allowed") {
            alert(
                "Microphone permission was denied. Please allow microphone access for localhost."
            );
        }
    };

    recognition.onend = () => {
        console.log("Live microphone stopped");

        setListening(false);
        setRecording(false);
    };

    recognition.start();
};

const stopListening = () => {

    if (recognitionRef.current) {

        recognitionRef.current.stop();

        recognitionRef.current = null;
    }

    setListening(false);
    setRecording(false);
};
const uploadAudio = async (event) => {

    const file = event.target.files[0];

    if (!file) return;

   const formData = new FormData();

formData.append("audio", file);
formData.append("language", selectedLanguage);
    setLoadingVoice(true);

    try {

        const response = await axios.post(
            `${API_URL}/api/transcribe/`,
            formData,
            {
                headers: {
                    Authorization:
                        "Bearer " + localStorage.getItem("access"),
                    "Content-Type": "multipart/form-data",
                },
            }
        );
        console.log("Transcribe Response:", response.data);

        setSymptoms(
    response.data.normalized_symptoms.join(", ")
);
setOriginalSpeech(response.data.original_text);
setDetectedLanguage(response.data.language);
    } catch (err) {

    console.log(err);

    console.log("Response:", err.response);

    console.log("Data:", err.response?.data);

    console.log("Status:", err.response?.status);

    alert("Voice upload failed.");

}

    setLoadingVoice(false);
};
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;

    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;

    const c =
        2 * Math.atan2(
            Math.sqrt(a),
            Math.sqrt(1 - a)
        );

    return Number((R * c).toFixed(2));
};
const findNearbyHospitals = () => {
    setHospitalLoading(true);
    setHospitalError("");
    setHospitals([]);

    if (!navigator.geolocation) {
        setHospitalError(
            "Location is not supported by this browser."
        );
        setHospitalLoading(false);
        return;
    }

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            const radius = 10000;

            const query = `
                [out:json][timeout:20];
                (
                    node["amenity"="hospital"]
                    (around:${radius},${latitude},${longitude});

                    way["amenity"="hospital"]
                    (around:${radius},${latitude},${longitude});

                    relation["amenity"="hospital"]
                    (around:${radius},${latitude},${longitude});
                );
                out center tags;
            `;

            const overpassServers = [
                "https://overpass-api.de/api/interpreter",
                "https://overpass.kumi.systems/api/interpreter",
            ];

            let data = null;
            let lastError = null;

            // Use GET with the encoded query. This is more reliable from a
            // browser than the previous POST request to Overpass.
            for (const server of overpassServers) {
                try {
                    const controller = new AbortController();
                    const timeoutId = setTimeout(
                        () => controller.abort(),
                        15000
                    );

                    const response = await fetch(
                        `${server}?data=${encodeURIComponent(query)}`,
                        {
                            method: "GET",
                            signal: controller.signal,
                        }
                    );

                    clearTimeout(timeoutId);

                    if (!response.ok) {
                        throw new Error(
                            `Hospital search failed: ${response.status}`
                        );
                    }

                    data = await response.json();
                    break;
                } catch (error) {
                    lastError = error;
                    console.warn(
                        `Hospital server failed: ${server}`,
                        error
                    );
                }
            }

            try {
                if (!data) {
                    throw lastError || new Error("Hospital search failed.");
                }

                const results = data.elements
                    .map((hospital) => {
                        const lat =
                            hospital.lat ??
                            hospital.center?.lat;

                        const lon =
                            hospital.lon ??
                            hospital.center?.lon;

                        if (lat == null || lon == null) {
                            return null;
                        }

                        return {
                            name:
                                hospital.tags?.name ||
                                "Hospital",

                            address:
                                hospital.tags?.["addr:full"] ||
                                [
                                    hospital.tags?.["addr:street"],
                                    hospital.tags?.["addr:city"],
                                ]
                                    .filter(Boolean)
                                    .join(", ") ||
                                "Address unavailable",

                            latitude: lat,
                            longitude: lon,

                            distance: calculateDistance(
                                latitude,
                                longitude,
                                lat,
                                lon
                            ),
                        };
                    })
                    .filter(Boolean)
                    .sort(
                        (a, b) =>
                            a.distance - b.distance
                    )
                    .slice(0, 3);

                if (results.length === 0) {
                    setHospitalError(
                        "No hospitals found within 10 km."
                    );
                }

                setHospitals(results);
            } catch (error) {
                console.error("Hospital search error:", error);

                // Final fallback: give the user a direct Google Maps search
                // centered on their current location instead of leaving the
                // Find Hospitals feature unusable when a map-data server is
                // temporarily unavailable.
                const mapsUrl =
                    `https://www.google.com/maps/search/hospitals/@` +
                    `${latitude},${longitude},14z`;

                setHospitals([
                    {
                        name: "Hospitals near your location",
                        address:
                            "Open Google Maps to view nearby hospitals",
                        latitude,
                        longitude,
                        distance: 0,
                        mapsUrl,
                    },
                ]);

                setHospitalError(
                    "Hospital map data is temporarily unavailable. You can still open nearby hospitals in Google Maps."
                );
            } finally {
                setHospitalLoading(false);
            }
        },
        (error) => {
            console.error("Geolocation error:", error);

            let message =
                "Please allow location access to find nearby hospitals.";

            if (error?.code === 2) {
                message =
                    "Your location could not be determined. Please check your internet/GPS settings and try again.";
            } else if (error?.code === 3) {
                message =
                    "Location request timed out. Please try Find Hospitals again.";
            }

            setHospitalError(message);
            setHospitalLoading(false);
        },
        {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 300000,
        }
    );
};
    return (
    <>
        <style>{`
            .rc-related-symptom-chip {
                display: inline-flex !important;
                width: fit-content !important;
                min-width: 0 !important;
                max-width: 100% !important;
                height: 34px !important;
                min-height: 34px !important;
                max-height: 34px !important;
                flex: 0 0 auto !important;
                padding: 5px 10px !important;
                margin: 0 !important;
                border-radius: 8px !important;
                align-items: center !important;
                justify-content: flex-start !important;
                box-sizing: border-box !important;
                font-size: 13px !important;
                line-height: 1 !important;
            }

            .rc-related-symptom-chip input {
                width: 14px !important;
                height: 14px !important;
                min-width: 14px !important;
                min-height: 14px !important;
                margin: 0 !important;
                flex: 0 0 auto !important;
            }

            .rc-related-symptom-list {
                display: flex !important;
                flex-wrap: wrap !important;
                gap: 8px !important;
                align-items: center !important;
            }
        `}</style>

        <div className="d-flex rc-app-shell">

        <Sidebar />

        <main className="container-fluid rc-prediction-page">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="rc-page-header mb-4">

                <div>

                    <div className="rc-eyebrow">
                        RURALCAREAI • ARTIFICIAL INTELLIGENCE
                    </div>

                    <h2 className="rc-page-title">
                        🧠 Symptom Evidence Assessment
                    </h2>

                    <p className="rc-page-description">
                        Describe your symptoms and let RuralCareAI
                        provide an AI-assisted prediction.
                    </p>

                </div>

                <div className="rc-ai-status">

                    <span className="rc-status-dot"></span>

                    <div>
                        <strong>AI System Online</strong>
                        <small>Prediction service ready</small>
                    </div>

                </div>

            </div>


            {/* =================================================
                MAIN PREDICTION CARD
            ================================================= */}

            <div className="rc-prediction-card">

                <div className="rc-card-heading">

                    <div className="rc-card-icon">
                        🩺
                    </div>

                    <div>
                        <h4>Tell us how you feel</h4>

                        <p>
                            Enter your symptoms manually or use
                            your voice.
                        </p>
                    </div>

                </div>


                {/* LANGUAGE */}

                <div className="mb-4">

                    <label className="rc-input-label">
                        🌐 Voice Language
                    </label>

                    <select
                        className="form-select rc-modern-input"
                        value={selectedLanguage}
                        onChange={(e) =>
                            setSelectedLanguage(e.target.value)
                        }
                    >
                        <option value="en">
                            🇬🇧 English
                        </option>

                        <option value="te">
                            🇮🇳 Telugu
                        </option>

                        <option value="hi">
                            🇮🇳 Hindi
                        </option>

                        <option value="kn">
                            🇮🇳 Kannada
                        </option>

                        <option value="ta">
                            🇮🇳 Tamil
                        </option>
                    </select>

                </div>


                {/* SYMPTOMS */}

                <div className="mb-3">

                    <label className="rc-input-label">
                        🔍 Symptoms
                    </label>

                    <textarea
                        className="form-control rc-modern-input rc-symptom-box"
                        rows="5"
                        placeholder="Example: fever, headache, fatigue"
                        value={symptoms}
                        onChange={(e) =>
                            setSymptoms(e.target.value)
                        }
                    />

                    <div className="rc-input-hint">
                        Separate multiple symptoms using commas.
                    </div>

                </div>


                {/* VOICE CONTROLS */}

                <div className="rc-voice-panel">

                    <div className="rc-voice-info">

                        <div
                            className={
                                listening
                                    ? "rc-mic-icon listening"
                                    : "rc-mic-icon"
                            }
                        >
                            🎙️
                        </div>

                        <div>

                            <strong>
                                Voice Assistant
                            </strong>

                            <small>
                                {loadingVoice
                                    ? "AI is processing your voice..."
                                    : listening
                                    ? "Listening... speak clearly"
                                    : "Speak your symptoms naturally"
                                }
                            </small>

                        </div>

                    </div>


                    <div className="rc-voice-buttons">

                        {!recording ? (

                            <button
                                className="rc-voice-main-btn"
                                onClick={startListening}
                                disabled={loadingVoice}
                            >
                                🎤 Start Speaking
                            </button>

                        ) : (

                            <button
                                className="rc-stop-btn"
                                onClick={stopListening}
                            >
                                🛑 Stop Recording
                            </button>

                        )}


                        <label className="rc-upload-btn">

                            📁 Upload Audio

                            <input
                                type="file"
                                accept=".wav,.mp3,.webm,.m4a"
                                hidden
                                onChange={uploadAudio}
                            />

                        </label>


                        <button
                            className="rc-clear-btn"
                            onClick={() => {
                                setSymptoms("");
                                setOriginalSpeech("");
                                setDetectedLanguage("");
                                setResult(null);
                                setSelectedAdditionalSymptoms([]);
                                setAdditionalSymptomText("");
                                window.speechSynthesis?.cancel();
                            }}
                        >
                            ↻ Clear
                        </button>

                    </div>

                </div>


                {/* STATUS */}

                <div className="rc-processing-status">

                    <span
                        className={
                            listening || loadingVoice
                                ? "rc-status-dot"
                                : "rc-ready-dot"
                        }
                    ></span>

                    {loadingVoice
                        ? "Understanding your voice..."
                        : listening
                        ? "Recording your symptoms..."
                        : "Ready for symptom analysis"
                    }

                </div>


                {/* SPEECH INFORMATION */}

                {(originalSpeech ||
                    detectedLanguage ||
                    symptoms) && (

                    <div className="rc-extraction-card">

                        <div className="rc-extraction-title">
                            AI Input Understanding
                        </div>

                        <div className="row g-3">

                            <div className="col-md-4">

                                <div className="rc-info-item">

                                    <span>
                                        🎤 Original Speech
                                    </span>

                                    <strong>
                                        {originalSpeech || "-"}
                                    </strong>

                                </div>

                            </div>


                            <div className="col-md-4">

                                <div className="rc-info-item">

                                    <span>
                                        🌍 Detected Language
                                    </span>

                                    <strong>
                                        {detectedLanguage || "-"}
                                    </strong>

                                </div>

                            </div>


                            <div className="col-md-4">

                                <div className="rc-info-item">

                                    <span>
                                        🩺 Extracted Symptoms
                                    </span>

                                    <strong>
                                        {symptoms || "-"}
                                    </strong>

                                </div>

                            </div>

                        </div>

                    </div>

                )}


                {/* PREDICT BUTTON */}

                <button
                    className="rc-predict-btn"
                    onClick={predictDisease}
                    disabled={!symptoms.trim()}
                >

                    <span>🧠</span>

                    Analyze Symptoms

                    <span className="rc-button-arrow">
                        →
                    </span>

                </button>

            </div>


            {/* =================================================
                RESULT
            ================================================= */}

            <div className="mt-4">

                <div className="rc-section-heading">

                    <div>

                        <div className="rc-eyebrow">
                            EVIDENCE ANALYSIS
                        </div>

                        <h4>
                            Prediction Result
                        </h4>

                    </div>

                </div>


                {result?.status === "insufficient_evidence" ? (

                    <div className="rc-result-card">

                        <div className="rc-result-top">
                            <div>
                                <div className="rc-result-label">
                                    MORE INFORMATION NEEDED
                                </div>
                                <h2>
                                    🔎 More information needed
                                </h2>
                            </div>
                        </div>

                        <div className="rc-result-section">
                            <p>
                                {result.message || result.error}
                            </p>

                            {result.recognized_symptoms?.length > 0 && (
                                <>
                                    <h5>🩺 Symptoms you provided</h5>
                                    <ul className="mt-2">
                                        {result.recognized_symptoms.map((symptom, index) => (
                                            <li key={index}>
                                                ✅ {symptom.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase())}
                                            </li>
                                        ))}
                                    </ul>
                                </>
                            )}
                        </div>

                        {result.can_add_more_symptoms && (
                            <div className="rc-precautions mt-3">
                                <h5>➕ Add any other symptoms you actually have</h5>

                                <p className="text-muted">
                                    Tick a symptom only if you are actually experiencing it,
                                    or type another symptom in the box below. Selected
                                    symptoms will be added automatically.
                                </p>

                                {getRelatedSymptoms(symptoms).length > 0 && (
                                    <>
                                        <div className="mb-2">
                                            <strong style={{ fontSize: "14px" }}>
                                                Related symptoms
                                            </strong>
                                            <div className="rc-input-hint">
                                                These suggestions are based on the symptoms you entered.
                                                Tick only the ones you actually have.
                                            </div>
                                        </div>

                                        <div className="rc-related-symptom-list mb-3">
                                            {getRelatedSymptoms(symptoms).map((symptom) => (
                                                <label
                                                    key={symptom}
                                                    className="rc-related-symptom-chip"
                                                    style={{
                                                        cursor: "pointer",
                                                        border: "1px solid rgba(255,255,255,0.14)",
                                                        background: "rgba(255,255,255,0.03)"
                                                    }}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedAdditionalSymptoms.includes(symptom)}
                                                        onChange={(e) => {
                                                            setSelectedAdditionalSymptoms((previous) =>
                                                                e.target.checked
                                                                    ? [...new Set([...previous, symptom])]
                                                                    : previous.filter((item) => item !== symptom)
                                                            );
                                                        }}
                                                    />
                                                    {symptom
                                                        .replaceAll("_", " ")
                                                        .replace(/\b\w/g, (char) => char.toUpperCase())}
                                                </label>
                                            ))}
                                        </div>
                                    </>
                                )}

                                <input
                                    type="text"
                                    className="form-control rc-modern-input"
                                    placeholder="Other symptoms (comma separated)"
                                    value={selectedAdditionalSymptoms.join(", ")}
                                    onChange={(e) => {
                                        const typed = e.target.value
                                            .split(",")
                                            .map((item) => item.trim().toLowerCase())
                                            .filter(Boolean);

                                        setSelectedAdditionalSymptoms([...new Set(typed)]);
                                    }}
                                />

                                <div className="rc-input-hint mt-2">
                                    Ticked symptoms are automatically added to this box. You can
                                    also type any other symptoms you actually have.
                                </div>

                                <button
                                    className="rc-predict-btn mt-3"
                                    onClick={analyzeWithAdditionalSymptoms}
                                    disabled={selectedAdditionalSymptoms.length === 0}
                                >
                                    🧠 Analyze Added Symptoms →
                                </button>
                            </div>
                        )}

                        <div className="rc-disclaimer">
                            ⚠️ No condition is shown until there is enough symptom evidence for a supported profile match.
                        </div>

                        {result.voice_message && (
                            <button
                                className="rc-secondary-action mt-3"
                                onClick={toggleVoice}
                                >
                                    {isVoicePlaying || loadingVoice ? "⏹ Stop Voice Explanation" : "🔊 Play Voice Explanation"}
                                </button>
                        )}

                    </div>

                ) : result?.status === "error" ? (

                    <div className="rc-result-card">
                        <h5>⚠️ {result.error}</h5>
                    </div>

                ) : result ? (

                    <div className="rc-result-card">

                        <div className="rc-result-top">

                            <div>

                                <div className="rc-result-label">
                                    POSSIBLE CONDITION
                                </div>

                                <h2>
                                    🦠 {result.prediction}
                                </h2>

                            </div>

                            <div className="rc-risk-badge">
                                🚦 {result.risk}
                            </div>

                        </div>


                        {/* EVIDENCE MATCH */}

                        <div className="rc-confidence">

                            <div className="rc-confidence-header">

                                <span>
                                   Evidence Match
                                </span>

                                <strong>
                                    {result.evidence_match ?? "Not available"}
                                </strong>

                            </div>

                            <div className="rc-confidence-track">

                                <div
                                    className="rc-confidence-fill"
                                    style={{
                                        width:
                                            typeof result.match_score === "number"
                                                ? `${Math.min(
                                                    100,
                                                    Math.max(
                                                        0,
                                                        result.match_score * 100
                                                    )
                                                )}%`
                                                : typeof result.evidence_match === "number"
                                                ? `${Math.min(
                                                    100,
                                                    Math.max(
                                                        0,
                                                        result.evidence_match
                                                    )
                                                )}%`
                                                : "0%"
                                    }}
                                />

                            </div>

                        </div>


                        <div className="row g-3 mt-2">

                            <div className="col-lg-8">

                                <div className="rc-result-section">

                                    <h5>
                                        📝 About the Prediction
                                    </h5>

                                    <p>
                                        {result.description}
                                    </p>

                                </div>
                                <div className="rc-result-section mt-3">

    <h5>
        🩺 Symptoms Used for Assessment
    </h5>

    {result.recognized_symptoms &&
    result.recognized_symptoms.length > 0 ? (
        <ul className="mt-2 mb-0">
            {result.recognized_symptoms.map(
                (symptom, index) => (
                    <li key={index}>
                        ✅{" "}
                        {symptom
                            .replaceAll("_", " ")
                            .replace(/\b\w/g, (char) =>
                                char.toUpperCase()
                            )}
                    </li>
                )
            )}
        </ul>
    ) : (
        <p className="text-muted mb-0">
            No recognized symptoms available.
        </p>
    )}

</div>

                            </div>


                            <div className="col-lg-4">

                                <div className="rc-doctor-card">

                                    <span>
                                        👨‍⚕️ Recommended Specialist
                                    </span>

                                    <strong>
                                        {result.doctor}
                                    </strong>

                                </div>

                            </div>

                        </div>


                        {/* PRECAUTIONS */}

                        <div className="rc-precautions">

                            <h5>
                                🛡️ Recommended Precautions
                            </h5>

                            <div className="row g-2">

                                {result.precautions.map(
                                    (item, index) => (

                                        <div
                                            className="col-md-6"
                                            key={index}
                                        >

                                            <div className="rc-precaution">
                                                <span>✓</span>
                                                {item}
                                            </div>

                                        </div>

                                    )
                                )}

                            </div>

                        </div>


                        <div className="rc-result-actions">

                            <button
                                className="rc-secondary-action"
                                onClick={toggleVoice}
                                >
                                    {isVoicePlaying || loadingVoice ? "⏹ Stop Voice Explanation" : "🔊 Play Voice Explanation"}
                                </button>

                            <button
                                className="rc-download-btn"
                                onClick={downloadReport}
                            >
                                📄 Download Medical Report
                            </button>

                            <button
                                className="rc-secondary-action"
                                onClick={() =>
                                    navigate("/prediction-history")
                                }
                            >
                                📜 View History
                            </button>

                        </div>

                        <div className="rc-disclaimer">
                            ⚠️ AI-generated information is for
                            assistance only and should not replace
                            professional medical advice.
                        </div>

                    </div>

                ) : (

                    <div className="rc-empty-result">

                        <div className="rc-empty-icon">
                            �
                        </div>

                        <h5>
                            Your evidence assessment will appear here
                        </h5>

                        <p>
                            Enter symptoms above and click
                            <strong> Analyze Symptoms </strong>
                            to begin.
                        </p>

                    </div>

                )}

            </div>


            {/* =================================================
                HOSPITALS
            ================================================= */}

            <div className="rc-hospital-section mt-4">

                <div className="rc-section-heading">

                    <div>

                        <div className="rc-eyebrow">
                            LOCAL HEALTHCARE
                        </div>

                        <h4>
                            🏥 Nearby Hospitals
                        </h4>

                        <p>
                            Find hospitals close to your current
                            location.
                        </p>

                    </div>

                    <button
                        className="rc-hospital-btn"
                        onClick={findNearbyHospitals}
                        disabled={hospitalLoading}
                    >
                        {hospitalLoading
                            ? "🔍 Searching..."
                            : "📍 Find Hospitals"
                        }
                    </button>

                </div>


                {hospitalError && (

                    <div className="rc-hospital-error">
                        ⚠️ {hospitalError}
                    </div>

                )}


                {hospitals.length > 0 && (

                    <div className="row g-3 mt-1">

                        {hospitals.map(
                            (hospital, index) => (

                                <div
                                    className="col-lg-4"
                                    key={index}
                                >

                                    <div className="rc-hospital-card">

                                        <div className="rc-hospital-icon">
                                            🏥
                                        </div>

                                        <h5>
                                            {hospital.name}
                                        </h5>

                                        <p>
                                            📍 {hospital.address}
                                        </p>

                                        <div className="rc-distance">
                                            📏 {hospital.distance} km away
                                        </div>

                                        <a
                                            href={hospital.mapsUrl || `https://www.google.com/maps/dir/?api=1&destination=${hospital.latitude},${hospital.longitude}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="rc-directions-btn"
                                        >
                                            🧭 Get Directions
                                        </a>

                                    </div>

                                </div>

                            )
                        )}

                    </div>

                )}

            </div>

        </main>

    </div>
        </>
    );
}
export default Prediction;
