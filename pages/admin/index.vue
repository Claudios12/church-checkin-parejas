<template>
  <div class="min-h-screen bg-white py-8 px-4">
    <div class="text-center mb-6">
      <img src="/Logo_CimaKids.png" alt="Logo" class="mx-auto h-20" />
    </div>
    <h1 class="text-4xl font-bold mb-6 text-center">Admin Dashboard</h1>

    <!-- login form if not admin -->
    <div v-if="!admin.isAdmin.value" class="max-w-sm mx-auto">
      <div v-if="admin.error.value" class="bg-red-100 text-red-700 p-3 rounded mb-4">
        {{ admin.error.value }}
      </div>
      <UiInput
        v-model="password"
        type="password"
        placeholder="Admin password"
        class="mb-4"
      />
      <UiButton :loading="admin.loading.value" @click="handleLogin">
        Log in
      </UiButton>
    </div>

    <!-- search interface -->
    <div v-else>
      <div class="flex justify-between items-center mb-4">
        <UiInput
          v-model="searchName"
          placeholder="Child name"
          class="flex-grow mr-2"
        />
        <UiButton :loading="admin.loading.value" @click="doSearch">
          Search
        </UiButton>
        <UiButton variant="secondary" @click="admin.logout()">
          Log out
        </UiButton>
      </div>

      <div v-if="results.length">
        <ul class="divide-y">
          <li
            v-for="child in results"
            :key="child.id"
            class="py-2 hover:bg-gray-100 cursor-pointer"
            @click="gotoChild(child.id)"
          >
            {{ child.firstName }} {{ child.lastName }}
          </li>
        </ul>
      </div>
      <div v-else-if="searched">
        <p class="text-gray-500">No children found.</p>
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
</script>
