# [SPX] DAILY CHECKLIST - Enhanced Version v2.0

## 🎯 Tổng quan

Hệ thống quản lý checklist hàng ngày cho SPX Express với xác thực Google nội bộ, phân quyền theo Hub, và các module quản lý chuyên nghiệp.

## ✨ Tính năng mới v2.0

### 🔐 Xác Thực & Phân Quyền
- **Google Account Authentication**: Sử dụng `Session.getActiveUser()` để xác thực
- **Role-based Authorization**: 2 vai trò `admin` và `user`
- **Hub-based Access Control**: User chỉ truy cập hub được gán
- **UserPermissions Sheet**: Quản lý tập trung quyền truy cập
- **Auto Logout inactive users**: Tự động logout user không active

### ⚙️ Module Admin (MỚI)
- ✅ Quản lý Users (CRUD): Thêm, sửa, xóa users
- ✅ Gán Hub cho từng user (multi-hub support)
- ✅ Kích hoạt/Vô hiệu hóa tài khoản
- ✅ Xem thông tin truy cập cuối cùng
- ✅ Real-time user management table

### 📊 Module Báo Cáo (NÂNG CẤP)
- ✅ Tổng hợp dữ liệu theo khoảng thời gian (hôm nay, tuần, tháng, tùy chỉnh)
- ✅ **Export Excel**: Tạo Google Sheets có thể download dạng Excel
- ✅ **Export PDF**: Tạo PDF report trực tiếp
- ✅ SLA Performance Analytics
- ✅ Task completion statistics
- ✅ Category breakdown

### 🔥 Module Highlight (MỚI)
- ✅ Thống kê truy cập theo giờ (24h tracking)
- ✅ Active users tracking
- ✅ SLA Performance (on-time / late / rate %)
- ✅ Task completion rate theo category
- ✅ Hub performance comparison
- ✅ Interactive analytics dashboard

### 🔍 Module Truy Cập (MỚI)
- ✅ Log tất cả hành động: login, CRUD tasks, export reports
- ✅ Filter theo user, action, hub, date range
- ✅ Admin xem toàn bộ, User chỉ xem log của mình
- ✅ Detailed event tracking với timestamp
- ✅ Session tracking

### 🎨 UI/UX Giữ Nguyên
- ✅ Aurora gradient background
- ✅ Glass morphism design
- ✅ Fixed topbar navigation
- ✅ Tab-based interface
- ✅ Responsive mobile-friendly
- ✅ Dark/Light theme toggle
- ✅ Bilingual VI/EN support

## 📁 Cấu Trúc File

```
/
├── gas-files/                  # Google Apps Script files
│   ├── Code.gs                 # Backend: Auth, API, CRUD, Reports
│   ├── index.html              # HTML structure
│   ├── styles.html             # CSS styling (tách riêng)
│   └── script.html             # JavaScript client (tách riêng)
│
├── preview-server/             # Development preview server
│   ├── server.js               # Node.js Express server
│   └── public/                 # Static assets
│
├── README.md                   # This file
└── ARCHITECTURE.md             # Technical architecture
```

## 🚀 Hướng Dẫn Deployment

### Bước 1: Chuẩn bị Google Sheets

1. Tạo Google Spreadsheet mới
2. Copy **Spreadsheet ID** từ URL:
   ```
   https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit
   ```
3. Cập nhật `SPREADSHEET_ID` trong file `Code.gs` (dòng 14):
   ```javascript
   var SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';
   ```

### Bước 2: Setup Apps Script Project

1. Mở Google Apps Script: https://script.google.com
2. Tạo project mới: `Dự án mới`
3. Đặt tên project: `[SPX] DAILY CHECKLIST v2.0`

### Bước 3: Copy Code Files

> ⚠️ **QUAN TRỌNG: Tên File Trong Apps Script**
> 
> Khi tạo HTML file trong Google Apps Script editor, **KHÔNG thêm extension `.html`** vào tên!
> 
> | File nguồn (Replit) | Tên trong Apps Script |
> |---------------------|----------------------|
> | `gas-files/Code.gs` | `Code.gs` |
> | `gas-files/index.html` | `index` ← KHÔNG có .html |
> | `gas-files/styles.html` | `styles` ← KHÔNG có .html |
> | `gas-files/script.html` | `script` ← KHÔNG có .html |

#### File 1: Code.gs (Backend)
- Rename file `Code.gs` mặc định
- Copy toàn bộ nội dung từ `gas-files/Code.gs`
- Paste vào Apps Script editor
- **Nhớ update SPREADSHEET_ID**

#### File 2: index (Structure)
- Click `+` → `HTML` → Đặt tên **`index`** (KHÔNG gõ `index.html`)
- Copy nội dung từ `gas-files/index.html`
- Paste vào editor

#### File 3: styles (CSS)
- Click `+` → `HTML` → Đặt tên **`styles`** (KHÔNG gõ `styles.html`)
- Copy nội dung từ `gas-files/styles.html`
- Paste vào editor

#### File 4: script (JavaScript)
- Click `+` → `HTML` → Đặt tên **`script`** (KHÔNG gõ `script.html`)
- Copy nội dung từ `gas-files/script.html`
- Paste vào editor

### Bước 4: Initialize Database Sheets

1. Trong Apps Script Editor, chọn function `setupSheets` từ dropdown
2. Click `Run` (▶️)
3. Authorize ứng dụng khi được hỏi:
   - Click `Review Permissions`
   - Chọn Google Account
   - Click `Advanced` → `Go to [SPX] DAILY CHECKLIST (unsafe)`
   - Click `Allow`
4. Check Google Sheets để xác nhận các sheet đã được tạo:
   - ✅ `UserPermissions` - Quản lý users
   - ✅ `ChecklistData` - Dữ liệu tasks
   - ✅ `AuditLog` - Lịch sử truy cập
   - ✅ `UIConfig` - Cấu hình UI
   - ✅ `TaskTemplate` - Template global
   - ✅ `TaskTemplateByHub` - Template theo hub
   - ✅ `NotesData` - Ghi chú
   - ✅ `Presence` - Tracking online users

### Bước 5: Setup UserPermissions

Mở sheet `UserPermissions` trong Google Sheets và thêm users:

| Email | Hub | Role | Active | DisplayName | PhotoUrl | LastAccess | CreatedAt |
|-------|-----|------|--------|-------------|----------|------------|-----------|
| admin@spx.vn | ALL | admin | TRUE | Admin User | | | 2025-10-23 |
| user1@spx.vn | 80TVH01 | user | TRUE | Nguyễn Văn A | | | 2025-10-23 |
| user2@spx.vn | 80TVH02,80TVH03 | user | TRUE | Trần Thị B | | | 2025-10-23 |

**💡 Chú ý:**
- `Hub`: 
  - Gán nhiều hub bằng dấu phẩy: `80TVH01,80TVH02`
  - Admin dùng `ALL` để truy cập toàn bộ hub
- `Role`: `admin` hoặc `user` (lowercase)
- `Active`: `TRUE` hoặc `FALSE` (phải viết HOA)
- `Email`: Phải là email nội bộ SPX

### Bước 6: Deploy Web App

1. Click `Deploy` → `New deployment`
2. Click gear icon ⚙️ → Select type: `Web app`
3. Cấu hình deployment:
   - **Description**: `v2.0 - With Authentication & Permissions`
   - **Execute as**: `Me (your@email.com)`
   - **Who has access**: 
     - Recommended: `Anyone within [your-domain.com]`
     - Hoặc: `Anyone` (nếu muốn public)
4. Click `Deploy`
5. Copy **Web app URL**
6. Click `Authorize access` nếu được hỏi

### Bước 7: Test Authentication

1. Mở Web app URL trong incognito browser
2. Đăng nhập bằng Google Account của SPX
3. Kiểm tra các scenario:
   - ✅ User trong `UserPermissions` sheet → Vào app thành công
   - ✅ User có `Active = TRUE` → Vào app thành công  
   - ✅ User không trong sheet → Hiện "Access Denied"
   - ✅ User có `Active = FALSE` → Hiện "Account inactive"
   - ✅ User role `user` → Chỉ thấy hub được gán
   - ✅ User role `admin` → Thấy tất cả hub + tab Admin

### Bước 8: Test Permissions

#### Test User Permissions
Login với account có `role = user`:
- ✅ Chỉ thấy hub được gán trong dropdown
- ✅ Không thấy tab "Admin"
- ✅ Chỉ xem được audit log của mình trong tab "Truy Cập"
- ✅ Load/Save tasks thành công cho hub được gán
- ✅ Bị denied khi cố truy cập hub khác

#### Test Admin Permissions
Login với account có `role = admin`:
- ✅ Thấy tất cả hub trong dropdown
- ✅ Thấy tab "Admin"
- ✅ Xem được toàn bộ audit log
- ✅ Quản lý được users (add/edit/delete)
- ✅ Export reports cho mọi hub

## 📝 Hướng Dẫn Sử Dụng

### 👤 Cho User Thường

#### 1. Quản Lý Checklist Hàng Ngày
1. Chọn **Hub** từ sidebar (chỉ thấy hub được gán)
2. Chọn **Ngày** cần xem
3. Check/uncheck tasks để đánh dấu hoàn thành
4. Tasks tự động lưu khi check ✅
5. Thêm task tức thì: Click "+ Task tức thì"
6. Click "💾 Lưu" để lưu thủ công

#### 2. Xem Báo Cáo Analytics
1. Chuyển sang tab **"📊 Báo Cáo"**
2. Chọn khoảng thời gian: Hôm nay / Tuần / Tháng
3. Click "🔄 Tải báo cáo"
4. Xem tổng quan: Total, Completed, SLA Rate
5. Export:
   - Click "📗 Export Excel" → Mở Google Sheets
   - Click "📕 Export PDF" → Download PDF

#### 3. Xem Highlight Performance
1. Tab **"🔥 Highlight"**
2. Chọn khoảng thời gian
3. Click "🔄 Tải dữ liệu"
4. Xem metrics:
   - Active Users
   - Truy cập theo giờ
   - SLA Performance
   - Task completion rate

#### 4. Ghi Chú
1. Tab **"📝 Ghi Chú"**
2. Nhập nội dung → Click "+ Thêm"
3. Ghi chú lưu theo hub/date

### 👨‍💼 Cho Admin

#### 1. Quản Lý Users
1. Tab **"⚙️ Admin"** → Section "👥 Quản Lý Users"
2. Click "🔄 Tải lại" để refresh danh sách
3. **Thêm user mới**:
   - Click "+ Thêm User"
   - Nhập: Email, Hub, Role, Active
   - Click Save
4. **Edit user**: Click "Edit" → Sửa thông tin
5. **Delete user**: Click "Delete" → Confirm

#### 2. Xem Audit Log Toàn Hệ Thống
1. Tab **"🔍 Truy Cập"**
2. Filter theo:
   - Email user
   - Action (LOGIN, SAVE_TASKS, EXPORT_EXCEL, etc.)
   - Hub
3. Click "🔍 Lọc"
4. Xem chi tiết: Email, Action, Hub, Timestamp

#### 3. Export Reports Cross-Hub
- Export Excel/PDF cho bất kỳ hub nào
- Xem analytics toàn bộ hệ thống
- So sánh performance giữa các hub

## 🔧 Cấu Hình Nâng Cao

### Custom Hub Configuration

Thêm hub mới trong `gas-files/script.html` (dòng ~28):

```javascript
var hubData = {
  '80TVH01': { name: '80-TVH TRA VINH HUB' },
  '80TVH02': { name: '80-TVH DUYEN HAI HUB' },
  // Thêm hub mới
  '80TVH12': { name: '80-TVH MY NEW HUB' }
};
```

### Task Templates

#### Global Template (Cho tất cả hub)
Sheet `TaskTemplate`:
```
Category    | Text               | Lead? | Link | Info
------------|-------------------|-------|------|-----
Đầu Ca      | Kiểm tra kho      | FALSE |      |
Đầu Ca      | Phê duyệt đơn     | TRUE  |      |
Trong Ca    | Scan parcel       | FALSE |      |
```

#### Hub-specific Template (Override)
Sheet `TaskTemplateByHub`:
```
HubId    | Category | Text          | Lead? | Link | Info
---------|----------|---------------|-------|------|-----
80TVH01  | Đầu Ca   | Check depot   | FALSE |      |
80TVH01  | Cuối Ca  | Lock depot    | TRUE  |      |
```

### UI Configuration

Sheet `UIConfig` (key-value pairs):
```
Key             | Value
----------------|------------------------
calendar_id     | your-calendar@google.com
admin_emails    | admin1@spx.vn,admin2@spx.vn
online_window   | 180
```

## 🎨 Tùy Chỉnh Giao Diện

### Brand Colors
Sửa trong `gas-files/styles.html`:
```css
:root {
  --brand-1: #ff6a00;  /* SPX Orange */
  --brand-2: #ffb300;  /* SPX Yellow */
}
```

### Dark/Light Theme
User tự toggle bằng nút 🌓 trên topbar.

## 🐛 Troubleshooting

### ❌ "Not authenticated"
**Nguyên nhân**: User chưa login Google hoặc session hết hạn

**Giải pháp**:
1. Kiểm tra đã login Google Account chưa
2. Deploy với settings đúng:
   - "Execute as: Me"
   - "Who has access: Anyone within [domain]"
3. Clear cache và thử lại

### ❌ "Access denied"
**Nguyên nhân**: Email không có trong UserPermissions hoặc Active = FALSE

**Giải pháp**:
1. Thêm email vào sheet `UserPermissions`
2. Set `Active = TRUE`
3. Gán ít nhất 1 hub (hoặc `ALL` cho admin)
4. Refresh page

### ❌ "Permission denied" khi load tasks
**Nguyên nhân**: User không có quyền truy cập hub đang chọn

**Giải pháp**:
1. Check UserPermissions: Hub phải khớp chính xác
2. Case-sensitive: `80TVH01` ≠ `80tvh01`
3. Admin phải có Hub = `ALL`

### ❌ Export Excel/PDF không hoạt động
**Nguyên nhân**: Thiếu quyền Drive hoặc quota vượt

**Giải pháp**:
1. Re-authorize Apps Script
2. Check quota Google Drive (15GB free)
3. Check Apps Script execution time (<6 minutes)

### ❌ Không thấy tab Admin
**Nguyên nhân**: User không phải admin

**Giải pháp**:
- Set `Role = admin` trong UserPermissions
- Logout và login lại

## 📊 Database Schema

### UserPermissions
```sql
Email (PK)  | Hub              | Role  | Active | DisplayName | PhotoUrl | LastAccess | CreatedAt
------------|------------------|-------|--------|-------------|----------|------------|----------
TEXT        | TEXT (CSV)       | TEXT  | BOOL   | TEXT        | TEXT     | DATETIME   | DATETIME
user@spx.vn | 80TVH01,80TVH02  | user  | TRUE   | User Name   |          | timestamp  | timestamp
```

### ChecklistData
```sql
StorageKey (PK)          | Data (JSON)         | LastModified | ModifiedBy
-------------------------|---------------------|--------------|------------
TEXT                     | TEXT                | DATETIME     | TEXT
tasks_80TVH01_2025-10-23 | [{task objects}]    | timestamp    | user@spx.vn
```

### AuditLog
```sql
Timestamp   | Email       | Action       | Hub      | Details (JSON) | SessionInfo
------------|-------------|--------------|----------|----------------|------------
DATETIME    | TEXT        | TEXT         | TEXT     | TEXT           | TEXT
timestamp   | user@spx.vn | LOAD_TASKS   | 80TVH01  | {...}          | user@spx.vn
timestamp   | user@spx.vn | EXPORT_EXCEL | 80TVH02  | {...}          | user@spx.vn
```

## 🔐 Security Best Practices

### 1. Authentication
- ✅ Always check `Session.getActiveUser()`
- ✅ Validate email với UserPermissions sheet
- ✅ Log tất cả login attempts

### 2. Authorization
- ✅ Double-check permissions ở backend
- ✅ Frontend filter chỉ để UX, KHÔNG phải security layer
- ✅ Mỗi API call đều validate quyền

### 3. Audit Logging
- ✅ Log tất cả action quan trọng
- ✅ Track: Who, What, When, Where
- ✅ Keep logs for compliance

### 4. Data Validation
- ✅ Sanitize input trước khi lưu database
- ✅ Escape HTML khi render trên UI
- ✅ Validate email format

### 5. Access Control
- ✅ Principle of least privilege
- ✅ User chỉ xem được data của hub được gán
- ✅ Admin có full access nhưng vẫn được audit

## 📞 Support & Maintenance

### Nếu gặp vấn đề:
1. ✅ Check AuditLog để trace lỗi
2. ✅ Check Apps Script Logs: View → Execution log
3. ✅ Contact admin team qua email

### Regular Maintenance:
- 🔄 Review audit logs hàng tuần
- 🔄 Clean up inactive users hàng tháng
- 🔄 Backup UserPermissions sheet
- 🔄 Monitor Apps Script quotas

---

**Version**: 2.0 Enhanced with Security  
**Release Date**: October 2025  
**Team**: SPX Express TVH Development Team  
**License**: Internal Use Only - SPX Express  
**Contact**: [Your IT Support Email]
