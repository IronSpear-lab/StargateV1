import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Box, Button, Card, CircularProgress, Grid, Typography } from '@mui/joy';
import { IFCLoader } from 'web-ifc-three/IFCLoader';

// 3D-visare för IFC-filer med web-ifc-three
const IFCViewer: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadedModel, setLoadedModel] = useState<string | null>(null);
  
  // Referens för att hålla reda på scen-objekt
  const sceneRef = useRef<{
    scene?: THREE.Scene;
    camera?: THREE.PerspectiveCamera;
    renderer?: THREE.WebGLRenderer;
    controls?: any;
    ifcLoader?: IFCLoader;
    animationFrame?: number;
    ifcModels: THREE.Object3D[];
  }>({
    ifcModels: []
  });
  
  // Skapa scenen när komponenten monteras
  useEffect(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    
    // Skapa renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0xf5f5f5); // Ljusgrå bakgrund
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    
    // Skapa scen
    const scene = new THREE.Scene();
    
    // Ljussättning
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7.5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
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
    
    // Skapa IFC-loader
    const ifcLoader = new IFCLoader();
    // Set the WASM path to a version that matches our Three.js version
    ifcLoader.ifcManager.setWasmPath('https://unpkg.com/web-ifc@0.0.36/');
    
    // Importera och skapa OrbitControls
    import('three/examples/jsm/controls/OrbitControls.js').then(({ OrbitControls }) => {
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.1;
      controls.target.set(0, 0, 0);
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
      ifcLoader,
      ifcModels: [],
      animationFrame: sceneRef.current.animationFrame
    };
    
    // Cleanup när komponenten unmountas
    return () => {
      window.removeEventListener('resize', handleResize);
      
      if (sceneRef.current.animationFrame) {
        cancelAnimationFrame(sceneRef.current.animationFrame);
      }
      
      // Rensa alla IFC-modeller
      sceneRef.current.ifcModels.forEach(model => {
        scene.remove(model);
      });
      
      if (sceneRef.current.renderer && container.contains(sceneRef.current.renderer.domElement)) {
        container.removeChild(sceneRef.current.renderer.domElement);
      }
      
      if (sceneRef.current.renderer) {
        sceneRef.current.renderer.dispose();
      }
    };
  }, []);
  
  // Rensa scenen från nuvarande modeller
  const clearScene = () => {
    if (!sceneRef.current.scene) return;
    
    // Ta bort tidigare IFC-modeller
    sceneRef.current.ifcModels.forEach(model => {
      sceneRef.current.scene?.remove(model);
    });
    sceneRef.current.ifcModels = [];
    
    // Ta bort även andra objekt som kuben
    const scene = sceneRef.current.scene;
    const objectsToRemove = [];
    
    for (const child of scene.children) {
      if (child instanceof THREE.Mesh && child.geometry instanceof THREE.BoxGeometry) {
        objectsToRemove.push(child);
      }
    }
    
    objectsToRemove.forEach(obj => {
      scene.remove(obj);
    });
  };
  
  // Centrera kameran på en modell
  const centerCamera = (model: THREE.Object3D) => {
    if (!sceneRef.current.camera || !sceneRef.current.controls) return;
    
    // Beräkna modellens boundingbox
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    
    // Bestäm kameraavstånd baserat på modellens storlek
    const maxDim = Math.max(size.x, size.y, size.z);
    const distance = maxDim * 2;
    
    // Placera kameran
    const camera = sceneRef.current.camera;
    camera.position.set(center.x + distance, center.y + distance, center.z + distance);
    camera.lookAt(center);
    
    // Uppdatera orbit controls
    sceneRef.current.controls.target.copy(center);
  };
  
  // Sektionsboxvy-funktioner
  const viewFront = () => {
    if (!sceneRef.current.camera || !sceneRef.current.controls || !sceneRef.current.scene) return;
    
    const camera = sceneRef.current.camera;
    // Hitta centrum av scenen
    const box = new THREE.Box3().setFromObject(sceneRef.current.scene);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    
    // Placera kameran framför objektet
    camera.position.set(center.x, center.y, center.z + size.z * 1.5);
    camera.lookAt(center);
    
    // Uppdatera kontrollen
    sceneRef.current.controls.target.copy(center);
  };
  
  const viewBack = () => {
    if (!sceneRef.current.camera || !sceneRef.current.controls || !sceneRef.current.scene) return;
    
    const camera = sceneRef.current.camera;
    // Hitta centrum av scenen
    const box = new THREE.Box3().setFromObject(sceneRef.current.scene);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    
    // Placera kameran bakom objektet
    camera.position.set(center.x, center.y, center.z - size.z * 1.5);
    camera.lookAt(center);
    
    // Uppdatera kontrollen
    sceneRef.current.controls.target.copy(center);
  };
  
  const viewLeft = () => {
    if (!sceneRef.current.camera || !sceneRef.current.controls || !sceneRef.current.scene) return;
    
    const camera = sceneRef.current.camera;
    // Hitta centrum av scenen
    const box = new THREE.Box3().setFromObject(sceneRef.current.scene);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    
    // Placera kameran till vänster om objektet
    camera.position.set(center.x - size.x * 1.5, center.y, center.z);
    camera.lookAt(center);
    
    // Uppdatera kontrollen
    sceneRef.current.controls.target.copy(center);
  };
  
  const viewRight = () => {
    if (!sceneRef.current.camera || !sceneRef.current.controls || !sceneRef.current.scene) return;
    
    const camera = sceneRef.current.camera;
    // Hitta centrum av scenen
    const box = new THREE.Box3().setFromObject(sceneRef.current.scene);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    
    // Placera kameran till höger om objektet
    camera.position.set(center.x + size.x * 1.5, center.y, center.z);
    camera.lookAt(center);
    
    // Uppdatera kontrollen
    sceneRef.current.controls.target.copy(center);
  };
  
  const viewIso = () => {
    if (!sceneRef.current.camera || !sceneRef.current.controls || !sceneRef.current.scene) return;
    
    const camera = sceneRef.current.camera;
    // Hitta centrum av scenen
    const box = new THREE.Box3().setFromObject(sceneRef.current.scene);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    
    // Placera kameran i iso-vy
    const maxDim = Math.max(size.x, size.y, size.z);
    camera.position.set(
      center.x + maxDim, 
      center.y + maxDim, 
      center.z + maxDim
    );
    camera.lookAt(center);
    
    // Uppdatera kontrollen
    sceneRef.current.controls.target.copy(center);
  };
  
  const resetView = () => {
    if (!sceneRef.current.camera || !sceneRef.current.controls || !sceneRef.current.scene) return;
    
    const camera = sceneRef.current.camera;
    // Hitta centrum av scenen
    const box = new THREE.Box3().setFromObject(sceneRef.current.scene);
    const center = box.getCenter(new THREE.Vector3());
    
    // Återställ kameran till startpositionen
    camera.position.set(15, 10, 15);
    camera.lookAt(center);
    
    // Uppdatera kontrollen
    sceneRef.current.controls.target.copy(center);
  };
  
  // Referens för att hålla klippplan och hjälpare
  const planesRef = useRef<{
    planes: THREE.Plane[];
    helpers: THREE.PlaneHelper[];
    transformControls?: any;
  }>({
    planes: [],
    helpers: []
  });
  
  // Sectioning planes
  const [sectionsEnabled, setSectionsEnabled] = useState(false);
  
  const toggleSections = () => {
    setSectionsEnabled(!sectionsEnabled);
    
    if (!sceneRef.current.renderer || !sceneRef.current.scene) return;
    
    if (!sectionsEnabled) {
      // Aktivera sectioning
      const planes = [
        new THREE.Plane(new THREE.Vector3(1, 0, 0), 0),    // Höger-vänster
        new THREE.Plane(new THREE.Vector3(0, 1, 0), 0),    // Upp-ner
        new THREE.Plane(new THREE.Vector3(0, 0, 1), 0)     // Fram-bak
      ];
      
      // Skapa hjälpare för att visualisera planen
      const helpers = planes.map((plane, index) => {
        const colors = [0xff0000, 0x00ff00, 0x0000ff]; // RGB för de olika planen
        const helper = new THREE.PlaneHelper(plane, 10, colors[index]);
        sceneRef.current.scene?.add(helper);
        return helper;
      });
      
      // Spara referenser
      planesRef.current.planes = planes;
      planesRef.current.helpers = helpers;
      
      // Aktivera klippplan i renderaren
      sceneRef.current.renderer.localClippingEnabled = true;
      sceneRef.current.renderer.clippingPlanes = planes;
      
      // Skapa transformkontroller för det första planet
      // Vi behöver importera transform controls dynamiskt först
      import('three/examples/jsm/controls/TransformControls').then(({ TransformControls }) => {
        if (!sceneRef.current.camera || !sceneRef.current.renderer) return;
        
        // Skapa kontroll
        const controls = new TransformControls(
          sceneRef.current.camera, 
          sceneRef.current.renderer.domElement
        );
        
        // Koppla till första planet
        controls.attach(helpers[0]);
        controls.setMode('translate'); // Sätt till dragläge
        sceneRef.current.scene?.add(controls);
        
        // Lägg till lyssnare för förändringar
        controls.addEventListener('change', () => {
          // Uppdatera klippplan baserat på hjälparens position
          if (planesRef.current.helpers[0]) {
            const normal = new THREE.Vector3();
            planesRef.current.helpers[0].plane.normal.copy(normal);
            const point = planesRef.current.helpers[0].position;
            planesRef.current.planes[0].setFromNormalAndCoplanarPoint(normal, point);
          }
        });
        
        // Spara kontroll referens
        planesRef.current.transformControls = controls;
      });
      
    } else {
      // Inaktivera sectioning
      sceneRef.current.renderer.localClippingEnabled = false;
      sceneRef.current.renderer.clippingPlanes = [];
      
      // Ta bort hjälpare från scenen
      planesRef.current.helpers.forEach(helper => {
        sceneRef.current.scene?.remove(helper);
      });
      
      // Ta bort transformkontroll
      if (planesRef.current.transformControls) {
        sceneRef.current.scene?.remove(planesRef.current.transformControls);
        planesRef.current.transformControls = undefined;
      }
      
      // Rensa referenser
      planesRef.current.planes = [];
      planesRef.current.helpers = [];
    }
  };
  
  // Ladda exempelfilen när användaren klickar på knappen
  const handleLoadExample = () => {
    setIsLoading(true);
    
    // Simulera laddningstid
    setTimeout(() => {
      setIsLoading(false);
      setLoadedModel('example_building.ifc');
      
      // Skapa en enkel demo-byggnad
      if (sceneRef.current.scene) {
        // Rensa scenen från tidigare modeller
        clearScene();
        
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
        sceneRef.current.ifcModels.push(buildingGroup as unknown as THREE.Mesh);
        
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
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    const fileName = file.name.toLowerCase();
    
    // Kontrollera filtypen
    if (!fileName.endsWith('.ifc') && !fileName.endsWith('.obj')) {
      alert('Vänligen välj en .ifc eller .obj fil');
      return;
    }
    
    setIsLoading(true);
    setLoadedModel(file.name);
    
    try {
      // Rensa scenen från tidigare modeller
      clearScene();
      
      // Hantera olika filtyper
      if (fileName.endsWith('.ifc')) {
        await loadIFCFile(file);
      } else if (fileName.endsWith('.obj')) {
        await loadOBJFile(file);
      }
    } catch (error) {
      console.error('Fel vid hantering av fil:', error);
      setIsLoading(false);
      alert(`Det uppstod ett fel vid hantering av filen. Försök igen eller prova en annan fil. (${error})`);
      
      // Återställ UI
      setLoadedModel(null);
    }
  };
  
  // Ladda IFC-fil
  const loadIFCFile = async (file: File) => {
    if (!sceneRef.current.ifcLoader) {
      throw new Error('IFC Loader är inte initialiserad');
    }
    
    // Läs in IFC-filen som en ArrayBuffer
    const buffer = await file.arrayBuffer();
    
    // Skapa en Blob från ArrayBuffer för att kunna skapa en URL
    const blob = new Blob([buffer]);
    const url = URL.createObjectURL(blob);
    
    // Ladda IFC-modellen
    const ifcLoader = sceneRef.current.ifcLoader;
    
    // Visa ett meddelande till användaren
    const message = "Din IFC-fil laddas nu. Det kan ta en stund beroende på filens storlek.";
    alert(message);
    
    // Returnera ett promise som löses när modellen har laddats
    return new Promise((resolve, reject) => {
      ifcLoader.load(url, 
        // Success callback
        (model: any) => {
          if (model && sceneRef.current.scene) {
            // Lägg till modellen i scenen
            sceneRef.current.scene.add(model);
            
            // Spara modellen för senare användning
            if (model.isObject3D) {
              sceneRef.current.ifcModels.push(model);
              
              // Centrera kameran på den laddade modellen
              centerCamera(model);
            }
          }
          
          // Frigör URL:en
          URL.revokeObjectURL(url);
          
          setIsLoading(false);
          resolve(model);
        }, 
        // Progress callback
        (progress: any) => {
          console.log('Laddar IFC:', (progress.loaded / progress.total) * 100, '%');
        },
        // Error callback
        (error: any) => {
          console.error('Fel vid laddning av IFC-fil:', error);
          setIsLoading(false);
          URL.revokeObjectURL(url);
          reject(error);
        }
      );
    });
  };
  
  // Ladda OBJ-fil
  const loadOBJFile = async (file: File) => {
    try {
      // Visa meddelande till användaren
      alert(`OBJ-fil laddas. Vi konverterar den till ett kompatibelt format.`);
      
      // Skapa FormData för att skicka filen
      const formData = new FormData();
      formData.append('file', file);
      
      // Konvertera OBJ via backend API
      const response = await fetch('/api/files/convert-obj/', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Fel vid konvertering: ${response.statusText}`);
      }
      
      // Skapa en Blob från responsen
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      // Skapa ett demo-objekt för att visa i vyn
      if (sceneRef.current.scene) {
        // Rensa scenen från tidigare modeller
        clearScene();
        
        // Skapa en enkel byggnad som ersättning
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
        
        // Lägg till byggnaden i scenen
        sceneRef.current.scene.add(buildingGroup);
        sceneRef.current.ifcModels.push(buildingGroup as unknown as THREE.Mesh);
        
        // Ladda ner den konverterade filen automatiskt
        const outputFilename = file.name.replace('.obj', '.glb');
        const link = document.createElement('a');
        link.href = url;
        link.download = outputFilename;
        link.click();
        
        // Informera användaren om konverteringen
        alert(`Din OBJ-fil har konverterats till GLB-format och laddas ner automatiskt (${outputFilename}). Du kan senare importera denna fil direkt.`);
        
        // Frigör URL:en efter nedladdning
        setTimeout(() => {
          URL.revokeObjectURL(url);
        }, 1000);
      }
      
      setIsLoading(false);
      return file.name;
    } catch (error) {
      console.error('Fel vid hantering av OBJ-fil:', error);
      setIsLoading(false);
      alert(`Det uppstod ett fel vid hantering av OBJ-filen: ${error}`);
      throw error;
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
            
            <Button
              variant="soft"
              color="success"
              onClick={() => window.open('http://localhost:8080', '_blank')}
            >
              Öppna Sektionsboxvy
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
              För att använda sektionsbox, klicka på "Öppna Sektionsboxvy"-knappen.
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
        
        {/* Sektionsboxy-kontroller i botten */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'rgba(33, 150, 243, 0.9)',
            padding: '10px',
            display: 'flex',
            justifyContent: 'center',
            gap: 2,
            borderTop: '1px solid rgba(255,255,255,0.3)',
            boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
            zIndex: 5,
            color: 'white'
          }}
        >
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Typography level="body-sm" sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Vyer:</Typography>
            <Button size="sm" variant="solid" color="primary" sx={{ minWidth: '70px' }} onClick={viewFront}>Front</Button>
            <Button size="sm" variant="solid" color="primary" sx={{ minWidth: '70px' }} onClick={viewBack}>Bak</Button>
            <Button size="sm" variant="solid" color="primary" sx={{ minWidth: '70px' }} onClick={viewLeft}>Vänster</Button>
            <Button size="sm" variant="solid" color="primary" sx={{ minWidth: '70px' }} onClick={viewRight}>Höger</Button>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', borderLeft: '1px solid rgba(255,255,255,0.5)', paddingLeft: 2 }}>
            <Typography level="body-sm" sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Verktyg:</Typography>
            <Button size="sm" variant="solid" color="success" sx={{ minWidth: '80px' }} onClick={viewIso}>Iso</Button>
            <Button size="sm" variant="solid" color="success" sx={{ minWidth: '80px' }} onClick={resetView}>Återställ</Button>
            <Button 
              size="sm" 
              variant="solid" 
              color={sectionsEnabled ? "warning" : "neutral"} 
              sx={{ minWidth: '100px' }}
              onClick={toggleSections}
            >
              {sectionsEnabled ? 'Sektion PÅ ✓' : 'Sektion AV'}
            </Button>
          </Box>
        </Box>
      </Card>
    </Box>
  );
};

export default IFCViewer;