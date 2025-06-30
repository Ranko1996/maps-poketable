import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MapComponent } from "./components/map/map.component";
import { LocationsComponent } from "./components/locations/locations.component";
import { DashboardComponent } from "./components/dashboard/dashboard.component";
import { PokemonTableComponent } from './components/pokemon-table/pokemon-table.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, DashboardComponent, PokemonTableComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'maps';
}
