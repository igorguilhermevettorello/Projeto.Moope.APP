import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PlanoService } from '../../../services/plano/plano.service';
import { Plano } from '../../private/administrador/plano/plano.interface';
import { MoedaBrasileiraPipe } from '../../../shared/pipes/moeda-brasileira-pipe';

@Component({
  selector: 'app-compra-sucesso',
  standalone: true,
  templateUrl: './compra-sucesso.component.html',
  styleUrls: ['./compra-sucesso.component.css'],
  imports: [CommonModule, MoedaBrasileiraPipe]
})
export class CompraSucessoComponent implements OnInit {
  plano: Plano | null = null;
  quantidade: number = 1;
  valorTotal: number = 0;
  isLoading: boolean = true;
  vendaId: string | null = null;
  transacaoId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private planoService: PlanoService
  ) {}

  ngOnInit(): void {
    // Recupera os dados da query string
    this.route.queryParams.subscribe(params => {
      const planoId = params['planoId'];
      const quantidade = params['quantidade'];
      const valorTotal = params['valorTotal'];
      const vendaId = params['vendaId'];
      const transacaoId = params['transacaoId'];

      if (planoId && quantidade && valorTotal) {
        this.quantidade = parseInt(quantidade);
        this.valorTotal = parseFloat(valorTotal);
        this.vendaId = vendaId;
        this.transacaoId = transacaoId;
        
        this.carregarPlano(planoId);
      } else {
        // Se não há dados válidos, redireciona para home
        this.router.navigate(['/']);
      }
    });
  }

  private carregarPlano(planoId: string): void {
    this.planoService.getPlanoSelecionado(planoId).subscribe({
      next: (plano) => {
        this.plano = plano;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar plano:', error);
        this.isLoading = false;
        // Fallback para dados mockados se a API falhar
        this.carregarDadosMockados(planoId);
      }
    });
  }

  private carregarDadosMockados(planoId: string): void {
    const dadosMockados = {
      '1234': {
        id: '1',
        codigo: '1234',
        descricao: 'PLANO BÁSICO',
        status: true,
        valor: '59.00'
      },
      '9876': {
        id: '2',
        codigo: '9876',
        descricao: 'PLANO PREMIUM',
        status: true,
        valor: '79.00'
      }
    };

    const planoMockado = dadosMockados[planoId as keyof typeof dadosMockados];
    if (planoMockado) {
      this.plano = planoMockado;
    }
  }

  voltarParaHome(): void {
    this.router.navigate(['/']);
  }

  acessarDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}
