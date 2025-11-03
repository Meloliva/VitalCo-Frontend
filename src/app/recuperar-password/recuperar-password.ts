import { Component, DOCUMENT, Inject, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-recuperar-password',
  standalone: true,
  templateUrl: './recuperar-password.html',
  imports: [
    ReactiveFormsModule,
    RouterLink,
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
    // Inicializar el formulario
    this.recoveryForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit() {
    // Añadir clase al body
    this.renderer.addClass(this.document.body, 'some-class');

    // Ocultar navbar usando Renderer2
    const navbar = this.document.querySelector('app-navbar');
    if (navbar) {
      this.renderer.setStyle(navbar, 'display', 'none');
    }
  }

  ngOnDestroy() {
    // Remover clase del body
    this.renderer.removeClass(this.document.body, 'some-class');

    // Mostrar navbar usando Renderer2
    const navbar = this.document.querySelector('app-navbar');
    if (navbar) {
      this.renderer.setStyle(navbar, 'display', 'block');
    }
  }

  onSubmit() {
    if (this.recoveryForm.valid) {
      const email = this.recoveryForm.value.email;

      console.log('Enviando código a:', email);

      // TODO: Aquí llamas a tu servicio para enviar el código
      // this.authService.sendRecoveryCode(email).subscribe(...)

      // Navegar a verificar-codigo con el email
      this.router.navigate(['/recuperar-password/verificar-codigo'], {
        queryParams: { email: email }
      });
    }
  }
}
