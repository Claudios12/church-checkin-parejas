<template>
  <div class="children-list bg-white rounded-lg shadow-md p-6">
    <h2 class="text-2xl font-bold mb-4 text-gray-800">Niños</h2>

    <!-- Existing children (if returning family) -->
    <div v-if="existingChildren.length > 0" class="mb-6">
      <h3 class="text-lg font-semibold mb-3 text-gray-700">Seleccionar Niños Existentes:</h3>
      <div class="space-y-2">
        <label
          v-for="child in existingChildren"
          :key="child.id"
          class="flex items-center p-3 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors"
        >
          <input
            type="checkbox"
            :value="child.id"
            v-model="selectedExistingIds"
            class="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
          />
          <span class="ml-3 text-lg">
            {{ child.firstName }} {{ child.lastName }}
            <span v-if="child.allergies || child.specialNeeds" class="text-red-600 text-sm">⚠</span>
          </span>
        </label>
      </div>
    </div>

    <!-- New children -->
    <div v-if="newChildren.length > 0" class="mb-4">
      <h3 class="text-lg font-semibold mb-3 text-gray-700">Nuevos Niños:</h3>
      <div class="space-y-4">
        <ChildInput
          v-for="(child, index) in newChildren"
          :key="index"
          :child="child"
          :index="index"
          :show-remove="newChildren.length > 1 || selectedExistingIds.length > 0"
          @update:child="updateNewChild(index, $event)"
          @remove="removeNewChild(index)"
        />
      </div>
    </div>

    <UiButton
      variant="secondary"
      size="large"
      class="w-full"
      @click="addNewChild"
    >
      + Agregar Otro Niño
    </UiButton>

    <p v-if="totalChildren === 0" class="mt-4 text-red-600 text-center">
      Por favor agregue al menos un niño
    </p>
    <p v-else class="mt-4 text-gray-600 text-center">
      Total de niños a registrar: <strong>{{ totalChildren }}</strong>
    </p>
  </div>
</template>

<script setup lang="ts">
import type { Child } from '~/composables/useCheckIn'

interface ExistingChild {
  id: string
  firstName: string
  lastName: string
  birthDate?: string | null
  allergies?: string | null
  specialNeeds?: string | null
}

interface Props {
  existingChildren?: ExistingChild[]
}

const props = withDefaults(defineProps<Props>(), {
  existingChildren: () => [],
})

const emit = defineEmits<{
  'update:children': [children: Child[]]
}>()

// Selected existing children IDs
const selectedExistingIds = ref<string[]>([])

// New children being added - start empty if there are existing children
const newChildren = ref<Child[]>(
  props.existingChildren.length > 0 ? [] : [
    {
      firstName: '',
      lastName: '',
      birthDate: '',
      allergies: '',
      specialNeeds: '',
    },
  ]
)

const totalChildren = computed(() => {
  return selectedExistingIds.value.length + newChildren.value.filter(c => c.firstName && c.lastName).length
})

const addNewChild = () => {
  newChildren.value.push({
    firstName: '',
    lastName: '',
    birthDate: '',
    allergies: '',
    specialNeeds: '',
  })
}

const removeNewChild = (index: number) => {
  newChildren.value.splice(index, 1)
  // Ensure at least one new child input exists only if no existing children are selected
  if (newChildren.value.length === 0 && selectedExistingIds.value.length === 0) {
    addNewChild()
  }
  emitChildren()
}

const updateNewChild = (index: number, child: Child) => {
  newChildren.value[index] = child
  emitChildren()
}

const emitChildren = () => {
  const children: Child[] = []

  // Add selected existing children
  selectedExistingIds.value.forEach((id) => {
    const existing = props.existingChildren.find((c) => c.id === id)
    if (existing) {
      children.push({
        id: existing.id,
        firstName: existing.firstName,
        lastName: existing.lastName,
        birthDate: existing.birthDate || undefined,
        allergies: existing.allergies || undefined,
        specialNeeds: existing.specialNeeds || undefined,
      })
    }
  })

  // Add new children (only if they have a name)
  newChildren.value.forEach((child) => {
    if (child.firstName && child.lastName) {
      children.push({
        firstName: child.firstName,
        lastName: child.lastName,
        birthDate: child.birthDate || undefined,
        allergies: child.allergies || undefined,
        specialNeeds: child.specialNeeds || undefined,
      })
    }
  })

  emit('update:children', children)
}

// Watch for changes in selected existing children
watch(selectedExistingIds, emitChildren, { deep: true })
watch(newChildren, emitChildren, { deep: true })
</script>
