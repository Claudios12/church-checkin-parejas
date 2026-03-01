<template>
  <div class="child-input bg-gray-50 rounded-lg p-4 border-2" :class="ageError ? 'border-red-400' : 'border-gray-200'">
    <div class="flex justify-between items-center mb-3">
      <h3 class="text-lg font-semibold text-gray-700">Niño {{ index + 1 }}</h3>
      <UiButton
        v-if="showRemove"
        variant="danger"
        size="small"
        @click="$emit('remove')"
      >
        Eliminar
      </UiButton>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      <UiInput
        v-model="localChild.firstName"
        type="text"
        label="Nombre"
        placeholder="Emma"
        required
      />

      <UiInput
        v-model="localChild.lastName"
        type="text"
        label="Apellido"
        placeholder="Pérez"
        required
      />

      <UiInput
        v-model="localChild.birthDate"
        type="date"
        label="Fecha de Nacimiento"
        required
      />
    </div>

    <div v-if="ageError" class="mt-3 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm font-semibold">
      ⚠️ Este niño tiene {{ ageError }} años — pertenece al ministerio de jóvenes Deeper.
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Child } from '~/composables/useCheckIn'
import { calculateAge } from '~/utils/age'

interface Props {
  child: Child
  index: number
  showRemove?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showRemove: true,
})

const emit = defineEmits<{
  'update:child': [child: Child]
  remove: []
}>()

const localChild = ref<Child>({ ...props.child })

const ageError = computed(() => {
  if (!localChild.value.birthDate) return null
  const age = calculateAge(localChild.value.birthDate)
  return age > 15 ? age : null
})

// Watch for external changes
watch(() => props.child, (newChild) => {
  if (JSON.stringify(localChild.value) !== JSON.stringify(newChild)) {
    localChild.value = { ...newChild }
  }
}, { deep: true })

// Emit changes
watch(localChild, (newChild) => {
  if (JSON.stringify(newChild) !== JSON.stringify(props.child)) {
    emit('update:child', { ...newChild })
  }
}, { deep: true })
</script>
