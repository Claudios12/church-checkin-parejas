<template>
  <div class="max-w-2xl mx-auto">
    <div class="bg-white rounded-2xl shadow-2xl p-8">
      <h2 class="text-2xl font-bold text-center text-gray-800 mb-8">
        Ingresa los nombres de la pareja
      </h2>

      <div class="grid grid-cols-2 gap-6 mb-8">
        <!-- Hombre -->
        <div class="space-y-4">
          <h3 class="text-lg font-semibold text-center text-blue-700 uppercase tracking-wide">
            Él
          </h3>
          <div>
            <label class="block text-sm font-medium text-gray-600 mb-1">Nombre</label>
            <input
              v-model="manName"
              type="text"
              placeholder="Nombre"
              class="w-full text-xl px-4 py-4 border-2 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
              :class="manName.trim() ? 'border-green-400' : 'border-gray-300'"
              autocomplete="off"
              autocorrect="off"
              spellcheck="false"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-600 mb-1">Apellido</label>
            <input
              v-model="manLastName"
              type="text"
              placeholder="Apellido"
              class="w-full text-xl px-4 py-4 border-2 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
              :class="manLastName.trim() ? 'border-green-400' : 'border-gray-300'"
              autocomplete="off"
              autocorrect="off"
              spellcheck="false"
            />
          </div>
        </div>

        <!-- Mujer -->
        <div class="space-y-4">
          <h3 class="text-lg font-semibold text-center text-pink-600 uppercase tracking-wide">
            Ella
          </h3>
          <div>
            <label class="block text-sm font-medium text-gray-600 mb-1">Nombre</label>
            <input
              v-model="womanName"
              type="text"
              placeholder="Nombre"
              class="w-full text-xl px-4 py-4 border-2 rounded-xl focus:outline-none focus:border-pink-500 transition-colors"
              :class="womanName.trim() ? 'border-green-400' : 'border-gray-300'"
              autocomplete="off"
              autocorrect="off"
              spellcheck="false"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-600 mb-1">Apellido</label>
            <input
              v-model="womanLastName"
              type="text"
              placeholder="Apellido"
              class="w-full text-xl px-4 py-4 border-2 rounded-xl focus:outline-none focus:border-pink-500 transition-colors"
              :class="womanLastName.trim() ? 'border-green-400' : 'border-gray-300'"
              autocomplete="off"
              autocorrect="off"
              spellcheck="false"
            />
          </div>
        </div>
      </div>

      <!-- Preview de nombres -->
      <div v-if="isFormValid" class="bg-gray-50 rounded-xl p-4 mb-6 text-center">
        <p class="text-gray-500 text-sm mb-1">Sticker para:</p>
        <p class="text-xl font-bold text-gray-800">
          {{ manName.trim().toUpperCase() }} {{ manLastName.trim().toUpperCase() }}
          Y
          {{ womanName.trim().toUpperCase() }} {{ womanLastName.trim().toUpperCase() }}
        </p>
      </div>

      <button
        :disabled="!isFormValid"
        class="w-full py-5 rounded-xl text-xl font-bold transition-all duration-200"
        :class="isFormValid
          ? 'bg-red-700 hover:bg-red-800 text-white shadow-lg active:scale-95'
          : 'bg-gray-200 text-gray-400 cursor-not-allowed'"
        @click="handleSubmit"
      >
        Generar Stickers
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CoupleData } from '~/composables/useCouplePrint'

const emit = defineEmits<{
  submit: [data: CoupleData]
}>()

const manName = ref('')
const manLastName = ref('')
const womanName = ref('')
const womanLastName = ref('')

const isFormValid = computed(() =>
  manName.value.trim() !== '' &&
  manLastName.value.trim() !== '' &&
  womanName.value.trim() !== '' &&
  womanLastName.value.trim() !== ''
)

const handleSubmit = () => {
  if (!isFormValid.value) return
  emit('submit', {
    manName: manName.value.trim(),
    manLastName: manLastName.value.trim(),
    womanName: womanName.value.trim(),
    womanLastName: womanLastName.value.trim(),
  })
}

const resetForm = () => {
  manName.value = ''
  manLastName.value = ''
  womanName.value = ''
  womanLastName.value = ''
}

defineExpose({ resetForm })
</script>
