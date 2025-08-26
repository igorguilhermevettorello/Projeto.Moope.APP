import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StepDadosPessoaisComponent } from './step-dados-pessoais/step-dados-pessoais.component';
import { StepPedidoComponent } from './step-pedido/step-pedido.component';
import { StepCartaoCreditoComponent } from './step-cartao-credito/step-cartao-credito.component';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-steps-pagamento',
  standalone: true,
  templateUrl: './steps-pagamento.component.html',
  styleUrl: './steps-pagamento.component.css',
  imports: [CommonModule, StepDadosPessoaisComponent, StepPedidoComponent, StepCartaoCreditoComponent]
})
export class StepsPagamentoComponent {
  @Input() plano: string | null = null;
  stepIndex = 1;
  http = inject(HttpClient);

  nextStep() {
    if (this.stepIndex < 3) {
      this.stepIndex++;
    }
  }

  prevStep() {
    if (this.stepIndex > 1) {
      this.stepIndex--;
    }
  }

  finalizarPagamento(dadosCartao: any) {
    // Substitua a URL pelo endpoint real do seu webservice
    this.http.post('https://url-do-seu-webservice.com/api/pagamento', dadosCartao)
      .subscribe({
        next: () => alert('Pagamento realizado com sucesso!'),
        error: () => alert('Erro ao processar pagamento.')
      });
  }
} 