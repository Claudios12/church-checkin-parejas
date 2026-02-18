<template>
  <div class="parent-info bg-white rounded-lg shadow-md p-6">
    <h2 class="text-2xl font-bold mb-4 text-gray-800">Información del Padre/Madre</h2>

    <div class="space-y-4">
      <UiInput
        v-model="localData.parentId"
        type="text"
        label="Documento de Identidad del Padre/Madre"
        placeholder="Ej: 1007557879"
        required
        :disabled="disabled"
        @blur="handleIdBlur"
      />

      <div class="grid grid-cols-2 gap-4">
        <UiInput
          v-model="localData.parentFirstName"
          type="text"
          label="Nombre del Padre/Madre"
          placeholder="Jesús"
          required
          :disabled="disabled"
        />

        <UiInput
          v-model="localData.parentLastName"
          type="text"
          label="Apellido del Padre/Madre"
          placeholder="De nazaret"
          required
          :disabled="disabled"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  parentId?: string
  parentFirstName?: string
  parentLastName?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  parentId: '',
  parentFirstName: '',
  parentLastName: '',
  disabled: false,
})

const emit = defineEmits<{
  'update:parentId': [value: string]
  'update:parentFirstName': [value: string]
  'update:parentLastName': [value: string]
  'idBlur': [id: string]
}>()

const localData = ref({
  parentId: props.parentId,
  parentFirstName: props.parentFirstName,
  parentLastName: props.parentLastName,
})

// Watch for external prop changes
watch(() => props.parentId, (val) => {
  if (localData.value.parentId !== val) {
    localData.value.parentId = val
  }
})

watch(() => props.parentFirstName, (val) => {
  if (localData.value.parentFirstName !== val) {
    localData.value.parentFirstName = val
  }
})

watch(() => props.parentLastName, (val) => {
  if (localData.value.parentLastName !== val) {
    localData.value.parentLastName = val
  }
})

// Emit changes only if different from props
watch(() => localData.value.parentId, (val) => {
  if (val !== props.parentId) {
    emit('update:parentId', val)
  }
})

watch(() => localData.value.parentFirstName, (val) => {
  if (val !== props.parentFirstName) {
    emit('update:parentFirstName', val)
  }
})

watch(() => localData.value.parentLastName, (val) => {
  if (val !== props.parentLastName) {
    emit('update:parentLastName', val)
  }
})

const handleIdBlur = () => {
  emit('idBlur', localData.value.parentId)
}
</script>
