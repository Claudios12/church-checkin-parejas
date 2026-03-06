<template>
  <!-- Loading overlay -->
  <div v-if="checkIn.loading.value" class="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
    <div class="bg-white rounded-2xl p-8 text-center shadow-2xl">
      <div class="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
      <p class="text-xl font-semibold text-gray-800">Procesando...</p>
    </div>
  </div>

  <!-- ===== STEP: NUMPAD ===== -->
  <div v-if="step === 'numpad'" class="flex flex-col items-center gap-5 max-w-xs mx-auto pt-2">

    <!-- ID display -->
    <div class="w-full bg-blue-700 rounded-2xl px-6 py-5 text-center shadow-lg">
      <p class="text-blue-200 text-sm font-semibold uppercase tracking-widest mb-2">Cédula / ID</p>
      <p class="text-5xl font-mono text-white tracking-wider min-h-[3.5rem] flex items-center justify-center">
        {{ numpadInput || '—' }}
      </p>
    </div>

    <!-- Error -->
    <p v-if="errorMsg" class="w-full text-center text-red-300 bg-red-900/40 rounded-xl py-2 px-4 text-base font-medium">
      {{ errorMsg }}
    </p>

    <!-- Numpad grid -->
    <div class="grid grid-cols-3 gap-3 w-full">
      <button
        v-for="key in numpadKeys"
        :key="key"
        type="button"
        class="rounded-2xl text-2xl font-bold py-5 transition-all active:scale-90 select-none touch-manipulation"
        :class="{
          'bg-red-800 hover:bg-red-700 text-white text-lg': key === 'Limpiar',
          'bg-gray-600 hover:bg-gray-500 text-white': key === '⌫',
          'bg-gray-700 hover:bg-gray-600 text-white': !['Limpiar','⌫'].includes(key),
        }"
        @click="pressKey(key)"
      >
        {{ key }}
      </button>
    </div>

    <!-- Search button -->
    <button
      type="button"
      class="w-full py-5 rounded-2xl text-2xl font-bold transition-all active:scale-95 touch-manipulation"
      :class="numpadInput.length >= 6
        ? 'bg-green-500 hover:bg-green-400 text-white'
        : 'bg-gray-700 text-gray-500 cursor-not-allowed'"
      :disabled="numpadInput.length < 6"
      @click="doSearch"
    >
      Buscar
    </button>

    <!-- Visitor link -->
    <button type="button" class="text-yellow-400 text-base underline underline-offset-2 py-1" @click="goVisitor">
      Soy visitante / No tengo cédula
    </button>
  </div>

  <!-- ===== STEP: SELECT KIDS ===== -->
  <div v-else-if="step === 'select-kids'" class="max-w-md mx-auto pt-2 flex flex-col gap-5">

    <!-- Welcome header -->
    <div class="text-center bg-green-900/50 border border-green-700 rounded-2xl py-4 px-6">
      <p class="text-green-400 text-sm uppercase tracking-wide font-semibold mb-1">¡Bienvenido de nuevo!</p>
      <p class="text-white text-2xl font-bold">{{ foundParentName }}</p>
    </div>

    <!-- Kid cards -->
    <div>
      <p class="text-gray-300 text-center text-base mb-3">Selecciona los niños que vinieron hoy:</p>
      <div class="grid grid-cols-2 gap-4">
        <button
          v-for="child in foundChildren"
          :key="child.id"
          type="button"
          class="rounded-2xl py-6 px-4 text-center transition-all active:scale-95 border-4 touch-manipulation"
          :class="selectedChildIds.has(child.id)
            ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-900/50'
            : 'bg-gray-800 border-gray-700 text-gray-200 hover:border-gray-500'"
          @click="toggleChild(child.id)"
        >
          <p class="text-2xl font-bold leading-tight">{{ child.firstName }}</p>
          <p class="text-lg opacity-80 mt-0.5">{{ child.lastName }}</p>
          <p class="text-sm mt-1 opacity-60">{{ getAge(child.birthDate) }} años</p>
          <div v-if="selectedChildIds.has(child.id)" class="mt-2 text-3xl">✓</div>
        </button>
      </div>
      <p v-if="foundChildren.length === 0" class="text-gray-400 text-center py-8 text-base">
        No hay niños registrados en esta familia.
      </p>
    </div>

    <!-- Error -->
    <p v-if="errorMsg" class="text-center text-red-300 bg-red-900/40 rounded-xl py-2 px-4 text-base">{{ errorMsg }}</p>

    <!-- Actions -->
    <div class="flex flex-col gap-3">
      <button
        type="button"
        class="w-full py-5 rounded-2xl text-2xl font-bold transition-all active:scale-95 touch-manipulation"
        :class="selectedChildIds.size > 0
          ? 'bg-green-500 hover:bg-green-400 text-white'
          : 'bg-gray-700 text-gray-500 cursor-not-allowed'"
        :disabled="selectedChildIds.size === 0"
        @click="submitSelectKids"
      >
        Registrar {{ selectedChildIds.size }} niño{{ selectedChildIds.size !== 1 ? 's' : '' }}
      </button>
      <button
        type="button"
        class="w-full py-4 rounded-2xl text-lg text-gray-300 bg-gray-800 hover:bg-gray-700 active:scale-95 touch-manipulation"
        @click="goBack"
      >
        ← Volver
      </button>
    </div>
  </div>

  <!-- ===== STEP: REGISTER (new family or visitor) ===== -->
  <div v-else-if="step === 'register'" class="max-w-md mx-auto pt-2 flex flex-col gap-4">

    <!-- Header -->
    <div
      class="rounded-2xl py-3 px-5 text-center"
      :class="isVisitorMode ? 'bg-yellow-900/50 border border-yellow-700' : 'bg-orange-900/40 border border-orange-700'"
    >
      <p v-if="isVisitorMode" class="text-yellow-300 font-bold text-xl">Visitante</p>
      <p v-else class="text-orange-300 font-semibold text-base">No encontramos tu familia. ¡Regístrate!</p>
      <p v-if="!isVisitorMode" class="text-gray-400 text-sm mt-1">ID: {{ numpadInput }}</p>
    </div>

    <!-- Parent info -->
    <div class="bg-gray-800 rounded-2xl p-5 space-y-3">
      <h3 class="text-white font-bold text-lg">Datos del padre/madre</h3>
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="text-gray-400 text-sm block mb-1">Nombre *</label>
          <input
            v-model="regForm.firstName"
            class="w-full bg-gray-700 text-white rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nombre"
          />
        </div>
        <div>
          <label class="text-gray-400 text-sm block mb-1">Apellido *</label>
          <input
            v-model="regForm.lastName"
            class="w-full bg-gray-700 text-white rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Apellido"
          />
        </div>
      </div>
      <div>
        <label class="text-gray-400 text-sm block mb-1">Teléfono</label>
        <input
          v-model="regForm.phone"
          type="tel"
          class="w-full bg-gray-700 text-white rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Ej: 3001234567"
        />
      </div>
    </div>

    <!-- Children -->
    <div class="bg-gray-800 rounded-2xl p-5 space-y-3">
      <h3 class="text-white font-bold text-lg">Niños</h3>
      <div v-for="(child, i) in regChildren" :key="i" class="bg-gray-700 rounded-xl p-4 space-y-2">
        <div class="grid grid-cols-2 gap-2">
          <input
            v-model="child.firstName"
            class="bg-gray-600 text-white rounded-lg px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nombre"
          />
          <input
            v-model="child.lastName"
            class="bg-gray-600 text-white rounded-lg px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Apellido"
          />
        </div>
        <div class="flex gap-2 items-center">
          <input
            v-model="child.birthDate"
            type="date"
            class="bg-gray-600 text-white rounded-lg px-3 py-2 flex-1 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            v-if="regChildren.length > 1"
            type="button"
            class="text-red-400 text-2xl font-bold w-10 h-10 flex items-center justify-center hover:text-red-300 touch-manipulation"
            @click="regChildren.splice(i, 1)"
          >
            ×
          </button>
        </div>
      </div>
      <button
        type="button"
        class="w-full py-3 rounded-xl text-blue-400 border border-blue-700 hover:bg-blue-900/30 transition active:scale-95 touch-manipulation"
        @click="regChildren.push({ firstName: '', lastName: '', birthDate: '' })"
      >
        + Agregar otro niño
      </button>
    </div>

    <!-- Error -->
    <p v-if="errorMsg" class="text-center text-red-300 bg-red-900/40 rounded-xl py-2 px-4 text-base">{{ errorMsg }}</p>

    <!-- Actions -->
    <div class="flex flex-col gap-3">
      <button
        type="button"
        class="w-full py-5 rounded-2xl text-2xl font-bold transition-all active:scale-95 touch-manipulation"
        :class="canSubmitReg
          ? 'bg-green-500 hover:bg-green-400 text-white'
          : 'bg-gray-700 text-gray-500 cursor-not-allowed opacity-60'"
        :disabled="!canSubmitReg"
        @click="submitRegister"
      >
        Registrar
      </button>
      <button
        type="button"
        class="w-full py-4 rounded-2xl text-lg text-gray-300 bg-gray-800 hover:bg-gray-700 active:scale-95 touch-manipulation"
        @click="goBack"
      >
        ← Volver
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CheckInResult } from '~/composables/useCheckIn'
import { calculateAge } from '~/utils/age'

const emit = defineEmits<{
  submit: [checkIns: CheckInResult[], isDeveloper?: boolean]
  cancel: []
}>()

const checkIn = useCheckIn()

// --- Step state ---
type Step = 'numpad' | 'select-kids' | 'register'
const step = ref<Step>('numpad')
const isVisitorMode = ref(false)
const numpadInput = ref('')
const errorMsg = ref('')

// --- Select-kids state ---
const foundParentName = ref('')
const foundChildren = ref<Array<{ id: string; firstName: string; lastName: string; birthDate: string }>>([])
const foundParents = ref<Array<{ firstName: string; lastName: string; documentId?: string | null; phone?: string | null; address?: string | null }>>([])
const selectedChildIds = ref(new Set<string>())

// --- Register state ---
const regForm = ref({ firstName: '', lastName: '', phone: '' })
const regChildren = ref([{ firstName: '', lastName: '', birthDate: '' }])

// --- Numpad keys ---
const numpadKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'Limpiar', '0', '⌫']

// --- Helpers ---
const getAge = (birthDate: string) => {
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age
}

const canSubmitReg = computed(() =>
  regForm.value.firstName.trim() &&
  regForm.value.lastName.trim() &&
  regChildren.value.some(c => c.firstName.trim() && c.lastName.trim() && c.birthDate)
)

const isDeveloper = (firstName: string, lastName: string) =>
  firstName.toLowerCase().includes('christian') && lastName.toLowerCase().includes('donado')

// --- Numpad ---
const pressKey = (key: string) => {
  errorMsg.value = ''
  if (key === 'Limpiar') {
    numpadInput.value = ''
  } else if (key === '⌫') {
    numpadInput.value = numpadInput.value.slice(0, -1)
  } else if (numpadInput.value.length < 15) {
    numpadInput.value += key
  }
}

const doSearch = async () => {
  if (numpadInput.value.length < 6) return
  errorMsg.value = ''
  try {
    const result = await checkIn.searchFamily(numpadInput.value)
    if (result.found && result.family) {
      foundParents.value = result.family.parents
      const normalizedInput = numpadInput.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
      const matchedParent = result.family.parents.find(p => p.documentId === normalizedInput) ?? result.family.parents[0]
      foundParentName.value = `${matchedParent?.firstName || ''} ${matchedParent?.lastName || ''}`.trim()
      foundChildren.value = result.family.children.filter(c => calculateAge(c.birthDate) <= 15)
      selectedChildIds.value = new Set()
      step.value = 'select-kids'
    } else {
      regForm.value = { firstName: '', lastName: '', phone: '' }
      regChildren.value = [{ firstName: '', lastName: '', birthDate: '' }]
      isVisitorMode.value = false
      step.value = 'register'
    }
  } catch {
    errorMsg.value = 'Error al buscar. Intenta de nuevo.'
  }
}

const goVisitor = () => {
  regForm.value = { firstName: '', lastName: '', phone: '' }
  regChildren.value = [{ firstName: '', lastName: '', birthDate: '' }]
  errorMsg.value = ''
  isVisitorMode.value = true
  step.value = 'register'
}

const goBack = () => {
  step.value = 'numpad'
  errorMsg.value = ''
  selectedChildIds.value = new Set()
}

const toggleChild = (id: string) => {
  const s = new Set(selectedChildIds.value)
  if (s.has(id)) s.delete(id)
  else s.add(id)
  selectedChildIds.value = s
}

// --- Submit: existing family ---
const submitSelectKids = async () => {
  if (selectedChildIds.value.size === 0) return
  errorMsg.value = ''
  const children = foundChildren.value
    .filter(c => selectedChildIds.value.has(c.id))
    .map(c => ({ id: c.id, firstName: c.firstName, lastName: c.lastName, birthDate: c.birthDate }))
  const parents = foundParents.value.map(p => ({
    firstName: p.firstName,
    lastName: p.lastName,
    documentId: p.documentId || undefined,
    phone: p.phone || undefined,
    address: p.address || undefined,
  }))
  try {
    const result = await checkIn.createCheckIn({ parentId: numpadInput.value, parents, children })
    const dev = foundParents.value.some(p => isDeveloper(p.firstName, p.lastName))
    emit('submit', result, dev)
  } catch (e: any) {
    errorMsg.value = e.data?.statusMessage || 'Error al registrar'
  }
}

// --- Submit: new family or visitor ---
const submitRegister = async () => {
  if (!canSubmitReg.value) return
  errorMsg.value = ''
  const children = regChildren.value.filter(c => c.firstName.trim() && c.lastName.trim() && c.birthDate)
  const parents = [{ firstName: regForm.value.firstName.trim(), lastName: regForm.value.lastName.trim(), phone: regForm.value.phone.trim() || undefined }]
  try {
    const result = await checkIn.createCheckIn({
      parentId: isVisitorMode.value ? '' : numpadInput.value,
      parents,
      children,
      isVisitor: isVisitorMode.value,
    })
    const dev = isDeveloper(regForm.value.firstName, regForm.value.lastName)
    emit('submit', result, dev)
  } catch (e: any) {
    errorMsg.value = e.data?.statusMessage || 'Error al registrar'
  }
}

// --- Reset (called from pages/index.vue) ---
const resetForm = () => {
  step.value = 'numpad'
  isVisitorMode.value = false
  numpadInput.value = ''
  errorMsg.value = ''
  foundParentName.value = ''
  foundChildren.value = []
  foundParents.value = []
  selectedChildIds.value = new Set()
  regForm.value = { firstName: '', lastName: '', phone: '' }
  regChildren.value = [{ firstName: '', lastName: '', birthDate: '' }]
}

defineExpose({ resetForm })
</script>
