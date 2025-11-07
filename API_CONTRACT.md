# API Documentation - LingoBee

## Base URL
```
http://localhost:5000/api
```

## Authentication
Semua endpoint (kecuali `/auth/register` dan `/auth/login`) memerlukan token Bearer di header:
```
Authorization: Bearer <token>
```

---

## 1. Authentication Endpoints

### POST /auth/register
**Fungsi:** Mendaftarkan user baru ke sistem LingoBee  
**Metode:** `POST`  
**Autentikasi:** Tidak diperlukan  
**Deskripsi:** Endpoint ini digunakan untuk membuat akun baru. Sistem akan memvalidasi NIM yang belum terdaftar, mengenkripsi password dengan bcrypt, dan membuat user baru dengan level 1 dan XP 0.

**Request Body:**
```json
{
  "fullName": "string (required) - Nama lengkap user",
  "nim": "string (required) - Nomor Induk Mahasiswa (unik)",
  "password": "string (required, min 6 karakter) - Password user"
}
```

**Response (Success - 201):**
```json
{
  "success": true,
  "message": "Registrasi berhasil!",
  "user": {
    "id": "uuid - ID user yang di-generate otomatis",
    "full_name": "string - Nama lengkap user",
    "nim": "string - NIM user",
    "level": 1,
    "xp": 0,
    "streak": 0
  },
  "token": "string - Base64 encoded token untuk autentikasi"
}
```

**Response (Error - 400):**
```json
{
  "success": false,
  "error": "NIM sudah terdaftar" // atau "Semua field harus diisi" atau "Password minimal 6 karakter"
}
```

**Response (Error - 500):**
```json
{
  "success": false,
  "error": "Gagal membuat akun" // atau "Database error"
}
```

**Contoh Request (cURL):**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Budi Santoso",
    "nim": "13521001",
    "password": "password123"
  }'
```

---

### POST /auth/login
**Fungsi:** Melakukan autentikasi user dan mendapatkan token akses  
**Metode:** `POST`  
**Autentikasi:** Tidak diperlukan  
**Deskripsi:** Endpoint untuk login ke sistem. Memvalidasi NIM dan password, lalu mengembalikan token untuk digunakan di request selanjutnya.

**Request Body:**
```json
{
  "nim": "string (required) - NIM user",
  "password": "string (required) - Password user"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Login berhasil",
  "user": {
    "id": "uuid",
    "full_name": "string",
    "nim": "string",
    "level": "number - Level user saat ini",
    "xp": "number - Total XP yang dikumpulkan",
    "streak": "number - Jumlah hari berturut-turut belajar"
  },
  "token": "string - Token untuk autentikasi request selanjutnya"
}
```

**Response (Error - 401):**
```json
{
  "success": false,
  "error": "NIM atau password salah"
}
```

**Response (Error - 400):**
```json
{
  "success": false,
  "error": "NIM dan password harus diisi"
}
```

**Contoh Request (cURL):**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "nim": "13521001",
    "password": "password123"
  }'
```

---

### GET /auth/profile
**Fungsi:** Mengambil informasi profil user yang sedang login  
**Metode:** `GET`  
**Autentikasi:** Required (Bearer Token)  
**Deskripsi:** Mendapatkan detail profil user berdasarkan token yang dikirim di header Authorization.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (Success - 200):**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "full_name": "string",
    "nim": "string",
    "level": "number - Level user saat ini",
    "xp": "number - Total experience points",
    "streak": "number - Hari berturut-turut belajar"
  }
}
```

**Response (Error - 401):**
```json
{
  "success": false,
  "error": "Access token required"
}
```

**Response (Error - 404):**
```json
{
  "success": false,
  "error": "User not found"
}
```

**Contoh Request (cURL):**
```bash
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer <your_token_here>"
```

---

## 2. Practice Endpoints

### GET /practice/sections
**Fungsi:** Mengambil semua section practice beserta nodes-nya  
**Metode:** `GET`  
**Autentikasi:** Required (Bearer Token)  
**Deskripsi:** Mendapatkan daftar section dan node practice yang tersedia. Setiap node memiliki status unlocked/locked berdasarkan progress user.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (Success - 200):**
```json
{
  "success": true,
  "sections": [
    {
      "id": "number - ID section",
      "section": "string - Nama section (contoh: 'SECTION 1, UNIT 1')",
      "title": "string - Judul section",
      "color": "string - Kode warna hex untuk UI (contoh: '#0a5f7f')",
      "nodes": [
        {
          "id": "number - ID node",
          "title": "string - Judul node",
          "type": "string - Tipe node: 'star' | 'practice' | 'lesson'",
          "unlocked": "boolean - Apakah node sudah dibuka",
          "completed": "boolean - Apakah node sudah diselesaikan",
          "xpReward": "number - Jumlah XP yang didapat jika selesai",
          "position": {
            "top": "string - Posisi vertikal (contoh: '10%')",
            "left": "string - Posisi horizontal (contoh: '20%')"
          }
        }
      ]
    }
  ]
}
```

**Response (Error - 500):**
```json
{
  "success": false,
  "error": "Failed to fetch practice sections"
}
```

**Contoh Request (cURL):**
```bash
curl -X GET http://localhost:5000/api/practice/sections \
  -H "Authorization: Bearer <your_token_here>"
```

---

### GET /practice/completed
**Fungsi:** Mengambil daftar node yang sudah diselesaikan oleh user  
**Metode:** `GET`  
**Autentikasi:** Required (Bearer Token)  
**Deskripsi:** Mendapatkan array node ID yang sudah diselesaikan user untuk menampilkan progress di UI.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (Success - 200):**
```json
{
  "success": true,
  "completedNodes": [
    "string - Format: 'sectionId-nodeId' (contoh: '1-1', '1-2', '2-1')"
  ]
}
```

**Response (Error - 500):**
```json
{
  "success": false,
  "error": "Failed to fetch completed nodes"
}
```

**Contoh Request (cURL):**
```bash
curl -X GET http://localhost:5000/api/practice/completed \
  -H "Authorization: Bearer <your_token_here>"
```

---

### GET /practice/questions/:sectionId/:nodeId
**Fungsi:** Mengambil soal-soal untuk node tertentu  
**Metode:** `GET`  
**Autentikasi:** Required (Bearer Token)  
**Deskripsi:** Mendapatkan daftar pertanyaan untuk latihan di node yang dipilih. Setiap pertanyaan berisi instruksi, kalimat, pilihan kata, dan jawaban yang benar.

**URL Parameters:**
- `sectionId` (number) - ID section
- `nodeId` (number) - ID node

**Headers:**
```
Authorization: Bearer <token>
```

**Response (Success - 200):**
```json
{
  "success": true,
  "questions": [
    {
      "id": "number - ID pertanyaan",
      "type": "string - Tipe soal: 'translate' | 'multiple_choice' | dll",
      "instruction": "string - Instruksi untuk user (contoh: 'Translate this sentence')",
      "sentence": "string - Kalimat yang harus diterjemahkan",
      "audioUrl": "string|null - URL audio (jika ada)",
      "words": ["array of string - Kata-kata yang tersedia untuk dipilih"],
      "correctAnswer": ["array of string - Urutan kata yang benar"]
    }
  ]
}
```

**Response (Error - 500):**
```json
{
  "success": false,
  "error": "Failed to fetch questions"
}
```

**Contoh Request (cURL):**
```bash
curl -X GET http://localhost:5000/api/practice/questions/1/1 \
  -H "Authorization: Bearer <your_token_here>"
```

---

### POST /practice/complete
**Fungsi:** Mark node sebagai selesai dan memberikan XP reward  
**Metode:** `POST`  
**Autentikasi:** Required (Bearer Token)  
**Deskripsi:** Menyimpan progress user setelah menyelesaikan node. Sistem akan memberikan XP reward, mencatat waktu yang dihabiskan, dan mungkin menaikkan level user.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "sectionId": "number (required) - ID section",
  "nodeId": "number (required) - ID node yang diselesaikan",
  "score": "number (default: 100) - Skor yang didapat",
  "timeSpent": "number (default: 0) - Waktu dalam detik"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Node completed! +10 XP 🎉",
  "user": {
    "id": "uuid",
    "full_name": "string",
    "nim": "string",
    "level": "number - Level baru (mungkin naik)",
    "xp": "number - Total XP setelah reward",
    "streak": "number"
  },
  "rewards": {
    "xpEarned": "number - XP yang baru didapat",
    "levelUp": "boolean - Apakah level naik"
  }
}
```

**Response (Error - 400):**
```json
{
  "success": false,
  "error": "Section ID and Node ID are required"
}
```

**Response (Error - 500):**
```json
{
  "success": false,
  "error": "Failed to complete node"
}
```

**Contoh Request (cURL):**
```bash
curl -X POST http://localhost:5000/api/practice/complete \
  -H "Authorization: Bearer <your_token_here>" \
  -H "Content-Type: application/json" \
  -d '{
    "sectionId": 1,
    "nodeId": 1,
    "score": 100,
    "timeSpent": 120
  }'
```

---

## 3. Assignment Endpoints

### GET /assignments
**Fungsi:** Mengambil semua assignment untuk user  
**Metode:** `GET`  
**Autentikasi:** Required (Bearer Token)  
**Deskripsi:** Mendapatkan daftar semua assignment yang aktif beserta status submission user (pending, turned_in, atau graded).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (Success - 200):**
```json
{
  "success": true,
  "assignments": [
    {
      "id": "number - ID assignment",
      "title": "string - Judul assignment",
      "description": "string - Deskripsi tugas",
      "chapter": "string - Chapter/bab (contoh: 'Chapter 1')",
      "due_date": "string - ISO 8601 datetime (contoh: '2025-06-01T00:00:00')",
      "points": "number - Maksimal poin yang bisa didapat",
      "status": "string - Status: 'active' | 'archived'",
      "submission": {
        "id": "number - ID submission (jika ada)",
        "status": "string - 'pending' | 'turned_in' | 'graded'",
        "file_url": "string|null - URL file yang diupload",
        "file_name": "string|null - Nama file",
        "submitted_at": "string|null - Waktu submit",
        "grade": "number|null - Nilai (jika sudah graded)"
      }
    }
  ]
}
```

**Response (Error - 500):**
```json
{
  "success": false,
  "error": "Failed to fetch assignments"
}
```

**Contoh Request (cURL):**
```bash
curl -X GET http://localhost:5000/api/assignments \
  -H "Authorization: Bearer <your_token_here>"
```

---

### GET /assignments/:id
**Fungsi:** Mengambil detail assignment tertentu  
**Metode:** `GET`  
**Autentikasi:** Required (Bearer Token)  
**Deskripsi:** Mendapatkan detail lengkap assignment termasuk submission user, class comments (komentar publik), dan private comments (komentar pribadi antara user dan dosen).

**URL Parameters:**
- `id` (number) - ID assignment

**Headers:**
```
Authorization: Bearer <token>
```

**Response (Success - 200):**
```json
{
  "success": true,
  "assignment": {
    "id": "number",
    "title": "string",
    "description": "string",
    "chapter": "string",
    "due_date": "string - ISO 8601 datetime",
    "points": "number",
    "status": "string"
  },
  "submission": {
    "id": "number|null",
    "status": "string|null - 'pending' | 'turned_in' | 'graded'",
    "file_url": "string|null",
    "file_name": "string|null",
    "submission_text": "string|null",
    "submitted_at": "string|null",
    "grade": "number|null"
  },
  "classComments": [
    {
      "id": "number",
      "comment": "string - Isi komentar",
      "created_at": "string - ISO 8601 datetime",
      "users": {
        "full_name": "string - Nama user yang comment",
        "nim": "string"
      }
    }
  ],
  "privateComments": [
    {
      "id": "number",
      "comment": "string",
      "is_teacher": "boolean - Apakah dari dosen",
      "created_at": "string",
      "users": {
        "full_name": "string"
      }
    }
  ]
}
```

**Response (Error - 404):**
```json
{
  "success": false,
  "error": "Assignment not found"
}
```

**Contoh Request (cURL):**
```bash
curl -X GET http://localhost:5000/api/assignments/1 \
  -H "Authorization: Bearer <your_token_here>"
```

---

### POST /assignments/upload
**Fungsi:** Upload file assignment ke server  
**Metode:** `POST`  
**Autentikasi:** Required (Bearer Token)  
**Deskripsi:** Upload file assignment menggunakan multipart/form-data. File akan disimpan di Supabase Storage dan mengembalikan URL public.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request:** `multipart/form-data`
```
file: File (required) - File yang akan diupload
  Allowed types: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG
  Max size: 10MB
```

**Response (Success - 200):**
```json
{
  "success": true,
  "fileUrl": "string - Public URL file di storage",
  "fileName": "string - Nama file original",
  "filePath": "string - Path file di storage",
  "fileSize": "number - Ukuran file dalam bytes",
  "message": "File uploaded successfully"
}
```

**Response (Error - 400):**
```json
{
  "success": false,
  "error": "No file uploaded" // atau "Invalid file type. Only PDF, DOC, DOCX, XLS, XLSX, JPG, PNG allowed."
}
```

**Response (Error - 500):**
```json
{
  "success": false,
  "error": "Failed to upload file to storage"
}
```

**Contoh Request (cURL):**
```bash
curl -X POST http://localhost:5000/api/assignments/upload \
  -H "Authorization: Bearer <your_token_here>" \
  -F "file=@/path/to/your/file.pdf"
```

---

### POST /assignments/submit
**Fungsi:** Submit assignment dengan file yang sudah diupload  
**Metode:** `POST`  
**Autentikasi:** Required (Bearer Token)  
**Deskripsi:** Menyimpan submission assignment setelah file berhasil diupload. Status akan menjadi 'turned_in'.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "assignmentId": "number (required) - ID assignment",
  "fileUrl": "string (required) - URL file dari endpoint /upload",
  "fileName": "string (required) - Nama file",
  "submissionText": "string (optional) - Catatan tambahan"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Assignment submitted successfully! 📤"
}
```

**Response (Error - 400):**
```json
{
  "success": false,
  "error": "Assignment ID, file URL, and file name are required"
}
```

**Response (Error - 500):**
```json
{
  "success": false,
  "error": "Failed to submit assignment"
}
```

**Contoh Request (cURL):**
```bash
curl -X POST http://localhost:5000/api/assignments/submit \
  -H "Authorization: Bearer <your_token_here>" \
  -H "Content-Type: application/json" \
  -d '{
    "assignmentId": 1,
    "fileUrl": "https://storage.url/file.pdf",
    "fileName": "my-assignment.pdf",
    "submissionText": "Ini adalah tugas saya"
  }'
```

---

### POST /assignments/mark-done
**Fungsi:** Mark assignment sebagai selesai tanpa upload file  
**Metode:** `POST`  
**Autentikasi:** Required (Bearer Token)  
**Deskripsi:** Menandai assignment sebagai selesai tanpa perlu upload file. Status akan menjadi 'turned_in'.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "assignmentId": "number (required) - ID assignment"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Assignment marked as done! ✅"
}
```

**Response (Error - 400):**
```json
{
  "success": false,
  "error": "Assignment ID is required"
}
```

**Response (Error - 500):**
```json
{
  "success": false,
  "error": "Failed to mark assignment as done"
}
```

**Contoh Request (cURL):**
```bash
curl -X POST http://localhost:5000/api/assignments/mark-done \
  -H "Authorization: Bearer <your_token_here>" \
  -H "Content-Type: application/json" \
  -d '{
    "assignmentId": 1
  }'
```

---

### POST /assignments/class-comment
**Fungsi:** Menambahkan komentar publik di assignment  
**Metode:** `POST`  
**Autentikasi:** Required (Bearer Token)  
**Deskripsi:** Membuat komentar yang bisa dilihat semua orang di class yang sama untuk assignment tertentu.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "assignmentId": "number (required) - ID assignment",
  "comment": "string (required) - Isi komentar"
}
```

**Response (Success - 201):**
```json
{
  "success": true,
  "message": "Class comment added successfully! 💬",
  "comment": {
    "id": "number",
    "comment": "string",
    "created_at": "string - ISO 8601 datetime",
    "users": {
      "full_name": "string",
      "nim": "string"
    }
  }
}
```

**Response (Error - 400):**
```json
{
  "success": false,
  "error": "Assignment ID and comment are required" // atau "Comment cannot be empty"
}
```

**Response (Error - 500):**
```json
{
  "success": false,
  "error": "Failed to add class comment"
}
```

**Contoh Request (cURL):**
```bash
curl -X POST http://localhost:5000/api/assignments/class-comment \
  -H "Authorization: Bearer <your_token_here>" \
  -H "Content-Type: application/json" \
  -d '{
    "assignmentId": 1,
    "comment": "Ada yang bisa bantu soal nomor 3?"
  }'
```

---

### POST /assignments/private-comment
**Fungsi:** Menambahkan komentar pribadi untuk submission  
**Metode:** `POST`  
**Autentikasi:** Required (Bearer Token)  
**Deskripsi:** Membuat komentar pribadi yang hanya bisa dilihat oleh user dan dosen untuk submission tertentu.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "submissionId": "number (required) - ID submission",
  "comment": "string (required) - Isi komentar"
}
```

**Response (Success - 201):**
```json
{
  "success": true,
  "message": "Private comment added successfully! 🔒",
  "comment": {
    "id": "number",
    "comment": "string",
    "is_teacher": "boolean",
    "created_at": "string",
    "users": {
      "full_name": "string"
    }
  }
}
```

**Response (Error - 400):**
```json
{
  "success": false,
  "error": "Submission ID and comment are required" // atau "Comment cannot be empty"
}
```

**Response (Error - 500):**
```json
{
  "success": false,
  "error": "Failed to add private comment"
}
```

**Contoh Request (cURL):**
```bash
curl -X POST http://localhost:5000/api/assignments/private-comment \
  -H "Authorization: Bearer <your_token_here>" \
  -H "Content-Type: application/json" \
  -d '{
    "submissionId": 1,
    "comment": "Mohon penjelasan tentang feedback yang diberikan"
  }'
```

---

## 4. Todo Endpoints

### GET /todos
**Fungsi:** Mengambil semua todo user  
**Metode:** `GET`  
**Autentikasi:** Required (Bearer Token)  
**Deskripsi:** Mendapatkan daftar semua todo yang dimiliki user, diurutkan berdasarkan posisi.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (Success - 200):**
```json
{
  "success": true,
  "todos": [
    {
      "id": "number - ID todo",
      "text": "string - Isi todo",
      "checked": "boolean - Status selesai/belum",
      "deadline": "string|null - Tanggal deadline (format: 'YYYY-MM-DD')",
      "position": "number - Urutan todo",
      "user_id": "uuid - ID user pemilik",
      "created_at": "string - ISO 8601 datetime"
    }
  ]
}
```

**Response (Error - 500):**
```json
{
  "success": false,
  "error": "Failed to fetch todos"
}
```

**Contoh Request (cURL):**
```bash
curl -X GET http://localhost:5000/api/todos \
  -H "Authorization: Bearer <your_token_here>"
```

---

### POST /todos
**Fungsi:** Membuat todo baru  
**Metode:** `POST`  
**Autentikasi:** Required (Bearer Token)  
**Deskripsi:** Menambahkan todo baru ke daftar user. Todo akan otomatis diletakkan di posisi paling bawah.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "text": "string (required) - Isi todo",
  "deadline": "string|null (optional) - Deadline (format: 'YYYY-MM-DD' atau free text)"
}
```

**Response (Success - 201):**
```json
{
  "success": true,
  "message": "Todo created successfully",
  "todo": {
    "id": "number",
    "text": "string",
    "checked": false,
    "deadline": "string|null",
    "position": "number",
    "user_id": "uuid",
    "created_at": "string"
  }
}
```

**Response (Error - 400):**
```json
{
  "success": false,
  "error": "Todo text is required"
}
```

**Response (Error - 500):**
```json
{
  "success": false,
  "error": "Failed to create todo"
}
```

**Contoh Request (cURL):**
```bash
curl -X POST http://localhost:5000/api/todos \
  -H "Authorization: Bearer <your_token_here>" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Belajar grammar past tense",
    "deadline": "2025-06-15"
  }'
```

---

### PUT /todos/:id
**Fungsi:** Update todo (ubah text, deadline, atau status checked)  
**Metode:** `PUT`  
**Autentikasi:** Required (Bearer Token)  
**Deskripsi:** Mengupdate informasi todo. Bisa digunakan untuk toggle checked, mengubah text, atau mengubah deadline.

**URL Parameters:**
- `id` (number) - ID todo yang akan diupdate

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "text": "string (optional) - Text baru",
  "checked": "boolean (optional) - Status selesai/belum",
  "deadline": "string|null (optional) - Deadline baru"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Todo updated successfully",
  "todo": {
    "id": "number",
    "text": "string",
    "checked": "boolean",
    "deadline": "string|null",
    "position": "number",
    "user_id": "uuid"
  }
}
```

**Response (Error - 404):**
```json
{
  "success": false,
  "error": "Todo not found"
}
```

**Response (Error - 500):**
```json
{
  "success": false,
  "error": "Failed to update todo"
}
```

**Contoh Request (cURL):**
```bash
curl -X PUT http://localhost:5000/api/todos/1 \
  -H "Authorization: Bearer <your_token_here>" \
  -H "Content-Type: application/json" \
  -d '{
    "checked": true
  }'
```

---

### DELETE /todos/:id
**Fungsi:** Menghapus todo  
**Metode:** `DELETE`  
**Autentikasi:** Required (Bearer Token)  
**Deskripsi:** Menghapus todo dari database secara permanen.

**URL Parameters:**
- `id` (number) - ID todo yang akan dihapus

**Headers:**
```
Authorization: Bearer <token>
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Todo deleted successfully"
}
```

**Response (Error - 500):**
```json
{
  "success": false,
  "error": "Failed to delete todo"
}
```

**Contoh Request (cURL):**
```bash
curl -X DELETE http://localhost:5000/api/todos/1 \
  -H "Authorization: Bearer <your_token_here>"
```

---

### PUT /todos/reorder
**Fungsi:** Mengubah urutan todo  
**Metode:** `PUT`  
**Autentikasi:** Required (Bearer Token)  
**Deskripsi:** Update posisi semua todo setelah drag-and-drop. Mengirim array berisi id dan posisi baru.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "todos": [
    {
      "id": "number - ID todo",
      "position": "number - Posisi baru (0-based index)"
    }
  ]
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Todos reordered successfully"
}
```

**Response (Error - 400):**
```json
{
  "success": false,
  "error": "Invalid todos array"
}
```

**Response (Error - 500):**
```json
{
  "success": false,
  "error": "Failed to reorder todos"
}
```

**Contoh Request (cURL):**
```bash
curl -X PUT http://localhost:5000/api/todos/reorder \
  -H "Authorization: Bearer <your_token_here>" \
  -H "Content-Type: application/json" \
  -d '{
    "todos": [
      { "id": 3, "position": 0 },
      { "id": 1, "position": 1 },
      { "id": 2, "position": 2 }
    ]
  }'
```

---

## Error Responses

Semua error response mengikuti format:
```json
{
  "success": false,
  "error": "Error message"
}
```

**Status Codes:**
- `200` - OK (Request berhasil)
- `201` - Created (Resource baru berhasil dibuat)
- `400` - Bad Request (Request tidak valid, misal field required kosong)
- `401` - Unauthorized (Token tidak ada atau tidak valid)
- `403` - Forbidden (Token valid tapi tidak punya akses)
- `404` - Not Found (Resource tidak ditemukan)
- `500` - Internal Server Error (Error di sisi server)

**Common Error Messages:**
- `"Access token required"` - Token tidak dikirim di header
- `"Invalid token"` - Format token salah atau token expired
- `"User not found"` - User dengan ID di token tidak ditemukan
- `"Database error"` - Error saat query ke database
- `"Failed to fetch/create/update/delete ..."` - Generic error untuk operasi CRUD