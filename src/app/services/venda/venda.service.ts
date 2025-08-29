import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ProcessarVendaRequest, ProcessarVendaResponse } from '../../core/interfaces/venda.interface';
import { ValidationError } from '../../core/interfaces/validation-error.interface';

@Injectable({
  providedIn: 'root'
})
export class VendaService {
  private readonly baseUrl = `${environment.apiBaseUrl}/api/venda`;

  constructor(private http: HttpClient) { }

  processarVenda(dadosVenda: ProcessarVendaRequest): Observable<ProcessarVendaResponse> {
    return this.http.post<ProcessarVendaResponse>(`${this.baseUrl}/processar`, dadosVenda).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Erro ao processar venda:', error);
        
        // Tenta extrair erros de validação
        const validationErrors = this.extrairErrosDeValidacao(error);
        if (validationErrors && validationErrors.length > 0) {
          return throwError(() => ({ validationErrors, originalError: error }));
        }
        
        // Se não há erros de validação, usa o tratamento padrão
        const mensagem = this.obterMensagemErro(error, 'Erro ao processar venda');
        return throwError(() => mensagem);
      })
    );
  }

  /**
   * Extrai erros de validação da resposta de erro
   */
  private extrairErrosDeValidacao(error: HttpErrorResponse): ValidationError[] | null {
    try {
      // Verifica se o erro tem a estrutura esperada
      if (error.error && Array.isArray(error.error)) {
        return error.error as ValidationError[];
      }
      
      // Verifica se o erro está dentro de uma propriedade
      if (error.error && error.error.errors && Array.isArray(error.error.errors)) {
        return error.error.errors as ValidationError[];
      }
      
      return null;
    } catch (e) {
      console.error('Erro ao extrair erros de validação:', e);
      return null;
    }
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
    
    if (error.status === 400) {
      return error.error?.message || 'Dados inválidos. Verifique as informações e tente novamente.';
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
