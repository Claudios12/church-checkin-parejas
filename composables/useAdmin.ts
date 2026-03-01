export interface ChildSummary {
  id: string
  firstName: string
  lastName: string
  birthDate?: string
  isVisitor?: boolean
}

export interface ParentInfo {
  id: string
  firstName: string
  lastName: string
  phone?: string
  address?: string
  documentId?: string
}

export interface CheckInRecord {
  id: string
  checkInNumber: string
  checkInTime: string
  checkOutTime: string | null
  notes: string | null
}

export interface ChildDetails {
  id: string
  firstName: string
  lastName: string
  birthDate: string
  family: {
    id: string
    parentId: string
    isVisitor: boolean
    parents: ParentInfo[]
  }
  checkIns: CheckInRecord[]
}

const ADMIN_STORAGE_KEY = 'admin_password'

export const useAdmin = () => {
  const isAdmin = ref(false)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const getAuthHeader = (): HeadersInit => {
    const pwd = localStorage.getItem(ADMIN_STORAGE_KEY)
    if (pwd) {
      return { 'x-admin-password': pwd }
    }
    return {}
  }

  const login = async (password: string) => {
    loading.value = true
    error.value = null
    try {
      const resp = await $fetch<{ success: boolean }>('/api/admin/login', {
        method: 'POST',
        body: { password },
      })
      if (resp.success) {
        isAdmin.value = true
        localStorage.setItem(ADMIN_STORAGE_KEY, password)
      } else {
        throw new Error('Incorrect password')
      }
    } catch (err: any) {
      error.value = err.message || 'Login failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  const logout = () => {
    isAdmin.value = false
    localStorage.removeItem(ADMIN_STORAGE_KEY)
  }

  const searchChildren = async (name: string): Promise<ChildSummary[]> => {
    loading.value = true
    error.value = null
    try {
      const resp = await $fetch<{ children: ChildSummary[] }>('/api/admin/children/search', {
        params: { name },
        headers: getAuthHeader(),
      })
      return resp.children
    } catch (err: any) {
      error.value = err.message || 'Search failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchChild = async (id: string): Promise<ChildDetails> => {
    loading.value = true
    error.value = null
    try {
      const resp = await $fetch<any>('/api/admin/child', {
        params: { id },
        headers: getAuthHeader(),
      })
      if (!resp.found) {
        throw new Error('Child not found')
      }
      return resp.child as ChildDetails
    } catch (err: any) {
      error.value = err.message || 'Fetch failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  const init = () => {
    const pwd = localStorage.getItem(ADMIN_STORAGE_KEY)
    if (pwd) {
      // optionally verify by pinging login endpoint? we'll assume valid
      isAdmin.value = true
    }
  }

  // call init when composable is used
  if (process.client) {
    init()
  }

  return {
    isAdmin: readonly(isAdmin),
    loading: readonly(loading),
    error: readonly(error),
    login,
    logout,
    searchChildren,
    fetchChild,
  }
}
