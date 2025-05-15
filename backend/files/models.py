from django.db import models
from django.conf import settings
from core.models import Project

class Directory(models.Model):
    """Directory model for file organization (tree structure)"""
    name = models.CharField(max_length=255)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='directories')
    parent = models.ForeignKey('self', null=True, blank=True, on_delete=models.CASCADE, related_name='subdirectories')
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='created_directories')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('name', 'project', 'parent')
        verbose_name_plural = 'Directories'
    
    def __str__(self):
        return self.name
    
    def get_path(self):
        """Return the full path of the directory"""
        if self.parent:
            return f"{self.parent.get_path()}/{self.name}"
        return self.name

class File(models.Model):
    """File model for storing file data with versioning"""
    name = models.CharField(max_length=255)
    directory = models.ForeignKey(Directory, on_delete=models.CASCADE, related_name='files', null=True, blank=True)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='files')
    file = models.FileField(upload_to='project_files/%Y/%m/%d/')
    content_type = models.CharField(max_length=100)
    size = models.BigIntegerField()  # Size in bytes
    version = models.PositiveIntegerField(default=1)
    previous_version = models.ForeignKey('self', null=True, blank=True, on_delete=models.SET_NULL, related_name='next_versions')
    is_latest = models.BooleanField(default=True)
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='uploaded_files')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.name
    
    def get_full_path(self):
        """Return the full path of the file including directory path"""
        if self.directory:
            return f"{self.directory.get_path()}/{self.name}"
        return self.name
