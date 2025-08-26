import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';

@Component({
  selector: 'app-planos',
  standalone: true,
  templateUrl: './planos.component.html',
  styleUrl: './planos.component.css',
  imports: [CommonModule]
})
export class PlanosComponent {
  @Input() plano: string | null = null;
  readonly codBasico = environment.planos.basico;
  readonly codPremium = environment.planos.premium;
  public showBtnCompra:boolean = true;
  
  constructor(private router: Router) {}
  
  showPlanoBasico(): boolean {
    if (this.plano !== this.codBasico && this.plano !== this.codPremium) {
      return true;
    } else if (this.plano === this.codBasico) {
      this.showBtnCompra = false;
      return true;
    } else {
      this.showBtnCompra = false;
      return false;
    }
  }

  showPlanoPremium(): boolean {
    if (this.plano !== this.codBasico && this.plano !== this.codPremium) {
      return true;
    } else if (this.plano === this.codPremium) {
      this.showBtnCompra = false;
      return true;
    } else {
      this.showBtnCompra = false;
      return false;
    }
  }

  comprar(plano: string) {
    // Aqui você pode adicionar lógica para capturar cupom se necessário
    const params: any = { plano };
    // Se já existe cupom na URL, manter
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('cupom')) {
      params.cupom = urlParams.get('cupom');
    }
    this.router.navigate([], { queryParams: params });
  }
} 