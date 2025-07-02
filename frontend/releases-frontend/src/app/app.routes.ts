import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { DashboardComponent } from './components/dashboard/dashboard';
import { AdminPanelComponent } from './components/admin-panel/admin-panel';
import { ReleaseDetailComponent } from './components/release-detail/release-detail';
import { SquadManagementComponent } from './components/squad-management/squad-management';
import { ReleasesListComponent } from './components/releases-list/releases-list';
import { ReleasesTableComponent } from './components/releases-table/releases-table';
import { DemoComponent } from './components/demo/demo';
import { SimplifiedReleasesListComponent } from './components/simplified-releases-list/simplified-releases-list';
import { SimplifiedReleaseDetailComponent } from './components/simplified-release-detail/simplified-release-detail';
import { ReleaseTestStatusComponent } from './components/release-test-status/release-test-status';
import { SquadsParticipantesComponent } from './components/squads-participantes/squads-participantes';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'admin', component: AdminPanelComponent },
  { path: 'releases', component: ReleasesListComponent },
  { path: 'release/:id', component: ReleaseDetailComponent },
  { path: 'release/:id/test-status', component: ReleaseTestStatusComponent },
  { path: 'squads', component: SquadManagementComponent },
  { path: 'squads-participantes', component: SquadsParticipantesComponent },
 // { path: 'demo', component: DemoComponent },
  { path: 'homolog', component: SquadsParticipantesComponent }, // Redirecionado para a nova lista simplificada
 // { path: 'simplified-releases', component: SimplifiedReleasesListComponent },
  { path: 'simplified-release/:id', component: SimplifiedReleaseDetailComponent },
  { path: 'alpha', component: ReleasesTableComponent },
  { path: '**', redirectTo: '/login' }
];


