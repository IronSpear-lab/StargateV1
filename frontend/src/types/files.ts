// Typ för varje nod i trädet - kan vara en mapp eller fil
export interface FileNode {
  id: string;
  name: string;
  type: 'folder' | 'file';
  parent_id: string | null; // null för root-nivå
  path: string; // Komplett sökväg t.ex. "/Projects/Project A/Documents"
  created_at: Date;
  updated_at: Date;
  size?: number; // bara för filer
  file_type?: string; // bara för filer (t.ex. "pdf", "docx")
  url?: string; // bara för filer
}

// Filsystem som träd med barn (för hierarkisk visning)
export interface FileTreeNode extends FileNode {
  children: FileTreeNode[];
  files: FileNode[];
  isExpanded?: boolean;
  level: number;
}

// Sorteringsalternativ för filer/mappar
export type SortOption = 'name' | 'date' | 'size' | 'type';
export type SortDirection = 'asc' | 'desc';