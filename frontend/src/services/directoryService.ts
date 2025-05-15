import axios from 'axios';
import { API_BASE_URL } from '../config';

// Interface för Directory/Filsystemsobjekt
export interface ApiDirectory {
  id: number;
  name: string;
  parent: number | null;
  project: number | null;
  type: string;
  is_sidebar_item: boolean;
  created_at: string;
  updated_at: string;
}

// Interface för att skapa/uppdatera Directory
export interface DirectoryInput {
  name: string;
  parent?: number | null;
  project?: number | null;
  type?: string;
  is_sidebar_item?: boolean;
}

// Service för att hantera directories (mappar) via API
const directoryService = {
  // Hämta alla directorys för sidebar
  getSidebarDirectories: async (): Promise<ApiDirectory[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/files/directories/`, {
        params: { is_sidebar: 'true' }
      });
      // API svarar med en results-array om pagination är aktiverad
      if (response.data.results) {
        return response.data.results;
      }
      return response.data;
    } catch (error) {
      console.error('Error fetching sidebar directories:', error);
      return [];
    }
  },

  // Hämta ett directory med ID
  getDirectory: async (id: number): Promise<ApiDirectory | null> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/files/directories/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching directory with id ${id}:`, error);
      return null;
    }
  },

  // Skapa ett nytt directory
  createDirectory: async (directory: DirectoryInput): Promise<ApiDirectory> => {
    // Vidarebefordra eventuella fel till den anropande komponenten
    const response = await axios.post(`${API_BASE_URL}/files/directories/`, directory);
    return response.data;
  },

  // Uppdatera ett directory
  updateDirectory: async (id: number, directory: DirectoryInput): Promise<ApiDirectory | null> => {
    try {
      const response = await axios.put(`${API_BASE_URL}/files/directories/${id}/`, directory);
      return response.data;
    } catch (error) {
      console.error(`Error updating directory with id ${id}:`, error);
      return null;
    }
  },

  // Ta bort ett directory
  deleteDirectory: async (id: number): Promise<boolean> => {
    try {
      await axios.delete(`${API_BASE_URL}/files/directories/${id}/`);
      return true;
    } catch (error) {
      console.error(`Error deleting directory with id ${id}:`, error);
      return false;
    }
  }
};

export default directoryService;