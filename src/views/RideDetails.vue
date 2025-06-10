<template>
  <div class="min-h-screen bg-gray-100 p-6">
    <div class="bg-white shadow-md rounded-lg p-8 flex gap-6 w-full max-w-full mx-auto">

      <!--1/3 -->
      <div class="w-1/3">
        <h2 class="text-3xl font-bold text-[#004d99] mb-4">Dettagli Viaggio</h2>

        <div v-if="ride">
          <p><strong>Partenza:</strong> {{ ride.startPoint.address }}</p>
          <p><strong>Destinazione:</strong> {{ ride.endPoint.address }}</p>
          <p><strong>Orario:</strong> {{ formatDate(ride.departureTime) }}</p>
          <p><strong>Prezzo:</strong> €{{ ride.price.toFixed(2) }}</p>
          <p><strong>Posti disponibili:</strong> {{ ride.availableSeats }}</p>
          <p v-if="ride.additionalInfo"><strong>Note:</strong> {{ ride.additionalInfo }}</p>

          <div v-if="isLoggedIn" class="mt-6">
            <button @click="bookRide" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
              Prenota ora
            </button>
          </div>

          <div v-else class="mt-6 text-red-500 font-semibold">
            Effettua il login per prenotare questo viaggio.
          </div>
        </div>

        <div v-else>
          <p>Caricamento dettagli viaggio...</p>
        </div>
      </div>

      <!--2/3 -->
      <div class="w-2/3">
        <div id="map" class="h-[700px] rounded shadow"></div>
      </div>

    </div>
  </div>
</template>


<script>
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'leaflet-routing-machine'; 


export default {
  data() {
    return {
      ride: null,
      isLoggedIn: !!localStorage.getItem('token'),
      seatsToBook: 1
    };
  },
  async created() {
    const rideId = this.$route.params.id;
    const token = localStorage.getItem('token');
    this.isLoggedIn = !!token;
    try {
      const res = await fetch(`https://unicab-api.onrender.com/api/rides/${rideId}`);
      if (res.ok) {
        this.ride = await res.json();
      } else {
        console.error('Errore caricamento:', await res.text());
      }
    } catch (err) {
      console.error('Errore di rete:', err);
    }
  },
  mounted() {
    this.loadRide();
  },
  methods: {
    async loadRide() {
      const rideId = this.$route.params.id;
      const token = localStorage.getItem('token');
      this.isLoggedIn = !!token;

      try {
        const res = await fetch(`https://unicab-api.onrender.com/api/rides/${rideId}`);
        if (res.ok) {
          this.ride = await res.json();
          this.initMap();
        } else {
          console.error('Errore caricamento:', await res.text());
        }
      } catch (err) {
        console.error('Errore di rete:', err);
      }
    },
    async bookRide() {
        const token = localStorage.getItem('token');
        const rideId = this.$route.params.id;

        try {
        const res = await fetch(`https://unicab-api.onrender.com/api/bookings/${rideId}/book`, {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
            seats: this.seatsToBook,
            participants: []
            })
        });

        const data = await res.json();

        if (!res.ok) {
            alert(data.error || 'Errore nella prenotazione');
            return;
        }

        alert('Prenotazione temporanea effettuata! è necessario confermarla per renderla effettiva.');
        localStorage.setItem('lastRide', JSON.stringify(this.ride));
        this.$router.push(`/booking/${data.bookingId}`);
        } catch (err) {
        console.error('Errore nella richiesta:', err);
        alert('Errore durante la prenotazione.');
        }
    },
    initMap() {
      if (!this.ride || !this.ride.startPoint || !this.ride.endPoint) return;

      const start = this.ride.startPoint.coordinates; //lng, lat
      const end = this.ride.endPoint.coordinates;

      const map = L.map('map').setView([start[1], start[0]], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      L.Routing.control({
        waypoints: [
          L.latLng(start[1], start[0]),
          L.latLng(end[1], end[0])
        ],
        routeWhileDragging: false,
        show: false,
        addWaypoints: false,
        draggableWaypoints: false,
        createMarker: (i, wp) => {
          return L.marker(wp.latLng, {
            icon: L.icon({
              iconUrl: i === 0
                ? 'https://cdn-icons-png.flaticon.com/512/684/684908.png' //partenza
                : 'https://cdn-icons-png.flaticon.com/512/854/854878.png', //arrivo
              iconSize: [30, 30],
              iconAnchor: [15, 30],
              popupAnchor: [0, -30]
            })
          }).bindPopup(i === 0 ? 'Partenza' : 'Destinazione');
        }
      }).addTo(map);
    },
  formatDate(datetime) {
      const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      return new Date(datetime).toLocaleDateString('it-IT', options);
    }
  }
};
</script>

<style scoped>
.ride-details {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 2rem;
}
</style>
