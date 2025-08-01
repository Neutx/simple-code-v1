import Vue from 'vue'
import VueRouter from 'vue-router'
import store from '@/stores'
import HIDHandle from '@/assets/js/HIDHandle' // Import HIDHandle
import LoginView from '@/views/auth/LoginView.vue'
import RegisterView from '@/views/auth/RegisterView.vue'
import ForgotPasswordView from '@/views/auth/ForgotPasswordView.vue'
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
    name: 'login',
    component: LoginView,
    meta: { requiresGuest: true }
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView,
    meta: { requiresGuest: true }
  },
  {
    path: '/forgot-password',
    name: 'forgot-password',
    component: ForgotPasswordView,
    meta: { requiresGuest: true }
  },
  {
    path: '/initialize',
    name: 'Initialize',
    component: InitializeView
  },
  {
    path: '/dashboard',
    component: DashboardView,
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

// Enhanced navigation guard that waits for auth initialization
router.beforeEach((to, from, next) => {
  const isAuthenticated = store.getters['auth/isAuthenticated']
  const isInitialized = store.getters['auth/initialized']
  
  // Check device connection more comprehensively
  const device = HIDHandle.deviceInfo
  const isConnecting = store.getters['device/isConnecting']
  const isDeviceConnected = device.deviceOpen && (device.isWired || device.online)

  // If trying to access dashboard routes without a properly connected device, redirect to initialize
  if (to.path.startsWith('/dashboard') && !isDeviceConnected) {
    // If a connection is in progress, wait for it to complete
    if (isConnecting) {
      const unwatch = store.watch(
        () => store.getters['device/isConnecting'],
        (connecting) => {
          if (!connecting) {
            unwatch()
            // Re-evaluate the guard after connection attempt
            router.push(to.path).catch(err => {
              if (err.name !== 'NavigationDuplicated' && err.name !== 'NavigationRedirected') {
                console.error(err)
              }
            })
          }
        }
      )
      return // Wait for the watch to trigger
    }

    console.log("🔄 Navigation guard: Device not connected, redirecting to /initialize", {
      deviceOpen: device.deviceOpen,
      isWired: device.isWired,
      online: device.online,
      to: to.path
    })
    next('/initialize')
    return
  }
  
  // Allow authenticated users to access initialize page (for device reconnection)
  if (to.path === '/initialize' && isAuthenticated) {
    next()
    return
  }
  
  // If auth is not initialized yet, wait for it
  if (!isInitialized) {
    const unwatch = store.watch(
      () => store.getters['auth/initialized'],
      (initialized) => {
        if (initialized) {
          unwatch()
          // Re-run the navigation guard logic once initialized
          const isAuth = store.getters['auth/isAuthenticated']
          
          // Allow navigation to login/register if not authenticated
          if (!isAuth && (to.path === '/login' || to.path === '/register' || to.path === '/forgot-password')) {
            next()
            return
          }
          
          // Redirect to login if not authenticated and trying to access protected routes
          if (!isAuth && to.path !== '/login' && to.path !== '/register' && to.path !== '/forgot-password') {
            next('/login')
            return
          }
          
          // If authenticated and trying to go to login/register, redirect to dashboard (but only if device is connected)
          if (isAuth && (to.path === '/login' || to.path === '/register' || to.path === '/forgot-password')) {
            if (isDeviceConnected) {
              next('/dashboard')
            } else {
              next('/initialize')
            }
            return
          }
          
          // Allow all other navigation
          next()
        }
      }
    )
    return
  }
  
  // Allow navigation to login/register if not authenticated
  if (!isAuthenticated && (to.path === '/login' || to.path === '/register' || to.path === '/forgot-password')) {
    next()
    return
  }
  
  // Redirect to login if not authenticated and trying to access protected routes
  if (!isAuthenticated && to.path !== '/login' && to.path !== '/register' && to.path !== '/forgot-password') {
    next('/login')
    return
  }
  
  // If authenticated and trying to go to login/register, redirect to dashboard (but only if device is connected)
  if (isAuthenticated && (to.path === '/login' || to.path === '/register' || to.path === '/forgot-password')) {
    if (isDeviceConnected) {
      next('/dashboard')
    } else {
      next('/initialize')
    }
    return
  }
  
  // Allow all other navigation
  next()
})

router.onError(error => {
  // The "Redirected" error is expected when our navigation guards redirect.
  // It's not a real error, so we can safely ignore it.
  if (/Redirected when going from/.test(error.message) || error.name === 'NavigationDuplicated') {
    return;
  }
  
  // Log all other router errors that we don't expect
  console.error('Unhandled Router Error:', error);
});

export default router 