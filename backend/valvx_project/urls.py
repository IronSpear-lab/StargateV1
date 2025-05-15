"""
URL configuration for valvx_project project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import HttpResponse
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('admin/', admin.site.urls),
    # API endpoints
    path('api/', include([
        # JWT Authentication
        path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
        path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
        
        # Status endpoint
        path('status/', lambda request: HttpResponse(b'{"status": "ok"}', content_type='application/json')),
        
        # App routes
        path('', include('core.urls')),
        path('files/', include('files.urls')),
        path('wiki/', include('wiki.urls')),
        path('notifications/', include('notifications.urls')),
    ])),
]

# Add static and media URLs in development
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
