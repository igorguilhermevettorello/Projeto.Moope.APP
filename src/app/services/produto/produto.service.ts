import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Produto, ProdutoRequest, ProdutoResponse } from '../../core/interfaces/produto.interface';
import { ValidationError } from '../../core/interfaces/validation-error.interface';

@Injectable({
  providedIn: 'root'
})
export class ProdutoService {

  private readonly baseUrl = `${environment.apiBaseUrl}/api/produtos`;

  constructor(private http: HttpClient) {}

  /**
   * Busca todos os produtos
   */
  getProdutos(): Observable<ProdutoResponse[]> {
    return this.http.get<ProdutoResponse[]>(this.baseUrl).pipe(
      catchError((error) => {
        console.error('Erro ao buscar produtos:', error);
        return throwError(() => 'Erro ao buscar produtos');
      })
    );
  }

  /**
   * Busca produto por ID
   */
  getProdutoById(id: number): Observable<ProdutoResponse> {
    return this.http.get<ProdutoResponse>(`${this.baseUrl}/${id}`).pipe(
      catchError((error) => {
        console.error(`Erro ao buscar produto com ID ${id}:`, error);
        return throwError(() => 'Erro ao buscar produto');
      })
    );
  }

  /**
   * Busca produtos por categoria
   */
  getProdutosByCategoria(categoriaId: number): Observable<ProdutoResponse[]> {
    return this.http.get<ProdutoResponse[]>(`${this.baseUrl}/categoria/${categoriaId}`).pipe(
      catchError((error) => {
        console.error(`Erro ao buscar produtos da categoria ${categoriaId}:`, error);
        return throwError(() => 'Erro ao buscar produtos por categoria');
      })
    );
  }

  /**
   * Busca produtos por nome (busca parcial)
   */
  getProdutosByNome(nome: string): Observable<ProdutoResponse[]> {
    return this.http.get<ProdutoResponse[]>(`${this.baseUrl}/buscar?nome=${encodeURIComponent(nome)}`).pipe(
      catchError((error) => {
        console.error(`Erro ao buscar produtos com nome "${nome}":`, error);
        return throwError(() => 'Erro ao buscar produtos por nome');
      })
    );
  }

  /**
   * Cria um novo produto
   */
  createProduto(produto: ProdutoRequest): Observable<ProdutoResponse> {
    return this.http.post<ProdutoResponse>(this.baseUrl, produto).pipe(
      catchError((error) => {
        console.error('Erro ao criar produto:', error);
        return throwError(() => 'Erro ao criar produto');
      })
    );
  }

  /**
   * Atualiza um produto existente
   */
  updateProduto(id: number, produto: ProdutoRequest): Observable<ProdutoResponse> {
    return this.http.put<ProdutoResponse>(`${this.baseUrl}/${id}`, produto).pipe(
      catchError((error) => {
        console.error(`Erro ao atualizar produto com ID ${id}:`, error);
        return throwError(() => 'Erro ao atualizar produto');
      })
    );
  }

  /**
   * Atualiza parcialmente um produto (PATCH)
   */
  updateProdutoPartial(id: number, updates: Partial<ProdutoRequest>): Observable<ProdutoResponse> {
    return this.http.patch<ProdutoResponse>(`${this.baseUrl}/${id}`, updates).pipe(
      catchError((error) => {
        console.error(`Erro ao atualizar parcialmente produto com ID ${id}:`, error);
        return throwError(() => 'Erro ao atualizar produto');
      })
    );
  }

  /**
   * Remove um produto
   */
  deleteProduto(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      catchError((error) => {
        console.error(`Erro ao remover produto com ID ${id}:`, error);
        return throwError(() => 'Erro ao remover produto');
      })
    );
  }

  /**
   * Atualiza o estoque de um produto
   */
  updateEstoque(id: number, quantidade: number): Observable<ProdutoResponse> {
    return this.http.patch<ProdutoResponse>(`${this.baseUrl}/${id}/estoque`, { quantidade }).pipe(
      catchError((error) => {
        console.error(`Erro ao atualizar estoque do produto ${id}:`, error);
        return throwError(() => 'Erro ao atualizar estoque');
      })
    );
  }

  /**
   * Ativa/desativa um produto
   */
  toggleStatus(id: number): Observable<ProdutoResponse> {
    return this.http.patch<ProdutoResponse>(`${this.baseUrl}/${id}/status`, {}).pipe(
      catchError((error) => {
        console.error(`Erro ao alterar status do produto ${id}:`, error);
        return throwError(() => 'Erro ao alterar status do produto');
      })
    );
  }

  /**
   * Busca produtos com estoque baixo
   */
  getProdutosEstoqueBaixo(limiteMinimo: number = 10): Observable<ProdutoResponse[]> {
    return this.http.get<ProdutoResponse[]>(`${this.baseUrl}/estoque-baixo?limite=${limiteMinimo}`).pipe(
      catchError((error) => {
        console.error('Erro ao buscar produtos com estoque baixo:', error);
        return throwError(() => 'Erro ao buscar produtos com estoque baixo');
      })
    );
  }

  /**
   * Busca produtos ativos
   */
  getProdutosAtivos(): Observable<ProdutoResponse[]> {
    return this.http.get<ProdutoResponse[]>(`${this.baseUrl}/ativos`).pipe(
      catchError((error) => {
        console.error('Erro ao buscar produtos ativos:', error);
        return throwError(() => 'Erro ao buscar produtos ativos');
      })
    );
  }
}