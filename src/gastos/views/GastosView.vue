<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useGruposStore } from '@/grupos/stores/useGruposStore'
import { useGastosStore } from '../stores/useGastosStore'
import GastoForm from '../components/GastoForm.vue'
import GastoList from '../components/GastoList.vue'
import BaseButton from '@/shared/components/BaseButton.vue'
import BaseAlert from '@/shared/components/BaseAlert.vue'

const props = defineProps({ id: { type: String, required: true } })

const gruposStore = useGruposStore()
const gastosStore = useGastosStore()
const { grupoActual } = storeToRefs(gruposStore)
const { ordenados, cargando, error } = storeToRefs(gastosStore)

// null = form cerrado · 'nuevo' = registrando · objeto = editando ese gasto
const formulario = ref(null)
const errorAccion = ref('')

const archivado = computed(() => grupoActual.value?.status === 'ARCHIVED')
const moneda = computed(() => grupoActual.value?.currency ?? 'PEN')

onMounted(async () => {
  // El detalle del grupo trae los miembros que necesita el formulario.
  if (grupoActual.value?.id !== props.id) await gruposStore.cargarGrupo(props.id)
  await gastosStore.cargar(props.id)
})

function onGuardado() {
  formulario.value = null
}

async function onEliminar(gasto) {
  if (!window.confirm(`¿Eliminar "${gasto.description}"? Esto cambia lo que se debe cada persona.`)) return
  errorAccion.value = ''
  try {
    await gastosStore.eliminar(props.id, gasto.id)
  } catch (err) {
    errorAccion.value = err.message
  }
}
</script>

<template>
  <div class="max-w-2xl mx-auto px-6 py-10">
    <RouterLink
      :to="{ name: 'grupo-detalle', params: { id } }"
      class="inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-brand transition-colors mb-6"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M15 18l-6-6 6-6" />
      </svg>
      {{ grupoActual?.name ?? 'Grupo' }}
    </RouterLink>

    <div class="flex items-center justify-between mb-6">
      <h1 class="text-xl font-semibold text-ink">Gastos</h1>
      <BaseButton v-if="grupoActual && !archivado && !formulario" @click="formulario = 'nuevo'">
        Registrar gasto
      </BaseButton>
    </div>

    <section v-if="formulario && grupoActual" class="border-b border-paper-line pb-6 mb-6">
      <h2 class="text-sm font-medium text-ink-soft mb-4">
        {{ formulario === 'nuevo' ? 'Nuevo gasto' : 'Editar gasto' }}
      </h2>
      <GastoForm
        :key="formulario === 'nuevo' ? 'nuevo' : formulario.id"
        :group-id="id"
        :members="grupoActual.members"
        :moneda="moneda"
        :gasto="formulario === 'nuevo' ? null : formulario"
        @guardado="onGuardado"
        @cancelar="formulario = null"
      />
    </section>

    <BaseAlert v-if="archivado" variant="info" class="mb-6">
      Este grupo está archivado: puedes ver el historial, pero no registrar gastos nuevos.
    </BaseAlert>
    <BaseAlert v-if="error || errorAccion" variant="error" class="mb-6">{{ error || errorAccion }}</BaseAlert>

    <p v-if="cargando" class="text-sm text-ink-faint">Cargando gastos…</p>
    <p v-else-if="!ordenados.length && !error" class="text-sm text-ink-faint">
      Todavía no hay gastos en este grupo.
    </p>
    <GastoList
      v-else
      :gastos="ordenados"
      :puede-editar="!archivado"
      @editar="formulario = $event"
      @eliminar="onEliminar"
    />
  </div>
</template>
