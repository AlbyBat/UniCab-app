<template>
  <div class="home">
    <h1>Ciao, {{ user.name || user.username }}!</h1>

    <div v-if="user">
      <p><strong>Username:</strong> {{ user.username }}</p>
      <p><strong>Nome:</strong> {{ user.name || '-' }}</p>
      <p><strong>Ruolo:</strong> {{ user.role }}</p>
      <p><strong>Telefono:</strong> {{ user.phone || '-' }}</p>
      <p><strong>Valutazione:</strong> {{ user.rating }} </p>
      <p><strong>Autista:</strong> {{ user.isDriver ? 'Sì' : 'No' }}</p>
      <p><strong>Veicolo:</strong> {{ user.vehicle || 'Non specificato' }}</p>
    </div>

    <button @click="goToEdit">Modifica dati personali</button>

    <button @click="logout">Logout</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      user: {},
    };
  },
  async created() {
    const token = localStorage.getItem('token');
    if (!token) {
      this.$router.push('/login');
      return;
    }

    try {
      const res = await fetch('/api/home', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) throw new Error('Errore nel caricamento utente');

      const data = await res.json();
      this.user = data.user || {};

    } catch (err) {
      console.error(err);
      alert('Sessione scaduta, effettua nuovamente il login');
      localStorage.removeItem('token');
      this.$router.push('/login');
    }
  },
  methods: {
   goToEdit() {
      this.$router.push('/home/edit')
    }
  }
}
</script>

<style scoped>
.home {
  max-width: 600px;
  margin: auto;
  padding: 1rem;
}
form {
  margin-top: 1rem;
}
label {
  display: block;
  margin-bottom: 0.5rem;
}
input {
  width: 100%;
  padding: 0.5rem;
  margin-bottom: 1rem;
}
button {
  padding: 0.5rem 1rem;
}
</style>
