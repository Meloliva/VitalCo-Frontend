import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-password-success',
  templateUrl: './password-success.html',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatCardModule
  ],
  styleUrls: ['./password-success.css']
})
export class PasswordSuccessComponent {

  constructor(private router: Router) {}

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  exit(): void {
    // Redirige al home o cierra sesión según tu lógica
    this.router.navigate(['/']);
  }
}
