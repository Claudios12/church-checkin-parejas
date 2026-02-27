<template>
  <div class="sticker-preview max-w-6xl mx-auto">
    <div class="bg-gray-900 rounded-lg shadow-lg p-8 border border-gray-700">
      <!-- logo -->
      <div class="text-center mb-4">
        <img src="/Logo_CimaKids.png" alt="Logo" class="inline-block h-20 logo" />
      </div>
      <h2 class="text-3xl font-bold mb-6 text-center text-white">¡Registro Completado!</h2>

      <!-- Developer Easter Egg -->
      <Transition name="celebration">
        <div v-if="showCelebration" class="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <!-- Confetti animation background -->
          <div class="absolute inset-0 confetti-container">
            <div v-for="i in 50" :key="i" class="confetti" :style="getConfettiStyle(i)"></div>
          </div>

          <!-- Message -->
          <div class="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-6 rounded-2xl shadow-2xl transform scale-110 animate-bounce pointer-events-auto">
            <p class="text-3xl font-bold mb-2">🎉 ¡Bienvenido, Creador! 🎉</p>
            <p class="text-lg">Gracias por crear este sistema increíble</p>
          </div>
        </div>
      </Transition>

      <!-- Stickers Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <template v-for="checkIn in checkIns" :key="checkIn.id">
          <!-- Child Sticker -->
          <div class="sticker-card border-4 border-blue-500 rounded-lg p-6 bg-white">
            <div class="text-center">
              <img src="/Logo_CimaKids.png" alt="Logo" class="mx-auto h-12 mb-2" />
              <div class="sticker-type text-xs font-bold mb-2 text-blue-600 uppercase">
                NIÑO
              </div>
              <div class="church-name text-lg font-bold mb-3 text-gray-700">
                {{ churchName }}
              </div>
              <div class="child-name text-5xl font-bold mb-2 text-gray-900">
                {{ checkIn.child.firstName }}
              </div>
              <div class="family-name text-3xl mb-3 text-gray-600">
                {{ checkIn.child.lastName }}
              </div>
              <div class="timestamp text-sm text-gray-500">
                {{ formatDate(checkIn.checkInTime) }}
              </div>
              <div class="timestamp text-sm text-gray-500">
                {{ formatTime(checkIn.checkInTime) }}
              </div>
              <div class="mt-2 text-gray-600 font-semibold">
                {{ calculateAge(checkIn.child.birthDate) }} años
              </div>
            </div>
          </div>

          <!-- Parent Sticker -->
          <div class="sticker-card border-4 border-green-500 rounded-lg p-6 bg-white">
            <div class="text-center">
              <img src="/Logo_CimaKids.png" alt="Logo" class="mx-auto h-12 mb-2" />
              <div class="sticker-type text-xs font-bold mb-2 text-green-600 uppercase">
                PADRE/MADRE - RECOGIDA
              </div>
              <div class="church-name text-lg font-bold mb-3 text-gray-700">
                {{ churchName }}
              </div>
              <div class="child-name text-3xl font-bold mb-2 text-gray-900">
                Recoge a:
              </div>
              <div class="family-name text-4xl mb-4 text-gray-700 font-bold">
                {{ checkIn.child.firstName }}
              </div>
              <div class="timestamp text-sm text-gray-500">
                {{ formatDate(checkIn.checkInTime) }}
              </div>
              <div class="timestamp text-sm text-gray-500">
                {{ formatTime(checkIn.checkInTime) }}
              </div>
              <div class="mt-3 text-gray-600 font-semibold">
                Conserve este sticker
              </div>
            </div>
          </div>
        </template>
      </div>

      <!-- Instructions -->
      <div class="bg-gray-800 border border-gray-600 rounded-lg p-4 mb-6">
        <p class="text-center text-lg text-gray-200">
          <strong>{{ checkIns.length * 2 }}</strong> etiquetas listas para imprimir ({{ checkIns.length }} niño{{ checkIns.length !== 1 ? 's' : '' }} + {{ checkIns.length }} padre{{ checkIns.length !== 1 ? 's' : '' }}).
        </p>
        <p class="text-center text-sm text-gray-300 mt-2">
          El niño conserva su etiqueta <span class="text-blue-400">AZUL</span>. El padre conserva su etiqueta <span class="text-green-400">VERDE</span> para la recogida.
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="flex gap-4">
        <UiButton
          variant="primary"
          size="large"
          class="flex-1"
          @click="handlePrint"
        >
          🖨 Imprimir Etiquetas
        </UiButton>

        <UiButton
          variant="secondary"
          size="large"
          class="flex-1"
          @click="handleDone"
        >
          Listo
        </UiButton>
      </div>

      <!-- Auto-reset countdown -->
      <div v-if="showCountdown" class="mt-6 text-center">
        <div class="bg-yellow-900 border border-yellow-600 rounded-lg p-4">
          <p class="text-xl font-semibold mb-2 text-yellow-100">
            Reiniciando automáticamente en {{ countdown }} segundo{{ countdown !== 1 ? 's' : '' }}...
          </p>
          <UiButton
            variant="danger"
            size="small"
            @click="cancelReset"
          >
            ¡Espera! Necesito más tiempo
          </UiButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CheckInResult } from '~/composables/useCheckIn'
import { calculateAge } from '~/utils/age'

interface Props {
  checkIns: CheckInResult[]
  isDeveloper?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isDeveloper: false,
})

const emit = defineEmits<{
  done: []
  reset: []
}>()

const config = useRuntimeConfig()
const churchName = config.public.churchName
const autoResetSeconds = parseInt(config.public.autoResetSeconds)

const { printStickers, formatTime, formatDate } = usePrint()

// Easter egg celebration
const showCelebration = ref(false)

// Trigger celebration if developer
onMounted(() => {
  if (props.isDeveloper) {
    showCelebration.value = true

    // Auto-hide after 4 seconds
    setTimeout(() => {
      showCelebration.value = false
    }, 4000)
  }
})

// Generate random confetti positions and animations
const getConfettiStyle = (index: number) => {
  const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff']
  return {
    left: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 2}s`,
    backgroundColor: colors[Math.floor(Math.random() * colors.length)],
  }
}

const showCountdown = ref(false)
const countdown = ref(autoResetSeconds)
let countdownInterval: ReturnType<typeof setInterval> | null = null

const handlePrint = () => {
  printStickers(props.checkIns)
}

const handleDone = () => {
  emit('done')
  startCountdown()
}

const startCountdown = () => {
  showCountdown.value = true
  countdown.value = autoResetSeconds

  countdownInterval = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      stopCountdown()
      emit('reset')
    }
  }, 1000)
}

const cancelReset = () => {
  stopCountdown()
  showCountdown.value = false
}

const stopCountdown = () => {
  if (countdownInterval) {
    clearInterval(countdownInterval)
    countdownInterval = null
  }
}

// Cleanup on unmount
onUnmounted(() => {
  stopCountdown()
})
</script>

<style scoped>
.sticker-card {
  aspect-ratio: 4 / 6;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

@media (max-width: 768px) {
  .sticker-card {
    aspect-ratio: auto;
  }
}

/* Easter egg celebration animations */
.celebration-enter-active {
  animation: fadeIn 0.5s ease-out;
}

.celebration-leave-active {
  animation: fadeOut 0.5s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes fadeOut {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.8);
  }
}

/* Confetti animation */
.confetti-container {
  overflow: hidden;
}

.confetti {
  position: absolute;
  width: 10px;
  height: 10px;
  top: -10px;
  animation: confettiFall 3s linear infinite;
}

@keyframes confettiFall {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotate(360deg);
    opacity: 0;
  }
}
</style>
