import { Component, EventEmitter, Output, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-step-pedido',
  standalone: true,
  templateUrl: './step-pedido.component.html',
  styleUrl: './step-pedido.component.css',
  imports: [CommonModule, ReactiveFormsModule]
})
export class StepPedidoComponent implements OnInit {
  @Output() next = new EventEmitter<void>();
  @Input() plano: string | null = null;
  form: FormGroup;
  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      produto: ['', Validators.required],
      quantidade: ['', [Validators.required, Validators.min(1)]],
      valor: ['', [Validators.required, Validators.min(0.01)]],
      total: [{ value: '', disabled: true }, Validators.required]
    });
    this.form.valueChanges.subscribe(val => {
      const quantidade = Number(val.quantidade) || 0;
      const valor = Number(val.valor) || 0;
      this.form.get('total')?.setValue((quantidade * valor).toFixed(2), { emitEvent: false });
    });
  }

  ngOnInit(): void {
    console.log('Plano recebido no step-pedido:', this.plano);
  }

  onSubmit() {
    if (this.form.valid) {
      this.next.emit();
    } else {
      this.form.markAllAsTouched();
    }
  }
} 