<template>
  <div class="sticker-preview w-full">
    <div class="bg-gray-900 rounded-lg shadow-lg p-3 border border-gray-700">
      <h2 class="text-xl font-bold mb-3 text-center text-white">¡Registro Completado!</h2>

      <!-- Stickers Grid: 2 per row (child + parent side by side) -->
      <div class="grid grid-cols-2 gap-2 mb-4">
        <template v-for="checkIn in checkIns" :key="checkIn.id">
          <!-- Child Sticker Preview -->
          <div class="sticker-card bg-white rounded-lg border border-gray-300 flex flex-row" style="min-width:0;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.15);padding:6px 8px 5px 10px;height:160px">
            <!-- Left column -->
            <div class="flex flex-col flex-1 min-w-0 justify-between pr-2">
              <div class="flex-1 flex items-center">
                <div class="font-black text-black leading-tight break-words" style="font-size:1.4rem">
                  {{ checkIn.child.firstName }} {{ checkIn.child.lastName }}
                </div>
              </div>
              <div>
                <p class="font-bold text-black" style="font-size:0.6rem">Nombre padre/madre/responsable:</p>
                <p class="font-bold text-black truncate" style="font-size:0.65rem">{{ parentName }}</p>
                <hr class="border-black mt-1 mb-1.5" />
              </div>
              <p class="text-black uppercase" style="font-size:0.4rem;font-weight:600;letter-spacing:0.18em">FAVOR CONSERVE ESTE STICKER</p>
            </div>
            <!-- Right column -->
            <div class="flex flex-col shrink-0" style="width:108px">
              <div class="relative mb-1.5" style="height:46px">
                <img src="/ESTRELLAS_Sticker-03.png" class="absolute" style="top:0;right:14px;width:18px;height:18px" alt="" />
                <img src="/ESTRELLAS_Sticker-04.png" class="absolute" style="top:10px;right:0;width:7px;height:7px" alt="" />
                <img src="/ESTRELLAS_Sticker-06.png" class="absolute" style="top:3px;right:6px;width:4px;height:4px" alt="" />
                <img src="/ESTRELLAS_Sticker-05.png" class="absolute" style="bottom:0;right:0;width:18px;height:18px" alt="" />
                <img src="/ESTRELLAS_Sticker-04.png" class="absolute" style="top:20px;left:6px;width:7px;height:7px" alt="" />
                <div class="absolute bottom-0 left-0 flex items-center gap-1">
                  <img src="/Logo_CimaChurch.png" class="h-7" alt="Logo" />
                  <img src="/Logo_CimaKidsBlack.png" class="h-7" alt="Kids" />
                </div>
              </div>
              <div class="flex flex-col flex-1 justify-evenly">
                <div>
                  <p class="text-xs font-bold text-black">Edad:</p>
                  <div class="border border-black rounded-lg px-1 py-0.5 text-center text-xs text-black font-semibold">{{ calculateAge(checkIn.child.birthDate) }} años</div>
                </div>
                <div>
                  <p class="text-xs font-bold text-black">Hora:</p>
                  <div class="border border-black rounded-lg px-1 py-0.5 text-center text-xs text-black font-semibold">{{ formatTime(checkIn.checkInTime) }}</div>
                </div>
                <div>
                  <p class="text-xs font-bold text-black">Fecha:</p>
                  <div class="border border-black rounded-lg px-1 py-0.5 text-center text-xs text-black font-semibold">{{ formatDate(checkIn.checkInTime) }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Parent Sticker Preview -->
          <div class="sticker-card bg-white rounded-lg border border-gray-300 flex flex-row" style="min-width:0;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.15);padding:6px 8px 5px 10px;height:160px">
            <!-- Left column -->
            <div class="flex flex-col flex-1 min-w-0 justify-between pr-2">
              <div class="flex-1 flex items-center">
                <div class="font-black text-black leading-tight break-words" style="font-size:1.4rem">
                  {{ checkIn.child.firstName }} {{ checkIn.child.lastName }}
                </div>
              </div>
              <div>
                <p class="font-bold text-black" style="font-size:0.6rem">Nombre padre/madre/responsable:</p>
                <p class="font-bold text-black truncate" style="font-size:0.65rem">{{ parentName }}</p>
                <hr class="border-black mt-1 mb-1.5" />
              </div>
              <p class="text-black uppercase" style="font-size:0.4rem;font-weight:600;letter-spacing:0.18em">FAVOR CONSERVE ESTE STICKER</p>
            </div>
            <!-- Right column -->
            <div class="flex flex-col shrink-0" style="width:108px">
              <div class="relative mb-1.5" style="height:46px">
                <img src="/ESTRELLAS_Sticker-03.png" class="absolute" style="top:0;right:14px;width:18px;height:18px" alt="" />
                <img src="/ESTRELLAS_Sticker-04.png" class="absolute" style="top:10px;right:0;width:7px;height:7px" alt="" />
                <img src="/ESTRELLAS_Sticker-06.png" class="absolute" style="top:3px;right:6px;width:4px;height:4px" alt="" />
                <img src="/ESTRELLAS_Sticker-05.png" class="absolute" style="bottom:0;right:0;width:18px;height:18px" alt="" />
                <img src="/ESTRELLAS_Sticker-04.png" class="absolute" style="top:20px;left:6px;width:7px;height:7px" alt="" />
                <div class="absolute bottom-0 left-0 flex items-center gap-1">
                  <img src="/Logo_CimaChurch.png" class="h-7" alt="Logo" />
                  <img src="/Logo_CimaKidsBlack.png" class="h-7" alt="Kids" />
                </div>
              </div>
              <div class="flex flex-col flex-1 justify-evenly">
                <div>
                  <p class="text-xs font-bold text-black">Hora:</p>
                  <div class="border border-black rounded-lg px-1 py-0.5 text-center text-xs text-black font-semibold">{{ formatTime(checkIn.checkInTime) }}</div>
                </div>
                <div>
                  <p class="text-xs font-bold text-black">Fecha:</p>
                  <div class="border border-black rounded-lg px-1 py-0.5 text-center text-xs text-black font-semibold">{{ formatDate(checkIn.checkInTime) }}</div>
                </div>
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
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-col gap-3">
        <UiButton
          variant="primary"
          size="large"
          class="w-full"
          @click="handlePrint"
        >
          🖨 Imprimir Etiquetas (Tablet)
        </UiButton>

        <UiButton
          variant="secondary"
          size="large"
          class="w-full"
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
  parentName?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  done: []
  reset: []
}>()

const config = useRuntimeConfig()
const autoResetSeconds = parseInt(config.public.autoResetSeconds)

const { printStickers, formatTime, formatDate } = usePrint()

const showCountdown = ref(false)
const countdown = ref(autoResetSeconds)
let countdownInterval: ReturnType<typeof setInterval> | null = null

const handlePrint = () => {
  printStickers(props.checkIns, props.parentName ?? '')
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

onUnmounted(() => {
  stopCountdown()
})
</script>
