<script setup>
import { onMounted, ref } from 'vue'
import { useGruposStore } from '../stores/useGruposStore'
import { storeToRefs } from 'pinia'
import GrupoCard from '../components/GrupoCard.vue'
import GrupoForm from '../components/GrupoForm.vue'
import BaseButton from '@/shared/components/BaseButton.vue'
import BaseAlert from '@/shared/components/BaseAlert.vue'

const gruposStore = useGruposStore()
const { grupos, cargando, error } = storeToRefs(gruposStore)
const mostrarForm = ref(false)

onMounted(() => gruposStore.cargarGrupos())

function onCreado() {
  mostrarForm.value = false
}
</script>

<template>
  <div class="max-w-2xl mx-auto px-6 py-10">
    <div class="flex items-center justify-between mb-8">
      <h1 class="text-xl font-semibold text-ink">Tus grupos</h1>
      <BaseButton
        v-if="!mostrarForm"
        variant="secondary"
        class="w-auto"
        @click="mostrarForm = true"
      >
        Nuevo grupo
      </BaseButton>
    </div>

    <GrupoForm v-if="mostrarForm" @creado="onCreado" />

    <BaseAlert v-if="error" variant="error" class="mb-6">{{ error }}</BaseAlert>

    <p v-if="cargando && !grupos.length" class="text-sm text-ink-faint">Cargando grupos…</p>

    <p v-else-if="!grupos.length && !error" class="text-sm text-ink-soft">
      Todavía no tienes grupos. Crea el primero para empezar a dividir gastos con tus amigos.
    </p>

    <div v-else>
      <GrupoCard v-for="grupo in grupos" :key="grupo.id" :grupo="grupo" />
    </div>
  </div>
</template>
