<template>
  <div class="max-w-md mx-auto p-6 bg-white rounded shadow">
    <h2 class="text-xl font-bold mb-4">Segnala utente</h2>
    <form @submit.prevent="submitReport">
      <div class="mb-4">
        <label class="block mb-1 font-semibold">Utente segnalato:</label>
        <p>{{ reportedUserId }}</p>
      </div>

      <div class="mb-4">
        <label for="reason" class="block mb-1 font-semibold">Motivo:</label>
        <textarea id="reason" v-model="reason" rows="4" class="w-full border rounded p-2" required></textarea>
      </div>

      <button
        @click="submitReport"
        :disabled="loading"
        class="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
        Invia Segnalazione
      </button>


      <p v-if="message" class="mt-4 text-green-600">{{ message }}</p>
      <p v-if="error" class="mt-4 text-red-600">{{ error }}</p>
    </form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      reason: '',
      details: '',
      message: '',
      error: '',
      reportedUserId: '',
      reporterUserId: '',
      loading: false
    };
  },
  created() {
    this.reportedUserId = this.$route.params.id;
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.userId) {
      this.reporterUserId = user.userId;
    } else {
      this.$router.push('/login');
    }
  },
  methods: {
    async submitReport() {
        this.message = '';
        this.error = '';
        this.loading = true;

        if (!this.reason.trim()) {
            this.error = 'Il motivo è obbligatorio';
            this.loading = false;
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const res = await fetch('https://unicab-api.onrender.com/api/reports', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                reportedUserId: this.reportedUserId,
                reason: this.reason,
                details: this.details
            })
            });

            const data = await res.json();

            if (!res.ok) {
            this.error = data.error || 'Errore durante l\'invio della segnalazione';
            } else {
            this.message = data.message || 'Segnalazione inviata con successo!';
            this.reason = '';
            this.details = '';
            setTimeout(() => {
                this.$router.push(`/home/${this.reporterUserId}`);
            }, 1500);
            }
        } catch (err) {
            this.error = 'Errore di connessione';
        } finally {
            this.loading = false;
        }
    }
  }
};
</script>

<style scoped>
/* Puoi aggiungere qui i tuoi stili personalizzati */
</style>
