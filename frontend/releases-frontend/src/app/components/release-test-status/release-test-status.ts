import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

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

interface ReleaseData {
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
  selector: 'app-release-test-status',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="release-test-status-container">
      <div class="header">
        <button class="back-button" (click)="goBack()">
          ← Voltar
        </button>
        <h1>Releases e Squads Participantes</h1>
      </div>

      <div *ngIf="loading" class="loading">
        Carregando...
      </div>

      <div *ngIf="error" class="error">
        {{ error }}
      </div>

      <div *ngIf="releaseData && !loading" class="release-info">
        <h2>Release: {{ releaseData.release_name }}</h2>
        
        <div class="release-details">
          <div class="detail-item">
            <strong>Ambiente:</strong> {{ releaseData.ambiente }}
          </div>
          <div class="detail-item">
            <strong>Versão Firebase:</strong> {{ releaseData.versao_firebase }}
          </div>
          <div class="detail-item">
            <strong>Liberado em:</strong> {{ releaseData.liberado_em }}
          </div>
          <div class="detail-item">
            <strong>Link Plano de Testes:</strong> 
            <span *ngIf="releaseData.link_plano_testes; else noLink">
              <a [href]="releaseData.link_plano_testes" target="_blank">{{ releaseData.link_plano_testes }}</a>
            </span>
            <ng-template #noLink>---</ng-template>
          </div>
          <div class="detail-item">
            <strong>QR Code Alpha:</strong> 
            <span *ngIf="releaseData.qrcode_alpha; else noQrAlpha">{{ releaseData.qrcode_alpha }}</span>
            <ng-template #noQrAlpha>---</ng-template>
          </div>
          <div class="detail-item">
            <strong>QR Code Homolog:</strong> 
            <span *ngIf="releaseData.qrcode_homolog; else noQrHomolog">{{ releaseData.qrcode_homolog }}</span>
            <ng-template #noQrHomolog>---</ng-template>
          </div>
          <div class="detail-item">
            <strong>Release Exclusiva:</strong> {{ releaseData.release_exclusiva ? 'Sim' : 'Não' }}
          </div>
        </div>

        <div class="squads-table">
          <table>
            <thead>
              <tr>
                <th>Squad</th>
                <th>Responsável</th>
                <th>Status</th>
                <th>Observações</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let testStatus of releaseData.test_statuses; trackBy: trackBySquad">
                <td>{{ testStatus.squad_name }}</td>
                <td>
                  <input 
                    type="text" 
                    [(ngModel)]="testStatus.responsavel"
                    [disabled]="!canEditSquad(testStatus.squad_name)"
                    class="input-field"
                  />
                </td>
                <td>
                  <select 
                    [(ngModel)]="testStatus.status"
                    [disabled]="!canEditSquad(testStatus.squad_name)"
                    class="select-field"
                  >
                    <option value="nao_iniciado">Não iniciado</option>
                    <option value="em_andamento">Em andamento</option>
                    <option value="concluido">Concluído</option>
                    <option value="concluido_com_bugs">Concluído com bugs</option>
                  </select>
                </td>
                <td>
                  <textarea 
                    [(ngModel)]="testStatus.observacoes"
                    [disabled]="!canEditSquad(testStatus.squad_name)"
                    class="textarea-field"
                    placeholder="Observações..."
                  ></textarea>
                </td>
                <td>
                  <button 
                    *ngIf="canEditSquad(testStatus.squad_name)"
                    (click)="saveTestStatus(testStatus)"
                    [disabled]="saving"
                    class="save-button"
                  >
                    {{ saving ? 'Salvando...' : 'Salvar' }}
                  </button>
                </td>
              </tr>
              
              <!-- Linha para adicionar nova squad -->
              <tr *ngIf="showAddForm">
                <td>
                  <input 
                    type="text" 
                    [(ngModel)]="newTestStatus.squad_name"
                    placeholder="Nome da Squad"
                    class="input-field"
                  />
                </td>
                <td>
                  <input 
                    type="text" 
                    [(ngModel)]="newTestStatus.responsavel"
                    placeholder="Responsável"
                    class="input-field"
                  />
                </td>
                <td>
                  <select [(ngModel)]="newTestStatus.status" class="select-field">
                    <option value="nao_iniciado">Não iniciado</option>
                    <option value="em_andamento">Em andamento</option>
                    <option value="concluido">Concluído</option>
                    <option value="concluido_com_bugs">Concluído com bugs</option>
                  </select>
                </td>
                <td>
                  <textarea 
                    [(ngModel)]="newTestStatus.observacoes"
                    placeholder="Observações..."
                    class="textarea-field"
                  ></textarea>
                </td>
                <td>
                  <button (click)="addTestStatus()" [disabled]="saving" class="save-button">
                    {{ saving ? 'Salvando...' : 'Adicionar' }}
                  </button>
                  <button (click)="cancelAdd()" class="cancel-button">
                    Cancelar
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          
          <div class="table-actions">
            <button 
              *ngIf="!showAddForm"
              (click)="showAddSquadForm()"
              class="add-button"
            >
              + Adicionar Squad
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .release-test-status-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    .header {
      display: flex;
      align-items: center;
      margin-bottom: 30px;
      gap: 20px;
    }

    .back-button {
      background: #133134;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 5px;
      cursor: pointer;
      font-size: 14px;
      transition: background-color 0.3s;
    }

    .back-button:hover {
      background: #0f2729;
    }

    h1 {
      color: #133134;
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }

    h2 {
      color: #133134;
      margin-bottom: 20px;
      font-size: 20px;
      font-weight: 500;
    }

    .loading, .error {
      text-align: center;
      padding: 40px;
      font-size: 16px;
    }

    .error {
      color: #d32f2f;
      background: #ffebee;
      border-radius: 5px;
    }

    .release-details {
      background: #f5f5f5;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 30px;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 15px;
    }

    .detail-item {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .detail-item strong {
      color: #133134;
      font-weight: 600;
    }

    .detail-item a {
      color: #A7CE2E;
      text-decoration: none;
    }

    .detail-item a:hover {
      text-decoration: underline;
    }

    .squads-table {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      overflow: hidden;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    th {
      background: #133134;
      color: white;
      padding: 15px;
      text-align: left;
      font-weight: 600;
    }

    td {
      padding: 15px;
      border-bottom: 1px solid #e0e0e0;
      vertical-align: top;
    }

    tr:hover {
      background: #f9f9f9;
    }

    .input-field, .select-field, .textarea-field {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
      font-family: inherit;
    }

    .input-field:focus, .select-field:focus, .textarea-field:focus {
      outline: none;
      border-color: #A7CE2E;
      box-shadow: 0 0 0 2px rgba(167, 206, 46, 0.2);
    }

    .input-field:disabled, .select-field:disabled, .textarea-field:disabled {
      background: #f5f5f5;
      color: #666;
      cursor: not-allowed;
    }

    .textarea-field {
      min-height: 60px;
      resize: vertical;
    }

    .save-button {
      background: #A7CE2E;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      transition: background-color 0.3s;
    }

    .save-button:hover:not(:disabled) {
      background: #95b829;
    }

    .save-button:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    .cancel-button {
      background: #f44336;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      margin-left: 8px;
      transition: background-color 0.3s;
    }

    .cancel-button:hover {
      background: #d32f2f;
    }

    .add-button {
      background: #133134;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      margin: 20px;
      transition: background-color 0.3s;
    }

    .add-button:hover {
      background: #0f2729;
    }

    .table-actions {
      text-align: center;
    }

    @media (max-width: 768px) {
      .release-test-status-container {
        padding: 10px;
      }

      .header {
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
      }

      .release-details {
        grid-template-columns: 1fr;
      }

      table {
        font-size: 14px;
      }

      th, td {
        padding: 10px 8px;
      }
    }
  `]
})
export class ReleaseTestStatusComponent implements OnInit {
  releaseId: string = '';
  releaseData: ReleaseData | null = null;
  loading = false;
  saving = false;
  error = '';
  showAddForm = false;
  currentUser = 'Cledson'; // Simulando usuário logado - em produção, pegar do serviço de auth

  newTestStatus: Partial<TestStatus> = {
    squad_name: '',
    responsavel: '',
    status: 'nao_iniciado',
    observacoes: ''
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.releaseId = params['id'];
      if (this.releaseId) {
        this.loadReleaseTestStatuses();
      }
    });
  }

  loadReleaseTestStatuses() {
    this.loading = true;
    this.error = '';

    this.apiService.getReleaseTestStatuses(this.releaseId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.releaseData = response.data;
        } else {
          this.error = response.error || 'Erro ao carregar dados da release';
        }
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Erro ao carregar dados da release';
        this.loading = false;
        console.error('Erro:', error);
      }
    });
  }

  canEditSquad(squadName: string): boolean {
    // Em produção, implementar lógica real de permissões
    // Por enquanto, permite editar apenas squads que o usuário é responsável
    const testStatus = this.releaseData?.test_statuses.find(ts => ts.squad_name === squadName);
    return testStatus?.responsavel === this.currentUser || !testStatus?.responsavel;
  }

  saveTestStatus(testStatus: TestStatus) {
    if (!this.canEditSquad(testStatus.squad_name)) {
      return;
    }

    this.saving = true;

    const updateData = {
      squad_name: testStatus.squad_name,
      responsavel: testStatus.responsavel,
      status: testStatus.status,
      observacoes: testStatus.observacoes || ''
    };

    this.apiService.createOrUpdateTestStatus(this.releaseId, updateData).subscribe({
      next: (response) => {
        if (response.success) {
          // Atualizar o test_status_id se for um novo registro
          if (response.data?.test_status_id && !testStatus.test_status_id) {
            testStatus.test_status_id = response.data.test_status_id;
          }
          // Mostrar feedback de sucesso
          this.showSuccessMessage('Status salvo com sucesso!');
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

  showAddSquadForm() {
    this.showAddForm = true;
    this.newTestStatus = {
      squad_name: '',
      responsavel: this.currentUser,
      status: 'nao_iniciado',
      observacoes: ''
    };
  }

  addTestStatus() {
    if (!this.newTestStatus.squad_name || !this.newTestStatus.responsavel) {
      this.error = 'Squad e Responsável são obrigatórios';
      return;
    }

    this.saving = true;

    const testStatusData = {
      squad_name: this.newTestStatus.squad_name,
      responsavel: this.newTestStatus.responsavel,
      status: this.newTestStatus.status || 'nao_iniciado',
      observacoes: this.newTestStatus.observacoes || ''
    };

    this.apiService.createOrUpdateTestStatus(this.releaseId, testStatusData).subscribe({
      next: (response) => {
        if (response.success) {
          // Adicionar o novo status à lista
          const newStatus: TestStatus = {
            test_status_id: response.data?.test_status_id,
            release_id: this.releaseId,
            ...testStatusData
          };
          
          if (this.releaseData) {
            this.releaseData.test_statuses.push(newStatus);
          }
          
          this.cancelAdd();
          this.showSuccessMessage('Squad adicionada com sucesso!');
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

  cancelAdd() {
    this.showAddForm = false;
    this.newTestStatus = {
      squad_name: '',
      responsavel: '',
      status: 'nao_iniciado',
      observacoes: ''
    };
  }

  trackBySquad(index: number, testStatus: TestStatus): string {
    return testStatus.squad_name;
  }

  goBack() {
    this.router.navigate(['/releases']);
  }

  private showSuccessMessage(message: string) {
    // Em produção, implementar um sistema de notificações
    alert(message);
  }
}

