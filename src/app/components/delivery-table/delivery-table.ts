import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { Delivery, ApiService } from '../../services/api.service';

@Component({
  selector: 'app-delivery-table',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatChipsModule, MatIconModule],
  template: `
    <div class="table-container">
      <h2>{{ title }} - Squads que fizeram entregas nessa release</h2>
      
      <table mat-table [dataSource]="deliveries" class="delivery-table">
        <!-- Squad Column -->
        <ng-container matColumnDef="squad">
          <th mat-header-cell *matHeaderCellDef>Squad</th>
          <td mat-cell *matCellDef="let delivery">{{ delivery.squad_name }}</td>
        </ng-container>

        <!-- Module Column -->
        <ng-container matColumnDef="module">
          <th mat-header-cell *matHeaderCellDef>Módulo</th>
          <td mat-cell *matCellDef="let delivery">{{ delivery.module }}</td>
        </ng-container>

        <!-- Detail Column -->
        <ng-container matColumnDef="detail">
          <th mat-header-cell *matHeaderCellDef>Detalhe da Entrega</th>
          <td mat-cell *matCellDef="let delivery">{{ delivery.detail || 'N/A' }}</td>
        </ng-container>

        <!-- Responsible Column -->
        <ng-container matColumnDef="responsible">
          <th mat-header-cell *matHeaderCellDef>Responsável</th>
          <td mat-cell *matCellDef="let delivery">{{ delivery.responsible || '' }}</td>
        </ng-container>

        <!-- Status Column -->
        <ng-container matColumnDef="status">
          <th mat-header-cell *matHeaderCellDef>Status</th>
          <td mat-cell *matCellDef="let delivery">
            <mat-chip 
              [class]="getStatusClass(delivery.status)"
              class="status-chip">
              {{ delivery.status }}
            </mat-chip>
          </td>
        </ng-container>

        <!-- Actions Column -->
        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef>Ações</th>
          <td mat-cell *matCellDef="let delivery">
            <button mat-raised-button color="primary" class="edit-btn">
              Editar
            </button>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
      </table>
    </div>
  `,
  styles: [`
    .table-container {
      margin: 20px 0;
    }

    .table-container h2 {
      color: #1976d2;
      margin-bottom: 20px;
      font-size: 16px;
    }

    .delivery-table {
      width: 100%;
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .mat-mdc-header-cell {
      background-color: #2c5f5f;
      color: white;
      font-weight: bold;
      padding: 16px 8px;
    }

    .mat-mdc-cell {
      padding: 16px 8px;
      border-bottom: 1px solid #e0e0e0;
    }

    .status-chip {
      font-size: 12px;
      font-weight: bold;
      border-radius: 4px;
      padding: 4px 8px;
    }

    .status-finalizado {
      background-color: #4caf50;
      color: white;
    }

    .status-em-andamento {
      background-color: #ff9800;
      color: white;
    }

    .edit-btn {
      background-color: #2c5f5f;
      color: white;
      font-size: 12px;
      padding: 8px 16px;
    }

    .edit-btn:hover {
      background-color: #1e4040;
    }

    @media (max-width: 768px) {
      .delivery-table {
        font-size: 12px;
      }
      
      .mat-mdc-cell, .mat-mdc-header-cell {
        padding: 8px 4px;
      }
    }
  `]
})
export class DeliveryTableComponent implements OnInit {
  @Input() title: string = '[Android]-R113';
  @Input() releaseId: number = 1;
  
  deliveries: Delivery[] = [];
  displayedColumns: string[] = ['squad', 'module', 'detail', 'responsible', 'status', 'actions'];

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadDeliveries();
  }

  loadDeliveries() {
    this.apiService.getReleaseDeliveries(this.releaseId).subscribe({
      next: (deliveries) => {
        this.deliveries = deliveries;
      },
      error: (error) => {
        console.error('Erro ao carregar entregas:', error);
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'finalizado':
        return 'status-finalizado';
      case 'em andamento':
        return 'status-em-andamento';
      default:
        return '';
    }
  }
}

