import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';
import { Inject, PLATFORM_ID } from '@angular/core';
import { RecaptchaModule, RecaptchaComponent } from 'ng-recaptcha-2';
import { environment } from '../../../../../environments/environment';
import { Auth } from '../../../../services/auth/auth';
import { LoginRequest } from '../../../../core/interfaces/auth.interface';
import { ValidationError } from '../../../../core/interfaces/validation-error.interface';
import { lowerFirst } from '../../../../shared/utils/string.utils';
import { UsuarioLogado } from '../../../../core/interfaces/usuario-logado.interface';
import { PerfilUsuarioEnum } from '../../../../core/enums/perfil-usuario-enum';

declare const grecaptcha: any;
declare global {
  interface Window {
    recaptchaCallback?: (token: string) => void;
  }
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, RecaptchaModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login implements OnInit {
  @ViewChild('recaptchaContainer') recaptchaContainer!: ElementRef;

  captchaToken: string | null = null;
  widgetId: number | null = null;
  recaptchaKey = environment.recaptchaKey;
  loading = false;

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const waitForGrecaptcha = () => {
        if (typeof grecaptcha !== 'undefined' && grecaptcha.render) {
          
          window.recaptchaCallback = (token: string) => {
            this.captchaToken = token;
          };
          
          this.widgetId = grecaptcha.render(this.recaptchaContainer.nativeElement, {
            sitekey: this.recaptchaKey,
            callback: 'recaptchaCallback'
          });
        } else {
          setTimeout(waitForGrecaptcha, 100);
        }
      };
      waitForGrecaptcha();
    }
  }

  loginForm: FormGroup;
  loginError: string | null = null;
  loginRecaptcha: string | null = null;
  fieldErrors: { [key: string]: string } = {};

  constructor(
    private fb: FormBuilder,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object,
    private auth: Auth
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required]]
    });
  }

  getEmailError(): string {
    const email = this.loginForm.get('email');
    if (email?.hasError('required')) return 'O e-mail é obrigatório.';
    if (email?.hasError('email')) return 'Formato de e-mail inválido.';
    if (email?.hasError('api')) return email.getError('api');
    return '';
  }

  getSenhaError(): string {
    const control = this.loginForm.get('senha');
    if (control?.hasError('required')) return 'A senha é obrigatória.';
    if (control?.hasError('api')) return control.getError('api');
    return '';
  }

  onSubmit(): void {
    this.loginRecaptcha = null;
    
    if (!this.captchaToken) {
      this.loginRecaptcha = 'Por favor, complete o reCAPTCHA';
      return;
    }
    
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    const loginRequest: LoginRequest = {
      email: this.loginForm.value.email,
      senha: this.loginForm.value.senha,
      recaptchaToken: this.captchaToken!
    };

    this.loginError = null;
    this.fieldErrors = {};

    this.auth.login(loginRequest).subscribe({
      next: (result) => {
        debugger;
        this.loading = false;
        // Salva o usuário logado
        this.auth.saveUsuarioLogado(result as UsuarioLogado);
        // Redireciona para o dashboard correto conforme a role
        const usuarioLogado = result as UsuarioLogado;
        const userRole = usuarioLogado.data.user.perfil;
        if (userRole === PerfilUsuarioEnum.ADMINISTRADOR) {
          this.router.navigate(['/administrador/dashboard']);
        } else if (userRole === PerfilUsuarioEnum.VENDEDOR) {
          this.router.navigate(['/vendedor/dashboard']);
        } else if (userRole === PerfilUsuarioEnum.CLIENTE) {
          this.router.navigate(['/cliente/dashboard']);
        } else {
          this.router.navigate(['/']);
        }
      },
      error: (errors: ValidationError[]) => {
        this.loading = false;
        errors.forEach(err => {
          const field = lowerFirst(err.campo);
          const control = this.loginForm.get(field);
          if (control) {
            control.setErrors({ api: err.mensagem });
            control.markAsTouched();
          } else {
            this.loginError = err.mensagem;
          }
        });
      }
    });
  }
}
