import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { DashboardComponent } from './components/dashboard/dashboard';
import { AdminPanelComponent } from './components/admin-panel/admin-panel';
import { ReleaseDetailComponent } from './components/release-detail/release-detail';
import { ReportsComponent } from './components/reports/reports';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'admin', component: AdminPanelComponent },
  { path: 'release/:id', component: ReleaseDetailComponent },
  { path: 'reports', component: ReportsComponent },
  { path: 'homolog', component: ReleaseDetailComponent }, // Reutilizar componente para ambientes
  { path: 'alpha', component: ReleaseDetailComponent },   // Reutilizar componente para ambientes
  { path: '**', redirectTo: '/login' }
];

