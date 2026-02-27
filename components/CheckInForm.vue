<template>
  <form @submit.prevent="handleSubmit" class="space-y-6 max-w-4xl mx-auto">
    <!-- Loading overlay -->
    <div v-if="checkIn.loading.value" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-8 text-center">
        <div class="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
        <p class="text-xl font-semibold">Procesando registro...</p>
      </div>
    </div>

    <!-- Error message -->
    <div v-if="errorMessage" class="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg">
      <p class="font-bold">Error</p>
      <p>{{ errorMessage }}</p>
    </div>

    <!-- Success message for returning family -->
    <div v-if="familyFound" class="bg-green-100 border border-green-400 text-green-700 px-6 py-4 rounded-lg">
      <p class="font-bold">¡Bienvenido de nuevo!</p>
      <p>Encontramos tu familia. Selecciona tus hijos abajo o agrega nuevos.</p>
    </div>

    <!-- Parent Info Section -->
    <ParentInfo
      v-model:parent-id="formData.parentId"
      v-model:parent-first-name="formData.parentFirstName"
      v-model:parent-last-name="formData.parentLastName"
      :disabled="checkIn.loading.value"
      @id-blur="handleIdLookup"
    />

    <!-- Children List Section -->
    <ChildrenList
      :existing-children="existingChildren"
      @update:children="formData.children = $event"
    />

    <!-- Submit Button -->
    <div class="flex gap-4">
      <UiButton
        type="submit"
        variant="primary"
        size="large"
        class="flex-1"
        :disabled="!canSubmit || checkIn.loading.value"
      >
        Registrar {{ formData.children.length }} Niño{{ formData.children.length !== 1 ? 's' : '' }}
      </UiButton>

      <UiButton
        type="button"
        variant="secondary"
        size="large"
        @click="handleCancel"
        :disabled="checkIn.loading.value"
      >
        Cancelar
      </UiButton>
    </div>
  </form>
</template>

<script setup lang="ts">
import type { CheckInResult } from '~/composables/useCheckIn'

const emit = defineEmits<{
  submit: [checkIns: CheckInResult[], isDeveloper?: boolean]
  cancel: []
}>()

const checkIn = useCheckIn()

const formData = ref({
  parentId: '',
  parentFirstName: '',
  parentLastName: '',
  parentPhone: '',
  parentAddress: '',
  children: [] as any[],
})

const familyFound = ref(false)
const existingChildren = ref<any[]>([])
const errorMessage = ref('')

const canSubmit = computed(() => {
  // Remove frontend format validation - let backend handle it
  // Just check that we have some ID value with minimum viable length
  const hasValidId = formData.value.parentId &&
                     formData.value.parentId.trim().length >= 6

  return (
    hasValidId &&
    formData.value.parentFirstName &&
    formData.value.parentLastName &&
    formData.value.children.length > 0
  )
})

const handleIdLookup = async () => {
  // Trigger lookup when ID has minimum viable length (allow spaces/formatting)
  if (!formData.value.parentId || formData.value.parentId.trim().length < 6) {
    return
  }

  try {
    const result = await checkIn.searchFamily(formData.value.parentId)

    if (result.found && result.family) {
      familyFound.value = true
      existingChildren.value = result.family.children

      // Pre-fill parent info
      if (result.family.parents.length > 0) {
        const parent = result.family.parents[0]
        formData.value.parentFirstName = parent.firstName
        formData.value.parentLastName = parent.lastName
        formData.value.parentPhone = (parent as any).phone || ''
        formData.value.parentAddress = (parent as any).address || ''
      }
    } else {
      familyFound.value = false
      existingChildren.value = []
    }
  } catch (error) {
    console.error('Error looking up family:', error)
    // Don't show error for lookup failures - just treat as new family
    familyFound.value = false
    existingChildren.value = []
  }
}

const handleSubmit = async () => {
  if (!canSubmit.value) {
    errorMessage.value = 'Por favor complete todos los campos requeridos'
    return
  }

  errorMessage.value = ''

  try {
    const checkInData = {
      parentId: formData.value.parentId,
      parents: [
        {
          firstName: formData.value.parentFirstName,
          lastName: formData.value.parentLastName,
            phone: formData.value.parentPhone,
            address: formData.value.parentAddress,
        },
      ],
      children: formData.value.children,
    }

    const result = await checkIn.createCheckIn(checkInData)

    // Easter egg: Detect if Christian Donado is checking in
    // Flexible matching: works with "Christian" or "Christian David" and "Donado" or "Donado Giraldo"
    const firstName = formData.value.parentFirstName.toLowerCase().trim()
    const lastName = formData.value.parentLastName.toLowerCase().trim()
    const isDeveloper = firstName.includes('christian') && lastName.includes('donado')

    emit('submit', result, isDeveloper)
  } catch (error: any) {
    errorMessage.value = error.data?.statusMessage || error.message || 'Error al crear el registro'
    console.error('Check-in error:', error)
  }
}

const handleCancel = () => {
  if (confirm('¿Está seguro que desea cancelar? Se perderán todos los datos ingresados.')) {
    emit('cancel')
  }
}

// Reset form function (can be called from parent)
const resetForm = () => {
  formData.value = {
    parentId: '',
    parentFirstName: '',
    parentLastName: '',
    children: [],
  }
  familyFound.value = false
  existingChildren.value = []
  errorMessage.value = ''
}

defineExpose({
  resetForm,
})
</script>
