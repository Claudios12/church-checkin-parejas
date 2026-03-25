<template>
  <div class="max-w-4xl mx-auto">
    <!-- Sticker previews -->
    <h2 class="text-2xl font-bold text-center text-white mb-6">
      Vista previa de stickers
    </h2>

    <div class="flex gap-6 justify-center mb-8 flex-wrap">
      <!-- Two identical sticker previews -->
      <div v-for="i in 2" :key="i" class="sticker-preview">
        <!-- Top mountain strip -->
        <div class="bg-strip" />

        <!-- Body -->
        <div class="sticker-body">
          <div class="sticker-content">
            <p class="event-title">Un Ascenso con Propósito</p>
            <p class="info-line couple-names">• {{ coupleNamesDisplay }}</p>
            <p class="info-line">• Fecha: Marzo 28, 2026</p>
            <p class="info-line">• Tema: Punto de Partida</p>
          </div>
          <div class="logo-area">
            <img
              src="/Logo_LibresParaAmar.png"
              alt="Libres para Amar"
              class="logo-img"
              @error="($event.target as HTMLImageElement).style.display = 'none'"
            />
          </div>
        </div>

        <!-- Bottom mountain strip -->
        <div class="bg-strip" />
      </div>
    </div>

    <p class="text-center text-gray-400 text-sm mb-6">
      Se imprimirán 2 stickers idénticos — uno para cada integrante de la pareja
    </p>

    <!-- Buttons -->
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
import type { CoupleData } from '~/composables/useCouplePrint'

const props = defineProps<{
  coupleData: CoupleData
}>()

const emit = defineEmits<{
  reset: []
}>()

const config = useRuntimeConfig()
const autoResetSeconds = parseInt(config.public.autoResetSeconds as string) || 5

const { printCoupleStickers } = useCouplePrint()

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
  width: 384px;
  height: 192px;
  border: 2px solid #c0392b;
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.bg-strip {
  height: 36px;
  background-color: #1a5276;
  background-image: url('/bg_mountains.png');
  background-size: cover;
  background-position: center;
  flex-shrink: 0;
}

.sticker-body {
  flex: 1;
  display: flex;
  flex-direction: row;
  padding: 8px 14px;
  align-items: flex-start;
}

.sticker-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2px;
}

.event-title {
  font-size: 11px;
  font-weight: bold;
  color: #c0392b;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  line-height: 1.2;
  margin-bottom: 4px;
}

.info-line {
  font-size: 9px;
  color: #222;
  line-height: 1.4;
}

.info-line.couple-names {
  font-size: 11px;
  font-weight: bold;
  color: #000;
}

.logo-area {
  width: 64px;
  flex-shrink: 0;
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  padding-left: 6px;
}

.logo-img {
  max-width: 60px;
  max-height: 50px;
  display: block;
}
</style>
