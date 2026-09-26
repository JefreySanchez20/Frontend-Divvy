<script setup>
import { reactive, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/shared/composables/useAuth'
import BaseInput from '@/shared/components/BaseInput.vue'
import BaseButton from '@/shared/components/BaseButton.vue'
import BaseAlert from '@/shared/components/BaseAlert.vue'
import BrandMark from '@/shared/components/BrandMark.vue'

const router = useRouter()
const route = useRoute()
const { iniciarSesion, cargando, error } = useAuth()

const form = reactive({ email: '', password: '' })

async function onSubmit() {
  try {
    await iniciarSesion({ ...form })
    router.push(route.query.redirect?.toString() ?? { name: 'grupos' })
  } catch {
    // el error ya queda expuesto vía el store
  }
}
</script>

<template>
  <div class="ledger-sheet min-h-screen flex items-center justify-center px-6 py-16 sm:pl-[132px] sm:pr-10">
    <div class="w-full max-w-sm">
      <div class="mb-10">
        <div class="flex items-center gap-3 mb-3">
          <BrandMark />
          <h1 class="text-2xl font-semibold text-brand tracking-tight">Divvy</h1>
        </div>
        <p class="text-sm text-ink-soft">Cuentas claras entre amigos.</p>
      </div>

      <form class="space-y-4" @submit.prevent="onSubmit">
        <BaseInput
          v-model="form.email"
          label="Email"
          type="email"
          autocomplete="email"
          required
        />
        <BaseInput
          v-model="form.password"
          label="Contraseña"
          type="password"
          autocomplete="current-password"
          required
        />

        <BaseAlert v-if="error" variant="error">{{ error }}</BaseAlert>
        <BaseAlert v-else-if="route.query.registrado" variant="info">
          Cuenta creada. Inicia sesión para continuar.
        </BaseAlert>
        <BaseAlert v-else-if="route.query.restablecida" variant="info">
          Contraseña actualizada. Inicia sesión con la nueva.
        </BaseAlert>

        <div class="pt-2">
          <BaseButton type="submit" class="w-full" :disabled="cargando">
            {{ cargando ? 'Entrando…' : 'Entrar' }}
          </BaseButton>
          <p v-if="cargando" class="mt-2 text-xs text-ink-faint">
            Puede tardar un poco si el servidor estaba inactivo.
          </p>
        </div>
      </form>

      <p class="mt-6 text-sm">
        <RouterLink to="/olvide-contrasena" class="text-ink-soft hover:text-brand transition-colors">
          ¿Olvidaste tu contraseña?
        </RouterLink>
      </p>

      <p class="mt-4 text-sm text-ink-soft">
        ¿No tienes cuenta?
        <RouterLink to="/registro" class="text-brand font-medium hover:text-brand-dim">
          Crea una
        </RouterLink>
      </p>
    </div>
  </div>
</template>
