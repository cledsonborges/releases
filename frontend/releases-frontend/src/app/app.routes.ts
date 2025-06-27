import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { DashboardComponent } from './components/dashboard/dashboard';
import { AdminPanelComponent } from './components/admin-panel/admin-panel';
import { ReleaseDetailComponent } from './components/release-detail/release-detail';
import { SquadManagementComponent } from './components/squad-management/squad-management';
import { ReleasesListComponent } from './components/releases-list/releases-list';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'admin', component: AdminPanelComponent },
  { path: 'releases', component: ReleasesListComponent },
  { path: 'release/:id', component: ReleaseDetailComponent },
  { path: 'squads', component: SquadManagementComponent },
  { path: 'homolog', component: ReleaseDetailComponent },
  { path: 'alpha', component: ReleaseDetailComponent },
  { path: '**', redirectTo: '/login' }
];

