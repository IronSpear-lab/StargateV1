from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .cli_converter import convert_obj_to_gltf

router = DefaultRouter()
router.register('directories', views.DirectoryViewSet)
router.register('files', views.FileViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('convert-obj/', convert_obj_to_gltf, name='convert-obj-to-gltf'),
]
