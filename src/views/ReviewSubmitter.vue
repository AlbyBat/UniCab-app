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
      <select v-model.number="rating" class="border p-1 rounded">
        <option v-for="n in 5" :key="n" :value="n">{{ n }} ⭐</option>
      </select>
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
  props: {
    destinationUserId: {
      type: String,
      required: true // l'id dell'autista da recensire
    }
  },
  data() {
    return {
      descrizione: '',
      rating: 5,
      loading: false,
      successMessage: '',
      errorMessage: ''
    };
  },
  methods: {
    async submitReview() {
      this.loading = true;
      this.successMessage = '';
      this.errorMessage = '';
      const token = localStorage.getItem('token');

      try {
        const res = await fetch(`/api/ratings/${this.destinationUserId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            descrizione: this.descrizione,
            rating: this.rating
          })
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Errore durante l\'invio della recensione');
        }

        this.successMessage = data.message || 'Recensione inviata con successo!';
        this.descrizione = '';
        this.rating = 5;

        // Emissione evento per genitore (opzionale)
        this.$emit('review-submitted');

      } catch (err) {
        console.error(err);
        this.errorMessage = err.message || 'Errore imprevisto';
      } finally {
        this.loading = false;
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
