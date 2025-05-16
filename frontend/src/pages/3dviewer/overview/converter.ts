import * as THREE from 'three';
import obj2gltf from 'obj2gltf';
import { saveAs } from 'file-saver';

/**
 * Funktion för att konvertera OBJ-filer till GLTF/GLB
 * @param objData ArrayBuffer eller Blob med OBJ-data
 * @returns Promise med binärdata för GLB
 */
export const convertObjToGlb = async (objData: ArrayBuffer | Blob): Promise<ArrayBuffer> => {
  try {
    // Om vi har en Blob, konvertera den till ArrayBuffer
    let buffer = objData instanceof Blob 
      ? await objData.arrayBuffer() 
      : objData;
    
    // Konvertera OBJ till GLB
    const options = {
      binary: true,
      separate: false,
      checkTransparency: true,
    };
    
    // Skapa en textdekoderare för att hantera textdata
    const decoder = new TextDecoder('utf-8');
    const objText = decoder.decode(buffer);
    
    // Konvertera OBJ till GLB
    const glbData = await obj2gltf(objText, options);
    
    return glbData;
  } catch (error) {
    console.error('Fel vid konvertering av OBJ till GLB:', error);
    throw error;
  }
};

/**
 * Funktion för att spara GLB-data som en fil
 * @param glbData GLB-binärdata
 * @param filename Filnamn för GLB-filen
 */
export const saveGlbFile = (glbData: ArrayBuffer, filename: string): void => {
  try {
    // Skapa en blob med GLB-data
    const blob = new Blob([glbData], { type: 'model/gltf-binary' });
    
    // Använd FileSaver för att spara filen
    const name = filename.endsWith('.glb') ? filename : `${filename}.glb`;
    saveAs(blob, name);
  } catch (error) {
    console.error('Fel vid sparande av GLB-fil:', error);
    throw error;
  }
};

/**
 * Funktion för att ladda en OBJ-fil, konvertera den till GLB och spara resultatet
 * @param objFile OBJ-fil från fil-input
 * @returns Promise som löses med filnamnet på den sparade GLB-filen
 */
export const processObjFile = async (objFile: File): Promise<string> => {
  try {
    // Läs in OBJ-data
    const buffer = await objFile.arrayBuffer();
    
    // Konvertera till GLB
    const glbData = await convertObjToGlb(buffer);
    
    // Skapa nytt filnamn
    const baseName = objFile.name.replace(/\.obj$/i, '');
    const glbName = `${baseName}.glb`;
    
    // Spara GLB-filen
    saveGlbFile(glbData, glbName);
    
    return glbName;
  } catch (error) {
    console.error('Fel vid processande av OBJ-fil:', error);
    throw error;
  }
};

/**
 * Hjälpfunktion för att hantera konvertering från DragDrop eller filväljare
 * @param files Lista med filer från event
 * @returns Promise med filnamn på konverterade filer
 */
export const handleObjFiles = async (files: FileList): Promise<string[]> => {
  const results: string[] = [];
  
  // Iterera över alla filer
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    // Kontrollera om det är en OBJ-fil
    if (file.name.toLowerCase().endsWith('.obj')) {
      try {
        const glbName = await processObjFile(file);
        results.push(glbName);
      } catch (error) {
        console.error(`Fel vid konvertering av ${file.name}:`, error);
      }
    }
  }
  
  return results;
};