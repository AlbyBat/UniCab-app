<template>
  <div class="min-h-screen bg-gray-100 p-6">
    <header class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold text-blue-800">Supporto</h1>
      <nav class="space-x-4">
        <button @click="goToHome" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition">
          Home
        </button>
        <button @click="goToLanding" class="bg-cyan-700 text-white px-4 py-2 rounded hover:bg-cyan-800 transition">
          Viaggi Disponibili
        </button>
        <button @click="logout" class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition">
          Logout
        </button>
      </nav>
    </header>

    <section class="bg-white p-6 rounded shadow-md max-w-2xl mx-auto">
      <h2 class="text-2xl font-semibold mb-4 text-gray-800">Hai bisogno di aiuto?</h2>
      <p class="text-gray-700 mb-4">
        Se hai problemi con l'app o vuoi segnalare un errore, scrivici compilando il modulo qui sotto.
      </p>

      <form @submit.prevent="submitSupportRequest" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">Messaggio</label>
          <textarea v-model="form.message" required rows="5" class="w-full p-2 border rounded"></textarea>
        </div>
        <button
          type="submit"
          :disabled="isSubmitting"
          class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition disabled:opacity-50"
        >
          {{ isSubmitting ? 'Invio in corso...' : 'Invia richiesta' }}
        </button>
      </form>

      <p v-if="successMessage" class="mt-4 text-green-600 font-medium">{{ successMessage }}</p>
    </section>
  </div>
</template>

<script>
export default {
  data() {
    return {
      form: {
        message: ''
      },
      successMessage: '',
      isSubmitting: false
    };
  },
  methods: {
    async submitSupportRequest() {
      try {
        this.isSubmitting = true;
        const token = localStorage.getItem('token');
        const res = await fetch('https://unicab-api.onrender.com/api/tickets', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ message: this.form.message })
        });
        if (!res.ok) throw new Error('Errore nell\'invio della richiesta');
        this.successMessage = 'La tua richiesta è stata inviata con successo!';
        this.form.message = '';
        setTimeout(() => {
          this.isSubmitting = false;
          this.goToHome();
      }, 3500);
      } catch (err) {
        alert(err.message);
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
    logout() {
      localStorage.removeItem('token');
      this.$router.push('/login');
    }
  }
};
</script>

<style scoped>
textarea {
  resize: vertical;
}
</style>
