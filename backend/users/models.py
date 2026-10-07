from django.db import models


class Patient(models.Model):
    name = models.CharField(max_length=100)
    age = models.IntegerField()
    gender = models.CharField(max_length=10)
    phone = models.CharField(max_length=15)
    address = models.TextField()

    def __str__(self):
        return self.name


class Prediction(models.Model):
    patient_name = models.CharField(max_length=100)
    disease = models.CharField(max_length=100)
    confidence = models.CharField(max_length=20)
    doctor = models.CharField(max_length=100)
    risk = models.CharField(max_length=20)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.patient_name} - {self.disease}"
class MedicalReport(models.Model):
    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        related_name="medical_reports"
    )

    report_name = models.CharField(max_length=255)

    report_type = models.CharField(max_length=100)

    summary = models.TextField(blank=True)

    analysis_data = models.JSONField(
        default=dict,
        blank=True
    )

    language = models.CharField(
        max_length=10,
        default="en"
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return f"{self.patient.name} - {self.report_type}"
