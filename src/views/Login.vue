<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 px-4">
    <div class="max-w-md w-full bg-white p-8 rounded shadow">
      <h2 class="text-3xl text-gray-700 font-bold mb-6 text-center">Accedi</h2>
      <form @submit.prevent="handleLogin" class="space-y-6">
        <div>
          <label for="username" class="block text-sm font-medium text-gray-700">Username</label>
          <input
            id="username"
            v-model="username"
            type="text"
            required
            class="mt-10 block w-full rounded border border-gray-300 text-gray-600 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            class="mt-10 block w-full rounded border border-gray-300  text-gray-600 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-15"
          />
        </div>
        <button
          type="submit"
          class="mt-10 w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition"
        >
          Accedi
        </button>
      </form>

      <p class="mt-4 text-center text-sm text-gray-600">
        Non hai un account?
        <router-link to="/register" class="text-indigo-600 hover:underline">Registrati</router-link>
      </p>

      <p v-if="errorMsg" class="mt-4 text-center text-red-600">{{ errorMsg }}</p>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      username: '',
      password: '',
      errorMsg: ''
    }
  },
  methods: {
  async handleLogin() {
    this.errorMsg = ''
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: this.username,
          password: this.password
        })
      })

      const data = await res.json()

      if (res.ok && data.token) {
        // 1. salva il token
        localStorage.setItem('token', data.token)

        // 2. decodifica il token e salva l'utente
        const user = this.parseJwt(data.token)
        localStorage.setItem('user', JSON.stringify(user))

        // 3. reindirizza alla home
        this.$router.push('/home')
      } else {
        this.errorMsg = data.message || 'Credenziali errate'
      }
    } catch (error) {
      this.errorMsg = 'Errore di connessione'
    }
  },

  parseJwt(token) {
    try {
      return JSON.parse(atob(token.split('.')[1]))
    } catch (e) {
      return null
    }
  }
 }
}

</script>
