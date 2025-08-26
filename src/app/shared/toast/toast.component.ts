import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ToastService, ToastMessage } from './toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.css']
})
export class ToastComponent implements OnInit, OnDestroy {
  messages: ToastMessage[] = [];
  private subscription: Subscription = new Subscription();

  constructor(
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.subscription = this.toastService.messages$.subscribe(
      messages => {
        console.log('Toast messages updated:', messages);
        this.messages = messages;
        this.cdr.detectChanges();
      }
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  removeMessage(id: number): void {
    console.log('Removing toast message with id:', id);
    this.toastService.removeMessage(id);
  }

  getToastHeaderClass(type: ToastMessage['type']): string {
    return type;
  }

  getToastTitle(type: ToastMessage['type']): string {
    switch (type) {
      case 'success': return 'Sucesso';
      case 'error': return 'Erro';
      case 'warning': return 'Aviso';
      case 'info': return 'Informação';
      default: return 'Notificação';
    }
  }
} 