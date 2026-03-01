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

    <!-- Visitor toggle -->
    <div class="flex items-center justify-center gap-3 bg-yellow-50 border border-yellow-300 rounded-lg px-6 py-3">
      <span class="text-gray-700 font-medium">¿Es un padre visitante?</span>
      <button
        type="button"
        :class="isVisitor ? 'bg-yellow-400' : 'bg-gray-300'"
        class="relative inline-flex h-8 w-14 items-center rounded-full transition-colors"
        @click="toggleVisitor"
      >
        <span
          :class="isVisitor ? 'translate-x-7' : 'translate-x-1'"
          class="inline-block h-6 w-6 transform rounded-full bg-white shadow transition-transform"
        />
      </button>
      <span v-if="isVisitor" class="text-yellow-700 font-semibold text-sm">VISITANTE</span>
    </div>

    <!-- Success message for returning family -->
    <div v-if="familyFound && !isVisitor" class="bg-green-100 border border-green-400 text-green-700 px-6 py-4 rounded-lg">
      <p class="font-bold">¡Bienvenido de nuevo!</p>
      <p>Encontramos tu familia. Selecciona tus hijos abajo o agrega nuevos.</p>
    </div>

    <!-- Primary Parent -->
    <ParentInfo
      v-model:parent-id="formData.parentId"
      v-model:parent-first-name="formData.parentFirstName"
      v-model:parent-last-name="formData.parentLastName"
      v-model:parent-phone="formData.parentPhone"
      v-model:parent-address="formData.parentAddress"
      :disabled="checkIn.loading.value"
      :is-visitor="isVisitor"
      @id-blur="handleIdLookup"
    />

    <!-- Second parent toggle -->
    <div class="text-center">
      <button
        type="button"
        class="text-blue-400 underline text-sm"
        @click="toggleSecondParent"
      >
        {{ showSecondParent ? '— Quitar segundo padre/madre' : '+ Agregar segundo padre/madre' }}
      </button>
    </div>

    <!-- Second Parent -->
    <div v-if="showSecondParent" class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-2xl font-bold mb-4 text-gray-800">Segundo Padre/Madre</h2>
      <div class="mb-4">
        <UiInput
          v-model="formData.secondParentDocumentId"
          type="text"
          label="Documento de Identidad (para que pueda buscar la familia con su propio documento)"
          placeholder="Ej: 1007557880"
          :disabled="checkIn.loading.value"
        />
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <UiInput
          v-model="formData.secondParentFirstName"
          type="text"
          label="Nombre"
          placeholder="María"
          :disabled="checkIn.loading.value"
        />
        <UiInput
          v-model="formData.secondParentLastName"
          type="text"
          label="Apellido"
          placeholder="García"
          :disabled="checkIn.loading.value"
        />
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        <UiInput
          v-model="formData.secondParentPhone"
          type="tel"
          label="Teléfono"
          placeholder="3001234567"
          :disabled="checkIn.loading.value"
        />
        <UiInput
          v-model="formData.secondParentAddress"
          type="text"
          label="Dirección"
          placeholder="Calle 123 #45-67"
          :disabled="checkIn.loading.value"
        />
      </div>
    </div>

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
  secondParentDocumentId: '',
  secondParentFirstName: '',
  secondParentLastName: '',
  secondParentPhone: '',
  secondParentAddress: '',
  children: [] as any[],
})

const showSecondParent = ref(false)
const familyFound = ref(false)
const existingChildren = ref<any[]>([])
const errorMessage = ref('')
const isVisitor = ref(false)

const toggleVisitor = () => {
  isVisitor.value = !isVisitor.value
  // Reset form when toggling to clear stale data
  formData.value.parentId = ''
  familyFound.value = false
  existingChildren.value = []
}

const toggleSecondParent = () => {
  showSecondParent.value = !showSecondParent.value
  if (!showSecondParent.value) {
    formData.value.secondParentDocumentId = ''
    formData.value.secondParentFirstName = ''
    formData.value.secondParentLastName = ''
    formData.value.secondParentPhone = ''
    formData.value.secondParentAddress = ''
  }
}

const canSubmit = computed(() => {
  const hasValidId = isVisitor.value || (
    formData.value.parentId &&
    formData.value.parentId.trim().length >= 6
  )
  return (
    hasValidId &&
    formData.value.parentFirstName &&
    formData.value.parentLastName &&
    formData.value.children.length > 0
  )
})

const handleIdLookup = async (id: string) => {
  if (!id || id.trim().length < 6) {
    return
  }

  // Normalize id the same way the server does (strip non-alphanumeric, uppercase)
  const normalizedSearchedId = id.trim().replace(/[^a-zA-Z0-9]/g, '').toUpperCase()

  try {
    const result = await checkIn.searchFamily(id)

    if (result.found && result.family) {
      familyFound.value = true
      existingChildren.value = result.family.children

      // Determine which parent entered this ID
      // Primary family ID (family.parentId) belongs to parents[0]
      // Secondary parents have their own documentId stored
      const parents = result.family.parents as any[]
      let matchedIndex = 0
      if (normalizedSearchedId !== result.family.parentId) {
        const secIdx = parents.findIndex((p: any) => p.documentId === normalizedSearchedId)
        if (secIdx !== -1) matchedIndex = secIdx
      }

      const matchedParent = parents[matchedIndex]
      if (!matchedParent) return  // no parents in this family, nothing to pre-fill

      formData.value.parentFirstName = matchedParent.firstName
      formData.value.parentLastName = matchedParent.lastName
      formData.value.parentPhone = matchedParent.phone || ''
      formData.value.parentAddress = matchedParent.address || ''

      // Pre-fill second parent (any parent that isn't the matched one)
      const otherParents = parents.filter((_: any, i: number) => i !== matchedIndex)
      if (otherParents.length > 0) {
        const second = otherParents[0]
        showSecondParent.value = true
        formData.value.secondParentDocumentId = second.documentId || ''
        formData.value.secondParentFirstName = second.firstName
        formData.value.secondParentLastName = second.lastName
        formData.value.secondParentPhone = second.phone || ''
        formData.value.secondParentAddress = second.address || ''
      }
    } else {
      familyFound.value = false
      existingChildren.value = []
    }
  } catch (error) {
    console.error('Error looking up family:', error)
  }
}

const handleSubmit = async () => {
  if (!canSubmit.value) {
    errorMessage.value = 'Por favor complete todos los campos requeridos'
    return
  }

  errorMessage.value = ''

  const parents: any[] = [
    {
      firstName: formData.value.parentFirstName,
      lastName: formData.value.parentLastName,
      phone: formData.value.parentPhone,
      address: formData.value.parentAddress,
    },
  ]

  if (showSecondParent.value && formData.value.secondParentFirstName) {
    parents.push({
      documentId: formData.value.secondParentDocumentId || undefined,
      firstName: formData.value.secondParentFirstName,
      lastName: formData.value.secondParentLastName,
      phone: formData.value.secondParentPhone,
      address: formData.value.secondParentAddress,
    })
  }

  try {
    const result = await checkIn.createCheckIn({
      parentId: formData.value.parentId,
      parents,
      children: formData.value.children,
      isVisitor: isVisitor.value,
    })

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

const resetForm = () => {
  formData.value = {
    parentId: '',
    parentFirstName: '',
    parentLastName: '',
    parentPhone: '',
    parentAddress: '',
    secondParentDocumentId: '',
    secondParentFirstName: '',
    secondParentLastName: '',
    secondParentPhone: '',
    secondParentAddress: '',
    children: [],
  }
  showSecondParent.value = false
  familyFound.value = false
  existingChildren.value = []
  errorMessage.value = ''
  isVisitor.value = false
}

defineExpose({
  resetForm,
})
</script>
