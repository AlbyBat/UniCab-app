<template>
  <div class="min-h-screen bg-gray-100 p-6">
    <div class="max-w-3xl mx-auto bg-white p-6 rounded shadow">
      <h1 class="text-2xl font-bold mb-4">Gestisci prenotazioni</h1>

      <div v-if="loading" class="text-gray-500">Caricamento prenotazioni...</div>
      <div v-else-if="bookings.length === 0" class="text-gray-600">Nessuna prenotazione confermata.</div>
      <div v-else class="space-y-4">
        <div v-for="booking in bookings" :key="booking._id" class="border p-4 rounded bg-gray-50">
          <p><strong>Utente:</strong> {{ booking.userId?.name || 'Utente' }}</p>
          <p><strong>Email:</strong> {{ booking.userId?.email || 'N/A' }}</p>
          <p><strong>Posti:</strong> {{ booking.seats }}</p>

          <button
            @click="rejectBooking(booking._id, booking.userId?.email)"
            class="mt-2 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
          >
            Rifiuta prenotazione
          </button>
        </div>
      </div>

      <button @click="goBack" class="mt-6 text-blue-600 hover:underline">⬅ Torna indietro</button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      bookings: [],
      loading: true
    };
  },
  async created() {
  const token = localStorage.getItem('token');
  const rideId = this.$route.params.id;

  if (!rideId) {
    console.error('Ride ID mancante!');
    return;
  }

  try {
    const res = await fetch(`/api/bookings/by-ride/${rideId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!res.ok) throw new Error('Errore nel caricamento delle prenotazioni');

    const allBookings = await res.json();
    this.bookings = allBookings;
  } catch (err) {
    console.error(err);
    alert('Errore nel recupero delle prenotazioni.');
  } finally {
    this.loading = false;
  }
},
  methods: {
    async rejectBooking(bookingId, userEmail) {
      const token = localStorage.getItem('token');
      if (!confirm('Sei sicuro di voler rifiutare questa prenotazione?')) return;

      try {
        const res = await fetch(`/api/bookings/${bookingId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!res.ok) throw new Error('Errore nel rifiuto della prenotazione');

        this.bookings = this.bookings.filter(b => b._id !== bookingId);
        alert(`Prenotazione rifiutata. Notifica inviata al'l\'utente'}.`);
        //Qui potresti chiamare un endpoint per inviare una vera notifica/email
      } catch (err) {
        console.error(err);
        alert('Errore nel rifiuto della prenotazione.');
      }
    },
    goBack() {
      this.$router.back();
    }
  }
};
</script>

<style scoped>
</style>
