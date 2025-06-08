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
      <h1 class="text-3xl font-bold text-gray-800 mb-4">Le tue prenotazioni</h1>

      <div v-if="loading" class="text-gray-500">Caricamento in corso...</div>
      <div v-else-if="rides.length === 0" class="text-gray-600">
        Nessuna prenotazione trovata.
      </div>
      <div v-else class="space-y-4">
        <div
          v-for="ride in rides"
          :key="ride._id"
          :class="[
              'p-4 border rounded shadow-sm',
              ride.status === 'completed' ? 'bg-green-100' : 'bg-gray-50'
            ]"
        >
          <p class="text-lg font-semibold">Viaggio da {{ ride.startPoint.address }} a {{ ride.endPoint.address }}</p>
          <p><strong>Data e ora:</strong> {{ formatDate(ride.departureTime) }}</p>
          <p><strong>Autista:</strong> {{ ride.driver?.name || 'N/A' }}</p>

          <div
              v-for="(booking, idx) in ride.bookings"
              :key="idx"
              :class="[
                'mt-2 pl-4 border-l-4',
                isPastRide(ride.departureTime) ? 'bg-green-100 border-green-500' : 'border-blue-500'
              ]"
            >
            <p><strong>Posti prenotati:</strong> {{ booking.seats }}</p>
            
          <div class="mt-2 space-x-2" v-if="ride.status !== 'completed' && ride.status !== 'active'">
            <button 
              @click="deleteBooking(booking._id)" 
              class="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition"
            >
              Cancella
            </button>
            <button 
              @click="editBooking(booking._id)" 
              class="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition"
            >
              Modifica
            </button>
          </div>       
          </div>
            <div v-if="ride.status === 'completed'">
              <div v-if="!hasAlreadyReviewed(ride._id)">
                <button 
                  @click="goToReviewUser(ride._id, ride.driver._id)"
                  class="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition"
                >
                  Scrivi recensione
                </button>
              </div>
              <div v-else class="text-gray-500 italic">
                Recensione già inviata
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
      reviewText: '',
      reviewRating: 5,
      reviewedUsersByRide: {},  //{ rideId: [userId1, userId2, ...] }
    };
  },
  async created() {
    const saved = localStorage.getItem('reviewedRides');
    this.reviewedRides = saved ? JSON.parse(saved) : [];
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/bookings/my-bookings', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error('Errore nel recupero delle prenotazioni');
      }

      this.rides = await res.json();
      await this.fetchReviewedUsers();
      
    } catch (err) {
      console.error(err);
      alert('Errore nel caricamento delle prenotazioni.');
    } finally {
      this.loading = false;
    }
    this.handleReturnFromReview();
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
    },
    goToReviewUser(rideId, userId) {
       this.$router.push({
          path: `/home/rides/${rideId}/review/${userId}`,
          query: { role: 'passenger' }  // 👈 qui sei autista
        });
    },
    handleReturnFromReview() {
      const { reviewedRideId } = this.$route.query;
      if (reviewedRideId) {
        this.reviewedRides.push(reviewedRideId);
        localStorage.setItem('reviewedRides', JSON.stringify(this.reviewedRides));
        this.$router.replace({ path: this.$route.path, query: {} });
      }
    },
    hasAlreadyReviewed(rideId) {
      return this.reviewedRides.includes(rideId);
    },
    isPastRide(departureTime) {
      const now = new Date();
      return new Date(departureTime) < now;
    },
    async editBooking(bookingId){
      this.$router.push(`/home/bookings/edit/${bookingId}`);
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
    async deleteBooking(bookingId){
      const token = localStorage.getItem('token');
      if (!confirm('Sei sicuro di voler cancellare questa prenotazione?')) return;

      try {
        const res = await fetch(`/api/bookings/${bookingId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Errore nella cancellazione');
        }

        alert('Prenotazione cancellata con successo!');
        location.reload(); 
      } catch (err) {
        console.error(err);
        alert(err.message);
      }
    },
    goToEdit() {
      this.$router.push('/home/edit');
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
