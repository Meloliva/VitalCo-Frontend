import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {MatProgressBar} from '@angular/material/progress-bar';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-objetivo',
  templateUrl: './objetivo.html',
  imports: [
    MatProgressBar,
    FormsModule
  ],
  styleUrls: ['./objetivo.css']
})
export class ObjetivoComponent implements OnInit {

  // Valor de la barra de progreso
  progressValue: number = 60;

  // Objetivo seleccionado
  objetivoSeleccionado: string = 'mantener-12'; // Valor por defecto

  constructor(private router: Router) { }

  ngOnInit(): void {
    // Inicialización si es necesaria
  }

  /**
   * Función para volver a la página anterior
   */
  goBack(): void {
    console.log("Volviendo a la página anterior...");
    this.router.navigate(['/datos-salud']);
    // Cambia por tu ruta
    // O también puedes usar: window.history.back();
  }

  /**
   * Función para seleccionar una opción
   * @param value - Valor del objetivo seleccionado
   */
  selectOption(value: string): void {
    this.objetivoSeleccionado = value;
    console.log('Objetivo seleccionado:', this.objetivoSeleccionado);
  }

  /**
   * Función cuando cambia el select
   */
  onSelectChange(): void {
    console.log('Select cambiado a:', this.objetivoSeleccionado);
  }

  /**
   * Función para enviar el formulario
   */
  onSubmit(): void {
    if (!this.objetivoSeleccionado) {
      alert('Por favor selecciona un objetivo');
      return;
    }

    // Aquí puedes procesar el objetivo seleccionado
    console.log('Objetivo enviado:', this.objetivoSeleccionado);

    // Ejemplo: Guardar en localStorage
    localStorage.setItem('objetivo', this.objetivoSeleccionado);

    // Navegar a la siguiente página
    this.router.navigate(['/nivelactividad']); // Cambia por tu ruta
  }

  /**
   * Función para obtener el texto completo del objetivo
   */
  getObjetivoTexto(): string {
    const objetivos: { [key: string]: string } = {
      'bajar-12': 'bajar triglicéridos - 12 meses',
      'bajar-3': 'bajar triglicéridos - 3 meses',
      'bajar-6': 'bajar triglicéridos - 6 meses',
      'mantener-12': 'mantener tu salud - 12 meses',
      'mantener-3': 'mantener tu salud - 3 meses',
      'mantener-6': 'mantener tu salud - 6 meses'
    };

    return objetivos[this.objetivoSeleccionado] || '';
  }

  /**
   * Función para verificar si es objetivo de bajar triglicéridos
   */
  esBajarTrigliceridos(): boolean {
    return this.objetivoSeleccionado.startsWith('bajar');
  }

  /**
   * Función para obtener la duración en meses
   */
  getDuracionMeses(): number {
    if (this.objetivoSeleccionado.includes('12')) {
      return 12;
    } else if (this.objetivoSeleccionado.includes('6')) {
      return 6;
    } else if (this.objetivoSeleccionado.includes('3')) {
      return 3;
    }
    return 0;
  }
}
