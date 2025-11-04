import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { RouterLink, RouterOutlet } from '@angular/router';
import { NgIf } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, NgIf],
  templateUrl: './public-layout.html',
  styleUrl: './public-layout.css',
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







    const hiddenRoutes = ['/registro', '/perfil','iniciarsesion','verificar-codigo','nueva-password','password-success','datos-salud','objetivo','nivelactividad','plan','macronutrientes'];

    this.showHeaderFooter = !hiddenRoutes.some(route => url.includes(route));

  }
}
