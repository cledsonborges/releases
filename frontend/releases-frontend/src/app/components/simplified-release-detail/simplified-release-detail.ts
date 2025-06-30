import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

// Interface simplificada para status de squad
interface SquadStatus {
  squad_status_id: string;
  release_id: string;
  squad: string;
  responsavel: string;
  status: string;
  created_at: string;
  updated_at: string;
}

// Interface simplificada para release
interface SimplifiedRelease {
  release_id: string;
  release_name: string;
  squad: string;
  responsavel: string;
  status: string;
  created_at: string;
  updated_at: string;
  squad_statuses?: SquadStatus[];
}

@Component({
  selector: 'app-simplified-release-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './simplified-release-detail.html',
  styleUrl: './simplified-release-detail.scss'
})
export class SimplifiedReleaseDetailComponent implements OnInit {
  release: SimplifiedRelease | null = null;
  squadStatuses: SquadStatus[] = [];
  loading = true;
  error = "";
  success = "";
  
  // Controle de edição
  editingSquadStatusId: string | null = null;
  editingField: string | null = null;
  editingValue: string = "";
  
  // Status disponíveis
  statusOptions = [
    { value: "em_andamento", label: "Em Andamento", color: "#f59e0b" },
    { value: "concluido", label: "Concluído", color: "#10b981" },
    { value: "concluido_com_bugs", label: "Concluído com Bugs", color: "#f97316" },
    { value: "bloqueado", label: "Bloqueado", color: "#ef4444" }
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
    
    // Usar a nova API simplificada
    this.apiService.getSimplifiedRelease(releaseId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.release = response.data;
          this.squadStatuses = response.data.squad_statuses || [];
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

  startEdit(squadStatusId: string, field: string, currentValue: string): void {
    if (!this.canEdit()) {
      this.error = "Você não tem permissão para editar.";
      return;
    }

    this.editingSquadStatusId = squadStatusId;
    this.editingField = field;
    this.editingValue = currentValue;
  }

  saveEdit(): void {
    if (!this.editingSquadStatusId || !this.editingField) return;

    const updateData = {
      [this.editingField]: this.editingValue
    };

    // Chamar API para atualizar o status do squad
    this.apiService.updateSquadStatus(this.editingSquadStatusId, updateData).subscribe({
      next: (response) => {
        if (response.success) {
          // Atualizar localmente
          const squadStatusIndex = this.squadStatuses.findIndex(s => s.squad_status_id === this.editingSquadStatusId);
          if (squadStatusIndex !== -1) {
            (this.squadStatuses[squadStatusIndex] as any)[this.editingField!] = this.editingValue;
          }
          
          this.success = "Dados salvos com sucesso!";
          this.clearEdit();
          
          // Limpar mensagem após 3 segundos
          setTimeout(() => {
            this.success = "";
          }, 3000);
        } else {
          this.error = response.error || "Erro ao salvar dados";
        }
      },
      error: (err) => {
        this.error = "Erro ao conectar com a API";
        console.error("Erro:", err);
      }
    });
  }

  cancelEdit(): void {
    this.clearEdit();
  }

  clearEdit(): void {
    this.editingSquadStatusId = null;
    this.editingField = null;
    this.editingValue = "";
  }

  isEditing(squadStatusId: string, field: string): boolean {
    return this.editingSquadStatusId === squadStatusId && this.editingField === field;
  }

  getStatusColor(status: string): string {
    const statusOption = this.statusOptions.find(s => s.value === status);
    return statusOption?.color || "#6b7280";
  }

  getStatusLabel(status: string): string {
    const statusOption = this.statusOptions.find(s => s.value === status);
    return statusOption?.label || status;
  }

  canEdit(): boolean {
    const user = this.authService.getCurrentUser();
    return user && (user.role === 'admin' || user.role === 'quality_team');
  }

  goBack(): void {
    this.router.navigate(['/releases']);
  }

  addSquadStatus(): void {
    if (!this.release?.release_id) return;

    const newSquadData = {
      squad: 'Nova Squad',
      responsavel: 'Clique para adicionar responsável',
      status: 'em_andamento'
    };

    this.apiService.createSquadStatus(this.release.release_id, newSquadData).subscribe({
      next: (response) => {
        if (response.success) {
          // Recarregar os dados para obter o novo status
          this.loadReleaseDetails(this.release!.release_id);
          this.success = "Nova squad adicionada com sucesso!";
          setTimeout(() => {
            this.success = "";
          }, 3000);
        } else {
          this.error = response.error || "Erro ao adicionar squad";
        }
      },
      error: (err) => {
        this.error = "Erro ao conectar com a API";
        console.error("Erro:", err);
      }
    });
  }
}

