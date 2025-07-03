import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Release, Squad } from '../../services/api.service';
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
  
  // Squads data
  squads: Squad[] = [];
  loadingSquads: boolean = false;
  selectedSquads: string[] = [];

  newRelease: Partial<Release> = {
    release_name: "",
    squad: "",
    versao_homolog: "",
    versao_firebase: "",
    descricao: "",
    link_plano_testes: "",
    qrcode_alpha: "",
    qrcode_homolog: "",
    release_exclusiva: false,
    ambiente: ""
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
    this.loadSquads();
  }

  loadSquads(): void {
    this.loadingSquads = true;
    this.apiService.getSquads().subscribe({
      next: (response) => {
        this.loadingSquads = false;
        if (response.success && response.data) {
          this.squads = response.data.filter(squad => squad.ativo);
        }
      },
      error: (error) => {
        this.loadingSquads = false;
        console.error('Error loading squads:', error);
      }
    });
  }

  navigateToSquads(): void {
    this.router.navigate(['/squads']);
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  showCreateReleaseForm(): void {
    this.showCreateForm = true;
    this.resetForm();
    this.loadSquads(); // Recarregar squads ao abrir o formulário
  }

  hideCreateReleaseForm(): void {
    this.showCreateForm = false;
    this.resetForm();
  }

  resetForm(): void {
    this.newRelease = {
      release_name: "",
      squad: "",
      versao_homolog: "",
      versao_firebase: "",
      descricao: "",
      link_plano_testes: "",
      qrcode_alpha: "",
      qrcode_homolog: "",
      release_exclusiva: false,
      ambiente: ""
    };
    this.selectedSquads = [];
  }

  // Métodos para gerenciar seleção de squads
  onSquadChange(event: any, squadName: string): void {
    if (event.target.checked) {
      this.selectedSquads.push(squadName);
    } else {
      const index = this.selectedSquads.indexOf(squadName);
      if (index > -1) {
        this.selectedSquads.splice(index, 1);
      }
    }
  }

  isSquadSelected(squadName: string): boolean {
    return this.selectedSquads.includes(squadName);
  }

  createRelease(): void {
    if (!this.newRelease.release_name || this.selectedSquads.length === 0 || !this.newRelease.versao_homolog || 
        !this.newRelease.versao_firebase || !this.newRelease.ambiente) {
      this.showMessage('Por favor, preencha todos os campos obrigatórios e selecione pelo menos uma squad.', 'error');
      return;
    }

    this.creating = true;
    
    // Preparar dados da release
    const releaseData: Partial<Release> = {
      ...this.newRelease,
      squads_participantes: this.selectedSquads.map(squad => ({
        nome: squad,
        responsavel: '',
        status: 'Não iniciado'
      })),
      squad: this.selectedSquads[0], // Primeira squad como principal para compatibilidade
      liberado_em: new Date().toISOString(),
      sla_status: 'stopped'
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

