import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common'; 

@Component({
  selector: 'app-locations',
  standalone: true,
  imports: [CommonModule], 
  templateUrl: './locations.component.html',
  styleUrls: ['./locations.component.css']
})
export class LocationsComponent {
  @Output() locationSelected = new EventEmitter<{ E: number; N: number }>();

  locations = [
    { name: 'Trg Bana Josipa Jelačića', E: 15.9780, N: 45.8131 },
    { name: 'Zagrebačka katedrala', E: 15.9784, N: 45.8143 },
    { name: 'Crkva sv. Marka', E: 15.9734, N: 45.8163 },
    { name: 'Britanski trg', E: 15.9656, N: 45.8118 },
    { name: 'Botanički vrt', E: 15.9723, N: 45.8058 },
    { name: 'Hrvatsko narodno kazalište', E: 15.9737, N: 45.8093 },
    { name: 'Muzej Mimara', E: 15.9678, N: 45.8080 },
    { name: 'Jarun jezero', E: 15.9298, N: 45.7876 },
    { name: 'Bundek jezero', E: 15.9780, N: 45.7766 },
    { name: 'Maksimirski perivoj', E: 16.0076, N: 45.8202 }
  ];

  selectLocation(location: { name: string; E: number; N: number }): void {
    this.locationSelected.emit({ E: location.E, N: location.N });
  }
}