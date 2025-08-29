import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlanosComponent } from '../../../components/planos/planos.component';
import { StepsPagamentoComponent } from '../../../components/steps-pagamento/steps-pagamento.component';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ToastService } from '../../../shared/toast/toast.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.page.html',
  styleUrl: './home.page.css',
  imports: [CommonModule, PlanosComponent, StepsPagamentoComponent, RouterModule]
})
export class HomePage {
  public cupom: string | null = null;
  public plano: string | null = null;

  readonly codBasico = environment.planos.basico;
  readonly codPremium = environment.planos.premium;

  constructor(
    private route: ActivatedRoute,
    private toastService: ToastService
  ) {
    this.route.queryParams.subscribe(params => {
      this.cupom = params['cupom'] || null;
      this.plano = params['plano'] || null;
    });
    console.log(">>", this.cupom, this.plano);
  }

  public get planoSelecionado(): boolean {
    return this.plano === this.codBasico || this.plano === this.codPremium;
  }

  // Métodos para testar o toast
  testSuccessToast(): void {
    this.toastService.showSuccess('Esta é uma mensagem de sucesso!');
  }

  testErrorToast(): void {
    this.toastService.showError('Esta é uma mensagem de erro!');
  }

  testWarningToast(): void {
    this.toastService.showWarning('Esta é uma mensagem de aviso!');
  }

  testInfoToast(): void {
    this.toastService.showInfo('Esta é uma mensagem informativa!');
  }
} 