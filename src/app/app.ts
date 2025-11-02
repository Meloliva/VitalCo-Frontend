import { Component, signal, OnInit } from '@angular/core';
import { Router, RouterOutlet, RouterLink, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('VitalCoFrontend');
  showHeaderFooter: boolean = true;

  constructor(private router: Router) {}

  ngOnInit() {
    // Verificar la ruta inicial
    this.checkRoute(this.router.url);

    // Escuchar cambios de ruta
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.checkRoute(event.urlAfterRedirects);
    });
  }

  private checkRoute(url: string) {
    const hiddenRoutes = ['/iniciarsesion', '/registro', '/perfil'];
    this.showHeaderFooter = !hiddenRoutes.some(route => url.includes(route));

    // Debug: puedes ver en consola qué está pasando
    console.log('URL actual:', url);
    console.log('Mostrar header/footer:', this.showHeaderFooter);
  }
}
