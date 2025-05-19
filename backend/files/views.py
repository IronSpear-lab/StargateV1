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
    
    # Förbättrad destroy-metod för att rekursivt ta bort mappar och filer
    def destroy(self, request, *args, **kwargs):
        try:
            # Hämta mappen som ska raderas
            instance = self.get_object()
            directory_id = instance.id
            slug_to_delete = instance.slug  # Spara slug för att kunna visa i svaret
            
            # Debuginfo för att se vad vi raderar
            print(f"Raderar mapp: {directory_id} ({slug_to_delete})")
            
            # Hitta alla undermappar rekursivt
            def get_all_child_directories(parent_id):
                child_dirs = Directory.objects.filter(parent_id=parent_id).values_list('id', flat=True)
                all_dirs = list(child_dirs)
                
                for child_id in child_dirs:
                    child_subdirs = get_all_child_directories(child_id)
                    if child_subdirs:
                        all_dirs.extend(child_subdirs)
                        
                return all_dirs
            
            # Hitta alla undermappar
            child_directory_ids = get_all_child_directories(directory_id)
            print(f"Undermappar som ska raderas: {child_directory_ids}")
            
            # Radera alla filer i dessa mappar 
            from .models import File
            deleted_files = 0
            
            # Ta bort filer i huvudmappen
            main_folder_files = File.objects.filter(directory_id=directory_id).delete()
            deleted_files += main_folder_files[0] if main_folder_files[0] else 0
            
            # Ta bort filer i undermappar
            for dir_id in child_directory_ids:
                files_deleted = File.objects.filter(directory_id=dir_id).delete()
                deleted_files += files_deleted[0] if files_deleted[0] else 0
            
            # Viktigt: Se till att avmarkera is_sidebar_item flaggan för alla mappar före radering
            # Detta löser problemet med att raderade mappar fortfarande visas i sidomenyn
            Directory.objects.filter(id=directory_id).update(is_sidebar_item=False)
            if child_directory_ids:
                Directory.objects.filter(id__in=child_directory_ids).update(is_sidebar_item=False)
            
            # Radera alla undermappar
            deleted_directories = 0
            if child_directory_ids:
                delete_result = Directory.objects.filter(id__in=child_directory_ids).delete()
                deleted_directories = delete_result[0] if delete_result[0] else 0
            
            # Radera slutligen huvudmappen
            instance.delete()
            
            # Returnera detaljerad information om raderingen
            return Response({
                "message": f"Mappen '{slug_to_delete}' och allt dess innehåll har raderats",
                "details": {
                    "deleted_directories": deleted_directories + 1,  # +1 för huvudmappen
                    "deleted_files": deleted_files,
                    "slug": slug_to_delete,
                    "id": directory_id
                }
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            # Om något går fel, logga felet och returnera felmeddelande
            print(f"Fel vid radering av mapp: {str(e)}")
            return Response({
                "error": f"Kunde inte radera mappen: {str(e)}",
                "details": {
                    "exception_type": type(e).__name__,
                    "directory_id": directory_id,
                    "traceback": str(e)
                }
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
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
    permission_classes = [permissions.AllowAny]  # Tillåt alla anrop för utvecklingsändamål
    
    def get_permissions(self):
        """
        Allow all requests without authentication for testing purposes
        """
        return []  # Tillåt alla förfrågningar utan autentisering
    
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
        
    def destroy(self, request, *args, **kwargs):
        """Delete a file and its physical file from storage"""
        try:
            instance = self.get_object()
            
            # Försök ta bort den fysiska filen från lagring
            try:
                instance.file.delete(save=False)
            except Exception as e:
                print(f"Varning: Kunde inte radera fysisk fil: {str(e)}")
            
            # Radera filens databaspost
            self.perform_destroy(instance)
            
            return Response({
                "message": "Filen har raderats framgångsrikt",
                "id": kwargs.get('pk')
            }, status=status.HTTP_200_OK)
        except Exception as e:
            print(f"Fel vid radering av fil: {str(e)}")
            return Response({
                "error": f"Kunde inte radera filen: {str(e)}",
                "details": {
                    "exception_type": type(e).__name__,
                    "file_id": kwargs.get('pk'),
                    "traceback": str(e)
                }
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
