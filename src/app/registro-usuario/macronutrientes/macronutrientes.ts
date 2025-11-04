import { Component, OnInit, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Chart, registerables } from 'chart.js';

// Registrar componentes de Chart.js
Chart.register(...registerables);

interface DatosUsuario {
  peso: number;
  altura: number;
  edad: number;
  genero: string;
  nivelActividad: string;
  objetivo: string;
  trigliceridos?: number;
}

@Component({
  selector: 'app-resumen-final',
  standalone: true,
  templateUrl: './macronutrientes.html',
  styleUrls: ['./macronutrientes.css'],
  imports: [CommonModule]
})
export class MacronutrientesComponent implements OnInit, AfterViewInit {
  // Datos calculados
  caloriasCalculadas: number = 0;
  proteinas: number = 0;
  carbohidratos: number = 0;
  grasas: number = 0;
  mesesObjetivo: number = 3;

  private chart: any;
  private isBrowser: boolean;

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Verificar si estamos en el navegador
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      this.cargarDatosYCalcular();
    }
  }

  ngAfterViewInit(): void {
    if (this.isBrowser) {
      this.crearGrafico();
    }
  }

  cargarDatosYCalcular(): void {
    // Solo ejecutar en el navegador
    if (!this.isBrowser) return;

    // Recuperar datos del localStorage
    const datosUsuario: DatosUsuario = {
      peso: parseFloat(localStorage.getItem('peso') || '70'),
      altura: parseFloat(localStorage.getItem('altura') || '170'),
      edad: parseFloat(localStorage.getItem('edad') || '30'),
      genero: localStorage.getItem('genero') || 'masculino',
      nivelActividad: localStorage.getItem('nivelActividad') || 'sedentario',
      objetivo: localStorage.getItem('objetivo') || 'mantener-3',
      trigliceridos: parseFloat(localStorage.getItem('trigliceridos') || '150')
    };

    // Extraer meses del objetivo (ej: "bajar-3" -> 3 meses)
    const objetivoSplit = datosUsuario.objetivo.split('-');
    this.mesesObjetivo = parseInt(objetivoSplit[1]) || 3;

    // Calcular calorías y macros
    this.calcularCalorias(datosUsuario);
    this.calcularMacros();
  }

  calcularCalorias(datos: DatosUsuario): void {
    // Fórmula Mifflin-St Jeor para TMB (Tasa Metabólica Basal)
    let tmb = 0;

    if (datos.genero === 'masculino') {
      tmb = (10 * datos.peso) + (6.25 * datos.altura) - (5 * datos.edad) + 5;
    } else {
      tmb = (10 * datos.peso) + (6.25 * datos.altura) - (5 * datos.edad) - 161;
    }

    // Factor de actividad
    const factoresActividad: { [key: string]: number } = {
      'sedentario': 1.2,
      'ligero': 1.375,
      'moderado': 1.55,
      'intenso': 1.725,
      'muy-activo': 1.9
    };

    const factor = factoresActividad[datos.nivelActividad] || 1.2;
    let caloriasDiarias = tmb * factor;

    // Ajustar según objetivo
    if (datos.objetivo.includes('bajar')) {
      caloriasDiarias -= 500; // Déficit calórico para bajar peso/triglicéridos
    } else if (datos.objetivo.includes('subir')) {
      caloriasDiarias += 500; // Superávit calórico
    }

    this.caloriasCalculadas = Math.round(caloriasDiarias);
  }

  calcularMacros(): void {
    // Distribución de macronutrientes (ajustable según necesidad)
    // Proteínas: 30% de calorías (4 kcal/g)
    // Carbohidratos: 40% de calorías (4 kcal/g)
    // Grasas: 30% de calorías (9 kcal/g)

    this.proteinas = Math.round((this.caloriasCalculadas * 0.30) / 4);
    this.carbohidratos = Math.round((this.caloriasCalculadas * 0.40) / 4);
    this.grasas = Math.round((this.caloriasCalculadas * 0.30) / 9);
  }

  crearGrafico(): void {
    if (!this.isBrowser) return;

    const canvas = document.getElementById('macrosChart') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    this.chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Proteínas', 'Carbohidratos', 'Grasas'],
        datasets: [{
          data: [this.proteinas, this.carbohidratos, this.grasas],
          backgroundColor: [
            '#FF6384',
            '#36A2EB',
            '#FFCE56'
          ],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });
  }

  finalizarRegistro(): void {
    console.log('Registro completado');
    this.router.navigate(['/dashboard']);
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
  }
}
