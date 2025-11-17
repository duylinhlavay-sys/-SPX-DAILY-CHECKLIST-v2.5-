# 🔧 Troubleshooting Guide - [SPX] DAILY CHECKLIST

## ❌ Lỗi Thường Gặp Khi Deploy

### 1️⃣ Lỗi: "Exception: Không tìm thấy tệp HTML có tên styles" (Dòng 235)

**Nguyên nhân:**
- Bạn đã tạo file HTML trong Apps Script với tên SAI: `styles.html`
- Hoặc `script.html`, `index.html` (có thêm extension `.html`)

**Giải pháp:**
✅ Xóa các file HTML có extension `.html` và tạo lại với tên ĐÚNG:

| ❌ Sai | ✅ Đúng |
|--------|---------|
| `styles.html` | `styles` |
| `script.html` | `script` |
| `index.html` | `index` |

**Cách tạo file đúng:**
1. Trong Apps Script Editor, click `+` → chọn `HTML`
2. Khi hỏi tên file, chỉ gõ: `styles` (không gõ `.html`)
3. Copy code từ `gas-files/styles.html` và paste vào
4. Lặp lại cho `script` và `index`

---

### 2️⃣ Lỗi: "ReferenceError: SPREADSHEET_ID is not defined"

**Nguyên nhân:**
- Bạn chưa update SPREADSHEET_ID trong file `Code.gs`

**Giải pháp:**
1. Mở Google Sheets của bạn
2. Copy Spreadsheet ID từ URL:
   ```
   https://docs.google.com/spreadsheets/d/1xW0gt54PxtywL-gOgwJ325Sdl3F2-cu5LGs6mO3ai1o/edit
                                          ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                                          Đây là SPREADSHEET_ID
   ```
3. Mở file `Code.gs` trong Apps Script
4. Tìm dòng 14:
   ```javascript
   var SPREADSHEET_ID = '1xW0gt54PxtywL-gOgwJ325Sdl3F2-cu5LGs6mO3ai1o';
   ```
5. Thay bằng ID của spreadsheet của bạn
6. Save (Ctrl+S)

---

### 3️⃣ Lỗi: "Access Denied" khi mở web app

**Nguyên nhân:**
- Email của bạn chưa được thêm vào sheet `UserPermissions`
- Hoặc `Active = FALSE`

**Giải pháp:**
1. Mở Google Sheets
2. Vào sheet `UserPermissions`
3. Thêm dòng mới với email của bạn:

| Email | Hub | Role | Active |
|-------|-----|------|--------|
| your@email.com | ALL | admin | TRUE |

4. Refresh web app và thử lại

---

### 4️⃣ Lỗi: "You do not have permission to call setupSheets"

**Nguyên nhân:**
- Bạn chưa authorize ứng dụng truy cập Google Sheets

**Giải pháp:**
1. Trong Apps Script Editor, chọn function `setupSheets` từ dropdown
2. Click Run (▶️)
3. Khi popup hiện, click `Review Permissions`
4. Chọn Google Account
5. Click `Advanced` → `Go to [SPX] DAILY CHECKLIST (unsafe)`
6. Click `Allow`
7. Chạy lại `setupSheets`

---

### 5️⃣ Web App không hiển thị gì / Blank page

**Nguyên nhân:**
- File `index` không được đặt làm file chính
- Hoặc function `doGet()` không có trong `Code.gs`

**Giải pháp:**
1. Check file `Code.gs` có function `doGet()` không (dòng 220-227):
   ```javascript
   function doGet() {
     var template = HtmlService.createTemplateFromFile('index');
     var html = template.evaluate();
     return html
       .setTitle('[SPX] DAILY CHECKLIST')
       .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
   }
   ```
2. Đảm bảo file `index` tồn tại (không có `.html`)
3. Save và deploy lại web app

---

### 6️⃣ Lỗi: "Cannot find method getEmail"

**Nguyên nhân:**
- Deployment config sai → "Execute as" phải là "Me"

**Giải pháp:**
1. Click `Deploy` → `Manage deployments`
2. Click ✏️ (Edit) deployment hiện tại
3. Đảm bảo:
   - **Execute as**: `Me (your@email.com)`
   - **Who has access**: `Anyone` hoặc `Anyone within [domain.com]`
4. Click `Deploy`
5. Copy URL mới và test lại

---

### 7️⃣ Tasks không được lưu / Data mất

**Nguyên nhân:**
- Sheet `ChecklistData` không tồn tại
- Hoặc chưa chạy `setupSheets()`

**Giải pháp:**
1. Mở Google Sheets
2. Check các sheet sau có tồn tại không:
   - ✅ UserPermissions
   - ✅ ChecklistData
   - ✅ AuditLog
   - ✅ UIConfig
   - ✅ TaskTemplate
   - ✅ TaskTemplateByHub
   - ✅ NotesData
   - ✅ Presence
3. Nếu thiếu → Chạy function `setupSheets()` trong Apps Script
4. Refresh web app và thử lại

---

### 8️⃣ Export Excel / PDF không hoạt động

**Nguyên nhân:**
- Function `exportToExcel()` hoặc `exportToPDF()` không có trong `Code.gs`
- Hoặc thiếu quyền truy cập Google Drive

**Giải pháp:**
1. Check file `Code.gs` có functions:
   - `exportToExcel()` (dòng ~1150)
   - `exportToPDF()` (dòng ~1200)
2. Authorize Drive permissions:
   - Chạy function `exportToExcel()` trong editor
   - Allow Drive access khi được hỏi
3. Test lại trong web app

---

### 9️⃣ Theme/Language không được lưu

**Nguyên nhân:**
- Browser block localStorage (Incognito mode hoặc privacy settings)

**Giải pháp:**
- Sử dụng browser bình thường (không Incognito)
- Hoặc allow localStorage trong browser settings

---

### 🔟 Calendar SLA không tạo events

**Nguyên nhân:**
- Chưa authorize Calendar permissions
- Hoặc `calendar_id` trong UIConfig sai

**Giải pháp:**
1. Authorize Calendar:
   - Chạy function `testCalendar()` trong editor
   - Allow Calendar access
2. Check UIConfig sheet:
   - Key: `calendar_id`
   - Value: (để trống = dùng primary calendar)
   - Hoặc set calendar ID cụ thể

---

## 📞 Cần Thêm Hỗ Trợ?

Nếu vẫn gặp lỗi sau khi thử các cách trên:

1. ✅ Check xem tất cả 4 files đã copy đúng chưa (Code.gs, index, styles, script)
2. ✅ Check SPREADSHEET_ID đã update chưa
3. ✅ Check UserPermissions sheet đã có email của bạn chưa
4. ✅ Check đã authorize đủ permissions chưa (Sheets, Drive, Calendar)
5. ✅ Xem Execution logs trong Apps Script:
   - Menu: `Executions` → Xem log errors chi tiết

---

**Lưu ý:** 
- Apps Script có giới hạn 6 minutes execution time
- Nếu data quá lớn → Optimize bằng cách giảm date range trong reports
- Nếu quá nhiều users online → Tăng Presence cleanup interval
