<template>
    <header class="bg-white shadow p-4 flex justify-between items-center">
      <nav class="space-x-4">
        <button @click="goToHome" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition">
          Home
        </button>
        <button @click="goToEdit" class="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition">
          Modifica dati
        </button>
        <button @click="goToLanding" class="bg-cyan-700 text-white px-4 py-2 rounded hover:bg-cyan-800 transition">
          Viaggi Disponibili
        </button>
        <button @click="goToSupport" class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition">
          Supporto
        </button>
        <button @click="logout" class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition">
          Logout
        </button>
      </nav>
    </header>
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
            :class="[
              'p-4 border rounded shadow-sm',
              ride.status === 'completed' ? 'bg-green-100' : 'bg-gray-50'
            ]"
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
                v-for="(booking, idx) in ride.bookings.filter(b => b.confirmed)"
                :key="idx"
              >
                {{ booking.userId?.name || 'Utente' }} - {{ booking.seats }} posto/i
              </li>
            </ul>
          </div>
        <div v-if="ride.status === 'completed' && ride.bookings?.length">
          <p class="font-semibold mt-4 text-gray-700">Scrivi recensione ai passeggeri:</p>
          <ul class="space-y-2 mt-2">
          <li
            v-for="booking in ride.bookings"
            :key="booking._id"
          >
            <div
              v-if="Array.isArray(booking.participants)"
              v-for="participant in booking.participants"
              :key="participant.userId?._id"
              v-show="participant?.confirmed && participant?.userId"
              class="flex justify-between items-center bg-gray-100 p-2 rounded"
            >
              <span
                @click="goToUserHome(participant.userId._id)"
                class="text-blue-600 hover:underline cursor-pointer"
              >
                {{ participant.userId.name }}
              </span>
              <button
                v-if="!isReviewed(ride._id, participant.userId._id)"
                @click="goToReviewUser(ride._id, participant.userId._id)"
                class="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition"
              >
                Scrivi recensione
              </button>
               <span v-else class="text-gray-500 italic">Recensione inviata</span>
            </div>
          </li>
          </ul>
        </div>
        <div class="mt-4 space-x-2" v-if="ride.status !== 'completed'">
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
            Gestisci prenotazioni
          </button>
          <button
            v-if="canShowCompleteButton(ride)"
            @click="completeRide(ride._id)"
            class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Segna come completato
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
      reviewedUsersByRide: {},  //{ rideId: [userId1, userId2, ...] }
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
      await this.fetchReviewedUsers();
    } catch (err) {
      console.error(err);
      alert('Errore durante il caricamento dei tuoi viaggi.');
    } finally {
      this.loading = false;
    }
    this.handleReturnFromReview();
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
    isReviewed(rideId, userId) {
      return this.reviewedUsersByRide[rideId]?.includes(userId);
    },
    markReviewed(rideId, userId) {
      if (!this.reviewedUsersByRide[rideId]) {
        this.reviewedUsersByRide[rideId] = [];
      }
      if (!this.reviewedUsersByRide[rideId].includes(userId)) {
        this.reviewedUsersByRide[rideId].push(userId);
      }
    },
    canShowCompleteButton(ride) {
      if (ride.status !== 'active') return false;

      const now = new Date();
      const departure = new Date(ride.departureTime);

      const diffInMs = now - departure;
      const diffInHours = diffInMs / (1000 * 60 * 60);

      return diffInHours >= 1;
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
    async completeRide(rideId) {
      const token = localStorage.getItem('token');
      try {
        const res = await fetch(`/api/rides/complete/${rideId}`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Errore');

        alert(data.message);
        const ride = this.rides.find(r => r._id === rideId);
        if (ride) ride.status = 'completed';
      } catch (err) {
        alert('Errore nel completamento del viaggio');
      }
    },
    async fetchReviewedUsers() {
      const token = localStorage.getItem('token');
      const promises = this.rides.map(async (ride) => {
        const res = await fetch(`/api/ratings/my-reviewed-passengers/${ride._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          return { rideId: ride._id, reviewedUserIds: data.reviewedUserIds };
        } else {
          return { rideId: ride._id, reviewedUserIds: [] };
        }
      });

      const results = await Promise.all(promises);
      results.forEach(({ rideId, reviewedUserIds }) => {
        this.reviewedUsersByRide[rideId] = reviewedUserIds;
      });
    },
    editRide(rideId) {
      this.$router.push(`/home/rides/${rideId}/edit`);
    },
    manageBookings(rideId) {
      this.$router.push(`/home/rides/${rideId}/bookings`);
    },
    goToEdit() {
      this.$router.push('/home/edit');
    },
    goToReviewUser(rideId, userId) {
       this.$router.push({
          path: `/home/rides/${rideId}/review/${userId}`,
          query: { role: 'driver' }  // 👈 qui sei autista
        });
    },
     handleReturnFromReview() {
      const { reviewedRideId, reviewedUserId } = this.$route.query;
      if (reviewedRideId && reviewedUserId) {
        this.markReviewed(reviewedRideId, reviewedUserId);
        this.$router.replace({ path: this.$route.path, query: {} });
      }
    },
    goToHome() {
      const localUser = JSON.parse(localStorage.getItem('user'));
      if (localUser?.userId) {
        this.$router.push(`/home/${localUser.userId}`);
      } else {
        this.$router.push('/login');
      }
    },
    goToLanding() {
    this.$router.push('/');
    },
    goToUserHome(userId) {
      this.$router.push(`/home/${userId}`);
    },
    goToSupport() {
    this.$router.push('/support');
    },
    logout() {
      localStorage.removeItem('token');
      this.$router.push('/login');
    }
  }
};
</script>

<style scoped>
</style>
