import { Routes } from '@angular/router';
import { PokemonTableComponent } from './components/pokemon-table/pokemon-table.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';

export const routes: Routes = [
  { path: 'dashboard', component: DashboardComponent }, 
  { path: 'pokemon', component: PokemonTableComponent },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' }, 
  { path: '**', redirectTo: '/dashboard' } 
];
