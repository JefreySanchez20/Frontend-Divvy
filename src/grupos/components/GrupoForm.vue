<script setup>
import { reactive, ref } from 'vue'
import { useGruposStore } from '../stores/useGruposStore'
import BaseInput from '@/shared/components/BaseInput.vue'
import BaseButton from '@/shared/components/BaseButton.vue'
import BaseAlert from '@/shared/components/BaseAlert.vue'

const emit = defineEmits(['creado'])

const gruposStore = useGruposStore()
const form = reactive({ name: '', moneda: 'PEN' })
const enviando = ref(false)
const error = ref('')

async function onSubmit() {
  enviando.value = true
  error.value = ''
  try {
    const grupo = await gruposStore.crear({ ...form })
    form.name = ''
    emit('creado', grupo)
  } catch (err) {
    error.value = err.message
  } finally {
    enviando.value = false
  }
}
</script>

<template>
  <form class="space-y-4 border-b border-paper-line pb-6 mb-6" @submit.prevent="onSubmit">
    <div class="flex flex-col sm:flex-row gap-3 sm:items-end">
      <div class="flex-1">
        <BaseInput v-model="form.name" label="Nombre del grupo" required />
      </div>
      <label class="block sm:w-32">
        <span class="block text-sm text-ink-soft mb-1.5">Moneda</span>
        <select
          v-model="form.moneda"
          class="w-full rounded-md border border-paper-line bg-paper px-3 py-2.5 text-sm text-ink outline-none focus:border-brand"
        >
          <option value="PEN">PEN</option>
          <option value="USD">USD</option>
          <option value="EUR">EUR</option>
        </select>
      </label>
      <BaseButton type="submit" class="w-full sm:w-auto" :disabled="enviando">
        {{ enviando ? 'Creando…' : 'Crear grupo' }}
      </BaseButton>
    </div>
    <p class="text-xs text-ink-faint">
      La moneda queda fija para todos los gastos de este grupo.
    </p>
    <BaseAlert v-if="error" variant="error">{{ error }}</BaseAlert>
  </form>
</template>
