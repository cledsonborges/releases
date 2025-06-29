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
<div class="flex h-screen bg-gray-50">
  <!-- Sidebar -->
  <div class="w-80 bg-white shadow-lg border-r border-gray-200 flex flex-col">
    <!-- Sidebar Header -->
    <div class="bg-gradient-to-r from-teal-700 to-teal-800 text-white p-4">
      <div class="flex items-center justify-between mb-2">
        <button (click)="goBack()" class="flex items-center space-x-2 px-3 py-1 bg-white bg-opacity-20 rounded hover:bg-opacity-30 transition-colors">
          <span>←</span>
          <span>Voltar</span>
        </button>
      </div>
      <h2 class="text-lg font-semibold">Releases Disponíveis</h2>
    </div>
    
    <!-- Releases List -->
    <div class="flex-1 overflow-y-auto">
      <div *ngFor="let release of mockReleases" 
           class="p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors"
           [class.bg-teal-50]="selectedRelease === release.name"
           [class.border-l-4]="selectedRelease === release.name"
           [class.border-l-teal-600]="selectedRelease === release.name"
           (click)="selectRelease(release.name)">
        
        <div class="flex justify-between items-start mb-2">
          <h3 class="font-medium text-gray-900 text-sm">{{ release.name }}</h3>
          <span class="px-2 py-1 text-xs font-semibold rounded-full"
                [class.bg-yellow-100]="release.environment === 'homolog'"
                [class.text-yellow-800]="release.environment === 'homolog'"
                [class.bg-green-100]="release.environment === 'alpha'"
                [class.text-green-800]="release.environment === 'alpha'">
            {{ release.environment.toUpperCase() }}
          </span>
        </div>
        
        <div class="space-y-1 text-xs text-gray-600">
          <div>{{ release.version }}</div>
          <div>{{ release.number }}</div>
          <div class="flex justify-between">
            <span>{{ release.date }}</span>
            <span class="font-medium"
                  [class.text-green-600]="release.status === 'active'"
                  [class.text-gray-500]="release.status === 'inactive'">
              {{ release.status === 'active' ? 'SLA Ativo' : 'SLA Inativo' }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Main Content -->
  <div class="flex-1 flex flex-col">
    <!-- Header -->
    <div class="bg-gradient-to-r from-teal-700 to-teal-800 text-white p-6">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center space-x-4">
          <button (click)="goBack()" class="flex items-center space-x-2 px-3 py-1 bg-white bg-opacity-20 rounded hover:bg-opacity-30 transition-colors">
            <span>←</span>
            <span>Voltar</span>
          </button>
          <h1 class="text-xl font-semibold">{{ selectedRelease }} - Squads que fizeram entregas nessa release</h1>
        </div>
        <div class="flex items-center space-x-4">
          <a href="/homolog" class="text-white hover:text-gray-200 underline">Homolog</a>
          <span class="text-gray-300">|</span>
          <a href="/report-portal" class="text-white hover:text-gray-200 underline">Report Portal</a>
        </div>
      </div>
      
      <!-- Timer Section -->
      <div class="bg-black bg-opacity-20 rounded-lg p-4 text-center">
        <div class="text-sm mb-2">Tempo restante para o término:</div>
        <div class="text-4xl font-bold text-green-400 font-mono">00:42:33</div>
      </div>
      
      <!-- Release Info -->
      <div class="mt-4 flex items-center space-x-6 text-sm">
        <span>N/A</span>
        <span>Release 56f9c741-2665-48fd-aae3-46b10eb69a16</span>
      </div>
    </div>

    <!-- Table Content -->
    <div class="flex-1 p-6 overflow-auto">
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-teal-700">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Squad</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Módulo</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Detalhe da Entrega</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Responsável</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr *ngFor="let data of testData; let i = index" 
                class="hover:bg-gray-50 transition-colors"
                [class.bg-teal-50]="isEditing(i)"
                [class.border-l-4]="isEditing(i)"
                [class.border-l-teal-600]="isEditing(i)">
              
              <!-- Squad -->
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {{ data.squad_name }}
              </td>

              <!-- Módulo -->
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <input *ngIf="isEditing(i)" 
                       type="text" 
                       [(ngModel)]="data.modulo" 
                       class="w-full px-3 py-2 border border-teal-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                       placeholder="Ex: xvr/co-work/acompanhamento"
                       (blur)="stopEditing(i)"
                       (keyup.enter)="stopEditing(i)"
                       (keyup.escape)="cancelEditing(i)">
                <span *ngIf="!isEditing(i)" 
                      class="cursor-pointer hover:bg-teal-100 px-2 py-1 rounded transition-colors"
                      (click)="startEditing(i)"
                      title="Clique para editar">
                  {{ data.modulo || 'Clique para adicionar módulo' }}
                </span>
              </td>

              <!-- Detalhe da Entrega -->
              <td class="px-6 py-4 text-sm text-gray-900">
                <textarea *ngIf="isEditing(i)" 
                          [(ngModel)]="data.detalhe_entrega" 
                          class="w-full px-3 py-2 border border-teal-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                          rows="2"
                          placeholder="Descreva os detalhes da entrega"
                          (blur)="stopEditing(i)"
                          (keyup.enter)="stopEditing(i)"
                          (keyup.escape)="cancelEditing(i)"></textarea>
                <span *ngIf="!isEditing(i)" 
                      class="cursor-pointer hover:bg-teal-100 px-2 py-1 rounded transition-colors block"
                      (click)="startEditing(i)"
                      title="Clique para editar">
                  {{ data.detalhe_entrega || 'Clique para adicionar detalhes da entrega' }}
                </span>
              </td>

              <!-- Responsável -->
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <input *ngIf="isEditing(i)" 
                       type="text" 
                       [(ngModel)]="data.responsavel" 
                       class="w-full px-3 py-2 border border-teal-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                       placeholder="Nome do responsável"
                       (blur)="stopEditing(i)"
                       (keyup.enter)="stopEditing(i)"
                       (keyup.escape)="cancelEditing(i)">
                <span *ngIf="!isEditing(i)" 
                      class="cursor-pointer hover:bg-teal-100 px-2 py-1 rounded transition-colors"
                      (click)="startEditing(i)"
                      title="Clique para editar">
                  {{ data.responsavel || 'Clique para adicionar responsável' }}
                </span>
              </td>

              <!-- Status -->
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <select *ngIf="isEditing(i)" 
                        [(ngModel)]="data.status" 
                        class="w-full px-3 py-2 border border-teal-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
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
                      class="cursor-pointer inline-flex px-2 py-1 text-xs font-semibold rounded-full transition-colors"
                      [class.bg-yellow-100]="data.status === 'em_andamento'"
                      [class.text-yellow-800]="data.status === 'em_andamento'"
                      [class.bg-green-100]="data.status === 'finalizado'"
                      [class.text-green-800]="data.status === 'finalizado'"
                      [class.bg-gray-100]="data.status === 'pendente'"
                      [class.text-gray-800]="data.status === 'pendente'"
                      [class.bg-red-100]="data.status === 'com_problemas'"
                      [class.text-red-800]="data.status === 'com_problemas'"
                      [class.bg-gray-100]="data.status === 'bloqueado'"
                      [class.text-gray-800]="data.status === 'bloqueado'"
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
</div>
  `,
  styles: []
})
export class DemoComponent implements OnInit {
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

  selectRelease(releaseName: string) {
    this.selectedRelease = releaseName;
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

