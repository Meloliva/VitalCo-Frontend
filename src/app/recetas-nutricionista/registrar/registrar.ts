import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatOptionModule } from '@angular/material/core';
import { firstValueFrom } from 'rxjs';

import { NutricionistaService, HorarioDTO, RecetaDTO } from '../../service/nutricionista.service';

@Component({
  selector: 'app-recetas',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatOptionModule,
    MatIconModule
  ],
  templateUrl: './registrar.html',
  styleUrls: ['./registrar.css']
})
export class RegistrarRecetaNutricionista implements OnInit {

  recetaForm!: FormGroup;
  imagenPreview: string | null = null;
  archivoBase64: string | null = null;

  horarios: HorarioDTO[] = [];

  constructor(
    private fb: FormBuilder,
    private nutricionistaService: NutricionistaService
  ) {}

  async ngOnInit() {
    this.inicializarFormulario();
    await this.cargarHorarios();
  }

  inicializarFormulario() {
    this.recetaForm = this.fb.group({
      nombre: ['', Validators.required],
      tiempo: ['', Validators.required],
      horario: [null, Validators.required],
      pesoPorcion: ['', [Validators.required, Validators.min(1)]],
      calorias: ['', [Validators.required, Validators.min(1)]],
      grasaSaturada: ['', [Validators.required, Validators.min(0)]],
      grasaTrans: ['', [Validators.required, Validators.min(0)]],
      proteina: ['', [Validators.required, Validators.min(0)]],
      azucares: ['', [Validators.required, Validators.min(0)]],
      descripcion: ['', Validators.required],
      ingredientes: ['', Validators.required],
      preparacion: ['', Validators.required]
    });
  }

  async cargarHorarios() {
    try {
      this.horarios = await firstValueFrom(this.nutricionistaService.listarHorarios());
      console.log("✔ Horarios cargados:", this.horarios);

      // Selecciona el primer horario por defecto
      if (this.horarios.length > 0) {
        this.recetaForm.patchValue({ horario: this.horarios[0].id });
      }
    } catch (e) {
      console.error("❌ Error al cargar horarios:", e);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      if (!file.type.startsWith("image/")) {
        alert("Archivo inválido, solo imágenes.");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagenPreview = e.target?.result as string;
        this.archivoBase64 = this.imagenPreview; // guardamos base64
      };

      reader.readAsDataURL(file);
    }
  }

  async guardar(): Promise<void> {
    if (this.recetaForm.invalid) {
      alert("⚠️ Completa los campos obligatorios.");
      return;
    }

    const valores = this.recetaForm.value;

    const receta: RecetaDTO = {
      nombre: valores.nombre,
      descripcion: valores.descripcion,
      tiempo: valores.tiempo,
      carbohidratos: valores.azucares,
      grasas: valores.grasaSaturada + valores.grasaTrans,
      proteinas: valores.proteina,
      calorias: valores.calorias,
      cantidadPorcion: valores.pesoPorcion,
      ingredientes: valores.ingredientes,
      preparacion: valores.preparacion,
      foto: null, // imagen opcional
      idhorario: {
        id: valores.horario,
        nombre: ""
      }
    };

    console.log("📤 Enviando receta:", receta);

    try {
      await firstValueFrom(this.nutricionistaService.registrarReceta(receta));
      alert("✅ Receta registrada correctamente");
      this.limpiarFormulario();
    } catch (e) {
      console.error("❌ Error al registrar receta:", e);
      alert("❌ Error al guardar la receta");
    }
  }

  limpiarFormulario() {
    this.recetaForm.reset();
    this.archivoBase64 = null;
    this.imagenPreview = null;

    // Reaplicar el primer horario como valor por defecto
    if (this.horarios.length > 0) {
      this.recetaForm.patchValue({ horario: this.horarios[0].id });
    }
  }
}
