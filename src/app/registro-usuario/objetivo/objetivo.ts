import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // ✅ Agregar
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { RegistroSharedService } from '../../service/registro-shared.service';

@Component({
  selector: 'app-objetivo',
  standalone: true,
  templateUrl: './objetivo.html',
  styleUrls: ['./objetivo.css'],
  imports: [CommonModule, FormsModule, MatProgressBarModule] // ✅ Agregar FormsModule
})
export class ObjetivoComponent implements OnInit {
  progressValue = 0;
  objetivoSeleccionado: string = '';

  constructor(
    private router: Router,
    private registroShared: RegistroSharedService
  ) {}

  ngOnInit(): void {
    this.registroShared.progress$.subscribe(progress => this.progressValue = progress);
  }

  // ✅ Método faltante
  onSelectChange(): void {
    console.log('Objetivo seleccionado:', this.objetivoSeleccionado);
  }

  goBack(): void {
    this.router.navigate(['/datos-salud']);
  }

  onSubmit(): void {
    if (!this.objetivoSeleccionado) {
      alert('Por favor selecciona tu objetivo');
      return;
    }

    this.registroShared.guardarObjetivo(this.objetivoSeleccionado);
    this.router.navigate(['/nivel-actividad']);
  }
}
