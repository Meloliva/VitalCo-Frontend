import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-recetas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './recetas.html',
  styleUrls: ['./recetas.css']
})
export class RecetasComponent {
  recetaForm: FormGroup;
  imageFile?: File;
  imagePreview?: string;

  constructor(private fb: FormBuilder) {
    this.recetaForm = this.fb.group({
      nombre: ['', Validators.required],
      tiempo: ['', Validators.required],
      tipoComida: ['', Validators.required],
      peso: [''],
      calorias: [''],
      grasaSaturada: [''],
      grasaTrans: [''],
      proteina: [''],
      azucares: [''],
      descripcion: ['']
    });
  }

  // Evento para seleccionar imagen
  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.imageFile = file;

      const reader = new FileReader();
      reader.onload = e => this.imagePreview = e.target?.result as string;
      reader.readAsDataURL(file);
    }
  }

  // Guardar receta
  guardarReceta(): void {
    if (this.recetaForm.valid) {
      const nuevaReceta = {
        ...this.recetaForm.value,
        imagen: this.imageFile ? this.imageFile.name : 'Sin imagen'
      };

      console.log('Receta guardada:', nuevaReceta);
      alert('✅ Receta guardada exitosamente');
      this.recetaForm.reset();
      this.imageFile = undefined;
      this.imagePreview = undefined;
    } else {
      alert('⚠️ Por favor, completa los campos obligatorios.');
    }
  }

  cancelar(): void {
    this.recetaForm.reset();
    this.imageFile = undefined;
    this.imagePreview = undefined;
  }
}
