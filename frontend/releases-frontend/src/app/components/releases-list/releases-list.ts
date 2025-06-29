import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService, Release } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-releases-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './releases-list.html',
  styleUrl: './releases-list.scss'
})
export class ReleasesListComponent implements OnInit {
  releases: Release[] = [];
  selectedRelease: Release | null = null;
  loading = true;
  error = '';
  dropdownOpen = false;
  
  // Dados do usuário atual
  currentUser: any = null;

  constructor(
    private router: Router,
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    this.loadReleases();
  }

  loadReleases() {
    this.loading = true;
    this.error = '';
    
    this.apiService.getReleases().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.releases = response.data.sort((a, b) => 
            new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
          );
          
          // Selecionar a primeira release por padrão
          if (this.releases.length > 0) {
            this.selectRelease(this.releases[0]);
          }
        } else {
          this.error = response.error || 'Erro ao carregar releases';
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erro ao conectar com a API';
        this.loading = false;
        console.error('Erro:', err);
      }
    });
  }

  selectRelease(release: Release) {
    this.selectedRelease = release;
    this.dropdownOpen = false; // Fechar dropdown após seleção
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }

  getReleaseDisplayName(release: Release): string {
    return `[${release.ambiente?.toUpperCase()}]-${release.release_name}`;
  }

  getReleaseVersion(release: Release): string {
    if (release.ambiente === 'homolog') {
      return release.versao_homolog || 'N/A';
    } else if (release.ambiente === 'alpha') {
      return release.versao_alpha || 'N/A';
    }
    return release.versao_homolog || release.versao_alpha || 'N/A';
  }

  getReleaseNumber(release: Release): string {
    return `Release ${release.release_id}`;
  }

  formatDate(dateString?: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR');
  }

  getSlaTimeRemaining(release: Release): string {
    if (!release.sla_start_time || !release.sla_duration_hours) {
      return '00:42:33'; // Valor padrão
    }

    const startTime = new Date(release.sla_start_time);
    const endTime = new Date(startTime.getTime() + (release.sla_duration_hours * 60 * 60 * 1000));
    const now = new Date();
    const remaining = endTime.getTime() - now.getTime();

    if (remaining <= 0) {
      return '00:00:00';
    }

    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  isQualityTeam(): boolean {
    return this.authService.getCurrentUser()?.role === 'quality_team';
  }

  isAdmin(): boolean {
    return this.authService.getCurrentUser()?.role === 'admin';
  }

  goToHomolog() {
    this.router.navigate(['/homolog']);
  }

  goToReportPortal() {
    // Implementar navegação para Report Portal
    window.open('https://report-portal-url.com', '_blank');
  }

  updateRelease() {
    if (this.selectedRelease) {
      this.loadReleases();
    }
  }

  exportToExcel() {
    if (this.selectedRelease) {
      // Implementar exportação para Excel
      console.log('Exportando para Excel:', this.selectedRelease);
    }
  }
}

