<template>
  <div class="input-wrapper">
    <label v-if="label" :for="inputId" class="block text-sm font-medium text-gray-700 mb-2">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>
    <input
      :id="inputId"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :required="required"
      :disabled="disabled"
      :class="inputClasses"
      @input="onInput"
      @blur="$emit('blur')"
      @focus="$emit('focus')"
    />
    <p v-if="error" class="mt-1 text-sm text-red-600">{{ error }}</p>
    <p v-else-if="hint" class="mt-1 text-sm text-gray-500">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
// Counter for generating unique IDs (SSR-safe)
let idCounter = 0

interface Props {
  id?: string
  type?: 'text' | 'tel' | 'email' | 'date' | 'number' | 'password'
  modelValue: string | number
  label?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  error?: string
  hint?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  required: false,
  disabled: false,
})

// Generate stable ID that's consistent between server and client
const inputId = computed(() => props.id || `input-${++idCounter}`)

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  blur: []
  focus: []
}>()

const inputClasses = computed(() => {
  const base = 'w-full px-4 py-3 text-lg border rounded-lg focus:outline-none focus:ring-2 transition-colors min-h-[44px]'
  const state = props.error
    ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
  const disabled = props.disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'

  return [base, state, disabled].join(' ')
})

const onInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}
</script>
