import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ApiService, Release } from '../../services/api.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class DashboardComponent implements OnInit {
  currentUser: any = null;
  dashboardData: any = null;
  releases: Release[] = [];
  loading: boolean = true;
  error: string = '';
  apiConnected: boolean = false;

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
    private router: Router
  ) {
    this.currentUser = this.authService.currentUserValue;
    
    if (!this.currentUser) {
      this.router.navigate(['/login']);
    }
  }

  ngOnInit(): void {
    this.testApiConnection();
    this.loadDashboardData();
    this.loadReleases();
  }

  testApiConnection(): void {
    this.apiService.healthCheck().subscribe({
      next: (response) => {
        this.apiConnected = response.success;
        console.log('API Health Check:', response);
      },
      error: (error) => {
        this.apiConnected = false;
        console.error('API Health Check Error:', error);
      }
    });
  }

  loadDashboardData(): void {
    this.apiService.getDashboardSummary().subscribe({
      next: (response) => {
        if (response.success) {
          this.dashboardData = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
      }
    });
  }

  loadReleases(): void {
    this.loading = true;
    this.error = '';
    
    this.apiService.getReleases().subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success) {
          this.releases = response.data || [];
        } else {
          this.error = response.error || 'Erro ao carregar releases';
        }
      },
      error: (error) => {
        this.loading = false;
        this.error = 'Erro de conexão com a API';
        console.error('Error loading releases:', error);
      }
    });
  }

  navigateToReleases(): void {
    this.router.navigate(['/releases']);
  }

  navigateToAdmin(): void {
    this.router.navigate(['/admin']);
  }

  navigateToReports(): void {
    this.router.navigate(['/reports']);
  }

  navigateToReleaseDetail(releaseId: string): void {
    this.router.navigate(["/release", releaseId]);
  }

  navigateToHomolog(): void {
    this.router.navigate(['/homolog']);
  }

  navigateToAlpha(): void {
    this.router.navigate(['/alpha']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'concluído':
        return 'status-concluido';
      case 'em andamento':
        return 'status-em-andamento';
      case 'bloqueado':
        return 'status-bloqueado';
      case 'concluido com bugs':
        return 'status-concluido-com-bugs';
      default:
        return 'status-em-andamento';
    }
  }

  getSlaClass(release: Release): string {
    if (release.sla_status === 'active') {
      return 'sla-active';
    } else if (release.sla_status === 'expired') {
      return 'sla-expired';
    } else {
      return 'sla-stopped';
    }
  }

  getSlaText(release: Release): string {
    if (release.sla_status === 'active') {
      return 'SLA Ativo';
    } else if (release.sla_status === 'expired') {
      return 'SLA Vencido';
    } else {
      return 'SLA Parado';
    }
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  isQualityTeam(): boolean {
    return this.authService.isQualityTeam();
  }
}

