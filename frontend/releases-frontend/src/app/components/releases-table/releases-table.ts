import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Release } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-releases-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './releases-table.html',
  styleUrl: './releases-table.scss'
})
export class ReleasesTableComponent implements OnInit {
  releases: Release[] = [];
  filteredReleases: Release[] = [];
  loading: boolean = true;
  error: string | null = null;
  message: string = '';
  messageType: string = '';
  
  // Seleção de release
  selectedRelease: Release | null = null;
  
  // Filtros
  currentView: 'homolog' | 'alpha' = 'homolog';
  statusFilter: string = '';
  squadFilter: string = '';
  
  // Edição inline
  editingReleaseId: string | null = null;
  editingField: string | null = null;
  editingValue: string = '';
  
  // Status disponíveis
  statusOptions = [
    'em andamento',
    'concluído',
    'bloqueado',
    'concluido com bugs',
    'aguardando teste',
    'em teste',
    'aprovado',
    'rejeitado'
  ];

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Determinar a view baseada na rota
    this.route.url.subscribe(segments => {
      if (segments.length > 0) {
        const path = segments[0].path;
        if (path === 'alpha') {
          this.currentView = 'alpha';
        } else {
          this.currentView = 'homolog';
        }
      }
    });
    
    this.loadReleases();
  }

  loadReleases(): void {
    this.loading = true;
    this.error = null;
    
    this.apiService.getReleases().subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success && response.data) {
          this.releases = response.data;
          this.applyFilters();
        } else {
          this.error = 'Erro ao carregar releases';
        }
      },
      error: (error) => {
        this.loading = false;
        this.error = 'Erro de conexão ao carregar releases';
        console.error('Error loading releases:', error);
      }
    });
  }

  applyFilters(): void {
    this.filteredReleases = this.releases.filter(release => {
      // Filtro por ambiente (view atual)
      const matchesView = this.currentView === 'homolog' ? 
        (release.ambiente === 'homolog' || !release.ambiente) : 
        release.ambiente === 'alpha';
      
      // Filtro por status
      const matchesStatus = !this.statusFilter || release.status === this.statusFilter;
      
      // Filtro por squad
      const matchesSquad = !this.squadFilter || 
        (release.squad && release.squad.toLowerCase().includes(this.squadFilter.toLowerCase()));
      
      return matchesView && matchesStatus && matchesSquad;
    });
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  switchView(view: 'homolog' | 'alpha'): void {
    this.currentView = view;
    this.selectedRelease = null; // Limpar seleção ao trocar de view
    this.applyFilters();
    
    // Navegar para a rota correspondente
    if (view === 'alpha') {
      this.router.navigate(['/alpha']);
    } else {
      this.router.navigate(['/homolog']);
    }
  }

  selectRelease(release: Release): void {
    this.selectedRelease = release;
    // Navegar para a tela de detalhes da release
    this.router.navigate(['/release', release.release_id]);
  }

  startEdit(releaseId: string, field: string, currentValue: string): void {
    // Verificar se o usuário pode editar
    if (!this.canEdit()) {
      this.showMessage('Você não tem permissão para editar releases', 'error');
      return;
    }
    
    this.editingReleaseId = releaseId;
    this.editingField = field;
    this.editingValue = currentValue || '';
  }

  cancelEdit(): void {
    this.editingReleaseId = null;
    this.editingField = null;
    this.editingValue = '';
  }

  saveEdit(): void {
    if (!this.editingReleaseId || !this.editingField) {
      return;
    }

    const updateData = {
      [this.editingField]: this.editingValue
    };

    this.apiService.updateReleaseStatus(this.editingReleaseId, updateData).subscribe({
      next: (response) => {
        if (response.success) {
          // Atualizar a release local
          const release = this.releases.find(r => r.release_id === this.editingReleaseId);
          if (release) {
            (release as any)[this.editingField!] = this.editingValue;
          }
          
          this.showMessage('Status atualizado com sucesso!', 'success');
          this.cancelEdit();
          this.applyFilters();
        } else {
          this.showMessage(response.error || 'Erro ao atualizar status', 'error');
        }
      },
      error: (error) => {
        this.showMessage('Erro de conexão ao atualizar status', 'error');
        console.error('Error updating release:', error);
      }
    });
  }

  canEdit(): boolean {
    // Permitir edição para usuários autenticados
    return this.authService.isAuthenticated();
  }

  getStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'concluído':
      case 'aprovado':
        return 'status-success';
      case 'em andamento':
      case 'aguardando teste':
      case 'em teste':
        return 'status-warning';
      case 'bloqueado':
      case 'rejeitado':
        return 'status-error';
      case 'concluido com bugs':
        return 'status-warning-alt';
      default:
        return 'status-default';
    }
  }

  formatDate(dateString: string): string {
    if (!dateString) return '-';
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  goToAdmin(): void {
    this.router.navigate(['/admin']);
  }

  refreshData(): void {
    this.loadReleases();
  }

  exportToExcel(): void {
    // Implementar exportação para Excel
    this.showMessage('Funcionalidade de exportação em desenvolvimento', 'info');
  }

  showMessage(text: string, type: string): void {
    this.message = text;
    this.messageType = type;
    
    // Auto-hide message after 5 seconds
    setTimeout(() => {
      this.message = '';
      this.messageType = '';
    }, 5000);
  }

  getUniqueSquads(): string[] {
    const squads = this.releases
      .map(r => r.squad)
      .filter(squad => squad && squad.trim() !== '')
      .filter((squad, index, arr) => arr.indexOf(squad) === index);
    return squads as string[];
  }

  trackByReleaseId(index: number, release: Release): string {
    return release.release_id || index.toString();
  }
}

