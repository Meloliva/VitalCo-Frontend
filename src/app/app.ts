import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('VitalCo');
  /*showHeaderFooter: boolean = true; corregir esto

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
  }*/
}
