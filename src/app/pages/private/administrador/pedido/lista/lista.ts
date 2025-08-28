import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { ListaPedidoDto, StatusPedido } from '../../../../../core/interfaces/pedido.interface';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PedidoService } from '../../../../../services/pedido/pedido.service';
import { ToastService } from '../../../../../shared/toast/toast.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-lista-pedidos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lista.html',
  styleUrl: './lista.css'
})
export class ListaPedidos implements OnInit {
  pedidos: ListaPedidoDto[] = [];
  pedidosFiltrados: ListaPedidoDto[] = [];
  termoBusca: string = '';
  statusFiltro: string = '';
  isLoading: boolean = false;

  statusOptions = [
    { value: '', label: 'Todos os Status' },
    { value: StatusPedido.PENDENTE, label: 'Pendente' },
    { value: StatusPedido.CONFIRMADO, label: 'Confirmado' },
    { value: StatusPedido.PROCESSANDO, label: 'Processando' },
    { value: StatusPedido.ENVIADO, label: 'Enviado' },
    { value: StatusPedido.ENTREGUE, label: 'Entregue' },
    { value: StatusPedido.CANCELADO, label: 'Cancelado' }
  ];

  private cdr = inject(ChangeDetectorRef);

  constructor(
    private router: Router,
    private pedidoService: PedidoService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.carregarPedidos();
  }

  private setLoading(loading: boolean) {
    this.isLoading = loading;
    this.cdr.detectChanges();
  }

  carregarPedidos() {
    this.setLoading(true);
    this.pedidoService.getPedidos().subscribe({
      next: (pedidos) => {
        this.pedidos = pedidos;
        this.aplicarFiltros();
        this.setLoading(false);
      },
      error: (error) => {
        console.error('Erro ao carregar pedidos:', error);
        const mensagem = typeof error === 'string' ? error : 'Erro ao carregar lista de pedidos. Tente novamente.';
        this.toastService.showError(mensagem);
        this.setLoading(false);
      }
    });
  }

  aplicarFiltros() {
    let filtrados = [...this.pedidos];

    // Filtro por termo de busca
    if (this.termoBusca.trim()) {
      const termo = this.termoBusca.trim().toLowerCase();
      filtrados = filtrados.filter(pedido =>
        pedido.numero.toLowerCase().includes(termo) ||
        pedido.clienteNome.toLowerCase().includes(termo) ||
        pedido.clienteEmail.toLowerCase().includes(termo) ||
        pedido.representanteNome?.toLowerCase().includes(termo) ||
        pedido.cidade.toLowerCase().includes(termo)
      );
    }

    // Filtro por status
    if (this.statusFiltro) {
      filtrados = filtrados.filter(pedido => pedido.status === this.statusFiltro);
    }

    this.pedidosFiltrados = filtrados;
  }

  buscar() {
    this.aplicarFiltros();
  }

  limparFiltros() {
    this.termoBusca = '';
    this.statusFiltro = '';
    this.aplicarFiltros();
  }

  visualizar(pedido: ListaPedidoDto) {
    this.router.navigate(['/administrador/pedidos', pedido.id]);
  }

  alterarStatus(pedido: ListaPedidoDto) {
    // this.setLoading(true);
    
    // this.pedidoService.alterarStatusPedido(pedido.id, novoStatus).pipe(
    //   finalize(() => {
    //     this.setLoading(false);
    //   })
    // ).subscribe({
    //   next: () => {
    //     this.carregarPedidos();
    //     this.toastService.showSuccess(`Status do pedido ${pedido.numero} alterado para ${this.getStatusLabel(novoStatus)}!`);
    //   },
    //   error: (error) => {
    //     console.error('Erro ao alterar status do pedido:', error);
    //     const mensagem = typeof error === 'string' ? error : 'Erro ao alterar status do pedido. Tente novamente.';
    //     this.toastService.showError(mensagem);
    //   }
    // });
  }

  cancelarPedido(pedido: ListaPedidoDto) {
    const motivo = prompt('Digite o motivo do cancelamento:');
    if (motivo && motivo.trim()) {
      this.setLoading(true);
      
      this.pedidoService.cancelarPedido(pedido.id, motivo.trim()).pipe(
        finalize(() => {
          this.setLoading(false);
        })
      ).subscribe({
        next: () => {
          this.carregarPedidos();
          this.toastService.showSuccess(`Pedido ${pedido.numero} cancelado com sucesso!`);
        },
        error: (error) => {
          console.error('Erro ao cancelar pedido:', error);
          const mensagem = typeof error === 'string' ? error : 'Erro ao cancelar pedido. Tente novamente.';
          this.toastService.showError(mensagem);
        }
      });
    }
  }

  getStatusLabel(status: StatusPedido): string {
    const statusMap = {
      [StatusPedido.PENDENTE]: 'Pendente',
      [StatusPedido.CONFIRMADO]: 'Confirmado',
      [StatusPedido.PROCESSANDO]: 'Processando',
      [StatusPedido.ENVIADO]: 'Enviado',
      [StatusPedido.ENTREGUE]: 'Entregue',
      [StatusPedido.CANCELADO]: 'Cancelado'
    };
    return statusMap[status] || status;
  }

  getStatusClass(status: StatusPedido): string {
    const classMap = {
      [StatusPedido.PENDENTE]: 'badge-warning',
      [StatusPedido.CONFIRMADO]: 'badge-info',
      [StatusPedido.PROCESSANDO]: 'badge-primary',
      [StatusPedido.ENVIADO]: 'badge-secondary',
      [StatusPedido.ENTREGUE]: 'badge-success',
      [StatusPedido.CANCELADO]: 'badge-danger'
    };
    return classMap[status] || 'badge-secondary';
  }

  formatarData(data: string): string {
    return new Date(data).toLocaleDateString('pt-BR');
  }

  formatarValor(valor: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  }

  podeAlterarStatus(pedido: ListaPedidoDto): boolean {
    return pedido.status !== StatusPedido.ENTREGUE && pedido.status !== StatusPedido.CANCELADO;
  }

  podeCancelar(pedido: ListaPedidoDto): boolean {
    return pedido.status === StatusPedido.PENDENTE || pedido.status === StatusPedido.CONFIRMADO;
  }
}
