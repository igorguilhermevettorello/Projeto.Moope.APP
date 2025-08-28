import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { ListaRepresentante, Representante } from '../../../../../core/interfaces/representante.interface';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RepresentanteService } from '../../../../../services/representante/representante.service';
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
  representantes: ListaRepresentante[] = [];
  representantesFiltrados: ListaRepresentante[] = [];
  termoBusca: string = '';
  isLoading: boolean = false;

  private cdr = inject(ChangeDetectorRef);

  constructor(
    private router: Router,
    private representanteService: RepresentanteService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.carregarRepresentantes();
  }

  private setLoading(loading: boolean) {
    this.isLoading = loading;
    this.cdr.detectChanges();
  }

  carregarRepresentantes() {
    this.setLoading(true);
    this.representanteService.getRepresentantes().subscribe({
      next: (representantes) => {
        this.representantes = representantes;
        this.representantesFiltrados = [...representantes];
        this.setLoading(false);
      },
      error: (error) => {
        console.error('Erro ao carregar representantes:', error);
        const mensagem = typeof error === 'string' ? error : 'Erro ao carregar lista de representantes. Tente novamente.';
        this.toastService.showError(mensagem);
        this.setLoading(false);
      }
    });
  }

  buscar() {
    const termo = this.termoBusca.trim().toLowerCase();
    this.representantesFiltrados = this.representantes.filter(representante =>
      representante.nome.toLowerCase().includes(termo) ||
      representante.email.toLowerCase().includes(termo) ||
      representante.cpfCnpj.toLowerCase().includes(termo) ||
      representante.cidade.toLowerCase().includes(termo)
    );
  }

  limparBusca() {
    this.termoBusca = '';
    this.representantesFiltrados = [...this.representantes];
  }

  adicionar() {
    this.router.navigate(['/administrador/representantes/add']);
  }

  editar(representante: ListaRepresentante) {
    this.router.navigate(['/administrador/representantes/edit', representante.id]);
  }

  alternarStatus(representante: ListaRepresentante) {
    this.setLoading(true);
    
    // Determina qual serviço chamar baseado no status atual
    const servicoAtualizar = representante.ativo 
      ? this.representanteService.inativarRepresentante(representante.id)
      : this.representanteService.ativarRepresentante(representante.id);
    
    servicoAtualizar.pipe(
      finalize(() => {
        this.setLoading(false);
      })
    ).subscribe({
      next: (representanteAtualizado) => {
        this.carregarRepresentantes();
        const acao = representante.ativo ? 'inativado' : 'ativado';
        this.toastService.showSuccess(`Representante "${representante.nome}" ${acao} com sucesso!`);
      },
      error: (error) => {
        console.error('Erro ao alternar status do representante:', error);
        const acao = representante.ativo ? 'inativar' : 'ativar';
        const mensagem = typeof error === 'string' ? error : `Erro ao ${acao} o representante. Tente novamente.`;
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