import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface Release {
  release_id?: string;
  release_name: string;
  ambiente: string;
  status: string;
  sla_start_time?: string;
  sla_duration_hours: number;
  sla_hours?: number; // Alias para sla_duration_hours
  sla_active?: boolean;
  sla_status?: string;
  liberado_em?: string;
  versao_homolog?: string;
  versao_firebase?: string;
  versao_alpha?: string;
  link_plano_testes?: string;
  qrcode_homolog?: string;
  qrcode_alpha?: string;
  release_exclusiva: boolean;
  squads_participantes: string[];
  entregas: any[];
  descricao?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Squad {
  squad_id?: string;
  squad_name: string;
  modulos: string[];
  responsavel?: string;
  ativo: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface User {
  user_id?: string;
  username: string;
  email: string;
  role: 'admin' | 'quality_team';
  ativo: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json'
    });
  }

  // Health Check
  healthCheck(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/health`);
  }

  // Authentication
  login(username: string): Observable<ApiResponse<{user: User, token: string}>> {
    return this.http.post<ApiResponse<{user: User, token: string}>>(`${this.baseUrl}/auth/login`, 
      { username }, 
      { headers: this.getHeaders() }
    );
  }

  // Database Initialization
  initDatabase(): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/init-db`, {}, 
      { headers: this.getHeaders() }
    );
  }

  // Releases
  getReleases(): Observable<ApiResponse<Release[]>> {
    return this.http.get<ApiResponse<Release[]>>(`${this.baseUrl}/releases`);
  }

  getRelease(releaseId: string): Observable<ApiResponse<Release>> {
    return this.http.get<ApiResponse<Release>>(`${this.baseUrl}/releases/${releaseId}`);
  }

  createRelease(release: Partial<Release>): Observable<ApiResponse<{release_id: string}>> {
    return this.http.post<ApiResponse<{release_id: string}>>(`${this.baseUrl}/releases`, 
      release, 
      { headers: this.getHeaders() }
    );
  }

  updateRelease(releaseId: string, release: Partial<Release>): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.baseUrl}/releases/${releaseId}`, 
      release, 
      { headers: this.getHeaders() }
    );
  }

  deleteRelease(releaseId: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/releases/${releaseId}`);
  }

  // SLA Management
  startSla(releaseId: string, durationHours: number = 24): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/releases/${releaseId}/sla/start`, 
      { duration_hours: durationHours }, 
      { headers: this.getHeaders() }
    );
  }

  stopSla(releaseId: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/releases/${releaseId}/sla/stop`, 
      {}, 
      { headers: this.getHeaders() }
    );
  }

  extendSla(releaseId: string, additionalHours: number): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/releases/${releaseId}/sla/extend`, 
      { additional_hours: additionalHours }, 
      { headers: this.getHeaders() }
    );
  }

  checkSlaStatus(releaseId: string): Observable<ApiResponse<{sla_status: string}>> {
    return this.http.get<ApiResponse<{sla_status: string}>>(`${this.baseUrl}/releases/${releaseId}/sla/status`);
  }

  // Release Notes
  generateReleaseNotes(releaseId: string): Observable<ApiResponse<{release_notes: string}>> {
    return this.http.post<ApiResponse<{release_notes: string}>>(`${this.baseUrl}/releases/${releaseId}/release-notes`, 
      {}, 
      { headers: this.getHeaders() }
    );
  }

  // Release Status Update (Quality Team)
  updateReleaseStatus(releaseId: string, statusData: any): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.baseUrl}/releases/${releaseId}/status`, 
      statusData, 
      { headers: this.getHeaders() }
    );
  }

  // Squads
  getSquads(): Observable<ApiResponse<Squad[]>> {
    return this.http.get<ApiResponse<Squad[]>>(`${this.baseUrl}/squads`);
  }

  getSquad(squadId: string): Observable<ApiResponse<Squad>> {
    return this.http.get<ApiResponse<Squad>>(`${this.baseUrl}/squads/${squadId}`);
  }

  createSquad(squad: Partial<Squad>): Observable<ApiResponse<{squad_id: string}>> {
    return this.http.post<ApiResponse<{squad_id: string}>>(`${this.baseUrl}/squads`, 
      squad, 
      { headers: this.getHeaders() }
    );
  }

  updateSquad(squadId: string, squad: Partial<Squad>): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.baseUrl}/squads/${squadId}`, 
      squad, 
      { headers: this.getHeaders() }
    );
  }

  deleteSquad(squadId: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/squads/${squadId}`);
  }

  createSquadsBulk(squads: Partial<Squad>[]): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/squads/bulk`, 
      squads, 
      { headers: this.getHeaders() }
    );
  }

  getActiveSquads(): Observable<ApiResponse<Squad[]>> {
    return this.http.get<ApiResponse<Squad[]>>(`${this.baseUrl}/squads/active`);
  }

  getAllModules(): Observable<ApiResponse<string[]>> {
    return this.http.get<ApiResponse<string[]>>(`${this.baseUrl}/squads/modules`);
  }

  // Reports
  getSquadsNotTesting(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/reports/squads-not-testing`);
  }

  getSlaStatusReport(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/reports/sla-status`);
  }

  getReleaseStatusReport(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/reports/release-status`);
  }

  getProductivityReport(startDate?: string, endDate?: string): Observable<ApiResponse<any>> {
    let url = `${this.baseUrl}/reports/productivity`;
    if (startDate && endDate) {
      url += `?start_date=${startDate}&end_date=${endDate}`;
    }
    return this.http.get<ApiResponse<any>>(url);
  }

  getDashboardSummary(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/reports/dashboard`);
  }
}

