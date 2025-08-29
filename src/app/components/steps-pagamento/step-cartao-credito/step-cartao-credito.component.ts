import { Component, EventEmitter, Output, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { VendaService } from '../../../services/venda/venda.service';
import { ProcessarVendaRequest } from '../../../core/interfaces/venda.interface';
import { ToastService } from '../../../shared/toast/toast.service';
import { ValidationErrorService } from '../../../services/validation/validation-error.service';
import { ValidationError } from '../../../core/interfaces/validation-error.interface';

@Component({
  selector: 'app-step-cartao-credito',
  standalone: true,
  templateUrl: './step-cartao-credito.component.html',
  styleUrls: ['./step-cartao-credito.component.css', '../steps-shared.css'],
  imports: [CommonModule, ReactiveFormsModule]
})
export class StepCartaoCreditoComponent implements OnInit {
  @Output() finalizar = new EventEmitter<any>();
  @Input() dadosPessoais: any = null;
  @Input() dadosPedido: any = null;
  @Input() planoId: string | null = null;
  @Input() dadosIniciais: any = null;
  @Input() formDadosPessoais: FormGroup | null = null;
  @Input() formPedido: FormGroup | null = null;
  
  form: FormGroup;
  isLoading: boolean = false;
  
  constructor(
    private fb: FormBuilder,
    private vendaService: VendaService,
    private toastService: ToastService,
    private validationErrorService: ValidationErrorService
  ) {
    this.form = this.fb.group({
      nomeCartao: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
        Validators.pattern(/^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/)
      ]],
      numeroCartao: ['', [
        Validators.required,
        this.cartaoCreditoValidator()
      ]],
      cvv: ['', [
        Validators.required,
        this.cvvValidator()
      ]],
      validade: ['', [
        Validators.required,
        this.validadeValidator()
      ]]
    });
  }

  ngOnInit(): void {
    // Se há dados iniciais, preenche o formulário
    if (this.dadosIniciais) {
      this.form.patchValue(this.dadosIniciais);
    }

    // Adiciona listeners para limpar erros de servidor quando o usuário digitar
    this.adicionarListenersLimpezaErro();
  }

  /**
   * Adiciona listeners para limpar erros de servidor automaticamente
   */
  private adicionarListenersLimpezaErro(): void {
    Object.keys(this.form.controls).forEach(key => {
      this.form.get(key)?.valueChanges.subscribe(() => {
        this.limparErroServidor(key);
      });
    });
  }

  /**
   * Limpa erro de servidor de um campo específico
   */
  private limparErroServidor(nomeCampo: string): void {
    const control = this.form.get(nomeCampo);
    if (control && control.errors && control.errors['serverError']) {
      const { serverError, ...otherErrors } = control.errors;
      control.setErrors(Object.keys(otherErrors).length > 0 ? otherErrors : null);
    }
  }

  onSubmit() {
    console.log('onSubmit called');
    console.log('form.valid:', this.form.valid);
    console.log('dadosPessoais:', this.dadosPessoais);
    console.log('dadosPedido:', this.dadosPedido);
    console.log('planoId:', this.planoId);
    
    if (this.form.valid && this.dadosPessoais && this.dadosPedido && this.planoId) {
      this.processarVenda();
    } else {
      this.form.markAllAsTouched();
      if (!this.dadosPessoais || !this.dadosPedido || !this.planoId) {
        this.toastService.showError('Dados incompletos. Volte aos passos anteriores.');
      }
    }
  }

  private processarVenda(): void {
    console.log('processarVenda called');
    this.isLoading = true;
    
    // Determina o tipo de pessoa baseado no CPF/CNPJ
    const cpfCnpjNumerico = this.dadosPessoais.cpfCnpj.replace(/\D/g, '');
    const tipoPessoa = cpfCnpjNumerico.length <= 11 ? 1 : 2; // 1 = CPF, 2 = CNPJ
    console.log('CPF/CNPJ:', this.dadosPessoais.cpfCnpj);
    console.log('CPF/CNPJ numérico:', cpfCnpjNumerico);
    console.log('Tipo de pessoa calculado:', tipoPessoa, tipoPessoa === 1 ? '(CPF)' : '(CNPJ)');
    
    const dadosVenda: ProcessarVendaRequest = {
      NomeCliente: this.dadosPessoais.nome,
      Email: this.dadosPessoais.email,
      Telefone: this.dadosPessoais.telefone,
      TipoPessoa: tipoPessoa,
      CpfCnpj: this.dadosPessoais.cpfCnpj,
      VendedorId: null,
      PlanoId: this.planoId,
      Quantidade: this.dadosPedido.quantidade,
      NomeCartao: this.form.get('nomeCartao')?.value,
      NumeroCartao: this.form.get('numeroCartao')?.value.replace(/\D/g, ''),
      Cvv: this.form.get('cvv')?.value,
      DataValidade: this.form.get('validade')?.value
    };
    
    console.log('dadosVenda:', dadosVenda);

    this.vendaService.processarVenda(dadosVenda).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.toastService.showSuccess('Pagamento processado com sucesso!');
        this.finalizar.emit({
          sucesso: true,
          dadosVenda: dadosVenda,
          response: response
        });
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Erro ao processar venda:', error);
        
        // Verifica se é um erro de validação
        if (error && error.validationErrors) {
          this.processarErrosDeValidacao(error.validationErrors);
        } else {
          // Erro padrão - mostra no toast
          this.toastService.showError(error);
        }
        
        // Emite o evento de finalização com erro
        this.finalizar.emit({
          sucesso: false,
          erro: error,
          dadosVenda: dadosVenda
        });
      }
    });
  }

  /**
   * Processa erros de validação do servidor
   */
  private processarErrosDeValidacao(validationErrors: ValidationError[]): void {
    // Coleta todos os FormGroups dos componentes de steps
    const formGroups: FormGroup[] = [];
    
    console.log('Adicionando FormGroup do step de dados pessoais:', this.formDadosPessoais);

    // Adiciona o FormGroup do step de dados pessoais
    if (this.formDadosPessoais) {
      
      formGroups.push(this.formDadosPessoais);
    }
    
    // Adiciona o FormGroup do step de pedido
    if (this.formPedido) {
      formGroups.push(this.formPedido);
    }
    
    // Adiciona o FormGroup do step de cartão de crédito
    formGroups.push(this.form);
    
    console.log('FormGroups disponíveis para validação:', formGroups, validationErrors);
    
    // Aplica os erros de validação
    const mensagemGeral = this.validationErrorService.aplicarErrosDeValidacao(formGroups, validationErrors);
    
    // Se há mensagem geral, mostra no toast
    if (mensagemGeral) {
      this.toastService.showError(mensagemGeral);
    } else {
      // Se não há mensagem geral, mostra mensagem padrão
      this.toastService.showError('Por favor, corrija os erros nos campos destacados.');
    }
  }

  // Validador para cartão de crédito (algoritmo de Luhn)
  cartaoCreditoValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value?.replace(/\D/g, '');
      if (!value) return null;
      
      if (value.length < 13 || value.length > 19) {
        return { cartaoInvalido: 'Número de cartão deve ter entre 13 e 19 dígitos.' };
      }
      
      if (!this.validarLuhn(value)) {
        return { cartaoInvalido: 'Número de cartão inválido.' };
      }
      
      return null;
    };
  }

  // Validador para CVV
  cvvValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value?.replace(/\D/g, '');
      if (!value) return null;
      
      if (value.length < 3 || value.length > 4) {
        return { cvvInvalido: 'CVV deve ter 3 ou 4 dígitos.' };
      }
      
      return null;
    };
  }

  // Validador para validade (MM/AA)
  validadeValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;
      
      const regex = /^(0[1-9]|1[0-2])\/\d{2}$/;
      if (!regex.test(value)) {
        return { validadeInvalida: 'Formato inválido. Use MM/AA.' };
      }
      
      const [mes, ano] = value.split('/');
      const mesNum = parseInt(mes);
      const anoNum = parseInt('20' + ano);
      
      const agora = new Date();
      const anoAtual = agora.getFullYear();
      const mesAtual = agora.getMonth() + 1;
      
      if (anoNum < anoAtual || (anoNum === anoAtual && mesNum < mesAtual)) {
        return { validadeExpirada: 'Cartão expirado.' };
      }
      
      return null;
    };
  }

  // Algoritmo de Luhn para validar cartão de crédito
  private validarLuhn(numero: string): boolean {
    let soma = 0;
    let ehSegundo = false;
    
    for (let i = numero.length - 1; i >= 0; i--) {
      let digito = parseInt(numero.charAt(i));
      
      if (ehSegundo) {
        digito *= 2;
        if (digito > 9) {
          digito -= 9;
        }
      }
      
      soma += digito;
      ehSegundo = !ehSegundo;
    }
    
    return soma % 10 === 0;
  }

  // Máscara para número do cartão
  aplicarMascaraCartao(event: any): void {
    const input = event.target;
    let valor = input.value.replace(/\D/g, '');
    
    // Limita a 19 dígitos
    if (valor.length > 19) {
      valor = valor.substring(0, 19);
    }
    
    // Aplica formatação com espaços a cada 4 dígitos
    valor = valor.replace(/(\d{4})(?=\d)/g, '$1 ');
    
    input.value = valor;
    this.form.get('numeroCartao')?.setValue(valor);
  }

  // Máscara para CVV
  aplicarMascaraCvv(event: any): void {
    const input = event.target;
    let valor = input.value.replace(/\D/g, '');
    
    // Limita a 4 dígitos
    if (valor.length > 4) {
      valor = valor.substring(0, 4);
    }
    
    input.value = valor;
    this.form.get('cvv')?.setValue(valor);
  }

  // Máscara para validade
  aplicarMascaraValidade(event: any): void {
    const input = event.target;
    let valor = input.value.replace(/\D/g, '');
    
    // Limita a 4 dígitos
    if (valor.length > 4) {
      valor = valor.substring(0, 4);
    }
    
    // Aplica formatação MM/AA
    if (valor.length >= 2) {
      valor = valor.substring(0, 2) + '/' + valor.substring(2);
    }
    
    input.value = valor;
    this.form.get('validade')?.setValue(valor);
  }

  // Máscara para nome do cartão (apenas letras e espaços)
  aplicarMascaraNome(event: any): void {
    const input = event.target;
    let valor = input.value.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ\s]/g, '');
    
    // Converte para maiúsculas
    valor = valor.toUpperCase();
    
    input.value = valor;
    this.form.get('nomeCartao')?.setValue(valor);
  }
} 