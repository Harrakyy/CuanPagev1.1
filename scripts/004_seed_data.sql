-- Seed data for CuanPage
-- Insert default services

INSERT INTO public.services (id, nama, deskripsi, harga, estimasi_hari, max_slots, current_slots, is_active) VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Company Profile', 'Website company profile profesional dengan desain modern dan responsif', 2500000, 5, 10, 7, TRUE),
  ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'Landing Page', 'Landing page konversi tinggi untuk kampanye marketing Anda', 1500000, 3, 15, 12, TRUE),
  ('c3d4e5f6-a7b8-9012-cdef-123456789012', 'E-Commerce', 'Toko online lengkap dengan payment gateway dan manajemen produk', 5000000, 14, 5, 5, TRUE),
  ('d4e5f6a7-b8c9-0123-defa-234567890123', 'Portfolio Website', 'Website portfolio untuk menampilkan karya dan pencapaian Anda', 2000000, 4, 8, 4, TRUE),
  ('e5f6a7b8-c9d0-1234-efab-345678901234', 'Custom System', 'Sistem custom sesuai kebutuhan bisnis Anda (ERP, CRM, dll)', 7500000, 30, 3, 2, TRUE),
  ('f6a7b8c9-d0e1-2345-fabc-456789012345', 'Maintenance', 'Layanan maintenance dan update website bulanan', 500000, 0, 20, 8, TRUE)
ON CONFLICT (id) DO NOTHING;
