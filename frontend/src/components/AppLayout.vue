<template>
  <div class="flex h-screen bg-gray-100">

    <!-- Sidebar -->
    <aside class="w-64 bg-[#1a3c6e] text-white flex flex-col">
      <!-- Logo Area -->
      <div class="p-5 border-b border-blue-800">
        <div class="flex items-center gap-3">
          <div class="bg-yellow-400 text-blue-900 font-bold rounded-full w-10 h-10 flex items-center justify-center text-sm">
            QC
          </div>
          <div>
            <p class="font-bold text-sm leading-tight">PESO</p>
            <p class="text-xs text-blue-300">Quezon City Hall</p>
          </div>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 p-4 space-y-1">
        <router-link to="/dashboard"
          class="flex items-center gap-3 px-4 py-3 rounded-lg text-sm hover:bg-blue-800 transition"
          active-class="bg-blue-700 font-semibold">
          📊 Dashboard
        </router-link>
        <router-link to="/jobseekers"
          class="flex items-center gap-3 px-4 py-3 rounded-lg text-sm hover:bg-blue-800 transition"
          active-class="bg-blue-700 font-semibold">
          👥 Jobseekers
        </router-link>
        <router-link to="/reminders"
          class="flex items-center gap-3 px-4 py-3 rounded-lg text-sm hover:bg-blue-800 transition"
          active-class="bg-blue-700 font-semibold">
          📧 Reminders
        </router-link>
      </nav>

      <!-- Logout -->
      <div class="p-4 border-t border-blue-800">
        <p class="text-xs text-blue-300 mb-2">{{ auth.user?.name }}</p>
        <button @click="handleLogout"
          class="w-full text-sm bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition">
          Logout
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 overflow-y-auto">
      <!-- Top Bar -->
      <header class="bg-white shadow px-6 py-4 flex items-center justify-between">
        <h1 class="text-lg font-bold text-gray-700">PESO Jobseeker Reminder System</h1>
        <span class="text-sm text-gray-500">{{ new Date().toDateString() }}</span>
      </header>

      <!-- Page Content -->
      <div class="p-6">
        <slot />
      </div>
    </main>

  </div>
</template>

<script setup>
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

const auth   = useAuthStore()
const router = useRouter()

async function handleLogout() {
  await auth.logout()
  router.push('/login')
}
</script>
