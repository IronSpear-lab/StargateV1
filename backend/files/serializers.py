from rest_framework import serializers
from .models import File, Directory

class DirectorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Directory
        fields = ['id', 'name', 'project', 'parent', 'type', 
                  'is_sidebar_item', 'created_by', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
        extra_kwargs = {
            'project': {'required': False, 'allow_null': True},
            'created_by': {'required': False, 'allow_null': True},
            'parent': {'required': False, 'allow_null': True}
        }
    
    def validate(self, data):
        """
        Validera att det inte finns en annan mapp med samma namn 
        på samma nivå (med samma parent)
        """
        name = data.get('name')
        parent = data.get('parent')
        is_sidebar_item = data.get('is_sidebar_item', False)
        
        # Kontrollera om namnet redan finns på samma nivå
        existing_directory = Directory.objects.filter(
            name__iexact=name,
            parent=parent,
            is_sidebar_item=is_sidebar_item
        )
        
        # Om vi uppdaterar en befintlig mapp, exkludera den från kontrollen
        if self.instance:
            existing_directory = existing_directory.exclude(id=self.instance.id)
        
        if existing_directory.exists():
            raise serializers.ValidationError({
                'name': 'En mapp med detta namn finns redan på denna nivå.'
            })
            
        return data
    
    def create(self, validated_data):
        request = self.context.get('request')
        if request and request.user.is_authenticated and 'created_by' not in validated_data:
            validated_data['created_by'] = request.user
        return super().create(validated_data)

class FileSerializer(serializers.ModelSerializer):
    class Meta:
        model = File
        fields = [
            'id', 'name', 'directory', 'project', 'file', 'content_type', 
            'size', 'version', 'previous_version', 'is_latest',
            'uploaded_by', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'uploaded_by', 'content_type', 'size', 'version', 'is_latest', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        validated_data['uploaded_by'] = self.context['request'].user
        
        # Set content type and size from file
        file = validated_data['file']
        validated_data['content_type'] = file.content_type
        validated_data['size'] = file.size
        
        # Check if this is a new version of an existing file
        name = validated_data['name']
        project = validated_data['project']
        directory = validated_data.get('directory')
        
        existing_files = File.objects.filter(
            name=name,
            project=project,
            directory=directory,
            is_latest=True
        )
        
        if existing_files.exists():
            # This is a new version of an existing file
            existing_file = existing_files.first()
            
            # Set previous version reference and update version number
            validated_data['previous_version'] = existing_file
            validated_data['version'] = existing_file.version + 1
            
            # Set existing file's is_latest to False
            existing_file.is_latest = False
            existing_file.save()
        
        return super().create(validated_data)
