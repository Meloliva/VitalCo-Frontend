import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {Router} from '@angular/router';
import { MatProgressBar } from '@angular/material/progress-bar';
import { CommonModule, NgClass, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-registro',
  templateUrl: './registro-usuario.html',
  imports: [
    ReactiveFormsModule,
    MatProgressBar,
    NgClass,
    CommonModule,

  ],
  styleUrls: ['./registro-usuario.css']
})
export class RegistroUsuarioComponent implements OnInit, OnDestroy {
  registroForm: FormGroup;
  showPassword: boolean = false;
  progressValue: number = 20; // Paso 1 de 5

  constructor(
    private fb: FormBuilder,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.registroForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      dni: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
      apellido: ['', [Validators.required, Validators.minLength(2)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      correo: ['', [Validators.required, Validators.email]],
      genero: ['', [Validators.required]]
    });
  }

  ngOnInit() {
    // Solo ejecutar en el navegador
    if (isPlatformBrowser(this.platformId)) {
      const navbar = document.querySelector('app-navbar');
      if (navbar) {
        (navbar as HTMLElement).style.display = 'none';
      }
    }
  }

  ngOnDestroy() {
    // Solo ejecutar en el navegador
    if (isPlatformBrowser(this.platformId)) {
      const navbar = document.querySelector('app-navbar');
      if (navbar) {
        (navbar as HTMLElement).style.display = 'block';
      }
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }


  onSubmit() {
    if (this.registroForm.valid) {
      const userData = this.registroForm.value;

      console.log('Datos de registro:', userData);

      // TODO: Llamar al servicio de registro
      // this.authService.register(userData).subscribe(
      //   response => {
      //     console.log('Registro exitoso');
      //     this.router.navigate(['/datos-salud']);  // Aquí se cambia la ruta
      //   },
      //   error => {
      //     console.error('Error en el registro', error);
      //   }
      // );

      // Simulando éxito

      this.router.navigate(['/datos-salud']);  // Aquí se cambia la ruta
    } else {
      // Marcar todos los campos como touched para mostrar errores
      Object.keys(this.registroForm.controls).forEach(key => {
        this.registroForm.get(key)?.markAsTouched();
      });
    }
  }
}
