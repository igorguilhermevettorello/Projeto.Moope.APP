import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Auth } from '../services/auth/auth';
import { UsuarioLogado } from '../core/interfaces/usuario-logado.interface';


@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(private router: Router, private authService: Auth) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const expectedRoles = route.data['expectedRoles'] as string[];
    const usuarioLogado = this.authService.getUsuarioLogado();
    if (!usuarioLogado) {
      this.router.navigate(['/login']);
      return false;
    }
    const userRole = usuarioLogado.data.user.perfil;
    if (!userRole || !expectedRoles.includes(userRole)) {
      // Redireciona para o dashboard correto conforme a role
      if (userRole === 'admin') {
        this.router.navigate(['/administrador/dashboard']);
      } else if (userRole === 'vendedor') {
        this.router.navigate(['/vendedor/dashboard']);
      } else if (userRole === 'cliente') {
        this.router.navigate(['/cliente/dashboard']);
      } else {
        this.router.navigate(['/login']);
      }
      return false;
    }
    return true;
  }
} 