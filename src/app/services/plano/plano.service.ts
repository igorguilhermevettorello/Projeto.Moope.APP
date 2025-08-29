import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Plano } from '../../pages/private/administrador/plano/plano.interface';

@Injectable({
  providedIn: 'root'
})
export class PlanoService {
  private readonly baseUrl = `${environment.apiBaseUrl}/api/plano`;

  constructor(private http: HttpClient) { }

  getPlanos(): Observable<Plano[]> {
    return this.http.get<Plano[]>(this.baseUrl).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Erro ao buscar planos:', error);
        const mensagem = this.obterMensagemErro(error, 'Erro ao carregar lista de planos');
        return throwError(() => mensagem);
      })
    );
  }

  getPlanoByCodigo(codigo: string): Observable<Plano> {
    return this.http.get<Plano>(`${this.baseUrl}/${codigo}`).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error(`Erro ao buscar plano com código ${codigo}:`, error);
        const mensagem = this.obterMensagemErro(error, 'Erro ao buscar plano');
        return throwError(() => mensagem);
      })
    );
  }

  getPlanoSelecionado(codigo: string): Observable<Plano> {
    return this.http.get<Plano>(`${this.baseUrl}/selecionado/${codigo}`).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error(`Erro ao buscar plano selecionado com código ${codigo}:`, error);
        const mensagem = this.obterMensagemErro(error, 'Erro ao buscar plano selecionado');
        return throwError(() => mensagem);
      })
    );
  }

  adicionarPlano(plano: Plano): Observable<Plano> {
    return this.http.post<Plano>(this.baseUrl, plano).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Erro ao adicionar plano:', error);
        const mensagem = this.obterMensagemErro(error, 'Erro ao adicionar plano');
        return throwError(() => mensagem);
      })
    );
  }

  atualizarPlano(plano: Plano): Observable<Plano> {
    return this.http.put<Plano>(`${this.baseUrl}/${plano.id}`, plano).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error(`Erro ao atualizar plano com código ${plano.codigo}:`, error);
        const mensagem = this.obterMensagemErro(error, 'Erro ao atualizar plano');
        return throwError(() => mensagem);
      })
    );
  }

  inativarPlano(codigo: string): Observable<Plano> {
    return this.http.put<Plano>(`${this.baseUrl}/inativar/${codigo}`, null).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error(`Erro ao atualizar plano com código ${codigo}:`, error);
        const mensagem = this.obterMensagemErro(error, 'Erro ao atualizar plano');
        return throwError(() => mensagem);
      })
    );
  }

  ativarPlano(codigo: string): Observable<Plano> {
    return this.http.put<Plano>(`${this.baseUrl}/ativar/${codigo}`, null).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error(`Erro ao atualizar plano com código ${codigo}:`, error);
        const mensagem = this.obterMensagemErro(error, 'Erro ao atualizar plano');
        return throwError(() => mensagem);
      })
    );
  }

  alternarStatus(codigo: string): Observable<Plano> {
    return this.http.patch<Plano>(`${this.baseUrl}/${codigo}/status`, {}).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error(`Erro ao alternar status do plano ${codigo}:`, error);
        const mensagem = this.obterMensagemErro(error, 'Erro ao alternar status do plano');
        return throwError(() => mensagem);
      })
    );
  }

  removerPlano(codigo: string): Observable<boolean> {
    return this.http.delete<boolean>(`${this.baseUrl}/${codigo}`).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error(`Erro ao remover plano com código ${codigo}:`, error);
        const mensagem = this.obterMensagemErro(error, 'Erro ao remover plano');
        return throwError(() => mensagem);
      })
    );
  }

  private obterMensagemErro(error: HttpErrorResponse, mensagemPadrao: string): string {
    if (error.status === 0) {
      return 'Erro de conexão. Verifique sua internet e tente novamente.';
    }
    
    if (error.status === 401) {
      return 'Sessão expirada. Faça login novamente.';
    }
    
    if (error.status === 403) {
      return 'Acesso negado. Você não tem permissão para esta ação.';
    }
    
    if (error.status === 404) {
      return 'Recurso não encontrado.';
    }
    
    if (error.status === 500) {
      return 'Erro interno do servidor. Tente novamente mais tarde.';
    }
    
    if (error.error && typeof error.error === 'string') {
      return error.error;
    }
    
    if (error.error && error.error.message) {
      return error.error.message;
    }
    
    return mensagemPadrao;
  }
}
