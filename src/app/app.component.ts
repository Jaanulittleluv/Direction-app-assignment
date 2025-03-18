import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatListModule } from '@angular/material/list';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { GoogleMapsModule } from '@angular/google-maps';
import { CommonModule } from '@angular/common';

declare var google: any;

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [
    FormsModule, 
    GoogleMapsModule, 
    CommonModule, 
    MatTableModule,
    MatFormFieldModule, 
    MatInputModule, 
    MatListModule,
    MatIconModule,
    MatButtonModule, 
    MatCardModule
  ]
})

export class AppComponent implements OnInit {
  map!: google.maps.Map;
  directionsRenderer!: google.maps.DirectionsRenderer;
  directionsService!: google.maps.DirectionsService;
  origin = '';
  destinations: string[] = [];
  travelDetails: { from: string; to: string; distance: string; duration: string }[] = [];
  displayedColumns: string[] = ['from', 'to', 'distance', 'duration'];
  dataSource = this.travelDetails;

  @ViewChild('originInput', { static: false }) originInput!: ElementRef;
  @ViewChild('destinationInput', { static: false }) destinationInput!: ElementRef;

  ngOnInit() {
    this.loadGoogleMaps();
  }

  loadGoogleMaps() {
    if (!window.google) {
      console.error('Google Maps API not loaded');
      return;
    }

    const mapOptions = {
      center: { lat: 6.9271, lng: 79.8612 },
      zoom: 12,
    };

    this.map = new google.maps.Map(document.getElementById('map') as HTMLElement, mapOptions);
    this.directionsRenderer = new google.maps.DirectionsRenderer();
    this.directionsRenderer.setMap(this.map);
    this.directionsService = new google.maps.DirectionsService();

    // Initialize Google Places Autocomplete
    this.initAutocomplete();
  }

  initAutocomplete() {
    if (this.originInput) {
      const originAutocomplete = new google.maps.places.Autocomplete(this.originInput.nativeElement);
      originAutocomplete.addListener('place_changed', () => {
        const place = originAutocomplete.getPlace();
        if (place.geometry) {
          this.origin = place.formatted_address;
        }
      });
    }

    if (this.destinationInput) {
      const destinationAutocomplete = new google.maps.places.Autocomplete(this.destinationInput.nativeElement);
      destinationAutocomplete.addListener('place_changed', () => {
        const place = destinationAutocomplete.getPlace();
        if (place.geometry) {
          this.addDestination(place.formatted_address);
        }
      });
    }
  }

  addDestination(location: string) {
    if (!location.trim()) return;

    if (this.destinations.length >= 7) {
      alert('You can only add up to 7 destinations.');
      return;
    }

    this.destinations.push(location);
    this.destinationInput.nativeElement.value = ''; // ✅ Clears the input field after adding
  }

  removeDestination(index: number) {
    if (confirm('Are you sure you want to delete this destination?')) {
      this.destinations.splice(index, 1);
    }
  }

  calculateRoute() {
    if (!this.origin || this.destinations.length === 0) {
      alert('Please enter an origin and at least one destination.');
      return;
    }

    const waypoints = this.destinations.slice(0, -1).map(dest => ({
      location: dest,
      stopover: true,
    }));

    this.directionsService.route(
      {
        origin: this.origin,
        destination: this.destinations[this.destinations.length - 1],
        travelMode: google.maps.TravelMode.DRIVING,
        waypoints: waypoints,
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          this.directionsRenderer.setDirections(result);
          this.updateTravelDetails(result.routes[0].legs);
        } else {
          console.error('Error fetching directions:', status);
          this.directionsRenderer.setDirections(null);
        }
      }
    );
  }

  updateTravelDetails(legs: google.maps.DirectionsLeg[]) {
    this.travelDetails = legs.map((leg, index) => ({
      from: index === 0 ? this.origin : this.destinations[index - 1],
      to: this.destinations[index],
      distance: leg.distance?.text || 'N/A',
      duration: leg.duration?.text || 'N/A',
    }));
  }
}
