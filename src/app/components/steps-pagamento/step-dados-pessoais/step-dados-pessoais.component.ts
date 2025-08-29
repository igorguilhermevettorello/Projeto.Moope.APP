import { Component, EventEmitter, Output, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { maskCpf, validatorCpf } from '../../../shared/utils/cpf.utils';
import { maskCnpj, validatorCnpj } from '../../../shared/utils/cnpj.utils';
import { maskFone } from '../../../shared/utils/fone.utils';

@Component({
  selector: 'app-step-dados-pessoais',
  standalone: true,
  templateUrl: './step-dados-pessoais.component.html',
  styleUrls: ['./step-dados-pessoais.component.css', '../steps-shared.css'],
  imports: [CommonModule, ReactiveFormsModule]
})
export class StepDadosPessoaisComponent implements OnInit, OnChanges {
  @Output() next = new EventEmitter<void>();
  @Output() formReady = new EventEmitter<FormGroup>();
  @Input() dadosIniciais: any = null;
  @Input() errosValidacao: any[] = [];
  form: FormGroup;
  
  // Propriedades para controle dinâmico de tipo de pessoa
  tipoPessoaDetectado: 'cpf' | 'cnpj' | null = null;
  labelCpfCnpj: string = 'CPF / CNPJ';
  placeholderCpfCnpj: string = 'Digite seu CPF ou CNPJ';

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      nome: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100),
        Validators.pattern(/^[A-Za-zÀ-ÖØ-öø-ÿ0-9\s\.\-']+$/)
      ]],
      email: ['', [Validators.required, Validators.email]],
      cpfCnpj: ['', [Validators.required]],
      telefone: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Se há dados iniciais, preenche o formulário
    if (this.dadosIniciais) {
      this.form.patchValue(this.dadosIniciais);
      
      // Detecta o tipo de pessoa baseado no CPF/CNPJ
      if (this.dadosIniciais.cpfCnpj) {
        const valorNumerico = this.dadosIniciais.cpfCnpj.replace(/\D/g, '');
        this.tipoPessoaDetectado = this.detectarTipoPessoa(valorNumerico);
        this.atualizarInterfaceTipoPessoa(this.tipoPessoaDetectado);
        this.atualizarValidacaoCpfCnpj(this.tipoPessoaDetectado);
      }
    }

    // Adiciona listeners para limpar erros de servidor quando o usuário digitar
    this.adicionarListenersLimpezaErro();
    
    // Emite o FormGroup para o componente pai
    this.formReady.emit(this.form);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['errosValidacao'] && this.form) {
      this.processarErrosDeValidacao();
    }
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

  /**
   * Processa erros de validação do servidor
   */
  processarErrosDeValidacao(): void {
    if (!this.errosValidacao || this.errosValidacao.length === 0) {
      return;
    }

    // Limpa erros anteriores
    this.limparErrosServidor();

    // Aplica novos erros
    this.errosValidacao.forEach(erro => {
      if (erro.campo === 'CpfCnpj' || erro.campo === 'NomeCliente' || erro.campo === 'Email' || erro.campo === 'Telefone') {
        const nomeCampo = this.mapearNomeCampo(erro.campo);
        const control = this.form.get(nomeCampo);
        
        if (control) {
          control.setErrors({
            ...control.errors,
            serverError: erro.mensagem
          });
          control.markAsTouched();
        }
      }
    });
  }

  /**
   * Mapeia nomes de campos do servidor para nomes de FormControls
   */
  private mapearNomeCampo(nomeCampoServidor: string): string {
    const mapeamento: { [key: string]: string } = {
      'CpfCnpj': 'cpfCnpj',
      'NomeCliente': 'nome',
      'Email': 'email',
      'Telefone': 'telefone'
    };

    return mapeamento[nomeCampoServidor] || nomeCampoServidor.toLowerCase();
  }

  /**
   * Limpa todos os erros de servidor
   */
  private limparErrosServidor(): void {
    Object.keys(this.form.controls).forEach(key => {
      const control = this.form.get(key);
      if (control && control.errors && control.errors['serverError']) {
        const { serverError, ...otherErrors } = control.errors;
        control.setErrors(Object.keys(otherErrors).length > 0 ? otherErrors : null);
      }
    });
  }

  onSubmit() {
    if (this.form.valid) {
      this.next.emit(this.form.value);
    } else {
      this.form.markAllAsTouched();
    }
  }

  detectarTipoPessoa(valorNumerico: string): 'cpf' | 'cnpj' | null {
    if (valorNumerico.length <= 11) {
      return 'cpf';
    } else if (valorNumerico.length > 11) {
      return 'cnpj';
    }
    return null;
  }

  atualizarInterfaceTipoPessoa(tipo: 'cpf' | 'cnpj' | null) {
    if (tipo === 'cpf') {
      this.labelCpfCnpj = 'CPF';
      this.placeholderCpfCnpj = '000.000.000-00';
    } else if (tipo === 'cnpj') {
      this.labelCpfCnpj = 'CNPJ';
      this.placeholderCpfCnpj = '00.000.000/0000-00';
    } else {
      this.labelCpfCnpj = 'CPF / CNPJ';
      this.placeholderCpfCnpj = 'Digite seu CPF ou CNPJ';
    }
  }

  atualizarValidacaoCpfCnpj(tipo: 'cpf' | 'cnpj' | null) {
    const cpfCnpjControl = this.form.get('cpfCnpj');
    
    if (tipo === 'cpf') {
      cpfCnpjControl?.setValidators([Validators.required, this.cpfValidator()]);
    } else if (tipo === 'cnpj') {
      cpfCnpjControl?.setValidators([Validators.required, this.cnpjValidator()]);
    } else {
      cpfCnpjControl?.setValidators([Validators.required]);
    }
    cpfCnpjControl?.updateValueAndValidity();
  }

  cpfValidator() {
    return (control: any) => {
      const cpf = control.value?.replace(/\D/g, '');
      if (!cpf || cpf.length !== 11) return null;
      const rs = validatorCpf(cpf);
      if (!rs) {
        return { cpfInvalido: true }
      }
      return null;
    };
  }

  cnpjValidator() {
    return (control: any) => {
      const cnpj = control.value?.replace(/\D/g, '');
      if (!cnpj || cnpj.length !== 14) return null;
      const rs = validatorCnpj(cnpj);
      if (!rs) {
        return { cnpjInvalido: true }
      }
      return null;
    };
  }

  aplicarMascaraCpfCnpj(event: any) {
    const input = event.target;
    let valor = input.value.replace(/\D/g, '');
    
    // Detecta o tipo baseado na quantidade de caracteres
    const novoTipo = this.detectarTipoPessoa(valor);
    
    // Aplica a máscara correspondente
    if (novoTipo === 'cpf') {
      valor = maskCpf(valor);
    } else if (novoTipo === 'cnpj') {
      valor = maskCnpj(valor);
    }
    
    // Atualiza o valor no formulário
    this.form.patchValue({ cpfCnpj: valor });
    
    // Atualiza interface e validações se o tipo mudou
    if (novoTipo !== this.tipoPessoaDetectado) {
      this.tipoPessoaDetectado = novoTipo;
      this.atualizarInterfaceTipoPessoa(novoTipo);
      this.atualizarValidacaoCpfCnpj(novoTipo);
    }
  }

  aplicarMascaraTelefone(event: any) {
    const input = event.target;
    let valor = input.value.replace(/\D/g, '');
    valor = maskFone(valor);
    this.form.patchValue({ telefone: valor });
  }
}

 