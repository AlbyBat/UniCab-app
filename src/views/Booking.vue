<template>
  <div class="max-w-3xl mx-auto p-6">
    <h1 class="text-3xl font-bold mb-4 text-[#004d99]">Dettagli prenotazione</h1>

    <div v-if="ride" class="bg-white shadow-md rounded-lg p-6 space-y-4">
      <p><strong>Partenza:</strong> {{ ride.startPoint.address }}</p>
      <p><strong>Destinazione:</strong> {{ ride.endPoint.address }}</p>
      <p><strong>Data:</strong> {{ formatDate(ride.departureTime) }}</p>
      <p><strong>Posti totali disponibili:</strong> {{ ride.availableSeats }}</p>
      <p><strong>Posti già prenotati:</strong> {{ totalBookedSeats }}</p>

      <div v-if="booking" class="border-t pt-4 mt-4">
        <p><strong>Utente:</strong> {{ booking.userId.username }}</p>
        <p><strong>Posti prenotati:</strong> {{ booking.seats }}</p>

        <div v-if="booking.participants && booking.participants.length">
          <strong>Partecipanti:</strong>
          <ul class="list-disc list-inside">
            <li v-for="p in booking.participants" :key="p.userId._id">
              Nome: {{ p.userId.name }} —
              <span :class="p.confirmed ? 'text-green-600' : 'text-red-600'">
                {{ p.confirmed ? 'Confermato' : 'In attesa' }}
              </span>
            </li>
          </ul>
          <button @click="confirmParticipation"
                  class="mt-4 bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition">
            Conferma prenotazione
          </button>
        </div>
      </div>
    </div>

    <div v-else class="text-gray-600">Caricamento in corso...</div>
  </div>
</template>

<script>
import router from '@/router';

export default {
  data() {
    return {
      ride: null,
      booking: null,
      userId: null,
      isConfirmed: false,
      warnOnLeave: true,
    };
  },
  computed: {
    totalBookedSeats() {
      return this.ride?.bookings?.reduce((sum, b) => sum + b.seats, 0) || 0;
    }
  },
  async mounted() {
    const token = localStorage.getItem('token');
    const bookingId = this.$route.params.id;
    const rideData = localStorage.getItem('lastRide');
    const userData = localStorage.getItem('user');

    if (userData) {
      const parsedUser = JSON.parse(userData);
      this.userId = parsedUser.userId;
    }

    if (rideData) {
      this.ride = JSON.parse(rideData);
      localStorage.removeItem('lastRide');
    }

    try {
      const res = await fetch(`https://unicab-api.onrender.com/api/bookings/${bookingId}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Errore nel caricamento della prenotazione');
      this.booking = await res.json();
    } catch (err) {
      console.error(err);
    }

    window.addEventListener('beforeunload', this.handleBeforeUnload);
  },
  beforeUnmount() {
    window.removeEventListener('beforeunload', this.handleBeforeUnload);
  },
  methods: {
    formatDate(date) {
      return new Date(date).toLocaleString('it-IT', {
        dateStyle: 'full',
        timeStyle: 'short'
      });
    },
    handleBeforeUnload(e) {
      if (this.warnOnLeave && !this.isConfirmed) {
        e.preventDefault();
        e.returnValue = '';
      }
    },
    async confirmParticipation() {
      const token = localStorage.getItem('token');
      try {
        const res = await fetch(`https://unicab-api.onrender.com/api/bookings/${this.ride._id}/confirm`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Errore nella conferma');
        }

        alert('Partecipazione confermata!');
        this.isConfirmed = true;
        this.warnOnLeave = false;
        
        const localUser = JSON.parse(localStorage.getItem('user'));
        if (localUser?.userId) {
          this.$router.push(`/home/${localUser.userId}`);
        } else {
          this.$router.push('/login');
        }
    
      } catch (err) {
        console.error(err);
        alert(err.message);
      }
    },
    async cancelBookingIfUnconfirmed() {
      if (!this.isConfirmed && this.booking?._id) {
        const token = localStorage.getItem('token');
        try {
          const res = await fetch(`https://unicab-api.onrender.com/api/bookings/${this.booking._id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
          });
          if (!res.ok) {
            const err = await res.json();
            console.error('Errore durante la cancellazione:', err.error);
          } else {
            console.log('Prenotazione cancellata automaticamente.');
          }
        } catch (err) {
          console.error('Errore nel delete booking:', err);
        }
      }
    }
  },
  beforeRouteLeave(to, from, next) {
    if (this.warnOnLeave && !this.isConfirmed) {
      if (window.confirm('Non hai confermato la prenotazione. Vuoi annullarla?')) {
        this.cancelBookingIfUnconfirmed().then(() => {
          next(); //continua navigazione
        });
      } else {
        next(false); //blocca navigazione
      }
    } else {
      next();
    }
  }
};
</script>

<style scoped>
</style>
