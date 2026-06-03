<template>
  <div class="min-h-screen bg-[#1a3c6e] flex items-center justify-center px-4">
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">

      <!-- Header -->
      <div class="text-center mb-8">
        <div class="bg-yellow-400 text-blue-900 font-bold rounded-full w-16 h-16 flex items-center justify-center text-2xl mx-auto mb-3">
          QC
        </div>
        <h1 class="text-2xl font-bold text-gray-800">PESO Quezon City</h1>
        <p class="text-gray-500 text-sm mt-1">Jobseeker Reminder System</p>
      </div>

      <!-- Tabs -->
      <div class="flex gap-2 mb-6 border-b">
        <button @click="isLogin = true" :class="[
          'flex-1 py-2 text-sm font-semibold transition border-b-2',
          isLogin ? 'text-[#1a3c6e] border-[#1a3c6e]' : 'text-gray-500 border-transparent hover:text-gray-700'
        ]">
          Login
        </button>
        <button @click="isLogin = false" :class="[
          'flex-1 py-2 text-sm font-semibold transition border-b-2',
          !isLogin ? 'text-[#1a3c6e] border-[#1a3c6e]' : 'text-gray-500 border-transparent hover:text-gray-700'
        ]">
          Register
        </button>
      </div>

      <!-- Login Form -->
      <form v-if="isLogin" @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
          <input v-model="loginForm.email" type="email" placeholder="admin@peso.gov.ph" required
            class="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input v-model="loginForm.password" type="password" placeholder="••••••••" required
            class="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <!-- Error -->
        <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>

        <button type="submit" :disabled="loading"
          class="w-full bg-[#1a3c6e] hover:bg-blue-900 text-white font-semibold py-3 rounded-lg transition text-sm disabled:opacity-50">
          {{ loading ? 'Logging in...' : 'Login' }}
        </button>
      </form>

      <!-- Register Form -->
      <form v-else @submit.prevent="handleRegister" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input v-model="registerForm.name" type="text" placeholder="John Doe" required
            class="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
          <input v-model="registerForm.email" type="email" placeholder="user@peso.gov.ph" required
            class="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input v-model="registerForm.password" type="password" placeholder="••••••••" required minlength="6"
            class="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
          <input v-model="registerForm.password_confirmation" type="password" placeholder="••••••••" required minlength="6"
            class="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <!-- Error -->
        <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>

        <button type="submit" :disabled="loading"
          class="w-full bg-[#1a3c6e] hover:bg-blue-900 text-white font-semibold py-3 rounded-lg transition text-sm disabled:opacity-50">
          {{ loading ? 'Creating account...' : 'Register' }}
        </button>
      </form>

      <p class="text-center text-xs text-gray-400 mt-6">
        Powered by PESO — Quezon City Hall
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()
const isLogin = ref(true)
const error = ref('')
const loading = ref(false)

const loginForm = ref({
  email: '',
  password: ''
})

const registerForm = ref({
  name: '',
  email: '',
  password: '',
  password_confirmation: ''
})

async function handleLogin() {
  error.value = ''

  if (!loginForm.value.email || !loginForm.value.password) {
    error.value = 'Email and password are required.'
    return
  }

  loading.value = true
  try {
    await auth.login({
      email: loginForm.value.email,
      password: loginForm.value.password
    })
    router.push('/dashboard')
  } catch (e) {
    if (e.response && e.response.data && e.response.data.message) {
      error.value = e.response.data.message
    } else {
      error.value = 'Invalid email or password.'
    }
  } finally {
    loading.value = false
  }
}

async function handleRegister() {
  error.value = ''

  if (!registerForm.value.name || !registerForm.value.email || !registerForm.value.password || !registerForm.value.password_confirmation) {
    error.value = 'All fields are required.'
    return
  }

  if (registerForm.value.password !== registerForm.value.password_confirmation) {
    error.value = 'Passwords do not match.'
    return
  }

  if (registerForm.value.password.length < 6) {
    error.value = 'Password must be at least 6 characters.'
    return
  }

  loading.value = true
  try {
    await auth.register({
      name: registerForm.value.name,
      email: registerForm.value.email,
      password: registerForm.value.password,
      password_confirmation: registerForm.value.password_confirmation
    })
    router.push('/dashboard')
  } catch (e) {
    if (e.response && e.response.data && e.response.data.errors) {
      const errors = e.response.data.errors
      if (errors.email) {
        error.value = errors.email[0]
      } else if (errors.password) {
        error.value = errors.password[0]
      } else {
        error.value = 'Registration failed. Please try again.'
      }
    } else if (e.response && e.response.data && e.response.data.message) {
      error.value = e.response.data.message
    } else {
      error.value = 'Registration failed. Please try again.'
    }
  } finally {
    loading.value = false
  }
}
</script>
