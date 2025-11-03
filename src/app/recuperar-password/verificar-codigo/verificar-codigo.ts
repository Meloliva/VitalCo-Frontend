import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {Router, ActivatedRoute, RouterLink} from '@angular/router';
import {Component, OnDestroy, OnInit} from '@angular/core';

@Component({
  selector: 'app-verificar-codigo',
  templateUrl: './verificar-codigo.html',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink
  ],
  styleUrls: ['./verificar-codigo.css']
})
export class VerificarCodigoComponent implements OnInit, OnDestroy {
  codeForm: FormGroup;
  email: string = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.codeForm = this.fb.group({
      digit1: ['', [Validators.required, Validators.pattern(/^\d$/)]],
      digit2: ['', [Validators.required, Validators.pattern(/^\d$/)]],
      digit3: ['', [Validators.required, Validators.pattern(/^\d$/)]],
      digit4: ['', [Validators.required, Validators.pattern(/^\d$/)]],
      digit5: ['', [Validators.required, Validators.pattern(/^\d$/)]],
      digit6: ['', [Validators.required, Validators.pattern(/^\d$/)]],
    });
  }

  ngOnInit() {
    // Obtener el email de los parámetros
    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || '';
      if (!this.email) {
        // Si no hay email, redirigir al inicio
        this.router.navigate(['/recuperar-password']);
      }
    });

    // Ocultar navbar
    this.hideNavbar();
  }

  ngOnDestroy() {
    // Mostrar navbar al salir
    this.showNavbar();
  }

  hideNavbar() {
    const navbar = document.querySelector('app-navbar') ||
      document.querySelector('nav') ||
      document.querySelector('.navbar');
    if (navbar) {
      (navbar as HTMLElement).style.display = 'none';
    }
  }

  showNavbar() {
    const navbar = document.querySelector('app-navbar') ||
      document.querySelector('nav') ||
      document.querySelector('.navbar');
    if (navbar) {
      (navbar as HTMLElement).style.display = 'block';
    }
  }

  onDigitInput(event: any, currentIndex: number) {
    const input = event.target;
    const value = input.value;

    // Solo permitir números
    if (!/^\d$/.test(value)) {
      input.value = '';
      this.codeForm.get(`digit${currentIndex}`)?.setValue('');
      return;
    }

    // Auto-focus al siguiente input
    if (value.length === 1 && currentIndex < 6) {
      const nextInput = document.getElementById(`digit${currentIndex + 1}`);
      if (nextInput) {
        (nextInput as HTMLInputElement).focus();
      }
    }
  }

  onKeyDown(event: KeyboardEvent, currentIndex: number) {
    const input = event.target as HTMLInputElement;

    // Retroceder al input anterior con Backspace
    if (event.key === 'Backspace' && input.value === '' && currentIndex > 1) {
      const prevInput = document.getElementById(`digit${currentIndex - 1}`);
      if (prevInput) {
        (prevInput as HTMLInputElement).focus();
      }
    }
  }

  onPaste(event: ClipboardEvent) {
    event.preventDefault();
    const pastedData = event.clipboardData?.getData('text');

    if (pastedData && /^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      digits.forEach((digit, index) => {
        this.codeForm.get(`digit${index + 1}`)?.setValue(digit);
      });

      // Focus en el último input
      const lastInput = document.getElementById('digit6');
      if (lastInput) {
        (lastInput as HTMLInputElement).focus();
      }
    }
  }

  onSubmit() {
    if (this.codeForm.valid) {
      const code = Object.values(this.codeForm.value).join('');

      console.log('Código ingresado:', code);
      console.log('Email:', this.email);

      // TODO: Llamada al servicio para verificar el código
      // this.authService.verifyCode(this.email, code).subscribe(
      //   response => {
      //     // Navegar a nueva-password con token
      //     this.router.navigate(['/recuperar-password/nueva-password'], {
      //       queryParams: { email: this.email, token: response.token }
      //     });
      //   },
      //   error => {
      //     console.error('Código inválido', error);
      //     // Mostrar mensaje de error
      //   }
      // );

      // Por ahora, navegar directamente (simular éxito)
      this.router.navigate(['/recuperar-password/nueva-password'], {
        queryParams: { email: this.email, code: code }
      });
    }
  }
}
