import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, interval } from 'rxjs';
import { map, takeWhile } from 'rxjs/operators';
import { CommonModule } from '@angular/common'; // Importar CommonModule

interface Release {
  release_id: string;
  ambiente: string;
  versao_firebase?: string;
  qrcode_homolog?: string;
  qrcode_alpha?: string;
  created_at: string;
  sla_active: boolean;
  sla_end_date: string;
  // Adicione outras propriedades da release conforme necessário
}

@Component({
  selector: 'app-releases-list',
  templateUrl: './releases-list.html',
  styleUrls: ['./releases-list.scss'],
  standalone: true, // Adicionar standalone: true
  imports: [CommonModule] // Adicionar CommonModule aos imports
})
export class ReleasesListComponent implements OnInit, OnDestroy {
  releases: Release[] = [];
  selectedRelease: Release | null = null;
  sidebarCollapsed: boolean = false;
  loading: boolean = true;
  error: string | null = null;
  private timerSubscription: Subscription | undefined;

  constructor(private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    this.loadReleases();
    this.sidebarCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
  }

  ngOnDestroy(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }

  loadReleases(): void {
    this.loading = true;
    this.error = null;
    // Simula o carregamento de dados de uma API
    setTimeout(() => {
      this.releases = [
        {
          release_id: 'R0001',
          ambiente: 'homolog',
          versao_firebase: 'v2.3.1',
          qrcode_homolog: 'url_qrcode_homolog_r0001',
          created_at: '2025-06-27T10:00:00Z',
          sla_active: true,
          sla_end_date: '2025-06-30T10:00:00Z'
        },
        {
          release_id: 'R0000',
          ambiente: 'homolog',
          versao_firebase: 'v2.3.0',
          qrcode_homolog: 'url_qrcode_homolog_r0000',
          created_at: '2025-06-27T09:00:00Z',
          sla_active: false,
          sla_end_date: '2025-06-28T09:00:00Z'
        },
        {
          release_id: 'teste',
          ambiente: 'homolog',
          versao_firebase: 'v2.2.0',
          qrcode_homolog: 'url_qrcode_homolog_teste',
          created_at: '2025-06-27T08:00:00Z',
          sla_active: true,
          sla_end_date: '2025-07-01T08:00:00Z'
        },
        {
          release_id: 'PROD001',
          ambiente: 'alpha',
          versao_firebase: 'v2.1.0',
          qrcode_alpha: 'url_qrcode_alpha_prod001',
          created_at: '2025-06-26T15:00:00Z',
          sla_active: true,
          sla_end_date: '2025-06-29T15:00:00Z'
        },
        {
          release_id: 'MAIN',
          ambiente: 'producao',
          versao_firebase: 'v1.5.2',
          created_at: '2025-06-25T14:00:00Z',
          sla_active: true,
          sla_end_date: '2025-06-28T14:00:00Z'
        }
      ];
      this.loading = false;
      // Seleciona a primeira release por padrão ou a que está na URL
      this.route.paramMap.subscribe(params => {
        const releaseId = params.get('id');
        if (releaseId) {
          this.selectedRelease = this.releases.find(r => r.release_id === releaseId) || null;
        } else if (this.releases.length > 0) {
          this.selectedRelease = this.releases[0];
        }
        this.startTimer();
      });
    }, 1000);
  }

  selectRelease(release: Release): void {
    this.selectedRelease = release;
    this.router.navigate(['/homolog', release.release_id]);
    this.startTimer();
    // Colapsa a sidebar em mobile após a seleção
    if (window.innerWidth <= 768) {
      this.sidebarCollapsed = true;
      localStorage.setItem('sidebarCollapsed', 'true');
    }
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
    localStorage.setItem('sidebarCollapsed', this.sidebarCollapsed.toString());
  }

  getReleaseDisplayName(release: Release): string {
    return `[${release.ambiente.toUpperCase()}]-${release.release_id}`;
  }

  getReleaseVersion(release: Release): string {
    if (release.ambiente === 'homolog' && release.qrcode_homolog) {
      return `Release ${release.qrcode_homolog.split('/').pop()}`;
    } else if (release.ambiente === 'alpha' && release.qrcode_alpha) {
      return `Release ${release.qrcode_alpha.split('/').pop()}`;
    }
    return `Release ${release.release_id}`;
  }

  getReleaseNumber(release: Release): string {
    // Lógica para obter o número da release, se aplicável
    return `Release ${this.releases.indexOf(release) + 1}`;
  }

  formatDate(dateString: string): string {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
  }

  getSlaTimeRemaining(release: Release): string {
    if (!release.sla_active) {
      return 'SLA Inativo';
    }
    const now = new Date().getTime();
    const endDate = new Date(release.sla_end_date).getTime();
    const timeLeft = endDate - now;

    if (timeLeft <= 0) {
      return 'Expirado';
    }

    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  }

  startTimer(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
    if (this.selectedRelease && this.selectedRelease.sla_active) {
      this.timerSubscription = interval(1000).pipe(
        map(() => this.getSlaTimeRemaining(this.selectedRelease!)),
        takeWhile(time => time !== 'Expirado', true)
      ).subscribe();
    }
  }

  isAdmin(): boolean {
    // Lógica para verificar se o usuário é admin
    return true; // Para fins de demonstração
  }

  goBack(): void {
    window.history.back();
  }

  goToHomolog(): void {
    this.router.navigate(['/homolog']);
  }

  goToReportPortal(): void {
    // Lógica para navegar para o portal de relatórios
    console.log('Navegar para o Report Portal');
  }

  goToTestStatus(): void {
    if (this.selectedRelease) {
      this.router.navigate(['/release', this.selectedRelease.release_id, 'test-status']);
    }
  }

  updateRelease(): void {
    console.log('Atualizar release', this.selectedRelease);
  }

  trackByReleaseId(index: number, release: Release): string {
    return release.release_id;
  }
}


