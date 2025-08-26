import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Auth } from '../services/auth/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router, private authService: Auth) {}

  canActivate(): boolean {
    const usuarioLogado = this.authService.getUsuarioLogado();
    if (!usuarioLogado) {
      this.router.navigate(['/login']);
      return false;
    }
    return true;
  }
} 