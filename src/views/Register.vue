<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 px-4">
    <div class="max-w-md w-full bg-white p-8 rounded shadow">
      <h2 class="text-3xl text-gray-700 font-bold mb-6 text-center">Registrati</h2>
      <form @submit.prevent="register" class="space-y-6">
        <div>
          <label for="username" class="block text-sm font-medium text-gray-700">Username</label>
          <input
            id="username"
            v-model="username"
            type="text"
            required
            class="mt-2 block w-full rounded border border-gray-300 text-gray-600 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            class="mt-2 block w-full rounded border border-gray-300 text-gray-600 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <button
          type="submit"
          class="mt-4 w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition"
        >
          Registrati
        </button>
      </form>

      <p class="mt-4 text-center text-sm text-gray-600">
        Hai già un account?
        <router-link to="/login" class="text-indigo-600 hover:underline">Accedi</router-link>
      </p>

      <p v-if="errorMsg" class="mt-4 text-center text-red-600">{{ errorMsg }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const username = ref('')
const password = ref('')
const errorMsg = ref('')
const router = useRouter()

const register = async () => {
  errorMsg.value = ''
  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username.value, password: password.value })
    })

    const data = await res.json()
    if (res.ok && data.token) {
      localStorage.setItem('token', data.token)
      router.push('/home')
    } else {
      errorMsg.value = data.message || 'Errore nella registrazione'
    }
  } catch (err) {
    errorMsg.value = 'Errore di connessione'
  }
}
</script>
