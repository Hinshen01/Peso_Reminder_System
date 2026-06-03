<template>
  <AppLayout>
    <h2 class="text-xl font-bold text-gray-800 mb-6">Dashboard Overview</h2>

    <!-- Stat Cards -->
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
      <div v-for="card in statCards" :key="card.label"
        class="bg-white rounded-xl shadow p-4 text-center">
        <p class="text-3xl font-bold" :class="card.color">{{ stats[card.key] ?? '...' }}</p>
        <p class="text-xs text-gray-500 mt-1">{{ card.label }}</p>
      </div>
    </div>

    <!-- Recent Jobseekers -->
    <div class="bg-white rounded-xl shadow p-5">
      <h3 class="font-semibold text-gray-700 mb-4">Recent Jobseekers</h3>
      <table class="w-full text-sm">
        <thead>
          <tr class="text-left text-gray-500 border-b">
            <th class="pb-2">Name</th>
            <th class="pb-2">Position</th>
            <th class="pb-2">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="j in recentJobseekers" :key="j.id" class="border-b last:border-0">
            <td class="py-2">{{ j.full_name }}</td>
            <td class="py-2 text-gray-500">{{ j.position_applied }}</td>
            <td class="py-2">
              <span :class="statusClass(j.status)"
                class="px-2 py-0.5 rounded-full text-xs font-medium capitalize">
                {{ j.status }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AppLayout from '../components/AppLayout.vue'
import api from '../axios'

const stats = ref({})
const recentJobseekers = ref([])

const statCards = [
  { key: 'total',          label: 'Total',          color: 'text-blue-600' },
  { key: 'pending',        label: 'Pending',        color: 'text-yellow-500' },
  { key: 'complete',       label: 'Complete',       color: 'text-green-500' },
  { key: 'interview',      label: 'Interview',      color: 'text-purple-500' },
  { key: 'placed',         label: 'Placed',         color: 'text-teal-500' },
  { key: 'reminders_sent', label: 'Reminders Sent', color: 'text-red-500' },
]

function statusClass(status) {
  return {
    pending:   'bg-yellow-100 text-yellow-700',
    complete:  'bg-green-100 text-green-700',
    interview: 'bg-purple-100 text-purple-700',
    placed:    'bg-teal-100 text-teal-700',
  }[status] || 'bg-gray-100 text-gray-700'
}

onMounted(async () => {
  const [statsRes, jobRes] = await Promise.all([
    api.get('/dashboard/stats'),
    api.get('/jobseekers'),
  ])
  stats.value = statsRes.data
  recentJobseekers.value = jobRes.data.slice(0, 5)
})
</script>
