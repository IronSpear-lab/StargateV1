import apiService from './api';
import { Project, Task, TimeReport, ApiResponse, PaginatedResponse } from '../types';

// Projekt-service
const projectService = {
  // Hämta alla projekt
  async getProjects(params?: any): Promise<PaginatedResponse<Project>> {
    return await apiService.getPaginated<Project>('/projects/', params);
  },
  
  // Hämta specifikt projekt med ID
  async getProject(id: number): Promise<ApiResponse<Project>> {
    return await apiService.get<Project>(`/projects/${id}/`);
  },
  
  // Skapa nytt projekt
  async createProject(projectData: Partial<Project>): Promise<ApiResponse<Project>> {
    return await apiService.post<Project>('/projects/', projectData);
  },
  
  // Uppdatera projekt
  async updateProject(id: number, projectData: Partial<Project>): Promise<ApiResponse<Project>> {
    return await apiService.patch<Project>(`/projects/${id}/`, projectData);
  },
  
  // Ta bort projekt
  async deleteProject(id: number): Promise<ApiResponse<any>> {
    return await apiService.delete<any>(`/projects/${id}/`);
  },
  
  // Hämta uppgifter för ett projekt
  async getProjectTasks(projectId: number, params?: any): Promise<PaginatedResponse<Task>> {
    return await apiService.getPaginated<Task>('/tasks/', { project: projectId, ...params });
  },
  
  // Skapa ny uppgift för ett projekt
  async createTask(taskData: Partial<Task>): Promise<ApiResponse<Task>> {
    return await apiService.post<Task>('/tasks/', taskData);
  },
  
  // Uppdatera uppgift
  async updateTask(id: number, taskData: Partial<Task>): Promise<ApiResponse<Task>> {
    return await apiService.patch<Task>(`/tasks/${id}/`, taskData);
  },
  
  // Ta bort uppgift
  async deleteTask(id: number): Promise<ApiResponse<any>> {
    return await apiService.delete<any>(`/tasks/${id}/`);
  },
  
  // Hämta tidsrapporter för ett projekt
  async getProjectTimeReports(projectId: number, params?: any): Promise<PaginatedResponse<TimeReport>> {
    return await apiService.getPaginated<TimeReport>('/time-reports/', { project: projectId, ...params });
  },
  
  // Skapa tidsrapport
  async createTimeReport(timeReportData: Partial<TimeReport>): Promise<ApiResponse<TimeReport>> {
    return await apiService.post<TimeReport>('/time-reports/', timeReportData);
  },
  
  // Uppdatera tidsrapport
  async updateTimeReport(id: number, timeReportData: Partial<TimeReport>): Promise<ApiResponse<TimeReport>> {
    return await apiService.patch<TimeReport>(`/time-reports/${id}/`, timeReportData);
  },
  
  // Ta bort tidsrapport
  async deleteTimeReport(id: number): Promise<ApiResponse<any>> {
    return await apiService.delete<any>(`/time-reports/${id}/`);
  },
  
  // Hämta projektmedlemmar
  async getProjectMembers(projectId: number): Promise<ApiResponse<any>> {
    return await apiService.get<any>(`/projects/${projectId}/members/`);
  },
  
  // Lägg till medlem i projekt
  async addProjectMember(projectId: number, userId: number, role: string): Promise<ApiResponse<any>> {
    return await apiService.post<any>(`/projects/${projectId}/members/`, {
      user: userId,
      role: role
    });
  },
  
  // Uppdatera medlemsroll i projekt
  async updateProjectMemberRole(projectId: number, userId: number, role: string): Promise<ApiResponse<any>> {
    return await apiService.patch<any>(`/projects/${projectId}/members/${userId}/`, {
      role: role
    });
  },
  
  // Ta bort medlem från projekt
  async removeProjectMember(projectId: number, userId: number): Promise<ApiResponse<any>> {
    return await apiService.delete<any>(`/projects/${projectId}/members/${userId}/`);
  },
  
  // Hämta projektstatistik
  async getProjectStatistics(projectId: number): Promise<ApiResponse<any>> {
    return await apiService.get<any>(`/projects/${projectId}/statistics/`);
  }
};

export default projectService;