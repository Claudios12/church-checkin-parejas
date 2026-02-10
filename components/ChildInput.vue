<template>
  <div class="child-input bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
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

    <div class="grid grid-cols-3 gap-3">
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
  </div>
</template>

<script setup lang="ts">
import type { Child } from '~/composables/useCheckIn'

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

// Watch for external changes
watch(() => props.child, (newChild) => {
  // Only update if values are actually different
  if (JSON.stringify(localChild.value) !== JSON.stringify(newChild)) {
    localChild.value = { ...newChild }
  }
}, { deep: true })

// Emit changes
watch(localChild, (newChild) => {
  // Only emit if different from props
  if (JSON.stringify(newChild) !== JSON.stringify(props.child)) {
    emit('update:child', { ...newChild })
  }
}, { deep: true })
</script>
