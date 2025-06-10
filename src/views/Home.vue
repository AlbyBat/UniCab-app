<template>
  <div class="min-h-screen bg-gray-100 flex flex-col">
    <header class="bg-white shadow p-4 flex justify-between items-center">
      <nav class="space-x-4">
        <button @click="goToHome" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition">
          Home
        </button>
        <button v-if="isOwnProfile" @click="goToEdit" class="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition">
          Modifica dati
        </button>
        <button @click="goToLanding" class="bg-cyan-700 text-white px-4 py-2 rounded hover:bg-cyan-800 transition">
          Viaggi Disponibili
        </button>
        <button v-if="isOwnProfile" @click="goToSupport" class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition">
          Supporto
        </button>
        <button v-if="isOwnProfile" @click="goToNotifications" class="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition">
          Notifiche
        </button>
        <button v-if="isOwnProfile" @click="logout" class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition">
          Logout
        </button>
      </nav>
    </header>

    <main class="flex-grow p-6 text-gray-800">
      <h1 class="text-4xl font-bold mb-4">
        <span v-if="isOwnProfile">Benvenuto, {{ user.name || user.username }}</span>
        <span v-else>Stai visualizzando il profilo di {{ user.name || user.username }}</span>
      </h1>

      <h2 class="text-2xl font-semibold mb-4">Dati personali:</h2>
      <div class="space-y-2">
        <p><strong>Username:</strong> {{ user.username }}</p>
        <p><strong>Nome:</strong> {{ user.name || '-' }}</p>
        <p><strong>Ruolo:</strong> {{ user.role }}</p>
        <p><strong>Telefono:</strong> {{ user.phone || '-' }}</p>
        <p><strong>Valutazione:</strong> {{ user.rating }}</p>
        <p><strong>Autista:</strong> {{ user.isDriver ? 'Sì' : 'No' }}</p>
        <p><strong>Veicolo:</strong> {{ user.vehicle || 'Non specificato' }}</p>

        <div v-if="isOwnProfile">
          <button @click="goToBookings" class="bg-purple-600 text-white py-3 px-4 rounded hover:bg-purple-700 transition text-lg">
            Visualizza prenotazioni attive
          </button>
        </div>

        <div v-else>
          <button @click="reportUser" class="bg-red-600 text-white py-3 px-4 rounded hover:bg-red-700 transition text-lg">
            Segnala
          </button>
        </div>

        <button @click="viewReviews" class="bg-blue-600 text-white py-3 px-4 rounded hover:bg-blue-700 transition text-lg">
            Visualizza recensioni
          </button>
      </div>
    </main>


    <div v-if="isOwnProfile && user.isDriver" class="p-6 bg-white border-t shadow-inner">
      <button @click="goToCreateRide" class="bg-purple-600 text-white py-3 px-4 rounded hover:bg-purple-700 transition text-lg">
        Crea nuovo viaggio
      </button>
      <button @click="goToRides" class="bg-purple-600 text-white py-3 px-4 rounded hover:bg-purple-700 transition text-lg">
        Visualizza i tuoi viaggi
      </button>
    </div>
  </div>
</template>

<script>
export default {
  props: ['userId'],
  data() {
    return {
      user: {},
      isOwnProfile: false
    };
  },
  async created() {
    await this.fetchUserData();
},
  watch: {
  '$route.params.id': {
    immediate: true,
    handler(newId) {
      const localUser = JSON.parse(localStorage.getItem('user'));
      this.isOwnProfile = localUser.userId === newId;
      this.fetchUserData();
    }
  }
},
  methods: {
    async fetchUserData() {
      const token = localStorage.getItem('token');
      const localUser = JSON.parse(localStorage.getItem('user'));
      const routeId = this.$route.params.id;

      if (!token || !localUser) {
        this.$router.push('/login');
        return;
      }

      try {
        const res = await fetch(`https://unicab-api.onrender.com/api/users/${routeId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) throw new Error('Errore nel caricamento utente');

        const data = await res.json();
        this.user = data;
        this.isOwnProfile = localUser.userId === routeId;
      } catch (err) {
        console.error(err);
        alert('Errore nel caricamento utente');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.$router.push('/login');
      }
    },
    goToEdit() {
      this.$router.push('/home/edit');
    },
    goToHome() {
      const localUser = JSON.parse(localStorage.getItem('user'));
      if (localUser?.userId) {
        this.$router.push(`/home/${localUser.userId}`);
        
      } else {
        this.$router.push('/login');
      }
    },
    goToLanding() {
      this.$router.push('/');
    },
    goToSupport() {
      this.$router.push('/support');
    },
    goToCreateRide() {
      this.$router.push('/home/create');
    },
    goToRides() {
      this.$router.push('/home/rides');
    },
    goToBookings() {
      this.$router.push('/home/bookings');
    },
    goToNotifications() {
      this.$router.push('/home/notifications');
    },
    logout() {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      this.$router.push('/login');
    },
    viewReviews() {
      const userId = this.$route.params.userId || this.user._id; 
      this.$router.push(`/home/${userId}/reviews`);
    },
    reportUser() {
      const userId = this.$route.params.userId || this.user._id; 
      this.$router.push(`/home/${userId}/report`);
    }
  }
};
</script>
