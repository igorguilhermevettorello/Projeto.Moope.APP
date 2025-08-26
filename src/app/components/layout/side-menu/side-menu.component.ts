import { Component, Input } from '@angular/core';
import { AdminMenuComponent } from '../../menu/administrador-menu/administrador-menu.component';
import { VendedorMenuComponent } from '../../menu/vendedor-menu/vendedor-menu.component';
import { ClienteMenuComponent } from '../../menu/cliente-menu/cliente-menu.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-side-menu',
  standalone: true,
  imports: [AdminMenuComponent, VendedorMenuComponent, ClienteMenuComponent, CommonModule],
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.css']
})
export class SideMenuComponent {
  @Input() userRole: 'administrador' | 'vendedor' | 'cliente' = 'administrador';
} 