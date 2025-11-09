import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

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
    MatIconModule
  ],
  templateUrl: './recetas.html',
  styleUrls: ['./recetas.css']
})
export class RecetasComponent implements OnInit {
  recetaForm!: FormGroup;
  imagenPreview: string | null = null;
  archivoImagen: File | null = null;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.recetaForm = this.fb.group({
      nombre: ['', Validators.required],
      tiempo: ['', Validators.required],
      tipoComida: ['', Validators.required],
      pesoPorcion: ['', [Validators.required, Validators.min(1)]],
      calorias: ['', [Validators.required, Validators.min(1)]],
      grasaSaturada: ['', [Validators.required, Validators.min(0)]],
      grasaTrans: ['', [Validators.required, Validators.min(0)]],
      proteina: ['', [Validators.required, Validators.min(0)]],
      azucares: ['', [Validators.required, Validators.min(0)]],
      descripcion: ['', Validators.required]
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.archivoImagen = file;

      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = e => {
          this.imagenPreview = e.target?.result as string;
        };
        reader.readAsDataURL(file);
      } else {
        alert('Por favor, selecciona una imagen válida.');
      }
    }
  }

  guardar(): void {
    if (this.recetaForm.valid) {
      const data = { ...this.recetaForm.value, imagen: this.archivoImagen?.name };
      console.log('Receta guardada:', data);
      alert('✅ ¡Receta guardada exitosamente!');
      this.limpiarFormulario();
    } else {
      alert('⚠️ Por favor completa todos los campos.');
    }
  }

  modificar(): void {
    if (this.recetaForm.valid) {
      console.log('Receta modificada:', this.recetaForm.value);
      alert('✏️ Receta lista para modificar.');
    } else {
      alert('⚠️ Completa todos los campos antes de modificar.');
    }
  }

  limpiarFormulario(): void {
    this.recetaForm.reset();
    this.imagenPreview = null;
    this.archivoImagen = null;
  }
}
