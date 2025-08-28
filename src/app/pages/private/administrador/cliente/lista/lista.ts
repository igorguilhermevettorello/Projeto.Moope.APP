import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { Cliente } from '../../../../../core/interfaces/cliente.interface';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ClienteService } from '../../../../../services/cliente/cliente.service';
import { ToastService } from '../../../../../shared/toast/toast.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-lista',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lista.html',
  styleUrl: './lista.css'
})
export class Lista implements OnInit {
  clientes: Cliente[] = [];
  clientesFiltrados: Cliente[] = [];
  termoBusca: string = '';
  isLoading: boolean = false;

  private cdr = inject(ChangeDetectorRef);

  constructor(
    private router: Router,
    private clienteService: ClienteService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.carregarClientes();
  }

  private setLoading(loading: boolean) {
    this.isLoading = loading;
    this.cdr.detectChanges();
  }

  carregarClientes() {
    this.setLoading(true);
    this.clienteService.getClientes().subscribe({
      next: (clientes) => {
        this.clientes = clientes;
        this.clientesFiltrados = [...clientes];
        this.setLoading(false);
      },
      error: (error) => {
        console.error('Erro ao carregar clientes:', error);
        const mensagem = typeof error === 'string' ? error : 'Erro ao carregar lista de clientes. Tente novamente.';
        this.toastService.showError(mensagem);
        this.setLoading(false);
      }
    });
  }

  buscar() {
    const termo = this.termoBusca.trim().toLowerCase();
    this.clientesFiltrados = this.clientes.filter(cliente =>
      cliente.nome.toLowerCase().includes(termo) ||
      cliente.email.toLowerCase().includes(termo) ||
      cliente.cpfCnpj.toLowerCase().includes(termo) ||
      cliente.cidade.toLowerCase().includes(termo)
    );
  }

  limparBusca() {
    this.termoBusca = '';
    this.clientesFiltrados = [...this.clientes];
  }

  adicionar() {
    this.router.navigate(['/administrador/clientes/add']);
  }

  editar(cliente: Cliente) {
    this.router.navigate(['/administrador/clientes/edit', cliente.id]);
  }

  alternarStatus(cliente: Cliente) {
    this.setLoading(true);
    
    // Determina qual serviço chamar baseado no status atual
    const servicoAtualizar = cliente.status 
      ? this.clienteService.inativarCliente(cliente.id)
      : this.clienteService.ativarCliente(cliente.id);
    
    servicoAtualizar.pipe(
      finalize(() => {
        this.setLoading(false);
      })
    ).subscribe({
      next: (clienteAtualizado) => {
        this.carregarClientes();
        const acao = cliente.status ? 'inativado' : 'ativado';
        this.toastService.showSuccess(`Cliente "${cliente.nome}" ${acao} com sucesso!`);
      },
      error: (error) => {
        console.error('Erro ao alternar status do cliente:', error);
        const acao = cliente.status ? 'inativar' : 'ativar';
        const mensagem = typeof error === 'string' ? error : `Erro ao ${acao} o cliente. Tente novamente.`;
        this.toastService.showError(mensagem);
      }
    });
  }

  formatarTipoPessoa(tipoPessoa: number): string {
    return tipoPessoa === 1 ? 'Pessoa Física' : 'Pessoa Jurídica';
  }

  formatarCpfCnpj(cpfCnpj: string): string {
    // Remove todos os caracteres não numéricos
    const apenasNumeros = cpfCnpj.replace(/\D/g, '');
    
    if (apenasNumeros.length === 11) {
      // CPF: 000.000.000-00
      return apenasNumeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else if (apenasNumeros.length === 14) {
      // CNPJ: 00.000.000/0000-00
      return apenasNumeros.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    
    return cpfCnpj;
  }

  formatarCelular(celular: string): string {
    // Remove todos os caracteres não numéricos
    const apenasNumeros = celular.replace(/\D/g, '');
    
    if (apenasNumeros.length === 11) {
      // Celular: (00) 00000-0000
      return apenasNumeros.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (apenasNumeros.length === 10) {
      // Telefone: (00) 0000-0000
      return apenasNumeros.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    
    return celular;
  }
}