import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-step-cartao-credito',
  standalone: true,
  templateUrl: './step-cartao-credito.component.html',
  styleUrl: './step-cartao-credito.component.css',
  imports: [CommonModule, ReactiveFormsModule]
})
export class StepCartaoCreditoComponent {
  @Output() finalizar = new EventEmitter<any>();
  form: FormGroup;
  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      nomeCartao: ['', Validators.required],
      numeroCartao: ['', [Validators.required, Validators.minLength(16), Validators.maxLength(16)]],
      cvv: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(4)]],
      validade: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.form.valid) {
      this.finalizar.emit(this.form.value);
    } else {
      this.form.markAllAsTouched();
    }
  }
} 