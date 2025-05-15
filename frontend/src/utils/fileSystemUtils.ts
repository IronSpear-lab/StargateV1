import { FileNode, FileTreeNode } from '../types/files';
import { v4 as uuidv4 } from 'uuid';

// Konvertera platt lista med FileNode till hierarkiskt träd
export function buildFileTree(nodes: FileNode[]): FileTreeNode[] {
  // Skapa mappning av id -> node för snabb åtkomst
  const nodeMap: Record<string, FileTreeNode> = {};
  
  // Skapa rotlistan som vi kommer att returnera
  const rootNodes: FileTreeNode[] = [];
  
  // Först konvertera alla noder till FileTreeNode
  nodes.forEach(node => {
    nodeMap[node.id] = {
      ...node,
      children: [],
      files: [],
      level: 0,
      isExpanded: true,
    };
  });
  
  // För varje nod, lägg till den till sin förälder (eller till roten om parent_id är null)
  Object.values(nodeMap).forEach(node => {
    if (node.parent_id === null) {
      // Detta är en rotnod
      rootNodes.push(node);
    } else if (nodeMap[node.parent_id]) {
      // Lägg till som barn på rätt förälder
      const parent = nodeMap[node.parent_id];
      
      // Beräkna nivå baserat på föräldern
      node.level = parent.level + 1;
      
      if (node.type === 'folder') {
        parent.children.push(node);
      } else {
        parent.files.push(node);
      }
    }
  });
  
  // Sortera barn och filer i varje nod
  sortTreeNodes(rootNodes);
  
  return rootNodes;
}

// Skapa en ny mapp
export function createFolder(
  parentId: string | null, 
  name: string, 
  existingNodes: FileNode[]
): FileNode {
  // Validera att mappnamnet är unikt i denna förälder
  const existingNames = existingNodes
    .filter(n => n.parent_id === parentId && n.type === 'folder')
    .map(n => n.name);
  
  let uniqueName = name;
  let counter = 1;
  
  // Om namnet redan finns, lägg till ett nummer
  while (existingNames.includes(uniqueName)) {
    uniqueName = `${name} (${counter})`;
    counter++;
  }
  
  // Hitta förälderns sökväg
  let parentPath = '';
  if (parentId) {
    const parent = existingNodes.find(n => n.id === parentId);
    if (parent) {
      parentPath = parent.path;
    }
  }
  
  // Skapa den nya mappen
  const newFolder: FileNode = {
    id: uuidv4(),
    name: uniqueName,
    type: 'folder',
    parent_id: parentId,
    path: parentPath ? `${parentPath}/${uniqueName}` : `/${uniqueName}`,
    created_at: new Date(),
    updated_at: new Date(),
  };
  
  return newFolder;
}

// Rekursiv funktion för att sortera alla noder i trädet
function sortTreeNodes(nodes: FileTreeNode[]): void {
  // Sortera mapparna i bokstavsordning
  nodes.sort((a, b) => a.name.localeCompare(b.name));
  
  // Sortera filer i varje mapp
  nodes.forEach(node => {
    node.files.sort((a, b) => a.name.localeCompare(b.name));
    
    // Rekursivt sortera undermappar
    if (node.children.length > 0) {
      sortTreeNodes(node.children);
    }
  });
}

// Hjälpfunktion för att expandera/minimera en mapp
export function toggleFolderExpanded(
  tree: FileTreeNode[], 
  folderId: string
): FileTreeNode[] {
  return tree.map(node => {
    if (node.id === folderId) {
      return { ...node, isExpanded: !node.isExpanded };
    }
    
    if (node.children.length > 0) {
      return {
        ...node,
        children: toggleFolderExpanded(node.children, folderId)
      };
    }
    
    return node;
  });
}

// Hitta en nod med ett visst ID i trädet
export function findNodeById(
  tree: FileTreeNode[], 
  nodeId: string
): FileTreeNode | null {
  for (const node of tree) {
    if (node.id === nodeId) {
      return node;
    }
    
    if (node.children.length > 0) {
      const foundInChildren = findNodeById(node.children, nodeId);
      if (foundInChildren) {
        return foundInChildren;
      }
    }
  }
  
  return null;
}

// Ta bort en nod från trädet
export function removeNodeFromTree(
  nodes: FileNode[], 
  nodeId: string
): FileNode[] {
  // Ta bort noden och alla dess barn rekursivt
  const nodesToRemove = new Set<string>();
  
  // Först, hitta alla ID:n som ska tas bort (noden och alla dess barn)
  function findNodesToRemove(id: string) {
    nodesToRemove.add(id);
    
    // Hitta alla barn till denna nod
    const children = nodes.filter(n => n.parent_id === id);
    children.forEach(child => {
      findNodesToRemove(child.id);
    });
  }
  
  findNodesToRemove(nodeId);
  
  // Returnera en ny lista utan de noder som ska tas bort
  return nodes.filter(node => !nodesToRemove.has(node.id));
}