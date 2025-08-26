import { Component } from '@angular/core';
import { BackofficeLayoutComponent } from '../../../../components/layout/backoffice/backoffice.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [BackofficeLayoutComponent],
  template: `
    <app-backoffice-layout>
      <div class="dashboard-welcome">
        <h1>Bem-vindo ao Painel do Cliente Moope!</h1>
        <p>Utilize o menu lateral para navegar pelas funcionalidades do sistema.</p>
      </div>
    </app-backoffice-layout>
  `,
  styleUrls: ['./dashboard.css']
})
export class Dashboard {}
