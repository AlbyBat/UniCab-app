<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-4">Gestione Viaggi</h1>

    <div v-if="loading" class="text-gray-500">Caricamento viaggi...</div>
    <div v-else-if="error" class="text-red-500">Errore: {{ error }}</div>
    
    <div v-else>
      <div v-if="rides.length === 0">Nessun viaggio trovato.</div>
      <div v-for="ride in rides" :key="ride._id" class="border rounded p-4 mb-4 shadow-md">
        <div class="flex justify-between items-center">
          <div>
            <p><strong>Da:</strong> {{ ride.startPoint.address }}</p>
            <p><strong>A:</strong> {{ ride.endPoint.address }}</p>
            <p><strong>Partenza:</strong> {{ formatDate(ride.departureTime) }}</p>
            <p><strong>Posti disponibili:</strong> {{ ride.availableSeats }}</p>
            <p><strong>Prezzo:</strong> €{{ ride.price }}</p>
            <p><strong>Status:</strong> <span :class="statusClass(ride.status)">{{ ride.status }}</span></p>
            <p><strong>Autista:</strong> {{ ride.driver.name }} </p>
          </div>
          <div class="space-x-2">
            <button @click="markAsCompleted(ride._id)" class="bg-green-600 text-white px-3 py-1 rounded">Completato</button>
            <button @click="deleteRide(ride._id)" class="bg-red-600 text-white px-3 py-1 rounded">Elimina</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const rides = ref([]);
const loading = ref(true);
const error = ref(null);

async function fetchRides() {
  try {
    const response = await fetch('https://unicab-api.onrender.com/api/rides');
    if (!response.ok) throw new Error('Errore nel recupero dei viaggi');
    const data = await response.json();
    rides.value = data;
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
}

async function markAsCompleted(rideId) {
  try {
    const res = await fetch(`https://unicab-api.onrender.com/api/rides/complete/${rideId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      }
    });
    if (!res.ok) throw new Error('Errore nel completare il viaggio');
    await fetchRides();
  } catch (err) {
    alert(err.message);
  }
}

async function deleteRide(rideId) {
  const confirmed = confirm('Sei sicuro di voler eliminare questo viaggio?');
  if (!confirmed) return;

  try {
    const res = await fetch(`https://unicab-api.onrender.com/api/rides/${rideId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!res.ok) throw new Error('Errore nell\'eliminazione del viaggio');
    rides.value = rides.value.filter(r => r._id !== rideId);
  } catch (err) {
    alert(err.message);
  }
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString();
}

function statusClass(status) {
  switch (status) {
    case 'pending': return 'text-yellow-600';
    case 'active': return 'text-blue-600';
    case 'completed': return 'text-green-600';
    case 'cancelled': return 'text-red-600';
    default: return '';
  }
}

onMounted(() => {
  fetchRides();
});
</script>

<style scoped>
</style>
