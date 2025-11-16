// typescript
// File: `src/app/recuperar-password/verificar-codigo/verificar-codigo.ts`
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { RecuperarPasswordService } from '../../service/recuperar-password.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-verificar-codigo',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    RouterModule,
    MatIconModule
  ],
  templateUrl: './verificar-codigo.html',
  styleUrls: ['./verificar-codigo.css']
})
export class VerificarCodigoComponent {
  email = '';
  error = '';
  codeForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private service: RecuperarPasswordService
  ) {
    this.codeForm = this.fb.group({
      digit1: ['', [Validators.required, Validators.pattern(/^\d$/)]],
      digit2: ['', [Validators.required, Validators.pattern(/^\d$/)]],
      digit3: ['', [Validators.required, Validators.pattern(/^\d$/)]],
      digit4: ['', [Validators.required, Validators.pattern(/^\d$/)]],
      digit5: ['', [Validators.required, Validators.pattern(/^\d$/)]],
      digit6: ['', [Validators.required, Validators.pattern(/^\d$/)]]
    });

    const qpEmail = this.route.snapshot.queryParamMap.get('email');
    this.email = qpEmail || sessionStorage.getItem('recuperarCorreo') || '';
  }

  private focusInput(index: number): void {
    const el = document.getElementById(`digit${index}`) as HTMLInputElement | null;
    if (el) el.focus();
  }

  onDigitInput(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    let val = input.value || '';
    val = val.replace(/\D/g, '').slice(-1);
    this.codeForm.get(`digit${index}`)?.setValue(val);
    if (val && index < 6) this.focusInput(index + 1);
  }

  onKeyDown(event: KeyboardEvent, index: number): void {
    const target = event.target as HTMLInputElement;
    if (event.key === 'Backspace') {
      if (!target.value && index > 1) {
        this.codeForm.get(`digit${index - 1}`)?.setValue('');
        this.focusInput(index - 1);
        event.preventDefault();
      }
    } else if (/^[0-9]$/.test(event.key)) {
      // permitir dígitos
    } else if (event.key === 'ArrowLeft' && index > 1) {
      this.focusInput(index - 1);
      event.preventDefault();
    } else if (event.key === 'ArrowRight' && index < 6) {
      this.focusInput(index + 1);
      event.preventDefault();
    } else {
      if (event.key.length === 1) event.preventDefault();
    }
  }

  onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const paste = event.clipboardData?.getData('text') || '';
    const digits = paste.replace(/\D/g, '').slice(0, 6).split('');
    digits.forEach((d, i) => {
      this.codeForm.get(`digit${i + 1}`)?.setValue(d);
      const el = document.getElementById(`digit${i + 1}`) as HTMLInputElement | null;
      if (el) el.value = d;
    });
    if (digits.length === 6) {
      this.codeForm.markAllAsTouched();
      setTimeout(() => this.onSubmit(), 0);
    } else if (digits.length > 0) {
      const nextIndex = digits.length + 1;
      if (nextIndex <= 6) this.focusInput(nextIndex);
    }
  }

  onSubmit(): void {
    this.error = '';
    if (this.codeForm.invalid) {
      this.codeForm.markAllAsTouched();
      this.error = 'Complete los 6 dígitos del código';
      return;
    }
    const code = [
      this.codeForm.value.digit1,
      this.codeForm.value.digit2,
      this.codeForm.value.digit3,
      this.codeForm.value.digit4,
      this.codeForm.value.digit5,
      this.codeForm.value.digit6
    ].join('');

    const dto = { codigo: code };
    this.service.verificarCodigo(dto).subscribe({
      next: () => {
        if (this.email) sessionStorage.setItem('recuperarCorreo', this.email);
        this.router.navigate(['/recuperar-password/nueva-password']);
      },
      error: err => {
        this.error = err?.error?.mensaje || err?.error || 'Código inválido o expirado';
      }
    });
  }
}
