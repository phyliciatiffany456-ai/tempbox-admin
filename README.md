# TEMPBOX Backend Admin & IoT Operations Portal

Portal Website Backend Admin untuk memonitor dan mengontrol operasional loker pintar termal TEMPBOX di drive `D:\tempbox_admin`.

## 🚀 Fitur Utama
1. **Ringkasan & KPI Eksekutif**: Okupansi, total kompartemen, kepatuhan suhu 99.8%, dan omset realtime.
2. **Manajemen Loker & Emergency Unlock**: Kontrol jarak jauh pintu loker dengan modal konfirmasi dan logging aktivitas.
3. **IoT Telemetri Suhu**: Grafik live sensor DS18B20 (Cold Box ~4°C dan Hot Box ~60°C).
4. **Transaksi & Riwayat Sewa**: Tabel sewa aktif, durasi, perpanjangan sewa (+1 jam), dan metode bayar.
5. **Member CRM**: Daftar pengguna, tingkatan tier (Silver, Gold, Diamond, Platinum), poin loyalitas, dan kode referral.

## 🛠️ Cara Menjalankan Secara Lokal
Cukup jalankan file batch:
```cmd
D:\tempbox_admin\start_admin.bat
```
Atau via terminal:
```bash
cd D:\tempbox_admin
node server.js
```
Lalu buka di browser: **`http://localhost:3000`**
