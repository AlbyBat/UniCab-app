<template>
  <div class="min-h-screen bg-gray-100 p-6">
    <h1 class="text-3xl font-bold mb-4">Recensioni ricevute</h1>

    <div v-if="loading" class="text-gray-600">Caricamento...</div>
    <div v-else-if="reviews.length === 0" class="text-gray-500">Nessuna recensione trovata.</div>
    
    <div v-else class="space-y-4">
      <div v-for="review in reviews" :key="review._id" class="bg-white p-4 rounded shadow">
        <p class="text-gray-700"><strong>Da:</strong> {{ review.originUser.username }}</p>
        <p class="text-gray-600"><strong>Commento:</strong> {{ review.description || 'Nessun commento' }}</p>
        <p class="text-yellow-600 font-semibold">Valutazione: {{ review.rating }}/5</p>
      </div>
    </div>

    <button @click="goBack" class="mt-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
      Torna al profilo
    </button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      reviews: [],
      loading: true,
    };
  },
  async created() {
    const token = localStorage.getItem('token');
    const userId = this.$route.params.id;

    try {
      const res = await fetch(`/api/ratings/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) throw new Error('Errore nel caricamento delle recensioni');

      this.reviews = await res.json();
    } catch (err) {
      console.error(err);
      alert('Errore nel caricamento recensioni');
    } finally {
      this.loading = false;
    }
  },
  methods: {
    goBack() {
      this.$router.push(`/home/${this.$route.params.id}`);
    }
  }
};
</script>
