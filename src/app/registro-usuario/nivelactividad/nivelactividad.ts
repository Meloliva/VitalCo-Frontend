import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { RegistroSharedService } from '../../service/registro-shared.service';

@Component({
  selector: 'app-nivel-actividad',
  standalone: true,
  templateUrl: './nivelactividad.html',
  styleUrls: ['./nivelactividad.css'],
  imports: [CommonModule, MatProgressBarModule]
})
export class NivelActividadComponent implements OnInit {
  progressValue = 0;
  nivelSeleccionado: string = '';

  constructor(
    private router: Router,
    private registroShared: RegistroSharedService
  ) {}

  ngOnInit(): void {
    this.registroShared.progress$.subscribe(progress => this.progressValue = progress);
  }

  selectNivel(nivel: string): void {
    this.nivelSeleccionado = nivel;
  }

  goBack(): void {
    this.router.navigate(['/objetivo']);
  }

  onSubmit(): void {
    if (!this.nivelSeleccionado) {
      alert('Por favor selecciona tu nivel de actividad');
      return;
    }

    this.registroShared.guardarNivelActividad(this.nivelSeleccionado);
    this.router.navigate(['/escoger-plan']);
  }

}
