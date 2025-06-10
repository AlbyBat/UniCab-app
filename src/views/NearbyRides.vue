<template>
  <div>
    <h2 class="rides-title">Viaggi disponibili</h2>
    <div v-if="rides.length === 0" class="no-rides">Nessun viaggio disponibile</div>
    <div v-else class="rides-container">
      <div v-for="ride in rides" :key="ride._id" @click="goToRide(ride._id)" class="ride-card">
        <div class="ride-route">
          <strong>{{ ride.startPoint.address }} → {{ ride.endPoint.address }}</strong>
        </div>
        <div class="ride-details">
          <p><span class="detail-label">Partenza:</span> {{ new Date(ride.departureTime).toLocaleString() }}</p>
          <p><span class="detail-label">Posti:</span> {{ ride.availableSeats }}</p>
          <p><span class="detail-label">Prezzo:</span> €{{ ride.price.toFixed(2) }}</p>
          <p v-if="ride.additionalInfo" class="ride-notes">
            <span class="detail-label">Note:</span> {{ ride.additionalInfo }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'; 
import L from 'leaflet';

export default {
  name: 'NearbyRides',
  data() {
    return {
      rides: [],   
      map: null     
    };
  },
  mounted() {
    this.map = L.map('map').setView([46.06, 11.12], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          this.map.setView([lat, lon], 13);
          this.fetchNearbyRides(lat, lon);  
        },
        (err) => {
          console.warn('Geolocalizzazione non consentita:', err);
          this.fetchAllRides();  
        }
      );
    } else {
      console.warn('Geolocalizzazione non disponibile');
      this.fetchAllRides();
    }
  },
  methods: {
    async fetchNearbyRides(lat, lon) {
      try {
        const response = await axios.get('/api/rides/nearby', {
          params: { lat, lon }
        });
        this.rides = response.data.rides || response.data;
        this.addMarkers();  
      } catch (err) {
        console.error(err);
      }
    },
    async fetchAllRides() {
      try {
        const response = await axios.get('/api/rides');
        this.rides = response.data;
        this.addMarkers();
      } catch (err) {
        console.error(err);
      }
    },
    addMarkers() {
      this.rides.forEach((ride) => {
        const marker = L.marker([
          ride.startPoint.coordinates[1],  
          ride.startPoint.coordinates[0]   
        ]).addTo(this.map);

        marker.bindPopup(`
          <strong>${ride.startPoint.address} → ${ride.endPoint.address}</strong><br/>
          Partenza: ${new Date(ride.departureTime).toLocaleString()}
        `);
      });
    },
    goToRide(id) {
      this.$router.push(`/${id}`);
   }
  }
};
</script>

<style scoped>
.rides-title {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
  color: #004d99;
}

.rides-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.ride-card {
  background-color: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  border-left: 4px solid #004d99;
  cursor: pointer; /* Aggiunto per indicare che è cliccabile */
  transition: transform 0.2s, box-shadow 0.2s; /* Aggiunto effetto hover */
}

.ride-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.ride-route {
  margin-bottom: 0.5rem;
  color: #004d99;
  font-size: 1.1rem;
}

.ride-details {
  font-size: 0.9rem;
}

.detail-label {
  font-weight: 600;
  color: #555;
}

.ride-notes {
  margin-top: 0.5rem;
  font-style: italic;
}

.no-rides {
  color: #666;
  font-style: italic;
  text-align: center;
  padding: 1rem;
}
</style>