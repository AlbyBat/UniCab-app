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

          <button
            type="submit"
            class="w-full bg-blue-600 text-white py-3 rounded transition hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="isSubmitting"
          >
            {{ isSubmitting ? 'Pubblicazione in corso...' : 'Pubblica Viaggio' }}
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
import { useMapTools } from '@/composables/useMapTools';
import L from 'leaflet';

export default {
  setup() {
    const { geocodeAddress, initializeMap, drawRoute } = useMapTools();
    return { geocodeAddress, initializeMap, drawRoute };
  },
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
      isSubmitting: false,
      map: null,
      startMarker: null,
      endMarker: null,
      routeLayer: null
    };
  },
  mounted() {
    this.debouncedUpdateMap = this.debounce(this.updateMap, 1000);
  },
  watch: {
    'form.startAddress'(val) {
      this.debouncedUpdateMap();
    },
    'form.endAddress'(val) {
      this.debouncedUpdateMap();
    }
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
          this.map = this.initializeMap('map', startLatLng);
        }

      
        if (this.startMarker) this.map.removeLayer(this.startMarker);
        if (this.endMarker) this.map.removeLayer(this.endMarker);
        if (this.routeLayer) this.map.removeLayer(this.routeLayer);

        
        this.startMarker = L.marker(startLatLng).addTo(this.map).bindPopup('Partenza').openPopup();
        this.endMarker = L.marker(endLatLng).addTo(this.map).bindPopup('Destinazione');

      
        this.routeLayer = await this.drawRoute(this.map, startCoords, endCoords);
      } catch (err) {
        console.warn('Errore aggiornamento mappa:', err.message);
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
      this.isSubmitting = true;
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
      } finally {
        this.isSubmitting = false;
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