import subprocess
import os
import tempfile
from django.conf import settings
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def convert_obj_to_gltf(request):
    """
    CLI-baserad konverterare från OBJ till GLTF/GLB format
    Tar emot en OBJ-fil och returnerar en länk till den konverterade GLB-filen
    """
    if 'file' not in request.FILES:
        return Response({'error': 'Ingen fil uppladdad'}, status=status.HTTP_400_BAD_REQUEST)
    
    obj_file = request.FILES['file']
    
    # Kontrollera filtyp
    if not obj_file.name.lower().endswith('.obj'):
        return Response({'error': 'Endast OBJ-filer kan konverteras'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Skapa temporära filnamn
    with tempfile.NamedTemporaryFile(suffix='.obj', delete=False) as temp_obj:
        for chunk in obj_file.chunks():
            temp_obj.write(chunk)
        temp_obj_path = temp_obj.name
    
    # Skapa output filnamn (samma som input men med .glb extension)
    temp_glb_path = os.path.splitext(temp_obj_path)[0] + '.glb'
    
    try:
        # Kör obj2gltf via node_modules
        command = [
            'npx', 
            'obj2gltf',
            '-i', temp_obj_path,
            '-o', temp_glb_path
        ]
        
        # Kör kommandot
        process = subprocess.run(
            command, 
            capture_output=True,
            text=True,
            check=True
        )
        
        # Kontrollera om output-filen skapades
        if not os.path.exists(temp_glb_path):
            return Response({
                'error': 'Konverteringen misslyckades', 
                'command_output': process.stdout
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # Läs in konverterad fil
        with open(temp_glb_path, 'rb') as glb_file:
            glb_data = glb_file.read()
        
        # Skapa filnamn för output
        output_filename = os.path.splitext(obj_file.name)[0] + '.glb'
        
        # Ta bort temporära filer
        os.remove(temp_obj_path)
        os.remove(temp_glb_path)
        
        # Returnera resultatet som en fil för nedladdning
        response = Response(glb_data, content_type='model/gltf-binary')
        response['Content-Disposition'] = f'attachment; filename="{output_filename}"'
        response['Access-Control-Expose-Headers'] = 'Content-Disposition'
        
        return response
        
    except subprocess.CalledProcessError as e:
        # Något gick fel vid körning av kommandot
        return Response({
            'error': 'Fel vid konvertering', 
            'command_error': e.stderr,
            'command_output': e.stdout
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    except Exception as e:
        # Generellt fel
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    finally:
        # Städa upp temporära filer om de fortfarande existerar
        if os.path.exists(temp_obj_path):
            os.remove(temp_obj_path)
        if os.path.exists(temp_glb_path):
            os.remove(temp_glb_path)