FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# System dependency required by pytesseract
RUN apt-get update && apt-get install -y --no-install-recommends \
    tesseract-ocr \
    libgl1 \
    && rm -rf /var/lib/apt/lists/*
# Main Python dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Separate TTS environment
RUN python -m venv /app/tts_env \
    && /app/tts_env/bin/pip install --no-cache-dir \
       "gTTS==2.5.4" \
       "click==8.1.8"

# Copy backend application
COPY backend/ .

# Copy TTS service
COPY tts_service.py /app/tts_service.py

# Collect static files
RUN python manage.py collectstatic --noinput

EXPOSE 10000
CMD ["sh", "-c", "python manage.py migrate && gunicorn config.wsgi:application --bind 0.0.0.0:${PORT:-10000}"]