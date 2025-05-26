<template>
  <div class="min-h-screen bg-gray-100 p-6">
    <div class="bg-white shadow-md rounded-lg p-8 flex gap-6 w-full max-w-full mx-auto">

      <div class="w-1/3">
        <h1 class="text-2xl font-bold mb-6 text-blue-700">Crea un nuovo viaggio</h1>

        <form @submit.prevent="submitRide" class="space-y-4">
          <div>
            <label class="block font-semibold">Indirizzo di partenza</label>
            <input v-model="form.startAddress" type="text" class="w-full border p-2 rounded" required />
          </div>

          <div>
            <label class="block font-semibold">Indirizzo di destinazione</label>
            <input v-model="form.endAddress" type="text" class="w-full border p-2 rounded" required />
          </div>

          <div>
            <label class="block font-semibold">Data e ora di partenza</label>
            <input v-model="form.departureTime" type="datetime-local" class="w-full border p-2 rounded" required />
          </div>

          <div>
            <label class="block font-semibold">Posti disponibili</label>
            <input v-model.number="form.availableSeats" type="number" min="1" class="w-full border p-2 rounded" required />
          </div>

          <div>
            <label class="block font-semibold">Prezzo (€)</label>
            <input v-model.number="form.price" type="number" step="0.01" class="w-full border p-2 rounded" required />
          </div>

          <div>
            <label class="block font-semibold">Note aggiuntive (opzionali)</label>
            <textarea v-model="form.additionalInfo" class="w-full border p-2 rounded"></textarea>
          </div>

          <button type="submit" class="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 transition">
            Pubblica Viaggio
          </button>
        </form>
      </div>

      <div class="w-2/3">
        <div id="map" class="h-full rounded shadow" style="min-height: 600px;"></div>
      </div>

    </div>
  </div>
</template>


<script>
import L from 'leaflet';

export default {
  watch: {    //come il listener di java
  'form.startAddress'(val) {     this.debouncedUpdateMap();  },
  'form.endAddress'(val) {    this.debouncedUpdateMap();  }
  },
  mounted() {
    this.debouncedUpdateMap = this.debounce(this.updateMap, 1000);
  },
  data() {
    return {
      form: {
        startAddress: '',
        endAddress: '',
        departureTime: '',
        availableSeats: 1,
        price: 0,
        additionalInfo: '',
        map: null,
        startMarker: null,
        endMarker: null,
        routeLayer: null
      }
    };
  },
  methods: {
    async updateMap() {
      if (!this.form.startAddress || !this.form.endAddress) return;

      try {
        const startCoords = await this.geocodeAddress(this.form.startAddress);
        const endCoords = await this.geocodeAddress(this.form.endAddress);

        const startLatLng = [startCoords[1], startCoords[0]];
        const endLatLng = [endCoords[1], endCoords[0]];

        if (!this.map) {
          this.map = L.map('map').setView(startLatLng, 13);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
          }).addTo(this.map);
        }

        if (this.startMarker) this.map.removeLayer(this.startMarker);
        if (this.endMarker) this.map.removeLayer(this.endMarker);
        if (this.routeLayer) this.map.removeLayer(this.routeLayer);

        this.startMarker = L.marker(startLatLng).addTo(this.map).bindPopup('Partenza').openPopup();
        this.endMarker = L.marker(endLatLng).addTo(this.map).bindPopup('Destinazione');

        const url = `https://router.project-osrm.org/route/v1/driving/${startCoords[0]},${startCoords[1]};${endCoords[0]},${endCoords[1]}?overview=full&geometries=geojson`;

        const res = await fetch(url);
        const data = await res.json();

        if (data.routes && data.routes.length) {
          const route = data.routes[0].geometry;
          this.routeLayer = L.geoJSON(route, {
            style: { color: 'blue', weight: 4 }
          }).addTo(this.map);
          const coords = route.coordinates.map(c => [c[1], c[0]]);
          this.map.fitBounds(coords);
        }
      } catch (err) {
        console.warn('Errore aggiornamento mappa:', err.message);
      }
  },
    async geocodeAddress(address) {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'carpooling-app/1.0' //per nominatim
        }
      });
      const data = await response.json();
      if (!data || data.length === 0) throw new Error(`Impossibile trovare coordinate per: ${address}`);
      return [parseFloat(data[0].lon), parseFloat(data[0].lat)];
  },
      async loadMap() {
      if (!this.ride?.startPoint?.coordinates || !this.ride?.endPoint?.coordinates) {
        console.warn('Coordinate non disponibili');
        return;
      }

      const start = [this.ride.startPoint.coordinates[1], this.ride.startPoint.coordinates[0]];
      const end = [this.ride.endPoint.coordinates[1], this.ride.endPoint.coordinates[0]];

      //unizializza la mappa
      const map = L.map('map').setView(start, 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      //aggiunge marker
      L.marker(start).addTo(map).bindPopup('Partenza').openPopup();
      L.marker(end).addTo(map).bindPopup('Destinazione');

      //carica percorso
      const url = `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`;

      try {
        const res = await fetch(url);
        const data = await res.json();

        if (data.routes && data.routes.length) {
          const route = data.routes[0].geometry;
          L.geoJSON(route, {
            style: { color: 'blue', weight: 4 }
          }).addTo(map);

          const coords = route.coordinates.map(c => [c[1], c[0]]);
          map.fitBounds(coords);
        } else {
          console.warn('Nessun percorso trovato');
        }
      } catch (err) {
        console.error('Errore nel caricamento della rotta:', err);
      }
  },
  debounce(func, wait) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  },
  async submitRide() {
    const token = localStorage.getItem('token');

    try {
      const startCoordinates = await this.geocodeAddress(this.form.startAddress);
      const endCoordinates = await this.geocodeAddress(this.form.endAddress);

      const payload = {
        ...this.form,
        startCoordinates,
        endCoordinates
      };

      const res = await fetch('/api/rides', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Errore nella creazione del viaggio');
      }

      alert('Viaggio creato con successo!');
      this.$router.push('/');
    } catch (err) {
      console.error(err);
      alert(`Errore: ${err.message}`);
    }
  }
}
};
</script>

<style scoped>
#map {
  width: 100%;
  height: 400px;
  min-height: 100vh;
}

</style>