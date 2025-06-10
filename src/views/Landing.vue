<template>
  <div class="landing">
    <nav class="navbar">
      <div class="nav-left">
        <h1 class="text-4xl">UniCab</h1>
      </div>
      <div class="nav-right">
        <a @click="handleHomeClick" class="nav-button">Home</a>
        <router-link to="/register" class="nav-button join-btn">Unisciti</router-link>
        <router-link to="/support" class="nav-button">Supporto</router-link>
      </div>
    </nav>

    <div class="main-content">
      <div id="map" class="map"></div>   
      <div class="rides-panel">
        <NearbyRides />  
      </div>
    </div>
  </div>
</template>

<script>
import NearbyRides from './NearbyRides.vue';  

export default {
  components: {
    NearbyRides
  },
  computed: {
    userId() {
      const user = JSON.parse(localStorage.getItem('user'));
      return user?.userId || '';
    },
    isLoggedIn() {
      const user = JSON.parse(localStorage.getItem('user'));
      return user && user.userId;
    }
  },
  methods: {
    handleHomeClick() {
      if (this.isLoggedIn) {
        this.$router.push(`/home/${this.userId}`);
      } else {
        this.$router.push('/login');
      }
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

/* Contenitore principale */
.landing {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: white;
  color: #222;
}

/* Navbar */
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

/* Pulsanti navbar */
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

/* Main content: mappa + lista viaggi */
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

/* Pulsante Unisciti */
.join-btn {
  background-color: #ff6600;
  color: white;
}

.join-btn:hover {
  background-color: #e65c00;
}
</style>