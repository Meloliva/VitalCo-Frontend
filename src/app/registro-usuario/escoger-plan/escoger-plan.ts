import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {MatProgressBar} from '@angular/material/progress-bar';

@Component({
  selector: 'app-planes',
  templateUrl: './escoger-plan.html',
  imports: [
    MatProgressBar
  ],
  styleUrls: ['./escoger-plan.css']
})
export class EscogerPlanComponent implements OnInit {
  progressValue: number = 100;
  planSeleccionado: string | null = null;

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Inicialización
  }

  selectPlan(plan: string): void {
    this.planSeleccionado = plan;
    console.log('Plan seleccionado:', plan);
  }

  onSubmit(): void {
    if (this.planSeleccionado) {
      console.log('Registrando con escoger-plan:', this.planSeleccionado);

      // Guardar el escoger-plan y continuar
      // this.userService.setPlan(this.planSeleccionado);
       this.router.navigate(['/macronutrientes']);


    }
  }

  goBack(): void {
    this.router.navigate(['/nivelactividad']);
    // O usar: window.history.back();
  }
}
