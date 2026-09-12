import { createRouter, createWebHistory } from 'vue-router'
import { getToken } from '@/shared/services/tokenStorage'

const routes = [
  {
    path: '/',
    redirect: '/grupos',
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/auth/views/LoginView.vue'),
    meta: { publica: true },
  },
  {
    path: '/registro',
    name: 'registro',
    component: () => import('@/auth/views/RegistroView.vue'),
    meta: { publica: true },
  },
  {
    path: '/grupos',
    name: 'grupos',
    component: () => import('@/grupos/views/GruposListView.vue'),
  },
  {
    path: '/grupos/:id',
    name: 'grupo-detalle',
    component: () => import('@/grupos/views/GrupoDetailView.vue'),
    props: true,
  },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  const autenticado = Boolean(getToken())

  if (!to.meta.publica && !autenticado) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (to.meta.publica && autenticado) {
    return { name: 'grupos' }
  }

  return true
})
