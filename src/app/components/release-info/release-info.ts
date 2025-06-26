import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { Release } from '../../services/api.service';

@Component({
  selector: 'app-release-info',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: `
    <div class="release-info-container">
      <!-- Tempo restante -->
      <mat-card class="time-card">
        <mat-card-content>
          <h2>Tempo restante para o término:</h2>
          <div class="time-display">{{ timeRemaining }}</div>
        </mat-card-content>
      </mat-card>

      <!-- Release Notes -->
      <mat-card class="release-notes-card">
        <mat-card-content>
          <h3>Release Notes | {{ release?.platform }}</h3>
          <p>{{ release?.release_notes }}</p>
          <div class="version-info">
            <strong>{{ release?.version }} | Release {{ release?.release_number }}</strong>
          </div>
          
          <!-- QR Code placeholder -->
          <div class="qr-code">
            <div class="qr-placeholder">QR Code</div>
          </div>
          
          <div class="firebase-version">
            <strong>Versão Firebase: {{ release?.firebase_version }}</strong>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .release-info-container {
      display: flex;
      flex-direction: column;
      gap: 20px;
      margin-bottom: 20px;
    }

    .time-card {
      background-color: #2c5f5f;
      color: white;
      text-align: center;
      padding: 20px;
    }

    .time-card h2 {
      margin: 0 0 10px 0;
      font-size: 18px;
      font-weight: normal;
    }

    .time-display {
      font-size: 36px;
      font-weight: bold;
      font-family: monospace;
    }

    .release-notes-card {
      background-color: #e3f2fd;
      padding: 20px;
    }

    .release-notes-card h3 {
      color: #1976d2;
      margin: 0 0 15px 0;
    }

    .release-notes-card p {
      margin-bottom: 15px;
      line-height: 1.5;
    }

    .version-info {
      margin-bottom: 20px;
    }

    .qr-code {
      display: flex;
      justify-content: center;
      margin: 20px 0;
    }

    .qr-placeholder {
      width: 120px;
      height: 120px;
      background-color: #000;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
    }

    .firebase-version {
      text-align: center;
      margin-top: 15px;
    }

    @media (min-width: 768px) {
      .release-info-container {
        flex-direction: row;
        align-items: flex-start;
      }

      .time-card {
        flex: 0 0 250px;
      }

      .release-notes-card {
        flex: 1;
      }
    }
  `]
})
export class ReleaseInfoComponent {
  @Input() release: Release | null = null;
  
  timeRemaining = '00:42:40';
}

