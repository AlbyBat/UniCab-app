<template>
  <div class="min-h-screen bg-gray-100 p-8">
    <h1 class="text-3xl font-bold text-[#004d99] mb-6">Gestione Utenti Segnalati</h1>

    <div v-if="loading" class="text-gray-600">Caricamento dati...</div>
    <div v-else-if="users.length === 0" class="text-gray-500">Nessun utente segnalato.</div>
    <div v-else>
      <table class="min-w-full bg-white rounded shadow">
        <thead>
          <tr class="bg-gray-200 text-gray-700">
            <th class="py-3 px-4 text-left">Nome</th>
            <th class="py-3 px-4 text-left">Username</th>
            <th class="py-3 px-4 text-left">Stato</th>
            <th class="py-3 px-4 text-left">Azioni</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user._id" class="border-t hover:bg-gray-50">
            <td class="py-3 px-4">{{ user.name }}</td>
            <td class="py-3 px-4">{{ user.username }}</td>
            <td class="py-3 px-4 capitalize">
              <span
                :class="{
                  'text-green-600': user.status === 'active',
                  'text-yellow-600': user.status === 'suspended',
                  'text-red-600': user.status === 'eliminated'
                }"
              >
                {{ user.status }}
              </span>
            </td>
            <td class="py-3 px-4 space-x-2">
              <button
                v-if="user.status === 'active'"
                @click="changeStatus(user._id, 'suspend')"
                class="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
              >
                Sospendi
              </button>
              <button
                v-if="user.status === 'suspended'"
                @click="changeStatus(user._id, 'activate')"
                class="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
              >
                Attiva
              </button>
              <button
                v-if="user.status !== 'eliminated'"
                @click="changeStatus(user._id, 'cancel')"
                class="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
              >
                Elimina
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AdminUsers',
  data() {
    return {
      users: [],
      loading: false,
    };
  },
  async mounted() {
    await this.fetchReportedUsers();
  },
  methods: {
    async fetchReportedUsers() {
      this.loading = true;
      const token = localStorage.getItem('token');

      try {
        const res = await fetch('/api/admin/reports', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error('Errore nel recupero delle segnalazioni');

        const reports = await res.json();
        const uniqueUsers = new Map();

        reports.forEach(report => {
          const user = report.reportedUser;
          if (user && !uniqueUsers.has(user._id)) {
            uniqueUsers.set(user._id, user);
          }
        });

        this.users = Array.from(uniqueUsers.values());
      } catch (err) {
        console.error(err);
        alert('Errore nel caricamento degli utenti segnalati.');
      } finally {
        this.loading = false;
      }
    },

    async changeStatus(userId, action) {
      const token = localStorage.getItem('token');
      const messages = {
        suspend: 'Vuoi sospendere questo utente?',
        activate: 'Vuoi riattivare questo utente?',
        cancel: 'Vuoi eliminare questo utente?'
      };

      if (!confirm(messages[action])) return;

      try {
        const res = await fetch(`/api/admin/users/${userId}/${action}`, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Errore');

        alert(data.message || 'Operazione riuscita');
        await this.fetchReportedUsers();
      } catch (err) {
        console.error(err);
        alert(err.message || 'Errore nella modifica dello stato utente.');
      }
    }
  }
};
</script>

<style scoped>
table {
  border-collapse: collapse;
  width: 100%;
}
</style>