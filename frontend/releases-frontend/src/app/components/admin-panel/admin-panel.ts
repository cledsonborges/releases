import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Release } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-panel.html',
  styleUrl: './admin-panel.scss'
})
export class AdminPanelComponent implements OnInit {
  showCreateForm: boolean = false;
  creating: boolean = false;
  apiStatus: boolean = false;
  dbStatus: boolean = false;
  message: string = '';
  messageType: string = '';

  newRelease: Partial<Release> = {
    release_name: '',
    ambiente: '',
    status: '',
    descricao: '',
    sla_duration_hours: 24,
    release_exclusiva: false,
    squads_participantes: []
  };

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router
  ) {
    // Verificar se é admin
    if (!this.authService.isAdmin()) {
      this.router.navigate(['/dashboard']);
    }
  }

  ngOnInit(): void {
    this.checkApiStatus();
    this.checkDbStatus();
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  showCreateReleaseForm(): void {
    this.showCreateForm = true;
    this.resetForm();
  }

  hideCreateReleaseForm(): void {
    this.showCreateForm = false;
    this.resetForm();
  }

  resetForm(): void {
    this.newRelease = {
      release_name: '',
      ambiente: '',
      status: '',
      descricao: '',
      sla_duration_hours: 24,
      release_exclusiva: false,
      squads_participantes: []
    };
  }

  createRelease(): void {
    if (!this.newRelease.release_name || !this.newRelease.ambiente || !this.newRelease.status) {
      this.showMessage('Por favor, preencha todos os campos obrigatórios.', 'error');
      return;
    }

    this.creating = true;
    
    // Preparar dados da release
    const releaseData: Partial<Release> = {
      ...this.newRelease,
      liberado_em: new Date().toISOString(),
      sla_status: 'stopped',
      squads_participantes: []
    };

    this.apiService.createRelease(releaseData).subscribe({
      next: (response) => {
        this.creating = false;
        if (response.success) {
          this.showMessage('Release criada com sucesso!', 'success');
          this.hideCreateReleaseForm();
        } else {
          this.showMessage(response.error || 'Erro ao criar release', 'error');
        }
      },
      error: (error) => {
        this.creating = false;
        this.showMessage('Erro de conexão ao criar release', 'error');
        console.error('Error creating release:', error);
      }
    });
  }

  initializeDatabase(): void {
    this.showMessage('Inicializando banco de dados...', 'info');
    
    this.apiService.initDatabase().subscribe({
      next: (response) => {
        if (response.success) {
          this.showMessage('Banco de dados inicializado com sucesso!', 'success');
          this.checkDbStatus();
        } else {
          this.showMessage(response.error || 'Erro ao inicializar banco de dados', 'error');
        }
      },
      error: (error) => {
        this.showMessage('Erro de conexão ao inicializar banco de dados', 'error');
        console.error('Error initializing database:', error);
      }
    });
  }

  manageSquads(): void {
    this.showMessage('Funcionalidade de gerenciamento de squads em desenvolvimento', 'info');
  }

  viewReports(): void {
    this.router.navigate(['/reports']);
  }

  checkApiStatus(): void {
    this.apiService.healthCheck().subscribe({
      next: (response) => {
        this.apiStatus = response.success;
      },
      error: (error) => {
        this.apiStatus = false;
        console.error('API health check failed:', error);
      }
    });
  }

  checkDbStatus(): void {
    // Simular verificação do banco de dados
    this.apiService.getReleases().subscribe({
      next: (response) => {
        this.dbStatus = true;
      },
      error: (error) => {
        this.dbStatus = false;
        console.error('Database check failed:', error);
      }
    });
  }

  showMessage(text: string, type: string): void {
    this.message = text;
    this.messageType = type;
    
    // Auto-hide message after 5 seconds
    setTimeout(() => {
      this.message = '';
      this.messageType = '';
    }, 5000);
  }
}

