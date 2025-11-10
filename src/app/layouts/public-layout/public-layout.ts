import { Component } from '@angular/core';
import { Router, NavigationEnd, RouterLink, RouterOutlet } from '@angular/router';
import { NgIf } from '@angular/common';
import { filter } from 'rxjs/operators';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, NgIf, MatToolbarModule, MatButtonModule, MatIconModule],
  templateUrl: './public-layout.html',
  styleUrls: ['./public-layout.css'],
})
export class PublicLayout {
  showHeaderFooter: boolean = true;

  constructor(private router: Router) {}

  ngOnInit() {
    this.checkRoute(this.router.url);

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.checkRoute(event.urlAfterRedirects);
    });
  }

  private checkRoute(url: string) {
    const hiddenRoutes = [
      '/registro', '/perfil', 'iniciarsesion', 'verificar-codigo', 'nueva-password', 'password-success',
      'datos-salud', 'objetivo', 'nivelactividad', 'macronutrientes', 'escoger-plan'
    ];
    this.showHeaderFooter = !hiddenRoutes.some(route => url.includes(route));
  }
}
