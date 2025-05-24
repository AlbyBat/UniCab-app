<template>
  <div class="min-h-screen bg-gray-100 p-6">
    <div class="max-w-2xl mx-auto bg-white shadow-md rounded-lg p-8">
      <h1 class="text-2xl font-bold mb-6 text-center text-blue-700">Crea un nuovo viaggio</h1>

      <form @submit.prevent="submitRide" class="space-y-4">
        <div>
          <label class="block font-semibold">Indirizzo di partenza</label>
          <input v-model="form.startAddress" type="text" class="w-full border p-2 rounded" required />
        </div>

        <div>
          <label class="block font-semibold">Indirizzo di destinazione</label>
          <input v-model="form.endAddress" type="text" class="w-full border p-2 rounded" required />
        </div>

        <div class="flex gap-4">
          <div class="flex-1">
            <label class="block font-semibold">Latitudine partenza</label>
            <input v-model.number="form.startCoordinates[0]" type="number" step="any" class="w-full border p-2 rounded" />
          </div>
          <div class="flex-1">
            <label class="block font-semibold">Longitudine partenza</label>
            <input v-model.number="form.startCoordinates[1]" type="number" step="any" class="w-full border p-2 rounded" />
          </div>
        </div>

        <div class="flex gap-4">
          <div class="flex-1">
            <label class="block font-semibold">Latitudine destinazione</label>
            <input v-model.number="form.endCoordinates[0]" type="number" step="any" class="w-full border p-2 rounded" />
          </div>
          <div class="flex-1">
            <label class="block font-semibold">Longitudine destinazione</label>
            <input v-model.number="form.endCoordinates[1]" type="number" step="any" class="w-full border p-2 rounded" />
          </div>
        </div>

        <div>
          <label class="block font-semibold">Data e ora di partenza</label>
          <input v-model="form.departureTime" type="datetime-local" class="w-full border p-2 rounded" required />
        </div>

        <div>
          <label class="block font-semibold">Posti disponibili</label>
          <input v-model.number="form.availableSeats" type="number" min="1" class="w-full border p-2 rounded" required />
        </div>

        <div>
          <label class="block font-semibold">Prezzo (€)</label>
          <input v-model.number="form.price" type="number" step="0.01" class="w-full border p-2 rounded" required />
        </div>

        <div>
          <label class="block font-semibold">Note aggiuntive (opzionali)</label>
          <textarea v-model="form.additionalInfo" class="w-full border p-2 rounded"></textarea>
        </div>

        <button type="submit" class="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 transition">
          Pubblica Viaggio
        </button>
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
        startCoordinates: [0, 0],
        endAddress: '',
        endCoordinates: [0, 0],
        departureTime: '',
        availableSeats: 1,
        price: 0,
        additionalInfo: ''
      }
    };
  },
  methods: {
    async submitRide() {
      const token = localStorage.getItem('token');
      try {
        const res = await fetch('/api/rides', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(this.form)
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Errore nella creazione del viaggio');
        }

        alert('Viaggio creato con successo!');
        this.$router.push('/');
      } catch (err) {
        console.error(err);
        alert(`Errore: ${err.message}`);
      }
    }
  }
};
</script>
