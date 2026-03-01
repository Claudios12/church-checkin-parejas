<script setup lang="ts">
definePageMeta({ middleware: 'admin' })

import { useAdmin } from '~/composables/useAdmin'
import type { ChildDetails } from '~/composables/useAdmin'
import UiButton from '~/components/ui/Button.vue'
import UiInput from '~/components/ui/Input.vue'

const admin = useAdmin()
const child = ref<ChildDetails | null>(null)
const route = useRoute()

const editingParentId = ref<string | null>(null)
const editForm = ref({ firstName: '', lastName: '', phone: '', address: '', documentId: '' })
const saving = ref(false)
const saveError = ref('')

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

const goBack = () => navigateTo('/admin')

const startEdit = (p: any) => {
  editingParentId.value = p.id
  editForm.value = {
    firstName: p.firstName,
    lastName: p.lastName,
    phone: p.phone || '',
    address: p.address || '',
    documentId: p.documentId || '',
  }
  saveError.value = ''
}

const cancelEdit = () => {
  editingParentId.value = null
  saveError.value = ''
}

const saveParent = async (parentId: string) => {
  saving.value = true
  saveError.value = ''
  try {
    await $fetch(`/api/admin/parent/${parentId}`, {
      method: 'PUT',
      headers: { 'x-admin-password': localStorage.getItem('admin_password') || '' },
      body: editForm.value,
    })
    editingParentId.value = null
    await load()
  } catch (e: any) {
    saveError.value = e.data?.statusMessage || 'Error al guardar'
  }
  saving.value = false
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
      <UiButton variant="secondary" @click="logout">Cerrar Sesión</UiButton>
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
        <div v-for="p in child.family.parents" :key="p.id" class="border rounded p-3 mb-3">

          <!-- View mode -->
          <div v-if="editingParentId !== p.id">
            <p class="font-medium">{{ p.firstName }} {{ p.lastName }}</p>
            <p class="text-sm text-gray-600">Cédula: {{ p.documentId || '-' }}</p>
            <p class="text-sm text-gray-600">Tel: {{ p.phone || '-' }}</p>
            <p class="text-sm text-gray-600">Dir: {{ p.address || '-' }}</p>
            <UiButton variant="secondary" size="small" class="mt-2" @click="startEdit(p)">
              Editar
            </UiButton>
          </div>

          <!-- Edit mode -->
          <div v-else class="space-y-2">
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="text-xs text-gray-500">Nombre</label>
                <UiInput v-model="editForm.firstName" placeholder="Nombre" />
              </div>
              <div>
                <label class="text-xs text-gray-500">Apellido</label>
                <UiInput v-model="editForm.lastName" placeholder="Apellido" />
              </div>
            </div>
            <div>
              <label class="text-xs text-gray-500">Cédula</label>
              <UiInput v-model="editForm.documentId" placeholder="Cédula" />
            </div>
            <div>
              <label class="text-xs text-gray-500">Teléfono</label>
              <UiInput v-model="editForm.phone" placeholder="Teléfono" />
            </div>
            <div>
              <label class="text-xs text-gray-500">Dirección</label>
              <UiInput v-model="editForm.address" placeholder="Dirección" />
            </div>
            <p v-if="saveError" class="text-red-600 text-sm">{{ saveError }}</p>
            <div class="flex gap-2">
              <UiButton :loading="saving" @click="saveParent(p.id)">Guardar</UiButton>
              <UiButton variant="secondary" @click="cancelEdit">Cancelar</UiButton>
            </div>
          </div>

        </div>
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
