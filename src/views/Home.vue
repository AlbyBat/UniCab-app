<template>
  <div class="min-h-screen bg-gray-100 flex flex-col">
    <header class="bg-white shadow p-4 flex justify-between items-center">
      <nav class="space-x-4">
        <button @click="goToHome" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition">
          Home
        </button>
        <button @click="goToEdit" class="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition">
          Modifica dati
        </button>
        <button @click="goToLanding" class="bg-cyan-700 text-white px-4 py-2 rounded hover:bg-cyan-800 transition">
          Viaggi Disponibili
        </button>
        <button @click="goToSupport" class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition">
          Supporto
        </button>
        <button @click="logout" class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition">
          Logout
        </button>
      </nav>
    </header>

    <main class="flex-grow p-6 text-gray-800">
      <h1 class="text-4xl font-bold mb-4">Benvenuto, {{ user.name || user.username }}</h1>
      <h2 class="text-2xl font-semibold mb-4">Dati personali:</h2>
      <div class="space-y-2">
        <p><strong>Username:</strong> {{ user.username }}</p>
        <p><strong>Nome:</strong> {{ user.name || '-' }}</p>
        <p><strong>Ruolo:</strong> {{ user.role }}</p>
        <p><strong>Telefono:</strong> {{ user.phone || '-' }}</p>
        <p><strong>Valutazione:</strong> {{ user.rating }}</p>
        <p><strong>Autista:</strong> {{ user.isDriver ? 'Sì' : 'No' }}</p>
        <p><strong>Veicolo:</strong> {{ user.vehicle || 'Non specificato' }}</p>
        <button @click="goToBookings" class="bg-purple-600 text-white py-3 px-4  rounded hover:bg-purple-700 transition text-lg">
        Visualizza prenotazioni attive
      </button>
      </div>
    </main>


    <div v-if="user.isDriver" class="p-6 bg-white border-t shadow-inner">
      <button @click="goToCreateRide" class="bg-purple-600 text-white py-3 px-4  rounded hover:bg-purple-700 transition text-lg">
        Crea nuovo viaggio
      </button>
    </div>
  </div>
</template>


<script>
export default {
  data() {
    return {
      user: {},
    };
  },
  async created() {
    const token = localStorage.getItem('token');
    if (!token) {
      this.$router.push('/login');
      return;
    }

    try {
      const res = await fetch('/api/home', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) throw new Error('Errore nel caricamento utente');

      const data = await res.json();
      this.user = data.user || {};
    } catch (err) {
      console.error(err);
      alert('Sessione scaduta, effettua nuovamente il login');
      localStorage.removeItem('token');
      this.$router.push('/login');
    }
  },
  methods: {
    goToEdit() {
      this.$router.push('/home/edit');
    },
    goToHome() {
      this.$router.push('/home');
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
    goToBookings() {
      this.$router.push('/home/bookings');
    },
    logout() {
      localStorage.removeItem('token');
      this.$router.push('/login');
    }
  }
};
</script>
