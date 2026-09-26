<script setup>
import { computed, ref, useId } from 'vue'

const props = defineProps({
  modelValue: { type: String, default: '' },
  label: { type: String, required: true },
  type: { type: String, default: 'text' },
  autocomplete: { type: String, default: 'off' },
  error: { type: String, default: '' },
  required: { type: Boolean, default: false },
})
defineEmits(['update:modelValue'])

const esPassword = props.type === 'password'
const mostrarPassword = ref(false)
const tipoReal = computed(() => (esPassword && mostrarPassword.value ? 'text' : props.type))
const inputId = useId()
const errorId = useId()
</script>

<template>
  <div>
    <label :for="inputId" class="block text-sm text-ink-soft mb-1.5">{{ label }}</label>
    <div class="relative">
      <input
        :id="inputId"
        :type="tipoReal"
        :value="modelValue"
        :autocomplete="autocomplete"
        :required="required"
        :aria-describedby="error ? errorId : undefined"
        class="w-full rounded-md border bg-paper px-3 py-2.5 text-sm text-ink placeholder:text-ink-faint outline-none transition-colors"
        :class="[error ? 'border-debe' : 'border-paper-line focus:border-brand', esPassword ? 'pr-10' : '']"
        @input="$emit('update:modelValue', $event.target.value)"
      />
      <button
        v-if="esPassword"
        type="button"
        class="absolute inset-y-0 right-0 flex items-center px-3 text-ink-faint hover:text-ink-soft"
        :aria-label="mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
        tabindex="-1"
        @click="mostrarPassword = !mostrarPassword"
      >
        <svg v-if="mostrarPassword" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
        <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 3l18 18" />
          <path d="M10.6 10.6a3 3 0 0 0 4.24 4.24" />
          <path d="M6.6 6.6C4.2 8.1 2 12 2 12s3.5 7 10 7c1.7 0 3.15-.47 4.35-1.15M17.9 17.9C20.1 16.3 22 12 22 12s-1.05-2.1-3.05-3.9" />
        </svg>
      </button>
    </div>
    <span v-if="error" :id="errorId" class="block text-sm text-debe mt-1.5">{{ error }}</span>
  </div>
</template>
