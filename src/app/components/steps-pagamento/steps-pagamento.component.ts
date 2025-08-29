import { Component, inject, Input, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormGroup } from '@angular/forms';
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
  router = inject(Router);
  
  // Referências aos componentes filhos
  @ViewChild(StepDadosPessoaisComponent) stepDadosPessoais!: StepDadosPessoaisComponent;
  @ViewChild(StepPedidoComponent) stepPedido!: StepPedidoComponent;
  @ViewChild(StepCartaoCreditoComponent) stepCartaoCredito!: StepCartaoCreditoComponent;
  
  // Dados coletados dos steps
  dadosPessoais: any = null;
  dadosPedido: any = null;
  planoId: string | null = null;
  
  // FormGroups dos steps
  formDadosPessoais: FormGroup | null = null;
  formPedido: FormGroup | null = null;
  
  // Estado de erro
  mostrarErro: boolean = false;
  mensagemErro: string = '';
  errosValidacao: any[] = [];

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

  onDadosPessoaisNext(dados: any) {
    this.dadosPessoais = dados;
    this.nextStep();
  }

  onPedidoNext(dados: any) {
    this.dadosPedido = dados;
    this.planoId = dados.planoId; // Usar o ID do plano dos dados do pedido
    this.nextStep();
  }

  onFormDadosPessoaisReady(form: FormGroup) {
    this.formDadosPessoais = form;
  }

  onFormPedidoReady(form: FormGroup) {
    this.formPedido = form;
  }

  finalizarPagamento(resultado: any) {
    if (resultado.sucesso) {
      
      // Prepara os parâmetros para a página de sucesso
      const queryParams = {
        planoId: this.planoId,
        quantidade: this.dadosPedido?.quantidade || 1,
        valorTotal: this.dadosPedido?.valorTotal || 0,
        // vendaId: resultado.response?.vendaId || null,
        // transacaoId: resultado.response?.transacaoId || null
      };
      
      // Remove parâmetros nulos
      // Object.keys(queryParams).forEach(key => {
      //   if (queryParams[key] === null) {
      //     delete queryParams[key];
      //   }
      // });
      
      // Redireciona para a página de sucesso
      this.router.navigate(['/compra-sucesso'], { queryParams });
    } else {
      
      // Verifica se é um erro de validação
      if (resultado.erro && resultado.erro.validationErrors) {
        this.processarErrosDeValidacao(resultado.erro.validationErrors);
        // Em caso de erro de validação, também volta para o step 1
        this.voltarParaStep1();
      } else {
        // Em caso de erro geral, retorna para o step 1
        this.voltarParaStep1();
      }
    }
  }

  private voltarParaStep1(): void {
    // NÃO reseta os dados coletados - mantém para o usuário não precisar preencher novamente
    // this.dadosPessoais = null;
    // this.dadosPedido = null;
    // this.planoId = null;
    
    // Volta para o primeiro step
    this.stepIndex = 1;
    
    // Mostra mensagem de erro (usa a mensagem já definida ou padrão)
    this.mostrarErro = true;
    if (!this.mensagemErro) {
      this.mensagemErro = 'Ocorreu um erro ao processar o pagamento. Por favor, tente novamente.';
    }
    
    // Remove a mensagem de erro após 5 segundos
    setTimeout(() => {
      this.mostrarErro = false;
      this.mensagemErro = '';
    }, 5000);
    
  }

  fecharErro(): void {
    this.mostrarErro = false;
    this.mensagemErro = '';
  }

  /**
   * Processa erros de validação do servidor
   */
  private processarErrosDeValidacao(validationErrors: any[]): void {
    // Armazena os erros para passar para os componentes
    this.errosValidacao = validationErrors;
    
    // Processa mensagem geral
    let mensagemGeral: string | null = null;
    
    validationErrors.forEach(erro => {
      if (erro.campo === 'Mensagem') {
        mensagemGeral = erro.mensagem;
      }
    });
    
    // Se há mensagem geral, armazena para ser exibida pelo voltarParaStep1
    if (mensagemGeral) {
      this.mensagemErro = mensagemGeral;
    } else {
      // Se não há mensagem geral, usa mensagem padrão
      this.mensagemErro = 'Por favor, corrija os erros nos campos destacados.';
    }
  }

  /**
   * Aplica erros de validação nos FormControls correspondentes
   */
  private aplicarErrosDeValidacao(formGroups: any[], errors: any[]): string | null {
    
    let mensagemGeral: string | null = null;

    // Primeiro, limpa todos os erros de validação customizados
    this.limparErrosCustomizados(formGroups);

    // Processa cada erro
    errors.forEach(error => {
      if (error.campo === 'Mensagem') {
        mensagemGeral = error.mensagem;
      } else {
        // Aplica erro no FormControl correspondente
        this.aplicarErroNoCampo(formGroups, error.campo, error.mensagem);
      }
    });

    return mensagemGeral;
  }

  /**
   * Aplica um erro específico em um campo
   */
  private aplicarErroNoCampo(formGroups: any[], nomeCampo: string, mensagem: string): void {
    // Mapeia o nome do campo do servidor para o nome do FormControl
    const nomeCampoMapeado = this.mapearNomeCampo(nomeCampo);
    
    for (const formGroup of formGroups) {
      const control = formGroup.get(nomeCampoMapeado);
      
      if (control) {
        // Adiciona o erro customizado
        control.setErrors({ 
          ...control.errors, 
          serverError: mensagem 
        });
        control.markAsTouched();
        break; // Para no primeiro FormGroup que contém o campo
      }
    }
  }

  /**
   * Mapeia nomes de campos do servidor para nomes de FormControls
   */
  private mapearNomeCampo(nomeCampoServidor: string): string {
    const mapeamento: { [key: string]: string } = {
      'CpfCnpj': 'cpfCnpj',
      'NomeCliente': 'nome',
      'Email': 'email',
      'Telefone': 'telefone',
      'NomeCartao': 'nomeCartao',
      'NumeroCartao': 'numeroCartao',
      'Cvv': 'cvv',
      'DataValidade': 'validade',
      'PlanoId': 'planoId',
      'Quantidade': 'quantidade'
    };

    return mapeamento[nomeCampoServidor] || nomeCampoServidor.toLowerCase();
  }

  /**
   * Limpa todos os erros customizados (serverError) dos FormControls
   */
  private limparErrosCustomizados(formGroups: any[]): void {
    formGroups.forEach(formGroup => {
      Object.keys(formGroup.controls).forEach(key => {
        const control = formGroup.get(key);
        if (control && control.errors && control.errors['serverError']) {
          const { serverError, ...otherErrors } = control.errors;
          control.setErrors(Object.keys(otherErrors).length > 0 ? otherErrors : null);
        }
      });
    });
  }
} 