from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from users.views import PatientViewSet

router = DefaultRouter()
router.register(r'patients', PatientViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
]