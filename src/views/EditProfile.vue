<template>
  <div class="edit-profile">
    <h2>Modifica Profilo</h2>
    <form @submit.prevent="updateProfile">
      <label>Nome:</label>
      <input v-model="form.name" type="text" />

      <label>Telefono:</label>
      <input v-model="form.phone" type="text" />

      <label>Veicolo:</label>
      <input v-model="form.vehicle" type="text" />

      <button type="submit">Salva</button>
    </form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      form: {
        name: '',
        phone: '',
        vehicle: ''
      }
    }
  },
  async created() {
    const token = localStorage.getItem('token')
    const res = await fetch('/api/home', {
      headers: { Authorization: `Bearer ${token}` }
    })
    const data = await res.json()
    const u = data.user
    this.form = {
      name: u.name || '',
      phone: u.phone || '',
      vehicle: u.vehicle || ''
    }
  },
  methods: {
    async updateProfile() {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(this.form)
      })

      if (res.ok) {
        alert('Profilo aggiornato')
        this.$router.push('/')
      } else {
        alert('Errore aggiornamento')
      }
    }
  }
}
</script>
