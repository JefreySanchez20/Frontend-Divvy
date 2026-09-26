<script setup>
import { computed, reactive } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuth } from '@/shared/composables/useAuth'
import AuthShell from '../components/AuthShell.vue'
import BaseInput from '@/shared/components/BaseInput.vue'
import BaseButton from '@/shared/components/BaseButton.vue'
import BaseAlert from '@/shared/components/BaseAlert.vue'

const router = useRouter()
const { restablecerPassword, cargando, error } = useAuth()

const form = reactive({ codigo: '', password: '', confirmarPassword: '' })

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
    await restablecerPassword({ codigo: form.codigo, nuevaPassword: form.password })
    router.push({ name: 'login', query: { restablecida: '1' } })
  } catch {
    // el error ya queda expuesto vía el store
  }
}
</script>

<template>
  <AuthShell subtitulo="Escribe el código que te llegó por correo y elige tu nueva contraseña.">
    <form class="space-y-4" @submit.prevent="onSubmit">
      <BaseInput v-model="form.codigo" label="Código de 6 caracteres" autocomplete="one-time-code" required />
      <BaseInput
        v-model="form.password"
        label="Contraseña nueva"
        type="password"
        autocomplete="new-password"
        :error="errorPassword"
        required
      />
      <BaseInput
        v-model="form.confirmarPassword"
        label="Confirma la contraseña nueva"
        type="password"
        autocomplete="new-password"
        :error="errorConfirmacion"
        required
      />

      <BaseAlert v-if="error" variant="error">{{ error }}</BaseAlert>

      <div class="pt-2">
        <BaseButton type="submit" class="w-full" :disabled="cargando">
          {{ cargando ? 'Guardando…' : 'Cambiar contraseña' }}
        </BaseButton>
      </div>
    </form>

    <p class="mt-8 text-sm text-ink-soft">
      ¿Necesitas otro código?
      <RouterLink to="/olvide-contrasena" class="text-brand font-medium hover:text-brand-dim">
        Pídelo aquí
      </RouterLink>
    </p>
  </AuthShell>
</template>
