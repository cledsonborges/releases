import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Release {
  id: number;
  version: string;
  release_number: number;
  firebase_version?: string;
  release_notes?: string;
  platform: string;
  created_at?: string;
  updated_at?: string;
}

export interface Squad {
  id: number;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Delivery {
  id: number;
  release_id: number;
  squad_id: number;
  squad_name?: string;
  module: string;
  detail?: string;
  responsible?: string;
  status: string;
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient) { }

  // Release endpoints
  getReleases(): Observable<Release[]> {
    return this.http.get<Release[]>(`${this.baseUrl}/releases`);
  }

  getRelease(id: number): Observable<Release> {
    return this.http.get<Release>(`${this.baseUrl}/releases/${id}`);
  }

  createRelease(release: Partial<Release>): Observable<Release> {
    return this.http.post<Release>(`${this.baseUrl}/releases`, release);
  }

  updateRelease(id: number, release: Partial<Release>): Observable<Release> {
    return this.http.put<Release>(`${this.baseUrl}/releases/${id}`, release);
  }

  deleteRelease(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/releases/${id}`);
  }

  // Squad endpoints
  getSquads(): Observable<Squad[]> {
    return this.http.get<Squad[]>(`${this.baseUrl}/squads`);
  }

  getSquad(id: number): Observable<Squad> {
    return this.http.get<Squad>(`${this.baseUrl}/squads/${id}`);
  }

  createSquad(squad: Partial<Squad>): Observable<Squad> {
    return this.http.post<Squad>(`${this.baseUrl}/squads`, squad);
  }

  updateSquad(id: number, squad: Partial<Squad>): Observable<Squad> {
    return this.http.put<Squad>(`${this.baseUrl}/squads/${id}`, squad);
  }

  deleteSquad(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/squads/${id}`);
  }

  // Delivery endpoints
  getDeliveries(): Observable<Delivery[]> {
    return this.http.get<Delivery[]>(`${this.baseUrl}/deliveries`);
  }

  getDelivery(id: number): Observable<Delivery> {
    return this.http.get<Delivery>(`${this.baseUrl}/deliveries/${id}`);
  }

  createDelivery(delivery: Partial<Delivery>): Observable<Delivery> {
    return this.http.post<Delivery>(`${this.baseUrl}/deliveries`, delivery);
  }

  updateDelivery(id: number, delivery: Partial<Delivery>): Observable<Delivery> {
    return this.http.put<Delivery>(`${this.baseUrl}/deliveries/${id}`, delivery);
  }

  deleteDelivery(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/deliveries/${id}`);
  }

  // Release deliveries
  getReleaseDeliveries(releaseId: number): Observable<Delivery[]> {
    return this.http.get<Delivery[]>(`${this.baseUrl}/releases/${releaseId}/deliveries`);
  }
}

