import { createClient } from "./client"
import { createClient as createServerClient } from "./server"

// Types matching the database schema
export interface Profile {
  id: string
  email: string | null
  full_name: string | null
  whatsapp: string | null
  role: "admin" | "customer"
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Service {
  id: string
  name: string
  description: string | null
  price: number
  estimated_days: number
  max_slots: number
  filled_slots: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  order_number: string
  customer_id: string
  service_id: string
  status: "pending" | "in_progress" | "review" | "revision" | "completed" | "cancelled"
  progress: number
  price: number
  notes: string | null
  deadline: string | null
  created_at: string
  updated_at: string
  // Joined data
  customer?: Profile
  service?: Service
}

export interface OrderUpdate {
  id: string
  order_id: string
  title: string
  description: string | null
  progress: number
  created_by: string
  created_at: string
}

export interface Invoice {
  id: string
  invoice_number: string
  order_id: string
  customer_id: string
  subtotal: number
  tax: number
  total: number
  status: "unpaid" | "paid" | "overdue" | "partial"
  paid_amount: number
  due_date: string
  created_at: string
  updated_at: string
  // Joined data
  customer?: Profile
  order?: Order
  items?: InvoiceItem[]
}

export interface InvoiceItem {
  id: string
  invoice_id: string
  description: string
  quantity: number
  unit_price: number
  total: number
}

export interface Payment {
  id: string
  invoice_id: string
  amount: number
  payment_method: string | null
  payment_proof: string | null
  notes: string | null
  created_at: string
  // Joined data
  invoice?: Invoice
}

export interface Message {
  id: string
  customer_id: string
  content: string
  sender: "admin" | "customer"
  is_internal: boolean
  is_read: boolean
  created_at: string
  // Joined data
  customer?: Profile
}

export interface Notification {
  id: string
  user_id: string
  type: "order" | "invoice" | "message" | "deadline" | "payment"
  title: string
  description: string | null
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

// ============ CLIENT-SIDE QUERIES ============

export function useSupabaseClient() {
  return createClient()
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

export async function createService(service: Omit<Service, "id" | "created_at" | "updated_at">) {
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
    .select(`
      *,
      service:services(*)
    `)
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

export async function getOrderByNumber(orderNumber: string) {
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
  price: number
  notes?: string
  deadline?: string
}) {
  const supabase = createClient()
  
  // Generate order number
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
  title: string
  description?: string
  progress: number
  created_by: string
}) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("order_updates")
    .insert(update)
    .select()
    .single()
  
  if (error) throw error
  
  // Also update the order's progress
  await supabase
    .from("orders")
    .update({ progress: update.progress })
    .eq("id", update.order_id)
  
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
    .select(`
      *,
      order:orders(*),
      items:invoice_items(*)
    `)
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

export async function getInvoiceByNumber(invoiceNumber: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("invoices")
    .select(`
      *,
      customer:profiles!invoices_customer_id_fkey(*),
      order:orders(*),
      items:invoice_items(*)
    `)
    .eq("invoice_number", invoiceNumber)
    .single()
  
  if (error) throw error
  return data as Invoice
}

export async function createInvoice(invoice: {
  order_id: string
  customer_id: string
  subtotal: number
  tax: number
  total: number
  due_date: string
  items: { description: string; quantity: number; unit_price: number; total: number }[]
}) {
  const supabase = createClient()
  
  // Generate invoice number
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
      tax: invoice.tax,
      total: invoice.total,
      due_date: invoice.due_date,
      status: "unpaid",
      paid_amount: 0,
    })
    .select()
    .single()
  
  if (invoiceError) throw invoiceError
  
  // Insert invoice items
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
  amount: number
  payment_method?: string
  payment_proof?: string
  notes?: string
}) {
  const supabase = createClient()
  
  // Insert payment
  const { data, error } = await supabase
    .from("payments")
    .insert(payment)
    .select()
    .single()
  
  if (error) throw error
  
  // Update invoice paid amount and status
  const { data: invoice } = await supabase
    .from("invoices")
    .select("total, paid_amount")
    .eq("id", payment.invoice_id)
    .single()
  
  if (invoice) {
    const newPaidAmount = (invoice.paid_amount || 0) + payment.amount
    const newStatus = newPaidAmount >= invoice.total ? "paid" : "partial"
    
    await supabase
      .from("invoices")
      .update({ paid_amount: newPaidAmount, status: newStatus })
      .eq("id", payment.invoice_id)
  }
  
  return data as Payment
}

// ============ MESSAGES ============

export async function getMessages() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("messages")
    .select(`
      *,
      customer:profiles!messages_customer_id_fkey(*)
    `)
    .order("created_at", { ascending: false })
  
  if (error) throw error
  return data as Message[]
}

export async function getMessagesByCustomer(customerId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("customer_id", customerId)
    .eq("is_internal", false)
    .order("created_at", { ascending: true })
  
  if (error) throw error
  return data as Message[]
}

export async function createMessage(message: {
  customer_id: string
  content: string
  sender: "admin" | "customer"
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
    .eq("customer_id", customerId)
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
  type: "order" | "invoice" | "message" | "deadline" | "payment"
  title: string
  description?: string
  link?: string
}) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("notifications")
    .insert({
      ...notification,
      is_read: false,
    })
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
  
  // Get orders count by status
  const { data: orders } = await supabase
    .from("orders")
    .select("status, price")
  
  // Get invoices for revenue
  const { data: invoices } = await supabase
    .from("invoices")
    .select("total, paid_amount, status")
  
  // Get unread messages count
  const { count: unreadMessages } = await supabase
    .from("messages")
    .select("*", { count: "exact", head: true })
    .eq("is_read", false)
    .eq("sender", "customer")
  
  const stats = {
    totalOrders: orders?.length || 0,
    activeOrders: orders?.filter(o => ["pending", "in_progress", "review", "revision"].includes(o.status)).length || 0,
    completedOrders: orders?.filter(o => o.status === "completed").length || 0,
    totalRevenue: invoices?.reduce((sum, inv) => sum + (inv.paid_amount || 0), 0) || 0,
    pendingRevenue: invoices?.reduce((sum, inv) => sum + (inv.total - (inv.paid_amount || 0)), 0) || 0,
    unreadMessages: unreadMessages || 0,
    overdueInvoices: invoices?.filter(i => i.status === "overdue").length || 0,
  }
  
  return stats
}

export async function getCustomerDashboardStats(customerId: string) {
  const supabase = createClient()
  
  const { data: orders } = await supabase
    .from("orders")
    .select("status, price")
    .eq("customer_id", customerId)
  
  const { data: invoices } = await supabase
    .from("invoices")
    .select("total, paid_amount, status")
    .eq("customer_id", customerId)
  
  const stats = {
    totalOrders: orders?.length || 0,
    activeOrders: orders?.filter(o => ["pending", "in_progress", "review", "revision"].includes(o.status)).length || 0,
    completedOrders: orders?.filter(o => o.status === "completed").length || 0,
    totalSpent: invoices?.reduce((sum, inv) => sum + (inv.paid_amount || 0), 0) || 0,
    unpaidInvoices: invoices?.filter(i => ["unpaid", "partial", "overdue"].includes(i.status)).length || 0,
  }
  
  return stats
}

// ============ REVENUE DATA ============

export async function getMonthlyRevenue(year: number = new Date().getFullYear()) {
  const supabase = createClient()
  
  const { data: payments } = await supabase
    .from("payments")
    .select("amount, created_at")
    .gte("created_at", `${year}-01-01`)
    .lt("created_at", `${year + 1}-01-01`)
  
  const monthlyRevenue: { month: string; revenue: number }[] = []
  const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"]
  
  for (let i = 0; i < 12; i++) {
    const monthPayments = payments?.filter(p => {
      const date = new Date(p.created_at)
      return date.getMonth() === i
    }) || []
    
    monthlyRevenue.push({
      month: months[i],
      revenue: monthPayments.reduce((sum, p) => sum + p.amount, 0),
    })
  }
  
  return monthlyRevenue
}
