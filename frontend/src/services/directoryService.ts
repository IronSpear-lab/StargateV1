import axios from 'axios';
import { API_BASE_URL, DIRECT_API_URL } from '../config';

// Cache för att spara hämtad data
const directoryCache: Record<string, { data: any, timestamp: number }> = {};
const CACHE_EXPIRY = 5000; // Cache-livslängd i millisekunder (5 sekunder) - kortare cache för att säkerställa aktuell data

// Interface för Directory/Filsystemsobjekt
export interface ApiDirectory {
  id: number;
  name: string;
  slug: string | null;
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
  // Hämta alla directorys för sidebar, filtrerade på projekt
  getSidebarDirectories: async (projectId?: string): Promise<ApiDirectory[]> => {
    try {
      // Validera projekt-ID först - bara numeriska värden fungerar med backend
      let validProjectId = projectId;
      
      // Om det är ett icke-numeriskt ID, konvertera det till ett giltigt ID
      if (projectId && isNaN(parseInt(projectId, 10))) {
        console.warn('Ogiltigt projekt-ID format i getSidebarDirectories:', projectId);
        // Använd fallback till projekt 1 (första projektet) - detta är viktigt för kompatibilitet med backend
        validProjectId = '1';
      }
      
      // Skapa params objekt baserat på om vi har ett projektId eller inte
      const params: Record<string, string> = { 
        is_sidebar: 'true' 
      };
      
      // Lägg till projektfiltrering om projektId är angivet och giltigt
      if (validProjectId) {
        params.project = validProjectId;
      }
      
      // Skapa cache-nyckel baserat på parametrarna
      const cacheKey = `sidebar_directories_${JSON.stringify(params)}`;
      
      // Kontrollera om vi har aktuell data i cachen
      const cachedData = directoryCache[cacheKey];
      const now = Date.now();
      
      if (cachedData && (now - cachedData.timestamp < CACHE_EXPIRY)) {
        console.log('Hämtar mappdata från cache för projekt:', validProjectId);
        return cachedData.data;
      }
      
      // Försök med vanlig proxy-anslutning
      try {
        console.log('Hämtar mappdata från API för projekt:', validProjectId);
        const response = await axios.get(`${API_BASE_URL}/files/directories/`, {
          params: params
        });
        
        const data = {
          directories: response.data.results || [],
          meta: {
            count: response.data.count || 0,
            next: response.data.next || null,
            previous: response.data.previous || null,
            source: 'proxy'
          }
        };
        
        if (cacheKey && response.data.results) {
          directoryCache[cacheKey] = {
            data: response.data.results,
            timestamp: Date.now()
          };
        }
        
        return data.directories;
      } catch (proxyError: any) {
        console.warn('Kunde inte hämta mappar via proxy, försöker med direkt anslutning', proxyError);
        
        const statusCode = proxyError.response?.status;
        const isNetworkError = !proxyError.response || proxyError.code === 'ECONNABORTED';
        const isServerError = statusCode >= 500 && statusCode < 600;
        const isNotFoundError = statusCode === 404;
        
        if (!isNetworkError && !isServerError && !isNotFoundError) {
          console.error('API-fel (inte nätverksrelaterat):', proxyError);
          throw proxyError;
        }
        
        // Om det är ett nätverksfel, försök med direktanslutning
        const directResponse = await axios.get(`${DIRECT_API_URL}/files/directories/`, {
          params: params,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          },
          // Sätt timeout för direktanslutning
          timeout: 10000
        });
        
        const data = {
          directories: directResponse.data.results || [],
          meta: {
            count: directResponse.data.count || 0,
            next: directResponse.data.next || null,
            previous: directResponse.data.previous || null,
            source: 'direct'
          }
        };
        
        if (cacheKey && directResponse.data.results) {
          directoryCache[cacheKey] = {
            data: directResponse.data.results,
            timestamp: Date.now()
          };
        }
        
        return data.directories;
      }
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

  // Skapa ett nytt directory med koppling till aktuellt projekt
  createDirectory: async (directory: DirectoryInput, projectId?: string): Promise<ApiDirectory> => {
    try {
      // Skapa en kopia av directory-objektet för att inte modifiera originalet
      let dirData = { ...directory };
      
      // Hantera projekt-kopplingen dynamiskt baserat på vilket projekt som är aktivt
      if (projectId && projectId !== 'null' && projectId !== 'undefined') {
        try {
          // Konvertera projektet-ID till ett nummer och använd det direkt
          const currentProjectId = parseInt(projectId, 10);
          
          // Validera att vi har ett giltigt projekt-ID som är större än 0
          if (!isNaN(currentProjectId) && currentProjectId > 0) {
            console.log(`Kopplar mapp till aktuellt projekt med ID ${currentProjectId}`);
            dirData.project = currentProjectId;
          } else {
            // Fallback om projekt-ID är ogiltigt
            console.warn('Ogiltigt projekt-ID:', projectId);
            dirData.project = 1; // Använd projekt 1 som fallback
          }
        } catch (error) {
          console.error('Kunde inte tolka projekt-ID:', projectId);
          // Fallback till projekt 1 om vi inte kan tolka ID:et
          dirData.project = 1;
        }
      } else {
        // Ta bort project-attributet helt istället för att sätta det till null
        if ('project' in dirData) {
          delete dirData.project;
        }
      }
      
      console.log('Försöker skapa mapp med data:', dirData);
      
      // Försök med API-anropet
      try {
        // Vi använder bara den primära metoden nu för att minska komplexiteten
        const response = await axios.post(`${API_BASE_URL}/files/directories/`, dirData);
        console.log('Mapp skapad via API:', response.data);
        return response.data;
      } catch (error: any) {
        console.error('Fel vid kommunikation med backend-API:', error);
        
        // Felmeddelande för användaren
        if (error.response) {
          console.error('API svarade med fel:', error.response.data);
        }
        
        // Returnera förkastningen för att hantera i UI
        throw error;
      }
    } catch (error: any) {
      console.error('Fel vid skapande av mapp:', error);
      // För att underlätta debugging - visa mer detaljer i konsollen
      if (error.response) {
        console.error('API response data:', error.response.data);
        console.error('API response status:', error.response.status);
      }
      throw error; // Kasta vidare felet så att komponenten kan hantera det
    }
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
