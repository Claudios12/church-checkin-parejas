export default defineNuxtRouteMiddleware((to, from) => {
  // this middleware runs both on client and server; only enforce on client side
  if (process.client) {
    const admin = useAdmin()
    if (!admin.isAdmin.value) {
      return navigateTo('/admin')
    }
  }
  // on the server we cannot reliably read localStorage, so just allow render
})