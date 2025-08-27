import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../environments/environment';
import { UsuarioLogado } from '../interfaces/usuario-logado.interface';

export const authInterceptor: HttpInterceptorFn = (request: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const platformId = inject(PLATFORM_ID);
  
  // Só executa no browser para evitar problemas no SSR
  if (!isPlatformBrowser(platformId)) {
    return next(request);
  }

  // Obtém o token do localStorage
  const usuarioLogadoData = localStorage.getItem(environment.tokenKey);
  
  if (usuarioLogadoData) {
    try {
      const usuarioLogado: UsuarioLogado = JSON.parse(usuarioLogadoData);
      const token = usuarioLogado.data?.accessToken;
      
      if (token) {
        // Clona a requisição e adiciona o header Authorization
        const authenticatedRequest = request.clone({
          headers: request.headers.set('Authorization', `Bearer ${token}`)
        });
        
        return next(authenticatedRequest);
      }
    } catch (error) {
      console.error('Erro ao processar token de autenticação:', error);
      // Remove token inválido do localStorage
      localStorage.removeItem(environment.tokenKey);
    }
  }

  // Se não há token válido, prossegue com a requisição original
  return next(request);
};
