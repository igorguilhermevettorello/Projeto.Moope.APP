import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.css']
})
export class LoginPage {
  @ViewChild('captchaElem') captchaElem!: ElementRef;

  ngAfterViewInit() {
    (window as any).captchaCallback = (response: string) => {
      console.log('Token:', response);
      // Aqui você envia o token para o backend
    };
  }
  
  loginForm: FormGroup;
  loginError: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.loginError = null;
    const { email, password } = this.loginForm.value;

    // this.authService.login({ email: email, pass: password }).subscribe({
    //   next: () => {
    //     this.router.navigate(['/dashboard']); // TODO: Criar a página de dashboard
    //   },
    //   error: (err) => {
    //     this.loginError = 'Email ou senha inválidos.';
    //     console.error(err);
    //   }
    // });
  }
} 