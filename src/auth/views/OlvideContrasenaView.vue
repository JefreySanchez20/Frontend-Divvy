<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuth } from '@/shared/composables/useAuth'
import AuthShell from '../components/AuthShell.vue'
import BaseInput from '@/shared/components/BaseInput.vue'
import BaseButton from '@/shared/components/BaseButton.vue'
import BaseAlert from '@/shared/components/BaseAlert.vue'

const { solicitarRecuperacion, cargando, error } = useAuth()

const email = ref('')
const enviado = ref(false)

async function onSubmit() {
  try {
    await solicitarRecuperacion(email.value.trim())
    enviado.value = true
  } catch {
    // el error ya queda expuesto vía el store
  }
}
</script>

<template>
  <AuthShell subtitulo="Te enviaremos un código para que elijas una contraseña nueva.">
    <template v-if="enviado">
      <BaseAlert variant="info">
        Si hay una cuenta con <strong class="font-medium">{{ email }}</strong>, te enviamos un
        código. Revisa tu correo, incluida la carpeta de spam. El código dura 30 minutos.
      </BaseAlert>
      <BaseButton class="mt-6" @click="$router.push({ name: 'restablecer-contrasena' })">
        Ya tengo el código
      </BaseButton>
      <p class="mt-4 text-sm text-ink-soft">
        ¿No llegó?
        <button type="button" class="text-brand font-medium hover:text-brand-dim" @click="enviado = false">
          Prueba de nuevo
        </button>
      </p>
    </template>

    <form v-else class="space-y-4" @submit.prevent="onSubmit">
      <BaseInput v-model="email" label="Email de tu cuenta" type="email" autocomplete="email" required />

      <BaseAlert v-if="error" variant="error">{{ error }}</BaseAlert>

      <div class="pt-2">
        <BaseButton type="submit" class="w-full" :disabled="cargando">
          {{ cargando ? 'Enviando…' : 'Enviarme el código' }}
        </BaseButton>
        <p v-if="cargando" class="mt-2 text-xs text-ink-faint">
          Puede tardar un poco si el servidor estaba inactivo.
        </p>
      </div>
    </form>

    <p class="mt-8 text-sm text-ink-soft">
      <RouterLink to="/login" class="text-brand font-medium hover:text-brand-dim">
        Volver a iniciar sesión
      </RouterLink>
    </p>
  </AuthShell>
</template>
