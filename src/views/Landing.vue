<template>
  <div class="landing">
  
    <nav class="navbar">
      <div class="nav-left">
        <h1 class="text-4xl"> UniCab</h1>
      </div>
      <div class="nav-right">
        <router-link to="/home" class="nav-button">Home</router-link>
        <router-link to="/register" class="nav-button join-btn">Unisciti</router-link>
        <router-link to="/support" class="nav-button">Supporto</router-link>
      </div>
    </nav>


<h2 class="text-3xl font-bold" style="color: #004d99;">Viaggi disponibili</h2>
    <div v-if="rides.length === 0">Nessun viaggio disponibile</div>
    <div v-else class="rides-list">
      <div v-for="ride in rides" :key="ride._id" @click="goToRide(ride._id)" class="bg-white p-4 rounded-xl shadow-md cursor-pointer hover:shadow-lg transition">
        <h3>{{ ride.startPoint.address }} → {{ ride.endPoint.address }}</h3>
        <p><strong>Partenza:</strong> {{ formatDate(ride.departureTime) }}</p>
        <p><strong>Posti disponibili:</strong> {{ ride.availableSeats }}</p>
        <p><strong>Prezzo:</strong> €{{ ride.price.toFixed(2) }}</p>
        <p v-if="ride.additionalInfo"><strong>Note:</strong> {{ ride.additionalInfo }}</p>
        <div class="driver-info" v-if="ride.driver">
          <p><strong>Rating Autista:</strong> {{ ride.driver.rating }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      rides: []
    };
  },
  async created() {
    try {
      const res = await fetch('/api/rides');
      this.rides = await res.json();
    } catch (err) {
      console.error('Errore nel caricamento dei viaggi:', err);
    }
  },
  methods: {
    formatDate(datetime) {
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
      return new Date(datetime).toLocaleDateString('it-IT', options);
    },
    goToRide(id) {
      this.$router.push(`/${id}`);
    }
  }
};
</script>

<style scoped>
.landing {
  padding: 2rem;
  background-color: white;
  color: #222;
  min-height: 100vh;
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #004d99;
  padding: 1rem 2rem;
  border-radius: 8px;
  margin-bottom: 2rem;
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

.join-btn {
  background-color: #ff6600;
  color: white;
}

.join-btn:hover {
  background-color: #e65c00;
}

.rides-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.ride-card {
  border: 1px solid #ccc;
  padding: 1rem;
  border-radius: 8px;
  background-color: white;
  color: #333;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}
</style>
