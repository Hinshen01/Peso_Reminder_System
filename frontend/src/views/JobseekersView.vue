<template>
  <AppLayout>
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-xl font-bold text-gray-800">Jobseekers</h2>
      <button @click="showModal = true"
        class="bg-[#1a3c6e] text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-900 transition">
        + Add Jobseeker
      </button>
    </div>

    <input v-model="search" placeholder="Search by name or position..."
      class="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400" />

    <div class="bg-white rounded-xl shadow overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 text-gray-600">
          <tr>
            <th class="px-4 py-3 text-left">Name</th>
            <th class="px-4 py-3 text-left">Email</th>
            <th class="px-4 py-3 text-left">Position</th>
            <th class="px-4 py-3 text-left">Status</th>
            <th class="px-4 py-3 text-left">Docs</th>
            <th class="px-4 py-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="j in filteredJobseekers" :key="j.id" class="border-t hover:bg-gray-50">
            <td class="px-4 py-3 font-medium">{{ j.full_name }}</td>
            <td class="px-4 py-3 text-gray-500">{{ j.email }}</td>
            <td class="px-4 py-3">{{ j.position_applied }}</td>
            <td class="px-4 py-3">
              <span :class="statusClass(j.status)"
                class="px-2 py-0.5 rounded-full text-xs font-medium capitalize">
                {{ j.status }}
              </span>
            </td>
            <td class="px-4 py-3">
              <span :class="docsComplete(j) ? 'text-green-600' : 'text-red-500'" class="text-xs font-medium">
                {{ docsComplete(j) ? '✅ Complete' : '⚠️ Missing' }}
              </span>
            </td>
            <td class="px-4 py-3 flex gap-2">
              <button @click="viewJobseeker(j)"
                class="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200">
                View
              </button>
              <button @click="deleteJobseeker(j.id)"
                class="text-xs bg-red-100 text-red-600 px-3 py-1 rounded hover:bg-red-200">
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 px-4">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
        <h3 class="text-lg font-bold text-gray-800 mb-4">Add New Jobseeker</h3>
        <div class="space-y-3">
          <input v-model="form.full_name"       placeholder="Full Name"        class="input-field" />
          <input v-model="form.email"           placeholder="Email Address"    class="input-field" type="email" />
          <input v-model="form.contact_number"  placeholder="Contact Number"   class="input-field" />
          <input v-model="form.address"         placeholder="Address"          class="input-field" />
          <input v-model="form.position_applied" placeholder="Position Applied" class="input-field" />
        </div>
        <div class="flex gap-3 mt-5">
          <button @click="addJobseeker"
            class="flex-1 bg-[#1a3c6e] text-white py-2 rounded-lg text-sm hover:bg-blue-900">
            Save Jobseeker
          </button>
          <button @click="showModal = false"
            class="flex-1 bg-gray-100 text-gray-600 py-2 rounded-lg text-sm hover:bg-gray-200">
            Cancel
          </button>
        </div>
      </div>
    </div>

    <div v-if="selected" class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 px-4">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <h3 class="text-lg font-bold text-gray-800 mb-1">{{ selected.full_name }}</h3>
        <p class="text-sm text-gray-500 mb-4">{{ selected.email }} · {{ selected.contact_number }}</p>

        <div class="mb-4">
          <label class="text-xs font-medium text-gray-600">Update Status</label>
          <select v-model="selected.status" @change="updateStatus"
            class="w-full border rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400">
            <option value="pending">Pending</option>
            <option value="complete">Complete</option>
            <option value="interview">Interview</option>
            <option value="placed">Placed</option>
          </select>
        </div>

        <h4 class="font-semibold text-gray-700 mb-2 text-sm">Requirements</h4>
        <div class="space-y-2 mb-4">
          <div v-for="req in selected.requirements" :key="req.id"
            class="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
            <span class="text-sm">{{ req.requirement_name }}</span>
            <select v-model="req.status" @change="updateRequirement(req)"
              class="text-xs border rounded px-2 py-1 focus:outline-none">
              <option value="missing">Missing</option>
              <option value="submitted">Submitted</option>
              <option value="verified">Verified</option>
            </select>
          </div>
        </div>

        <button @click="selected = null"
          class="w-full bg-gray-100 text-gray-600 py-2 rounded-lg text-sm hover:bg-gray-200">
          Close
        </button>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AppLayout from '../components/AppLayout.vue'
import api from '../axios'

const jobseekers = ref([])
const showModal  = ref(false)
const selected   = ref(null)
const search     = ref('')

const form = ref({
  full_name: '', email: '', contact_number: '',
  address: '', position_applied: ''
})

const filteredJobseekers = computed(() => {
  const query = search.value.toLowerCase().trim()
  if (!query) return jobseekers.value

  return jobseekers.value.filter(j =>
    (j.full_name && j.full_name.toLowerCase().includes(query)) ||
    (j.position_applied && j.position_applied.toLowerCase().includes(query))
  )
})

function docsComplete(j) {
  if (!j.requirements || j.requirements.length === 0) return false
  return j.requirements.every(r => r.status === 'verified')
}

function statusClass(status) {
  return {
    pending:   'bg-yellow-100 text-yellow-700',
    complete:  'bg-green-100 text-green-700',
    interview: 'bg-purple-100 text-purple-700',
    placed:    'bg-teal-100 text-teal-700',
  }[status] || 'bg-gray-100 text-gray-700'
}

async function fetchJobseekers() {
  try {
    const res = await api.get('/jobseekers')
    jobseekers.value = res.data || []
  } catch (error) {
    console.error('Error loading jobseeker registry:', error)
  }
}

async function addJobseeker() {
  try {
    await api.post('/jobseekers', form.value)
    showModal.value = false
    form.value = { full_name: '', email: '', contact_number: '', address: '', position_applied: '' }
    await fetchJobseekers()
  } catch (error) {
    console.error('Error registering profile entry:', error)
  }
}

async function deleteJobseeker(id) {
  if (confirm('Delete this jobseeker?')) {
    try {
      await api.delete(`/jobseekers/${id}`)
      await fetchJobseekers()
    } catch (error) {
      console.error('Error purging registry item:', error)
    }
  }
}

function viewJobseeker(j) {
  // Use map to deeply clone individual child requirement objects safely
  const requirementsCopy = j.requirements
    ? j.requirements.map(r => ({ ...r }))
    : []

  selected.value = { ...j, requirements: requirementsCopy }
}

async function updateStatus() {
  try {
    await api.put(`/jobseekers/${selected.value.id}`, { status: selected.value.status })
    await fetchJobseekers()
  } catch (error) {
    console.error('Error syncing registration status update:', error)
  }
}

async function updateRequirement(req) {
  try {
    await api.put(`/requirements/${req.id}`, { status: req.status })
    // Re-fetch parent database records to keep document status checks matching
    await fetchJobseekers()
  } catch (error) {
    console.error('Error processing application documentation change:', error)
  }
}

onMounted(fetchJobseekers)
</script>

<style scoped>
.input-field {
  @apply w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400;
}
</style>
