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

const linkingParent = ref(false)
const linkSearch = ref('')
const linkResults = ref<any[]>([])
const linkSearching = ref(false)
const linkError = ref('')

const editingChild = ref(false)
const childForm = ref({ firstName: '', lastName: '', birthDate: '' })
const savingChild = ref(false)
const childSaveError = ref('')

const formatDate = (d: string) => new Date(d.split('T')[0] + 'T12:00:00').toLocaleDateString()
const formatDateTime = (d: string) => new Date(d).toLocaleString()

const toInputDate = (d: string) => d.split('T')[0]

const getAge = (d: string) => {
  const today = new Date()
  const birth = new Date(d.split('T')[0] + 'T12:00:00')
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age
}

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

const startEditChild = () => {
  if (!child.value) return
  childForm.value = {
    firstName: child.value.firstName,
    lastName: child.value.lastName,
    birthDate: toInputDate(child.value.birthDate),
  }
  childSaveError.value = ''
  editingChild.value = true
}

const cancelEditChild = () => {
  editingChild.value = false
  childSaveError.value = ''
}

const saveChild = async () => {
  if (!child.value) return
  savingChild.value = true
  childSaveError.value = ''
  try {
    await $fetch(`/api/admin/child/${child.value.id}`, {
      method: 'PUT' as const,
      headers: { 'x-admin-password': localStorage.getItem('admin_password') || '' },
      body: childForm.value,
    })
    editingChild.value = false
    await load()
  } catch (e: any) {
    childSaveError.value = e.data?.statusMessage || 'Error al guardar'
  }
  savingChild.value = false
}

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

const unlinkParent = async (p: any) => {
  if (!confirm(`¿Desvincular a ${p.firstName} ${p.lastName} de esta familia? Esta acción no se puede deshacer.`)) return
  try {
    await $fetch(`/api/admin/parent/${p.id}`, {
      method: 'DELETE' as const,
      headers: { 'x-admin-password': localStorage.getItem('admin_password') || '' },
    })
    await load()
  } catch (e: any) {
    alert('Error al desvincular: ' + (e.data?.statusMessage || e.message))
  }
}

const saveParent = async (parentId: string) => {
  saving.value = true
  saveError.value = ''
  try {
    await $fetch(`/api/admin/parent/${parentId}`, {
      method: 'PUT' as const,
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

const startLinkParent = () => {
  linkingParent.value = true
  linkSearch.value = ''
  linkResults.value = []
  linkError.value = ''
}

const cancelLinkParent = () => {
  linkingParent.value = false
  linkResults.value = []
  linkError.value = ''
}

const searchParents = async () => {
  if (!linkSearch.value.trim()) return
  linkSearching.value = true
  linkError.value = ''
  try {
    const data = await $fetch<{ parents: any[] }>('/api/admin/parent/search', {
      headers: { 'x-admin-password': localStorage.getItem('admin_password') || '' },
      query: { term: linkSearch.value.trim() },
    })
    linkResults.value = data.parents
    if (!data.parents.length) linkError.value = 'No se encontraron padres'
  } catch {
    linkError.value = 'Error al buscar'
  }
  linkSearching.value = false
}

const linkToParent = async (targetFamilyId: string, parentName: string) => {
  if (!child.value) return
  if (!confirm(`¿Vincular a ${child.value.firstName} con la familia de ${parentName}?`)) return
  try {
    await $fetch(`/api/admin/child/${child.value.id}/link`, {
      method: 'POST' as const,
      headers: { 'x-admin-password': localStorage.getItem('admin_password') || '' },
      body: { familyId: targetFamilyId },
    })
    cancelLinkParent()
    await load()
  } catch (e: any) {
    linkError.value = e.data?.statusMessage || 'Error al vincular'
  }
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

      <!-- Child info -->
      <section class="mb-6 border rounded p-4">
        <div class="flex justify-between items-center mb-2">
          <h2 class="text-xl font-semibold">Información Básica</h2>
          <UiButton v-if="!editingChild" variant="secondary" size="small" @click="startEditChild">Editar</UiButton>
        </div>

        <!-- View mode -->
        <div v-if="!editingChild">
          <p><strong>Nombre:</strong> {{ child.firstName }} {{ child.lastName }}</p>
          <p><strong>Fecha de nacimiento:</strong> {{ formatDate(child.birthDate) }} <span class="text-gray-500">({{ getAge(child.birthDate) }} años)</span></p>
          <p><strong>ID Familia:</strong> {{ child.family.parentId }}</p>
          <span v-if="child.family.isVisitor" class="inline-block mt-1 bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-0.5 rounded">VISITANTE</span>
        </div>

        <!-- Edit mode -->
        <div v-else class="space-y-2">
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="text-xs text-gray-500">Nombre</label>
              <UiInput v-model="childForm.firstName" placeholder="Nombre" />
            </div>
            <div>
              <label class="text-xs text-gray-500">Apellido</label>
              <UiInput v-model="childForm.lastName" placeholder="Apellido" />
            </div>
          </div>
          <div>
            <label class="text-xs text-gray-500">Fecha de nacimiento</label>
            <input
              v-model="childForm.birthDate"
              type="date"
              class="w-full border rounded px-3 py-2 text-base"
            />
          </div>
          <p v-if="childSaveError" class="text-red-600 text-sm">{{ childSaveError }}</p>
          <div class="flex gap-2">
            <UiButton :loading="savingChild" @click="saveChild">Guardar</UiButton>
            <UiButton variant="secondary" @click="cancelEditChild">Cancelar</UiButton>
          </div>
        </div>
      </section>

      <!-- Parents -->
      <section class="mb-6">
        <div class="flex justify-between items-center mb-2">
          <h2 class="text-xl font-semibold">Padres</h2>
          <UiButton v-if="!linkingParent" variant="secondary" size="small" @click="startLinkParent">+ Vincular padre</UiButton>
        </div>

        <!-- Link parent panel -->
        <div v-if="linkingParent" class="border rounded p-3 mb-3 bg-blue-50">
          <p class="font-medium text-sm mb-2">Buscar padre por cédula o nombre:</p>
          <div class="flex gap-2">
            <UiInput v-model="linkSearch" placeholder="Cédula o nombre..." class="flex-1" @keyup.enter="searchParents" />
            <UiButton :loading="linkSearching" @click="searchParents">Buscar</UiButton>
            <UiButton variant="secondary" @click="cancelLinkParent">Cancelar</UiButton>
          </div>
          <p v-if="linkError" class="text-red-600 text-sm mt-1">{{ linkError }}</p>
          <div v-for="r in linkResults" :key="r.id" class="mt-2 border rounded p-2 bg-white flex justify-between items-center">
            <div>
              <p class="font-medium">{{ r.firstName }} {{ r.lastName }}</p>
              <p class="text-xs text-gray-500">Cédula: {{ r.documentId || '-' }} | Tel: {{ r.phone || '-' }}</p>
              <p class="text-xs text-gray-500">Hijos: {{ r.children.map((c: any) => `${c.firstName} ${c.lastName}`).join(', ') || 'ninguno' }}</p>
            </div>
            <UiButton size="small" @click="linkToParent(r.familyId, `${r.firstName} ${r.lastName}`)">Vincular</UiButton>
          </div>
        </div>

        <div v-for="p in child.family.parents" :key="p.id" class="border rounded p-3 mb-3">

          <!-- View mode -->
          <div v-if="editingParentId !== p.id">
            <p class="font-medium">{{ p.firstName }} {{ p.lastName }}</p>
            <p class="text-sm text-gray-600">Cédula: {{ p.documentId || '-' }}</p>
            <p class="text-sm text-gray-600">Tel: {{ p.phone || '-' }}</p>
            <p class="text-sm text-gray-600">Dir: {{ p.address || '-' }}</p>
            <div class="flex gap-2 mt-2">
              <UiButton variant="secondary" size="small" @click="startEdit(p)">Editar</UiButton>
              <UiButton variant="danger" size="small" @click="unlinkParent(p)">Desvincular</UiButton>
            </div>
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

      <!-- Check-in history -->
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
