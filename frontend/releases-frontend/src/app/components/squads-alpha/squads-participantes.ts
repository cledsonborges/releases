import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService, Release, SquadParticipante } from '../../services/api.service';

@Component({
  selector: 'app-squads-alpha',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="squads-participantes-container">
      <div class="header">
        <button class="back-button" (click)="goBack()">
          ← Voltar
        </button>
        <h1>Testes Alpha</h1>
        <button class="refresh-button" (click)="loadReleases()" [disabled]="loading">
          🔄 Atualizar
        </button>
      </div>

      <div *ngIf="loading" class="loading">
        <div class="spinner"></div>
        Carregando releases...
      </div>

      <div *ngIf="error" class="error">
        <div class="error-icon">⚠️</div>
        <div class="error-message">{{ error }}</div>
        <button class="retry-button" (click)="loadReleases()">Tentar novamente</button>
      </div>

      <div *ngIf="!loading && !error && releases.length === 0" class="no-data">
        <div class="no-data-icon">📋</div>
        <div class="no-data-message">Nenhuma release encontrada</div>
      </div>

      <div *ngIf="!loading && !error && releases.length > 0" class="releases-container">
        <div class="filters">
          <div class="filter-group">
            <label for="statusFilter">Filtrar por status:</label>
            <select id="statusFilter" [(ngModel)]="statusFilter" (change)="applyFilters()" class="filter-select">
              <option value="">Todos os status</option>
              <option value="Não iniciado">Não iniciado</option>
              <option value="Em andamento">Em andamento</option>
              <option value="Concluído">Concluído</option>
              <option value="Concluído com bugs">Concluído com bugs</option>
            </select>
          </div>
          <div class="filter-group">
            <label for="squadFilter">Filtrar por squad:</label>
            <select id="squadFilter" [(ngModel)]="squadFilter" (change)="applyFilters()" class="filter-select">
              <option value="">Todas as squads</option>
              <option *ngFor="let squad of uniqueSquads" [value]="squad">{{ squad }}</option>
            </select>
          </div>
        </div>

        <div class="releases-list">
          <div *ngFor="let release of filteredReleases; trackBy: trackByReleaseId" class="release-card">
            <div class="release-header" (click)="toggleRelease(release.release_id!)">
              <div class="release-info">
                <h3>{{ release.release_name }}</h3>
                <div class="release-meta">
                  <span class="ambiente">{{ release.ambiente }}</span>
                  <span class="versao">v{{ release.versao_firebase }}</span>
                  <span class="squads-count">{{ release.squads_participantes?.length || 0 }} squads</span>
                </div>
              </div>
              <div class="expand-icon" [class.expanded]="expandedReleases.has(release.release_id!)">
                ▼
              </div>
            </div>

            <div *ngIf="expandedReleases.has(release.release_id!)" class="squads-table-container">
              <div class="table-responsive">
                <table class="squads-table">
                  <thead>
                    <tr>
                      <th>Squad</th>
                      <th>Responsável</th>
                      <th>Status</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let squad of release.squads_participantes; trackBy: trackBySquadId" 
                        [class.editing]="isEditing(release.release_id!, squad.squad_id!)">
                      <td class="squad-name">
                        <div class="squad-info">
                          <span class="squad-title">{{ squad.nome }}</span>
                        </div>
                      </td>
                      <td class="responsavel">
                        <input 
                          type="text" 
                          [(ngModel)]="squad.responsavel"
                          [disabled]="!isEditing(release.release_id!, squad.squad_id!) || saving"
                          placeholder="Nome do responsável"
                        />
                      </td>
                      <td class="status">
                        <select 
                          [(ngModel)]="squad.status"
                          [disabled]="!isEditing(release.release_id!, squad.squad_id!) || saving"
                          [class]="getStatusClass(squad.status)"
                        >
                          <option value="Não iniciado">Não iniciado</option>
                          <option value="Em andamento">Em andamento</option>
                          <option value="Concluído">Concluído</option>
                          <option value="Concluído com bugs">Concluído com bugs</option>
                        </select>
                      </td>
                      <td class="actions">
                        <div class="action-buttons">
                          <button 
                            *ngIf="!isEditing(release.release_id!, squad.squad_id!)"
                            (click)="startEdit(release.release_id!, squad.squad_id!)"
                            class="edit-button"
                            title="Editar"
                          >
                            ✏️
                          </button>
                          <button 
                            *ngIf="isEditing(release.release_id!, squad.squad_id!)"
                            (click)="saveSquad(release.release_id!, squad)"
                            [disabled]="saving"
                            class="save-button"
                            title="Salvar"
                          >
                            {{ saving ? '⏳' : '💾' }}
                          </button>
                          <button 
                            *ngIf="isEditing(release.release_id!, squad.squad_id!)"
                            (click)="cancelEdit(release.release_id!, squad.squad_id!)"
                            [disabled]="saving"
                            class="cancel-button"
                            title="Cancelar"
                          >
                            ❌
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div *ngIf="!release.squads_participantes || release.squads_participantes.length === 0" class="no-squads">
                <div class="no-squads-message">Nenhuma squad participante cadastrada para esta release</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Toast de sucesso -->
      <div *ngIf="showSuccessToast" class="toast success-toast">
        <div class="toast-content">
          <span class="toast-icon">✅</span>
          <span class="toast-message">{{ successMessage }}</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .squads-participantes-container {
      padding: 20px;
      max-width: 1400px;
      margin: 0 auto;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: #f8f9fa;
      min-height: 100vh;
    }

    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 30px;
      background: white;
      padding: 20px;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .back-button, .refresh-button {
      background: #133134;
      color: white;
      border: none;
      padding: 12px 20px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .back-button:hover, .refresh-button:hover {
      background: #0f2729;
      transform: translateY(-1px);
    }

    .refresh-button:disabled {
      background: #ccc;
      cursor: not-allowed;
      transform: none;
    }

    h1 {
      color: #133134;
      margin: 0;
      font-size: 28px;
      font-weight: 600;
    }

    .loading {
      text-align: center;
      padding: 60px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #133134;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .error {
      text-align: center;
      padding: 40px;
      background: #fff5f5;
      border: 2px solid #fed7d7;
      border-radius: 12px;
      color: #c53030;
    }

    .error-icon {
      font-size: 48px;
      margin-bottom: 16px;
    }

    .error-message {
      font-size: 18px;
      margin-bottom: 20px;
      font-weight: 500;
    }

    .retry-button {
      background: #e53e3e;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 500;
      transition: background-color 0.3s;
    }

    .retry-button:hover {
      background: #c53030;
    }

    .no-data {
      text-align: center;
      padding: 60px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      color: #666;
    }

    .no-data-icon {
      font-size: 64px;
      margin-bottom: 20px;
    }

    .no-data-message {
      font-size: 18px;
      font-weight: 500;
    }

    .filters {
      display: flex;
      gap: 20px;
      margin-bottom: 20px;
      background: white;
      padding: 20px;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      flex-wrap: wrap;
    }

    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
      min-width: 200px;
    }

    .filter-group label {
      font-weight: 600;
      color: #133134;
      font-size: 14px;
    }

    .filter-select {
      padding: 10px 12px;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      font-size: 14px;
      background: white;
      transition: border-color 0.3s;
    }

    .filter-select:focus {
      outline: none;
      border-color: #A7CE2E;
    }

    .releases-list {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .release-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      overflow: hidden;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    .release-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(0,0,0,0.15);
    }

    .release-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      cursor: pointer;
      background: linear-gradient(135deg, #133134 0%, #1a4548 100%);
      color: white;
    }

    .release-info h3 {
      margin: 0 0 8px 0;
      font-size: 20px;
      font-weight: 600;
    }

    .release-meta {
      display: flex;
      gap: 16px;
      font-size: 14px;
      opacity: 0.9;
    }

    .ambiente {
      background: rgba(255,255,255,0.2);
      padding: 4px 8px;
      border-radius: 4px;
      font-weight: 500;
    }

    .versao {
      background: #A7CE2E;
      color: #133134;
      padding: 4px 8px;
      border-radius: 4px;
      font-weight: 600;
    }

    .squads-count {
      font-weight: 500;
    }

    .expand-icon {
      font-size: 20px;
      transition: transform 0.3s ease;
    }

    .expand-icon.expanded {
      transform: rotate(180deg);
    }

    .squads-table-container {
      padding: 0;
    }

    .table-responsive {
      overflow-x: auto;
    }

    .squads-table {
      width: 100%;
      border-collapse: collapse;
      background: white;
    }

    .squads-table th {
      background: #f8f9fa;
      color: #133134;
      padding: 16px;
      text-align: left;
      font-weight: 600;
      font-size: 14px;
      border-bottom: 2px solid #e2e8f0;
    }

    .squads-table td {
      padding: 16px;
      border-bottom: 1px solid #e2e8f0;
      vertical-align: middle;
    }

    .squads-table tr:hover {
      background: #f8f9fa;
    }

    .squads-table tr.editing {
      background: #fff8e1;
      border-left: 4px solid #A7CE2E;
    }

    .squad-name {
      font-weight: 600;
      color: #133134;
    }

    .input-field, .select-field {
      width: 100%;
      padding: 10px 12px;
      border: 2px solid #e2e8f0;
      border-radius: 6px;
      font-size: 14px;
      font-family: inherit;
      transition: border-color 0.3s;
    }

    .input-field:focus, .select-field:focus {
      outline: none;
      border-color: #A7CE2E;
    }

    .input-field:disabled, .select-field:disabled {
      background: #f8f9fa;
      color: #666;
      cursor: not-allowed;
    }

    .select-field.Não.iniciado {
      background: #f7fafc;
      color: #2d3748;
    }

    .select-field.Em.andamento {
      background: #fef5e7;
      color: #c05621;
    }

    .select-field.Concluído {
      background: #f0fff4;
      color: #22543d;
    }

    .select-field.Concluído.com.bugs {
      background: #fff5f5;
      color: #c53030;
    }

    .action-buttons {
      display: flex;
      gap: 8px;
      justify-content: center;
    }

    .edit-button, .save-button, .cancel-button {
      background: none;
      border: 2px solid transparent;
      padding: 8px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 16px;
      transition: all 0.3s ease;
      min-width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .edit-button {
      background: #e2e8f0;
    }

    .edit-button:hover {
      background: #cbd5e0;
      transform: scale(1.1);
    }

    .save-button {
      background: #A7CE2E;
      color: white;
    }

    .save-button:hover:not(:disabled) {
      background: #95b829;
      transform: scale(1.1);
    }

    .save-button:disabled {
      background: #ccc;
      cursor: not-allowed;
      transform: none;
    }

    .cancel-button {
      background: #fed7d7;
    }

    .cancel-button:hover:not(:disabled) {
      background: #feb2b2;
      transform: scale(1.1);
    }

    .no-squads {
      padding: 40px;
      text-align: center;
      color: #666;
      font-style: italic;
    }

    .toast {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 1000;
      border-radius: 8px;
      padding: 16px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.2);
      animation: slideIn 0.3s ease;
    }

    .success-toast {
      background: #f0fff4;
      border: 2px solid #9ae6b4;
      color: #22543d;
    }

    .toast-content {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .toast-icon {
      font-size: 20px;
    }

    .toast-message {
      font-weight: 500;
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    @media (max-width: 768px) {
      .squads-participantes-container {
        padding: 10px;
      }

      .header {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
      }

      .header h1 {
        text-align: center;
        font-size: 24px;
      }

      .filters {
        flex-direction: column;
        gap: 16px;
      }

      .filter-group {
        min-width: auto;
      }

      .release-header {
        padding: 16px;
      }

      .release-meta {
        flex-direction: column;
        gap: 8px;
      }

      .squads-table th,
      .squads-table td {
        padding: 12px 8px;
        font-size: 13px;
      }

      .action-buttons {
        flex-direction: column;
        gap: 4px;
      }

      .toast {
        left: 10px;
        right: 10px;
        top: 10px;
      }
    }
  `]
})
export class SquadsAlphaComponent implements OnInit {
  releases: Release[] = [];
  filteredReleases: Release[] = [];
  loading = false;
  saving = false;
  error = '';
  
  // Filtros
  statusFilter = '';
  squadFilter = '';
  uniqueSquads: string[] = [];
  
  // Estado da interface
  expandedReleases = new Set<string>();
  editingSquads = new Set<string>();
  originalSquadData = new Map<string, SquadParticipante>();
  
  // Toast
  showSuccessToast = false;
  successMessage = '';

  constructor(
    private router: Router,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    this.loadReleases();
  }

  loadReleases() {
    this.loading = true;
    this.error = '';

    this.apiService.getReleases().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.releases = response.data;
          this.extractUniqueSquads();
          this.applyFilters();
        } else {
          this.error = response.error || 'Erro ao carregar releases';
        }
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Erro ao carregar releases. Verifique sua conexão.';
        this.loading = false;
        console.error('Erro:', error);
      }
    });
  }

  extractUniqueSquads() {
    const squadsSet = new Set<string>();
    this.releases.forEach(release => {
      release.squads_participantes?.forEach(squad => {
        squadsSet.add(squad.nome);
      });
    });
    this.uniqueSquads = Array.from(squadsSet).sort();
  }

  applyFilters() {
    this.filteredReleases = this.releases.filter(release => {
      // Filtrar apenas releases do ambiente alpha
      const isAlphaRelease = release.ambiente === 'alpha';
      
      if (!isAlphaRelease) {
        return false;
      }
      
      // Filtrar por squads que atendem aos critérios
      if (this.statusFilter || this.squadFilter) {
        const hasMatchingSquad = release.squads_participantes?.some(squad => {
          const statusMatch = !this.statusFilter || squad.status === this.statusFilter;
          const squadMatch = !this.squadFilter || squad.nome === this.squadFilter;
          return statusMatch && squadMatch;
        });
        return hasMatchingSquad;
      }
      return true;
    });
  }

  toggleRelease(releaseId: string) {
    if (this.expandedReleases.has(releaseId)) {
      this.expandedReleases.delete(releaseId);
    } else {
      this.expandedReleases.add(releaseId);
    }
  }

  getEditKey(releaseId: string, squadId: string): string {
    return `${releaseId}-${squadId}`;
  }

  isEditing(releaseId: string, squadId: string): boolean {
    return this.editingSquads.has(this.getEditKey(releaseId, squadId));
  }

  startEdit(releaseId: string, squadId: string) {
    const editKey = this.getEditKey(releaseId, squadId);
    const release = this.releases.find(r => r.release_id === releaseId);
    const squad = release?.squads_participantes?.find(s => s.squad_id === squadId);
    
    if (squad) {
      // Salvar dados originais para cancelamento
      this.originalSquadData.set(editKey, { ...squad });
      this.editingSquads.add(editKey);
    }
  }

  cancelEdit(releaseId: string, squadId: string) {
    const editKey = this.getEditKey(releaseId, squadId);
    const originalData = this.originalSquadData.get(editKey);
    
    if (originalData) {
      const release = this.releases.find(r => r.release_id === releaseId);
      const squad = release?.squads_participantes?.find(s => s.squad_id === squadId);
      
      if (squad) {
        // Restaurar dados originais
        squad.responsavel = originalData.responsavel;
        squad.status = originalData.status;
      }
    }
    
    this.editingSquads.delete(editKey);
    this.originalSquadData.delete(editKey);
  }

  saveSquad(releaseId: string, squad: SquadParticipante) {
    if (!squad.responsavel?.trim()) {
      this.showError('O campo responsável é obrigatório');
      return;
    }

    this.saving = true;
    const editKey = this.getEditKey(releaseId, squad.squad_id!);

    const updateData = {
      responsavel: squad.responsavel.trim(),
      status: squad.status
    };

    this.apiService.updateSquadParticipanteStatus(releaseId, squad.squad_id!, updateData).subscribe({
      next: (response) => {
        if (response.success) {
          this.editingSquads.delete(editKey);
          this.originalSquadData.delete(editKey);
          this.showSuccess('Squad atualizada com sucesso!');
        } else {
          this.showError(response.error || 'Erro ao salvar squad');
        }
        this.saving = false;
      },
      error: (error) => {
        this.showError('Erro ao salvar squad. Tente novamente.');
        this.saving = false;
        console.error('Erro:', error);
      }
    });
  }

  getStatusClass(status: string): string {
    return status.replace(/\s+/g, '.');
  }

  trackByReleaseId(index: number, release: Release): string {
    return release.release_id || index.toString();
  }

  trackBySquadId(index: number, squad: SquadParticipante): string {
    return squad.squad_id || index.toString();
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }

  private showSuccess(message: string) {
    this.successMessage = message;
    this.showSuccessToast = true;
    setTimeout(() => {
      this.showSuccessToast = false;
    }, 3000);
  }

  private showError(message: string) {
    this.error = message;
    setTimeout(() => {
      this.error = '';
    }, 5000);
  }
}

