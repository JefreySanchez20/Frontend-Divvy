<script setup>
import { computed, reactive } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuth } from '@/shared/composables/useAuth'
import BaseInput from '@/shared/components/BaseInput.vue'
import BaseButton from '@/shared/components/BaseButton.vue'
import BaseAlert from '@/shared/components/BaseAlert.vue'
import BrandMark from '@/shared/components/BrandMark.vue'

const router = useRouter()
const { registrar, cargando, error } = useAuth()

const form = reactive({ name: '', email: '', password: '', confirmarPassword: '' })

const errorPassword = computed(() => {
  if (!form.password) return ''
  return form.password.length >= 8 ? '' : 'La contraseña debe tener al menos 8 caracteres.'
})

const errorConfirmacion = computed(() => {
  if (!form.confirmarPassword) return ''
  return form.password === form.confirmarPassword ? '' : 'Las contraseñas no coinciden.'
})

async function onSubmit() {
  if (errorPassword.value || errorConfirmacion.value) return
  try {
    await registrar({ name: form.name, email: form.email, password: form.password })
    router.push({ name: 'login', query: { registrado: '1' } })
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
        <p class="text-sm text-ink-soft">Crea tu cuenta para empezar a dividir gastos.</p>
      </div>

      <form class="space-y-4" @submit.prevent="onSubmit">
        <BaseInput v-model="form.name" label="Nombre" autocomplete="name" required />
        <BaseInput v-model="form.email" label="Email" type="email" autocomplete="email" required />
        <BaseInput
          v-model="form.password"
          label="Contraseña"
          type="password"
          autocomplete="new-password"
          :error="errorPassword"
          required
        />
        <BaseInput
          v-model="form.confirmarPassword"
          label="Confirma la contraseña"
          type="password"
          autocomplete="new-password"
          :error="errorConfirmacion"
          required
        />

        <BaseAlert v-if="error" variant="error">{{ error }}</BaseAlert>

        <div class="pt-2">
          <BaseButton type="submit" class="w-full" :disabled="cargando">
            {{ cargando ? 'Creando cuenta…' : 'Crear cuenta' }}
          </BaseButton>
        </div>
      </form>

      <p class="mt-8 text-sm text-ink-soft">
        ¿Ya tienes cuenta?
        <RouterLink to="/login" class="text-brand font-medium hover:text-brand-dim">
          Entra
        </RouterLink>
      </p>
    </div>
  </div>
</template>
