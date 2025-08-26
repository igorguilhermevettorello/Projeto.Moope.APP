import { HttpClient } from '@angular/common/http';
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { LoginRequest, LoginResponse } from '../../core/interfaces/auth.interface';
import { environment } from '../../../environments/environment';
import { UsuarioLogado } from '../../core/interfaces/usuario-logado.interface';
import { isPlatformBrowser } from '@angular/common';
import { ValidationError } from '../../core/interfaces/validation-error.interface';

@Injectable({
  providedIn: 'root'
})
export class Auth {

  private readonly baseUrl = `${environment.apiBaseUrl}/api/auth`;

  constructor(private http: HttpClient, @Inject(PLATFORM_ID) private platformId: Object) {}

  login(data: LoginRequest): Observable<UsuarioLogado> {
    return this.http.post<UsuarioLogado>(`${this.baseUrl}/login`, data).pipe(
      catchError((error) => {
        if (Array.isArray(error.error)) {
          return throwError(() => error.error as ValidationError[]);
        }
        // Caso contrário, retorna um erro genérico
        return throwError(() => [{ campo: 'senha', mensagem: 'Erro inesperado ao realizar login.' }] as ValidationError[]);
      })
    );
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/logout`, {});
  }

  saveUsuarioLogado(usuarioLogado: UsuarioLogado): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(environment.tokenKey, JSON.stringify(usuarioLogado));
    }
  }

  getUsuarioLogado(): UsuarioLogado | null {
    if (isPlatformBrowser(this.platformId)) {
      const data = localStorage.getItem(environment.tokenKey);
      return data ? JSON.parse(data) as UsuarioLogado : null;
    }
    return null;
  }
}
