import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Cliente, CreateClienteRequest, UpdateClienteRequest, CreateClienteDto, ListaClienteDto, UpdateClienteDto, ClienteDetalheDto } from '../../core/interfaces/cliente.interface';
import { TipoPessoa } from '../../core/interfaces/tipo-pessoa.interface';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  private readonly baseUrl = `${environment.apiBaseUrl}/api/cliente`;

  constructor(private http: HttpClient) { }
  
  getClientes(): Observable<ListaClienteDto[]> {
    return this.http.get<ListaClienteDto[]>(this.baseUrl).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Erro ao buscar clientes:', error);
        const mensagem = this.obterMensagemErro(error, 'Erro ao carregar lista de clientes');
        return throwError(() => mensagem);
      })
    );
  }

  getClienteById(id: string): Observable<ClienteDetalheDto> {
    return this.http.get<ClienteDetalheDto>(`${this.baseUrl}/${id}`).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error(`Erro ao buscar cliente com ID ${id}:`, error);
        const mensagem = this.obterMensagemErro(error, 'Erro ao buscar cliente');
        return throwError(() => mensagem);
      })
    );
  }

  adicionarCliente(cliente: CreateClienteDto): Observable<Cliente> {    
    return this.http.post<Cliente>(this.baseUrl, cliente).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Erro ao adicionar cliente:', error);
        console.error('Dados que foram enviados:', cliente);
        console.error('Status do erro:', error.status);
        console.error('Corpo da resposta de erro:', error.error);
        const mensagem = this.obterMensagemErro(error, 'Erro ao adicionar cliente');
        return throwError(() => mensagem);
      })
    );
  }

  atualizarCliente(cliente: UpdateClienteDto): Observable<Cliente> {
    return this.http.put<Cliente>(`${this.baseUrl}/${cliente.id}`, cliente).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error(`Erro ao atualizar cliente com ID ${cliente.id}:`, error);
        const mensagem = this.obterMensagemErro(error, 'Erro ao atualizar cliente');
        return throwError(() => mensagem);
      })
    );
  }

  inativarCliente(id: string): Observable<Cliente> {
    return this.http.put<Cliente>(`${this.baseUrl}/inativar/${id}`, null).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error(`Erro ao inativar cliente com ID ${id}:`, error);
        const mensagem = this.obterMensagemErro(error, 'Erro ao inativar cliente');
        return throwError(() => mensagem);
      })
    );
  }

  ativarCliente(id: string): Observable<Cliente> {
    return this.http.put<Cliente>(`${this.baseUrl}/ativar/${id}`, null).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error(`Erro ao ativar cliente com ID ${id}:`, error);
        const mensagem = this.obterMensagemErro(error, 'Erro ao ativar cliente');
        return throwError(() => mensagem);
      })
    );
  }

  alternarStatus(id: string): Observable<Cliente> {
    return this.http.patch<Cliente>(`${this.baseUrl}/${id}/status`, {}).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error(`Erro ao alternar status do cliente ${id}:`, error);
        const mensagem = this.obterMensagemErro(error, 'Erro ao alternar status do cliente');
        return throwError(() => mensagem);
      })
    );
  }

  removerCliente(id: string): Observable<boolean> {
    return this.http.delete<boolean>(`${this.baseUrl}/${id}`).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error(`Erro ao remover cliente com ID ${id}:`, error);
        const mensagem = this.obterMensagemErro(error, 'Erro ao remover cliente');
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
        console.error('Erro ao buscar clientes:', error);
        const mensagem = this.obterMensagemErro(error, 'Erro ao carregar lista de clientes');
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