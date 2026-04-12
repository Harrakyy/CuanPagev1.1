-- CuanPage Seed Data
-- This seeds initial services data (other data will be created through the app)

-- ============================================
-- SEED SERVICES
-- ============================================
INSERT INTO public.services (id, nama, deskripsi, harga, estimasi, max_slots, current_slots, is_active)
VALUES
  (gen_random_uuid(), 'Company Profile', 'Website company profile profesional dengan desain modern dan responsif', 2500000, '5-7 hari', 10, 0, TRUE),
  (gen_random_uuid(), 'Landing Page', 'Landing page konversi tinggi untuk kampanye marketing Anda', 1500000, '3-5 hari', 15, 0, TRUE),
  (gen_random_uuid(), 'E-Commerce', 'Toko online lengkap dengan payment gateway dan manajemen produk', 5000000, '10-14 hari', 5, 0, TRUE),
  (gen_random_uuid(), 'Portfolio Website', 'Website portfolio untuk menampilkan karya dan pencapaian Anda', 2000000, '4-6 hari', 8, 0, TRUE),
  (gen_random_uuid(), 'Custom System', 'Sistem custom sesuai kebutuhan bisnis Anda (ERP, CRM, dll)', 7500000, '21-30 hari', 3, 0, TRUE),
  (gen_random_uuid(), 'Maintenance', 'Layanan maintenance dan update website bulanan', 500000, 'Bulanan', 20, 0, TRUE)
ON CONFLICT DO NOTHING;
