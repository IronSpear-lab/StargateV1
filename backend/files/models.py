from django.db import models
from django.conf import settings
from django.utils.text import slugify
from django.urls import reverse
from core.models import Project
from django.db.models.signals import post_save
from django.dispatch import receiver

class Directory(models.Model):
    """Directory model for file organization (tree structure)"""
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True, null=True, blank=True)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='directories', null=True, blank=True)
    parent = models.ForeignKey('self', null=True, blank=True, on_delete=models.CASCADE, related_name='subdirectories')
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='created_directories', null=True, blank=True)
    type = models.CharField(max_length=20, default='folder')  # 'folder' eller 'file'
    is_sidebar_item = models.BooleanField(default=False)  # Om mappen visas i sidebar
    
    # Nya fält för webbsidan
    page_title = models.CharField(max_length=255, blank=True, null=True)
    page_description = models.TextField(blank=True, null=True)
    has_page = models.BooleanField(default=True)  # Om en webbsida ska skapas för mappen
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('name', 'project', 'parent')
        verbose_name_plural = 'Directories'
    
    def save(self, *args, **kwargs):
        """Skapa en unik slug baserad på mappnamnet och id om den inte finns"""
        if not self.slug:
            # Temporärt spara modellen för att få ett ID (om den inte finns än)
            if not self.id:
                super(Directory, self).save(*args, **kwargs)
                kwargs['force_insert'] = False  # ändra till force_update
            
            # Skapa en unik slug baserad på namnet och ID
            base_slug = slugify(self.name)
            self.slug = f"{base_slug}-{self.id}"
            
            # Om en sida ska skapas, sätt standardvärden för sidrubrik
            if self.has_page and not self.page_title:
                self.page_title = self.name
        
        # Fortsätt med normal save
        super(Directory, self).save(*args, **kwargs)
    
    def __str__(self):
        return self.name
    
    def get_path(self):
        """Return the full path of the directory"""
        if self.parent:
            return f"{self.parent.get_path()}/{self.name}"
        return self.name
        
    def get_absolute_url(self):
        """Returnera URL:en till mappsidan"""
        return reverse('directory_page', kwargs={'slug': self.slug})
    
    def get_pdf_files(self):
        """Returnera alla PDF-filer i denna mapp"""
        return self.files.filter(
            content_type='application/pdf',
            is_latest=True
        )

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
    description = models.TextField(blank=True, null=True)  # Beskrivning av filen, visas på mappsidan
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
        
    def is_pdf(self):
        """Kontrollera om filen är en PDF"""
        return self.content_type == 'application/pdf'
        
    def get_file_url(self):
        """Returnera URL:en till den fysiska filen"""
        if self.file:
            return self.file.url
        return None


# Signal för att uppdatera tidigare versioners is_latest-flagga när ny version skapas
@receiver(post_save, sender=File)
def update_previous_version_is_latest(sender, instance, **kwargs):
    if instance.previous_version and instance.is_latest:
        # Om denna fil är den senaste versionen, sätt is_latest=False på alla tidigare versioner
        instance.previous_version.is_latest = False
        instance.previous_version.save()
