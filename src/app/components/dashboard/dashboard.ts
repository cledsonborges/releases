import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ReleaseInfoComponent } from '../release-info/release-info';
import { DeliveryTableComponent } from '../delivery-table/delivery-table';
import { Release, ApiService } from '../../services/api.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    MatToolbarModule, 
    MatButtonModule, 
    MatIconModule,
    ReleaseInfoComponent,
    DeliveryTableComponent
  ],
  template: `
    <div class="dashboard-container">
      <!-- Header/Toolbar -->
      <mat-toolbar class="main-toolbar">
        <div class="toolbar-content">
          <div class="logo-section">
            <img src="assets/ion-logo.png" alt="íon Itaú" class="logo" />
          </div>
          
          <div class="nav-section">
            <button mat-button class="nav-btn">SALA DE INTEGRAÇÃO</button>
            <button mat-button class="nav-btn">Calendário</button>
            <button mat-button class="nav-btn">Dashboards</button>
            <button mat-button class="nav-btn">Validações</button>
            <button mat-button class="nav-btn">Módulo & Cobertura</button>
            <button mat-button class="nav-btn">Entregas</button>
            <button mat-button class="nav-btn">Wiki</button>
          </div>
          
          <div class="search-section">
            <mat-icon>search</mat-icon>
            <span>Buscar no site...</span>
          </div>
        </div>
      </mat-toolbar>

      <!-- Main Content -->
      <div class="main-content">
        <!-- Release Information -->
        <app-release-info [release]="currentRelease"></app-release-info>
        
        <!-- Navigation Links -->
        <div class="nav-links">
          <a href="#" class="nav-link">Hooper</a>
          <span> | </span>
          <a href="#" class="nav-link">Report Portal</a>
        </div>

        <!-- Delivery Table -->
        <app-delivery-table 
          [title]="'[Android]-R113'"
          [releaseId]="currentRelease?.id || 1">
        </app-delivery-table>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      min-height: 100vh;
      background-color: #f5f5f5;
    }

    .main-toolbar {
      background-color: #2c5f5f;
      color: white;
      height: 64px;
    }

    .toolbar-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
    }

    .logo-section .logo {
      height: 40px;
      width: auto;
    }

    .nav-section {
      display: flex;
      gap: 10px;
    }

    .nav-btn {
      color: white;
      font-size: 14px;
    }

    .nav-btn:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }

    .search-section {
      display: flex;
      align-items: center;
      gap: 8px;
      color: rgba(255, 255, 255, 0.7);
      cursor: pointer;
    }

    .main-content {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .nav-links {
      text-align: center;
      margin: 20px 0;
    }

    .nav-link {
      color: #1976d2;
      text-decoration: none;
      font-weight: 500;
    }

    .nav-link:hover {
      text-decoration: underline;
    }

    @media (max-width: 768px) {
      .toolbar-content {
        flex-direction: column;
        gap: 10px;
        padding: 10px 0;
      }

      .nav-section {
        flex-wrap: wrap;
        justify-content: center;
      }

      .main-content {
        padding: 10px;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  currentRelease: Release | null = null;

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadCurrentRelease();
  }

  loadCurrentRelease() {
    this.apiService.getReleases().subscribe({
      next: (releases) => {
        if (releases.length > 0) {
          this.currentRelease = releases[0]; // Pega a primeira release
        }
      },
      error: (error) => {
        console.error('Erro ao carregar release:', error);
      }
    });
  }
}

