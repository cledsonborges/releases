import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Release, Squad } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

// Interface para dados de entrega por squad
interface SquadDelivery {
  squad_id: string;
  squad_name: string;
  detalhe_entrega: string;
  responsavel: string;
  status: string;
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
  squads: Squad[] = [];
  squadDeliveries: SquadDelivery[] = [];
  loading = true;
  error = "";
  success = "";
  
  // Controle de edição
  editingSquadId: string | null = null;
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
    
    this.loadSquads();
  }

  loadReleaseDetails(releaseId: string) {
    this.loading = true;
    this.error = "";
    
    this.apiService.getRelease(releaseId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.release = response.data;
          this.loadSquadDeliveries();
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

  loadSquads() {
    this.apiService.getSquads().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.squads = response.data;
          this.initializeSquadDeliveries();
        }
      },
      error: (err) => {
        console.error("Erro ao carregar squads:", err);
      }
    });
  }

  loadSquadDeliveries() {
    if (!this.release?.release_id) return;

    this.apiService.getSquadDeliveries(this.release.release_id).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.squadDeliveries = response.data;
        } else {
          this.error = response.error || "Erro ao carregar entregas por squad";
        }
      },
      error: (err) => {
        this.error = "Erro ao conectar com a API para entregas por squad";
        console.error("Erro:", err);
      }
    });
  }

  initializeSquadDeliveries() {
    // Esta função não será mais necessária para inicializar dados, pois virão da API
  }

  startEdit(squadId: string, field: string, currentValue: string): void {
    if (!this.canEdit()) {
      this.error = "Você não tem permissão para editar.";
      return;
    }

    this.editingSquadId = squadId;
    this.editingField = field;
    this.editingValue = currentValue;
  }

  saveEdit(): void {
    if (!this.editingSquadId || !this.editingField) return;

    const squadIndex = this.squadDeliveries.findIndex(s => s.squad_id === this.editingSquadId);
    if (squadIndex === -1) return;

    // Atualizar o valor
    (this.squadDeliveries[squadIndex] as any)[this.editingField] = this.editingValue;

    // Simular salvamento na API
    this.success = "Dados salvos com sucesso!";
    this.clearEdit();
    
    // Limpar mensagem após 3 segundos
    setTimeout(() => {
      this.success = "";
    }, 3000);
  }

  cancelEdit(): void {
    this.clearEdit();
  }

  clearEdit(): void {
    this.editingSquadId = null;
    this.editingField = null;
    this.editingValue = "";
  }

  isEditing(squadId: string, field: string): boolean {
    return this.editingSquadId === squadId && this.editingField === field;
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
    return user !== null && (user.role === "admin" || user.role === "quality_team");
  }

  goBack() {
    this.router.navigate(["/homolog"]);
  }

  formatDate(dateString?: string): string {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("pt-BR");
  }

  clearMessages() {
    this.error = "";
    this.success = "";
  }
}