import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Plano } from '../plano.interface';
import { PlanoService } from '../plano.service';
import { ToastService } from '../../../../../shared/toast/toast.service';
import { maskMoney, moneyToFloat, formatarParaMoedaBrasileira } from '../../../../../shared/utils/mask.money.util';
import { maskCpf } from '../../../../../shared/utils/cpf.utils';
import { maskCnpj } from '../../../../../shared/utils/cnpj.utils';

@Component({
  selector: 'app-formulario',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './formulario.html',
  styleUrl: './formulario.css'
})
export class Formulario implements OnInit {
  planoForm: FormGroup;
  isEditMode: boolean = false;
  planoId: string = '';
  isLoading: boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private planoService: PlanoService,
    private toastService: ToastService,
    private fb: FormBuilder
  ) {
    this.planoForm = this.fb.group({
      codigo: ['', [Validators.required]],
      descricao: ['', [Validators.required]],
      valor: ['', [Validators.required, this.valorMaiorQueZeroValidator()]],
      status: [true]
    });
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.planoId = params['id'];
        this.carregarPlano();
      } else {
        this.isEditMode = false;
      }
    });
  }

  private setFormDisabledState(disabled: boolean) {
    // No modo de edição, todos os campos devem permanecer sempre habilitados
    if (this.isEditMode) {
      this.planoForm.enable();
      return;
    }
    
    if (disabled) {
      this.planoForm.disable();
    } else {
      this.planoForm.enable();
    }
  }

  carregarPlano() {
    this.isLoading = true;
    this.setFormDisabledState(true);
    this.planoService.getPlanoByCodigo(this.planoId).subscribe({
      next: (plano) => {
        this.planoForm.patchValue({
          codigo: plano.codigo,
          descricao: plano.descricao,
          valor: formatarParaMoedaBrasileira(parseFloat(plano.valor)), 
          status: plano.status
        });
        this.isLoading = false;
        this.setFormDisabledState(false);
      },
      error: (error) => {
        console.error('Erro ao carregar plano:', error);
        const mensagem = typeof error === 'string' ? error : 'Erro ao carregar dados do plano. Tente novamente.';
        this.toastService.showError(mensagem);
        this.isLoading = false;
        this.setFormDisabledState(false);
        this.router.navigate(['/administrador/planos']);
      }
    });
  }

  aplicarMascaraValor(event: any) {
    const input = event.target;
    const valor = input.value;
    
    // Se o valor estiver vazio, não aplica a máscara
    if (!valor || valor.trim() === '') {
      this.planoForm.patchValue({ valor: '0,00' });
      return;
    }
    
    const valorFormatado = maskMoney(valor);
    this.planoForm.patchValue({ valor: valorFormatado });
  }

  valorMaiorQueZeroValidator() {
    return (control: any) => {
      const valor = control.value;
      if (!valor) return null;
      
      // Remove formatação e converte para número
      const apenasNumeros = valor.replace(/\D/g, '');
      const valorNumerico = apenasNumeros ? parseFloat(apenasNumeros) / 100 : 0;
      
      return valorNumerico > 0 ? null : { valorInvalido: true };
    };
  }

  getValorNumerico(): number {
    const valor = this.planoForm.get('valor')?.value;
    if (!valor) return 0;
    
    const apenasNumeros = valor.replace(/\D/g, '');
    return apenasNumeros ? parseFloat(apenasNumeros) / 100 : 0;
  }

  salvar() {
    if (this.planoForm.valid) {
      this.isLoading = true;
      this.setFormDisabledState(true);
      
      const plano: Plano = {
        id: this.planoId,
        codigo: this.planoForm.get('codigo')?.value,
        descricao: this.planoForm.get('descricao')?.value,
        valor: moneyToFloat(this.planoForm.get('valor')?.value),
        status: this.planoForm.get('status')?.value
      };

      if (this.isEditMode) {
        this.planoService.atualizarPlano(plano).subscribe({
          next: () => {
            this.toastService.showSuccess('Plano atualizado com sucesso!');
            this.router.navigate(['/administrador/planos']);
          },
          error: (error) => {
            console.error('Erro ao atualizar plano:', error);
            const mensagem = typeof error === 'string' ? error : 'Erro ao atualizar plano. Tente novamente.';
            this.toastService.showError(mensagem);
            this.isLoading = false;
            this.setFormDisabledState(false);
          }
        });
      } else {
        this.planoService.adicionarPlano(plano).subscribe({
          next: () => {
            this.toastService.showSuccess('Plano cadastrado com sucesso!');
            this.router.navigate(['/administrador/planos']);
          },
          error: (error) => {
            console.error('Erro ao adicionar plano:', error);
            const mensagem = typeof error === 'string' ? error : 'Erro ao cadastrar plano. Tente novamente.';
            this.toastService.showError(mensagem);
            this.isLoading = false;
            this.setFormDisabledState(false);
          }
        });
      }
    } else {
      this.marcarCamposComoTocados();
    }
  }

  marcarCamposComoTocados() {
    Object.keys(this.planoForm.controls).forEach(key => {
      const control = this.planoForm.get(key);
      control?.markAsTouched();
    });
  }

  cancelar() {
    this.router.navigate(['/administrador/planos']);
  }

  // Getters para facilitar o acesso no template
  get codigo() { return this.planoForm.get('codigo'); }
  get descricao() { return this.planoForm.get('descricao'); }
  get valor() { return this.planoForm.get('valor'); }
  get status() { return this.planoForm.get('status'); }
}
