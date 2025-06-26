import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginComponent {
  username: string = '';
  loading: boolean = false;
  error: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    // Redirecionar se já estiver logado
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }
  }

  onSubmit(): void {
    if (!this.username.trim()) {
      this.error = 'Por favor, digite seu nome de usuário';
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService.login(this.username).subscribe({
      next: (success) => {
        this.loading = false;
        if (success) {
          this.router.navigate(['/dashboard']);
        } else {
          this.error = 'Erro ao fazer login. Tente novamente.';
        }
      },
      error: (error) => {
        this.loading = false;
        this.error = 'Erro de conexão. Verifique se a API está funcionando.';
        console.error('Login error:', error);
      }
    });
  }

  navigateToEnvironment(environment: string): void {
    // Simular navegação para ambientes específicos
    if (environment === 'homolog') {
      this.router.navigate(['/homolog']);
    } else if (environment === 'alpha') {
      this.router.navigate(['/alpha']);
    }
  }
}

