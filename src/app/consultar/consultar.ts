import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgChartsModule } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';

interface Macronutriente {
  tipo: string;
  valor: number;
  color: string;
}

interface Consulta {
  fecha: string;
  dni: string;
  resultados: Macronutriente[];
}

@Component({
  selector: 'app-consultar',
  standalone: true,
  imports: [CommonModule, FormsModule, NgChartsModule],
  templateUrl: './consultar.html',
  styleUrls: ['./consultar.css']
})
export class Consultar {
  fechaConsulta: string = '';
  dniPaciente: string = '';

  chartData: ChartData<'bar'> = {
    labels: ['Proteína', 'Carbohidrato', 'Grasa'],
    datasets: [
      {
        label: 'Macronutrientes',
        data: [0, 0, 0],
        backgroundColor: ['#FFA500', '#1E90FF', '#32CD32']
      }
    ]
  };

  chartOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true }
    },
    scales: {
      y: { beginAtZero: true }
    }
  };

  private consultas: Consulta[] = [
    {
      fecha: '2025-11-03',
      dni: '12345678',
      resultados: [
        { tipo: 'Proteína', valor: 50, color: '#FFA500' },
        { tipo: 'Carbohidrato', valor: 120, color: '#1E90FF' },
        { tipo: 'Grasa', valor: 30, color: '#32CD32' }
      ]
    },
    {
      fecha: '2025-11-03',
      dni: '87654321',
      resultados: [
        { tipo: 'Proteína', valor: 70, color: '#FFA500' },
        { tipo: 'Carbohidrato', valor: 100, color: '#1E90FF' },
        { tipo: 'Grasa', valor: 40, color: '#32CD32' }
      ]
    },
    {
      fecha: '2025-11-04',
      dni: '12345678',
      resultados: [
        { tipo: 'Proteína', valor: 60, color: '#FFA500' },
        { tipo: 'Carbohidrato', valor: 90, color: '#1E90FF' },
        { tipo: 'Grasa', valor: 35, color: '#32CD32' }
      ]
    }
  ];

  buscar() {
    const consulta = this.consultas.find(
      c => c.dni === this.dniPaciente && c.fecha === this.fechaConsulta
    );

    if (consulta) {
      this.chartData.datasets[0].data = consulta.resultados.map(r => r.valor);
    } else {
      this.chartData.datasets[0].data = [0, 0, 0];
      alert('No hay datos para esta fecha o DNI');
    }
  }
}
