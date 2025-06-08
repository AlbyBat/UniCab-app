<template>
  <div class="landing">
    <nav class="navbar">
      <div class="nav-left">
        <h1 class="text-4xl"> UniCab</h1>
      </div>
      <div class="nav-right">
        <router-link :to="`/home/${userId}`" class="nav-button">Home</router-link>
        <router-link to="/register" class="nav-button join-btn">Unisciti</router-link>
        <router-link to="/support" class="nav-button">Supporto</router-link>
      </div>
    </nav>

    <div class="main-content">
  
      <div id="map" class="map"></div>


      <div class="rides-panel">
        <h2 class="text-2xl font-bold mb-4">Viaggi disponibili</h2>
        <div v-if="rides.length === 0">Nessun viaggio disponibile</div>
        <div v-else class="rides-list">
          <div v-for="ride in rides" :key="ride._id" @click="goToRide(ride._id)" class="ride-card">
            <h3>{{ ride.startPoint.address }} → {{ ride.endPoint.address }}</h3>
            <p><strong>Partenza:</strong> {{ formatDate(ride.departureTime) }}</p>
            <p><strong>Posti disponibili:</strong> {{ ride.availableSeats }}</p>
            <p><strong>Prezzo:</strong> €{{ ride.price.toFixed(2) }}</p>
            <p v-if="ride.additionalInfo"><strong>Note:</strong> {{ ride.additionalInfo }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script>
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default {
  data() {
    return {
      rides: []
    };
  },
  computed: {
    userId() {
      const user = JSON.parse(localStorage.getItem('user'));
      return user?.userId || '';
    }
  },
  async created() {
    try {
      await fetch('/api/rides/refresh-status', {
        method: 'PATCH',
      });
      const res = await fetch('/api/rides');
      this.rides = await res.json();
    } catch (err) {
      console.error('Errore nel caricamento dei viaggi:', err);
    }
  },
  mounted() {
    
    const map = L.map('map').setView([46.06, 11.12], 13); 

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

  },
  methods: {
    formatDate(datetime) {
      const options = {
        weekday: 'long', year: 'numeric', month: 'long',
        day: 'numeric', hour: '2-digit', minute: '2-digit'
      };
      return new Date(datetime).toLocaleDateString('it-IT', options);
    },
    goToRide(id) {
      this.$router.push(`/${id}`);
    }
  }
};
</script>

<style scoped>

html, body, #app {
  height: 100%;
  margin: 0;
  padding: 0;
}

.landing {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: white;
  color: #222;
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #004d99;
  padding: 1rem 2rem;
  border-radius: 8px;
  color: white;
}

.nav-left h1 {
  margin: 0;
  color: white;
}

.nav-right {
  display: flex;
  gap: 1rem;
}

.nav-button {
  background-color: white;
  color: #004d99;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  text-decoration: none;
  font-weight: 600;
  transition: background-color 0.2s ease;
}

.nav-button:hover {
  background-color: #cce0ff;
}


.main-content {
  flex: 1;
  display: flex;
  min-height: 0;
  height: 100%;
}

.map {
  flex: 3;
  height: auto;
}

.rides-panel {
  flex: 1;
  overflow-y: auto;
  background-color: #f9f9f9;
  padding: 1rem;
  border-left: 2px solid #ccc;
}

.rides-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.ride-card {
  background-color: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: box-shadow 0.2s ease;
}
.ride-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.join-btn {
  background-color: #ff6600;
  color: white;
}

.join-btn:hover {
  background-color: #e65c00;
}
</style>
