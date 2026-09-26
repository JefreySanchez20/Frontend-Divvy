<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useGastosStore } from '../stores/useGastosStore'
import { useUsuariosCacheStore } from '@/usuarios/stores/useUsuariosCacheStore'
import { useAuth } from '@/shared/composables/useAuth'
import { aCentesimas, formatearCentesimas, validarDivision } from '../utils/division'
import BaseInput from '@/shared/components/BaseInput.vue'
import BaseButton from '@/shared/components/BaseButton.vue'
import BaseAlert from '@/shared/components/BaseAlert.vue'

const props = defineProps({
  groupId: { type: String, required: true },
  members: { type: Array, required: true },
  moneda: { type: String, required: true }, // fija por grupo, no se elige aquí
  gasto: { type: Object, default: null }, // si viene, el formulario edita ese gasto
})
const emit = defineEmits(['guardado', 'cancelar'])

const TIPOS = [
  { valor: 'EQUAL', etiqueta: 'Partes iguales' },
  { valor: 'PERCENTAGE', etiqueta: 'Porcentajes' },
  { valor: 'FIXED_AMOUNT', etiqueta: 'Montos fijos' },
]

const gastosStore = useGastosStore()
const usuariosCache = useUsuariosCacheStore()
const { currentUser } = useAuth()

const idsMiembros = computed(() => props.members.map((m) => m.userId))
const nombre = (id) => usuariosCache.resolverNombre(id)

function fechaLocal(fecha) {
  return new Date(fecha).toLocaleDateString('en-CA') // YYYY-MM-DD en hora local
}

function estadoInicial() {
  const g = props.gasto
  if (!g) {
    return {
      descripcion: '',
      monto: '',
      pagadoPor: currentUser.value?.id ?? idsMiembros.value[0],
      fecha: fechaLocal(new Date()),
      categoria: '',
      tipo: 'EQUAL',
      seleccionados: [...idsMiembros.value],
      valores: {},
    }
  }

  const detalle = g.division.details
  const valores = {}
  if (g.division.type === 'FIXED_AMOUNT') {
    for (const [id, monto] of Object.entries(detalle)) valores[id] = Number(monto).toFixed(2)
  } else if (g.division.type === 'PERCENTAGE') {
    // El backend devuelve montos, no los porcentajes originales: se reconstruyen.
    for (const [id, monto] of Object.entries(detalle)) {
      valores[id] = String(Math.round((Number(monto) / Number(g.amount)) * 10000) / 100)
    }
  }
  return {
    descripcion: g.description,
    monto: Number(g.amount).toFixed(2),
    pagadoPor: g.paidBy,
    fecha: fechaLocal(g.date),
    categoria: g.category ?? '',
    tipo: g.division.type,
    seleccionados: g.division.type === 'EQUAL' ? Object.keys(detalle) : [...idsMiembros.value],
    valores,
  }
}

const form = reactive(estadoInicial())
const intentado = ref(false)
const enviando = ref(false)
const errorApi = ref('')

// Los valores de un tipo no significan nada en otro (% vs monto).
watch(
  () => form.tipo,
  () => {
    form.valores = {}
  },
)

const montoCentesimas = computed(() => {
  const c = aCentesimas(form.monto)
  return c && c > 0 ? c : null
})

const division = computed(() =>
  validarDivision({
    tipo: form.tipo,
    montoCentesimas: montoCentesimas.value,
    participantes: form.seleccionados,
    valores: form.valores,
  }),
)

const errores = computed(() => ({
  descripcion: form.descripcion.trim() ? '' : 'Escribe una descripción.',
  monto: montoCentesimas.value ? '' : 'Ingresa un monto mayor a cero (máximo 2 decimales).',
}))

/** Resumen en vivo bajo la lista: cuánto falta o sobra para cerrar la división. */
const resumen = computed(() => {
  if (form.tipo === 'EQUAL') return null
  const { restante } = division.value
  if (restante === null) return null
  const unidad = form.tipo === 'PERCENTAGE' ? '%' : props.moneda
  const texto = form.tipo === 'PERCENTAGE' ? String(Math.abs(restante) / 100) : formatearCentesimas(Math.abs(restante))
  if (restante === 0) return { ok: true, texto: 'La división cuadra con el total.' }
  return {
    ok: false,
    texto: restante > 0 ? `Falta ${texto} ${unidad}` : `Te pasas por ${texto} ${unidad}`,
  }
})

function alternarParticipante(id) {
  const i = form.seleccionados.indexOf(id)
  if (i === -1) form.seleccionados.push(id)
  else form.seleccionados.splice(i, 1)
}

async function onSubmit() {
  intentado.value = true
  errorApi.value = ''
  if (errores.value.descripcion || errores.value.monto || !division.value.valida) return

  const payload = {
    description: form.descripcion.trim(),
    amount: montoCentesimas.value / 100,
    currency: props.moneda,
    paidBy: form.pagadoPor,
    // Mediodía local: evita que la zona horaria mueva el gasto a otro día.
    date: new Date(`${form.fecha}T12:00:00`).toISOString(),
    category: form.categoria.trim() || undefined,
    division: { type: form.tipo, details: division.value.detalle },
  }

  enviando.value = true
  try {
    const guardado = props.gasto
      ? await gastosStore.actualizar(props.groupId, props.gasto.id, payload)
      : await gastosStore.crear(props.groupId, payload)
    emit('guardado', guardado)
  } catch (err) {
    errorApi.value = err.message
  } finally {
    enviando.value = false
  }
}
</script>

<template>
  <form class="space-y-5" novalidate @submit.prevent="onSubmit">
    <BaseInput
      v-model="form.descripcion"
      label="Descripción"
      :error="intentado ? errores.descripcion : ''"
    />

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <BaseInput
          v-model="form.monto"
          :label="`Monto (${moneda})`"
          :error="intentado ? errores.monto : ''"
        />
        <p class="text-xs text-ink-faint mt-1.5">
          La moneda del grupo es fija: <span class="cifra">{{ moneda }}</span>.
        </p>
      </div>
      <BaseInput v-model="form.fecha" label="Fecha" type="date" />
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <label class="block">
        <span class="block text-sm text-ink-soft mb-1.5">Pagó</span>
        <select
          v-model="form.pagadoPor"
          class="w-full rounded-md border border-paper-line bg-paper px-3 py-2.5 text-sm text-ink outline-none focus:border-brand"
        >
          <option v-for="id in idsMiembros" :key="id" :value="id">{{ nombre(id) }}</option>
        </select>
      </label>
      <BaseInput v-model="form.categoria" label="Categoría (opcional)" />
    </div>

    <fieldset>
      <legend class="text-sm text-ink-soft mb-2">Cómo se divide</legend>
      <div class="inline-flex rounded-md border border-paper-line overflow-hidden mb-4" role="radiogroup">
        <button
          v-for="tipo in TIPOS"
          :key="tipo.valor"
          type="button"
          role="radio"
          :aria-checked="form.tipo === tipo.valor"
          class="px-3.5 py-2 text-sm transition-colors border-r border-paper-line last:border-r-0"
          :class="form.tipo === tipo.valor ? 'bg-brand text-paper' : 'text-ink-soft hover:bg-paper-dim'"
          @click="form.tipo = tipo.valor"
        >
          {{ tipo.etiqueta }}
        </button>
      </div>

      <ul>
        <li
          v-for="id in idsMiembros"
          :key="id"
          class="flex items-center justify-between gap-3 border-b border-paper-line py-2.5"
        >
          <template v-if="form.tipo === 'EQUAL'">
            <label class="flex items-center gap-3 flex-1 cursor-pointer">
              <input
                type="checkbox"
                class="accent-brand size-4"
                :checked="form.seleccionados.includes(id)"
                @change="alternarParticipante(id)"
              />
              <span class="text-sm text-ink">{{ nombre(id) }}</span>
            </label>
            <span v-if="division.montos[id] !== undefined" class="cifra text-sm text-ink-soft">
              {{ formatearCentesimas(division.montos[id]) }}
            </span>
          </template>

          <template v-else>
            <label :for="`valor-${id}`" class="text-sm text-ink flex-1">{{ nombre(id) }}</label>
            <span v-if="division.montos[id] !== undefined && form.tipo === 'PERCENTAGE'" class="cifra text-xs text-ink-faint">
              {{ formatearCentesimas(division.montos[id]) }} {{ moneda }}
            </span>
            <div class="flex items-center gap-1.5">
              <input
                :id="`valor-${id}`"
                v-model="form.valores[id]"
                inputmode="decimal"
                placeholder="0"
                class="cifra w-24 rounded-md border border-paper-line bg-paper px-2.5 py-1.5 text-sm text-right text-ink outline-none focus:border-brand"
              />
              <span class="text-xs text-ink-faint w-8">{{ form.tipo === 'PERCENTAGE' ? '%' : moneda }}</span>
            </div>
          </template>
        </li>
      </ul>

      <p
        v-if="resumen"
        class="text-sm mt-3"
        :class="resumen.ok ? 'text-haber' : 'text-debe'"
        role="status"
      >
        {{ resumen.texto }}
      </p>
    </fieldset>

    <!-- Si el indicador de arriba ya dice cuánto falta o sobra, repetirlo aquí es ruido. -->
    <BaseAlert v-if="intentado && division.error && (!resumen || resumen.ok)" variant="error">
      {{ division.error }}
    </BaseAlert>
    <BaseAlert v-if="errorApi" variant="error">{{ errorApi }}</BaseAlert>

    <div class="flex gap-3">
      <BaseButton type="submit" :disabled="enviando">
        {{ enviando ? 'Guardando…' : gasto ? 'Guardar cambios' : 'Registrar gasto' }}
      </BaseButton>
      <BaseButton variant="secondary" @click="emit('cancelar')">Cancelar</BaseButton>
    </div>
  </form>
</template>
