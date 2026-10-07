import sys
from gtts import gTTS

if len(sys.argv) < 3:
    print("Usage: python tts_service.py <language> <output_file> <text>")
    sys.exit(1)

language = sys.argv[1]
output_file = sys.argv[2]
text = " ".join(sys.argv[3:])

try:
    tts = gTTS(
        text=text,
        lang=language,
        slow=False
    )

    tts.save(output_file)

    print("TTS_SUCCESS")

except Exception as e:
    print(f"TTS_ERROR: {e}")
    sys.exit(1)