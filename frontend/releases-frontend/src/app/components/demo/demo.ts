import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface MockReleaseData {
  test_data_id: string;
  squad_name: string;
  modulo: string;
  detalhe_entrega: string;
  responsavel: string;
  status: string;
  username: string;
}

@Component({
  selector: 'app-demo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
<div class="release-detail-container">
  <!-- Header com timer e informações da release -->
  <div class="header-section">
    <div class="release-header">
      <div class="release-title">
        <div class="navigation-controls">
          <button class="btn-back" (click)="goBack()" title="Voltar para tela anterior">
            <i class="icon-arrow-left">←</i>
            Voltar
          </button>
        </div>
        <h1>[HOMOLOG]-R0001 - Squads que fizeram entregas nessa release</h1>
        <div class="header-actions">
          <a href="/homolog" class="nav-link">Homolog</a>
          <span class="separator">|</span>
          <a href="/report-portal" class="nav-link">Report Portal</a>
        </div>
      </div>
      
      <!-- Timer Section -->
      <div class="timer-section">
        <div class="timer-label">Tempo restante para o término:</div>
        <div class="timer-display">00:42:33</div>
      </div>
      
      <!-- Release Info -->
      <div class="release-info-row">
        <div class="version-info">
          <span class="version-label">N/A</span>
          <span class="release-number">Release 56f9c741-2665-48fd-aae3-46b10eb69a16</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Dropdown menu de releases -->
  <div class="releases-dropdown">
    <div class="dropdown-header" (click)="toggleDropdown()">
      <div class="navigation-controls">
        <button class="btn-back" (click)="goBack()" title="Voltar para tela anterior">
          <i class="icon-arrow-left">←</i>
          Voltar
        </button>
      </div>
      <h2>{{ selectedRelease || 'Releases Disponíveis' }}</h2>
      <button class="dropdown-toggle" [class.expanded]="dropdownOpen">
        <i class="icon-chevron-down">▼</i>
      </button>
    </div>
    
    <!-- Dropdown content -->
    <div class="dropdown-content" [class.open]="dropdownOpen">
      <div class="releases-list">
        <div *ngFor="let release of mockReleases" 
             class="release-item"
             [class.selected]="selectedRelease === release.name"
             (click)="selectRelease(release.name)">
          
          <div class="release-header">
            <div class="release-name">{{ release.name }}</div>
            <div class="release-environment" [class]="'env-' + release.environment">
              {{ release.environment.toUpperCase() }}
            </div>
          </div>
          
          <div class="release-info">
            <div class="release-version">{{ release.version }}</div>
            <div class="release-number">{{ release.number }}</div>
          </div>
          
          <div class="release-meta">
            <div class="release-date">{{ release.date }}</div>
            <div class="release-status" [class]="'status-' + release.status">
              {{ release.status === 'active' ? 'SLA Ativo' : 'SLA Inativo' }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Main Content -->
  <div class="main-content">
    <!-- Squad Data Table -->
    <div class="squad-table-container">
      <table class="squad-table">
        <thead>
          <tr>
            <th class="squad-col">Squad</th>
            <th class="module-col">Módulo</th>
            <th class="details-col">Detalhe da Entrega</th>
            <th class="responsible-col">Responsável</th>
            <th class="status-col">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let data of testData; let i = index" 
              [class.editing]="isEditing(i)"
              [class.current-user]="data.username === 'current_user'">
            
            <!-- Squad -->
            <td class="squad-cell">
              <span class="squad-name">{{ data.squad_name }}</span>
            </td>

            <!-- Módulo -->
            <td class="module-cell">
              <input *ngIf="isEditing(i)" 
                     type="text" 
                     [(ngModel)]="data.modulo" 
                     class="form-input"
                     placeholder="Ex: xvr/co-work/acompanhamento"
                     (blur)="stopEditing(i)"
                     (keyup.enter)="stopEditing(i)"
                     (keyup.escape)="cancelEditing(i)">
              <span *ngIf="!isEditing(i)" 
                    class="editable-field"
                    (click)="startEditing(i)"
                    title="Clique para editar">{{ data.modulo || 'Clique para adicionar módulo' }}</span>
            </td>

            <!-- Detalhe da Entrega -->
            <td class="details-cell">
              <textarea *ngIf="isEditing(i)" 
                        [(ngModel)]="data.detalhe_entrega" 
                        class="form-textarea"
                        rows="2"
                        placeholder="Descreva os detalhes da entrega"
                        (blur)="stopEditing(i)"
                        (keyup.enter)="stopEditing(i)"
                        (keyup.escape)="cancelEditing(i)"></textarea>
              <span *ngIf="!isEditing(i)" 
                    class="details-text editable-field"
                    (click)="startEditing(i)"
                    title="Clique para editar">{{ data.detalhe_entrega || 'Clique para adicionar detalhes da entrega' }}</span>
            </td>

            <!-- Responsável -->
            <td class="responsible-cell">
              <input *ngIf="isEditing(i)" 
                     type="text" 
                     [(ngModel)]="data.responsavel" 
                     class="form-input"
                     placeholder="Nome do responsável"
                     (blur)="stopEditing(i)"
                     (keyup.enter)="stopEditing(i)"
                     (keyup.escape)="cancelEditing(i)">
              <span *ngIf="!isEditing(i)" 
                    class="editable-field"
                    (click)="startEditing(i)"
                    title="Clique para editar">{{ data.responsavel || 'Clique para adicionar responsável' }}</span>
            </td>

            <!-- Status -->
            <td class="status-cell">
              <select *ngIf="isEditing(i)" 
                      [(ngModel)]="data.status" 
                      class="form-select status-select"
                      [class]="'status-' + data.status"
                      (blur)="stopEditing(i)"
                      (keyup.enter)="stopEditing(i)"
                      (keyup.escape)="cancelEditing(i)">
                <option value="em_andamento">Em andamento</option>
                <option value="finalizado">Finalizado</option>
                <option value="pendente">Pendente</option>
                <option value="com_problemas">Com problemas</option>
                <option value="bloqueado">Bloqueado</option>
              </select>
              <span *ngIf="!isEditing(i)" 
                    class="status-badge editable-field"
                    [class]="'status-' + data.status"
                    (click)="startEditing(i)"
                    title="Clique para editar">
                {{ getStatusLabel(data.status) }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</div>
  `,
  styles: [`
/* Estilos base */
.release-detail-container {
  background-color: #f5f5f5;
  min-height: 100vh;
  font-family: Arial, sans-serif;
}

.header-section {
  background: linear-gradient(135deg, #2d5a5a 0%, #1a4040 100%);
  color: white;
  padding: 20px;
}

.release-header {
  max-width: 1200px;
  margin: 0 auto;
}

.release-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
}

.release-title h1 {
  font-size: 18px;
  font-weight: normal;
  margin: 0;
  flex: 1;
  min-width: 300px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.nav-link {
  color: white;
  text-decoration: underline;
  font-size: 14px;
}

.nav-link:hover { color: #ccc; }

.separator {
  color: white;
  font-size: 14px;
}

.timer-section {
  background: rgba(0, 0, 0, 0.2);
  padding: 15px;
  border-radius: 8px;
  text-align: center;
  margin-bottom: 20px;
}

.timer-label {
  font-size: 14px;
  margin-bottom: 10px;
}

.timer-display {
  font-size: 36px;
  font-weight: bold;
  color: #00ff00;
  font-family: 'Courier New', monospace;
}

.release-info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.version-info {
  display: flex;
  gap: 20px;
  align-items: center;
}

.version-label, .release-number {
  font-size: 14px;
}

/* Estilos para dropdown de releases */
.releases-dropdown {
  position: relative;
  margin: 20px;
  margin-bottom: 20px;
}

.dropdown-header {
  background: linear-gradient(135deg, #2d5a5a 0%, #1a4040 100%);
  color: white;
  padding: 15px 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 8px 8px 0 0;
  transition: all 0.2s ease;
}

.dropdown-header:hover {
  background: linear-gradient(135deg, #1a4040 0%, #2d5a5a 100%);
}

.dropdown-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: normal;
  flex: 1;
}

.dropdown-toggle {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 5px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.dropdown-toggle:hover {
  background: rgba(255, 255, 255, 0.1);
}

.dropdown-toggle i {
  font-size: 18px;
  transition: transform 0.2s ease;
}

.dropdown-toggle.expanded i {
  transform: rotate(180deg);
}

.dropdown-content {
  background: white;
  border: 1px solid #ddd;
  border-top: none;
  border-radius: 0 0 8px 8px;
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.dropdown-content.open {
  max-height: 400px;
  overflow-y: auto;
}

.releases-list {
  padding: 10px 0;
}

.release-item {
  padding: 12px 20px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.release-item:hover {
  background-color: #f8f9fa;
}

.release-item.selected {
  background-color: rgba(45, 90, 90, 0.1);
  border-left: 3px solid #2d5a5a;
}

.release-item:last-child {
  border-bottom: none;
}

.release-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.release-name {
  font-weight: 500;
  color: #333;
}

.release-environment {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: bold;
}

.release-environment.env-homolog {
  background-color: #fbbf24;
  color: #92400e;
}

.release-environment.env-alpha {
  background-color: #34d399;
  color: #065f46;
}

.release-info {
  display: flex;
  gap: 15px;
  margin-bottom: 5px;
  font-size: 13px;
  color: #666;
}

.release-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #999;
}

.release-status.status-active {
  color: #10b981;
  font-weight: 500;
}

.release-status.status-inactive {
  color: #6b7280;
}

/* Estilos para navegação */
.navigation-controls {
  display: flex;
  align-items: center;
  margin-right: 20px;
}

.btn-back {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  transition: all 0.2s ease;
}

.btn-back:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
}

.btn-back i {
  font-size: 16px;
}

/* Estilos para tabela */
.main-content {
  padding: 20px;
}

.squad-table-container {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.squad-table {
  width: 100%;
  border-collapse: collapse;
}

.squad-table th {
  background: #2d5a5a;
  color: white;
  padding: 12px;
  text-align: left;
  font-weight: 500;
}

.squad-table td {
  padding: 12px;
  border-bottom: 1px solid #eee;
  vertical-align: top;
}

.squad-table tbody tr:hover {
  background-color: #f8f9fa;
}

.squad-table tbody tr.editing {
  background-color: rgba(45, 90, 90, 0.05);
  border-left: 3px solid #2d5a5a;
}

/* Estilos para campos editáveis */
.editable-field {
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.2s ease;
  min-height: 20px;
  display: inline-block;
}

.editable-field:hover {
  background-color: rgba(45, 90, 90, 0.1);
  border: 1px dashed #2d5a5a;
}

.form-input, .form-textarea, .form-select {
  border: 2px solid #2d5a5a;
  border-radius: 4px;
  padding: 6px 10px;
  font-size: 14px;
  transition: border-color 0.2s ease;
  width: 100%;
}

.form-input:focus, .form-textarea:focus, .form-select:focus {
  outline: none;
  border-color: #1a4040;
  box-shadow: 0 0 0 2px rgba(45, 90, 90, 0.2);
}

.form-textarea {
  resize: vertical;
  min-height: 60px;
}

/* Status badges */
.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-em_andamento {
  background-color: #fbbf24;
  color: #92400e;
}

.status-finalizado {
  background-color: #10b981;
  color: white;
}

.status-pendente {
  background-color: #6b7280;
  color: white;
}

.status-com_problemas {
  background-color: #ef4444;
  color: white;
}

.status-bloqueado {
  background-color: #374151;
  color: white;
}

/* Responsividade */
@media (max-width: 768px) {
  .navigation-controls {
    margin-right: 10px;
  }
  
  .btn-back {
    padding: 6px 12px;
    font-size: 12px;
  }
  
  .release-title {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .release-title h1 {
    font-size: 16px;
    min-width: auto;
  }
  
  .dropdown-header {
    padding: 12px 15px;
  }
  
  .dropdown-header h2 {
    font-size: 16px;
  }
  
  .squad-table {
    font-size: 14px;
  }
  
  .squad-table th,
  .squad-table td {
    padding: 8px;
  }
}
  `]
})
export class DemoComponent implements OnInit {
  dropdownOpen = false;
  selectedRelease = '[HOMOLOG]-R0001';
  editingIndex = -1;
  originalData: any = {};

  mockReleases = [
    {
      name: '[HOMOLOG]-R0001',
      environment: 'homolog',
      version: 'N/A',
      number: 'Release 56f9c741-2665-48fd-aae3-46b10eb69a16',
      date: '27/06/2025',
      status: 'inactive'
    },
    {
      name: '[HOMOLOG]-R0000',
      environment: 'homolog',
      version: 'N/A',
      number: 'Release 7ece15b0-c68b-48af-abf9-30962655529a',
      date: '27/06/2025',
      status: 'inactive'
    },
    {
      name: '[HOMOLOG]-teste',
      environment: 'homolog',
      version: 'N/A',
      number: 'Release 49354529-2b1c-41b9-978e-4acfabd8a490',
      date: '27/06/2025',
      status: 'inactive'
    }
  ];

  testData: MockReleaseData[] = [
    {
      test_data_id: '1',
      squad_name: '02 - SQUAD ACOMPANHAMENTO DE PV',
      modulo: 'xvtCoreInfraAcompanhamento-v.2.3.2',
      detalhe_entrega: 'Ajuste de crash na tela de duas vias',
      responsavel: 'Edilson Coimbra',
      status: 'em_andamento',
      username: 'edilson'
    },
    {
      test_data_id: '2',
      squad_name: '07 - ACOMPANHA CANAIS FÍSICOS SUSTENTABILIDADE',
      modulo: 'xvtAcompanhamento-v3.3.2',
      detalhe_entrega: 'Massa de incremento',
      responsavel: 'Edilson Coimbra',
      status: 'em_andamento',
      username: 'edilson'
    },
    {
      test_data_id: '3',
      squad_name: '06 - SQUAD VITRINE DE FUNDOS E PREV',
      modulo: 'xvtVitrine-1.5.4',
      detalhe_entrega: 'nada a destacar',
      responsavel: 'Marcelo Schramm',
      status: 'finalizado',
      username: 'marcelo'
    },
    {
      test_data_id: '4',
      squad_name: '09 - SQUAD VITRINE PV',
      modulo: 'xvtVitrine-1.5.4',
      detalhe_entrega: 'nada a destacar',
      responsavel: 'Marcelo Schramm',
      status: 'finalizado',
      username: 'marcelo'
    }
  ];

  constructor(private router: Router) {}

  ngOnInit() {}

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  selectRelease(releaseName: string) {
    this.selectedRelease = releaseName;
    this.dropdownOpen = false;
  }

  goBack() {
    this.router.navigate(['/login']);
  }

  isEditing(index: number): boolean {
    return this.editingIndex === index;
  }

  startEditing(index: number) {
    this.editingIndex = index;
    this.originalData = { ...this.testData[index] };
  }

  stopEditing(index: number) {
    this.editingIndex = -1;
    // Aqui seria onde salvaria os dados
    console.log('Dados salvos:', this.testData[index]);
  }

  cancelEditing(index: number) {
    this.testData[index] = { ...this.originalData };
    this.editingIndex = -1;
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'em_andamento': 'EM ANDAMENTO',
      'finalizado': 'FINALIZADO',
      'pendente': 'PENDENTE',
      'com_problemas': 'COM PROBLEMAS',
      'bloqueado': 'BLOQUEADO'
    };
    return labels[status] || status.toUpperCase();
  }
}

