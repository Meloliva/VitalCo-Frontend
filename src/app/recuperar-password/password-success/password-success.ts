import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-password-success',
  templateUrl: './password-success.html',
  standalone: true,
  imports: [],
  styleUrls: ['./password-success.css']
})
export class PasswordSuccessComponent {

  constructor(private router: Router) {}

  goToLogin() {
    this.router.navigate(['/login']);
  }

  exit() {
    // Aquí puedes redirigir a donde quieras o cerrar sesión
    this.router.navigate(['/']);
  }
}
