import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { Plano } from '../plano.interface';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PlanoService } from '../../../../../services/plano/plano.service';
import { ToastService } from '../../../../../shared/toast/toast.service';
import { finalize } from 'rxjs/operators';
import { formatarParaMoedaBrasileira } from '../../../../../shared/utils/mask.money.util';

@Component({
  selector: 'app-lista',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lista.html',
  styleUrl: './lista.css'
})
export class Lista implements OnInit {
  planos: Plano[] = [];
  planosFiltrados: Plano[] = [];
  termoBusca: string = '';
  isLoading: boolean = false;
  teste: string = "0";

  private cdr = inject(ChangeDetectorRef);

  constructor(
    private router: Router,
    private planoService: PlanoService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.carregarPlanos();
  }

  private setLoading(loading: boolean) {
    this.isLoading = loading;
    this.cdr.detectChanges();
  }

  carregarPlanos() {
    this.setLoading(true);
    this.planoService.getPlanos().subscribe({
      next: (planos) => {
        this.planos = planos;
        this.planosFiltrados = [...planos];
        this.setLoading(false);
      },
      error: (error) => {
        console.error('Erro ao carregar planos:', error);
        const mensagem = typeof error === 'string' ? error : 'Erro ao carregar lista de planos. Tente novamente.';
        this.toastService.showError(mensagem);
        this.setLoading(false);
      }
    });
  }

  buscar() {
    const termo = this.termoBusca.trim().toLowerCase();
    this.planosFiltrados = this.planos.filter(plano =>
      plano.codigo.toLowerCase().includes(termo) ||
      plano.descricao.toLowerCase().includes(termo)
    );
  }

  limparBusca() {
    this.termoBusca = '';
    this.planosFiltrados = [...this.planos];
  }

  adicionar() {
    this.router.navigate(['/administrador/planos/add']);
  }

  editar(plano: Plano) {
    this.router.navigate(['/administrador/planos/edit', plano.id]);
  }

  alternarStatus(plano: Plano) {
    this.setLoading(true);
    
    // Determina qual serviço chamar baseado no status atual
    const servicoAtualizar = plano.status 
      ? this.planoService.inativarPlano(plano.id)
      : this.planoService.ativarPlano(plano.id);
    
    servicoAtualizar.pipe(
      finalize(() => {
        this.setLoading(false);
      })
    ).subscribe({
      next: (planoAtualizado) => {
        this.carregarPlanos();
        const acao = plano.status ? 'inativado' : 'ativado';
        this.toastService.showSuccess(`Plano "${plano.descricao}" ${acao} com sucesso!`);
      },
      error: (error) => {
        console.error('Erro ao alternar status do plano:', error);
        const acao = plano.status ? 'inativar' : 'ativar';
        const mensagem = typeof error === 'string' ? error : `Erro ao ${acao} o plano. Tente novamente.`;
        this.toastService.showError(mensagem);
      }
    });
  }

  formatarMoeda(valor: number | string): string {
    return formatarParaMoedaBrasileira(parseFloat(valor.toString()));
  }
}
