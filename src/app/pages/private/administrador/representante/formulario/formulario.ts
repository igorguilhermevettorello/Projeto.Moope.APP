import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Representante, CreateRepresentanteRequest, UpdateRepresentanteRequest } from '../../../../../core/interfaces/representante.interface';
import { TipoPessoa } from '../../../../../core/interfaces/tipo-pessoa.interface';
import { RepresentanteService } from '../../../../../services/representante/representante.service';
import { ToastService } from '../../../../../shared/toast/toast.service';
import { maskCpf, validatorCpf } from '../../../../../shared/utils/cpf.utils';
import { maskCnpj, validatorCnpj } from '../../../../../shared/utils/cnpj.utils';
import { maskFone } from '../../../../../shared/utils/fone.utils';
import { maskCep } from '../../../../../shared/utils/cep.utils';

@Component({
  selector: 'app-formulario',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './formulario.html',
  styleUrl: './formulario.css'
})
export class Formulario implements OnInit {
  representanteForm: FormGroup;
  isEditMode: boolean = false;
  representanteId: string = '';
  isLoading: boolean = false;
  activeTab: string = 'dados-pessoais';
  tiposPessoa: TipoPessoa[] = [];
  estados: string[] = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  labelCpfCnpj: string = 'CPF / CNPJ';
  placeholderCpfCnpj: string = 'Selecione o tipo de pessoa';
  disabledCpfCnpj: boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private representanteService: RepresentanteService,
    private toastService: ToastService,
    private fb: FormBuilder
  ) {
    this.representanteForm = this.fb.group({
      // Dados Pessoais
      nome: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      tipoPessoa: ['', [Validators.required]],
      cpfCnpj: ['', [Validators.required]],
      telefone: ['', [Validators.required]],
      ativo: [true],
      
      // Endereço
      cep: ['', [Validators.required, Validators.pattern(/^\d{5}-?\d{3}$/)]],
      logradouro: ['', [Validators.required]],
      numero: ['', [Validators.required]],
      bairro: ['', [Validators.required]],
      cidade: ['', [Validators.required]],
      estado: ['', [Validators.required]],
      complemento: [''],
      
      // Dados da Conta
      chavePix: ['', [Validators.required]],
      percentualComissao: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      nomeFantasia: [''],
      inscricaoEstadual: [''],
      
      // Dados de Acesso (apenas na criação)
      senha: ['', this.isEditMode ? [] : [Validators.required, Validators.minLength(6)]],
      confirmacao: [''],
    });

    // Adiciona validador de confirmação de senha
    this.representanteForm.addValidators(this.senhasIguaisValidator());
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.representanteId = params['id'];
        // Remove validação de senha no modo de edição
        this.representanteForm.get('senha')?.clearValidators();
        this.representanteForm.get('confirmarSenha')?.clearValidators();
        this.representanteForm.updateValueAndValidity();
      } else {
        this.isEditMode = false;
      }
    });

    // Carrega os tipos de pessoa primeiro, depois carrega o representante se necessário
    this.carregarTiposPessoa();

    // Observa mudanças no tipo de pessoa para ajustar validação do CPF/CNPJ
    this.representanteForm.get('tipoPessoa')?.valueChanges.subscribe((tipoPessoa) => {
      this.atualizarValidacaoCpfCnpj(tipoPessoa);
    });
  }

  carregarTiposPessoa() {
    this.representanteService.buscarTipoPessoa().subscribe({
      next: (tipos) => {
        this.tiposPessoa = tipos;
        // Carrega os dados do representante após carregar os tipos de pessoa (se estivermos no modo de edição)
        if (this.isEditMode && this.representanteId) {
          this.carregarRepresentante();
        }
      },
      error: (error) => {
        console.error('Erro ao carregar tipos de pessoa:', error);
        const mensagem = typeof error === 'string' ? error : 'Erro ao carregar tipos de pessoa. Usando valores padrão.';
        this.toastService.showError(mensagem);
        // Fallback para valores hardcoded em caso de erro
        this.tiposPessoa = [
          { value: '1', label: 'Pessoa Física' },
          { value: '2', label: 'Pessoa Jurídica' }
        ];
        if (!this.isEditMode) {
          this.representanteForm.patchValue({ tipoPessoa: '1' });
        }
        // Carrega os dados do representante mesmo com erro nos tipos de pessoa (se estivermos no modo de edição)
        if (this.isEditMode && this.representanteId) {
          this.carregarRepresentante();
        }
      }
    });
  }

  private setFormDisabledState(disabled: boolean) {
    if (this.isEditMode) {
      this.representanteForm.enable();
      // No modo de edição, desabilita os campos de senha e CPF/CNPJ
      this.representanteForm.get('senha')?.disable();
      this.representanteForm.get('confirmarSenha')?.disable();
      this.representanteForm.get('cpfCnpj')?.disable();
      this.disabledCpfCnpj = true;
      return;
    }
    
    if (disabled) {
      this.representanteForm.disable();
      this.disabledCpfCnpj = true;
    } else {
      this.representanteForm.enable();
      this.disabledCpfCnpj = false;
    }
  }

  carregarRepresentante() {
    this.isLoading = true;
    this.setFormDisabledState(true);
    this.representanteService.getRepresentanteById(this.representanteId).subscribe({
      next: (representante) => {
        this.representanteForm.patchValue({
          nome: representante.nome,
          email: representante.email,
          tipoPessoa: representante.tipoPessoa,
          cpfCnpj: representante.cpfCnpj,
          telefone: representante.telefone,
          ativo: representante.ativo,
          cep: representante.cep,
          logradouro: representante.logradouro,
          numero: representante.numero,
          bairro: representante.bairro,
          cidade: representante.cidade,
          estado: representante.estado,
          complemento: representante.complemento,
          // logradouro: representante.endereco.logradouro,
          // numero: representante.endereco.numero,
          // bairro: representante.endereco.bairro,
          // cidade: representante.endereco.cidade,
          // estado: representante.endereco.estado,
          // complemento: representante.endereco.complemento,
          chavePix: representante.chavePix,
          percentualComissao: representante.percentualComissao,
          nomeFantasia: representante.nomeFantasia,
          inscricaoEstadual: representante.inscricaoEstadual
        });
        this.isLoading = false;
        this.setFormDisabledState(false);
      },
      error: (error) => {
        console.error('Erro ao carregar representante:', error);
        const mensagem = typeof error === 'string' ? error : 'Erro ao carregar dados do representante. Tente novamente.';
        this.toastService.showError(mensagem);
        this.isLoading = false;
        this.setFormDisabledState(false);
        this.router.navigate(['/administrador/representantes']);
      }
    });
  }

  atualizarValidacaoCpfCnpj(tipoPessoa: string) {
    const cpfCnpjControl = this.representanteForm.get('cpfCnpj');

    if (tipoPessoa === '') {
      this.labelCpfCnpj = 'CPF / CNPJ';
      this.placeholderCpfCnpj = 'Selecione o tipo de pessoa';
      this.representanteForm.patchValue({ cpfCnpj: '' });
      cpfCnpjControl?.clearValidators();
      cpfCnpjControl?.updateValueAndValidity();
      return;  
    }

    if (tipoPessoa === '1') {
      this.labelCpfCnpj = 'CPF';
      this.placeholderCpfCnpj = '000.000.000-00';
      cpfCnpjControl?.setValidators([Validators.required, this.cpfValidator()]);
    } else {
      this.labelCpfCnpj = 'CNPJ';
      this.placeholderCpfCnpj = '00.000.000/0000-00';
      cpfCnpjControl?.setValidators([Validators.required, this.cnpjValidator()]);
    }
    cpfCnpjControl?.updateValueAndValidity();
  }

  cpfValidator() {
    return (control: any) => {
      const cpf = control.value?.replace(/\D/g, '');
      const rs = validatorCpf(cpf);
      return { cpfInvalido: rs }
    };
  }

  cnpjValidator() {
    return (control: any) => {
      const cnpj = control.value?.replace(/\D/g, '');
      const rs = validatorCnpj(cnpj);
      if (!rs) {
        return { cnpjInvalido: rs }
      }
      return null;
    };
  }

  senhasIguaisValidator() {
    return (form: any) => {
      if (this.isEditMode) return null;
      
      const senha = form.get('senha')?.value;
      const confirmacao = form.get('confirmacao')?.value;
      
      if (senha && confirmacao && senha !== confirmacao) {
        return { senhasDiferentes: true };
      }
      return null;
    };
  }

  aplicarMascaraCpfCnpj(event: any) {
    const tipoPessoa = this.representanteForm.get('tipoPessoa')?.value;
    if (tipoPessoa === '') {
      this.representanteForm.patchValue({ cpfCnpj: '' });
      return;
    }

    const input = event.target;
    let valor = input.value.replace(/\D/g, '');
    
    
    if (tipoPessoa === '1') {
      valor = maskCpf(valor);
    } else {
      valor = maskCnpj(valor);
    }
    
    this.representanteForm.patchValue({ cpfCnpj: valor });
  }

  aplicarMascaraTelefone(event: any) {
    const input = event.target;
    let valor = input.value.replace(/\D/g, '');
    valor = maskFone(valor);
    this.representanteForm.patchValue({ telefone: valor });
  }

  aplicarMascaraCep(event: any) {
    const input = event.target;
    let valor = input.value.replace(/\D/g, '');
    valor = maskCep(valor);
    this.representanteForm.patchValue({ cep: valor });
  }

  buscarCep() {
    const cep = this.representanteForm.get('cep')?.value?.replace(/\D/g, '');
    if (cep && cep.length === 8) {
      this.representanteService.buscarEnderecoPorCep(cep).subscribe({
        next: (endereco) => {
          if (!endereco.erro) {
            this.representanteForm.patchValue({
              logradouro: endereco.logradouro,
              bairro: endereco.bairro,
              cidade: endereco.localidade,
              estado: endereco.uf
            });
          }
        },
        error: (error) => {
          console.warn('Erro ao buscar CEP:', error);
        }
      });
    }
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  isTabValid(tab: string): boolean {
    switch (tab) {
      case 'dados-pessoais':
        let verificadorDadosPessoais = this.nome?.valid && this.email?.valid && this.tipoPessoa?.valid && 
               this.cpfCnpj?.valid && this.telefone?.valid;
        return typeof verificadorDadosPessoais === 'boolean' ? verificadorDadosPessoais : false;
      case 'endereco':
        let verificadorEndereco =  this.cep?.valid && this.logradouro?.valid && this.numero?.valid && 
               this.bairro?.valid && this.cidade?.valid && this.estado?.valid;
        return typeof verificadorEndereco === 'boolean' ? verificadorEndereco : false;
      case 'dados-conta':
        let verificadorDadosConta = this.chavePix?.valid && this.percentualComissao?.valid;
        return typeof verificadorDadosConta === 'boolean' ? verificadorDadosConta : false;
      case 'dados-acesso':
        if (this.isEditMode) return true;
        let verificadorDadosAcesso = this.senha?.valid && !this.representanteForm.errors?.['senhasDiferentes'];
        return typeof verificadorDadosAcesso === 'boolean' ? verificadorDadosAcesso : false;
      default:
        return false;
    }
  }

  proximaAba() {
    const tabs = this.isEditMode ? 
      ['dados-pessoais', 'endereco', 'dados-conta'] : 
      ['dados-pessoais', 'endereco', 'dados-conta', 'dados-acesso'];
    const currentIndex = tabs.indexOf(this.activeTab);
    if (currentIndex < tabs.length - 1) {
      this.setActiveTab(tabs[currentIndex + 1]);
    }
  }

  abaAnterior() {
    const tabs = this.isEditMode ? 
      ['dados-pessoais', 'endereco', 'dados-conta'] : 
      ['dados-pessoais', 'endereco', 'dados-conta', 'dados-acesso'];
    const currentIndex = tabs.indexOf(this.activeTab);
    if (currentIndex > 0) {
      this.setActiveTab(tabs[currentIndex - 1]);
    }
  }

  salvar() {
    if (this.representanteForm.valid) {
      this.isLoading = true;
      this.setFormDisabledState(true);
      
      if (this.isEditMode) {
        const representante: UpdateRepresentanteRequest = {
          id: this.representanteId,
          nome: this.representanteForm.get('nome')?.value,
          email: this.representanteForm.get('email')?.value,
          cpfCnpj: this.representanteForm.get('cpfCnpj')?.value.replace(/\D/g, ''),
          telefone: this.representanteForm.get('telefone')?.value.replace(/\D/g, ''),
          tipoPessoa: parseInt(this.representanteForm.get('tipoPessoa')?.value),
          ativo: this.representanteForm.get('ativo')?.value,
          endereco: {
            cep: this.representanteForm.get('cep')?.value.replace(/\D/g, ''),
            logradouro: this.representanteForm.get('logradouro')?.value,
            numero: this.representanteForm.get('numero')?.value,
            complemento: this.representanteForm.get('complemento')?.value,
            bairro: this.representanteForm.get('bairro')?.value,
            cidade: this.representanteForm.get('cidade')?.value,
            estado: this.representanteForm.get('estado')?.value
          },
          chavePix: this.representanteForm.get('chavePix')?.value,
          percentualComissao: this.representanteForm.get('percentualComissao')?.value,
          nomeFantasia: this.representanteForm.get('nomeFantasia')?.value,
          inscricaoEstadual: this.representanteForm.get('inscricaoEstadual')?.value
        };

        this.representanteService.atualizarRepresentante(representante).subscribe({
          next: () => {
            this.toastService.showSuccess('Representante atualizado com sucesso!');
            this.router.navigate(['/administrador/representantes']);
          },
          error: (error) => {
            console.error('Erro ao atualizar representante:', error);
            const mensagem = typeof error === 'string' ? error : 'Erro ao atualizar representante. Tente novamente.';
            this.toastService.showError(mensagem);
            this.isLoading = false;
            this.setFormDisabledState(false);
          }
        });
      } else {
        const representante: CreateRepresentanteRequest = {
          nome: this.representanteForm.get('nome')?.value,
          email: this.representanteForm.get('email')?.value,
          cpfCnpj: this.representanteForm.get('cpfCnpj')?.value.replace(/\D/g, ''),
          telefone: this.representanteForm.get('telefone')?.value.replace(/\D/g, ''),
          tipoPessoa: parseInt(this.representanteForm.get('tipoPessoa')?.value),
          ativo: this.representanteForm.get('ativo')?.value,
          endereco: {
            cep: this.representanteForm.get('cep')?.value.replace(/\D/g, ''),
            logradouro: this.representanteForm.get('logradouro')?.value,
            numero: this.representanteForm.get('numero')?.value,
            complemento: this.representanteForm.get('complemento')?.value,
            bairro: this.representanteForm.get('bairro')?.value,
            cidade: this.representanteForm.get('cidade')?.value,
            estado: this.representanteForm.get('estado')?.value
          },
          senha: this.representanteForm.get('senha')?.value,
          confirmacao: this.representanteForm.get('confirmacao')?.value,
          chavePix: this.representanteForm.get('chavePix')?.value,
          percentualComissao: this.representanteForm.get('percentualComissao')?.value,
          nomeFantasia: this.representanteForm.get('nomeFantasia')?.value,
          inscricaoEstadual: this.representanteForm.get('inscricaoEstadual')?.value
        };

        this.representanteService.adicionarRepresentante(representante).subscribe({
          next: () => {
            this.toastService.showSuccess('Representante cadastrado com sucesso!');
            this.router.navigate(['/administrador/representantes']);
          },
          error: (error) => {
            console.error('Erro ao adicionar representante:', error);
            const mensagem = typeof error === 'string' ? error : 'Erro ao cadastrar representante. Tente novamente.';
            this.toastService.showError(mensagem);
            this.isLoading = false;
            this.setFormDisabledState(false);
          }
        });
      }
    } else {
      this.marcarCamposComoTocados();
      this.toastService.showError('Por favor, corrija os erros no formulário.');
    }
  }

  marcarCamposComoTocados() {
    Object.keys(this.representanteForm.controls).forEach(key => {
      const control = this.representanteForm.get(key);
      control?.markAsTouched();
    });
  }

  cancelar() {
    this.router.navigate(['/administrador/representantes']);
  }

  // Getters para facilitar o acesso no template
  get nome() { return this.representanteForm.get('nome'); }
  get email() { return this.representanteForm.get('email'); }
  get tipoPessoa() { return this.representanteForm.get('tipoPessoa'); }
  get cpfCnpj() { return this.representanteForm.get('cpfCnpj'); }
  get telefone() { return this.representanteForm.get('telefone'); }
  get ativo() { return this.representanteForm.get('ativo'); }
  get cep() { return this.representanteForm.get('cep'); }
  get logradouro() { return this.representanteForm.get('logradouro'); }
  get numero() { return this.representanteForm.get('numero'); }
  get bairro() { return this.representanteForm.get('bairro'); }
  get cidade() { return this.representanteForm.get('cidade'); }
  get estado() { return this.representanteForm.get('estado'); }
  get complemento() { return this.representanteForm.get('complemento'); }
  get chavePix() { return this.representanteForm.get('chavePix'); }
  get percentualComissao() { return this.representanteForm.get('percentualComissao'); }
  get nomeFantasia() { return this.representanteForm.get('nomeFantasia'); }
  get inscricaoEstadual() { return this.representanteForm.get('inscricaoEstadual'); }
  get senha() { return this.representanteForm.get('senha'); }
  get confirmacao() { return this.representanteForm.get('confirmacao'); }
}