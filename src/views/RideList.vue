<template>
  <div class="min-h-screen bg-gray-100 p-6">
    <div class="max-w-4xl mx-auto bg-white shadow rounded p-6">
      <h1 class="text-3xl font-bold text-gray-800 mb-4">I tuoi viaggi da autista</h1>

      <div v-if="loading" class="text-gray-500">Caricamento in corso...</div>
      <div v-else-if="rides.length === 0" class="text-gray-600">
        Nessun viaggio trovato.
      </div>
      <div v-else class="space-y-6">
        <div
          v-for="ride in rides"
          :key="ride._id"
          class="p-4 bg-gray-50 border rounded shadow-sm"
        >
          <p class="text-lg font-semibold">
            Da {{ ride.startPoint.address }} a {{ ride.endPoint.address }}
          </p>
          <p><strong>Data e ora:</strong> {{ formatDate(ride.departureTime) }}</p>
          <p><strong>Posti disponibili:</strong> {{ ride.availableSeats }}</p>

          <div v-if="ride.bookings?.length">
            <p class="font-semibold mt-2">Prenotazioni:</p>
            <ul class="list-disc list-inside">
              <li
                v-for="(booking, idx) in ride.bookings"
                :key="idx"
              >
                {{ booking.userId?.name || 'Utente' }} - {{ booking.seats }} posto/i
              </li>
            </ul>
          </div>

          <!-- Pulsanti azione -->
          <div class="mt-4 space-x-2">
            <button
              @click="deleteRide(ride._id)"
              class="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition"
            >
              Elimina
            </button>
            <button
              @click="editRide(ride._id)"
              class="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition"
            >
              Modifica
            </button>
            <button
              @click="manageBookings(ride._id)"
              class="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition"
            >
              Accetta prenotazioni
            </button>
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
    const token = localStorage.getItem('token');

    try {
      const res = await fetch('/api/rides/my-rides', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) throw new Error('Errore nel recupero dei viaggi da autista');

      this.rides = await res.json();
    } catch (err) {
      console.error(err);
      alert('Errore durante il caricamento dei tuoi viaggi.');
    } finally {
      this.loading = false;
    }
  },
  methods: {
    formatDate(date) {
      return new Date(date).toLocaleString('it-IT', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },
    async deleteRide(rideId) {
      if (!confirm('Sei sicuro di voler eliminare questo viaggio?')) return;

      const token = localStorage.getItem('token');
      try {
        const res = await fetch(`/api/rides/${rideId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!res.ok) throw new Error('Errore durante l\'eliminazione');

        this.rides = this.rides.filter(r => r._id !== rideId);
        alert('Viaggio eliminato con successo');
      } catch (err) {
        console.error(err);
        alert('Errore durante l\'eliminazione del viaggio.');
      }
    },
    editRide(rideId) {
      // Reindirizza alla pagina di modifica (deve esistere o essere implementata)
      this.$router.push(`/home/rides/edit/${rideId}`);
    },
    manageBookings(rideId) {
      // Qui puoi cambiare comportamento: mostrare dettagli, aprire un modal, ecc.
      this.$router.push(`/home/rides/${rideId}/bookings`);
    }
  }
};
</script>

<style scoped>
</style>
