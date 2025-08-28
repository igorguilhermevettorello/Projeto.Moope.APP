import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Cliente, CreateClienteRequest, UpdateClienteRequest, CreateClienteDto, UpdateEnderecoDto, UpdateClienteDto } from '../../../../../core/interfaces/cliente.interface';
import { TipoPessoa } from '../../../../../core/interfaces/tipo-pessoa.interface';
import { ClienteService } from '../../../../../services/cliente/cliente.service';
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
  clienteForm: FormGroup;
  isEditMode: boolean = false;
  clienteId: string = '';
  isLoading: boolean = false;
  activeTab: string = 'dados-pessoais';
  tiposPessoa: TipoPessoa[] = [];
  clienteInfo: any = null;
  estados: string[] = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  labelCpfCnpj: string = 'CPF / CNPJ';
  placeholderCpfCnpj: string = 'Selecione o tipo de pessoa';
  // disabledCpfCnpj: boolean = false;

  formularioCliente: any = {
    "dados-pessoais": ["nome", "email", "tipoPessoa", "cpfCnpj", "telefone"],
    "endereco": ["cep", "endereco", "numero", "bairro", "cidade", "uf", "complemento"],    
    "dados-acesso": ["senha", "confirmarSenha"]
  }

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private clienteService: ClienteService,
    private toastService: ToastService,
    private fb: FormBuilder
  ) {
    this.clienteForm = this.fb.group({
      // Dados Pessoais
      nome: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      tipoPessoa: ['', [Validators.required]],
      cpfCnpj: ['', [Validators.required]],
      telefone: ['', [Validators.required]],
      
      // Endereço
      cep: ['', [Validators.required, Validators.pattern(/^\d{5}-?\d{3}$/)]],
      logradouro: ['', [Validators.required]],
      numero: ['', [Validators.required]],
      bairro: ['', [Validators.required]],
      cidade: ['', [Validators.required]],
      estado: ['', [Validators.required]],
      complemento: [''],
      
      // Dados de Acesso (apenas na criação)
      senha: ['', this.isEditMode ? [] : [Validators.required, Validators.minLength(6)]],
      confirmarSenha: [''],
      
      // Status
      status: [true]
    });

    // Adiciona validador de confirmação de senha
    this.clienteForm.addValidators(this.senhasIguaisValidator());
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.clienteId = params['id'];
        // Remove validação de senha no modo de edição
        this.clienteForm.get('senha')?.clearValidators();
        this.clienteForm.get('confirmarSenha')?.clearValidators();
        this.clienteForm.updateValueAndValidity();
      } else {
        this.isEditMode = false;
      }
    });

    // Carrega os tipos de pessoa primeiro, depois carrega o cliente se necessário
    this.carregarTiposPessoa();

    // Observa mudanças no tipo de pessoa para ajustar validação do CPF/CNPJ
    this.clienteForm.get('tipoPessoa')?.valueChanges.subscribe((tipoPessoa) => {
      this.atualizarValidacaoCpfCnpj(tipoPessoa);
    });
  }

  carregarTiposPessoa() {
    this.clienteService.buscarTipoPessoa().subscribe({
      next: (tipos) => {
        this.tiposPessoa = tipos;
        // // Define o primeiro tipo como padrão se não estiver em modo de edição
        // if (!this.isEditMode && tipos.length > 0) {
        //   this.clienteForm.patchValue({ tipoPessoa: tipos[0].value });
        // }
        // Carrega os dados do cliente após carregar os tipos de pessoa (se estivermos no modo de edição)
        if (this.isEditMode && this.clienteId) {
          this.carregarCliente();
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
          this.clienteForm.patchValue({ tipoPessoa: '1' });
        }
        // Carrega os dados do cliente mesmo com erro nos tipos de pessoa (se estivermos no modo de edição)
        if (this.isEditMode && this.clienteId) {
          this.carregarCliente();
        }
      }
    });
  }

  private setFormDisabledState(disabled: boolean) {
    if (this.isEditMode) {
      this.clienteForm.enable();
      // No modo de edição, desabilita os campos de senha e CPF/CNPJ
      this.clienteForm.get('senha')?.disable();
      this.clienteForm.get('confirmarSenha')?.disable();
      // this.clienteForm.get('cpfCnpj')?.disable();
      // this.disabledCpfCnpj = true;
      return;
    }
    
    if (disabled) {
      this.clienteForm.disable();
      // this.disabledCpfCnpj = true;
    } else {
      this.clienteForm.enable();
      // this.disabledCpfCnpj = false;
    }
  }

  carregarCliente() {
    this.isLoading = true;
    this.setFormDisabledState(true);
    this.clienteService.getClienteById(this.clienteId).subscribe({
      next: (cliente) => {
        // Armazena informações completas do cliente
        this.clienteInfo = cliente;
        console.log("cliente", cliente.logradouro);
        this.clienteForm.patchValue({
          nome: cliente.nome,
          email: cliente.email,
          tipoPessoa: cliente.tipoPessoa,
          cpfCnpj: cliente.tipoPessoa === 1 ? maskCpf(cliente.cpfCnpj) : maskCnpj(cliente.cpfCnpj),
          telefone: maskFone(cliente.telefone),
          cep: maskCep(cliente.cep),
          logradouro: cliente.logradouro,
          numero: cliente.numero,
          bairro: cliente.bairro,
          cidade: cliente.cidade,
          estado: cliente.estado,
          complemento: cliente.complemento,
          status: cliente.ativo
        });
        this.isLoading = false;
        this.setFormDisabledState(false);
      },
      error: (error) => {
        console.error('Erro ao carregar cliente:', error);
        const mensagem = typeof error === 'string' ? error : 'Erro ao carregar dados do cliente. Tente novamente.';
        this.toastService.showError(mensagem);
        this.isLoading = false;
        this.setFormDisabledState(false);
        this.router.navigate(['/administrador/clientes']);
      }
    });
  }

  atualizarValidacaoCpfCnpj(tipoPessoa: string) {
    const cpfCnpjControl = this.clienteForm.get('cpfCnpj');

    if (tipoPessoa === '') {
      this.labelCpfCnpj = 'CPF / CNPJ';
      this.placeholderCpfCnpj = 'Selecione o tipo de pessoa';
      this.clienteForm.patchValue({ cpfCnpj: '' });
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
      // if (rs) control?.updateValueAndValidity();
      // return { cpfInvalido: !rs }
      if (!rs) {
        return { cpfInvalido: rs }
      }
      return null;
    };
  }

  cnpjValidator() {
    return (control: any) => {
      const cnpj = control.value?.replace(/\D/g, '');
      const rs = validatorCnpj(cnpj);
      // if (rs) control?.updateValueAndValidity();
      // return { cnpjInvalido: rs }
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
      const confirmarSenha = form.get('confirmarSenha')?.value;
      
      if (senha && confirmarSenha && senha !== confirmarSenha) {
        return { senhasDiferentes: true };
      }
      return null;
    };
  }

  aplicarMascaraCpfCnpj(event: any) {
    const tipoPessoa = this.clienteForm.get('tipoPessoa')?.value;
    if (tipoPessoa === '') {
      this.clienteForm.patchValue({ cpfCnpj: '' });
      return;
    }

    const input = event.target;
    let valor = input.value.replace(/\D/g, '');
    
    
    if (tipoPessoa === '1') {
      valor = maskCpf(valor);
    } else {
      valor = maskCnpj(valor);
    }
    
    this.clienteForm.patchValue({ cpfCnpj: valor });
  }

  aplicarMascaraTelefone(event: any) {
    const input = event.target;
    let valor = input.value.replace(/\D/g, '');
    valor = maskFone(valor);
    this.clienteForm.patchValue({ telefone: valor });
  }

  aplicarMascaraCep(event: any) {
    const input = event.target;
    let valor = input.value.replace(/\D/g, '');
    valor = maskCep(valor);
    this.clienteForm.patchValue({ cep: valor });
  }

  buscarCep() {
    const cep = this.clienteForm.get('cep')?.value?.replace(/\D/g, '');
    // if (cep && cep.length === 8) {
    //   this.clienteService.buscarEnderecoPorCep(cep).subscribe({
    //     next: (endereco) => {
    //       if (!endereco.erro) {
    //         this.clienteForm.patchValue({
    //           endereco: endereco.logradouro,
    //           bairro: endereco.bairro,
    //           cidade: endereco.localidade,
    //           uf: endereco.uf
    //         });
    //       }
    //     },
    //     error: (error) => {
    //       console.warn('Erro ao buscar CEP:', error);
    //     }
    //   });
    // }
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
        // A aba de dados da conta é sempre válida, pois o status é opcional e não obrigatório
        return true;
      case 'dados-acesso':
        if (this.isEditMode) return true;
        let verificadorDadosAcesso = this.senha?.valid && !this.clienteForm.errors?.['senhasDiferentes'];
        return typeof verificadorDadosAcesso === 'boolean' ? verificadorDadosAcesso : false;
      default:
        return false;
    }
  }

  // proximaAba() {
  //   const tabs = this.isEditMode 
  //     ? ['dados-pessoais', 'endereco', 'dados-conta']
  //     : ['dados-pessoais', 'endereco', 'dados-conta', 'dados-acesso'];
  //   const currentIndex = tabs.indexOf(this.activeTab);
  //   if (currentIndex < tabs.length - 1) {
  //     this.setActiveTab(tabs[currentIndex + 1]);
  //   }
  // }

  // abaAnterior() {
  //   const tabs = this.isEditMode 
  //     ? ['dados-pessoais', 'endereco', 'dados-conta']
  //     : ['dados-pessoais', 'endereco', 'dados-conta', 'dados-acesso'];
  //   const currentIndex = tabs.indexOf(this.activeTab);
  //   if (currentIndex > 0) {
  //     this.setActiveTab(tabs[currentIndex - 1]);
  //   }
  // }

  salvar() {
    if (this.clienteForm.valid) {
      this.isLoading = true;
      this.setFormDisabledState(true);
      
      if (this.isEditMode) {
        const endereco: UpdateEnderecoDto = {
          cep: this.clienteForm.get('cep')?.value.replace(/\D/g, ''),
          logradouro: this.clienteForm.get('endereco')?.value,
          numero: this.clienteForm.get('numero')?.value,
          complemento: this.clienteForm.get('complemento')?.value,
          bairro: this.clienteForm.get('bairro')?.value,
          cidade: this.clienteForm.get('cidade')?.value,
          estado: this.clienteForm.get('uf')?.value,
        } 

        const cliente: UpdateClienteDto = {
          id: this.clienteId,
          nome: this.clienteForm.get('nome')?.value,
          email: this.clienteForm.get('email')?.value,
          tipoPessoa: parseInt(this.clienteForm.get('tipoPessoa')?.value),
          cpfCnpj: this.clienteForm.get('cpfCnpj')?.value.replace(/\D/g, ''),
          telefone: this.clienteForm.get('telefone')?.value.replace(/\D/g, ''),
          endereco: endereco,
          nomeFantasia: '',
          inscricaoEstadual: '',
          vendedorId: null,
          ativo: this.clienteForm.get('status')?.value
        };

        this.clienteService.atualizarCliente(cliente).subscribe({
          next: () => {
            this.toastService.showSuccess('Cliente atualizado com sucesso!');
            this.router.navigate(['/administrador/clientes']);
          },
          error: (error) => {
            console.error('Erro ao atualizar cliente:', error);
            const mensagem = typeof error === 'string' ? error : 'Erro ao atualizar cliente. Tente novamente.';
            this.toastService.showError(mensagem);
            this.isLoading = false;
            this.setFormDisabledState(false);
          }
        });
      } else {
        const cliente: CreateClienteDto = {
          id: '', // Será gerado pelo backend
          nome: this.clienteForm.get('nome')?.value,
          email: this.clienteForm.get('email')?.value,
          cpfCnpj: this.clienteForm.get('cpfCnpj')?.value.replace(/\D/g, ''),
          telefone: this.clienteForm.get('telefone')?.value.replace(/\D/g, ''),
          tipoPessoa: parseInt(this.clienteForm.get('tipoPessoa')?.value, 10),
          ativo: true,
          endereco: {
            id: '', // Será gerado pelo backend
            cep: this.clienteForm.get('cep')?.value.replace(/\D/g, ''),
            logradouro: this.clienteForm.get('endereco')?.value,
            numero: this.clienteForm.get('numero')?.value,
            complemento: this.clienteForm.get('complemento')?.value || '',
            bairro: this.clienteForm.get('bairro')?.value,
            cidade: this.clienteForm.get('cidade')?.value,
            estado: this.clienteForm.get('uf')?.value
          },
          senha: this.clienteForm.get('senha')?.value,
          confirmacao: this.clienteForm.get('confirmarSenha')?.value
        };

        this.clienteService.adicionarCliente(cliente).subscribe({
          next: () => {
            this.toastService.showSuccess('Cliente cadastrado com sucesso!');
            this.router.navigate(['/administrador/clientes']);
          },
          error: (error) => {
            console.error('Erro ao adicionar cliente:', error);
            const mensagem = typeof error === 'string' ? error : 'Erro ao cadastrar cliente. Tente novamente.';
            this.toastService.showError(mensagem);
            this.isLoading = false;
            this.setFormDisabledState(false);
          }
        });
      }
    } else {
      let aba = this.marcarCamposComoTocados();
      console.log("aba", aba);
      this.activeTab = aba || 'dados-pessoais';
      this.toastService.showError('Por favor, corrija os erros no formulário.');
    }
  }

  marcarCamposComoTocados() {
    let aba = 'dados-pessoais';
    Object.keys(this.clienteForm.controls).forEach(key => {
      if (!this.clienteForm.get(key)?.valid) {
        aba = this.getGrupoDoCampo(key);
      }
      const control = this.clienteForm.get(key);
      control?.markAsTouched();
    });
    return aba;
  }

  getGrupoDoCampo(campo: string): string {
    for (const chave of Object.keys(this.formularioCliente)) {
      if (this.formularioCliente[chave].includes(campo)) {
        return chave;
      }
    }
    return "dados-pessoais"; 
  }

  cancelar() {
    this.router.navigate(['/administrador/dashboard']);
  }

  // Getters para facilitar o acesso no template
  get nome() { return this.clienteForm.get('nome'); }
  get email() { return this.clienteForm.get('email'); }
  get tipoPessoa() { return this.clienteForm.get('tipoPessoa'); }
  get cpfCnpj() { return this.clienteForm.get('cpfCnpj'); }
  get telefone() { return this.clienteForm.get('telefone'); }
  get cep() { return this.clienteForm.get('cep'); }
  get logradouro() { return this.clienteForm.get('logradouro'); }
  get numero() { return this.clienteForm.get('numero'); }
  get bairro() { return this.clienteForm.get('bairro'); }
  get cidade() { return this.clienteForm.get('cidade'); }
  get estado() { return this.clienteForm.get('estado'); }
  get complemento() { return this.clienteForm.get('complemento'); }
  get senha() { return this.clienteForm.get('senha'); }
  get confirmarSenha() { return this.clienteForm.get('confirmarSenha'); }
  get status() { return this.clienteForm.get('status'); }
}