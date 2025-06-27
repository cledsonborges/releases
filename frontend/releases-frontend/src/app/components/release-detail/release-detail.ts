import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Release, Squad } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-release-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './release-detail.html',
  styleUrl: './release-detail.scss'
})
export class ReleaseDetailComponent implements OnInit {
  release: Release | null = null;
  squads: Squad[] = [];
  loading = true;
  error = '';
  success = '';
  
  // Dados editáveis para o time de qualidade
  editableData = {
    status: '',
    detalhe_entrega: '',
    responsavel: '',
    modulo: '',
    bugs_reportados: 0
  };

  // Status disponíveis
  statusOptions = [
    { value: 'pendente', label: 'Pendente', color: '#fbbf24' },
    { value: 'em_andamento', label: 'Em Andamento', color: '#f59e0b' },
    { value: 'finalizado', label: 'Finalizado', color: '#10b981' },
    { value: 'com_problemas', label: 'Com Problemas', color: '#ef4444' },
    { value: 'bloqueado', label: 'Bloqueado', color: '#6b7280' }
  ];

  // Controle de SLA
  slaExtensionHours = 0;
  showSlaExtension = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const releaseId = params['id'];
      if (releaseId) {
        this.loadReleaseDetails(releaseId);
      } else {
        // Se não há ID, verificar se é uma rota de ambiente (homolog/alpha)
        const path = this.route.snapshot.url[0]?.path;
        if (path === 'homolog' || path === 'alpha') {
          this.loadEnvironmentReleases(path);
        }
      }
    });
    
    this.loadSquads();
  }

  loadReleaseDetails(releaseId: string) {
    this.loading = true;
    this.error = '';
    
    this.apiService.getRelease(releaseId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.release = response.data;
          this.initializeEditableData();
        } else {
          this.error = response.error || 'Erro ao carregar detalhes da release';
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

  loadEnvironmentReleases(environment: string) {
    this.loading = true;
    this.error = '';
    
    this.apiService.getReleases().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          // Filtrar releases do ambiente específico
          const environmentReleases = response.data.filter(r => 
            r.ambiente?.toLowerCase() === environment
          );
          
          if (environmentReleases.length > 0) {
            // Pegar a release mais recente
            this.release = environmentReleases.sort((a, b) => 
              new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
            )[0];
            this.initializeEditableData();
          } else {
            this.error = `Nenhuma release encontrada para o ambiente ${environment}`;
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

  loadSquads() {
    this.apiService.getSquads().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.squads = response.data;
        }
      },
      error: (err) => {
        console.error('Erro ao carregar squads:', err);
      }
    });
  }

  initializeEditableData() {
    if (this.release) {
      this.editableData = {
        status: this.release.status || 'pendente',
        detalhe_entrega: (this.release as any).detalhe_entrega || '',
        responsavel: (this.release as any).responsavel || '',
        modulo: (this.release as any).modulo || '',
        bugs_reportados: (this.release as any).bugs_reportados || 0
      };
    }
  }

  updateReleaseStatus() {
    if (!this.release?.release_id) return;

    this.loading = true;
    this.error = '';
    this.success = '';

    this.apiService.updateReleaseStatus(this.release.release_id, this.editableData).subscribe({
      next: (response) => {
        if (response.success) {
          this.success = 'Status atualizado com sucesso!';
          // Recarregar os dados da release
          this.loadReleaseDetails(this.release!.release_id!);
        } else {
          this.error = response.error || 'Erro ao atualizar status';
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

  startSla() {
    if (!this.release?.release_id) return;

    this.loading = true;
    this.error = '';
    this.success = '';

    const duration = this.release.sla_duration_hours || 24;
    
    this.apiService.startSla(this.release.release_id, duration).subscribe({
      next: (response) => {
        if (response.success) {
          this.success = 'SLA iniciado com sucesso!';
          this.loadReleaseDetails(this.release!.release_id!);
        } else {
          this.error = response.error || 'Erro ao iniciar SLA';
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

  stopSla() {
    if (!this.release?.release_id) return;

    this.loading = true;
    this.error = '';
    this.success = '';

    this.apiService.stopSla(this.release.release_id).subscribe({
      next: (response) => {
        if (response.success) {
          this.success = 'SLA parado com sucesso!';
          this.loadReleaseDetails(this.release!.release_id!);
        } else {
          this.error = response.error || 'Erro ao parar SLA';
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

  extendSla() {
    if (!this.release?.release_id || this.slaExtensionHours <= 0) return;

    this.loading = true;
    this.error = '';
    this.success = '';

    this.apiService.extendSla(this.release.release_id, this.slaExtensionHours).subscribe({
      next: (response) => {
        if (response.success) {
          this.success = `SLA estendido em ${this.slaExtensionHours} horas!`;
          this.showSlaExtension = false;
          this.slaExtensionHours = 0;
          this.loadReleaseDetails(this.release!.release_id!);
        } else {
          this.error = response.error || 'Erro ao estender SLA';
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

  generateReleaseNotes() {
    if (!this.release?.release_id) return;

    this.loading = true;
    this.error = '';
    this.success = '';

    this.apiService.generateReleaseNotes(this.release.release_id).subscribe({
      next: (response) => {
        if (response.success) {
          this.success = 'Release notes geradas com sucesso!';
          this.loadReleaseDetails(this.release!.release_id!);
        } else {
          this.error = response.error || 'Erro ao gerar release notes';
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

  getStatusColor(status: string): string {
    const statusOption = this.statusOptions.find(s => s.value === status);
    return statusOption?.color || '#6b7280';
  }

  getStatusLabel(status: string): string {
    const statusOption = this.statusOptions.find(s => s.value === status);
    return statusOption?.label || status;
  }

  getSlaStatusColor(slaStatus: string): string {
    switch (slaStatus) {
      case 'active': return '#10b981';
      case 'warning': return '#f59e0b';
      case 'expired': return '#ef4444';
      default: return '#6b7280';
    }
  }

  getSlaStatusLabel(slaStatus: string): string {
    switch (slaStatus) {
      case 'active': return 'Ativo';
      case 'warning': return 'Atenção';
      case 'expired': return 'Vencido';
      default: return 'Inativo';
    }
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('pt-BR');
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }

  isQualityTeam(): boolean {
    return this.authService.getCurrentUser()?.role === 'quality_team';
  }

  isAdmin(): boolean {
    return this.authService.getCurrentUser()?.role === 'admin';
  }

  getSquadName(squadId: string): string {
    const squad = this.squads.find(s => s.squad_id === squadId);
    return squad ? squad.squad_name : squadId;
  }

  clearMessages() {
    this.error = '';
    this.success = '';
  }
}

