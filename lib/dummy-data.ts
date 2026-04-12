// Dummy data for CuanPage - Indonesian realistic data

export interface Customer {
  id: string
  name: string
  email: string
  whatsapp: string
  avatar?: string
  createdAt: string
  totalOrders: number
  totalSpent: number
}

export interface Order {
  id: string
  customerId: string
  customerName: string
  service: string
  status: "pending" | "in_progress" | "review" | "revision" | "completed" | "cancelled"
  progress: number
  price: number
  createdAt: string
  deadline: string
  notes?: string
}

export interface Invoice {
  id: string
  orderId: string
  customerId: string
  customerName: string
  items: { description: string; qty: number; price: number }[]
  subtotal: number
  tax: number
  total: number
  status: "unpaid" | "paid" | "overdue" | "partial"
  paidAmount: number
  dueDate: string
  createdAt: string
}

export interface Service {
  id: string
  name: string
  description: string
  price: number
  estimatedDays: number
  maxSlots: number
  filledSlots: number
  isActive: boolean
}

export interface Message {
  id: string
  customerId: string
  customerName: string
  content: string
  sender: "admin" | "customer"
  isInternal: boolean
  createdAt: string
  read: boolean
}

export interface Notification {
  id: string
  type: "order" | "invoice" | "message" | "deadline" | "payment"
  title: string
  description: string
  createdAt: string
  read: boolean
  link?: string
}

export interface RevenueData {
  month: string
  revenue: number
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

// 8 Customers with Indonesian names
export const customers: Customer[] = [
  {
    id: "cust-001",
    name: "Budi Santoso",
    email: "budi.santoso@gmail.com",
    whatsapp: "+6281234567890",
    createdAt: "2024-01-15T10:00:00Z",
    totalOrders: 3,
    totalSpent: 8500000,
  },
  {
    id: "cust-002",
    name: "Siti Rahayu",
    email: "siti.rahayu@yahoo.com",
    whatsapp: "+6282345678901",
    createdAt: "2024-02-20T14:30:00Z",
    totalOrders: 2,
    totalSpent: 5000000,
  },
  {
    id: "cust-003",
    name: "Ahmad Hidayat",
    email: "ahmad.hidayat@outlook.com",
    whatsapp: "+6283456789012",
    createdAt: "2024-03-05T09:15:00Z",
    totalOrders: 4,
    totalSpent: 12000000,
  },
  {
    id: "cust-004",
    name: "Dewi Lestari",
    email: "dewi.lestari@gmail.com",
    whatsapp: "+6284567890123",
    createdAt: "2024-03-18T16:45:00Z",
    totalOrders: 1,
    totalSpent: 2500000,
  },
  {
    id: "cust-005",
    name: "Rizky Pratama",
    email: "rizky.pratama@gmail.com",
    whatsapp: "+6285678901234",
    createdAt: "2024-04-02T11:20:00Z",
    totalOrders: 2,
    totalSpent: 6500000,
  },
  {
    id: "cust-006",
    name: "Nina Kusuma",
    email: "nina.kusuma@yahoo.com",
    whatsapp: "+6286789012345",
    createdAt: "2024-04-25T13:00:00Z",
    totalOrders: 3,
    totalSpent: 9500000,
  },
  {
    id: "cust-007",
    name: "Eko Wijaya",
    email: "eko.wijaya@gmail.com",
    whatsapp: "+6287890123456",
    createdAt: "2024-05-10T08:30:00Z",
    totalOrders: 1,
    totalSpent: 3500000,
  },
  {
    id: "cust-008",
    name: "Putri Ayu",
    email: "putri.ayu@outlook.com",
    whatsapp: "+6288901234567",
    createdAt: "2024-05-28T15:10:00Z",
    totalOrders: 2,
    totalSpent: 7000000,
  },
]

// 12 Orders in various statuses
export const orders: Order[] = [
  {
    id: "CP-001",
    customerId: "cust-001",
    customerName: "Budi Santoso",
    service: "Company Profile",
    status: "completed",
    progress: 100,
    price: 2500000,
    createdAt: "2024-01-20T10:00:00Z",
    deadline: "2024-01-25T23:59:59Z",
  },
  {
    id: "CP-002",
    customerId: "cust-002",
    customerName: "Siti Rahayu",
    service: "Landing Page",
    status: "completed",
    progress: 100,
    price: 1500000,
    createdAt: "2024-02-25T14:00:00Z",
    deadline: "2024-02-28T23:59:59Z",
  },
  {
    id: "CP-003",
    customerId: "cust-003",
    customerName: "Ahmad Hidayat",
    service: "E-Commerce",
    status: "completed",
    progress: 100,
    price: 5000000,
    createdAt: "2024-03-10T09:00:00Z",
    deadline: "2024-03-20T23:59:59Z",
  },
  {
    id: "CP-004",
    customerId: "cust-001",
    customerName: "Budi Santoso",
    service: "Custom System",
    status: "in_progress",
    progress: 65,
    price: 4500000,
    createdAt: "2024-05-15T10:00:00Z",
    deadline: "2024-06-01T23:59:59Z",
    notes: "Sedang mengerjakan modul inventory",
  },
  {
    id: "CP-005",
    customerId: "cust-004",
    customerName: "Dewi Lestari",
    service: "Company Profile",
    status: "review",
    progress: 90,
    price: 2500000,
    createdAt: "2024-05-20T16:00:00Z",
    deadline: "2024-05-27T23:59:59Z",
  },
  {
    id: "CP-006",
    customerId: "cust-005",
    customerName: "Rizky Pratama",
    service: "Portfolio Website",
    status: "completed",
    progress: 100,
    price: 2000000,
    createdAt: "2024-04-05T11:00:00Z",
    deadline: "2024-04-10T23:59:59Z",
  },
  {
    id: "CP-007",
    customerId: "cust-006",
    customerName: "Nina Kusuma",
    service: "E-Commerce",
    status: "revision",
    progress: 85,
    price: 5000000,
    createdAt: "2024-05-01T13:00:00Z",
    deadline: "2024-05-15T23:59:59Z",
    notes: "Revisi tampilan halaman checkout",
  },
  {
    id: "CP-008",
    customerId: "cust-003",
    customerName: "Ahmad Hidayat",
    service: "Maintenance",
    status: "in_progress",
    progress: 40,
    price: 1500000,
    createdAt: "2024-05-25T09:00:00Z",
    deadline: "2024-06-10T23:59:59Z",
  },
  {
    id: "CP-009",
    customerId: "cust-007",
    customerName: "Eko Wijaya",
    service: "Custom System",
    status: "pending",
    progress: 0,
    price: 3500000,
    createdAt: "2024-05-28T08:00:00Z",
    deadline: "2024-06-15T23:59:59Z",
  },
  {
    id: "CP-010",
    customerId: "cust-008",
    customerName: "Putri Ayu",
    service: "Landing Page",
    status: "in_progress",
    progress: 25,
    price: 1500000,
    createdAt: "2024-05-29T15:00:00Z",
    deadline: "2024-06-03T23:59:59Z",
  },
  {
    id: "CP-011",
    customerId: "cust-002",
    customerName: "Siti Rahayu",
    service: "Company Profile",
    status: "pending",
    progress: 0,
    price: 2500000,
    createdAt: "2024-05-30T10:00:00Z",
    deadline: "2024-06-05T23:59:59Z",
  },
  {
    id: "CP-012",
    customerId: "cust-005",
    customerName: "Rizky Pratama",
    service: "E-Commerce",
    status: "in_progress",
    progress: 55,
    price: 4500000,
    createdAt: "2024-05-20T14:00:00Z",
    deadline: "2024-06-08T23:59:59Z",
  },
]

// 10 Invoices
export const invoices: Invoice[] = [
  {
    id: "INV-001",
    orderId: "CP-001",
    customerId: "cust-001",
    customerName: "Budi Santoso",
    items: [{ description: "Website Company Profile", qty: 1, price: 2500000 }],
    subtotal: 2500000,
    tax: 275000,
    total: 2775000,
    status: "paid",
    paidAmount: 2775000,
    dueDate: "2024-01-22T23:59:59Z",
    createdAt: "2024-01-20T10:00:00Z",
  },
  {
    id: "INV-002",
    orderId: "CP-002",
    customerId: "cust-002",
    customerName: "Siti Rahayu",
    items: [{ description: "Landing Page Premium", qty: 1, price: 1500000 }],
    subtotal: 1500000,
    tax: 165000,
    total: 1665000,
    status: "paid",
    paidAmount: 1665000,
    dueDate: "2024-02-27T23:59:59Z",
    createdAt: "2024-02-25T14:00:00Z",
  },
  {
    id: "INV-003",
    orderId: "CP-003",
    customerId: "cust-003",
    customerName: "Ahmad Hidayat",
    items: [
      { description: "Website E-Commerce", qty: 1, price: 5000000 },
      { description: "Payment Gateway Integration", qty: 1, price: 500000 },
    ],
    subtotal: 5500000,
    tax: 605000,
    total: 6105000,
    status: "paid",
    paidAmount: 6105000,
    dueDate: "2024-03-12T23:59:59Z",
    createdAt: "2024-03-10T09:00:00Z",
  },
  {
    id: "INV-004",
    orderId: "CP-004",
    customerId: "cust-001",
    customerName: "Budi Santoso",
    items: [
      { description: "Custom System Development", qty: 1, price: 4500000 },
      { description: "Database Design", qty: 1, price: 750000 },
    ],
    subtotal: 5250000,
    tax: 577500,
    total: 5827500,
    status: "partial",
    paidAmount: 2500000,
    dueDate: "2024-05-20T23:59:59Z",
    createdAt: "2024-05-15T10:00:00Z",
  },
  {
    id: "INV-005",
    orderId: "CP-005",
    customerId: "cust-004",
    customerName: "Dewi Lestari",
    items: [{ description: "Website Company Profile", qty: 1, price: 2500000 }],
    subtotal: 2500000,
    tax: 275000,
    total: 2775000,
    status: "unpaid",
    paidAmount: 0,
    dueDate: "2024-05-25T23:59:59Z",
    createdAt: "2024-05-20T16:00:00Z",
  },
  {
    id: "INV-006",
    orderId: "CP-006",
    customerId: "cust-005",
    customerName: "Rizky Pratama",
    items: [{ description: "Portfolio Website", qty: 1, price: 2000000 }],
    subtotal: 2000000,
    tax: 220000,
    total: 2220000,
    status: "paid",
    paidAmount: 2220000,
    dueDate: "2024-04-08T23:59:59Z",
    createdAt: "2024-04-05T11:00:00Z",
  },
  {
    id: "INV-007",
    orderId: "CP-007",
    customerId: "cust-006",
    customerName: "Nina Kusuma",
    items: [{ description: "Website E-Commerce Premium", qty: 1, price: 5000000 }],
    subtotal: 5000000,
    tax: 550000,
    total: 5550000,
    status: "overdue",
    paidAmount: 0,
    dueDate: "2024-05-10T23:59:59Z",
    createdAt: "2024-05-01T13:00:00Z",
  },
  {
    id: "INV-008",
    orderId: "CP-009",
    customerId: "cust-007",
    customerName: "Eko Wijaya",
    items: [{ description: "Custom System (DP 50%)", qty: 1, price: 1750000 }],
    subtotal: 1750000,
    tax: 192500,
    total: 1942500,
    status: "unpaid",
    paidAmount: 0,
    dueDate: "2024-06-02T23:59:59Z",
    createdAt: "2024-05-28T08:00:00Z",
  },
  {
    id: "INV-009",
    orderId: "CP-010",
    customerId: "cust-008",
    customerName: "Putri Ayu",
    items: [{ description: "Landing Page", qty: 1, price: 1500000 }],
    subtotal: 1500000,
    tax: 165000,
    total: 1665000,
    status: "paid",
    paidAmount: 1665000,
    dueDate: "2024-06-01T23:59:59Z",
    createdAt: "2024-05-29T15:00:00Z",
  },
  {
    id: "INV-010",
    orderId: "CP-012",
    customerId: "cust-005",
    customerName: "Rizky Pratama",
    items: [{ description: "E-Commerce + Custom Features", qty: 1, price: 4500000 }],
    subtotal: 4500000,
    tax: 495000,
    total: 4995000,
    status: "partial",
    paidAmount: 2000000,
    dueDate: "2024-05-28T23:59:59Z",
    createdAt: "2024-05-20T14:00:00Z",
  },
]

// 6 Services matching landing page
export const services: Service[] = [
  {
    id: "svc-001",
    name: "Company Profile",
    description: "Website company profile profesional dengan desain modern dan responsif",
    price: 2500000,
    estimatedDays: 5,
    maxSlots: 10,
    filledSlots: 7,
    isActive: true,
  },
  {
    id: "svc-002",
    name: "Landing Page",
    description: "Landing page konversi tinggi untuk kampanye marketing Anda",
    price: 1500000,
    estimatedDays: 3,
    maxSlots: 15,
    filledSlots: 12,
    isActive: true,
  },
  {
    id: "svc-003",
    name: "E-Commerce",
    description: "Toko online lengkap dengan payment gateway dan manajemen produk",
    price: 5000000,
    estimatedDays: 14,
    maxSlots: 5,
    filledSlots: 5,
    isActive: true,
  },
  {
    id: "svc-004",
    name: "Portfolio Website",
    description: "Website portfolio untuk menampilkan karya dan pencapaian Anda",
    price: 2000000,
    estimatedDays: 4,
    maxSlots: 8,
    filledSlots: 4,
    isActive: true,
  },
  {
    id: "svc-005",
    name: "Custom System",
    description: "Sistem custom sesuai kebutuhan bisnis Anda (ERP, CRM, dll)",
    price: 7500000,
    estimatedDays: 30,
    maxSlots: 3,
    filledSlots: 2,
    isActive: true,
  },
  {
    id: "svc-006",
    name: "Maintenance",
    description: "Layanan maintenance dan update website bulanan",
    price: 500000,
    estimatedDays: 0,
    maxSlots: 20,
    filledSlots: 8,
    isActive: true,
  },
]

// 20 Messages
export const messages: Message[] = [
  {
    id: "msg-001",
    customerId: "cust-001",
    customerName: "Budi Santoso",
    content: "Halo, saya ingin tanya progress project saya sudah sampai mana ya?",
    sender: "customer",
    isInternal: false,
    createdAt: "2024-05-28T09:00:00Z",
    read: true,
  },
  {
    id: "msg-002",
    customerId: "cust-001",
    customerName: "Budi Santoso",
    content: "Halo Pak Budi, project sedang dalam tahap pengerjaan modul inventory. Progress saat ini 65%.",
    sender: "admin",
    isInternal: false,
    createdAt: "2024-05-28T09:15:00Z",
    read: true,
  },
  {
    id: "msg-003",
    customerId: "cust-001",
    customerName: "Budi Santoso",
    content: "Catatan internal: Client request tambahan fitur notifikasi email",
    sender: "admin",
    isInternal: true,
    createdAt: "2024-05-28T09:20:00Z",
    read: true,
  },
  {
    id: "msg-004",
    customerId: "cust-004",
    customerName: "Dewi Lestari",
    content: "Apakah bisa ditambahkan halaman blog di website company profile saya?",
    sender: "customer",
    isInternal: false,
    createdAt: "2024-05-27T14:00:00Z",
    read: true,
  },
  {
    id: "msg-005",
    customerId: "cust-004",
    customerName: "Dewi Lestari",
    content: "Tentu bisa Bu Dewi. Untuk penambahan fitur blog ada biaya tambahan Rp 500.000. Apakah setuju?",
    sender: "admin",
    isInternal: false,
    createdAt: "2024-05-27T14:30:00Z",
    read: true,
  },
  {
    id: "msg-006",
    customerId: "cust-004",
    customerName: "Dewi Lestari",
    content: "Oke setuju, tolong tambahkan ya",
    sender: "customer",
    isInternal: false,
    createdAt: "2024-05-27T15:00:00Z",
    read: true,
  },
  {
    id: "msg-007",
    customerId: "cust-006",
    customerName: "Nina Kusuma",
    content: "Saya mau revisi tampilan halaman checkout, warnanya kurang cocok",
    sender: "customer",
    isInternal: false,
    createdAt: "2024-05-26T10:00:00Z",
    read: true,
  },
  {
    id: "msg-008",
    customerId: "cust-006",
    customerName: "Nina Kusuma",
    content: "Baik Bu Nina, bisa tolong kirimkan referensi warna yang diinginkan?",
    sender: "admin",
    isInternal: false,
    createdAt: "2024-05-26T10:20:00Z",
    read: true,
  },
  {
    id: "msg-009",
    customerId: "cust-006",
    customerName: "Nina Kusuma",
    content: "Client agak demanding, perlu extra sabar handling",
    sender: "admin",
    isInternal: true,
    createdAt: "2024-05-26T10:25:00Z",
    read: true,
  },
  {
    id: "msg-010",
    customerId: "cust-007",
    customerName: "Eko Wijaya",
    content: "Pak, kapan bisa mulai pengerjaan project saya?",
    sender: "customer",
    isInternal: false,
    createdAt: "2024-05-29T08:00:00Z",
    read: true,
  },
  {
    id: "msg-011",
    customerId: "cust-007",
    customerName: "Eko Wijaya",
    content: "Halo Pak Eko, project Anda dijadwalkan mulai tanggal 1 Juni setelah DP diterima.",
    sender: "admin",
    isInternal: false,
    createdAt: "2024-05-29T08:30:00Z",
    read: true,
  },
  {
    id: "msg-012",
    customerId: "cust-008",
    customerName: "Putri Ayu",
    content: "Terima kasih ya, landing page-nya sudah bagus sekali!",
    sender: "customer",
    isInternal: false,
    createdAt: "2024-05-30T11:00:00Z",
    read: true,
  },
  {
    id: "msg-013",
    customerId: "cust-008",
    customerName: "Putri Ayu",
    content: "Sama-sama Bu Putri! Senang bisa membantu. Jangan lupa review-nya ya hehe",
    sender: "admin",
    isInternal: false,
    createdAt: "2024-05-30T11:15:00Z",
    read: true,
  },
  {
    id: "msg-014",
    customerId: "cust-003",
    customerName: "Ahmad Hidayat",
    content: "Maintenance bulan ini ada update plugin yang perlu dilakukan",
    sender: "admin",
    isInternal: false,
    createdAt: "2024-05-25T13:00:00Z",
    read: true,
  },
  {
    id: "msg-015",
    customerId: "cust-003",
    customerName: "Ahmad Hidayat",
    content: "Oke silakan update, saya tunggu konfirmasinya",
    sender: "customer",
    isInternal: false,
    createdAt: "2024-05-25T14:00:00Z",
    read: true,
  },
  {
    id: "msg-016",
    customerId: "cust-005",
    customerName: "Rizky Pratama",
    content: "Progress e-commerce saya gimana pak?",
    sender: "customer",
    isInternal: false,
    createdAt: "2024-05-30T09:00:00Z",
    read: false,
  },
  {
    id: "msg-017",
    customerId: "cust-002",
    customerName: "Siti Rahayu",
    content: "Saya mau order company profile lagi untuk bisnis baru saya",
    sender: "customer",
    isInternal: false,
    createdAt: "2024-05-30T10:00:00Z",
    read: false,
  },
  {
    id: "msg-018",
    customerId: "cust-001",
    customerName: "Budi Santoso",
    content: "Invoice yang kemarin sudah saya bayar sebagian, tolong dicek ya",
    sender: "customer",
    isInternal: false,
    createdAt: "2024-05-30T14:00:00Z",
    read: false,
  },
  {
    id: "msg-019",
    customerId: "cust-006",
    customerName: "Nina Kusuma",
    content: "Kapan revisi bisa selesai?",
    sender: "customer",
    isInternal: false,
    createdAt: "2024-05-30T15:00:00Z",
    read: false,
  },
  {
    id: "msg-020",
    customerId: "cust-004",
    customerName: "Dewi Lestari",
    content: "Website sudah live belum ya?",
    sender: "customer",
    isInternal: false,
    createdAt: "2024-05-30T16:00:00Z",
    read: false,
  },
]

// 10 Notifications
export const notifications: Notification[] = [
  {
    id: "notif-001",
    type: "order",
    title: "Pesanan baru",
    description: "Pesanan baru dari Siti Rahayu",
    createdAt: "2024-05-30T10:00:00Z",
    read: false,
    link: "/admin/orders/CP-011",
  },
  {
    id: "notif-002",
    type: "invoice",
    title: "Invoice jatuh tempo",
    description: "Invoice INV-007 sudah jatuh tempo",
    createdAt: "2024-05-30T08:00:00Z",
    read: false,
    link: "/admin/invoices/INV-007",
  },
  {
    id: "notif-003",
    type: "message",
    title: "Pesan baru",
    description: "Pesan baru dari Rizky Pratama",
    createdAt: "2024-05-30T09:00:00Z",
    read: false,
    link: "/admin/messages",
  },
  {
    id: "notif-004",
    type: "deadline",
    title: "Deadline besok",
    description: "Deadline besok: Pesanan #CP-010",
    createdAt: "2024-05-30T07:00:00Z",
    read: false,
    link: "/admin/orders/CP-010",
  },
  {
    id: "notif-005",
    type: "payment",
    title: "Pembayaran diterima",
    description: "Pembayaran diterima dari Putri Ayu",
    createdAt: "2024-05-29T15:30:00Z",
    read: true,
    link: "/admin/payments",
  },
  {
    id: "notif-006",
    type: "message",
    title: "Pesan baru",
    description: "Pesan baru dari Budi Santoso",
    createdAt: "2024-05-28T09:00:00Z",
    read: true,
    link: "/admin/messages",
  },
  {
    id: "notif-007",
    type: "order",
    title: "Pesanan baru",
    description: "Pesanan baru dari Eko Wijaya",
    createdAt: "2024-05-28T08:00:00Z",
    read: true,
    link: "/admin/orders/CP-009",
  },
  {
    id: "notif-008",
    type: "payment",
    title: "Pembayaran diterima",
    description: "Pembayaran diterima dari Ahmad Hidayat",
    createdAt: "2024-05-27T10:00:00Z",
    read: true,
    link: "/admin/payments",
  },
  {
    id: "notif-009",
    type: "deadline",
    title: "Deadline minggu ini",
    description: "Deadline: Pesanan #CP-005",
    createdAt: "2024-05-25T07:00:00Z",
    read: true,
    link: "/admin/orders/CP-005",
  },
  {
    id: "notif-010",
    type: "invoice",
    title: "Invoice dibayar",
    description: "Invoice INV-009 sudah dibayar lunas",
    createdAt: "2024-05-29T15:00:00Z",
    read: true,
    link: "/admin/invoices/INV-009",
  },
]

// 12 months revenue data
export const revenueData: RevenueData[] = [
  { month: "Jan", revenue: 5500000 },
  { month: "Feb", revenue: 4200000 },
  { month: "Mar", revenue: 8500000 },
  { month: "Apr", revenue: 6800000 },
  { month: "May", revenue: 12500000 },
  { month: "Jun", revenue: 9800000 },
  { month: "Jul", revenue: 7500000 },
  { month: "Aug", revenue: 11200000 },
  { month: "Sep", revenue: 8900000 },
  { month: "Oct", revenue: 13500000 },
  { month: "Nov", revenue: 10200000 },
  { month: "Des", revenue: 15000000 },
]

// Order status labels in Indonesian
export const orderStatusLabels: Record<Order["status"], string> = {
  pending: "Menunggu",
  in_progress: "Dikerjakan",
  review: "Review",
  revision: "Revisi",
  completed: "Selesai",
  cancelled: "Dibatalkan",
}

// Invoice status labels in Indonesian
export const invoiceStatusLabels: Record<Invoice["status"], string> = {
  unpaid: "Belum Bayar",
  paid: "Lunas",
  overdue: "Jatuh Tempo",
  partial: "Sebagian",
}

// Get computed statistics
export function getStats() {
  const activeOrders = orders.filter(
    (o) => !["completed", "cancelled"].includes(o.status)
  ).length
  const completedOrders = orders.filter((o) => o.status === "completed").length
  const unpaidInvoices = invoices.filter(
    (i) => i.status === "unpaid" || i.status === "overdue"
  ).length
  const totalRevenue = invoices
    .filter((i) => i.status === "paid")
    .reduce((sum, i) => sum + i.total, 0)
  const pendingRevenue = invoices
    .filter((i) => i.status !== "paid")
    .reduce((sum, i) => sum + (i.total - i.paidAmount), 0)
  const unreadMessages = messages.filter((m) => !m.read && m.sender === "customer").length
  const unreadNotifications = notifications.filter((n) => !n.read).length

  return {
    activeOrders,
    completedOrders,
    unpaidInvoices,
    totalRevenue,
    pendingRevenue,
    unreadMessages,
    unreadNotifications,
    totalCustomers: customers.length,
  }
}
