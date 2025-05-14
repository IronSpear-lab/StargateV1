from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import User, Project, Task, RoleAccess, TimeReport
from .serializers import (
    UserSerializer, UserCreateSerializer, ProjectSerializer,
    TaskSerializer, RoleAccessSerializer, TimeReportSerializer
)

class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom token serializer that uses email instead of username
    """
    username_field = User.USERNAME_FIELD

class EmailTokenObtainPairView(TokenObtainPairView):
    """
    Custom token view that uses EmailTokenObtainPairSerializer
    """
    serializer_class = EmailTokenObtainPairSerializer

class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to edit it.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions are only allowed to the owner
        return obj.user == request.user

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    
    def get_serializer_class(self):
        if self.action == 'create':
            return UserCreateSerializer
        return UserSerializer
    
    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    
    def get_queryset(self):
        """
        This view should return a list of all projects
        for the currently authenticated user.
        """
        user = self.request.user
        return Project.objects.filter(users=user)

class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    
    def get_queryset(self):
        """
        Optionally restricts the returned tasks to a given project,
        by filtering against a `project` query parameter in the URL.
        """
        queryset = Task.objects.all()
        project = self.request.query_params.get('project', None)
        if project is not None:
            queryset = queryset.filter(project__id=project)
        return queryset

class RoleAccessViewSet(viewsets.ModelViewSet):
    queryset = RoleAccess.objects.all()
    serializer_class = RoleAccessSerializer
    
    def get_queryset(self):
        """
        This view should return a list of all roles
        for the currently authenticated user.
        """
        user = self.request.user
        # If user is superuser, return all roles
        if user.is_superuser:
            return RoleAccess.objects.all()
        # Return roles where user is project leader
        return RoleAccess.objects.filter(
            project__in=Project.objects.filter(
                user_roles__user=user,
                user_roles__role=RoleAccess.PROJECT_LEADER
            )
        )

class TimeReportViewSet(viewsets.ModelViewSet):
    queryset = TimeReport.objects.all()
    serializer_class = TimeReportSerializer
    
    def get_queryset(self):
        """
        This view should return time reports based on user permissions.
        """
        user = self.request.user
        # If user is superuser, return all time reports
        if user.is_superuser:
            return TimeReport.objects.all()
        
        # Get all projects where user is a project leader
        leader_projects = Project.objects.filter(
            user_roles__user=user,
            user_roles__role=RoleAccess.PROJECT_LEADER
        )
        
        # Return time reports for user's own entries or for projects they lead
        return TimeReport.objects.filter(
            models.Q(user=user) | models.Q(task__project__in=leader_projects)
        )
