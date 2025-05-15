<template>
  <div>
    <h2>Registrazione</h2>
    <form @submit.prevent="register">
      <input v-model="username" placeholder="Username" required />
      <input v-model="password" type="password" placeholder="Password" required />
      <button type="submit">Registrati</button>
    </form>
    <p>Hai già un account? <router-link to="/login">Accedi</router-link></p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const username = ref('');
const password = ref('');
const router = useRouter();

const register = async () => {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: username.value, password: password.value })
  });

  const data = await res.json();
  if (data.token) {
    localStorage.setItem('token', data.token);
    router.push('/home');
  } else {
    alert(data.message || 'Errore nella registrazione');
  }
};
</script>
