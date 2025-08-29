import { Component, EventEmitter, Output, Input, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PlanoService } from '../../../services/plano/plano.service';
import { Plano } from '../../../pages/private/administrador/plano/plano.interface';
import { MoedaBrasileiraPipe } from '../../../shared/pipes/moeda-brasileira-pipe';

@Component({
  selector: 'app-step-pedido',
  standalone: true,
  templateUrl: './step-pedido.component.html',
  styleUrls: ['./step-pedido.component.css', '../steps-shared.css'],
  imports: [CommonModule, ReactiveFormsModule, MoedaBrasileiraPipe]
})
export class StepPedidoComponent implements OnInit {
  @Output() next = new EventEmitter<any>();
  @Output() formReady = new EventEmitter<FormGroup>();
  @Input() plano: string | null = null;
  @Input() dadosIniciais: any = null;
  form: FormGroup;
  planoSelecionado: Plano | null = null;
  isLoading: boolean = false;
  valorUnitario: number = 0;
  quantidade: number = 1;
  valorTotal: number = 0;
  private cdr = inject(ChangeDetectorRef);
  
  constructor(
    private fb: FormBuilder,
    private planoService: PlanoService
  ) {
    this.form = this.fb.group({
      produto: [{ value: '', disabled: true }],
      quantidade: ['1', [Validators.required, Validators.min(1), this.integerValidator()]],
      valor: [{ value: '', disabled: true }],
      total: [{ value: '', disabled: true }]
    });

    // Listener para mudanças na quantidade
    this.form.get('quantidade')?.valueChanges.subscribe(val => {
      this.onQuantidadeChange(val);
    });
  }

  ngOnInit(): void {
    console.log('Plano recebido no step-pedido:', this.plano);
    console.log('Dados iniciais recebidos no step-pedido:', this.dadosIniciais);
    
    if (this.plano) {
      this.setLoading(true);
      this.carregarPlanoSelecionado();
    }
    
    // Se há dados iniciais, preenche o formulário
    if (this.dadosIniciais) {
      this.quantidade = this.dadosIniciais.quantidade || 1;
      this.calcularTotal();
      this.form.patchValue({
        quantidade: this.quantidade.toString(),
        total: this.valorTotal
      });
    }
    
    // Emite o FormGroup para o componente pai
    this.formReady.emit(this.form);
  } 

  carregarPlanoSelecionado(): void {
    if (!this.plano) return;
    
    this.isLoading = true;
    this.planoService.getPlanoSelecionado(this.plano).subscribe({
      next: (plano) => {
        this.planoSelecionado = plano;
        this.atualizarFormulario(plano);
        this.setLoading(false);
        console.log('Plano selecionado:', this.isLoading, this.planoSelecionado, );
      },
      error: (error) => {
        console.error('Erro ao carregar plano selecionado:', error);
        this.setLoading(false);
        // Fallback para dados mockados se a API falhar
        this.carregarDadosMockados();
      }
    });
  }

  private carregarDadosMockados(): void {
    // Dados mockados baseados nos códigos conhecidos
    const dadosMockados = {
      '1234': { // Código do plano básico
        id: '1',
        codigo: '1234',
        descricao: 'PLANO BÁSICO',
        status: true,
        valor: '59.00'
      },
      '9876': { // Código do plano premium
        id: '2',
        codigo: '9876',
        descricao: 'PLANO PREMIUM',
        status: true,
        valor: '79.00'
      }
    };

    const planoMockado = dadosMockados[this.plano as keyof typeof dadosMockados];
    if (planoMockado) {
      this.planoSelecionado = planoMockado;
      this.atualizarFormulario(planoMockado);
    }
  }

  private setLoading(loading: boolean) {
    this.isLoading = loading;
    this.cdr.detectChanges();
  }

  private atualizarFormulario(plano: Plano): void {
    this.valorUnitario = parseFloat(plano.valor);
    this.quantidade = 1;
    this.calcularTotal();
    
    this.form.patchValue({
      produto: plano.descricao,
      quantidade: '1',
      valor: this.valorUnitario,
      total: this.valorTotal
    });
  }

  integerValidator() {
    return (control: any) => {
      const value = control.value;
      if (!value) return null;
      
      // Remove caracteres não numéricos
      const numericValue = value.replace(/\D/g, '');
      
      // Verifica se é um número inteiro válido
      if (numericValue === '' || isNaN(Number(numericValue)) || Number(numericValue) < 1) {
        return { integerInvalid: true };
      }
      
      return null;
    };
  }

  onQuantidadeChange(value: string): void {
    // Remove caracteres não numéricos
    const numericValue = value.replace(/\D/g, '');
    
    if (numericValue && !isNaN(Number(numericValue))) {
      this.quantidade = Number(numericValue);
      this.calcularTotal();
      
      // Atualiza o valor no formulário
      this.form.patchValue({
        total: this.valorTotal
      }, { emitEvent: false });
    }
  }

  onQuantidadeInput(event: any): void {
    const input = event.target;
    let value = input.value.replace(/\D/g, '');
    
    // Garante que não seja vazio e seja pelo menos 1
    if (value === '' || Number(value) < 1) {
      value = '1';
    }
    
    input.value = value;
    this.form.get('quantidade')?.setValue(value);
  }

  private calcularTotal(): void {
    this.valorTotal = this.valorUnitario * this.quantidade;
  }

  onSubmit() {
    if (this.form.valid) {
      console.log('planoSelecionado:', this.planoSelecionado);
      const dadosPedido = {
        planoId: this.planoSelecionado?.id || this.plano, // Usa o ID do plano se disponível, senão usa o código
        quantidade: this.quantidade,
        valorUnitario: this.valorUnitario,
        valorTotal: this.valorTotal
      };
      console.log('dadosPedido emitidos:', dadosPedido);
      this.next.emit(dadosPedido);
    } else {
      this.form.markAllAsTouched();
    }
  }
} 