<script setup>
import { computed } from 'vue'

const props = defineProps({
  nombre: { type: String, required: true },
  tamaño: { type: String, default: 'md' }, // sm | md
})

// Paleta acotada a los tonos de marca, para que cada persona/grupo tenga
// un color estable (determinado por su nombre) sin salirse de la paleta.
const PALETA = [
  { bg: '#1F4B3F', fg: '#EEEAE0' }, // brand
  { bg: '#2F6F62', fg: '#EEEAE0' }, // haber
  { bg: '#B5482F', fg: '#F4E0DA' }, // debe
  { bg: '#C89B3C', fg: '#181F1B' }, // brass
]

function hashDe(texto) {
  let h = 0
  for (let i = 0; i < texto.length; i++) h = (h * 31 + texto.charCodeAt(i)) >>> 0
  return h
}

const colores = computed(() => PALETA[hashDe(props.nombre) % PALETA.length])

const iniciales = computed(() => {
  const partes = props.nombre.trim().split(/\s+/)
  const letras = partes.length > 1 ? partes[0][0] + partes[1][0] : partes[0].slice(0, 2)
  return letras.toUpperCase()
})
</script>

<template>
  <span
    class="inline-flex items-center justify-center rounded-full font-medium shrink-0"
    :class="tamaño === 'sm' ? 'w-7 h-7 text-xs' : 'w-9 h-9 text-sm'"
    :style="{ backgroundColor: colores.bg, color: colores.fg }"
  >
    {{ iniciales }}
  </span>
</template>
