<template>
  <div class="min-h-screen bg-gray-100 p-8">
    <header class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold text-[#004d99]">Dashboard Admin</h1>
      <nav class="space-x-4">
        <button @click="goToHome" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">Home</button>
        <button @click="logout" class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition">Logout</button>
      </nav>
    </header>

    <section>
      <h2 class="text-xl font-semibold mb-4 text-gray-800">Azioni disponibili</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition">
          <h3 class="text-lg font-semibold text-[#004d99] mb-2">Gestisci Utenti</h3>
          <p class="text-gray-600 mb-4">Visualizza, modifica o rimuovi utenti registrati.</p>
          <button @click="manageUsers" class="bg-[#004d99] text-white px-4 py-2 rounded">Vai</button>
        </div>

        <div class="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition">
          <h3 class="text-lg font-semibold text-[#004d99] mb-2">Gestisci Viaggi</h3>
          <p class="text-gray-600 mb-4">Controlla, modifica o elimina viaggi esistenti.</p>
          <button @click="manageRides" class="bg-[#004d99] text-white px-4 py-2 rounded">Vai</button>
        </div>

        <div class="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition">
          <h3 class="text-lg font-semibold text-[#004d99] mb-2">Supporto Utenti</h3>
          <p class="text-gray-600 mb-4">Consulta richieste di supporto o invia risposte.</p>
          <button @click="goToSupport" class="bg-[#004d99] text-white px-4 py-2 rounded">Vai</button>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: 'AdminDashboard',
  methods: {
    goToHome() {
      window.location.href = '/home';
    },
    logout() {
      localStorage.removeItem('token');
      window.location.href = '/login';
    },
    manageUsers() {
      window.location.href = '/admin/users';
    },
    manageRides() {
      window.location.href = '/admin/rides';
    },
    goToSupport() {
      window.location.href = '/support';
    }
  }
};
</script>

<style scoped>

</style>
