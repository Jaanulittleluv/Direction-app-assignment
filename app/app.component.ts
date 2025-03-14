import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';

declare var google: any; // Ensure TypeScript recognizes the Google Maps API

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatToolbarModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'Direction App';
  origin = '';
  destinations = Array(7).fill('');
  map!: google.maps.Map; // Declare map variable
  directionsService!: google.maps.DirectionsService;
  directionsRenderer!: google.maps.DirectionsRenderer;


  ngOnInit() {
    this.loadMap(); // Load map when component initializes
  }

  loadMap() {
    const mapElement = document.getElementById('map') as HTMLElement;
    if (!mapElement) {
      console.error('Map element not found!');
      return;
    }

    this.map = new google.maps.Map(mapElement, {
      zoom: 6,
      center: { lat: 7.8731, lng: 80.7718 }, // Default Sri Lanka center
    });

    this.directionsService = new google.maps.DirectionsService();
    this.directionsRenderer = new google.maps.DirectionsRenderer();
    this.directionsRenderer.setMap(this.map);
  }

  getDirections() {
    if (!this.origin || !this.destinations.some(dest => dest)) {
      alert('Please enter at least an origin and one destination.');
      return;
    }

    const waypoints = this.destinations
      .filter(dest => dest)
      .map(dest => ({ location: dest, stopover: true }));

    const request = {
      origin: this.origin,
      destination: this.destinations[this.destinations.length - 1] || this.origin,
      waypoints,
      travelMode: google.maps.TravelMode.DRIVING,
    };

    this.directionsService.route(request, (result, status) => {
      if (status === google.maps.DirectionsStatus.OK) {
        this.directionsRenderer.setDirections(result);
      } else {
        alert('Error getting directions: ' + status);
      }
    });
  }
}
