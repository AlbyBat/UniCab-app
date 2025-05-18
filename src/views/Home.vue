<template>
  <div class="min-h-screen bg-gray-100">
    
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

    
    <main class="max-w-4xl mx-auto p-6 bg-white mt-6 rounded shadow">
      <h1 class="text-4xl font-bold text-gray-700">Benvenuto, {{ user.name || user.username }}</h1>
      <h2 class="text-2xl font-semibold text-gray-800 mb-4">Dati personali:</h2>
      <div class="space-y-2 text-gray-700">
        <p><strong>Username:</strong> {{ user.username }}</p>
        <p><strong>Nome:</strong> {{ user.name || '-' }}</p>
        <p><strong>Ruolo:</strong> {{ user.role }}</p>
        <p><strong>Telefono:</strong> {{ user.phone || '-' }}</p>
        <p><strong>Valutazione:</strong> {{ user.rating }}</p>
        <p><strong>Autista:</strong> {{ user.isDriver ? 'Sì' : 'No' }}</p>
        <p><strong>Veicolo:</strong> {{ user.vehicle || 'Non specificato' }}</p>
      </div>
    </main>
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
    logout() {
      localStorage.removeItem('token');
      this.$router.push('/login');
    }
  }
};
</script>
