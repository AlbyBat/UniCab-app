<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 px-4">
    <div class="max-w-md w-full bg-white p-8 rounded shadow">
      <h2 class="text-3xl text-gray-700 font-bold mb-6 text-center">Registrati</h2>
      <form @submit.prevent="register" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">Username</label>
          <input v-model="username" type="text" required class="w-full px-3 py-2 border border-black rounded" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Email</label>
          <input v-model="email" type="email" required class="w-full px-3 py-2 border border-black rounded" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Password</label>
          <input v-model="password" type="password" required class="w-full px-3 py-2 border border-black rounded" />
        </div>

        <div class="flex items-center gap-2">
          <input id="isDriver" v-model="isDriver" type="checkbox" />
          <label for="isDriver" class="text-sm text-gray-700">Registrati come autista</label>
        </div>

        <div v-if="isDriver">
          <label class="block text-sm font-medium text-gray-700">Numero patente</label>
          <input v-model="driverLicense" type="text" required class="w-full px-3 py-2 border border-black rounded" />
        </div>

        <button type="submit" class="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition">
          Registrati
        </button>

        <div class="text-center text-sm text-gray-600 mt-2">
          Hai già un account?
          <router-link to="/login" class="text-indigo-600 hover:underline">Accedi</router-link>
        </div>

        <p v-if="errorMsg" class="text-center text-red-600">{{ errorMsg }}</p>

        <div class="mt-6 border-t pt-4">
          <p class="text-center text-sm text-gray-500 mb-2">Oppure</p>
          <button @click="googleLogin" type="button" class="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded">
            Accedi con Google
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const username = ref('')
const email = ref('')
const password = ref('')
const isDriver = ref(false)
const driverLicense = ref('')
const errorMsg = ref('')
const router = useRouter()

const register = async () => {
  errorMsg.value = ''
  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: username.value,
        email: email.value,
        password: password.value,
        isDriver: isDriver.value,
        driverLicense: isDriver.value ? driverLicense.value : undefined
      })
    })

    const data = await res.json()

    if (res.ok) {
      alert('Registrazione completata!')
      router.push('/login') // o login automatico
    } else {
      errorMsg.value = data.message || 'Errore nella registrazione'
    }
  } catch (err) {
    errorMsg.value = 'Errore di connessione'
  }
}

const googleLogin = () => {
  window.location.href = '/api/auth/google'
}
</script>

<style scoped>
</style>
