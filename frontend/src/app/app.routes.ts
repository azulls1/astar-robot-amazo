import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard',
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/dashboard.component').then(
        (m) => m.DashboardComponent,
      ),
    title: 'Dashboard — A* Robot Amazon',
  },
  {
    path: 'solver',
    loadComponent: () =>
      import('./pages/solver/solver.component').then((m) => m.SolverComponent),
    title: 'Solver A* — Robot Amazon',
  },
  {
    path: 'heuristica',
    loadComponent: () =>
      import('./pages/heuristica/heuristica.component').then(
        (m) => m.HeuristicaComponent,
      ),
    title: 'Heurística — A* Robot Amazon',
  },
  {
    path: 'iteraciones',
    loadComponent: () =>
      import('./pages/iteraciones/iteraciones.component').then(
        (m) => m.IteracionesComponent,
      ),
    title: 'Iteraciones — A* Robot Amazon',
  },
  {
    path: 'entregables',
    loadComponent: () =>
      import('./pages/entregables/entregables.component').then(
        (m) => m.EntregablesComponent,
      ),
    title: 'Entregables — A* Robot Amazon',
  },
  {
    path: 'como-funciona',
    loadComponent: () =>
      import('./pages/info/info.component').then((m) => m.InfoComponent),
    title: 'Cómo funciona — A* Robot Amazon',
  },
  { path: '**', redirectTo: 'dashboard' },
];
