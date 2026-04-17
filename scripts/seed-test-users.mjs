import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
}

const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const seedUsers = [
  {
    email: "testuser@test.com",
    password: "Test1234!",
    name: "Test User",
    role: "customer",
  },
  {
    email: "admin@test.com",
    password: "Admin1234!",
    name: "Admin Test",
    role: "admin",
  },
]

async function createOrUpdateAuthUser(user) {
  const list = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 })
  if (list.error) throw list.error

  const existing = list.data.users.find((u) => u.email?.toLowerCase() === user.email.toLowerCase())
  if (existing) {
    const updated = await admin.auth.admin.updateUserById(existing.id, {
      password: user.password,
      user_metadata: {
        nama: user.name,
        role: user.role,
      },
      email_confirm: true,
    })
    if (updated.error) throw updated.error
    return updated.data.user
  }

  const created = await admin.auth.admin.createUser({
    email: user.email,
    password: user.password,
    email_confirm: true,
    user_metadata: {
      nama: user.name,
      role: user.role,
    },
  })
  if (created.error) throw created.error
  return created.data.user
}

async function ensureProfile(authUser, user) {
  const upsert = await admin.from("profiles").upsert(
    {
      id: authUser.id,
      full_name: user.name,
      email: user.email,
      role: user.role,
    },
    { onConflict: "id" }
  )
  if (upsert.error) throw upsert.error
}

for (const user of seedUsers) {
  const authUser = await createOrUpdateAuthUser(user)
  await ensureProfile(authUser, user)
  console.log(`Seeded ${user.email} with role=${user.role}`)
}

console.log("Seed test users complete.")
