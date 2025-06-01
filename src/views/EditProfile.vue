<template>
  <div class="min-h-screen bg-gray-100">
    
    <header class="bg-white shadow p-4 flex justify-between items-center">
      <nav class="space-x-4">
        <button @click="goToHome" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition">
          Home
        </button>
        <button @click="goToEdit" class="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition">
          Modifica dati
        </button>
        <button @click="goToLanding" class="bg-cyan-700 text-white px-4 py-2 rounded hover:bg-cyan-800 transition">
          Viaggi Disponibili
       </button>
        <button @click="goToSupport" class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition">
          Supporto
        </button>
        <button @click="logout" class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition">
          Logout
        </button>
      </nav>
    </header>

    
    <main class="max-w-2xl mx-auto bg-white mt-6 p-6 rounded shadow">
      <h1 class="text-4xl font-bold text-gray-700">Modifica Profilo</h1>
      <form @submit.prevent="updateProfile" class="space-y-6">
        <div>
          <label class="block text-sm font-medium text-gray-700">Nome</label>
          <input
            v-model="form.name"
            type="text"
            required
            class="mt-1 block w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-indigo-500 text-gray-800"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Telefono</label>
          <input
            v-model="form.phone"
            type="tel"
            placeholder="Es. 3331234567"
            class="mt-1 block w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-indigo-500 text-gray-800"
            :class="{ 'border-red-500': phoneError }"
          />
          <p v-if="phoneError" class="text-red-600 text-sm mt-1">{{ phoneError }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Veicolo</label>
          <input
            v-model="form.vehicle"
            type="text"
            class="mt-1 block w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-indigo-500 text-gray-800"
          />
        </div>

        <button
          type="submit"
          class="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition"
        >
          Salva
        </button>
      </form>
    </main>
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
    if (!token) {
      this.$router.push('/login')
      return
    }

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
      if (!this.validatePhone()) return

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
        this.$router.push('/home')
      } else {
        console.error('Errore:', data)
        alert('Errore aggiornamento: ' + (data.message || ''))
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
    goToSupport() {
      this.$router.push('/support')
    },
    goToLanding() {
    this.$router.push('/');
  },
    logout() {
      localStorage.removeItem('token')
      this.$router.push('/login')
    }
  }
}
</script>
