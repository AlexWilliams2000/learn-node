import axios from 'axios';
import { $ } from './bling';

const mapOptions = {
  center: { lat: 43.9, lng: 79.8 },
  zoom: 10
};

function loadPlaces(map, lat = 43.2, lng = -79.8) {
  axios.get(`/api/v1/stores/near?lat=${lat}&lng=${lng}`)
    .then((res) => {
      const places = res.data;
      if (!places.length) {
        alert('No places found.');
        return;
      }

      // Create a bounds
      const bounds = new google.maps.LatLngBounds();
      const infoWindow = new google.maps.InfoWindow();

      const markers = places.map((place) => {
        const [placeLng, placeLat] = place.location.coordinates;
        const position = { lat: placeLat, lng: placeLng };
        bounds.extend(position);
        const marker = new google.maps.Marker({ map, position });
        marker.place = place;
        return marker;
      });

      // When someone clicks a marker, show details
      markers.forEach(marker => marker.addListener('click', function() {
        const html = `
          <div class="popup">
            <a href="/store/${this.place.slug}">
              <img src="/uploads/${this.place.photo || 'store.png'}" alt="${this.place.name}">
              <p>${this.place.name} - ${this.place.location.address}</p>
            </a>
          </div>
        `;
        infoWindow.setContent(html);
        infoWindow.open(map, this);
      }));

      // Zoom the map to make all th epins fit
      map.setCenter(bounds.getCenter());
      map.fitBounds(bounds);
    })
    .catch((err) => {
      console.error(err);
    });
}

function makeMap(mapDiv) {
  if (!mapDiv) {
    return;
  }
  // Make our map
  const map = new google.maps.Map(mapDiv, mapOptions);
  console.log('here');
  loadPlaces(map);

  const input = $('[name=geolocate]');
  const autocomplete = new google.maps.places.Autocomplete(input);
  autocomplete.addListener('place-changed', () => {
    console.log('here');
    const place = autocomplete.getPlace();
    loadPlaces(map, place.geometry.location.lat(), place.geometry.location.lng());
  });
}

export default makeMap;
