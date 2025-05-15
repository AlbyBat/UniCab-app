<template>
  <div class="edit-profile">
    <h2>Modifica Profilo</h2>
    <form @submit.prevent="updateProfile">
      <label>Nome:</label>
      <input v-model="form.name" type="text" required />

      <label>Telefono:</label>
      <input
        type="tel"
        v-model="form.phone"
        placeholder="Es. 3331234567"
      />
      <span v-if="phoneError" class="error-message">{{ phoneError }}</span>

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
      },
      phoneError: ''
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
    validatePhone() {
      const pattern = /^[0-9]{10}$/
      if (!pattern.test(this.form.phone)) {
        this.phoneError = 'Il numero deve avere esattamente 10 cifre.'
        return false
      } else {
        this.phoneError = ''
        return true
      }
    },
    async updateProfile() {
    const isPhoneValid = this.validatePhone()
    if (!isPhoneValid) return

    const token = localStorage.getItem('token')
    const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(this.form)
    })

    const data = await res.json()
    if (res.ok) {
        alert('Profilo aggiornato')
        this.$router.push('/')
    } else {
        console.error('Errore:', data)
        alert('Errore aggiornamento: ' + (data.message || ''))
     }
    }

  }
}
</script>

<style scoped>
.input-error {
  border-color: red;
}
.error-message {
  color: red;
  font-size: 0.9em;
}
</style>
