import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { NutricionistaService, TurnoDTO } from '../service/nutricionista.service';
import { firstValueFrom } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-perfil',
  templateUrl: './perfil.html',
  styleUrls: ['./perfil.css'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,
  ]
})
export class PerfilNutricionistaComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  perfilForm!: FormGroup;
  turnos: TurnoDTO[] = [];
  imagenPerfil: string = 'https://placehold.co/70x70/00BF61/FFFFFF?text=Foto';
  cargando = false;
  nutricionistaId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private nutricionistaService: NutricionistaService
  ) {}

  ngOnInit(): void {
    this.inicializarFormulario();
    this.cargarTurnos();
    this.cargarDatosNutricionista();
  }

  inicializarFormulario(): void {
    this.perfilForm = this.fb.group({
      asociacion: ['', Validators.required],
      grado: ['', Validators.required],
      universidad: ['', Validators.required],
      turno: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      password: ['']
    });
  }

  async cargarTurnos() {
    try {
      this.turnos = await firstValueFrom(this.nutricionistaService.listarTurnos());
    } catch (err) {
      console.error('❌ Error al cargar turnos:', err);
      this.mostrarNotificacion('Error al cargar los turnos disponibles', true);
    }
  }

  async cargarDatosNutricionista() {
    try {
      this.cargando = true;

      const data = await firstValueFrom(this.nutricionistaService.obtenerDatosNutricionista());
      console.log('✅ Datos del nutricionista cargados:', data);

      this.nutricionistaId = data.id || null;

      this.perfilForm.patchValue({
        asociacion: data.asociaciones || '',
        grado: data.gradoAcademico || '',
        universidad: data.universidad || '',
        turno: data.idturno?.id || '',
        correo: data.idusuario?.correo || ''
      });

      if (data.idusuario?.fotoPerfil) {
        this.imagenPerfil = data.idusuario.fotoPerfil;
      }

    } catch (err) {
      console.error('❌ Error al cargar datos del nutricionista:', err);
      this.mostrarNotificacion('Error al cargar el perfil del nutricionista', true);
    } finally {
      this.cargando = false;
    }
  }

  async guardarCambios() {
    if (this.perfilForm.invalid) {
      this.mostrarNotificacion('Por favor, completa los campos requeridos', true);
      return;
    }

    try {
      this.cargando = true;
      const formValue = this.perfilForm.value;

      const datosActualizar: any = {
        id: this.nutricionistaId,
        asociaciones: formValue.asociacion,
        gradoAcademico: formValue.grado,
        universidad: formValue.universidad,
        idTurno: parseInt(formValue.turno),
        correo: formValue.correo,
      };

      if (formValue.password?.trim()) {
        datosActualizar.contraseña = formValue.password.trim();
      }

      if (this.imagenPerfil && !this.imagenPerfil.includes('placehold.co')) {
        datosActualizar.fotoPerfil = this.imagenPerfil;
      }

      await firstValueFrom(this.nutricionistaService.editarNutricionista(datosActualizar));

      this.mostrarNotificacion('Datos actualizados correctamente');
      this.cargarDatosNutricionista();

    } catch (err) {
      console.error('❌ Error al guardar datos:', err);
      this.mostrarNotificacion('Error al guardar los cambios', true);
    } finally {
      this.cargando = false;
    }
  }

  async eliminarCuenta() {
    if (!confirm('¿Estás seguro de eliminar tu cuenta?')) return;

    try {
      this.cargando = true;
      await firstValueFrom(this.nutricionistaService.eliminarUsuario());
      this.mostrarNotificacion('Cuenta eliminada exitosamente');
      localStorage.clear();
      window.location.href = '/inicio';
    } catch (err) {
      console.error('❌ Error al eliminar cuenta:', err);
      this.mostrarNotificacion('Error al eliminar la cuenta', true);
    } finally {
      this.cargando = false;
    }
  }

  abrirSelectorArchivo() {
    this.fileInput.nativeElement.click();
  }

  cambiarFoto(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      if (file.size > 5 * 1024 * 1024) {
        this.mostrarNotificacion('La imagen es muy grande (máx. 5MB)', true);
        return;
      }

      if (!file.type.startsWith('image/')) {
        this.mostrarNotificacion('Solo se permiten imágenes', true);
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        this.imagenPerfil = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  mostrarNotificacion(mensaje: string, error = false) {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 3000,
      panelClass: error ? ['snack-error'] : ['snack-success']
    });
  }
}
