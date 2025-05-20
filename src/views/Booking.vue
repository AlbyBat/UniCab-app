<template>
  <div class="max-w-3xl mx-auto p-6">
    <h1 class="text-3xl font-bold mb-4 text-[#004d99]">Dettagli prenotazione</h1>

    <div v-if="ride" class="bg-white shadow-md rounded-lg p-6 space-y-4">
      <p><strong>Partenza:</strong> {{ ride.startPoint.address }}</p>
      <p><strong>Destinazione:</strong> {{ ride.endPoint.address }}</p>
      <p><strong>Data:</strong> {{ formatDate(ride.departureTime) }}</p>
      <p><strong>Posti totali disponibili:</strong> {{ ride.availableSeats }}</p>
      <p><strong>Posti già prenotati:</strong> {{ totalBookedSeats }}</p>

      <div v-for="booking in ride.bookings" :key="booking._id" class="border-t pt-4 mt-4">
        <p><strong>Utente:</strong> {{ booking.userId }}</p>
        <p><strong>Posti prenotati:</strong> {{ booking.seats }}</p>

        <div v-if="booking.participants && booking.participants.length">
          <strong>Partecipanti:</strong>
          <ul class="list-disc list-inside">
            <li v-for="p in booking.participants" :key="p.userId">
              ID: {{ p.userId }} —
              <span :class="p.confirmed ? 'text-green-600' : 'text-red-600'">
                {{ p.confirmed ? 'Confermato' : 'In attesa' }}
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div v-else class="text-gray-600">Caricamento in corso...</div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      ride: null
    };
  },
  computed: {
    totalBookedSeats() {
      return this.ride?.bookings?.reduce((sum, b) => sum + b.seats, 0) || 0;
    }
  },
  async mounted() {
    const token = localStorage.getItem('token');
    const rideId = this.$route.params.id;

    try {
      const res = await fetch(`/api/rides/${rideId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) throw new Error('Errore nel caricamento del viaggio');
      this.ride = await res.json();
    } catch (err) {
      console.error(err);
    }
  },
  methods: {
    formatDate(date) {
      return new Date(date).toLocaleString('it-IT', {
        dateStyle: 'full',
        timeStyle: 'short'
      });
    }
  }
};
</script>

<style scoped>
</style>
