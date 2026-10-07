from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from users.views import (
    PatientViewSet,
    PredictionViewSet,
    predict_disease,
    dashboard_stats,
    transcribe_audio,
    analyze_report,
    prediction_trend,
    text_to_speech,
        medical_reports,
)

router = DefaultRouter()
router.register(r'patients', PatientViewSet)
router.register(r'predictions', PredictionViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),

    # Patient API
    path('api/', include(router.urls)),

    # AI Prediction API
    path('api/predict/', predict_disease),
    path("api/transcribe/", transcribe_audio),
    path("api/dashboard/", dashboard_stats),
    path("api/analyze-report/", analyze_report),
    path("api/medical-reports/", medical_reports),
    path("api/prediction-trend/", prediction_trend),
    path("api/tts/", text_to_speech),
    path("analyze-report/", analyze_report),

    # JWT Authentication
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
