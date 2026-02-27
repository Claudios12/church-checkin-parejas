export default defineEventHandler(async (event) => {
  const body = await readBody<{ password: string }>(event)
  const config = useRuntimeConfig()
  const valid = body.password === config.adminPassword
  return { success: valid }
})