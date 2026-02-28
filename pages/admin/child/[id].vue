<script setup lang="ts">
// ensure admin middleware protects this page
definePageMeta({ middleware: 'admin' })

import { useAdmin } from '~/composables/useAdmin'
import type { ChildDetails } from '~/composables/useAdmin'
import UiButton from '~/components/ui/Button.vue'

const admin = useAdmin()
const child = ref<ChildDetails | null>(null)
const route = useRoute()

const formatDate = (d: string) => new Date(d).toLocaleDateString()
const formatDateTime = (d: string) => new Date(d).toLocaleString()

const load = async () => {
  try {
    child.value = await admin.fetchChild(route.params.id as string)
  } catch {}
}

const logout = () => {
  admin.logout()
  navigateTo('/admin')
}

const goBack = () => {
  navigateTo('/admin')
}

onMounted(load)
</script>

<template>
  <div class="min-h-screen bg-white py-8 px-4">
    <div class="text-center mb-4">
      <img src="/Logo_CimaKids.png" alt="Logo" class="mx-auto h-16" />
    </div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">Detalles del Niño</h1>
      <UiButton variant="secondary" @click="logout">
        Cerrar Sesión
      </UiButton>
    </div>

    <div v-if="admin.loading.value" class="text-center">Cargando...</div>
    <div v-else-if="admin.error.value" class="bg-red-100 text-red-700 p-3 rounded">
      {{ admin.error.value }}
    </div>
    <div v-else-if="child">
      <section class="mb-6">
        <h2 class="text-xl font-semibold mb-2">Información Básica</h2>
        <p><strong>Nombre:</strong> {{ child.firstName }} {{ child.lastName }}</p>
        <p><strong>Fecha de nacimiento:</strong> {{ formatDate(child.birthDate) }}</p>
        <p><strong>ID Familia:</strong> {{ child.family.parentId }}</p>
      </section>

      <section class="mb-6">
        <h2 class="text-xl font-semibold mb-2">Padres</h2>
        <ul class="list-disc ml-6">
          <li v-for="p in child.family.parents" :key="p.id">
            <div class="font-medium">{{ p.firstName }} {{ p.lastName }}</div>
            <div class="text-sm text-gray-600">Tel: {{ p.phone || '-' }}</div>
            <div class="text-sm text-gray-600">Dir: {{ p.address || '-' }}</div>
          </li>
        </ul>
      </section>

      <section>
        <h2 class="text-xl font-semibold mb-2">Historial de Registros</h2>
        <table class="w-full table-auto border-collapse">
          <thead>
            <tr class="bg-gray-100">
              <th class="border px-2 py-1">Código</th>
              <th class="border px-2 py-1">Entrada</th>
              <th class="border px-2 py-1">Salida</th>
              <th class="border px-2 py-1">Notas</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="ci in child.checkIns" :key="ci.id" class="hover:bg-gray-50">
              <td class="border px-2 py-1">{{ ci.checkInNumber }}</td>
              <td class="border px-2 py-1">{{ formatDateTime(ci.checkInTime) }}</td>
              <td class="border px-2 py-1">{{ ci.checkOutTime ? formatDateTime(ci.checkOutTime) : '-' }}</td>
              <td class="border px-2 py-1">{{ ci.notes || '-' }}</td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
    <div v-else>
      <p class="text-gray-500">Datos del niño no disponibles.</p>
    </div>

    <UiButton class="mt-6" @click="goBack">Volver</UiButton>
  </div>
</template>

