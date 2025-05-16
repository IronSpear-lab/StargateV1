import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Box, Button, Card, CircularProgress, Grid, Typography } from '@mui/joy';

// Enklare 3D-visare baserad på Three.js
const SimpleViewer: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadedModel, setLoadedModel] = useState<string | null>(null);
  
  // Referens för att hålla reda på scen-objekt
  const sceneRef = useRef<{
    scene?: THREE.Scene;
    camera?: THREE.PerspectiveCamera;
    renderer?: THREE.WebGLRenderer;
    controls?: any;
    animationFrame?: number;
  }>({});
  
  // Skapa scenen när komponenten monteras
  useEffect(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    
    // Skapa renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0xf5f5f5); // Ljusgrå bakgrund
    container.appendChild(renderer.domElement);
    
    // Skapa scen
    const scene = new THREE.Scene();
    
    // Ljussättning
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);
    
    // Kamera
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(15, 10, 15);
    camera.lookAt(0, 0, 0);
    
    // Importera och skapa OrbitControls
    import('three/examples/jsm/controls/OrbitControls.js').then(({ OrbitControls }) => {
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.1;
      sceneRef.current.controls = controls;
    });
    
    // Grid helper för att visa ett rutnät
    const gridHelper = new THREE.GridHelper(50, 50);
    scene.add(gridHelper);
    
    // Skapa axel-hjälpmedel
    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);
    
    // Skapa en kub som exempel
    const geometry = new THREE.BoxGeometry(5, 5, 5);
    const material = new THREE.MeshStandardMaterial({ color: 0x4361ee });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);
    
    // Animation loop
    const animate = () => {
      sceneRef.current.animationFrame = requestAnimationFrame(animate);
      
      if (sceneRef.current.controls) {
        sceneRef.current.controls.update();
      }
      
      cube.rotation.x += 0.003;
      cube.rotation.y += 0.005;
      
      renderer.render(scene, camera);
    };
    
    animate();
    
    // Hantera fönsterändring
    const handleResize = () => {
      if (!camera || !renderer || !container) return;
      
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Spara referens till scen-objekten
    sceneRef.current = {
      scene,
      camera,
      renderer,
      animationFrame: sceneRef.current.animationFrame
    };
    
    // Cleanup när komponenten unmountas
    return () => {
      window.removeEventListener('resize', handleResize);
      
      if (sceneRef.current.animationFrame) {
        cancelAnimationFrame(sceneRef.current.animationFrame);
      }
      
      if (sceneRef.current.renderer && container.contains(sceneRef.current.renderer.domElement)) {
        container.removeChild(sceneRef.current.renderer.domElement);
      }
      
      if (sceneRef.current.renderer) {
        sceneRef.current.renderer.dispose();
      }
    };
  }, []);
  
  // Ladda exempelfilen när användaren klickar på knappen
  const handleLoadExample = () => {
    setIsLoading(true);
    
    // Simulera laddningstid
    setTimeout(() => {
      setIsLoading(false);
      setLoadedModel('example_building.ifc');
      
      // Skapa en enkel demo-byggnad
      if (sceneRef.current.scene) {
        // Ta bort den tidigare kuben
        sceneRef.current.scene.children = sceneRef.current.scene.children
          .filter(child => !(child instanceof THREE.Mesh && child.geometry instanceof THREE.BoxGeometry));
        
        // Skapa en enkel byggnad
        const buildingGroup = new THREE.Group();
        
        // Grund
        const baseGeometry = new THREE.BoxGeometry(20, 1, 15);
        const baseMaterial = new THREE.MeshStandardMaterial({ color: 0xcccccc });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.y = -0.5;
        buildingGroup.add(base);
        
        // Väggar
        const walls = [
          { size: [19, 10, 1], pos: [0, 5, 7], color: 0xeeeeee }, // front
          { size: [19, 10, 1], pos: [0, 5, -7], color: 0xeeeeee }, // back
          { size: [1, 10, 15], pos: [9.5, 5, 0], color: 0xdddddd }, // right
          { size: [1, 10, 15], pos: [-9.5, 5, 0], color: 0xdddddd } // left
        ];
        
        walls.forEach(wall => {
          const wallGeo = new THREE.BoxGeometry(wall.size[0], wall.size[1], wall.size[2]);
          const wallMat = new THREE.MeshStandardMaterial({ color: wall.color });
          const wallMesh = new THREE.Mesh(wallGeo, wallMat);
          wallMesh.position.set(wall.pos[0], wall.pos[1], wall.pos[2]);
          buildingGroup.add(wallMesh);
        });
        
        // Fönster
        const windows = [
          { pos: [-5, 5, 7.1], size: [3, 3, 0.1] },
          { pos: [0, 5, 7.1], size: [3, 3, 0.1] },
          { pos: [5, 5, 7.1], size: [3, 3, 0.1] }
        ];
        
        windows.forEach(window => {
          const windowGeo = new THREE.BoxGeometry(window.size[0], window.size[1], window.size[2]);
          const windowMat = new THREE.MeshStandardMaterial({ 
            color: 0x88ccff, 
            transparent: true,
            opacity: 0.7
          });
          const windowMesh = new THREE.Mesh(windowGeo, windowMat);
          windowMesh.position.set(window.pos[0], window.pos[1], window.pos[2]);
          buildingGroup.add(windowMesh);
        });
        
        // Tak
        const roofGeometry = new THREE.ConeGeometry(15, 8, 4);
        const roofMaterial = new THREE.MeshStandardMaterial({ color: 0x995544 });
        const roof = new THREE.Mesh(roofGeometry, roofMaterial);
        roof.position.y = 12;
        roof.rotation.y = Math.PI / 4;
        buildingGroup.add(roof);
        
        // Lägg till byggnaden i scenen
        sceneRef.current.scene.add(buildingGroup);
        
        // Centrera kameran på modellen
        if (sceneRef.current.camera && sceneRef.current.controls) {
          sceneRef.current.camera.position.set(25, 15, 25);
          sceneRef.current.camera.lookAt(0, 5, 0);
          sceneRef.current.controls.target.set(0, 5, 0);
        }
      }
    }, 1500);
  };
  
  // Hantera fil-uppladdning
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.name.toLowerCase().endsWith('.ifc')) {
        setIsLoading(true);
        // Simulera en filuppladdning (i en riktig implementation skulle vi använda en IFC-loader)
        setTimeout(() => {
          setLoadedModel(file.name);
          setIsLoading(false);
          alert('I denna demo-version kan vi inte ladda riktiga IFC-filer. Vi visar en demo-modell istället.');
          handleLoadExample();
        }, 1000);
      } else {
        alert('Vänligen välj en .ifc fil');
      }
    }
  };

  return (
    <Box sx={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography level="h2">3D BIM Översikt</Typography>
      
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid xs={12} md={6}>
          <Card sx={{ p: 2, display: 'flex', gap: 2 }}>
            <Box component="label" htmlFor="upload-ifc">
              <Button 
                component="span" 
                disabled={isLoading}
                startDecorator={isLoading ? <CircularProgress size="sm" /> : undefined}
              >
                {isLoading ? 'Laddar...' : 'Ladda upp IFC-fil'}
              </Button>
              <input
                id="upload-ifc"
                type="file"
                accept=".ifc"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
            </Box>
            
            <Button 
              variant="soft" 
              color="primary" 
              onClick={handleLoadExample}
              disabled={isLoading}
            >
              Visa exempel
            </Button>
            
            {loadedModel && (
              <Typography level="body-sm" sx={{ ml: 1, alignSelf: 'center' }}>
                Laddat: {loadedModel}
              </Typography>
            )}
          </Card>
        </Grid>
        <Grid xs={12} md={6}>
          <Card sx={{ p: 2 }}>
            <Typography level="body-sm">
              Denna 3D-visare kan visa BIM-modeller. Ladda upp en IFC-fil eller använd exempelmodellen.
              Du kan rotera vyn genom att dra med musen, zooma med scrollhjulet.
            </Typography>
          </Card>
        </Grid>
      </Grid>
      
      <Card sx={{ flexGrow: 1, overflow: 'hidden', position: 'relative' }}>
        {isLoading && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              zIndex: 10,
            }}
          >
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>Laddar modell...</Typography>
          </Box>
        )}
        <Box 
          ref={containerRef} 
          sx={{ 
            width: '100%', 
            height: '100%',
            '& canvas': { outline: 'none' }
          }} 
        />
      </Card>
    </Box>
  );
};

export default SimpleViewer;