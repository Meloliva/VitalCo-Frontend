import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatProgressBar } from '@angular/material/progress-bar';
import { CommonModule } from '@angular/common';
import { PacienteService, RolDTO, UsuarioDTO } from '../service/paciente.service';
import { RegistroSharedService } from '../service/registro-shared.service';

@Component({
  selector: 'app-registro',
  templateUrl: './registro-usuario.html',
  standalone: true,
  imports: [ReactiveFormsModule, MatProgressBar, CommonModule],
  styleUrls: ['./registro-usuario.css']
})
export class RegistroUsuarioComponent implements OnInit {
  registroForm!: FormGroup;
  roles: RolDTO[] = [];
  isLoading = false;
  showPassword = false;
  progressValue = 0;
  mensaje: { tipo: 'success' | 'error', texto: string } | null = null;

  constructor(
    private fb: FormBuilder,
    private pacienteService: PacienteService,
    private registroShared: RegistroSharedService,
    private router: Router
  ) {}

  ngOnInit(): void {

    this.initForm();
    this.cargarRoles();
    this.registroShared.progress$.subscribe(progress => this.progressValue = progress);
  }

  initForm(): void {
    this.registroForm = this.fb.group({
      dni: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      genero: ['', Validators.required]
    });
  }

  cargarRoles(): void {
    this.pacienteService.listarRoles().subscribe({
      next: (roles) => this.roles = roles,
      error: () => this.showError('Error al cargar roles')
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.registroForm.invalid) {
      this.showError('Por favor completa todos los campos correctamente');
      return;
    }

    this.isLoading = true;
    const formValue = this.registroForm.value;
    const rolPaciente = this.roles.find(r => r.tipo === 'PACIENTE') || this.roles[1];

    const usuario: UsuarioDTO = {
      dni: formValue.dni,
      contraseña: formValue.password,
      nombre: formValue.nombre,
      apellido: formValue.apellido,
      correo: formValue.correo,
      genero: formValue.genero,
      rol: rolPaciente,
      estado: 'ACTIVO'
    };

    this.registroShared.guardarUsuarioCompleto(usuario);
    this.isLoading = false;
    this.showSuccess('Datos guardados', 'Ahora ingresa tus datos de salud');
    setTimeout(() => this.router.navigate(['/datos-salud']), 1500);
  }

  private showSuccess(summary: string, detail: string): void {
    this.mensaje = { tipo: 'success', texto: `${summary}: ${detail}` };
    setTimeout(() => this.mensaje = null, 5000);
  }

  private showError(detail: string): void {
    this.mensaje = { tipo: 'error', texto: `Error: ${detail}` };
    setTimeout(() => this.mensaje = null, 5000);
  }
}
