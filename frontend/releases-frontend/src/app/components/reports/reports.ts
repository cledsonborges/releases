import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

interface NotTestedReport {
  release_name: string;
  squad_name: string;
  status: string;
}

interface Release {
  release_name: string;
  squads_participantes: Array<{
    nome: string;
    status: string;
  }>;
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './reports.html',
  styleUrl: './reports.scss'
})
export class ReportsComponent implements OnInit {
  notTestedReport: NotTestedReport[] = [];
  displayedColumns: string[] = ['release_name', 'squad_name', 'status'];
  loading = false;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadNotTestedReport();
  }

  loadNotTestedReport() {
    this.loading = true;
    this.http.get<{data: Release[], success: boolean}>('https://releases-three.vercel.app/api/releases')
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.processNotTestedData(response.data);
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Erro ao carregar releases:', error);
          this.loading = false;
        }
      });
  }

  processNotTestedData(releases: Release[]) {
    this.notTestedReport = [];
    
    releases.forEach(release => {
      const squadsParticipantes = release.squads_participantes || [];
      
      squadsParticipantes.forEach(squad => {
        if (squad.status === 'Não iniciado') {
          this.notTestedReport.push({
            release_name: release.release_name,
            squad_name: squad.nome,
            status: squad.status
          });
        }
      });
    });
  }

  exportToCSV() {
    const csvContent = this.convertToCSV(this.notTestedReport);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'squads_nao_testaram.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  private convertToCSV(data: NotTestedReport[]): string {
    const headers = ['Release', 'Squad', 'Status'];
    const csvArray = [headers.join(',')];
    
    data.forEach(item => {
      const row = [
        `"${item.release_name}"`,
        `"${item.squad_name}"`,
        `"${item.status}"`
      ];
      csvArray.push(row.join(','));
    });
    
    return csvArray.join('\n');
  }
}

