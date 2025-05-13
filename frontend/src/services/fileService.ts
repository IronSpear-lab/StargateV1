import apiService from './api';
import { Directory, File, ApiResponse, PaginatedResponse } from '../types';

// Fil-service
const fileService = {
  // Hämta alla mappar för ett projekt
  async getDirectories(projectId: number): Promise<PaginatedResponse<Directory>> {
    return await apiService.getPaginated<Directory>('/directories/', { project: projectId });
  },
  
  // Hämta en specifik mapp
  async getDirectory(id: number): Promise<ApiResponse<Directory>> {
    return await apiService.get<Directory>(`/directories/${id}/`);
  },
  
  // Skapa ny mapp
  async createDirectory(directoryData: Partial<Directory>): Promise<ApiResponse<Directory>> {
    return await apiService.post<Directory>('/directories/', directoryData);
  },
  
  // Uppdatera mapp
  async updateDirectory(id: number, directoryData: Partial<Directory>): Promise<ApiResponse<Directory>> {
    return await apiService.patch<Directory>(`/directories/${id}/`, directoryData);
  },
  
  // Ta bort mapp
  async deleteDirectory(id: number): Promise<ApiResponse<any>> {
    return await apiService.delete<any>(`/directories/${id}/`);
  },
  
  // Hämta alla filer i en mapp
  async getFiles(directoryId?: number, projectId?: number): Promise<PaginatedResponse<File>> {
    const params: any = {};
    if (directoryId) params.directory = directoryId;
    if (projectId) params.project = projectId;
    
    return await apiService.getPaginated<File>('/files/', params);
  },
  
  // Hämta en specifik fil
  async getFile(id: number): Promise<ApiResponse<File>> {
    return await apiService.get<File>(`/files/${id}/`);
  },
  
  // Ladda upp fil
  async uploadFile(file: globalThis.File, directoryId?: number, projectId?: number): Promise<ApiResponse<File>> {
    const additionalData: Record<string, any> = {};
    if (directoryId) additionalData.directory = directoryId;
    if (projectId) additionalData.project = projectId;
    
    return await apiService.uploadFile<File>('/files/', file, additionalData);
  },
  
  // Uppdatera fil (skapa ny version)
  async updateFile(id: number, file: globalThis.File): Promise<ApiResponse<File>> {
    return await apiService.uploadFile<File>(`/files/${id}/`, file);
  },
  
  // Ta bort fil
  async deleteFile(id: number): Promise<ApiResponse<any>> {
    return await apiService.delete<any>(`/files/${id}/`);
  },
  
  // Hämta alla versioner av en fil
  async getFileVersions(id: number): Promise<ApiResponse<File[]>> {
    return await apiService.get<File[]>(`/files/${id}/versions/`);
  },
  
  // Hämta filträdstruktur för ett projekt
  async getFileTree(projectId: number): Promise<ApiResponse<any>> {
    return await apiService.get<any>(`/projects/${projectId}/file-tree/`);
  },
  
  // Hämta nerladdningslänk för en fil
  getDownloadUrl(fileId: number): string {
    const token = localStorage.getItem('token');
    return `${apiService.baseURL}/files/${fileId}/download/?token=${token}`;
  }
};

export default fileService;