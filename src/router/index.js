import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/auth/Login.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/auth/Register.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/Profile.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/users/:id',
    name: 'UserProfile',
    component: () => import('../views/UserProfile.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/players',
    name: 'Players',
    component: () => import('../views/Players.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/teams',
    name: 'Teams',
    component: () => import('../views/Teams.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/teams/:id',
    name: 'TeamDetail',
    component: () => import('../views/TeamDetail.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/my-team',
    name: 'MyTeam',
    component: () => import('../views/MyTeam.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/applications',
    name: 'Applications',
    component: () => import('../views/Applications.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/invitations',
    name: 'Invitations',
    component: () => import('../views/Invitations.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/chat',
    name: 'Chat',
    component: () => import('../views/Chat.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/notifications',
    name: 'Notifications',
    component: () => import('../views/Notifications.vue'),
    meta: { requiresAuth: true }
  },
  // Redirect to login for unknown routes for non-authenticated users
  {
    path: '/:pathMatch(.*)*',
    redirect: '/login'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  // Если маршрут требует авторизации, а пользователь не авторизован
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } 
  // Если маршрут требует гостя (логин/регистрация), а пользователь авторизован
  else if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next('/')
  } 
  // Во всех остальных случаях разрешаем переход
  else {
    next()
  }
})

router.afterEach(()=>{
  window.scrollTo(0,0)
})

export default router