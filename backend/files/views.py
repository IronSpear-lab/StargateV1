from rest_framework import viewsets, permissions, filters
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
    
    def get_permissions(self):
        """
        Allow requests for sidebar items without authentication
        """
        is_sidebar_request = self.request.query_params.get('is_sidebar') == 'true'
        sidebar_create = False
        
        # För POST-anrop, kontrollera om is_sidebar_item är true i request data
        if self.request.method == 'POST':
            try:
                if self.request.data.get('is_sidebar_item') == True:
                    sidebar_create = True
            except:
                pass
        
        if (self.request.method == 'GET' and is_sidebar_request) or sidebar_create:
            return []  # No permissions required for sidebar items
        
        # Default to authentication required
        return [permissions.IsAuthenticated()]
    
    def get_queryset(self):
        """Filter directories based on query parameters"""
        queryset = Directory.objects.all()
        
        # Filter by is_sidebar_item
        is_sidebar = self.request.query_params.get('is_sidebar')
        if is_sidebar == 'true':
            queryset = queryset.filter(is_sidebar_item=True)
        
        # Filter by project (optional)
        project_id = self.request.query_params.get('project')
        if project_id:
            if project_id == 'null':
                queryset = queryset.filter(project__isnull=True)
            else:
                queryset = queryset.filter(project_id=project_id)
        
        # Filter by parent directory (optional)
        parent_id = self.request.query_params.get('parent')
        if parent_id:
            if parent_id == 'null':
                queryset = queryset.filter(parent__isnull=True)
            else:
                queryset = queryset.filter(parent_id=parent_id)
                
        # Filter by sidebar items
        is_sidebar = self.request.query_params.get('is_sidebar')
        if is_sidebar == 'true':
            queryset = queryset.filter(is_sidebar_item=True)
        
        # Filter by type
        type_filter = self.request.query_params.get('type')
        if type_filter:
            queryset = queryset.filter(type=type_filter)
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def sidebar_tree(self, request):
        """Get all sidebar items in a tree structure"""
        queryset = Directory.objects.filter(is_sidebar_item=True).order_by('name')
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
        
    def perform_create(self, serializer):
        if self.request.user.is_authenticated:
            serializer.save(created_by=self.request.user)
        else:
            serializer.save()

class FileViewSet(viewsets.ModelViewSet):
    queryset = File.objects.all()
    serializer_class = FileSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name']
    ordering_fields = ['name', 'created_at', 'size']
    
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
