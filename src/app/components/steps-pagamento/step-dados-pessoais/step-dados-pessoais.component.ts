import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-step-dados-pessoais',
  standalone: true,
  templateUrl: './step-dados-pessoais.component.html',
  styleUrl: './step-dados-pessoais.component.css',
  imports: [CommonModule, ReactiveFormsModule]
})
export class StepDadosPessoaisComponent {
  @Output() next = new EventEmitter<void>();
  form: FormGroup;
  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      nome: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100),
        Validators.pattern(/^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/)
      ]],
      email: ['', [Validators.required, Validators.email]],
      documento: ['', [Validators.required, documentoValidator()]],
      telefone: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.form.valid) {
      this.next.emit();
    } else {
      this.form.markAllAsTouched();
    }
  }

  verificarNumeros(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/\D/g, '');
    this.form.get('documento')?.setValue(value);
  }

  aplicarMascaraTelefone(event: Event) {
    const input = event.target as HTMLInputElement;
    let valor = input.value.replace(/\D/g, '');
    if (valor.length <= 10) {
      valor = valor.replace(/^(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    } else {
      valor = valor.replace(/^(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
    }
    this.form.get('telefone')?.setValue(valor);
  }
}

// Validador customizado para CPF e CNPJ
export function documentoValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = (control.value || '').replace(/\D/g, '');
    if (!value) return null;
    if (value.length !== 11 && value.length !== 14) {
      return { documentoInvalido: 'O documento deve ter 11 (CPF) ou 14 (CNPJ) dígitos.' };
    }
    if (value.length === 11 && !isValidCPF(value)) {
      return { cpfInvalido: 'CPF inválido.' };
    }
    if (value.length === 14 && !isValidCNPJ(value)) {
      return { cnpjInvalido: 'CNPJ inválido.' };
    }
    return null;
  };
}

function isValidCPF(cpf: string): boolean {
  if (!cpf || cpf.length !== 11 || /^([0-9])\1+$/.test(cpf)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += Number(cpf.charAt(i)) * (10 - i);
  let rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== Number(cpf.charAt(9))) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += Number(cpf.charAt(i)) * (11 - i);
  rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  return rev === Number(cpf.charAt(10));
}

function isValidCNPJ(cnpj: string): boolean {
  if (!cnpj || cnpj.length !== 14 || /^([0-9])\1+$/.test(cnpj)) return false;
  let length = cnpj.length - 2;
  let numbers = cnpj.substring(0, length);
  let digits = cnpj.substring(length);
  let sum = 0;
  let pos = length - 7;
  for (let i = length; i >= 1; i--) {
    sum += Number(numbers.charAt(length - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== Number(digits.charAt(0))) return false;
  length = length + 1;
  numbers = cnpj.substring(0, length);
  sum = 0;
  pos = length - 7;
  for (let i = length; i >= 1; i--) {
    sum += Number(numbers.charAt(length - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  return result === Number(digits.charAt(1));
} 