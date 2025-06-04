<script setup>
import { onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

onMounted(() => {
  const token = route.query.token
  if (token) {
    localStorage.setItem('token', token)
    try {
      const user = JSON.parse(atob(token.split('.')[1]))
      localStorage.setItem('user', JSON.stringify(user))
    } catch {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      router.push('/login')
      return
    }

    const localUser = JSON.parse(localStorage.getItem('user'))
    if (localUser?.userId) {
      router.push(`/home/${localUser.userId}`)  
    } else {
      router.push('/login')
    }
  } else {
    router.push('/login')
  }
})
</script>

<template>
  <div class="flex justify-center items-center min-h-screen">
    <p>Caricamento in corso...</p>
  </div>
</template>
