import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Squad } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-squad-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './squad-management.html',
  styleUrl: './squad-management.scss'
})
export class SquadManagementComponent implements OnInit {
  squads: Squad[] = [];
  loading: boolean = false;
  error: string = '';
  message: string = '';
  messageType: string = '';
  
  // Form data
  showCreateForm: boolean = false;
  editingSquad: Squad | null = null;
  
  newSquad: Partial<Squad> = {
    squad_name: '',
    modulos: [],
    responsavel: '',
    ativo: true,
    descricao: ''
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
    this.loadSquads();
  }

  loadSquads(): void {
    this.loading = true;
    this.error = '';
    
    this.apiService.getSquads().subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success && response.data) {
          this.squads = response.data;
        } else {
          this.error = response.error || 'Erro ao carregar squads';
        }
      },
      error: (error) => {
        this.loading = false;
        this.error = 'Erro de conexão ao carregar squads';
        console.error('Error loading squads:', error);
      }
    });
  }

  showCreateSquadForm(): void {
    this.showCreateForm = true;
    this.editingSquad = null;
    this.resetForm();
  }

  hideCreateSquadForm(): void {
    this.showCreateForm = false;
    this.editingSquad = null;
    this.resetForm();
  }

  editSquad(squad: Squad): void {
    this.editingSquad = squad;
    this.showCreateForm = true;
    this.newSquad = {
      squad_name: squad.squad_name,
      modulos: [...(squad.modulos || [])],
      responsavel: squad.responsavel || '',
      ativo: squad.ativo,
      descricao: squad.descricao || ''
    };
  }

  resetForm(): void {
    this.newSquad = {
      squad_name: '',
      modulos: [],
      responsavel: '',
      ativo: true,
      descricao: ''
    };
  }

  addModule(): void {
    if (!this.newSquad.modulos) {
      this.newSquad.modulos = [];
    }
    this.newSquad.modulos.push('');
  }

  removeModule(index: number): void {
    if (this.newSquad.modulos) {
      this.newSquad.modulos.splice(index, 1);
    }
  }

  trackByIndex(index: number): number {
    return index;
  }

  saveSquad(): void {
    if (!this.newSquad.squad_name?.trim()) {
      this.showMessage('Nome da squad é obrigatório', 'error');
      return;
    }

    // Filtrar módulos vazios
    if (this.newSquad.modulos) {
      this.newSquad.modulos = this.newSquad.modulos.filter(m => m.trim() !== '');
    }

    if (this.editingSquad) {
      // Atualizar squad existente
      this.updateSquad();
    } else {
      // Criar nova squad
      this.createSquad();
    }
  }

  createSquad(): void {
    this.apiService.createSquad(this.newSquad).subscribe({
      next: (response) => {
        if (response.success) {
          this.showMessage('Squad criada com sucesso!', 'success');
          this.hideCreateSquadForm();
          this.loadSquads();
        } else {
          this.showMessage(response.error || 'Erro ao criar squad', 'error');
        }
      },
      error: (error) => {
        this.showMessage('Erro de conexão ao criar squad', 'error');
        console.error('Error creating squad:', error);
      }
    });
  }

  updateSquad(): void {
    if (!this.editingSquad?.squad_id) return;

    this.apiService.updateSquad(this.editingSquad.squad_id, this.newSquad).subscribe({
      next: (response) => {
        if (response.success) {
          this.showMessage('Squad atualizada com sucesso!', 'success');
          this.hideCreateSquadForm();
          this.loadSquads();
        } else {
          this.showMessage(response.error || 'Erro ao atualizar squad', 'error');
        }
      },
      error: (error) => {
        this.showMessage('Erro de conexão ao atualizar squad', 'error');
        console.error('Error updating squad:', error);
      }
    });
  }

  deleteSquad(squad: Squad): void {
    if (!squad.squad_id) return;

    if (confirm(`Tem certeza que deseja deletar a squad "${squad.squad_name}"?`)) {
      this.apiService.deleteSquad(squad.squad_id).subscribe({
        next: (response) => {
          if (response.success) {
            this.showMessage('Squad deletada com sucesso!', 'success');
            this.loadSquads();
          } else {
            this.showMessage(response.error || 'Erro ao deletar squad', 'error');
          }
        },
        error: (error) => {
          this.showMessage('Erro de conexão ao deletar squad', 'error');
          console.error('Error deleting squad:', error);
        }
      });
    }
  }

  toggleSquadStatus(squad: Squad): void {
    if (!squad.squad_id) return;

    const updatedData = { ativo: !squad.ativo };
    
    this.apiService.updateSquad(squad.squad_id, updatedData).subscribe({
      next: (response) => {
        if (response.success) {
          squad.ativo = !squad.ativo;
          this.showMessage(
            `Squad ${squad.ativo ? 'ativada' : 'desativada'} com sucesso!`, 
            'success'
          );
        } else {
          this.showMessage(response.error || 'Erro ao alterar status da squad', 'error');
        }
      },
      error: (error) => {
        this.showMessage('Erro de conexão ao alterar status da squad', 'error');
        console.error('Error toggling squad status:', error);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/admin']);
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

