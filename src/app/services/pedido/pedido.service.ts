import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Pedido, ListaPedidoDto, CreatePedidoRequest, UpdatePedidoRequest, StatusPedido } from '../../core/interfaces/pedido.interface';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PedidoService {
  private readonly baseUrl = `${environment.apiBaseUrl}/api/pedidos`;

  constructor(private http: HttpClient) {}

  getPedidos(): Observable<ListaPedidoDto[]> {
    return this.http.get<ListaPedidoDto[]>(this.baseUrl);
  }

  getPedidoById(id: string): Observable<Pedido> {
    return this.http.get<Pedido>(`${this.baseUrl}/${id}`);
  }

  criarPedido(pedido: CreatePedidoRequest): Observable<Pedido> {
    return this.http.post<Pedido>(this.baseUrl, pedido);
  }

  atualizarPedido(pedido: UpdatePedidoRequest): Observable<Pedido> {
    return this.http.put<Pedido>(`${this.baseUrl}/${pedido.id}`, pedido);
  }

  cancelarPedido(id: string, motivo: string): Observable<Pedido> {
    return this.http.put<Pedido>(`${this.baseUrl}/${id}/cancelar`, { motivo });
  }

  alterarStatusPedido(id: string, status: StatusPedido): Observable<Pedido> {
    return this.http.put<Pedido>(`${this.baseUrl}/${id}/status`, { status });
  }

  getPedidosPorCliente(clienteId: string): Observable<ListaPedidoDto[]> {
    return this.http.get<ListaPedidoDto[]>(`${this.baseUrl}/cliente/${clienteId}`);
  }

  getPedidosPorRepresentante(representanteId: string): Observable<ListaPedidoDto[]> {
    return this.http.get<ListaPedidoDto[]>(`${this.baseUrl}/representante/${representanteId}`);
  }

  getPedidosPorStatus(status: StatusPedido): Observable<ListaPedidoDto[]> {
    return this.http.get<ListaPedidoDto[]>(`${this.baseUrl}/status/${status}`);
  }
}
