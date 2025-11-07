# 🐝 LingoBee — Virtual Lab Bahasa Inggris ITB  
> Ujian Tengah Semester — II3140 Pengembangan Aplikasi Web dan Mobile (PAWM)

🔗 **Live Demo:** https://lingobee.vercel.app/
---

## 👥 Anggota Tim
| NIM | Nama Lengkap |
|-----|---------------|
| 18222069 | Catherine Alicia N |
| 18222097 | Audy Alicia Renatha Tirayoh |

---

## 📜 Project Overview
**LingoBee** adalah aplikasi **Virtual Lab Bahasa Inggris** yang dikembangkan untuk mendukung kegiatan belajar mahasiswa Institut Teknologi Bandung.  Aplikasi ini menyediakan fitur **latihan interaktif**, **manajemen tugas**, serta **pelacakan progres belajar** dalam satu platform berbasis web yang intuitif dan responsif.

Fitur utama:
- 🔐 Login & Register dengan Supabase Auth  
- 🏠 Dashboard interaktif (XP, level, streak, kalender, to-do list)  
- 📚 Materi pembelajaran tematik (grammar, speaking, reading)  
- 🧩 Practice interaktif dengan sistem XP  
- 📝 Assignment upload & komentar  
- ⚡ Sinkronisasi data real-time dengan Supabase  

---

## ⚙️ Tech Stack
- **Frontend:** React.js (Vite), TailwindCSS, React Router DOM  
- **Backend:** Node.js, Express.js  
- **Database & Auth:** Supabase (PostgreSQL, Storage, Realtime)  
- **Deployment:** Vercel  

Aplikasi menerapkan arsitektur **Model–View–Controller (MVC)** dengan tambahan *Service Layer* untuk komunikasi API, sehingga modular dan mudah di-maintain.

---

## 🧠 How to Run

### 1️⃣ Clone Repository
```bash
git clone https://github.com/catherinealicia08/LingoBee-UjianTengahSemester-PAWM.git
cd LingoBee-UjianTengahSemester-PAWM
```
### 2️⃣ Install Dependencies
Masuk ke folder client dan server, lalu install dependency masing-masing:
```bash
cd client
npm install
```
```bash
cd server
npm install
```
### 3️⃣ Jalankan Aplikasi
Buka dua terminal terpisah

**Terminal 1**
```bash
cd client
npm run dev
```
**Terminal 2**
```bash
cd server
npm run dev
```
---
## 🔑 Environment Variables
File .env berisi konfigurasi Supabase (URL dan anon key).
Untuk keamanan, file ini tidak disertakan di repository.
Silakan minta file .env langsung kepada developer pemilik repository jika diperlukan untuk menjalankan aplikasi secara lokal.

---

Proyek ini dikembangkan sebagai bagian dari Ujian Tengah Semester
Mata kuliah II3140 — Pengembangan Aplikasi Web dan Mobile
Program Studi Sistem dan Teknologi Informasi
Sekolah Teknik Elektro dan Informatika, Institut Teknologi Bandung (2025)
