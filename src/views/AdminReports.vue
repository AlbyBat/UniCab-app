<template>
  <div class="min-h-screen bg-gray-100 p-6">

    <h1 class="text-3xl font-bold text-[#004d99] mb-6">Segnalazioni Utenti</h1>

    <div v-if="loadingReports" class="text-gray-600">Caricamento segnalazioni...</div>
    <div v-else-if="reports.length === 0" class="text-gray-500">Nessuna segnalazione trovata.</div>

    <div v-else class="space-y-4 mb-10">
      <div
        v-for="report in reports"
        :key="report._id"
        class="bg-white rounded-lg shadow-md p-4 flex flex-col md:flex-row md:items-center justify-between"
      >
        <div>
          <p class="text-sm text-gray-700"><strong>Segnalato:</strong> {{ report.reportedUser.name }} ({{ report.reportedUser.username }})</p>
          <p class="text-sm text-gray-700"><strong>Segnalato da:</strong> {{ report.reporterUser.name }} ({{ report.reporterUser.username }})</p>
          <p class="text-sm text-gray-700"><strong>Motivo:</strong> {{ report.reason }}</p>
          <p class="text-xs text-gray-400 mt-1">Segnalazione del: {{ formatDate(report.createdAt) }}</p>
        </div>
        <div class="mt-4 md:mt-0 md:ml-4 flex space-x-2">
          <button
            @click="deleteReport(report._id)"
            class="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded text-sm"
          >
            Elimina Segnalazione
          </button>
        </div>
      </div>
    </div>

 
    <h1 class="text-3xl font-bold text-[#004d99] mb-6">Ticket di Supporto</h1>

    <div v-if="loadingTickets" class="text-gray-600">Caricamento ticket...</div>
    <div v-else-if="tickets.length === 0" class="text-gray-500">Nessun ticket trovato.</div>

    <div v-else class="space-y-4">
      <div
        v-for="ticket in tickets"
        :key="ticket._id"
        class="bg-white rounded-lg shadow-md p-4"
      >
        <p><strong>Utente:</strong> {{ ticket.user.name }} ({{ ticket.user.username }})</p>
        <p><strong>Messaggio:</strong> {{ ticket.message }}</p>
        <p><strong>Stato:</strong> <span :class="statusClass(ticket.status)">{{ ticket.status }}</span></p>
        <p class="text-xs text-gray-400 mt-1">Creato il: {{ formatDate(ticket.createdAt) }}</p>

        <div v-if="ticket.response" class="mt-2 p-2 bg-green-50 border border-green-300 rounded">
          <p><strong>Risposta:</strong> {{ ticket.response }}</p>
        </div>

        <div v-else class="mt-2">
          <textarea
            v-model="responses[ticket._id]"
            rows="3"
            class="w-full p-2 border rounded mb-2"
            placeholder="Scrivi una risposta..."
          ></textarea>
          <button
            @click="sendResponse(ticket._id)"
            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Invia risposta
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {

      reports: [],
      loadingReports: true,
     
      tickets: [],
      loadingTickets: true,
      responses: {},  
    };
  },
  async mounted() {
    await Promise.all([this.fetchReports(), this.fetchTickets()]);
  },
  methods: {
    
    async fetchReports() {
      try {
        this.loadingReports = true;
        const token = localStorage.getItem('token');
        const res = await fetch('https://unicab-api.onrender.com/api/admin/reports', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Errore nel caricamento delle segnalazioni');
        const data = await res.json();
        this.reports = data;
      } catch (err) {
        alert(err.message);
      } finally {
        this.loadingReports = false;
      }
    },
    async deleteReport(id) {
      if (!confirm('Sei sicuro di voler eliminare questa segnalazione?')) return;
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`https://unicab-api.onrender.com/api/reports/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || 'Errore nella cancellazione');
        this.reports = this.reports.filter(r => r._id !== id);
        alert('Segnalazione eliminata con successo');
      } catch (err) {
        alert(err.message);
      }
    },

    async fetchTickets() {
      try {
        this.loadingTickets = true;
        const token = localStorage.getItem('token');
        const res = await fetch('https://unicab-api.onrender.com/api/tickets', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Errore nel caricamento dei ticket');
        const data = await res.json();
        this.tickets = data;
      } catch (err) {
        alert(err.message);
      } finally {
        this.loadingTickets = false;
      }
    },
    async sendResponse(ticketId) {
      const responseText = this.responses[ticketId];
      if (!responseText || responseText.trim() === '') {
        alert('La risposta non può essere vuota');
        return;
      }

      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`https://unicab-api.onrender.com/api/tickets/${ticketId}/respond`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ response: responseText, status: 'closed' })
        });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Errore nell\'invio della risposta');
        }
        const updatedTicket = await res.json();

        const idx = this.tickets.findIndex(t => t._id === ticketId);
        if (idx !== -1) this.tickets.splice(idx, 1, updatedTicket);

        this.responses[ticketId] = '';
        alert('Risposta inviata con successo');
      } catch (err) {
        alert(err.message);
      }
    },

    formatDate(dateStr) {
      const date = new Date(dateStr);
      return date.toLocaleDateString('it-IT', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    },

    statusClass(status) {
      switch (status) {
        case 'open': return 'text-yellow-600 font-semibold';
        case 'answered': return 'text-green-600 font-semibold';
        case 'closed': return 'text-gray-500 font-semibold';
        default: return '';
      }
    },
  },
};
</script>

<style scoped>
textarea {
  resize: vertical;
}
</style>
