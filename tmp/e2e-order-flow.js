const { chromium } = require("playwright")
const { createClient } = require("@supabase/supabase-js")

const BASE_URL = "http://localhost:3000"
const USER_EMAIL = "testuser@test.com"
const USER_PASSWORD = "Test1234!"
const ADMIN_EMAIL = "admin@test.com"
const ADMIN_PASSWORD = "Admin1234!"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)
const supabaseAdmin = process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  : null

const report = []
const consoleErrors = []
let capturedOrder = null
let userAuthId = null

function step(role, name, pass, detail, extra = {}) {
  report.push({ role, step: name, pass, detail, ...extra })
}

async function checkHttp(page, path, role, label) {
  const res = await page.goto(`${BASE_URL}${path}`, { waitUntil: "domcontentloaded" })
  const status = res ? res.status() : null
  const ok = status === 200 || status === 201
  step(role, `${label} (HTTP)`, ok, ok ? `status ${status}` : `status ${status}`, { status })
}

async function login(page, role, email, password, expectedPath) {
  await checkHttp(page, "/auth/login", role, "Open login page")
  let ok = false
  let lastUrl = page.url()

  for (let attempt = 1; attempt <= 2 && !ok; attempt++) {
    await page.fill("#email", email)
    await page.fill("#password", password)
    await page.click("button[type='submit']")
    try {
      await page.waitForURL(`**${expectedPath}**`, { timeout: 15000 })
    } catch (_) {
      await page.waitForTimeout(1500)
    }
    lastUrl = page.url()
    ok = lastUrl.includes(expectedPath)
  }

  step(role, `Login as ${role.toLowerCase()}`, ok, ok ? `redirected to ${expectedPath}` : `stuck at ${lastUrl}`)
}

async function run() {
  const browser = await chromium.launch({ headless: true })

  const userCtx = await browser.newContext()
  const adminCtx = await browser.newContext()
  for (const [ctxRole, ctx] of [["USER", userCtx], ["ADMIN", adminCtx]]) {
    ctx.on("console", (m) => {
      if (m.type() === "error") consoleErrors.push({ role: ctxRole, type: "console", text: m.text() })
    })
    ctx.on("pageerror", (e) => consoleErrors.push({ role: ctxRole, type: "pageerror", text: e.message }))
  }

  const userPage = await userCtx.newPage()
  await login(userPage, "USER", USER_EMAIL, USER_PASSWORD, "/dashboard")

  const userAuth = await supabase.auth.signInWithPassword({
    email: USER_EMAIL,
    password: USER_PASSWORD,
  })
  userAuthId = userAuth.error ? null : userAuth.data.user?.id || null

  const verifier = supabaseAdmin || supabase
  const { data: profile, error: profileErr } = await verifier
    .from("profiles")
    .select("id,email,role")
    .eq("id", userAuthId)
    .maybeSingle()
  step("USER", "Validate user profile in DB", !!profile && !profileErr, profileErr ? profileErr.message : profile ? `role=${profile.role}` : "profile not found")

  await checkHttp(userPage, "/dashboard/layanan", "USER", "Open layanan page")
  await userPage.waitForTimeout(3000)
  const orderCta = userPage.locator("button:has-text('Pesan Sekarang')")
  const ctaCount = await orderCta.count()
  const browsePass = ctaCount > 0
  step("USER", "Browse product and add to cart", browsePass, browsePass ? `${ctaCount} order CTA found` : "No order CTA found")

  // App currently has direct submit flow, no cart/checkout pages.
  const checkoutBits = await userPage.locator("text=/checkout|alamat|pembayaran/i").count()
  step(
    "USER",
    "Checkout -> address -> payment",
    checkoutBits > 0,
    checkoutBits > 0 ? "Checkout UI found" : "Checkout/address/payment UI not implemented in current app flow"
  )

  if (browsePass) {
    await orderCta.first().click()
    await userPage.waitForTimeout(800)
    await userPage.fill("#notes", `E2E ${new Date().toISOString()}`)
    await userPage.click("button:has-text('Kirim Pesanan')")
    await userPage.waitForTimeout(2500)
  }

  await checkHttp(userPage, "/dashboard/pesanan", "USER", "Open My Orders page")
  await userPage.waitForTimeout(1500)
  const firstOrderEl = userPage.locator("p.font-bold.text-foreground").first()
  const hasOrder = (await firstOrderEl.count()) > 0
  const orderNumber = hasOrder ? (await firstOrderEl.innerText()).trim() : null
  step("USER", "Submit order and capture order ID", !!orderNumber, orderNumber ? `order=${orderNumber}` : "Unable to capture order id")

  if (userAuthId) {
    const { data } = await supabase
      .from("orders")
      .select("id,order_number,status,customer_id,created_at")
      .eq("customer_id", userAuthId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()
    capturedOrder = data || null
  }
  step("USER", "Verify order persisted in DB", !!capturedOrder, capturedOrder ? `status=${capturedOrder.status}` : "Order not found in DB")

  const myOrdersHasStatus =
    (await userPage.locator("text=/Menunggu|Pending|Dikerjakan|Review|Revisi|Selesai|Dibatalkan/i").count()) > 0
  step("USER", "Check status in My Orders", myOrdersHasStatus, myOrdersHasStatus ? "Status badge visible" : "No status badge detected")

  const adminPage = await adminCtx.newPage()
  await login(adminPage, "ADMIN", ADMIN_EMAIL, ADMIN_PASSWORD, "/admin")
  await checkHttp(adminPage, "/admin/orders", "ADMIN", "Open orders dashboard")

  const orderForAdminLookup = capturedOrder?.order_number || orderNumber
  if (orderForAdminLookup) {
    const search = adminPage.locator("input[placeholder='Cari pesanan...']")
    if ((await search.count()) > 0) {
      await search.fill(orderForAdminLookup)
      await adminPage.waitForTimeout(2000)
    }
  }
  let hasOrderInAdmin = false
  if (orderForAdminLookup) {
    const tableBody = adminPage.locator("tbody")
    await adminPage.waitForTimeout(1000)
    const bodyText = (await tableBody.innerText().catch(() => "")) || ""
    hasOrderInAdmin = bodyText.includes(orderForAdminLookup)
  }
  step("ADMIN", "Find user order by order ID", hasOrderInAdmin, hasOrderInAdmin ? "Order found in admin list" : "Order not found in admin list")

  const updates = []
  if (capturedOrder?.id) {
    const statusClient = supabaseAdmin || supabase
    for (const status of ["in_progress", "review", "revision"]) {
      const result = await statusClient
        .from("orders")
        .update({ status })
        .eq("id", capturedOrder.id)
        .select("id,status")
        .single()
      updates.push({ to: status, ok: !result.error, err: result.error?.message || null })
    }
  }
  const adminUpdateOk = updates.length === 3 && updates.every((u) => u.ok)
  step("ADMIN", "Update status with valid transitions", adminUpdateOk, adminUpdateOk ? "pending->in_progress->review->revision applied" : JSON.stringify(updates))

  await userPage.reload({ waitUntil: "domcontentloaded" })
  await userPage.waitForTimeout(1500)
  const reflectOk = (await userPage.locator("text=/Review|Revisi|Dikerjakan/i").count()) > 0
  step("ADMIN", "Verify status reflects on user side", reflectOk, reflectOk ? "Updated status visible in user UI" : "Updated status not visible in user UI")

  step(
    "GLOBAL",
    "No console errors",
    consoleErrors.length === 0,
    consoleErrors.length === 0 ? "No browser errors" : `${consoleErrors.length} errors captured`,
    { consoleErrors }
  )

  await browser.close()

  const passed = report.filter((s) => s.pass).length
  const total = report.length
  console.log(JSON.stringify({ passed, total, report }, null, 2))
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
