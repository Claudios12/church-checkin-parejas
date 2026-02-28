<template>
  <div class="min-h-screen bg-white py-8 px-4">
    <div class="text-center mb-6">
      <img src="/Logo_CimaKids.png" alt="Logo" class="mx-auto h-20" />
    </div>
    <h1 class="text-4xl font-bold mb-6 text-center">Panel de Administración</h1>

    <!-- login form if not admin -->
    <div v-if="!admin.isAdmin.value" class="max-w-sm mx-auto">
      <div v-if="admin.error.value" class="bg-red-100 text-red-700 p-3 rounded mb-4">
        {{ admin.error.value }}
      </div>
      <UiInput v-model="password" type="password" placeholder="Contraseña" class="mb-4" />
      <UiButton :loading="admin.loading.value" @click="handleLogin">
        Iniciar Sesión
      </UiButton>
    </div>

    <!-- search interface -->
    <div v-else class="max-w-2xl mx-auto">
      <div class="flex justify-between items-center mb-4 gap-2">
        <UiInput v-model="searchName" placeholder="Nombre del niño" class="flex-grow" />
        <UiButton :loading="admin.loading.value" @click="doSearch">Buscar</UiButton>
        <UiButton variant="secondary" @click="admin.logout()">Cerrar Sesión</UiButton>
      </div>

      <!-- Search results -->
      <div v-if="results.length">
        <ul class="divide-y border rounded">
          <li
            v-for="child in results"
            :key="child.id"
            class="py-3 px-4 hover:bg-gray-100 cursor-pointer"
            @click="gotoChild(child.id)"
          >
            {{ child.firstName }} {{ child.lastName }}
          </li>
        </ul>
      </div>
      <div v-else-if="searched">
        <p class="text-gray-500">No se encontraron niños.</p>
      </div>

      <!-- Duplicates section -->
      <div class="mt-8">
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-xl font-bold">Familias Duplicadas</h2>
          <UiButton variant="secondary" :loading="loadingDuplicates" @click="loadDuplicates">
            Buscar Duplicados
          </UiButton>
        </div>

        <div v-if="duplicatesChecked && duplicates.length === 0" class="text-green-600 text-sm">
          ✓ No se encontraron niños duplicados.
        </div>

        <div v-for="dup in duplicates" :key="dup.firstName + dup.lastName + dup.birthDate" class="border rounded p-4 mb-3 bg-yellow-50">
          <p class="font-bold text-gray-800 mb-2">
            {{ dup.firstName }} {{ dup.lastName }}
            <span class="text-sm font-normal text-gray-500 ml-2">— {{ formatDate(dup.birthDate) }}</span>
          </p>
          <div class="space-y-2 mb-3">
            <div
              v-for="(fam, i) in dup.families"
              :key="fam.familyId"
              class="text-sm flex items-center gap-2"
            >
              <span class="bg-gray-200 rounded px-2 py-0.5">Familia {{ i + 1 }}</span>
              <span>Padres: {{ fam.parents.join(', ') || '—' }}</span>
            </div>
          </div>
          <p class="text-xs text-gray-500 mb-2">
            Unir mantendrá la Familia 1 y moverá todo de la Familia 2 hacia ella.
          </p>
          <UiButton
            variant="primary"
            size="small"
            :loading="mergingId === dup.firstName + dup.lastName"
            @click="mergeFamilies(dup)"
          >
            Unir Familias
          </UiButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAdmin } from '~/composables/useAdmin'
import UiInput from '~/components/ui/Input.vue'
import UiButton from '~/components/ui/Button.vue'

const admin = useAdmin()
const password = ref('')
const searchName = ref('')
const results = ref<Array<{ id: string; firstName: string; lastName: string }>>([])
const searched = ref(false)

const duplicates = ref<any[]>([])
const loadingDuplicates = ref(false)
const duplicatesChecked = ref(false)
const mergingId = ref('')

const formatDate = (d: string) => new Date(d).toLocaleDateString('es-CO')

const handleLogin = async () => {
  try {
    await admin.login(password.value)
    password.value = ''
  } catch {}
}

const doSearch = async () => {
  searched.value = true
  try {
    results.value = await admin.searchChildren(searchName.value)
  } catch {}
}

const gotoChild = (id: string) => {
  navigateTo(`/admin/child/${id}`)
}

const loadDuplicates = async () => {
  loadingDuplicates.value = true
  duplicatesChecked.value = false
  try {
    const resp = await $fetch<{ duplicates: any[] }>('/api/admin/duplicates', {
      headers: { 'x-admin-password': localStorage.getItem('admin_password') || '' },
    })
    duplicates.value = resp.duplicates
    duplicatesChecked.value = true
  } catch {}
  loadingDuplicates.value = false
}

const mergeFamilies = async (dup: any) => {
  if (!confirm(`¿Unir las dos familias de ${dup.firstName} ${dup.lastName}? Esta acción no se puede deshacer.`)) return

  mergingId.value = dup.firstName + dup.lastName
  try {
    await $fetch('/api/admin/merge', {
      method: 'POST',
      headers: { 'x-admin-password': localStorage.getItem('admin_password') || '' },
      body: {
        keepFamilyId: dup.families[0].familyId,
        removeFamilyId: dup.families[1].familyId,
      },
    })
    await loadDuplicates()
  } catch (e: any) {
    alert('Error al unir: ' + (e.data?.statusMessage || e.message))
  }
  mergingId.value = ''
}
</script>
