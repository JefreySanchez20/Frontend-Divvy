<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useGruposStore } from '../stores/useGruposStore'
import { useAuth } from '@/shared/composables/useAuth'
import MiembroList from '../components/MiembroList.vue'
import BaseInput from '@/shared/components/BaseInput.vue'
import BaseButton from '@/shared/components/BaseButton.vue'
import BaseAlert from '@/shared/components/BaseAlert.vue'
import AvatarInicial from '@/shared/components/AvatarInicial.vue'

const props = defineProps({ id: { type: String, required: true } })

const gruposStore = useGruposStore()
const { grupoActual, cargando } = storeToRefs(gruposStore)
const { currentUser } = useAuth()

const emailNuevoMiembro = ref('')
const agregando = ref(false)
const errorMiembro = ref('')

onMounted(() => gruposStore.cargarGrupo(props.id))

const miRol = computed(
  () => grupoActual.value?.members.find((m) => m.userId === currentUser.value?.id)?.role,
)
const esAdmin = computed(() => miRol.value === 'ADMIN')
const moneda = computed(() => gruposStore.obtenerMoneda(props.id))

async function onAgregarMiembro() {
  agregando.value = true
  errorMiembro.value = ''
  try {
    await gruposStore.agregarMiembroPorEmail(props.id, emailNuevoMiembro.value)
    emailNuevoMiembro.value = ''
  } catch (err) {
    errorMiembro.value = err.message
  } finally {
    agregando.value = false
  }
}

async function onEliminarMiembro(userId) {
  await gruposStore.eliminarMiembro(props.id, userId)
}

async function onArchivar() {
  const confirmado = window.confirm(
    'Un grupo archivado deja de aceptar nuevos gastos, pero conserva todo el historial. ¿Archivar este grupo?',
  )
  if (confirmado) await gruposStore.archivar(props.id)
}
</script>

<template>
  <div class="max-w-2xl mx-auto px-6 py-10">
    <RouterLink
      to="/grupos"
      class="inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-brand transition-colors mb-6"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M15 18l-6-6 6-6" />
      </svg>
      Tus grupos
    </RouterLink>

    <p v-if="cargando && !grupoActual" class="text-sm text-ink-faint">Cargando grupo…</p>

    <template v-else-if="grupoActual">
      <div class="flex items-start justify-between mb-1">
        <div class="flex items-center gap-3">
          <AvatarInicial :nombre="grupoActual.name" />
          <h1 class="text-xl font-semibold text-ink">{{ grupoActual.name }}</h1>
        </div>
        <span
          class="text-xs px-2 py-1 rounded"
          :class="grupoActual.status === 'ARCHIVED' ? 'bg-paper-dim text-ink-faint' : 'bg-haber-tint text-haber'"
        >
          {{ grupoActual.status === 'ARCHIVED' ? 'Archivado' : 'Activo' }}
        </span>
      </div>
      <p class="text-sm text-ink-faint mb-8 ml-12">Moneda: <span class="cifra">{{ moneda }}</span></p>

      <nav class="mb-8 space-y-2">
        <RouterLink
          :to="{ name: 'gastos', params: { id } }"
          class="flex items-center justify-between rounded-md border border-paper-line px-4 py-3 text-sm text-ink hover:border-brand hover:text-brand transition-colors"
        >
          Gastos del grupo
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 6l6 6-6 6" />
          </svg>
        </RouterLink>
        <RouterLink
          :to="{ name: 'liquidaciones', params: { id } }"
          class="flex items-center justify-between rounded-md border border-paper-line px-4 py-3 text-sm text-ink hover:border-brand hover:text-brand transition-colors"
        >
          Quién le debe a quién
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 6l6 6-6 6" />
          </svg>
        </RouterLink>
      </nav>

      <section class="mb-8">
        <h2 class="text-sm font-medium text-ink-soft mb-3">Miembros</h2>
        <MiembroList
          :members="grupoActual.members"
          :puede-eliminar="esAdmin && grupoActual.status !== 'ARCHIVED'"
          @eliminar="onEliminarMiembro"
        />
      </section>

      <section v-if="esAdmin && grupoActual.status !== 'ARCHIVED'" class="mb-8">
        <h2 class="text-sm font-medium text-ink-soft mb-3">Agregar miembro</h2>
        <form class="flex items-end gap-3" @submit.prevent="onAgregarMiembro">
          <div class="flex-1">
            <BaseInput
              v-model="emailNuevoMiembro"
              label="Email de un usuario ya registrado"
              type="email"
              required
            />
          </div>
          <BaseButton type="submit" class="w-auto" :disabled="agregando">
            {{ agregando ? 'Agregando…' : 'Agregar' }}
          </BaseButton>
        </form>
        <BaseAlert v-if="errorMiembro" variant="error" class="mt-3">{{ errorMiembro }}</BaseAlert>
      </section>

      <section v-if="grupoActual.status !== 'ARCHIVED'" class="border-t border-paper-line pt-6">
        <template v-if="esAdmin">
          <BaseButton variant="secondary" class="w-auto" @click="onArchivar">
            Archivar grupo
          </BaseButton>
          <p class="text-xs text-ink-faint mt-2">
            Un grupo archivado deja de aceptar gastos nuevos, pero conserva todo el historial.
            Divvy no permite borrar grupos de forma permanente.
          </p>
        </template>
        <p v-else class="text-xs text-ink-faint">
          Solo un admin del grupo puede archivarlo o quitar miembros.
        </p>
      </section>
    </template>
  </div>
</template>
