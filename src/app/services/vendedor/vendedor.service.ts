import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Representante, CreateRepresentanteRequest, UpdateRepresentanteRequest } from '../../core/interfaces/representante.interface';
import { TipoPessoa } from '../../core/interfaces/tipo-pessoa.interface';

@Injectable({
  providedIn: 'root'
})
export class RepresentanteService {
  private readonly baseUrl = `${environment.apiBaseUrl}/api/representante`;

  constructor(private http: HttpClient) { }

  getRepresentantes(): Observable<Representante[]> {
    return this.http.get<Representante[]>(this.baseUrl).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Erro ao buscar representantes:', error);
        const mensagem = this.obterMensagemErro(error, 'Erro ao carregar lista de representantes');
        return throwError(() => mensagem);
      })
    );
  }

  getRepresentanteById(id: string): Observable<Representante> {
    return this.http.get<Representante>(`${this.baseUrl}/${id}`).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error(`Erro ao buscar representante com ID ${id}:`, error);
        const mensagem = this.obterMensagemErro(error, 'Erro ao buscar representante');
        return throwError(() => mensagem);
      })
    );
  }

  adicionarRepresentante(representante: CreateRepresentanteRequest): Observable<Representante> {
    return this.http.post<Representante>(this.baseUrl, representante).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Erro ao adicionar representante:', error);
        const mensagem = this.obterMensagemErro(error, 'Erro ao adicionar representante');
        return throwError(() => mensagem);
      })
    );
  }

  atualizarRepresentante(representante: UpdateRepresentanteRequest): Observable<Representante> {
    return this.http.put<Representante>(`${this.baseUrl}/${representante.id}`, representante).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error(`Erro ao atualizar representante com ID ${representante.id}:`, error);
        const mensagem = this.obterMensagemErro(error, 'Erro ao atualizar representante');
        return throwError(() => mensagem);
      })
    );
  }

  inativarRepresentante(id: string): Observable<Representante> {
    return this.http.put<Representante>(`${this.baseUrl}/inativar/${id}`, null).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error(`Erro ao inativar representante com ID ${id}:`, error);
        const mensagem = this.obterMensagemErro(error, 'Erro ao inativar representante');
        return throwError(() => mensagem);
      })
    );
  }

  ativarRepresentante(id: string): Observable<Representante> {
    return this.http.put<Representante>(`${this.baseUrl}/ativar/${id}`, null).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error(`Erro ao ativar representante com ID ${id}:`, error);
        const mensagem = this.obterMensagemErro(error, 'Erro ao ativar representante');
        return throwError(() => mensagem);
      })
    );
  }

  alternarStatus(id: string): Observable<Representante> {
    return this.http.patch<Representante>(`${this.baseUrl}/${id}/status`, {}).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error(`Erro ao alternar status do representante ${id}:`, error);
        const mensagem = this.obterMensagemErro(error, 'Erro ao alternar status do representante');
        return throwError(() => mensagem);
      })
    );
  }

  removerRepresentante(id: string): Observable<boolean> {
    return this.http.delete<boolean>(`${this.baseUrl}/${id}`).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error(`Erro ao remover representante com ID ${id}:`, error);
        const mensagem = this.obterMensagemErro(error, 'Erro ao remover representante');
        return throwError(() => mensagem);
      })
    );
  }

  // Método para buscar endereço pelo CEP (opcional, para autocompletar)
  buscarEnderecoPorCep(cep: string): Observable<any> {
    const cepLimpo = cep.replace(/\D/g, '');
    return this.http.get(`https://viacep.com.br/ws/${cepLimpo}/json/`).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error(`Erro ao buscar CEP ${cep}:`, error);
        const mensagem = this.obterMensagemErro(error, 'Erro ao buscar CEP');
        return throwError(() => mensagem);
      })
    );
  }

  buscarTipoPessoa(): Observable<TipoPessoa[]> {
    return this.http.get<TipoPessoa[]>(`${this.baseUrl}/tipo-pessoa`).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Erro ao buscar tipos de pessoa:', error);
        const mensagem = this.obterMensagemErro(error, 'Erro ao carregar lista de tipos de pessoa');
        return throwError(() => mensagem);
      })
    );
  }

  private obterMensagemErro(error: HttpErrorResponse, mensagemPadrao: string): string {
    if (error.status === 0) {
      return 'Erro de conexão. Verifique sua internet e tente novamente.';
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