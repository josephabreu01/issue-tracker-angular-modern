// src/app/components/issue-chart/issue-chart.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IssueService } from '../../services/issue.service';
import { Issue } from '../../models/Issue';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';

// --- NUEVAS IMPORTACIONES PARA CANVASJS ---
import * as CanvasJS from 'canvasjs'; // Importa la librería base de CanvasJS
import {CanvasJSAngularChartsModule } from '@canvasjs/angular-charts'; // Importa el módulo de Angular para CanvasJS

@Component({
  selector: 'app-issue-chart',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatToolbarModule,
    MatIconModule,
    CanvasJSAngularChartsModule // <-- AÑADE ESTO AQUÍ
  ],
  templateUrl: './issue-chart.component.html',
  styleUrl: './issue-chart.component.scss'
})
export class IssueChartComponent implements OnInit {
  isLoading: boolean = true;
  issues: Issue[] = [];

  // --- OPCIONES DE GRÁFICO PARA CANVASJS ---
  chartOptions: CanvasJS.ChartOptions = {
    title: {},
    data: [],
  }; // Objeto que contendrá la configuración de tu gráfico

  constructor(private issueService: IssueService) {}

  ngOnInit(): void {
    this.loadAllIssues();
  }

  loadAllIssues(): void {
    this.isLoading = true;
    this.issueService.getIssues().subscribe({
      next: (data) => {
        this.issues = data;
        this.updateChartData(); // Esto preparará los datos para CanvasJS
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading issues for chart:', err);
        this.isLoading = false;
      }
    });
  }

  updateChartData(): void {
    const counts: { [key: string]: number } = {};
    // Inicializa los conteos para todos los estados posibles
    ['Open', 'In Progress', 'Resolved', 'Closed'].forEach(status => {
      counts[status] = 0;
    });

    this.issues.forEach(issue => {
      if (counts.hasOwnProperty(issue.status)) {
        counts['' + issue.status]++;
      } else {
        counts['' + issue.status] = 1; // En caso de un estado inesperado
      }
    });

    const dataPoints = Object.keys(counts).map(status => {
      return {
        y: counts[status],
        name: status,
        // Optional: color for each slice
        color: this.getStatusColor(status),
        // text for tooltip (optional)
        toolTipContent: "<b>{name}</b>: {y} (#percent%)",
        // for labels on slices
        indexLabel: "{name} ({y})"
      };
    });

    this.chartOptions = {
      animationEnabled: true,
      exportEnabled: true,
      title: {
        text: "Distribución de Mantenimientos por Estado"
      },
      data: [{
        type: "pie",
        showInLegend: true,
        toolTipContent: "{name}: <strong>{y} (#percent%)</strong>",
        indexLabel: "{name} - #percent%", // Etiqueta directamente en la rebanada del pastel
        dataPoints: dataPoints
      }]
    };

    console.log('CanvasJS chartOptions:', this.chartOptions); // Verifica las opciones finales
  }

  // Función auxiliar para obtener colores consistentes por estado
  getStatusColor(status: string): string {
    switch (status) {
      case 'Open': return '#FF6384'; // Rojo claro
      case 'In Progress': return '#36A2EB'; // Azul claro
      case 'Resolved': return '#4BC0C0'; // Verde azulado
      case 'Closed': return '#9966FF'; // Púrpura
      default: return '#FFCD56'; // Amarillo (por defecto)
    }
  }

  get hasNoChartData(): boolean {
    const hasNoIssues = this.issues.length === 0;
    const hasZeroData = this.chartOptions.data &&
      this.chartOptions.data[0] &&
      this.chartOptions.data[0].dataPoints?.every((dp => dp.y === 0));

    // Si dataPoints es indefinido o vacío, también significa que no hay datos para el gráfico
    const hasNoDataPoints = !this.chartOptions.data ||
      !this.chartOptions.data[0] ||
      !this.chartOptions.data[0].dataPoints ||
      this.chartOptions.data[0].dataPoints.length === 0;

    return this.isLoading || hasNoIssues || hasNoDataPoints || hasZeroData;
  }
}
