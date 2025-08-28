import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Auth } from '../../../services/auth/auth';

@Component({
  selector: 'app-vendedor-menu',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './vendedor-menu.component.html',
  styleUrls: ['./vendedor-menu.component.css']
})
export class VendedorMenuComponent {

  constructor(private authService: Auth) {}

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        console.log('Logout realizado com sucesso');
      },
      error: (error) => {
        console.error('Erro ao realizar logout:', error);
        // Mesmo com erro, o usuário já foi redirecionado pelo serviço
      }
    });
  }
} 