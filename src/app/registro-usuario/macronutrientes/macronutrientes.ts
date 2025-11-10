import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { PacienteService, PlanNutricionalDTO } from '../../service/paciente.service';
import { RegistroSharedService } from '../../service/registro-shared.service';

@Component({
  selector: 'app-macronutrientes',
  standalone: true,
  templateUrl: './macronutrientes.html',
  styleUrls: ['./macronutrientes.css'],
  imports: [CommonModule, MatProgressBarModule]
})
export class MacronutrientesComponent implements OnInit {
  progressValue = 0;
  planesNutricionales: PlanNutricionalDTO[] = [];
  planSeleccionado: number = 0;
  isLoading = false;

  // ✅ Agregar propiedades faltantes
  caloriasCalculadas: number = 2000; // Valor calculado según los datos
  mesesObjetivo: number = 3; // Duración del objetivo
  proteinas: number = 150; // Gramos
  carbohidratos: number = 250; // Gramos
  grasas: number = 60; // Gramos

  constructor(
    private router: Router,
    private pacienteService: PacienteService,
    private registroShared: RegistroSharedService
  ) {}

  ngOnInit(): void {
    this.registroShared.progress$.subscribe(progress => this.progressValue = progress);
    this.cargarPlanesNutricionales();
    this.calcularMacronutrientes(); // ✅ Calcular macros según los datos del paciente
  }

  // ✅ Calcular macronutrientes según los datos ingresados
  private calcularMacronutrientes(): void {
    const datos = this.registroShared.obtenerDatos();

    if (datos.datosSalud && datos.nivelActividad && datos.objetivo) {
      // Fórmula Harris-Benedict simplificada
      const { peso, altura, edad } = datos.datosSalud;
      let tmb = 10 * peso + 6.25 * (altura * 100) - 5 * edad + 5; // Hombre

      // Ajustar según nivel de actividad
      const factorActividad: { [key: string]: number } = {
        'sedentario': 1.2,
        'ligero': 1.375,
        'moderado': 1.55,
        'activo': 1.725,
        'muy_activo': 1.9
      };

      tmb *= factorActividad[datos.nivelActividad.toLowerCase()] || 1.375;

      // Ajustar según objetivo
      if (datos.objetivo === 'bajar_peso') {
        this.caloriasCalculadas = Math.round(tmb - 500);
        this.mesesObjetivo = 3;
      } else if (datos.objetivo === 'aumentar_peso') {
        this.caloriasCalculadas = Math.round(tmb + 500);
        this.mesesObjetivo = 3;
      } else {
        this.caloriasCalculadas = Math.round(tmb);
        this.mesesObjetivo = 2;
      }

      // Calcular macros (40% carbos, 30% proteína, 30% grasa)
      this.proteinas = Math.round((this.caloriasCalculadas * 0.30) / 4);
      this.carbohidratos = Math.round((this.caloriasCalculadas * 0.40) / 4);
      this.grasas = Math.round((this.caloriasCalculadas * 0.30) / 9);
    }
  }

  cargarPlanesNutricionales(): void {
    this.pacienteService.listarPlanesNutricionales().subscribe({
      next: (planes) => this.planesNutricionales = planes,
      error: (error) => console.error('Error al cargar planes nutricionales:', error)
    });
  }

  selectPlan(idPlan: number): void {
    this.planSeleccionado = idPlan;
  }

  goBack(): void {
    this.router.navigate(['/escoger-plan']);
  }

  finalizarRegistro(): void {
    // ✅ Validar que todos los datos estén completos
    if (!this.registroShared.datosCompletos()) {
      alert('Faltan datos por completar');
      return;
    }

    this.isLoading = true;
    const datosCompletos = this.registroShared.obtenerDatos();

    // ✅ El plan nutricional ya fue seleccionado en 'objetivo'
    this.pacienteService.registrarUsuario(datosCompletos.usuarioCompleto!).subscribe({
      next: (usuarioCreado) => {
        const paciente = {
          idusuario: { id: usuarioCreado.id },
          altura: datosCompletos.datosSalud!.altura,
          peso: datosCompletos.datosSalud!.peso,
          edad: datosCompletos.datosSalud!.edad,
          trigliceridos: datosCompletos.datosSalud!.trigliceridos,
          actividadFisica: datosCompletos.nivelActividad!,
          objetivo: datosCompletos.objetivo!,
          idplan: { id: datosCompletos.idPlan },
          idPlanNutricional: { id: datosCompletos.idPlanNutricional } // ✅ Ya guardado
        };

        this.pacienteService.registrarPaciente(paciente).subscribe({
          next: () => {
            this.isLoading = false;
            this.registroShared.limpiarDatos();
            alert('¡Registro completado exitosamente!');
            this.router.navigate(['/login']);
          },
          error: (error) => {
            this.isLoading = false;
            console.error('Error al registrar paciente:', error);
            alert('Error al completar el registro');
          }
        });
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error al registrar usuario:', error);
        alert('Error al registrar usuario');
      }
    });
  }

}
