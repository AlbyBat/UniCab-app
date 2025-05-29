<template>
  <div class="min-h-screen bg-gray-100 p-6">
    <div class="max-w-7xl mx-auto bg-white p-6 shadow rounded">
        <div class="w-1/3">
      <h1 class="text-2xl font-bold text-gray-800 mb-4">Modifica Viaggio</h1>

      <form @submit.prevent="submitForm">
        <div class="mb-4">
          <label class="block text-gray-700">Partenza</label>
          <input v-model="form.startAddress" type="text" class="w-full border px-3 py-2 rounded" required />
        </div>

        <div class="mb-4">
          <label class="block text-gray-700">Destinazione</label>
          <input v-model="form.endAddress" type="text" class="w-full border px-3 py-2 rounded" required />
        </div>

        <div class="mb-4">
          <label class="block text-gray-700">Data e ora</label>
          <input v-model="form.departureTime" type="datetime-local" class="w-full border px-3 py-2 rounded" required />
        </div>

        <div class="mb-4">
          <label class="block text-gray-700">Posti disponibili</label>
          <input v-model.number="form.availableSeats" type="number" min="1" class="w-full border px-3 py-2 rounded" required />
        </div>

        <div class="mb-4">
          <label class="block text-gray-700">Prezzo (€)</label>
          <input v-model.number="form.price" type="number" step="0.01" class="w-full border px-3 py-2 rounded" required />
        </div>

        <div class="mb-4">
          <label class="block text-gray-700">Note aggiuntive</label>
          <textarea v-model="form.additionalInfo" class="w-full border px-3 py-2 rounded" rows="3"></textarea>
        </div>

        <div class="flex space-x-2">
            <button
                type="submit"
                :disabled="isSubmitting"
                class="w-full bg-green-600 text-white py-3 rounded transition hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                {{ isSubmitting ? 'Salvataggio...' : 'Salva modifiche' }}
            </button>

            <button type="button" @click="$router.back()" class="bg-gray-300 text-black px-4 py-2 rounded">Annulla</button>
        </div>
      </form>
    </div>
     <div class="w-2/3">
        <div id="map" class="h-full rounded shadow" style="min-height: 600px;"></div>
     </div>
    </div>
  </div>
</template>

<script>
import { useMapTools } from '@/composables/useMapTools';
import L from 'leaflet';

export default {
  data() {
    return {
    form: {
      startAddress: '',
      endAddress: '',
      departureTime: '',
      availableSeats: 1,
      price: 0,
      additionalInfo: ''
    },
      map: null,
      routeLayer: null,
      startMarker: null,      
      endMarker: null,  
      debouncedUpdateMap: null,
      isSubmitting: false
    };
  },
  async mounted() {
    const { initializeMap, geocodeAddress, drawRoute } = useMapTools();
    this.initializeMap = initializeMap;
    this.geocodeAddress = geocodeAddress;
    this.drawRoute = drawRoute;

    this.map = this.initializeMap('map', [46.06, 11.12], 13); //inizializza su trento
    this.debouncedUpdateMap = this.debounce(this.updateMap, 1000);
    this.$watch('form.startAddress', this.debouncedUpdateMap);
    this.$watch('form.endAddress', this.debouncedUpdateMap);
    const rideId = this.$route.params.id;
    const token = localStorage.getItem('token');
     try {
    const res = await fetch(`/api/rides/${rideId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) throw new Error('Errore nel caricamento del viaggio');
    const ride = await res.json();

    
    this.form = {
      startAddress: ride.startPoint.address,
      endAddress: ride.endPoint.address,
      departureTime: new Date(ride.departureTime).toISOString().slice(0, 16),
      availableSeats: ride.availableSeats,
      price: ride.price,
      additionalInfo: ride.additionalInfo || ''
    }
    await this.updateMap();
    }catch (err) {
        console.error(err);
        alert('Errore nel caricamento del viaggio.');
    }
  },
  methods: {
    async updateMap() {
      if (!this.map) return;
      try {
        const startCoords = await this.geocodeAddress(this.form.startAddress);
        const endCoords = await this.geocodeAddress(this.form.endAddress);

        if (this.startMarker) this.map.removeLayer(this.startMarker);
        if (this.endMarker) this.map.removeLayer(this.endMarker);
        if (this.routeLayer) this.map.removeLayer(this.routeLayer);

        const startLatLng = [startCoords[1], startCoords[0]];
        const endLatLng = [endCoords[1], endCoords[0]];

        this.startMarker = L.marker(startLatLng).addTo(this.map).bindPopup('Partenza').openPopup();
        this.endMarker = L.marker(endLatLng).addTo(this.map).bindPopup('Destinazione');


        this.routeLayer = await this.drawRoute(this.map, startCoords, endCoords);
      } catch (err) {
        console.warn('Impossibile aggiornare la mappa:', err.message);
      }
    },
    async submitForm() {
      const rideId = this.$route.params.id;
      const token = localStorage.getItem('token');
      const { geocodeAddress } = useMapTools();
      this.isSubmitting = true;

      try {
        const startCoordinates = await geocodeAddress(this.form.startAddress);
        const endCoordinates = await geocodeAddress(this.form.endAddress);

        const res = await fetch(`/api/rides/${rideId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            ...this.form,
            startCoordinates,
            endCoordinates
          })
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Errore nella modifica');
        }

        alert('Viaggio aggiornato con successo!');
        this.$router.push('/home/rides');
      } catch (err) {
        console.error(err);
        alert('Errore durante il salvataggio.');
      } finally {
        this.isSubmitting = false;
      }
    },
    debounce(func, wait) {
      let timeout;
      return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
      };
    }
  }
};
</script>

<style>
</style>