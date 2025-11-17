# 🚀 HƯỚNG DẪN DEPLOY LÊN GOOGLE APPS SCRIPT

Hướng dẫn đầy đủ để deploy [SPX] DAILY CHECKLIST lên Google Apps Script và chạy trên Google Sheets.

---

## 📋 MỤC LỤC
1. [Chuẩn Bị](#chuẩn-bị)
2. [Tạo Google Spreadsheet](#bước-1-tạo-google-spreadsheet)
3. [Copy Code vào Apps Script](#bước-2-copy-code-vào-apps-script)
4. [Cấu Hình SPREADSHEET_ID](#bước-3-cấu-hình-spreadsheet_id)
5. [Chạy setupSheets()](#bước-4-chạy-setupsheets)
6. [Deploy Web App](#bước-5-deploy-web-app)
7. [Truy Cập App](#bước-6-truy-cập-app)
8. [Tùy Chỉnh Logo](#bước-7-tùy-chỉnh-logo-tùy-chọn)
9. [Quản Lý Users](#bước-8-quản-lý-users)
10. [Troubleshooting](#troubleshooting)

---

## Chuẩn Bị

### Yêu Cầu:
- ✅ Tài khoản Google (G Suite hoặc Gmail)
- ✅ Quyền truy cập Google Drive
- ✅ Code từ folder `/gas-files/`

### File Cần Deploy:
- `Code.gs` - Backend logic
- `index.html` - HTML structure
- `styles.html` - CSS styling  
- `script.html` - JavaScript frontend

---

## Bước 1: Tạo Google Spreadsheet

### 1.1. Tạo Spreadsheet Mới
1. Vào https://sheets.google.com
2. Click **Blank** (tạo spreadsheet trống)
3. Đặt tên: **`[SPX] Daily Checklist Database`**

### 1.2. Lấy Spreadsheet ID
1. Nhìn vào URL của spreadsheet:
   ```
   https://docs.google.com/spreadsheets/d/1Jn9emNO_CvYn1pQNo_p8PpuoWD6oMPiBPMFZhiWXJWI/edit
   ```
2. **Copy phần giữa `/d/` và `/edit`** (đây là SPREADSHEET_ID)
   ```
   1Jn9emNO_CvYn1pQNo_p8PpuoWD6oMPiBPMFZhiWXJWI
   ```
3. **Lưu lại** ID này, bạn sẽ cần ở bước 3

---

## Bước 2: Copy Code vào Apps Script

### 2.1. Mở Apps Script Editor
1. Trong Google Sheet vừa tạo, click **Extensions** → **Apps Script**
2. Editor mới sẽ mở ra

### 2.2. Xóa Code Mặc Định
1. Xóa hết code mẫu `function myFunction()` trong file `Code.gs`

### 2.3. Paste Code Backend
1. Mở file **`gas-files/Code.gs`** từ project Replit
2. **Copy toàn bộ** nội dung
3. **Paste** vào `Code.gs` trong Apps Script Editor
4. Click **💾 Save** (hoặc Ctrl+S)

### 2.4. Thêm HTML Files
#### File index.html:
1. Click dấu **+** bên cạnh **Files**
2. Chọn **HTML**
3. Đặt tên: **`index`** (không cần .html)
4. Mở file **`gas-files/index.html`**, copy toàn bộ
5. Paste vào file `index.html` trong Apps Script
6. Save

#### File styles.html:
1. Click dấu **+** → **HTML**
2. Đặt tên: **`styles`**
3. Copy nội dung từ **`gas-files/styles.html`**
4. Paste và Save

#### File script.html:
1. Click dấu **+** → **HTML**
2. Đặt tên: **`script`**
3. Copy nội dung từ **`gas-files/script.html`**
4. Paste và Save

### 2.5. Kiểm Tra Files
Bạn phải có **4 files** trong Apps Script:
- ✅ `Code.gs`
- ✅ `index.html`
- ✅ `styles.html`
- ✅ `script.html`

---

## Bước 3: Cấu Hình SPREADSHEET_ID

### 3.1. Mở Code.gs
1. Click vào file **`Code.gs`**
2. Tìm dòng **14**:
   ```javascript
   var SPREADSHEET_ID = '1Jn9emNO_CvYn1pQNo_p8PpuoWD6oMPiBPMFZhiWXJWI'; // UPDATE THIS
   ```

### 3.2. Thay Thế ID
1. **Thay thế** ID cũ bằng ID spreadsheet của bạn (từ Bước 1.2)
2. Ví dụ:
   ```javascript
   var SPREADSHEET_ID = 'ABC123XYZ456_YOUR_SPREADSHEET_ID'; // UPDATE THIS
   ```
3. **Save** (Ctrl+S)

---

## Bước 4: Chạy setupSheets()

Function này sẽ tự động tạo các sheets cần thiết trong spreadsheet.

### 4.1. Chọn Function
1. Trong Apps Script Editor, tìm dropdown ở thanh công cụ
2. Chọn **`setupSheets`** từ dropdown

### 4.2. Run Function
1. Click nút **▶️ Run** (hoặc Ctrl+R)
2. **Lần đầu tiên** sẽ yêu cầu cấp quyền:
   - Click **Review Permissions**
   - Chọn tài khoản Google của bạn
   - Click **Advanced** → **Go to [Project Name] (unsafe)**
   - Click **Allow**

### 4.3. Xác Nhận Thành Công
1. Quay lại Google Spreadsheet
2. Bạn sẽ thấy các **sheets mới** được tạo tự động:
   - ✅ `UserPermissions`
   - ✅ `ChecklistData`
   - ✅ `TaskTemplate`
   - ✅ `NotesData`
   - ✅ `UIConfig`
   - ✅ `AuditLog`
   - ✅ `QAData`
   - ✅ `ChatMessages`
   - ✅ `Presence`

3. **Check UserPermissions sheet**:
   - Bạn sẽ thấy email của bạn được thêm vào với role **`admin`**
   - Đây là admin đầu tiên của hệ thống

---

## Bước 5: Deploy Web App

### 5.1. Mở Deploy Settings
1. Trong Apps Script Editor, click **Deploy** → **New deployment**

### 5.2. Cấu Hình Deployment
1. Click ⚙️ **Settings** (icon bánh răng)
2. Chọn **Web app**
3. Điền thông tin:
   - **Description**: `[SPX] Daily Checklist v2.1`
   - **Execute as**: **Me** (your_email@domain.com)
   - **Who has access**: 
     - Nếu dùng **G Suite**: Chọn **Anyone within [Your Organization]**
     - Nếu dùng **Gmail cá nhân**: Chọn **Anyone**

### 5.3. Deploy
1. Click **Deploy**
2. Copy **Web app URL** (quan trọng!)
   ```
   https://script.google.com/macros/s/ABC123.../exec
   ```
3. **Lưu lại** URL này

---

## Bước 6: Truy Cập App

### 6.1. Mở Web App
1. Paste **Web app URL** vào browser
2. Hoặc click vào link trong deployment details

### 6.2. Đăng Nhập Lần Đầu
1. App sẽ yêu cầu **Google Account** login
2. Chọn tài khoản của bạn
3. Nếu là lần đầu, sẽ có **popup cấp quyền** giống Bước 4.2

### 6.3. Xác Nhận Hoạt Động
✅ Bạn sẽ thấy:
- **Cover page** với logo và tên app
- Nút **"Chào Mừng Bạn Đã Quay Lại"**
- Click vào để vào app chính
- Topbar hiển thị tên và avatar của bạn

---

## Bước 7: Tùy Chỉnh Logo (Tùy Chọn)

### 7.1. Mở File index.html
1. Trong Apps Script Editor, click vào **`index.html`**
2. Tìm phần **APP_CONFIG** (dòng 26-40)

### 7.2. Thay Đổi Logo URL
1. Upload logo của bạn lên **Google Drive** hoặc **Imgur**
2. Lấy direct link (xem hướng dẫn trong comment của file)
3. Paste vào:
   ```javascript
   logoUrl: 'https://your-logo-url-here.png',
   faviconUrl: 'https://your-favicon-url-here.png',
   ```
4. Save và **Deploy lại** (Deploy → Manage deployments → Edit → New version → Deploy)

### 7.3. Xem Kết Quả
1. Refresh trang web app
2. Logo mới sẽ xuất hiện ở topbar và cover page

---

## Bước 8: Quản Lý Users

### 8.1. Thêm User Mới
Có 2 cách:

#### Cách 1: Qua Admin Panel (Khuyên dùng)
1. Đăng nhập vào app với tài khoản **admin**
2. Click vào tab **Admin/Quản trị**
3. Click **Thêm user** 
4. Điền thông tin:
   - Email
   - Hub (hoặc "ALL" cho admin)
   - Role (admin hoặc user)
   - DisplayName
5. Save

#### Cách 2: Chỉnh Sửa Trực Tiếp Spreadsheet
1. Mở Google Spreadsheet
2. Vào sheet **`UserPermissions`**
3. Thêm row mới với format:
   ```
   Email | Hub | Role | Active | DisplayName | PhotoUrl | LastAccess | CreatedAt
   user@domain.com | 80TVH01 | user | TRUE | Nguyen Van A | | | 2025-01-01
   ```

### 8.2. Xóa/Vô Hiệu Hóa User
1. Vào sheet **`UserPermissions`**
2. Tìm user cần xóa
3. **Xóa row** hoặc đổi `Active` thành `FALSE`

---

## Troubleshooting

### ❌ Lỗi: "Access Denied"
**Nguyên nhân**: Email của bạn chưa có trong UserPermissions sheet

**Giải pháp**:
1. Quay lại Apps Script
2. Chạy lại **`setupSheets()`** function
3. Hoặc thêm email thủ công vào UserPermissions sheet
4. **NEW**: App giờ tự động thêm user đầu tiên làm admin!

### ❌ Lỗi: "Exception: Unexpected error... openById"
**Nguyên nhân**: SPREADSHEET_ID chưa đúng

**Giải pháp**:
1. Kiểm tra lại SPREADSHEET_ID trong Code.gs (dòng 14)
2. Copy lại ID từ URL spreadsheet
3. Save và chạy lại `setupSheets()`

### ❌ Lỗi: "Authorization required"
**Nguyên nhân**: Chưa cấp quyền cho Apps Script

**Giải pháp**:
1. Chạy lại function `setupSheets()`
2. Click **Review Permissions** → **Advanced** → **Allow**
3. Thử deploy lại web app

### ❌ Logo không hiển thị
**Nguyên nhân**: Link ảnh không hợp lệ

**Giải pháp**:
1. Kiểm tra link ảnh có mở được trong browser không
2. Đảm bảo link là **direct URL** (kết thúc .png/.jpg/.svg)
3. Google Drive link phải dạng: `https://drive.google.com/uc?export=view&id=FILE_ID`

### ❌ Data không lưu
**Nguyên nhân**: Lỗi permission hoặc sheet structure

**Giải pháp**:
1. Check console log (F12) để xem lỗi cụ thể
2. Verify sheets đã được tạo đúng bởi `setupSheets()`
3. Check AuditLog sheet để xem error logs

---

## 🎯 Checklist Hoàn Tất

Sau khi hoàn thành tất cả các bước, bạn nên có:

- ✅ Google Spreadsheet với đầy đủ sheets
- ✅ Apps Script project với 4 files (Code.gs, index.html, styles.html, script.html)
- ✅ SPREADSHEET_ID đã cấu hình đúng
- ✅ Web app đã deploy thành công
- ✅ Web app URL đã lưu lại
- ✅ Email admin đã được thêm vào UserPermissions
- ✅ App chạy được và login thành công
- ✅ (Tùy chọn) Logo đã được customize

---

## 📞 Hỗ Trợ

Nếu gặp vấn đề:
1. Check file **TROUBLESHOOTING.md** (nếu có)
2. Xem **Execution logs** trong Apps Script (View → Executions)
3. Check **AuditLog sheet** trong Spreadsheet để trace lỗi
4. Liên hệ IT Department

---

## 🔄 Update App

Khi có version mới:
1. Copy code mới từ `/gas-files/` 
2. Paste vào Apps Script (overwrite files cũ)
3. Save all files
4. **Deploy** → **Manage deployments** → Edit → **New version** → Deploy
5. Users sẽ thấy version mới sau khi refresh

**Lưu ý**: Data trong spreadsheet sẽ được giữ nguyên, chỉ code được update.

---

**Chúc bạn deploy thành công! 🎉**

*[SPX] DAILY CHECKLIST v2.1 - Deployment Guide*
