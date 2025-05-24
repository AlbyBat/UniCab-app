<template>
  <div class="min-h-screen bg-gray-100 p-6">
    <div class="max-w-4xl mx-auto bg-white shadow rounded p-6">
      <h1 class="text-3xl font-bold text-gray-800 mb-4">Le tue prenotazioni</h1>

      <div v-if="loading" class="text-gray-500">Caricamento in corso...</div>
      <div v-else-if="rides.length === 0" class="text-gray-600">
        Nessuna prenotazione trovata.
      </div>
      <div v-else class="space-y-4">
        <div
          v-for="ride in rides"
          :key="ride._id"
          class="p-4 bg-gray-50 border rounded shadow-sm"
        >
          <p class="text-lg font-semibold">Viaggio da {{ ride.startPoint.address }} a {{ ride.endPoint.address }}</p>
          <p><strong>Data e ora:</strong> {{ formatDate(ride.departureTime) }}</p>
          <p><strong>Autista:</strong> {{ ride.driver?.name || 'N/A' }}</p>

          <div
            v-for="(booking, idx) in ride.myBookings"
            :key="idx"
            class="mt-2 pl-4 border-l-4 border-blue-500"
          >
            <p><strong>Posti prenotati:</strong> {{ booking.seats }}</p>
            <div v-if="booking.participants?.length">
              <p class="font-semibold mt-1">Partecipanti:</p>
              <ul class="list-disc list-inside">
                <li
                  v-for="(p, i) in booking.participants"
                  :key="i"
                >
                  {{ p.name || 'Partecipante' }} - {{ p.phone || 'N/A' }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      rides: [],
      loading: true,
    };
  },
  async created() {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/rides/my-bookings', {
        headers: {
          method: 'GET',
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error('Errore nel recupero delle prenotazioni');
      }

      this.rides = await res.json();
    } catch (err) {
      console.error(err);
      alert('Errore nel caricamento delle prenotazioni.');
    } finally {
      this.loading = false;
    }
  },
  methods: {
    formatDate(date) {
      const d = new Date(date);
      return d.toLocaleString('it-IT', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  }
};
</script>

<style scoped>
</style>
