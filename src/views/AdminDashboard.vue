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
          <h3 class="text-lg font-semibold text-[#004d99] mb-2">Gestione Utenti</h3>
          <p class="text-gray-600 mb-4">Visualizza, sospendi, attiva o elimina utenti.</p>
          <button @click="manageUsers" class="bg-[#004d99] text-white px-4 py-2 rounded">Vai</button>
        </div>

        <div class="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition">
          <h3 class="text-lg font-semibold text-[#004d99] mb-2">Gestione Viaggi</h3>
          <p class="text-gray-600 mb-4">Controlla o elimina viaggi esistenti.</p>
          <button @click="manageRides" class="bg-[#004d99] text-white px-4 py-2 rounded">Vai</button>
        </div>

        <div class="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition">
          <h3 class="text-lg font-semibold text-[#004d99] mb-2">Segnalazioni e Supporto</h3>
          <p class="text-gray-600 mb-4">Gestisci segnalazioni e supporta gli utenti.</p>
          <button @click="viewReports" class="bg-[#004d99] text-white px-4 py-2 rounded">Vai</button>
        </div>
      </div>
    </section>

    <section v-if="reports.length" class="mt-12">
      <h2 class="text-xl font-semibold text-gray-800 mb-4">Ultime segnalazioni</h2>
      <div class="overflow-auto">
        <table class="min-w-full bg-white shadow-md rounded">
          <thead class="bg-[#004d99] text-white">
            <tr>
              <th class="px-4 py-2 text-left">Segnalato</th>
              <th class="px-4 py-2 text-left">Segnalatore</th>
              <th class="px-4 py-2 text-left">Messaggio</th>
              <th class="px-4 py-2 text-left">Data</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="report in reports" :key="report._id" class="border-b">
              <td class="px-4 py-2">{{ report.reportedUser.name }} ({{ report.reportedUser.username }})</td>
              <td class="px-4 py-2">{{ report.reporterUser.name }} ({{ report.reporterUser.username }})</td>
              <td class="px-4 py-2">{{ report.reason }}</td>
              <td class="px-4 py-2">{{ formatDate(report.createdAt) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  data() {
    return {
      reports: []
    }
  },
  async created() {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/reports', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) throw new Error('Errore nel caricamento delle segnalazioni');
      this.reports = await res.json();
    } catch (err) {
      console.error(err);
    }
  },
  methods: {
    goToHome() {
      const localUser = JSON.parse(localStorage.getItem('user'));
      if (localUser?.userId) {
        this.$router.push(`/home/${localUser.userId}`);
      } else {
        this.$router.push('/login');
      }
    },
    logout() {
      localStorage.removeItem('token');
      window.location.href = '/login';
    },
    manageUsers() {
      this.$router.push('/admin/users');
    },
    manageRides() {
      this.$router.push('/admin/rides');
    },
    viewReports() {
      this.$router.push('/admin/reports');
    },
    formatDate(date) {
      return new Date(date).toLocaleString('it-IT', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
      });
    }
  }
};
</script>

<style scoped>
th, td {
  white-space: nowrap;
}
</style>