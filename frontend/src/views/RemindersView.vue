<template>
  <AppLayout>
    <h2 class="text-xl font-bold text-gray-800 mb-6">Send Reminders</h2>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

      <div class="bg-white rounded-xl shadow p-5">
        <h3 class="font-semibold text-gray-700 mb-4">Compose Reminder</h3>
        <div class="space-y-3">
          <div>
            <label class="text-xs font-medium text-gray-600">Select Jobseeker</label>
            <select v-model="form.jobseeker_id" class="input-field mt-1">
              <option value="">-- Select Jobseeker --</option>
              <option v-for="j in jobseekers" :key="j.id" :value="j.id">
                {{ j.full_name }} ({{ j.email }})
              </option>
            </select>
          </div>
          <div>
            <label class="text-xs font-medium text-gray-600">Reminder Type</label>
            <select v-model="form.type" @change="handleTypeChange" class="input-field mt-1">
              <option value="missing_docs">Missing Documents</option>
              <option value="interview">Interview Schedule</option>
              <option value="general">General Reminder</option>
            </select>
          </div>
          <div>
            <label class="text-xs font-medium text-gray-600">Subject</label>
            <input v-model="form.subject" class="input-field mt-1" placeholder="Email subject" />
          </div>
          <div>
            <label class="text-xs font-medium text-gray-600">Message</label>
            <textarea v-model="form.message" rows="5" class="input-field mt-1"
              placeholder="Type your message here..."></textarea>
          </div>
          <p v-if="successMsg" class="text-green-600 text-sm font-medium">{{ successMsg }}</p>
          <p v-if="errorMsg"   class="text-red-500 text-sm font-medium">{{ errorMsg }}</p>
          <button @click="sendReminder" :disabled="sending"
            class="w-full bg-[#1a3c6e] text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-900 transition disabled:opacity-50">
            {{ sending ? 'Sending...' : '📧 Send Reminder' }}
          </button>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow p-5">
        <h3 class="font-semibold text-gray-700 mb-4">Reminder History</h3>
        <div class="space-y-3 max-h-[500px] overflow-y-auto">
          <div v-for="r in reminders" :key="r.id"
            class="border rounded-lg p-3 text-sm">
            <div class="flex justify-between items-start">
              <div>
                <p class="font-medium text-gray-800">{{ r.jobseeker?.full_name || 'Unknown Jobseeker' }}</p>
                <p class="text-gray-500 text-xs mt-0.5">{{ r.subject }}</p>
              </div>
              <span :class="r.status === 'sent' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'"
                class="text-xs px-2 py-0.5 rounded-full font-medium capitalize">
                {{ r.status || 'pending' }}
              </span>
            </div>
            <p class="text-gray-400 text-xs mt-2">{{ formatDate(r.sent_at) }}</p>
          </div>
          <p v-if="reminders.length === 0" class="text-gray-400 text-sm text-center py-4">
            No reminders sent yet.
          </p>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AppLayout from '../components/AppLayout.vue'
import api from '../axios'

const jobseekers = ref([])
const reminders  = ref([])
const sending    = ref(false)
const successMsg = ref('')
const errorMsg   = ref('')

const form = ref({
  jobseeker_id: '',
  type:    'missing_docs',
  subject: '',
  message: '',
})

const templates = {
  missing_docs: {
    subject: 'Action Required: Missing Documents – PESO Quezon City',
    message: `Dear Jobseeker,\n\nThis is a reminder from PESO Quezon City that your application has missing documents.\n\nPlease submit the required documents at the PESO office as soon as possible to continue processing your application.\n\nThank you.\n\nPESO Quezon City Hall`,
  },
  interview: {
    subject: 'Interview Schedule Notice – PESO Quezon City',
    message: `Dear Jobseeker,\n\nWe are pleased to inform you that you have been scheduled for an interview.\n\nPlease visit the PESO office or await further communication for the exact date and time.\n\nThank you.\n\nPESO Quezon City Hall`,
  },
  general: {
    subject: 'Important Notice – PESO Quezon City',
    message: `Dear Jobseeker,\n\nThis is a reminder from PESO Quezon City regarding your application.\n\nPlease contact our office for more details.\n\nThank you.\n\nPESO Quezon City Hall`,
  },
}

function applyTemplate() {
  const t = templates[form.value.type]
  if (t) {
    form.value.subject = t.subject
    form.value.message = t.message
  }
}

function handleTypeChange() {
  // Warn user if overwriting custom message body context inputs
  if (form.value.message.trim() !== '') {
    if (!confirm('Discard your current message draft to apply the alternative layout template?')) {
      return
    }
  }
  applyTemplate()
}

function formatDate(dateString) {
  if (!dateString) return 'Timestamp unavailable'
  const parsed = new Date(dateString)
  return isNaN(parsed.getTime()) ? dateString : parsed.toLocaleString()
}

async function fetchReminders() {
  try {
    const res = await api.get('/reminders')
    reminders.value = res.data || []
  } catch (e) {
    console.error('Failed to sync system outbox history log stack:', e)
  }
}

async function sendReminder() {
  successMsg.value = ''
  errorMsg.value   = ''

  if (!form.value.jobseeker_id) {
    errorMsg.value = 'Please select a jobseeker.'
    return
  }

  sending.value = true
  try {
    await api.post('/reminders/send', form.value)
    successMsg.value = 'Reminder dispatched successfully!'

    // Reset Form Input State Parameters safely
    form.value.jobseeker_id = ''
    applyTemplate()

    await fetchReminders()
  } catch (e) {
    if (e.response && e.response.data && e.response.data.message) {
      errorMsg.value = e.response.data.message
    } else {
      errorMsg.value = 'Failed to send reminder. Check your SMTP configuration parameters.'
    }
  } finally {
    sending.value = false
  }
}

onMounted(async () => {
  applyTemplate()
  try {
    const [jobRes] = await Promise.all([
      api.get('/jobseekers'),
      fetchReminders(),
    ])
    jobseekers.value = jobRes.data || []
  } catch (error) {
    console.error('Core configuration initialization breakdown:', error)
  }
})
</script>

<style scoped>
.input-field {
  @apply w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400;
}
</style>
