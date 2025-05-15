from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from .models import File, Directory
from .serializers import FileSerializer, DirectorySerializer
from core.models import Project, RoleAccess

class DirectoryViewSet(viewsets.ModelViewSet):
    queryset = Directory.objects.all()
    serializer_class = DirectorySerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name']
    ordering_fields = ['name', 'created_at']
    
<<<<<<< HEAD
    # Lägg till destroy-metod för att kunna ta bort alla mappar också
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    def get_permissions(self):
        """
        Allow GET requests without authentication for testing purposes
        """
        if self.request.method == 'GET':
            return []  # Tillåt alla GET-förfrågningar utan autentisering
        
        # För POST-anrop, kontrollera om is_sidebar_item är true i request data
        sidebar_create = False
        if self.request.method == 'POST':
            try:
                if self.request.data.get('is_sidebar_item') == True:
                    sidebar_create = True
            except:
                pass
                
        # Tillåt DELETE-anrop utan autentisering (för att rensa mappar)
        if self.request.method == 'DELETE' or sidebar_create:
            return []
        
        # Default to authentication required
        return [permissions.IsAuthenticated()]
    
=======
>>>>>>> 48ca818 (Restored to '48d8f2899175e71ec876d0e4e4fea3901e40ddf7')
    def get_queryset(self):
        """Filter directories by project and parent directory"""
        queryset = Directory.objects.all()
        
        # Filter by project (required)
        project_id = self.request.query_params.get('project')
        if project_id:
            queryset = queryset.filter(project_id=project_id)
        
        # Filter by parent directory (optional)
        parent_id = self.request.query_params.get('parent')
        if parent_id and parent_id != 'null':
            queryset = queryset.filter(parent_id=parent_id)
        elif parent_id == 'null':
            queryset = queryset.filter(parent__isnull=True)
        
        return queryset
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class FileViewSet(viewsets.ModelViewSet):
    queryset = File.objects.all()
    serializer_class = FileSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name']
    ordering_fields = ['name', 'created_at', 'size']
    
    def get_permissions(self):
        """
        Allow GET requests without authentication for testing purposes
        """
        if self.request.method == 'GET':
            return []  # Tillåt alla GET-förfrågningar utan autentisering
        
        # Default to authentication required
        return [permissions.IsAuthenticated()]
    
    def get_queryset(self):
        """Filter files by project and directory"""
        queryset = File.objects.all()
        
        # Filter by project (required)
        project_id = self.request.query_params.get('project')
        if project_id:
            queryset = queryset.filter(project_id=project_id)
        
        # Filter by directory (optional)
        directory_id = self.request.query_params.get('directory')
        if directory_id and directory_id != 'null':
            queryset = queryset.filter(directory_id=directory_id)
        elif directory_id == 'null':
            queryset = queryset.filter(directory__isnull=True)
        
        # Filter by latest version only (default)
        latest_only = self.request.query_params.get('latest_only', 'true').lower()
        if latest_only == 'true':
            queryset = queryset.filter(is_latest=True)
        
        return queryset
    
    @action(detail=True, methods=['get'])
    def versions(self, request, pk=None):
        """Get all versions of a specific file"""
        file = self.get_object()
        
        # Find the first version
        first_version = file
        while first_version.previous_version:
            first_version = first_version.previous_version
        
        # Get all versions from the first one
        all_versions = []
        current = first_version
        while current:
            all_versions.append(current)
            next_versions = File.objects.filter(previous_version=current)
            current = next_versions.first() if next_versions.exists() else None
        
        serializer = self.get_serializer(all_versions, many=True)
        return Response(serializer.data)
