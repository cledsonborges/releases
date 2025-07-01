import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Release, Squad } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

// Interface para dados de status de teste por squad
interface TestStatus {
  test_status_id?: string;
  release_id: string;
  squad_name: string;
  responsavel: string;
  status: string;
  observacoes?: string;
  created_at?: string;
  updated_at?: string;
}

// Interface para dados da release com status de testes
interface ReleaseWithTestStatus {
  release_id: string;
  release_name: string;
  ambiente: string;
  versao_firebase: string;
  liberado_em: string;
  link_plano_testes: string;
  qrcode_alpha: string;
  qrcode_homolog: string;
  release_exclusiva: boolean;
  test_statuses: TestStatus[];
}

@Component({
  selector: 'app-release-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './release-detail.html',
  styleUrl: './release-detail.scss'
})
export class ReleaseDetailComponent implements OnInit {
  release: Release | null = null;
  releaseWithTestStatus: ReleaseWithTestStatus | null = null;
  testStatuses: TestStatus[] = [];
  loading = true;
  saving = false;
  error = "";
  success = "";
  
  // Controle de edição
  editingSquadName: string | null = null;
  editingField: string | null = null;
  editingValue: string = "";
  currentUser = 'Cledson'; // Simulando usuário logado - em produção, pegar do serviço de auth
  
  // Status disponíveis
  statusOptions = [
    { value: "nao_iniciado", label: "Não Iniciado", color: "#6b7280" },
    { value: "em_andamento", label: "Em Andamento", color: "#f59e0b" },
    { value: "concluido", label: "Concluído", color: "#10b981" },
    { value: "concluido_com_bugs", label: "Concluído com Bugs", color: "#f97316" }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const releaseId = params["id"];
      if (releaseId) {
        this.loadReleaseTestStatuses(releaseId);
      }
    });
  }

  loadReleaseTestStatuses(releaseId: string) {
    this.loading = true;
    this.error = "";
    
    this.apiService.getReleaseTestStatuses(releaseId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.releaseWithTestStatus = response.data;
          this.testStatuses = response.data.test_statuses || [];
          
          // Se não há status de testes, criar alguns exemplos
          if (this.testStatuses.length === 0) {
            this.initializeDefaultTestStatuses(releaseId);
          }
        } else {
          this.error = response.error || "Erro ao carregar status de testes da release";
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = "Erro ao conectar com a API";
        this.loading = false;
        console.error("Erro:", err);
      }
    });
  }

  initializeDefaultTestStatuses(releaseId: string) {
    // Criar alguns status de exemplo se não existirem
    const defaultSquads = [
      { name: "Sala de Integração", responsavel: "Cledson" },
      { name: "Squad Alpha", responsavel: "Edilson Cordeiro" },
      { name: "Squad Beta", responsavel: "" },
      { name: "Squad Gama", responsavel: "Mariah Schevenin" }
    ];

    defaultSquads.forEach(squad => {
      const testStatus: TestStatus = {
        release_id: releaseId,
        squad_name: squad.name,
        responsavel: squad.responsavel,
        status: 'nao_iniciado',
        observacoes: ''
      };
      this.testStatuses.push(testStatus);
    });
  }

  canEditSquad(squadName: string): boolean {
    // Em produção, implementar lógica real de permissões
    // Por enquanto, permite editar apenas squads que o usuário é responsável
    const testStatus = this.testStatuses.find(ts => ts.squad_name === squadName);
    return testStatus?.responsavel === this.currentUser || !testStatus?.responsavel;
  }

  isEditing(squadName: string, field: string): boolean {
    return this.editingSquadName === squadName && this.editingField === field;
  }

  startEdit(squadName: string, field: string, currentValue: string) {
    if (!this.canEditSquad(squadName) && field !== 'responsavel') {
      return;
    }
    
    this.editingSquadName = squadName;
    this.editingField = field;
    this.editingValue = currentValue || '';
  }

  cancelEdit() {
    this.editingSquadName = null;
    this.editingField = null;
    this.editingValue = '';
  }

  saveEdit() {
    if (!this.editingSquadName || !this.editingField || !this.releaseWithTestStatus) {
      return;
    }

    this.saving = true;
    this.error = '';

    const testStatusData = {
      squad_name: this.editingSquadName,
      responsavel: this.editingField === 'responsavel' ? this.editingValue : 
                   this.getTestStatusBySquad(this.editingSquadName)?.responsavel || '',
      status: this.editingField === 'status' ? this.editingValue : 
              this.getTestStatusBySquad(this.editingSquadName)?.status || 'nao_iniciado',
      observacoes: this.editingField === 'observacoes' ? this.editingValue : 
                   this.getTestStatusBySquad(this.editingSquadName)?.observacoes || ''
    };

    // Se estamos editando o responsável, atualizar também
    if (this.editingField === 'responsavel') {
      testStatusData.responsavel = this.editingValue;
    }

    this.apiService.createOrUpdateTestStatus(this.releaseWithTestStatus.release_id, testStatusData).subscribe({
      next: (response) => {
        if (response.success) {
          // Atualizar o status local
          const existingIndex = this.testStatuses.findIndex(ts => ts.squad_name === this.editingSquadName);
          if (existingIndex >= 0) {
            this.testStatuses[existingIndex] = {
              ...this.testStatuses[existingIndex],
              ...testStatusData,
              test_status_id: response.data?.test_status_id || this.testStatuses[existingIndex].test_status_id
            };
          } else {
            // Adicionar novo status
            this.testStatuses.push({
              test_status_id: response.data?.test_status_id,
              release_id: this.releaseWithTestStatus!.release_id,
              ...testStatusData
            });
          }
          
          this.success = 'Status atualizado com sucesso!';
          this.cancelEdit();
          
          // Limpar mensagem de sucesso após 3 segundos
          setTimeout(() => {
            this.success = '';
          }, 3000);
        } else {
          this.error = response.error || 'Erro ao salvar status';
        }
        this.saving = false;
      },
      error: (error) => {
        this.error = 'Erro ao salvar status';
        this.saving = false;
        console.error('Erro:', error);
      }
    });
  }

  getTestStatusBySquad(squadName: string): TestStatus | undefined {
    return this.testStatuses.find(ts => ts.squad_name === squadName);
  }

  getStatusLabel(status: string): string {
    const option = this.statusOptions.find(opt => opt.value === status);
    return option ? option.label : status;
  }

  getStatusColor(status: string): string {
    const option = this.statusOptions.find(opt => opt.value === status);
    return option ? option.color : '#6b7280';
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'N/A';
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
  }

  canEdit(): boolean {
    // Verificar se o usuário tem permissão para editar
    return true; // Para fins de demonstração
  }

  clearMessages() {
    this.error = '';
    this.success = '';
  }

  goBack() {
    this.router.navigate(['/releases']);
  }

  addNewSquad() {
    const newSquadName = prompt('Nome da nova squad:');
    if (newSquadName && newSquadName.trim()) {
      const testStatus: TestStatus = {
        release_id: this.releaseWithTestStatus!.release_id,
        squad_name: newSquadName.trim(),
        responsavel: this.currentUser,
        status: 'nao_iniciado',
        observacoes: ''
      };
      
      this.saving = true;
      this.apiService.createOrUpdateTestStatus(this.releaseWithTestStatus!.release_id, testStatus).subscribe({
        next: (response) => {
          if (response.success) {
            testStatus.test_status_id = response.data?.test_status_id;
            this.testStatuses.push(testStatus);
            this.success = 'Squad adicionada com sucesso!';
            setTimeout(() => this.success = '', 3000);
          } else {
            this.error = response.error || 'Erro ao adicionar squad';
          }
          this.saving = false;
        },
        error: (error) => {
          this.error = 'Erro ao adicionar squad';
          this.saving = false;
          console.error('Erro:', error);
        }
      });
    }
  }
}

