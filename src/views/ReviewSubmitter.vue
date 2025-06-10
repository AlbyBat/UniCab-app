<template>
  <div class="bg-white border rounded p-4 shadow space-y-4">
    <h3 class="text-lg font-semibold text-gray-700">Scrivi una recensione</h3>

    <textarea
      v-model="descrizione"
      placeholder="Scrivi la tua recensione..."
      class="w-full border rounded p-2 focus:outline-none focus:ring"
      rows="3"
    ></textarea>

    <div class="flex items-center space-x-2">
      <label class="text-sm text-gray-600">Valutazione:</label>
      <div class="flex space-x-1">
        <span
          v-for="n in 5"
          :key="n"
          @click="rating = n"
          class="cursor-pointer text-2xl"
          :class="n <= rating ? 'text-yellow-400' : 'text-gray-300'"
        >
          ★
        </span>
      </div>
    </div>

    <button
      @click="submitReview"
      :disabled="loading || !descrizione || !rating"
      class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition disabled:opacity-50"
    >
      {{ loading ? 'Invio...' : 'Invia recensione' }}
    </button>

    <p v-if="successMessage" class="text-green-600 text-sm">{{ successMessage }}</p>
    <p v-if="errorMessage" class="text-red-600 text-sm">{{ errorMessage }}</p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      descrizione: '',
      rating: 5,
      loading: false,
      successMessage: '',
      errorMessage: ''
    };
  },
  computed: {
    rideId() {
      return this.$route.params.rideId;
    },
    destinationUserId() {
      return this.$route.params.userId;
    },
    role() {
      return this.$route.query.role || 'passenger';
    }
  },
  methods: {
     async submitReview() {
      this.loading = true;
      this.successMessage = '';
      this.errorMessage = '';
      const token = localStorage.getItem('token');

      try {
        const res = await fetch(`https://unicab-api.onrender.com/api/ratings/${this.destinationUserId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            descrizione: this.descrizione,
            rating: this.rating,
            ride: this.rideId 
          })
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Errore durante l\'invio della recensione');
        }

        this.successMessage = data.message || 'Recensione inviata con successo!';
        this.descrizione = '';
        this.rating = 5;

        this.$emit('review-submitted');
      } catch (err) {
        console.error(err);
        this.errorMessage = err.message || 'Errore imprevisto';
      } finally {
        this.loading = false;
      }

      if (this.role === 'passenger') {
        this.$router.push({
          path: '/home/bookings',
          query: { reviewedRideId: this.rideId, reviewedUserId: this.destinationUserId }
        });
      } else {
        this.$router.push({
          path: '/home/rides',
          query: { reviewedRideId: this.rideId, reviewedUserId: this.destinationUserId }
        });
      }

    }
  }
};
</script>

<style scoped>
textarea::placeholder {
  color: #9ca3af;
}
</style>
