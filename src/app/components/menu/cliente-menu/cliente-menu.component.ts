import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Auth } from '../../../services/auth/auth';

@Component({
  selector: 'app-cliente-menu',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './cliente-menu.component.html',
  styleUrls: ['./cliente-menu.component.css']
})
export class ClienteMenuComponent {

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