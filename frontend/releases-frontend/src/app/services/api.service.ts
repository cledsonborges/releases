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
  squad?: string;
  versao_homolog?: string;
  versao_firebase?: string;
  responsavel?: string;
  status: string;
  descricao?: string;
  ambiente?: string;
  sla_start_time?: string;
  sla_duration_hours?: number;
  sla_hours?: number; // Alias para sla_duration_hours
  sla_active?: boolean;
  sla_status?: string;
  liberado_em?: string;
  versao_alpha?: string;
  link_plano_testes?: string;
  qrcode_homolog?: string;
  qrcode_alpha?: string;
  release_exclusiva?: boolean;
  squads_participantes?: string[];
  entregas?: any[];
  created_at?: string;
  updated_at?: string;
  release_notes?: string;
  detalhe_entrega?: string;
  modulo?: string;
  bugs_reportados?: number;
}

export interface Squad {
  squad_id?: string;
  squad_name: string;
  modulos?: string[];
  responsavel?: string;
  ativo?: boolean;
  descricao?: string;
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

export interface ReleaseTestData {
  test_data_id?: string;
  release_id: string;
  user_id: string;
  username: string;
  status: string;
  modulo: string;
  responsavel: string;
  detalhe_entrega: string;
  bugs_reportados: number;
  tempo_teste_horas: number;
  observacoes: string;
  data_inicio_teste?: string;
  data_fim_teste?: string;
  ambiente: string;
  created_at?: string;
  updated_at?: string;
}

export interface TestDataSummary {
  total_testers: number;
  status_count: { [key: string]: number };
  total_bugs: number;
  total_test_hours: number;
  modules_tested: string[];
  testers_by_status: { [key: string]: any[] };
}

export interface SquadDelivery {
  squad_id: string;
  squad_name: string;
  detalhe_entrega: string;
  responsavel: string;
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
   private baseUrl = 'https://releases-three.vercel.app/api';

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

  getSquadDeliveries(releaseId: string): Observable<ApiResponse<SquadDelivery[]>> {
    return this.http.get<ApiResponse<SquadDelivery[]>>(`${this.baseUrl}/releases/${releaseId}/squad-deliveries`);
  }

  // Release Test Data Management
  getReleaseTestData(releaseId: string): Observable<ApiResponse<ReleaseTestData[]>> {
    return this.http.get<ApiResponse<ReleaseTestData[]>>(`${this.baseUrl}/releases/${releaseId}/test-data`);
  }

  getUserTestData(releaseId: string, userId: string): Observable<ApiResponse<ReleaseTestData>> {
    return this.http.get<ApiResponse<ReleaseTestData>>(`${this.baseUrl}/releases/${releaseId}/test-data/user/${userId}`);
  }

  createOrUpdateUserTestData(releaseId: string, userId: string, testData: Partial<ReleaseTestData>): Observable<ApiResponse<{test_data_id: string}>> {
    return this.http.post<ApiResponse<{test_data_id: string}>>(`${this.baseUrl}/releases/${releaseId}/test-data/user/${userId}`, 
      testData, 
      { headers: this.getHeaders() }
    );
  }

  getTestDataSummary(releaseId: string): Observable<ApiResponse<TestDataSummary>> {
    return this.http.get<ApiResponse<TestDataSummary>>(`${this.baseUrl}/releases/${releaseId}/test-data/summary`);
  }

  deleteTestData(releaseId: string, testDataId: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/releases/${releaseId}/test-data/${testDataId}`);
  }

  deleteAllReleaseTestData(releaseId: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/releases/${releaseId}/test-data`);
  }

  bulkCreateTestData(releaseId: string, testDataList: Partial<ReleaseTestData>[]): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/releases/${releaseId}/test-data/bulk`, 
      testDataList, 
      { headers: this.getHeaders() }
    );
  }

  // Simplified Releases API
  getSimplifiedReleases(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.baseUrl}/simplified-releases`);
  }

  getSimplifiedRelease(releaseId: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/simplified-releases/${releaseId}`);
  }

  createSimplifiedRelease(release: any): Observable<ApiResponse<{release_id: string}>> {
    return this.http.post<ApiResponse<{release_id: string}>>(`${this.baseUrl}/simplified-releases`, 
      release, 
      { headers: this.getHeaders() }
    );
  }

  updateSimplifiedRelease(releaseId: string, release: any): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.baseUrl}/simplified-releases/${releaseId}`, 
      release, 
      { headers: this.getHeaders() }
    );
  }

  // Squad Status API
  createSquadStatus(releaseId: string, squadData: any): Observable<ApiResponse<{squad_status_id: string}>> {
    return this.http.post<ApiResponse<{squad_status_id: string}>>(`${this.baseUrl}/simplified-releases/${releaseId}/squad-status`, 
      squadData, 
      { headers: this.getHeaders() }
    );
  }

  updateSquadStatus(squadStatusId: string, updateData: any): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.baseUrl}/simplified-releases/squad-status/${squadStatusId}`, 
      updateData, 
      { headers: this.getHeaders() }
    );
  }

  getSquadStatusesByRelease(releaseId: string): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.baseUrl}/simplified-releases/${releaseId}/squad-status`);
  }

  // Initialize Simplified Database
  initSimplifiedDatabase(): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/init-simplified-db`, {}, 
      { headers: this.getHeaders() }
    );
  }

  // Release Test Status API
  getReleaseTestStatuses(releaseId: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/releases/${releaseId}/test-status`);
  }

  createOrUpdateTestStatus(releaseId: string, testStatusData: any): Observable<ApiResponse<{test_status_id: string}>> {
    return this.http.post<ApiResponse<{test_status_id: string}>>(`${this.baseUrl}/releases/${releaseId}/test-status`, 
      testStatusData, 
      { headers: this.getHeaders() }
    );
  }

  getSquadTestStatus(releaseId: string, squadName: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/releases/${releaseId}/test-status/${squadName}`);
  }

  updateTestStatus(testStatusId: string, updateData: any): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.baseUrl}/test-status/${testStatusId}`, 
      updateData, 
      { headers: this.getHeaders() }
    );
  }

  deleteTestStatus(testStatusId: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/test-status/${testStatusId}`);
  }

  getTestStatusSummary(releaseId: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/releases/${releaseId}/test-status/summary`);
  }

  initTestStatusDatabase(): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/init-test-status-db`, {}, 
      { headers: this.getHeaders() }
    );
  }
}


