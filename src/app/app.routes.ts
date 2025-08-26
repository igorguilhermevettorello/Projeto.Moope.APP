import { Routes } from '@angular/router';
import { HomePage } from './pages/public/home/home.page';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';
import { PerfilUsuarioEnum } from './core/enums/perfil-usuario-enum';
import { planoRoutes } from './pages/private/administrador/plano/plano.routes';
import { clienteRoutes } from './pages/private/administrador/cliente/cliente.routes';
import { representanteRoutes } from './pages/private/administrador/representante/representante.routes';
import { BackofficeLayoutComponent } from './components/layout/backoffice/backoffice.component';

export const routes: Routes = [
  { path: '', component: HomePage },
  { path: 'login', loadComponent: () => import('./pages/public/auth/login/login').then(m => m.Login) },
  {
    path: 'administrador',
    component: BackofficeLayoutComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { expectedRoles: [PerfilUsuarioEnum.ADMINISTRADOR] },
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/private/administrador/dashboard/dashboard').then(m => m.Dashboard)
      },
      {
        path: 'planos',
        children: planoRoutes
      },
      {
        path: 'clientes',
        children: clienteRoutes
      },
      {
        path: 'representantes',
        children: representanteRoutes
      }
      // Adicione aqui outras rotas do administrador, como representantes, etc.
    ]
  },
  {
    path: 'vendedor/dashboard',
    loadComponent: () => import('./pages/private/vendedor/dashboard/dashboard').then(m => m.Dashboard),
    canActivate: [AuthGuard, RoleGuard],
    data: { expectedRoles: [PerfilUsuarioEnum.VENDEDOR] }
  },
  {
    path: 'cliente/dashboard',
    loadComponent: () => import('./pages/private/cliente/dashboard/dashboard').then(m => m.Dashboard),
    canActivate: [AuthGuard, RoleGuard],
    data: { expectedRoles: [PerfilUsuarioEnum.CLIENTE] }
  }
];
