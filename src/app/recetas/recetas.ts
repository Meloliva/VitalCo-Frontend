import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router'; // Importaciones no necesarias aquí

@Component({
  selector: 'app-recetas',
  standalone: true,
  // Los imports de RouterLink y RouterLinkActive no son necesarios aquí
  // ya que la navegación está en el layout principal.
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
      // REEMPLAZADO: alert() no está permitido y bloquea la UI.
      console.log('✅ Receta guardada exitosamente');
      this.recetaForm.reset();
      this.imageFile = undefined;
      this.imagePreview = undefined;
    } else {
      // REEMPLAZADO: alert() no está permitido.
      console.warn('⚠️ Por favor, completa los campos obligatorios.');
    }
  }

  cancelar(): void {
    this.recetaForm.reset();
    this.imageFile = undefined;
    this.imagePreview = undefined;
  }
}
