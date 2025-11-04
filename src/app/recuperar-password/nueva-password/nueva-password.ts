import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-nueva-password',
  templateUrl: './nueva-password.html',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgClass,
  ],
  styleUrls: ['./nueva-password.css']
})
export class NuevaPasswordComponent implements OnInit {
  passwordForm: FormGroup;
  showPassword: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    // Ahora el email es editable, no está deshabilitado
    this.passwordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],  // Habilitado para que lo ingrese el usuario
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  ngOnInit(): void {
    // Aquí ya no es necesario el código para establecer el correo desde la URL
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.passwordForm.valid) {
      const email = this.passwordForm.get('email')?.value;
      const newPassword = this.passwordForm.value.password;

      console.log('Email:', email);
      console.log('Nueva contraseña:', newPassword);

      // Redirige a la página de éxito
      this.router.navigate(['/password-success']);
    }
  }
}
