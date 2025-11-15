import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { Plan } from '../models/plan.model';
import { Paciente } from '../models/paciente.model';
import { CambiarPlanService } from '../service/cambiar-plan.service';
// Importas el DTO, así que lo usamos para construir el objeto
import { EditarPaciente } from '../models/editar-paciente.model';

@Component({
  selector: 'app-cambiar-plan',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  templateUrl: './cambiar-plan.html',
  styleUrls: ['./cambiar-plan.css']
})
export class CambiarPlan implements OnInit {
  planes: Plan[] = [];
  paciente?: Paciente;
  isProcessing = false;

  // --- NEW: State variables for modals (replace confirm/alert) ---
  showConfirmationModal = false;
  showInfoModal = false;
  modalInfoType: 'success' | 'error' = 'success'; // <-- A TU CÓDIGO LE FALTA ESTA LÍNEA
  modalMessage = '';
  planToConfirm: Plan | null = null;
  // --- END NEW ---

  constructor(
    private cambiarPlanService: CambiarPlanService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    console.log('🚀 Inicializando componente Cambiar Plan');
    this.cargarPlanes();
    this.cargarPaciente();
  }

  cargarPlanes() {
    console.log('🔄 Cargando planes de suscripción...');
    this.cambiarPlanService.listarPlanesSuscripcion().subscribe({
      next: (data) => {
        console.log('📦 Planes recibidos:', data);

        if (data && Array.isArray(data) && data.length > 0) {
          this.planes = [...data];
          console.log(`✅ ${this.planes.length} planes cargados exitosamente`);

          setTimeout(() => {
            this.cdr.detectChanges();
          }, 0);
        } else {
          console.warn('⚠️ No hay planes válidos, usando mock');
          this.planes = this.mockPlanes();
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error('❌ Error al cargar planes:', err);
        this.planes = this.mockPlanes();
        this.cdr.detectChanges();
      }
    });
  }

  cargarPaciente() {
    this.cambiarPlanService.obtenerPacienteActual().subscribe({
      next: (p) => {
        console.log('👤 Paciente cargado:', p);
        this.paciente = p;
        this.cdr.detectChanges(); // Forzar detección de cambios
      },
      error: (err) => {
        console.error('❌ Error al cargar paciente:', err);
        this.paciente = this.mockPaciente();
        this.cdr.detectChanges();
      }
    });
  }

  // --- MODIFIED: Now triggers a confirmation modal ---
  seleccionarPlan(plan: Plan) {
    console.log('🎯 Seleccionando plan:', plan);
    console.log('📋 Plan actual antes:', this.paciente?.idplan);

    if (this.isPlanActual(plan)) {
      console.log('⚠️ Este ya es el plan actual');
      return;
    }

    if (!this.paciente) {
      console.error('❌ No hay paciente cargado');
      // Show info modal instead of alert
      this.modalMessage = 'Error: No se pudo cargar la información del paciente.';
      this.showInfoModal = true;
      this.cdr.detectChanges();
      return;
    }

    // Show confirmation modal
    this.planToConfirm = plan;
    this.modalMessage = `¿Deseas cambiar a ${plan.tipo}?`;
    this.showConfirmationModal = true;
    this.cdr.detectChanges();
  }

  // --- NEW: Handles the logic after user confirms ---
  confirmarCambio() {
    if (!this.planToConfirm || !this.paciente) {
      console.error('❌ Confirmación fallida, sin plan o paciente');
      this.showConfirmationModal = false;
      return;
    }

    const plan = this.planToConfirm;
    this.showConfirmationModal = false;
    this.isProcessing = true;
    this.cdr.detectChanges();

    console.log('🔄 Procesando cambio de plan...');

    // --- CRITICAL FIX (v2) ---
    // Ahora construimos el DTO (EditarPaciente) basándonos en la
    // interfaz que me mostraste.
    // Asumimos que 'planSuscripcion' es el 'tipo' (string) del plan.
    const dto: EditarPaciente = {
      id: this.paciente.id,
      planSuscripcion: plan.tipo
      // No enviamos más campos, así el backend solo debe actualizar el plan.
    };

    console.log('📤 Datos enviados (DTO):', dto);

    // Call the service with the single 'dto' object
    this.cambiarPlanService.cambiarPlanPaciente(dto).subscribe({
      next: (updated) => {
        console.log('✅ Respuesta del backend:', updated);
        console.log('📋 Nuevo plan del paciente:', updated.idplan);

        // Actualizar el paciente completo
        this.paciente = updated;
        this.isProcessing = false;
        this.planToConfirm = null;

        // Forzar detección de cambios
        this.cdr.detectChanges();

        console.log('✅ Estado actualizado. Plan actual ahora:', this.paciente.idplan);

        // Show success modal instead of alert
        this.modalMessage = `¡Plan cambiado exitosamente a ${updated.idplan.tipo}!`;
        this.showInfoModal = true;
        this.cdr.detectChanges();

        // Verificar si el cambio se aplicó correctamente
        if (updated.idplan.id !== plan.id) {
          console.warn('⚠️ El backend no cambió el plan como se esperaba');
          console.warn('   Plan esperado:', plan.id, '- Plan recibido:', updated.idplan.id);
        }
      },
      error: (err) => {
        console.error('❌ Error al cambiar plan:', err);
        console.error('❌ Status:', err.status);
        console.error('❌ Respuesta completa:', err.error);
        this.isProcessing = false;
        this.planToConfirm = null;

        let mensaje = 'Error al cambiar el plan. Por favor intenta nuevamente.';

        // Extraer mensaje específico del backend
        if (err.error?.errors && Array.isArray(err.error.errors) && err.error.errors.length > 0) {
          mensaje = err.error.errors[0];
        } else if (err.error?.message) {
          mensaje = err.error.message;
        }

        // Show error modal instead of alert
        this.modalMessage = mensaje;
        this.showInfoModal = true;
        this.cdr.detectChanges();
      }
    });
  }

  // --- NEW: Handles cancellation from the modal ---
  cancelarCambio() {
    console.log('❌ Usuario canceló el cambio');
    this.showConfirmationModal = false;
    this.planToConfirm = null;
    this.cdr.detectChanges();
  }

  // --- NEW: Closes the info/success/error modal ---
  cerrarModalInfo() {
    this.showInfoModal = false;
    this.modalMessage = '';
    this.cdr.detectChanges();
  }

  // --- No changes below this line ---

  isPlanActual(plan: Plan): boolean {
    if (!this.paciente || !this.paciente.idplan) {
      return false;
    }

    return this.paciente.idplan.id === plan.id;
  }

  obtenerSubtitulo(plan: Plan): string {
    if (plan.precio === 0 || !plan.precio) {
      return 'Acceso básico a la plataforma';
    }
    return 'Acceso completo y asesoría personalizada';
  }

  formatearPrecio(precio: number | undefined): string {
    if (!precio || precio === 0) {
      return 'Gratuito';
    }
    return `S/. ${precio.toFixed(2)}`;
  }

  trackByPlanId(index: number, plan: Plan): number {
    return plan.id || index;
  }

  trackByIndex(index: number): number {
    return index;
  }

  obtenerFeatures(plan: Plan): string[] {
    // Si el backend envía beneficiosPlan, usarlo
    if (plan.beneficiosPlan && plan.beneficiosPlan.trim()) {
      return plan.beneficiosPlan.split(',').map(b => b.trim());
    }

    // Fallback por precio
    if (!plan.precio || plan.precio === 0) {
      return [
        'Recetas básicas para triglicéridos',
        'Registro manual de alimentos',
        'Gráfica simple de progreso'
      ];
    }

    return [
      'Acceso ilimitado a todas las recetas',
      'Asesoría personalizada con nutricionista',
      'Planes alimenticios personalizados',
      'Seguimiento detallado',
      'Videoconsultas'
    ];
  }

  private mockPlanes(): Plan[] {
    return [
      {
        id: 1,
        tipo: 'Plan free',
        beneficiosPlan: 'Acceso a recetas básicas, Calcula tu IMC, Gráfica simple de progreso',
        precio: 0,
        terminosCondiciones: 'Plan gratuito. Sin compromisos.'
      },
      {
        id: 2,
        tipo: 'Plan premium',
        beneficiosPlan: 'Acceso ilimitado a todas las recetas, Asesoría personalizada con nutricionista, Planes alimenticios personalizados, Seguimiento detallado, Videoconsultas',
        precio: 95.99,
        terminosCondiciones: 'Pago mensual. Cancela cuando quieras.'
      }
    ];
  }

  private mockPaciente(): Paciente {
    return {
      id: 123,
      idusuario: {
        id: 1,
        dni: '12345678',
        nombre: 'Usuario',
        apellido: 'Mock',
        correo: 'mock@test.com',
        genero: 'Masculino',
        estado: 'Activo',
        rol: { id: 2, tipo: 'PACIENTE' }
      },
      idplan: {
        id: 1,
        tipo: 'Plan free',
        precio: 0,
        beneficiosPlan: 'Acceso básico',
        terminosCondiciones: ''
      },
      altura: 1.75,
      peso: 70,
      edad: 30,
      trigliceridos: 150,
      actividadFisica: 'Moderada',
      idPlanNutricional: { id: 1, duracion: '30 días', objetivo: 'Mantener' }
    };
  }
}
