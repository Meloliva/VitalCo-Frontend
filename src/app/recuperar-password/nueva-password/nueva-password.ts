import { Component, OnInit, Inject, PLATFORM_ID, NgZone } from '@angular/core'; // <-- IMPORTS ADICIONALES
import { CommonModule, isPlatformBrowser } from '@angular/common'; // <-- IMPORTS ADICIONALES
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { RecuperarPasswordService } from '../../service/recuperar-password.service';

@Component({
  selector: 'app-nueva-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule
  ],
  templateUrl: './nueva-password.html',
  styleUrls: ['./nueva-password.css']
})
export class NuevaPasswordComponent implements OnInit {
  passwordForm: FormGroup;
  showPassword = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private recuperarService: RecuperarPasswordService,
    @Inject(PLATFORM_ID) private platformId: Object, // Para SSR
    private zone: NgZone // Para forzar la ejecución en el ciclo de Angular
  ) {
    this.passwordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    console.log('LOG-1: Ejecutando ngOnInit.'); // LOG
    // FIX SSR: Encapsular el acceso a sessionStorage
    if (isPlatformBrowser(this.platformId)) {
      const correoGuardado = sessionStorage.getItem('recuperarCorreo');
      console.log('LOG-2: Correo en sessionStorage:', correoGuardado); // LOG
      if (correoGuardado) {
        this.passwordForm.get('email')?.setValue(correoGuardado);
      }
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    console.log('LOG-3: Iniciando onSubmit.'); // LOG
    this.error = '';
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      console.log('LOG-4: Formulario inválido. Deteniendo.'); // LOG
      return;
    }

    const dto = {
      correo: this.passwordForm.value.email,
      nuevaContrasena: this.passwordForm.value.password
    };

    console.log('LOG-5: Enviando petición de restablecimiento.'); // LOG

    this.recuperarService.restablecerCuenta(dto).subscribe({
      next: () => {
        console.log('LOG-6: Petición exitosa (Backend OK).'); // LOG

        // FIX SSR: Limpiar sessionStorage solo en el navegador
        if (isPlatformBrowser(this.platformId)) {
          sessionStorage.removeItem('recuperarCorreo');
          console.log('LOG-7: sessionStorage limpiado.'); // LOG
        }

        // FIX DE REDIRECCIÓN FINAL: Usar NgZone.run() para forzar la navegación al siguiente ciclo
        this.zone.run(() => {
          const targetUrl = '/password-success';
          console.log('LOG-8: Ejecutando redirección forzada a:', targetUrl); // LOG
          this.router.navigateByUrl(targetUrl, { replaceUrl: true });
          console.log('LOG-9: router.navigateByUrl llamada.'); // LOG
        });
      },
      error: err => {
        this.error = err?.error?.mensaje || err?.error || 'Error al restablecer cuenta';
        console.error('LOG-10: Falló el restablecimiento (Error de Backend). Mensaje:', this.error); // LOG
      }
    });
  }

  getEmailErrorMessage(): string {
    const control = this.passwordForm.get('email');
    if (control?.hasError('required')) return 'El correo electrónico es requerido';
    if (control?.hasError('email')) return 'Ingrese un correo electrónico válido';
    return '';
  }

  getPasswordErrorMessage(): string {
    const control = this.passwordForm.get('password');
    if (control?.hasError('required')) return 'La contraseña es requerida';
    if (control?.hasError('minlength')) return 'La contraseña debe tener al menos 6 caracteres';
    return '';
  }
}
