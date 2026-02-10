export interface Parent {
  firstName: string
  lastName: string
}

export interface Child {
  id?: string
  firstName: string
  lastName: string
  birthDate: string
}

export interface CheckInFormData {
  parentId: string
  parents: Parent[]
  children: Child[]
}

export interface CheckInResult {
  id: string
  checkInNumber: string
  checkInTime: string
  child: {
    id: string
    firstName: string
    lastName: string
    birthDate: string
  }
  family: {
    id: string
    lastName: string
    parentId: string
  }
}

export interface FamilySearchResult {
  found: boolean
  family: {
    id: string
    parentId: string
    parents: Array<{
      id: string
      firstName: string
      lastName: string
    }>
    children: Array<{
      id: string
      firstName: string
      lastName: string
      birthDate: string
    }>
  } | null
}

export const useCheckIn = () => {
  const loading = ref(false)
  const error = ref<string | null>(null)

  const createCheckIn = async (formData: CheckInFormData): Promise<CheckInResult[]> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<{ success: boolean; checkIns: CheckInResult[] }>(
        '/api/checkin',
        {
          method: 'POST',
          body: formData,
        }
      )

      return response.checkIns
    } catch (err: any) {
      error.value = err.data?.message || err.message || 'Failed to create check-in'
      throw err
    } finally {
      loading.value = false
    }
  }

  const searchFamily = async (parentId: string): Promise<FamilySearchResult> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<FamilySearchResult>('/api/family/search', {
        params: { id: parentId },
      })

      return response
    } catch (err: any) {
      error.value = err.data?.message || err.message || 'Failed to search family'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    loading: readonly(loading),
    error: readonly(error),
    createCheckIn,
    searchFamily,
  }
}
