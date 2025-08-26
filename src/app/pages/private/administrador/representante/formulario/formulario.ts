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
      celular: ['', [Validators.required]],
      
      // Endereço
      cep: ['', [Validators.required, Validators.pattern(/^\d{5}-?\d{3}$/)]],
      endereco: ['', [Validators.required]],
      numero: ['', [Validators.required]],
      bairro: ['', [Validators.required]],
      cidade: ['', [Validators.required]],
      uf: ['', [Validators.required]],
      complemento: [''],
      
      // Dados de Acesso (apenas na criação)
      senha: ['', this.isEditMode ? [] : [Validators.required, Validators.minLength(6)]],
      confirmarSenha: [''],
      
      // Status
      status: [true]
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
          celular: representante.celular,
          cep: representante.cep,
          endereco: representante.endereco,
          numero: representante.numero,
          bairro: representante.bairro,
          cidade: representante.cidade,
          uf: representante.uf,
          complemento: representante.complemento,
          status: representante.status
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
      return { cnpjInvalido: rs }
    };
  }

  senhasIguaisValidator() {
    return (form: any) => {
      if (this.isEditMode) return null;
      
      const senha = form.get('senha')?.value;
      const confirmarSenha = form.get('confirmarSenha')?.value;
      
      if (senha && confirmarSenha && senha !== confirmarSenha) {
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

  aplicarMascaraCelular(event: any) {
    const input = event.target;
    let valor = input.value.replace(/\D/g, '');
    valor = maskFone(valor);
    this.representanteForm.patchValue({ celular: valor });
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
              endereco: endereco.logradouro,
              bairro: endereco.bairro,
              cidade: endereco.localidade,
              uf: endereco.uf
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
               this.cpfCnpj?.valid && this.celular?.valid;
        return typeof verificadorDadosPessoais === 'boolean' ? verificadorDadosPessoais : false;
      case 'endereco':
        let verificadorEndereco =  this.cep?.valid && this.endereco?.valid && this.numero?.valid && 
               this.bairro?.valid && this.cidade?.valid && this.uf?.valid;
        return typeof verificadorEndereco === 'boolean' ? verificadorEndereco : false;
      case 'dados-acesso':
        if (this.isEditMode) return true;
        let verificadorDadosAcesso = this.senha?.valid && !this.representanteForm.errors?.['senhasDiferentes'];
        return typeof verificadorDadosAcesso === 'boolean' ? verificadorDadosAcesso : false;
      default:
        return false;
    }
  }

  proximaAba() {
    const tabs = ['dados-pessoais', 'endereco', 'dados-acesso'];
    const currentIndex = tabs.indexOf(this.activeTab);
    if (currentIndex < tabs.length - 1) {
      this.setActiveTab(tabs[currentIndex + 1]);
    }
  }

  abaAnterior() {
    const tabs = ['dados-pessoais', 'endereco', 'dados-acesso'];
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
          tipoPessoa: this.representanteForm.get('tipoPessoa')?.value,
          cpfCnpj: this.representanteForm.get('cpfCnpj')?.value.replace(/\D/g, ''),
          celular: this.representanteForm.get('celular')?.value.replace(/\D/g, ''),
          cep: this.representanteForm.get('cep')?.value.replace(/\D/g, ''),
          endereco: this.representanteForm.get('endereco')?.value,
          numero: this.representanteForm.get('numero')?.value,
          bairro: this.representanteForm.get('bairro')?.value,
          cidade: this.representanteForm.get('cidade')?.value,
          uf: this.representanteForm.get('uf')?.value,
          complemento: this.representanteForm.get('complemento')?.value,
          status: this.representanteForm.get('status')?.value
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
          tipoPessoa: this.representanteForm.get('tipoPessoa')?.value,
          cpfCnpj: this.representanteForm.get('cpfCnpj')?.value.replace(/\D/g, ''),
          celular: this.representanteForm.get('celular')?.value.replace(/\D/g, ''),
          cep: this.representanteForm.get('cep')?.value.replace(/\D/g, ''),
          endereco: this.representanteForm.get('endereco')?.value,
          numero: this.representanteForm.get('numero')?.value,
          bairro: this.representanteForm.get('bairro')?.value,
          cidade: this.representanteForm.get('cidade')?.value,
          uf: this.representanteForm.get('uf')?.value,
          complemento: this.representanteForm.get('complemento')?.value,
          senha: this.representanteForm.get('senha')?.value
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
  get celular() { return this.representanteForm.get('celular'); }
  get cep() { return this.representanteForm.get('cep'); }
  get endereco() { return this.representanteForm.get('endereco'); }
  get numero() { return this.representanteForm.get('numero'); }
  get bairro() { return this.representanteForm.get('bairro'); }
  get cidade() { return this.representanteForm.get('cidade'); }
  get uf() { return this.representanteForm.get('uf'); }
  get complemento() { return this.representanteForm.get('complemento'); }
  get senha() { return this.representanteForm.get('senha'); }
  get confirmarSenha() { return this.representanteForm.get('confirmarSenha'); }
  get status() { return this.representanteForm.get('status'); }
}