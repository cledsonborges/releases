import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { ReplaceSpacePipe } from '../../pipes/replace-space.pipe';

interface ReportEntry {
  release_name: string;
  squad_name: string;
  status: string;
  sla_status: string;
}

interface Release {
  release_name: string;
  sla_active: boolean;
  sla_duration_hours: string;
  sla_start_time: string;
  squads_participantes: Array<{
    nome: string;
    status: string;
  }>;
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule, 
    MatTableModule, 
    MatCardModule, 
    MatButtonModule, 
    MatIconModule, 
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReplaceSpacePipe
  ],
  templateUrl: './reports.html',
  styleUrl: './reports.scss'
})
export class ReportsComponent implements OnInit {
  reportData: ReportEntry[] = [];
  filteredReportData: ReportEntry[] = [];
  displayedColumns: string[] = ['release_name', 'squad_name', 'status', 'sla_status'];
  loading = false;

  // Filtros
  selectedRelease: string = '';
  selectedSquad: string = '';
  availableReleases: string[] = [];
  availableSquads: string[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadReportData();
  }

  loadReportData() {
    this.loading = true;
    this.http.get<{data: Release[], success: boolean}>('https://releases-three.vercel.app/api/releases')
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.processReportData(response.data);
            this.extractFilterOptions();
            this.applyFilters();
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Erro ao carregar releases:', error);
          this.loading = false;
        }
      });
  }

  processReportData(releases: Release[]) {
    this.reportData = [];
    const currentTime = new Date();

    releases.forEach(release => {
      const slaActive = release.sla_active;
      const slaDurationHours = parseInt(release.sla_duration_hours);
      const slaStartTimeStr = release.sla_start_time;
      const squadsParticipantes = release.squads_participantes || [];

      let slaExpired = false;
      if (slaActive && slaStartTimeStr) {
        const slaStartTime = new Date(slaStartTimeStr);
        const slaEndTime = new Date(slaStartTime.getTime() + slaDurationHours * 60 * 60 * 1000);
        if (currentTime > slaEndTime) {
          slaExpired = true;
        }
      }

      squadsParticipantes.forEach(squad => {
        const status = squad.status;
        if ((status === 'Não iniciado' || status === 'Em andamento') && slaExpired) {
          this.reportData.push({
            release_name: release.release_name,
            squad_name: squad.nome,
            status: status,
            sla_status: 'Venceu SLA'
          });
        } else if (status === 'Não iniciado' || status === 'Em andamento') {
          this.reportData.push({
            release_name: release.release_name,
            squad_name: squad.nome,
            status: status,
            sla_status: 'Não Venceu SLA'
          });
        }
      });
    });
  }

  extractFilterOptions() {
    // Extrair releases únicas
    this.availableReleases = [...new Set(this.reportData.map(item => item.release_name))].sort();
    
    // Extrair squads únicas
    this.availableSquads = [...new Set(this.reportData.map(item => item.squad_name))].sort();
  }

  applyFilters() {
    this.filteredReportData = this.reportData.filter(item => {
      const releaseMatch = !this.selectedRelease || item.release_name === this.selectedRelease;
      const squadMatch = !this.selectedSquad || item.squad_name === this.selectedSquad;
      return releaseMatch && squadMatch;
    });
  }

  onReleaseFilterChange() {
    this.applyFilters();
  }

  onSquadFilterChange() {
    this.applyFilters();
  }

  clearFilters() {
    this.selectedRelease = '';
    this.selectedSquad = '';
    this.applyFilters();
  }

  exportToCSV() {
    const csvContent = this.convertToCSV(this.filteredReportData);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'squads_report_filtered.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  private convertToCSV(data: ReportEntry[]): string {
    const headers = ['Release', 'Squad', 'Status', 'Status SLA'];
    const csvArray = [headers.join(',')];
    
    data.forEach(item => {
      const row = [
        `"${item.release_name}"`,
        `"${item.squad_name}"`,
        `"${item.status}"`,
        `"${item.sla_status}"`
      ];
      csvArray.push(row.join(','));
    });
    
    return csvArray.join('\n');
  }
}

