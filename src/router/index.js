import Vue from 'vue'
import VueRouter from 'vue-router'
import store from '@/stores'
import LoginView from '@/views/auth/LoginView.vue'
import RegisterView from '@/views/auth/RegisterView.vue'
import InitializeView from '@/views/pages/InitializeView.vue'
import DashboardView from '@/views/dashboard/DashboardView.vue'
import HomeView from '@/views/dashboard/HomeView.vue'
import DPIView from '@/views/dashboard/DPIView.vue'
import KeysView from '@/views/dashboard/KeysView.vue'
import SensorView from '@/views/dashboard/SensorView.vue'
import RGBView from '@/views/dashboard/RGBView.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    meta: { requiresGuest: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterView,
    meta: { requiresGuest: true }
  },
  {
    path: '/initialize',
    name: 'Initialize',
    component: InitializeView,
    meta: { requiresAuth: true }
  },
  {
    path: '/dashboard',
    component: DashboardView,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: 'home'
      },
      {
        path: 'home',
        name: 'Home',
        component: HomeView
      },
      {
        path: 'dpi',
        name: 'DPI',
        component: DPIView
      },
      {
        path: 'keys',
        name: 'Keys',
        component: KeysView
      },
      {
        path: 'sensor',
        name: 'Sensor',
        component: SensorView
      },
      {
        path: 'rgb',
        name: 'RGB',
        component: RGBView
      }
    ]
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

router.beforeEach(async (to, from, next) => {
  const isAuthenticated = store.getters['auth/isAuthenticated']
  
  // Handle routes that require authentication
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!isAuthenticated) {
      next('/login')
      return
    }
  }
  
  // Handle routes that require guest (not authenticated)
  if (to.matched.some(record => record.meta.requiresGuest)) {
    if (isAuthenticated) {
      const isConnected = store.getters['device/isConnected']
      next(isConnected ? '/dashboard/home' : '/initialize')
      return
    }
  }
  
  next()
})

export default router 