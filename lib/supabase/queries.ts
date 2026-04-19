import { createClient } from "./client"

// Types matching the actual database schema
export interface Profile {
  id: string
  email: string | null
  full_name: string | null
  whatsapp: string | null
  role: "admin" | "customer"
  status: string | null
  avatar_url: string | null
  created_at: string
}

export interface Service {
  id: string
  nama: string
  deskripsi: string | null
  harga: number
  estimasi: string
  max_slots: number
  current_slots: number
  is_active: boolean
  created_at: string
}

export interface Order {
  id: string
  order_number: string
  customer_id: string
  service_id: string
  status: "pending" | "in_progress" | "review" | "revision" | "completed" | "cancelled"
  progress: number
  price: number
  deadline: string | null
  internal_notes: string | null
  approval_status: "pending_approval" | "approved" | "rejected"
  approved_at: string | null
  approved_by: string | null
  rejection_reason: string | null
  created_at: string
  updated_at: string
  // Joined data
  customer?: Profile
  service?: Service
}

const ALLOWED_ORDER_TRANSITIONS: Record<Order["status"], Order["status"][]> = {
  pending: ["in_progress", "cancelled"],
  in_progress: ["review", "revision", "cancelled"],
  review: ["revision", "completed", "cancelled"],
  revision: ["in_progress", "review", "cancelled"],
  completed: [],
  cancelled: [],
}

export interface OrderUpdate {
  id: string
  order_id: string
  message: string
  is_customer_visible: boolean
  created_at: string
}

export interface Invoice {
  id: string
  invoice_number: string
  order_id: string
  customer_id: string
  subtotal: number
  tax_percent: number
  total: number
  status: "unpaid" | "paid" | "overdue" | "partial"
  due_date: string
  notes: string | null
  paid_at: string | null
  created_at: string
  // Joined data
  customer?: Profile
  order?: Order
  items?: InvoiceItem[]
}

export interface InvoiceItem {
  id: string
  invoice_id: string
  nama_layanan: string
  qty: number
  harga_satuan: number
  subtotal: number
}

export interface Payment {
  id: string
  customer_id: string
  invoice_id: string
  jumlah: number
  metode: string | null
  created_at: string
  // Joined data
  invoice?: Invoice
}

export interface Message {
  id: string
  sender_id: string | null
  receiver_id: string | null
  content: string
  is_internal: boolean
  is_read: boolean
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  type: string
  title: string
  message: string
  link: string | null
  is_read: boolean
  created_at: string
}

// Helper function to format currency
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Helper function to format date
export function formatDate(dateString: string): string {
  if (!dateString) return "-"
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date)
}

// Helper function to get relative time
export function getRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return "Baru saja"
  if (diffMins < 60) return `${diffMins} menit lalu`
  if (diffHours < 24) return `${diffHours} jam lalu`
  if (diffDays < 7) return `${diffDays} hari lalu`
  return formatDate(dateString)
}

// ============ SERVICES ============

export async function getServices() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .order("created_at", { ascending: true })
  if (error) throw error
  return data as Service[]
}

export async function getActiveServices() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: true })
  if (error) throw error
  return data as Service[]
}

export async function getServiceById(id: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("id", id)
    .single()
  if (error) throw error
  return data as Service
}

export async function createService(service: Omit<Service, "id" | "created_at">) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("services")
    .insert(service)
    .select()
    .single()
  if (error) throw error
  return data as Service
}

export async function updateService(id: string, updates: Partial<Service>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("services")
    .update(updates)
    .eq("id", id)
    .select()
    .single()
  if (error) throw error
  return data as Service
}

export async function deleteService(id: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from("services")
    .delete()
    .eq("id", id)
  if (error) throw error
}

// ============ ORDERS ============

export async function getOrders() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("orders")
    .select(`
      *,
      customer:profiles!orders_customer_id_fkey(*),
      service:services(*)
    `)
    .order("created_at", { ascending: false })
  if (error) throw error
  return data as Order[]
}

export async function getOrdersByCustomer(customerId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("orders")
    .select(`*, service:services(*)`)
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false })
  if (error) throw error
  return data as Order[]
}

export async function getOrderById(id: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("orders")
    .select(`
      *,
      customer:profiles!orders_customer_id_fkey(*),
      service:services(*)
    `)
    .eq("id", id)
    .single()
  if (error) throw error
  return data as Order
}

export async function getOrderByOrderNumber(orderNumber: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("orders")
    .select(`
      *,
      customer:profiles!orders_customer_id_fkey(*),
      service:services(*)
    `)
    .eq("order_number", orderNumber)
    .single()
  if (error) throw error
  return data as Order
}

export async function createOrder(order: {
  customer_id: string
  service_id: string
  deadline?: string
  internal_notes?: string
}) {
  const supabase = createClient()

  const timestamp = Date.now().toString().slice(-6)
  const random = Math.floor(Math.random() * 100).toString().padStart(2, "0")
  const orderNumber = `CP-${timestamp}${random}`

  const { data, error } = await supabase
    .from("orders")
    .insert({
      ...order,
      order_number: orderNumber,
      status: "pending",
      progress: 0,
    })
    .select()
    .single()

  if (error) throw error
  return data as Order
}

export async function updateOrder(id: string, updates: Partial<Order>) {
  const supabase = createClient()

  if (updates.status) {
    const { data: existing, error: existingError } = await supabase
      .from("orders")
      .select("status, approval_status")
      .eq("id", id)
      .single()

    if (existingError) throw existingError

    const currentStatus = existing.status as Order["status"]
    const nextStatus = updates.status as Order["status"]
    const allowedNext = ALLOWED_ORDER_TRANSITIONS[currentStatus] || []

    if (currentStatus !== nextStatus && !allowedNext.includes(nextStatus)) {
      throw new Error(`Invalid order status transition: ${currentStatus} -> ${nextStatus}`)
    }

    if (nextStatus === "in_progress" && existing.approval_status !== "approved") {
      throw new Error("Order harus di-approve sebelum bisa mulai dikerjakan.")
    }
  }

  const { data, error } = await supabase
    .from("orders")
    .update(updates)
    .eq("id", id)
    .select()
    .single()
  if (error) throw error
  return data as Order
}

// ============ ORDER UPDATES ============

export async function getOrderUpdates(orderId: string, opts?: { visibleOnly?: boolean }) {
  const supabase = createClient()
  let query = supabase
    .from("order_updates")
    .select("*")
    .eq("order_id", orderId)

  if (opts?.visibleOnly) {
    query = query.eq("is_customer_visible", true)
  }

  const { data, error } = await query.order("created_at", { ascending: false })
  if (error) throw error
  return data as OrderUpdate[]
}

export async function createOrderUpdate(update: {
  order_id: string
  message: string
  is_customer_visible: boolean
}) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("order_updates")
    .insert(update)
    .select()
    .single()
  if (error) throw error
  return data as OrderUpdate
}

// ============ ORDER APPROVAL ============

export async function approveOrder(orderId: string, adminId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("orders")
    .update({
      approval_status: "approved",
      approved_at: new Date().toISOString(),
      approved_by: adminId,
      rejection_reason: null,
    })
    .eq("id", orderId)
    .select()
    .single()
  if (error) throw error
  return data as Order
}

export async function rejectOrder(orderId: string, adminId: string, reason: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("orders")
    .update({
      approval_status: "rejected",
      approved_at: null,
      approved_by: adminId,
      rejection_reason: reason,
    })
    .eq("id", orderId)
    .select()
    .single()
  if (error) throw error
  return data as Order
}

// ============ INVOICES ============

export async function getInvoices() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("invoices")
    .select(`
      *,
      customer:profiles!invoices_customer_id_fkey(*),
      order:orders(*),
      items:invoice_items(*)
    `)
    .order("created_at", { ascending: false })
  if (error) throw error
  return data as Invoice[]
}

export async function getInvoicesByCustomer(customerId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("invoices")
    .select(`*, order:orders(*), items:invoice_items(*)`)
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false })
  if (error) throw error
  return data as Invoice[]
}

export async function getInvoiceById(id: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("invoices")
    .select(`
      *,
      customer:profiles!invoices_customer_id_fkey(*),
      order:orders(*),
      items:invoice_items(*)
    `)
    .eq("id", id)
    .single()
  if (error) throw error
  return data as Invoice
}

export async function createInvoice(invoice: {
  order_id?: string | null
  customer_id: string
  subtotal: number
  tax_percent: number
  total: number
  due_date: string
  notes?: string
  items: { nama_layanan: string; qty: number; harga_satuan: number; subtotal: number }[]
}) {
  const supabase = createClient()
  const currentYear = new Date().getFullYear()
  const { count } = await supabase
    .from("invoices")
    .select("*", { count: "exact", head: true })

  const invoiceNumber = `INV-${currentYear}-${String((count || 0) + 1).padStart(3, "0")}`
  const insertData: any = {
    invoice_number: invoiceNumber,
    customer_id: invoice.customer_id,
    subtotal: invoice.subtotal,
    tax_percent: invoice.tax_percent,
    total: invoice.total,
    due_date: invoice.due_date,
    notes: invoice.notes,
    status: "unpaid",
  }
  if (invoice.order_id) {
    insertData.order_id = invoice.order_id
  }
  const { data: invoiceData, error: invoiceError } = await supabase
    .from("invoices")
    .insert(insertData)
    .select()
    .single()
  if (invoiceError) throw invoiceError

  const items = invoice.items.map(item => ({
    ...item,
    invoice_id: invoiceData.id,
  }))
  const { error: itemsError } = await supabase
    .from("invoice_items")
    .insert(items)
  if (itemsError) throw itemsError

  await createNotification({
    user_id: invoice.customer_id,
    type: "invoice",
    title: "Invoice Baru",
    message: `Invoice #${invoiceNumber} telah dikirim. Total: ${formatRupiah(invoice.total)}. Jatuh tempo: ${invoice.due_date}`,
    link: `/dashboard/invoice/${invoiceData.id}`,
  })

  return invoiceData as Invoice
}

export async function updateInvoice(id: string, updates: Partial<Invoice>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("invoices")
    .update(updates)
    .eq("id", id)
    .select()
    .single()
  if (error) throw error
  return data as Invoice
}

// ============ PAYMENTS ============

export async function getPayments() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("payments")
    .select(`
      *,
      invoice:invoices(
        *,
        customer:profiles!invoices_customer_id_fkey(*)
      )
    `)
    .order("created_at", { ascending: false })
  if (error) throw error
  return data as Payment[]
}

export async function createPayment(payment: {
  invoice_id: string
  customer_id: string
  jumlah: number
  metode?: string
}) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("payments")
    .insert(payment)
    .select()
    .single()
  if (error) throw error

  const { data: invoice } = await supabase
    .from("invoices")
    .select("total")
    .eq("id", payment.invoice_id)
    .single()

  const { data: payments } = await supabase
    .from("payments")
    .select("jumlah")
    .eq("invoice_id", payment.invoice_id)

  const totalPaid = (payments || []).reduce((sum, p) => sum + (p.jumlah || 0), 0)

  let newStatus = "unpaid"
  if (invoice && totalPaid >= invoice.total) {
    newStatus = "paid"
  } else if (invoice && totalPaid > 0) {
    newStatus = "partial"
  }

  await supabase
    .from("invoices")
    .update({
      status: newStatus,
      paid_at: newStatus === "paid" ? new Date().toISOString() : null,
    })
    .eq("id", payment.invoice_id)

  await notifyCustomerOfPayment(payment.invoice_id, payment.jumlah)

  return data as Payment
}

// ============ MESSAGES ============

export async function getMessages() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .order("created_at", { ascending: false })
  if (error) throw error
  return data as Message[]
}

export async function getMessagesByCustomer(customerId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .or(`sender_id.eq.${customerId},receiver_id.eq.${customerId}`)
    .eq("is_internal", false)
    .order("created_at", { ascending: true })
  if (error) throw error
  return data as Message[]
}

export async function createMessage(message: {
  sender_id?: string
  receiver_id?: string
  content: string
  is_internal?: boolean
}) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("messages")
    .insert({
      ...message,
      is_internal: message.is_internal || false,
      is_read: false,
    })
    .select()
    .single()
  if (error) throw error
  return data as Message
}

export async function markMessagesAsRead(customerId: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from("messages")
    .update({ is_read: true })
    .eq("receiver_id", customerId)
    .eq("is_read", false)
  if (error) throw error
}

// ============ NOTIFICATIONS ============

export async function getNotifications(userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(20)
  if (error) throw error
  return data as Notification[]
}

export async function getUnreadNotificationsCount(userId: string) {
  const supabase = createClient()
  const { count, error } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("is_read", false)
  if (error) throw error
  return count || 0
}

export async function markNotificationAsRead(id: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", id)
  if (error) throw error
}

export async function markAllNotificationsAsRead(userId: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", userId)
    .eq("is_read", false)
  if (error) throw error
}

// link optional — null kalau tidak ada tujuan navigasi
export async function createNotification(notification: {
  user_id: string
  type: string
  title: string
  message: string
  link?: string | null
}) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("notifications")
    .insert({
      ...notification,
      link: notification.link ?? null,
    })
    .select()
    .single()
  if (error) {
    console.error("createNotification error:", JSON.stringify(error))
    throw error
  }
  return data as Notification
}

export async function notifyAdminsOfNewOrder(orderInput: Order) {
  const supabase = createClient()
  const { data: admins, error: adminError } = await supabase
    .from("profiles")
    .select("id")
    .eq("role", "admin")
  if (adminError || !admins || admins.length === 0) return

  const { data: order } = await supabase
    .from("orders")
    .select(`
      *,
      customer:profiles!orders_customer_id_fkey(full_name, email),
      service:services(nama)
    `)
    .eq("id", orderInput.id)
    .single()

  const orderData = order || orderInput

  const notifications = admins.map(admin => ({
    user_id: admin.id,
    type: "new_order",
    title: "Pesanan Baru",
    message: `Pesanan baru masuk dari ${orderData.customer?.full_name || orderData.customer?.email || "Pelanggan"} untuk layanan ${orderData.service?.nama || "Layanan"}.`,
    link: `/admin/orders/${orderInput.id}`,
  }))

  const { error } = await supabase.from("notifications").insert(notifications)
  if (error) console.error("Failed to notify admins:", error)
}

export async function notifyCustomerOfPayment(invoiceId: string, amount: number) {
  const supabase = createClient()
  const { data: invoice, error } = await supabase
    .from("invoices")
    .select("id, invoice_number, customer_id")
    .eq("id", invoiceId)
    .single()
  if (error || !invoice) return
  await createNotification({
    user_id: invoice.customer_id,
    type: "payment",
    title: "Pembayaran Diterima",
    message: `Pembayaran sebesar ${formatRupiah(amount)} untuk Invoice #${invoice.invoice_number} telah berhasil dicatat. Terima kasih!`,
    link: `/dashboard/invoice/${invoiceId}`,  // ← pakai invoiceId langsung
  })
}

export async function getPaymentsByCustomer(customerId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("payments")
    .select(`
      *,
      invoice:invoices(
        id,
        invoice_number,
        total,
        status
      )
    `)
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false })
  if (error) throw error
  return data as Payment[]
}

// ============ PROFILES / CUSTOMERS ============

export async function getCustomers() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "customer")
    .order("created_at", { ascending: false })
  if (error) throw error
  return data as Profile[]
}

export async function getAdmins() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, full_name")
    .eq("role", "admin")
  if (error) throw error
  return data as Profile[]
}

export async function getOrdersForInvoice() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("orders")
    .select(`
      *,
      customer:profiles!orders_customer_id_fkey(id, full_name, email),
      service:services(*)
    `)
    .order("created_at", { ascending: false })
  if (error) throw error
  return data as Order[]
}

export async function getProfileById(id: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single()
  if (error) throw error
  return data as Profile
}

export async function updateProfile(id: string, updates: Partial<Profile>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", id)
    .select()
    .single()
  if (error) throw error
  return data as Profile
}

export async function deleteCustomer(id: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from("profiles")
    .delete()
    .eq("id", id)
  if (error) throw error
}

// ============ DASHBOARD STATS ============

export async function getAdminDashboardStats() {
  const supabase = createClient()

  const { data: orders } = await supabase
    .from("orders")
    .select("status")

  const { data: invoices } = await supabase
    .from("invoices")
    .select("total, tax_percent, status, paid_at")

  const { data: payments } = await supabase
    .from("payments")
    .select("jumlah")

  const { count: unreadMessages } = await supabase
    .from("messages")
    .select("*", { count: "exact", head: true })
    .eq("is_read", false)
    .is("sender_id", null)

  const totalRevenue = payments?.reduce((sum, p) => sum + (p.jumlah || 0), 0) || 0

  return {
    totalOrders: orders?.length || 0,
    activeOrders: orders?.filter(o => ["pending", "in_progress", "review", "revision"].includes(o.status)).length || 0,
    completedOrders: orders?.filter(o => o.status === "completed").length || 0,
    totalRevenue,
    overdueInvoices: invoices?.filter(i => i.status === "overdue").length || 0,
    unpaidInvoices: invoices?.filter(i => i.status === "unpaid" || i.status === "partial").length || 0,
    unreadMessages: unreadMessages || 0,
  }
}

export async function getCustomerDashboardStats(customerId: string) {
  const supabase = createClient()

  const { data: orders } = await supabase
    .from("orders")
    .select("status")
    .eq("customer_id", customerId)

  const { data: payments } = await supabase
    .from("payments")
    .select("jumlah")
    .eq("customer_id", customerId)

  const { data: invoices } = await supabase
    .from("invoices")
    .select("status")
    .eq("customer_id", customerId)

  return {
    totalOrders: orders?.length || 0,
    activeOrders: orders?.filter(o => ["pending", "in_progress", "review", "revision"].includes(o.status)).length || 0,
    completedOrders: orders?.filter(o => o.status === "completed").length || 0,
    totalSpent: payments?.reduce((sum, p) => sum + (p.jumlah || 0), 0) || 0,
    unpaidInvoices: invoices?.filter(i => ["unpaid", "partial", "overdue"].includes(i.status)).length || 0,
  }
}

// ============ REVENUE DATA ============

export async function getMonthlyRevenue(year: number = new Date().getFullYear()) {
  const supabase = createClient()

  const { data: payments } = await supabase
    .from("payments")
    .select("jumlah, created_at")
    .gte("created_at", `${year}-01-01`)
    .lt("created_at", `${year + 1}-01-01`)

  const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"]

  return months.map((month, i) => ({
    month,
    revenue: payments
      ?.filter(p => new Date(p.created_at).getMonth() === i)
      .reduce((sum, p) => sum + (p.jumlah || 0), 0) || 0,
  }))
}