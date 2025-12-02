import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
import { ActivatedRoute, Router } from '@angular/router';

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
  procesandoImagen = false;

  horarios: HorarioDTO[] = [];

  modoEditar = false;
  idEditar: number | null = null;

  constructor(
    private fb: FormBuilder,
    private nutricionistaService: NutricionistaService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    this.inicializarFormulario();
    await this.cargarHorarios();

    // ✅ CAMBIO: Ahora lee desde queryParams en vez de paramMap
    this.route.queryParams.subscribe(params => {
      if (params['id']) {
        this.idEditar = Number(params['id']);
        this.modoEditar = true;
        this.cargarReceta(this.idEditar);
      }
    });
  }

  async cargarReceta(id: number) {
    const recetas = await firstValueFrom(this.nutricionistaService.getRecetas());
    const receta = recetas.find(r => r.idReceta === id);

    if (!receta) return;

    this.recetaForm.patchValue({
      nombre: receta.nombre,
      tiempo: receta.tiempo,
      horario: receta.idhorario?.id,
      pesoPorcion: receta.cantidadPorcion,
      calorias: receta.calorias,
      grasaSaturada: receta.grasas,
      proteina: receta.proteinas,
      azucares: receta.carbohidratos,
      descripcion: receta.descripcion,
      ingredientes: receta.ingredientes,
      preparacion: receta.preparacion
    });

    // ✅ Cargar la imagen si existe
    if (receta.foto) {
      this.imagenPreview = receta.foto;
      this.archivoBase64 = receta.foto;
      this.cdr.detectChanges();
    }
  }

  inicializarFormulario() {
    this.recetaForm = this.fb.group({
      nombre: ['', Validators.required],
      tiempo: ['', Validators.required],
      horario: [null, Validators.required],
      pesoPorcion: ['', [Validators.required, Validators.min(1)]],
      calorias: ['', [Validators.required, Validators.min(1)]],
      grasaSaturada: ['', [Validators.required, Validators.min(0)]],
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

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      if (!file.type.startsWith("image/")) {
        alert("Archivo inválido, solo imágenes.");
        return;
      }

      this.procesandoImagen = true;
      this.imagenPreview = null;
      this.cdr.detectChanges();

      try {
        this.archivoBase64 = await this.procesarImagen(file);
        this.imagenPreview = this.archivoBase64;

        console.log("✅ Imagen procesada correctamente");
        console.log("📦 Tamaño en KB:", (this.archivoBase64.length / 1024).toFixed(2));

        this.cdr.detectChanges();
      } catch (error) {
        console.error("❌ Error al procesar imagen:", error);
        alert("Error al procesar la imagen");
      } finally {
        this.procesandoImagen = false;
        this.cdr.detectChanges();
      }
    }
  }

  private procesarImagen(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const img = new Image();

        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            if (!ctx) {
              reject(new Error('No se pudo crear el contexto del canvas'));
              return;
            }

            // Redimensionar a máximo 800px de ancho manteniendo proporción
            const maxWidth = 800;
            const scale = maxWidth / img.width;
            canvas.width = maxWidth;
            canvas.height = img.height * scale;

            // Dibujar imagen redimensionada
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            // Convertir a base64 con calidad 0.7 (70%)
            const comprimida = canvas.toDataURL('image/jpeg', 0.7);

            console.log("📦 Tamaño original:", (e.target?.result as string).length);
            console.log("📦 Tamaño comprimido:", comprimida.length);

            resolve(comprimida);
          } catch (error) {
            reject(error);
          }
        };

        img.onerror = () => reject(new Error('Error al cargar la imagen'));
        img.src = e.target?.result as string;
      };

      reader.onerror = () => reject(new Error('Error al leer el archivo'));
      reader.readAsDataURL(file);
    });
  }

  async guardar(): Promise<void> {
    if (this.modoEditar) {
      this.actualizar();
      return;
    }

    if (this.recetaForm.invalid) {
      alert("⚠️ Completa los campos obligatorios.");
      return;
    }

    const valores = this.recetaForm.value;

    const receta: RecetaDTO = {
      nombre: valores.nombre,
      descripcion: valores.descripcion,
      tiempo: Number(valores.tiempo),
      carbohidratos: Number(valores.azucares),
      grasas: Number(valores.grasaSaturada),
      proteinas: Number(valores.proteina),
      calorias: Number(valores.calorias),
      cantidadPorcion: Number(valores.pesoPorcion),
      ingredientes: valores.ingredientes,
      preparacion: valores.preparacion,
      foto: this.archivoBase64,
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
    } catch (e: any) {
      console.error("❌ Error completo:", e);
      console.error("❌ Detalle del error:", e.error);
      alert("❌ Error al guardar la receta");
    }
  }

  async actualizar() {
    if (this.recetaForm.invalid) {
      alert("⚠️ Completa los campos obligatorios.");
      return;
    }

    const valores = this.recetaForm.value;

    const recetaEditada: RecetaDTO = {
      idReceta: this.idEditar!,
      nombre: valores.nombre,
      descripcion: valores.descripcion,
      tiempo: Number(valores.tiempo),
      carbohidratos: Number(valores.azucares),
      grasas: Number(valores.grasaSaturada),
      proteinas: Number(valores.proteina),
      calorias: Number(valores.calorias),
      cantidadPorcion: Number(valores.pesoPorcion),
      ingredientes: valores.ingredientes,
      preparacion: valores.preparacion,
      foto: this.archivoBase64,
      idhorario: { id: valores.horario, nombre: "" }
    };

    try {
      await firstValueFrom(this.nutricionistaService.actualizarReceta(recetaEditada));
      alert("✅ Receta actualizada correctamente");
      this.router.navigate(['/nutricionista/recetas-nutricionista/listar']);
    } catch (e: any) {
      console.error("❌ Error al actualizar:", e);
      alert("❌ Error al actualizar la receta");
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
