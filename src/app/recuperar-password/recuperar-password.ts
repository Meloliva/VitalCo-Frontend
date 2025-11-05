import { Component, DOCUMENT, Inject, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
// Angular Material imports
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-recuperar-password',
  standalone: true,
  templateUrl: './recuperar-password.html',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule
  ],
  styleUrls: ['./recuperar-password.css']
})
export class RecuperarPasswordComponent implements OnInit, OnDestroy {
  recoveryForm: FormGroup;

  constructor(
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.recoveryForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit() {
    this.renderer.addClass(this.document.body, 'some-class');

    const navbar = this.document.querySelector('app-navbar');
    if (navbar) {
      this.renderer.setStyle(navbar, 'display', 'none');
    }
  }

  ngOnDestroy() {
    this.renderer.removeClass(this.document.body, 'some-class');

    const navbar = this.document.querySelector('app-navbar');
    if (navbar) {
      this.renderer.setStyle(navbar, 'display', 'block');
    }
  }

  onSubmit() {
    if (this.recoveryForm.valid) {
      const email = this.recoveryForm.value.email;
      console.log('Enviando código a:', email);

      // TODO: Llamar al servicio
      // this.authService.sendRecoveryCode(email).subscribe(...)

      this.router.navigate(['/recuperar-password/verificar-codigo'], {
        queryParams: { email: email }
      });
    }
  }

  // Getter para acceder fácilmente al control del email
  get emailControl() {
    return this.recoveryForm.get('email');
  }

  // Método para obtener el mensaje de error
  getEmailErrorMessage(): string {
    if (this.emailControl?.hasError('required')) {
      return 'El correo electrónico es requerido';
    }
    if (this.emailControl?.hasError('email')) {
      return 'Ingrese un correo electrónico válido';
    }
    return '';
  }
}
