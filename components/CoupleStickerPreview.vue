<template>
  <div class="max-w-4xl mx-auto">
    <h2 class="text-2xl font-bold text-center text-white mb-6">
      Vista previa de stickers
    </h2>

    <div class="flex gap-6 justify-center mb-8 flex-wrap">
      <div v-for="i in 2" :key="i" class="sticker-preview">
        <img src="/Bg_Sticker_Parejas.jpg" class="sticker-bg" alt="" />
        <div class="name-overlay">
          <span class="couple-names">{{ coupleNamesDisplay }}</span>
        </div>
      </div>
    </div>

    <p class="text-center text-gray-400 text-sm mb-6">
      Se imprimirán 2 stickers idénticos — uno para cada integrante de la pareja
    </p>

    <div class="flex gap-4 justify-center">
      <button
        class="px-8 py-4 rounded-xl text-lg font-bold bg-gray-700 hover:bg-gray-600 text-white transition-all active:scale-95"
        @click="emit('reset')"
      >
        Cancelar
      </button>
      <button
        class="px-10 py-4 rounded-xl text-lg font-bold bg-red-700 hover:bg-red-800 text-white shadow-lg transition-all active:scale-95"
        :disabled="isPrinting"
        @click="handlePrint"
      >
        {{ isPrinting ? `Reiniciando en ${countdown}s...` : 'Imprimir Etiquetas' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CoupleData } from '~/composables/usePrint'

const props = defineProps<{
  coupleData: CoupleData
}>()

const emit = defineEmits<{
  reset: []
}>()

const config = useRuntimeConfig()
const autoResetSeconds = parseInt(config.public.autoResetSeconds as string) || 5

const { printCoupleStickers } = usePrint()

const isPrinting = ref(false)
const countdown = ref(autoResetSeconds)

const coupleNamesDisplay = computed(() => {
  const { manName, manLastName, womanName, womanLastName } = props.coupleData
  return `${manName.toUpperCase()} ${manLastName.toUpperCase()} Y ${womanName.toUpperCase()} ${womanLastName.toUpperCase()}`
})

const handlePrint = () => {
  printCoupleStickers(props.coupleData)
  isPrinting.value = true
  countdown.value = autoResetSeconds

  const interval = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(interval)
      emit('reset')
    }
  }, 1000)
}
</script>

<style scoped>
.sticker-preview {
  position: relative;
  width: 400px;
  height: 250px;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.6);
}

.sticker-bg {
  width: 100%;
  height: 100%;
  object-fit: fill;
  display: block;
}

.name-overlay {
  position: absolute;
  top: 52%;
  left: 5%;
  width: 90%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  height: 17%;
}

.couple-names {
  font-size: 14px;
  font-weight: bold;
  color: #000;
  text-align: center;
  text-transform: uppercase;
  line-height: 1.2;
}
</style>
