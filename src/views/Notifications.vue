<template>
  <div class="min-h-screen bg-gray-100 p-6">
    <div class="max-w-3xl mx-auto">
      <h1 class="text-3xl font-bold mb-6">Le tue notifiche</h1>

      <div v-if="loading" class="text-center text-gray-600">Caricamento notifiche...</div>
      <div v-else-if="notifications.length === 0" class="text-center text-gray-600">Nessuna notifica disponibile.</div>

      <ul v-else class="space-y-4">
        <li
          v-for="notification in notifications"
          :key="notification._id"
          class="bg-white p-4 rounded shadow flex justify-between items-start"
        >
          <div>
            <p class="font-semibold">{{ notification.title }}</p>
            <p class="text-gray-700 text-sm">{{ notification.message }}</p>
            <p class="text-gray-500 text-xs mt-1">{{ formatDate(notification.createdAt) }}</p>
          </div>
          <span
            class="ml-4 px-2 py-1 text-xs rounded"
            :class="notification.read ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
          >
            {{ notification.read ? 'Letta' : 'Non letta' }}
          </span>
        </li>
      </ul>

      <button
        v-if="notifications.length"
        @click="markAllAsRead"
        class="mt-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
      >
        Segna tutte come lette
      </button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      notifications: [],
      loading: true
    };
  },
  async created() {
    const token = localStorage.getItem('token');

    try {
      const res = await fetch('https://unicab-api.onrender.com/api/notifications', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) throw new Error('Errore nel caricamento delle notifiche');

      this.notifications = await res.json();
    } catch (err) {
      console.error(err);
      alert('Errore nel caricamento delle notifiche.');
    } finally {
      this.loading = false;
    }
  },
  methods: {
    formatDate(dateStr) {
      const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
      return new Date(dateStr).toLocaleDateString('it-IT', options);
    },
    async markAllAsRead() {
      const token = localStorage.getItem('token');
      try {
        const res = await fetch('https://unicab-api.onrender.com/api/notifications/mark-all-read', {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!res.ok) throw new Error('Errore nel marcare le notifiche');

        this.notifications = this.notifications.map(n => ({ ...n, read: true }));
      } catch (err) {
        console.error(err);
        alert('Errore nel marcare le notifiche come lette.');
      }
    },
    beforeRouteLeave(to, from, next) {
      this.markAllAsRead().finally(() => {
        next();
      });
    }
  }
};
</script>

<style scoped>
</style>
