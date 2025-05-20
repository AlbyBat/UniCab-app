<template>
  <div class="ride-details p-4 max-w-3xl mx-auto">
    <h2 class="text-3xl font-bold text-[#004d99] mb-4">Dettagli Viaggio</h2>

    <div v-if="ride">
      <p><strong>Partenza:</strong> {{ ride.startPoint.address }}</p>
      <p><strong>Destinazione:</strong> {{ ride.endPoint.address }}</p>
      <p><strong>Orario:</strong> {{ formatDate(ride.departureTime) }}</p>
      <p><strong>Prezzo:</strong> €{{ ride.price.toFixed(2) }}</p>
      <p><strong>Posti disponibili:</strong> {{ ride.availableSeats }}</p>
      <p v-if="ride.additionalInfo"><strong>Note:</strong> {{ ride.additionalInfo }}</p>


      <div v-if="isLoggedIn" class="mt-6">
        <button @click="bookRide" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
          Prenota ora
        </button>
      </div>

      <div v-else class="mt-6 text-red-500 font-semibold">
        Effettua il login per prenotare questo viaggio.
      </div>
    </div>

    <div v-else>
      <p>Caricamento dettagli viaggio...</p>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      ride: null,
      isLoggedIn: !!localStorage.getItem('token'),
      seatsToBook: 1
    };
  },
  async created() {
    const rideId = this.$route.params.id;
    const token = localStorage.getItem('token');
    this.isLoggedIn = !!token;
    try {
      const res = await fetch(`/api/rides/${rideId}`);
      if (res.ok) {
        this.ride = await res.json();
      } else {
        console.error('Errore caricamento:', await res.text());
      }
    } catch (err) {
      console.error('Errore di rete:', err);
    }
  },
  methods: {
    async bookRide() {
        const token = localStorage.getItem('token');
        const rideId = this.$route.params.id;

        try {
        const res = await fetch(`/api/bookings/${rideId}/book`, {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
            seats: this.seatsToBook,
            participants: [1] 
            })
        });

        const data = await res.json();

        if (!res.ok) {
            alert(data.error || 'Errore nella prenotazione');
            return;
        }

        alert('Prenotazione effettuata con successo!');
        this.$router.push(`/booking/${rideId}`);
        } catch (err) {
        console.error('Errore nella richiesta:', err);
        alert('Errore durante la prenotazione.');
        }
    },
    formatDate(datetime) {
      const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      return new Date(datetime).toLocaleDateString('it-IT', options);
    }
  }
};
</script>

<style scoped>
.ride-details {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 2rem;
}
</style>
