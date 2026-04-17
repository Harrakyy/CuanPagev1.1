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
  message: string
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

export async function createOrder(order: {
  customer_id: string
  service_id: string
  deadline?: string
  internal_notes?: string
}) {
  const supabase = createClient()
  const { count } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
  const orderNumber = `CP-${String((count || 0) + 1).padStart(3, "0")}`
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
      .select("status")
      .eq("id", id)
      .single()

    if (existingError) throw existingError

    const currentStatus = existing.status as Order["status"]
    const nextStatus = updates.status as Order["status"]
    const allowedNext = ALLOWED_ORDER_TRANSITIONS[currentStatus] || []

    if (currentStatus !== nextStatus && !allowedNext.includes(nextStatus)) {
      throw new Error(`Invalid order status transition: ${currentStatus} -> ${nextStatus}`)
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

export async function getOrderUpdates(orderId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("order_updates")
    .select("*")
    .eq("order_id", orderId)
    .order("created_at", { ascending: false })
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
  order_id: string
  customer_id: string
  subtotal: number
  tax_percent: number
  total: number
  due_date: string
  notes?: string
  items: { nama_layanan: string; qty: number; harga_satuan: number; subtotal: number }[]
}) {
  const supabase = createClient()
  const { count } = await supabase
    .from("invoices")
    .select("*", { count: "exact", head: true })
  const invoiceNumber = `INV-${String((count || 0) + 1).padStart(3, "0")}`
  const { data: invoiceData, error: invoiceError } = await supabase
    .from("invoices")
    .insert({
      invoice_number: invoiceNumber,
      order_id: invoice.order_id,
      customer_id: invoice.customer_id,
      subtotal: invoice.subtotal,
      tax_percent: invoice.tax_percent,
      total: invoice.total,
      due_date: invoice.due_date,
      notes: invoice.notes,
      status: "unpaid",
    })
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

  // Update invoice status to paid
  await supabase
    .from("invoices")
    .update({ status: "paid", paid_at: new Date().toISOString() })
    .eq("id", payment.invoice_id)

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

export async function createNotification(notification: {
  user_id: string
  type: string
  message: string
}) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("notifications")
    .insert({ ...notification, is_read: false })
    .select()
    .single()
  if (error) throw error
  return data as Notification
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
    .is("sender_id", null) // messages from customers have no sender_id (or adjust as needed)

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