import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

interface SimplifiedRelease {
  release_id: string;
  release_name: string;
  squad: string;
  responsavel: string;
  status: string;
  created_at: string;
  updated_at: string;
}

@Component({
  selector: 'app-simplified-releases-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './simplified-releases-list.html',
  styleUrl: './simplified-releases-list.scss'
})
export class SimplifiedReleasesListComponent implements OnInit {
  releases: SimplifiedRelease[] = [];
  filteredReleases: SimplifiedRelease[] = [];
  loading = true;
  error = '';
  success = '';
  
  // Filtros
  statusFilter = '';
  squadFilter = '';
  
  // Status disponíveis
  statusOptions = [
    { value: '', label: 'Todos os status' },
    { value: 'em_andamento', label: 'Em Andamento', color: '#f59e0b' },
    { value: 'concluido', label: 'Concluído', color: '#10b981' },
    { value: 'concluido_com_bugs', label: 'Concluído com Bugs', color: '#f97316' },
    { value: 'bloqueado', label: 'Bloqueado', color: '#ef4444' }
  ];

  constructor(
    private router: Router,
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadReleases();
  }

  loadReleases() {
    this.loading = true;
    this.error = '';
    
    this.apiService.getSimplifiedReleases().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.releases = response.data;
          this.applyFilters();
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

  applyFilters() {
    this.filteredReleases = this.releases.filter(release => {
      const statusMatch = !this.statusFilter || release.status === this.statusFilter;
      const squadMatch = !this.squadFilter || release.squad.toLowerCase().includes(this.squadFilter.toLowerCase());
      
      return statusMatch && squadMatch;
    });
  }

  onFilterChange() {
    this.applyFilters();
  }

  clearFilters() {
    this.statusFilter = '';
    this.squadFilter = '';
    this.applyFilters();
  }

  viewRelease(releaseId: string) {
    this.router.navigate(['/simplified-release', releaseId]);
  }

  createNewRelease() {
    this.router.navigate(['/create-simplified-release']);
  }

  getStatusColor(status: string): string {
    const statusOption = this.statusOptions.find(s => s.value === status);
    return statusOption?.color || '#6b7280';
  }

  getStatusLabel(status: string): string {
    const statusOption = this.statusOptions.find(s => s.value === status);
    return statusOption?.label || status;
  }

  canCreate(): boolean {
    const user = this.authService.getCurrentUser();
    return !!user && (user.role === 'admin' || user.role === 'quality_team');
  }

  initializeDatabase() {
    this.apiService.initSimplifiedDatabase().subscribe({
      next: (response) => {
        if (response.success) {
          this.success = 'Banco de dados simplificado inicializado com sucesso!';
          setTimeout(() => {
            this.success = '';
          }, 3000);
        } else {
          this.error = response.error || 'Erro ao inicializar banco de dados';
        }
      },
      error: (err) => {
        this.error = 'Erro ao conectar com a API';
        console.error('Erro:', err);
      }
    });
  }
}


