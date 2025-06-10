<template>
  <div class="max-w-2xl mx-auto p-6 bg-white shadow rounded mt-8">
    <h1 class="text-2xl font-bold mb-6">Modifica Prenotazione</h1>

    <form @submit.prevent="submitForm" class="space-y-4">
      <div>
        <label class="block font-semibold mb-1">Posti prenotati</label>
        <input
          type="number"
          v-model.number="form.seats"
          min="1"
          required
          class="w-full border px-3 py-2 rounded"
        />
      </div>

      <div>
        <label class="block font-semibold mb-1">Partecipanti</label>
        <div v-for="(participant, index) in form.participants" :key="index" class="flex items-center space-x-2">
            {{ participant.name }} ({{ participant._id }})
            <input type="checkbox" v-model="form.participants[index].confirmed" />
            <label>Confermato</label>
        </div>
        <p v-if="form.participants.length === 0" class="text-gray-500 italic">Nessun partecipante</p>
      </div>

      <div class="flex space-x-4">
        <button
          type="submit"
          :disabled="isSubmitting"
          class="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {{ isSubmitting ? 'Salvando...' : 'Salva modifiche' }}
        </button>

        <button type="button" @click="$router.back()" class="bg-gray-300 px-6 py-2 rounded hover:bg-gray-400">
          Annulla
        </button>
      </div>
    </form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      form: {
        seats: 1,
        participants: []
      },
      isSubmitting: false
    };
  },
  async mounted() {
    const bookingId = this.$route.params.id;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`https://unicab-api.onrender.com/api/bookings/${bookingId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Errore nel caricamento della prenotazione');
      const booking = await res.json();

      this.form.seats = booking.seats;
      this.form.participants = booking.participants || [];
    } catch (err) {
      alert(err.message);
      this.$router.push('/home/bookings');
    }
  },
  methods: {
    async submitForm() {
      this.isSubmitting = true;
      const bookingId = this.$route.params.id;
      const token = localStorage.getItem('token');

      try {
        const res = await fetch(`https://unicab-api.onrender.com/api/bookings/${bookingId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(this.form)
        });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Errore durante la modifica');
        }
        alert('Prenotazione aggiornata con successo!');
        this.$router.push('/home/bookings');
      } catch (err) {
        alert(err.message);
      } finally {
        this.isSubmitting = false;
      }
    }
  }
};
</script>

<style scoped>
</style>
