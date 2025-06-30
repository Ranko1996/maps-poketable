import { Component } from '@angular/core';
import { MapComponent } from '../map/map.component'; 
import { LocationsComponent } from '../locations/locations.component';
import { ChartComponent } from "../chart/chart.component"; 

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MapComponent, LocationsComponent, ChartComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  selectedCoordinates: { E: number; N: number } | null = null;

  onLocationSelected(coords: { E: number; N: number }): void {
    this.selectedCoordinates = coords;
    console.log('Odabrane koordinate u DashboardComponent:', this.selectedCoordinates);
  }
}