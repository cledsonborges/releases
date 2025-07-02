import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Release, SquadParticipante } from '../../services/api.service';
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
  squadsParticipantes: SquadParticipante[] = [];
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
    { value: "Não iniciado", label: "Não Iniciado", color: "#6b7280" },
    { value: "em andamento", label: "Em Andamento", color: "#f59e0b" },
    { value: "finalizado", label: "Finalizado", color: "#10b981" },
    { value: "finalizado com bugs", label: "Finalizado com Bugs", color: "#f97316" }
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
        this.loadReleaseDetails(releaseId);
      }
    });
  }

  loadReleaseDetails(releaseId: string) {
    this.loading = true;
    this.error = "";
    
    this.apiService.getRelease(releaseId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.release = response.data;
          this.squadsParticipantes = response.data.squads_participantes || [];
        } else {
          this.error = response.error || "Erro ao carregar detalhes da release";
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

  canEditSquad(squadName: string): boolean {
    // Em produção, implementar lógica real de permissões
    // Por enquanto, permite editar apenas squads que o usuário é responsável
    const squad = this.squadsParticipantes.find(s => s.nome === squadName);
    return squad?.responsavel === this.currentUser || !squad?.responsavel;
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
    if (!this.editingSquadName || !this.editingField || !this.release) {
      return;
    }

    this.saving = true;
    this.error = '';

    const squadToUpdate = this.squadsParticipantes.find(s => s.nome === this.editingSquadName);
    if (!squadToUpdate) {
      this.error = 'Squad não encontrada.';
      this.saving = false;
      return;
    }

    const updateData: Partial<SquadParticipante> = {};
    if (this.editingField === 'responsavel') {
      updateData.responsavel = this.editingValue;
    } else if (this.editingField === 'status') {
      updateData.status = this.editingValue;
    }

    this.apiService.updateSquadParticipanteStatus(this.release.release_id!, squadToUpdate.nome, updateData).subscribe({
      next: (response) => {
        if (response.success) {
          // Atualizar o status local
          if (this.editingField === 'responsavel') {
            squadToUpdate.responsavel = this.editingValue;
          } else if (this.editingField === 'status') {
            squadToUpdate.status = this.editingValue;
          }
          
          this.success = 'Status da squad atualizado com sucesso!';
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
    this.router.navigate(['/dashboard']);
  }

  addNewSquad() {
    // Esta função não será mais usada para adicionar squads diretamente aqui
    // As squads virão da release principal
    alert('A adição de novas squads deve ser feita na criação da release.');
  }
}
