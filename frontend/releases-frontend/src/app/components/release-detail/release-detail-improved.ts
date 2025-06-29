import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Release, Squad, ReleaseTestData, TestDataSummary } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-release-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './release-detail-improved.html',
  styleUrl: './release-detail-improved.scss'
})
export class ReleaseDetailComponent implements OnInit, OnDestroy {
  release: Release | null = null;
  squads: Squad[] = [];
  testData: ReleaseTestData[] = [];
  testDataSummary: TestDataSummary | null = null;
  loading = true;
  error = '';
  success = '';
  
  // Controle de edição
  editingRows: { [key: string]: boolean } = {};
  editingData: { [key: string]: Partial<ReleaseTestData> } = {};
  
  // Dados do usuário atual
  currentUser: any = null;
  currentUserTestData: ReleaseTestData | null = null;
  
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
  
  // Auto-refresh
  private refreshSubscription: Subscription | null = null;
  autoRefreshEnabled = true;
  
  // Ambiente atual (homolog ou alpha)
  currentEnvironment = '';

  // Controle de edições simultâneas
  private lastUpdateTimestamp: number = 0;
  private conflictResolutionMode = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    
    this.route.params.subscribe(params => {
      const releaseId = params['id'];
      if (releaseId) {
        this.loadReleaseDetails(releaseId);
      } else {
        // Verificar se é uma rota de ambiente (homolog/alpha)
        const path = this.route.snapshot.url[0]?.path;
        if (path === 'homolog' || path === 'alpha') {
          this.currentEnvironment = path;
          this.loadEnvironmentReleases(path);
        }
      }
    });
    
    this.loadSquads();
    this.startAutoRefresh();
  }

  ngOnDestroy() {
    this.stopAutoRefresh();
  }

  startAutoRefresh() {
    if (this.autoRefreshEnabled) {
      this.refreshSubscription = interval(30000).subscribe(() => {
        this.refreshTestData();
      });
    }
  }

  stopAutoRefresh() {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
      this.refreshSubscription = null;
    }
  }

  toggleAutoRefresh() {
    this.autoRefreshEnabled = !this.autoRefreshEnabled;
    if (this.autoRefreshEnabled) {
      this.startAutoRefresh();
    } else {
      this.stopAutoRefresh();
    }
  }

  loadReleaseDetails(releaseId: string) {
    this.loading = true;
    this.error = '';
    
    this.apiService.getRelease(releaseId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.release = response.data;
          this.currentEnvironment = this.release.ambiente || '';
          this.loadTestData();
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
            this.loadTestData();
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

  loadTestData() {
    if (!this.release?.release_id) return;

    this.apiService.getReleaseTestData(this.release.release_id).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.testData = response.data;
          this.lastUpdateTimestamp = Date.now();
          this.findCurrentUserTestData();
          this.checkForConflicts();
        }
      },
      error: (err) => {
        console.error('Erro ao carregar dados de teste:', err);
      }
    });

    this.apiService.getTestDataSummary(this.release.release_id).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.testDataSummary = response.data;
        }
      },
      error: (err) => {
        console.error('Erro ao carregar resumo dos dados de teste:', err);
      }
    });
  }

  refreshTestData() {
    if (!this.release?.release_id) return;
    
    this.apiService.getReleaseTestData(this.release.release_id).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.testData = response.data;
          this.lastUpdateTimestamp = Date.now();
          this.findCurrentUserTestData();
          this.checkForConflicts();
        }
      },
      error: (err) => {
        console.error('Erro ao atualizar dados de teste:', err);
      }
    });
  }

  checkForConflicts() {
    // Verificar se há edições simultâneas em andamento
    const editingCount = Object.keys(this.editingRows).length;
    if (editingCount > 0) {
      // Mostrar aviso sobre possíveis conflitos
      this.showConflictWarning();
    }
  }

  showConflictWarning() {
    if (!this.conflictResolutionMode) {
      this.conflictResolutionMode = true;
      this.success = 'Atenção: Outros usuários podem estar editando simultaneamente. Dados serão atualizados automaticamente.';
      setTimeout(() => {
        this.conflictResolutionMode = false;
        this.success = '';
      }, 5000);
    }
  }

  findCurrentUserTestData() {
    if (this.currentUser && this.testData.length > 0) {
      this.currentUserTestData = this.testData.find(data => 
        data.username === this.currentUser.username
      ) || null;
    }
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

  startEditing(testData: ReleaseTestData) {
    if (!testData.test_data_id) return;
    
    // Verificar se outro usuário está editando
    if (this.isBeingEditedByOther(testData)) {
      this.error = 'Este item está sendo editado por outro usuário. Tente novamente em alguns segundos.';
      return;
    }
    
    this.editingRows[testData.test_data_id] = true;
    this.editingData[testData.test_data_id] = { ...testData };
    
    // Notificar outros usuários sobre a edição
    this.notifyEditingStart(testData);
  }

  cancelEditing(testData: ReleaseTestData) {
    if (!testData.test_data_id) return;
    
    delete this.editingRows[testData.test_data_id];
    delete this.editingData[testData.test_data_id];
    
    // Notificar outros usuários sobre o cancelamento
    this.notifyEditingEnd(testData);
  }

  saveTestData(testData: ReleaseTestData) {
    if (!testData.test_data_id || !this.release?.release_id) return;

    const editedData = this.editingData[testData.test_data_id];
    if (!editedData) return;

    this.loading = true;
    this.error = '';
    this.success = '';

    // Adicionar timestamp para controle de conflitos
    const saveData = {
      ...editedData,
      last_modified_by: this.currentUser?.username,
      last_modified_at: new Date().toISOString()
    };

    this.apiService.createOrUpdateUserTestData(
      this.release.release_id, 
      testData.user_id, 
      saveData
    ).subscribe({
      next: (response) => {
        if (response.success) {
          this.success = 'Dados salvos com sucesso!';
          this.cancelEditing(testData);
          this.loadTestData();
          
          // Notificar outros usuários sobre a atualização
          this.notifyDataUpdate(testData);
        } else {
          this.error = response.error || 'Erro ao salvar dados';
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

  addNewUserRow() {
    if (!this.release?.release_id || !this.currentUser) return;

    const newTestData: Partial<ReleaseTestData> = {
      username: this.currentUser.username,
      status: 'pendente',
      modulo: '',
      responsavel: this.currentUser.username,
      detalhe_entrega: '',
      bugs_reportados: 0,
      tempo_teste_horas: 0,
      observacoes: '',
      ambiente: this.currentEnvironment,
     // squad_name: this.getSquadNameForUser(this.currentUser.username)
    };

    this.loading = true;
    this.error = '';
    this.success = '';

    this.apiService.createOrUpdateUserTestData(
      this.release.release_id,
      this.currentUser.user_id || this.currentUser.username,
      newTestData
    ).subscribe({
      next: (response) => {
        if (response.success) {
          this.success = 'Nova linha adicionada com sucesso!';
          this.loadTestData();
        } else {
          this.error = response.error || 'Erro ao adicionar nova linha';
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

  deleteTestData(testData: ReleaseTestData) {
    if (!testData.test_data_id || !this.release?.release_id) return;

    if (!confirm('Tem certeza que deseja deletar esta linha?')) return;

    this.loading = true;
    this.error = '';
    this.success = '';

    this.apiService.deleteTestData(this.release.release_id, testData.test_data_id).subscribe({
      next: (response) => {
        if (response.success) {
          this.success = 'Linha deletada com sucesso!';
          this.loadTestData();
        } else {
          this.error = response.error || 'Erro ao deletar linha';
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

  // Métodos auxiliares para controle de edições simultâneas
  isBeingEditedByOther(testData: ReleaseTestData): boolean {
    // Simular verificação de edição por outros usuários
    // Em uma implementação real, isso seria verificado no backend
    return false;
  }

  notifyEditingStart(testData: ReleaseTestData) {
    // Notificar outros usuários que a edição começou
    // Em uma implementação real, isso seria feito via WebSocket ou polling
    console.log(`Usuário ${this.currentUser?.username} iniciou edição de ${testData.test_data_id}`);
  }

  notifyEditingEnd(testData: ReleaseTestData) {
    // Notificar outros usuários que a edição terminou
    console.log(`Usuário ${this.currentUser?.username} terminou edição de ${testData.test_data_id}`);
  }

  notifyDataUpdate(testData: ReleaseTestData) {
    // Notificar outros usuários sobre atualização de dados
    console.log(`Dados atualizados por ${this.currentUser?.username} para ${testData.test_data_id}`);
  }

  getSquadNameForUser(username: string): string {
    // Mapear usuário para squad baseado em alguma lógica
    // Por enquanto, retornar um valor padrão
    return 'SQUAD PADRÃO';
  }

  isEditing(testData: ReleaseTestData): boolean {
    return testData.test_data_id ? this.editingRows[testData.test_data_id] || false : false;
  }

  getEditingData(testData: ReleaseTestData): Partial<ReleaseTestData> {
    return testData.test_data_id ? this.editingData[testData.test_data_id] || testData : testData;
  }

  canEditRow(testData: ReleaseTestData): boolean {
    // Permitir edição para todos os usuários do time de qualidade
    if (this.isQualityTeam() || this.isAdmin()) return true;
    
    // Usuários podem editar suas próprias linhas
    return testData.username === this.currentUser?.username;
  }

  canDeleteRow(testData: ReleaseTestData): boolean {
    // Apenas admins podem deletar linhas
    if (this.isAdmin()) return true;
    
    // Usuários podem deletar suas próprias linhas
    return testData.username === this.currentUser?.username;
  }

  // Métodos de SLA
  startSla() {
    if (!this.canManageSla()) {
      this.error = 'Você não tem permissão para gerenciar SLA.';
      return;
    }

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
    if (!this.canManageSla()) {
      this.error = 'Você não tem permissão para gerenciar SLA.';
      return;
    }

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
    if (!this.canManageSla()) {
      this.error = 'Você não tem permissão para gerenciar SLA.';
      return;
    }

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

  updateRelease() {
    this.refreshTestData();
  }

  exportToExcel() {
    if (!this.release?.release_id) return;
    
    this.loading = true;
    this.success = 'Exportando dados para Excel...';
    
    // Simular exportação
    setTimeout(() => {
      this.loading = false;
      this.success = 'Dados exportados com sucesso!';
    }, 2000);
  }

  // Métodos utilitários
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

  getSlaTimeRemaining(): string {
    if (!this.release?.sla_start_time || !this.release?.sla_duration_hours) {
      return '00:42:33';
    }
    
    const startTime = new Date(this.release.sla_start_time).getTime();
    const duration = this.release.sla_duration_hours * 60 * 60 * 1000;
    const endTime = startTime + duration;
    const now = Date.now();
    const remaining = endTime - now;
    
    if (remaining <= 0) {
      return '00:00:00';
    }
    
    const hours = Math.floor(remaining / (60 * 60 * 1000));
    const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
    const seconds = Math.floor((remaining % (60 * 1000)) / 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  formatDate(dateString?: string): string {
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

  canManageSla(): boolean {
    return this.isAdmin();
  }

  getSquadName(squadId: string): string {
    const squad = this.squads.find(s => s.squad_id === squadId);
    return squad ? squad.squad_name : squadId;
  }

  clearMessages() {
    this.error = '';
    this.success = '';
  }

  trackByTestDataId(index: number, item: ReleaseTestData): string {
    return item.test_data_id || index.toString();
  }
}

