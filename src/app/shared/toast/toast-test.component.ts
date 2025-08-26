import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from './toast.service';

@Component({
  selector: 'app-toast-test',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-test-container p-4">
      <h4>Teste do Sistema de Toast</h4>
      <p class="text-muted">Clique nos botões abaixo para testar as mensagens toast:</p>
      
      <div class="d-flex flex-wrap gap-2 mb-3">
        <button class="btn btn-success" (click)="testSuccess()">
          Testar Sucesso
        </button>
        <button class="btn btn-danger" (click)="testError()">
          Testar Erro
        </button>
        <button class="btn btn-warning" (click)="testWarning()">
          Testar Aviso
        </button>
        <button class="btn btn-info" (click)="testInfo()">
          Testar Info
        </button>
      </div>
      
      <div class="alert alert-info">
        <strong>Status:</strong> 
        <span *ngIf="lastMessage">{{ lastMessage }}</span>
        <span *ngIf="!lastMessage">Nenhuma mensagem enviada ainda</span>
      </div>
    </div>
  `,
  styles: [`
    .toast-test-container {
      max-width: 600px;
      margin: 0 auto;
    }
  `]
})
export class ToastTestComponent {
  lastMessage: string = '';

  constructor(private toastService: ToastService) {}

  testSuccess(): void {
    const message = 'Esta é uma mensagem de sucesso!';
    this.lastMessage = `Sucesso: ${message}`;
    this.toastService.showSuccess(message);
  }

  testError(): void {
    const message = 'Esta é uma mensagem de erro!';
    this.lastMessage = `Erro: ${message}`;
    this.toastService.showError(message);
  }

  testWarning(): void {
    const message = 'Esta é uma mensagem de aviso!';
    this.lastMessage = `Aviso: ${message}`;
    this.toastService.showWarning(message);
  }

  testInfo(): void {
    const message = 'Esta é uma mensagem informativa!';
    this.lastMessage = `Info: ${message}`;
    this.toastService.showInfo(message);
  }
} 