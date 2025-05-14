"""
URL Configuration for valvx_project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework import routers
from rest_framework_simplejwt.views import (
    TokenRefreshView,
    TokenVerifyView,
)
from core.views import EmailTokenObtainPairView
from django.http import JsonResponse

# Router för API
router = routers.DefaultRouter()

# Health check endpoint
def status_view(request):
    return JsonResponse({"status": "ok"})

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # API-endpoint för status
    path('api/status/', status_view, name='api-status'),
    
    # JWT autentisering
    path('api/token/', EmailTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    
    # Inkludera API routes
    path('api/', include(router.urls)),
    
    # Inkludera app-specifika URLs
    path('api/', include('core.urls')),
    path('api/', include('files.urls')),
]

# Lägg till media URL under utveckling
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)