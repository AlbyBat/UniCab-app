<template>
  <div class="min-h-screen bg-gray-100 p-6">
    <div class="max-w-3xl mx-auto bg-white p-6 shadow rounded">
      <h1 class="text-2xl font-bold text-gray-800 mb-4">Modifica Viaggio</h1>

      <form @submit.prevent="submitForm">
        <div class="mb-4">
          <label class="block text-gray-700">Partenza</label>
          <input v-model="form.startAddress" type="text" class="w-full border px-3 py-2 rounded" required />
        </div>

        <div class="mb-4">
          <label class="block text-gray-700">Destinazione</label>
          <input v-model="form.endAddress" type="text" class="w-full border px-3 py-2 rounded" required />
        </div>

        <div class="mb-4">
          <label class="block text-gray-700">Data e ora</label>
          <input v-model="form.departureTime" type="datetime-local" class="w-full border px-3 py-2 rounded" required />
        </div>

        <div class="mb-4">
          <label class="block text-gray-700">Posti disponibili</label>
          <input v-model.number="form.availableSeats" type="number" min="1" class="w-full border px-3 py-2 rounded" required />
        </div>

        <div class="mb-4">
          <label class="block text-gray-700">Prezzo (€)</label>
          <input v-model.number="form.price" type="number" step="0.01" class="w-full border px-3 py-2 rounded" required />
        </div>

        <div class="mb-4">
          <label class="block text-gray-700">Note aggiuntive</label>
          <textarea v-model="form.additionalInfo" class="w-full border px-3 py-2 rounded" rows="3"></textarea>
        </div>

        <div class="flex space-x-2">
          <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Salva</button>
          <button type="button" @click="$router.back()" class="bg-gray-300 text-black px-4 py-2 rounded">Annulla</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      form: {
        startAddress: '',
        endAddress: '',
        departureTime: '',
        availableSeats: 1,
        price: 0,
        additionalInfo: ''
      }
    };
  },
  async mounted() {
    const rideId = this.$route.params.id;
    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`/api/rides/${rideId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) throw new Error('Errore nel caricamento del viaggio');

      const ride = await res.json();

      this.form = {
        startAddress: ride.startPoint.address,
        endAddress: ride.endPoint.address,
        departureTime: new Date(ride.departureTime).toISOString().slice(0, 16),
        availableSeats: ride.availableSeats,
        price: ride.price,
        additionalInfo: ride.additionalInfo || ''
      };
    } catch (err) {
      console.error(err);
      alert('Errore nel caricamento del viaggio.');
    }
  },
  methods: {
    async submitForm() {
      const rideId = this.$route.params.id;
      const token = localStorage.getItem('token');

      try {
        const res = await fetch(`/api/rides/${rideId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            startAddress: this.form.startAddress,
            endAddress: this.form.endAddress,
            departureTime: this.form.departureTime,
            availableSeats: this.form.availableSeats,
            price: this.form.price,
            additionalInfo: this.form.additionalInfo
          })
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Errore nella modifica');
        }

        alert('Viaggio aggiornato con successo!');
        this.$router.push('/home/rides'); 
      } catch (err) {
        console.error(err);
        alert('Errore durante il salvataggio.');
      }
    }
  }
};
</script>

<style scoped>
</style>
