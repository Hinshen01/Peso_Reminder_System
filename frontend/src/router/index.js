import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

import LoginView      from '../views/LoginView.vue'
import DashboardView  from '../views/DashboardView.vue'
import JobseekersView from '../views/JobseekersView.vue'
import RemindersView  from '../views/RemindersView.vue'

const routes = [
  { path: '/',           redirect: '/dashboard' },
  { path: '/login',      component: LoginView, meta: { guest: true } },
  { path: '/dashboard',  component: DashboardView,  meta: { requiresAuth: true } },
  { path: '/jobseekers', component: JobseekersView, meta: { requiresAuth: true } },
  { path: '/reminders',  component: RemindersView,  meta: { requiresAuth: true } },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard
router.beforeEach((to, from, next) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    next('/login')
  } else if (to.meta.guest && auth.isLoggedIn) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
