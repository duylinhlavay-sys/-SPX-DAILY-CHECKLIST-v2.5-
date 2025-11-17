# [SPX] DAILY CHECKLIST - Thiết Kế Kiến Trúc

## Phân Tích Code Gốc

### Cấu trúc hiện tại
- **One-file approach**: Tất cả HTML/CSS/JS trong một file Code.gs
- **No authentication**: Không có hệ thống xác thực, ai cũng truy cập được
- **No authorization**: Tất cả user đều thấy tất cả hub
- **Admin tab**: Có sẵn nhưng không phân quyền

### Chức năng chính hiện tại
1. **Checklist Management**: CRUD tasks theo hub/date
2. **SLA Tracking**: Đặt và theo dõi SLA cho từng task
3. **Template System**: TaskTemplate (global) + TaskTemplateByHub (per hub)
4. **Notes**: Ghi chú cho từng ngày/hub
5. **Report**: Tổng hợp theo range
6. **Unfinished**: Danh sách task chưa hoàn thành
7. **Online/Presence**: Tracking người đang online
8. **Admin**: Template editor, UIConfig editor
9. **Calendar Integration**: Sync SLA to Google Calendar

## Thiết Kế Mới

### 1. Authentication System

#### Google Account Authentication
```javascript
// Backend (Code.gs)
function whoami() {
  var user = Session.getActiveUser();
  var email = user.getEmail();
  if (!email) return { error: 'Not authenticated' };
  
  // Check whitelist từ UserPermissions sheet
  var permissions = getUserPermissions(email);
  if (!permissions) return { error: 'Access denied' };
  
  return {
    email: email,
    role: permissions.role,        // 'user' | 'admin'
    hubs: permissions.hubs,        // ['HUB-TVH', ...] hoặc 'ALL'
    displayName: user.getEmail().split('@')[0]
  };
}
```

#### UserPermissions Sheet Structure
```
| Email           | Hub      | Role  | Active | LastAccess | CreatedAt |
|-----------------|----------|-------|--------|------------|-----------|
| user1@spx.vn    | 80TVH01  | user  | TRUE   | timestamp  | timestamp |
| user2@spx.vn    | 80TVH02  | user  | TRUE   | timestamp  | timestamp |
| admin@spx.vn    | ALL      | admin | TRUE   | timestamp  | timestamp |
```

### 2. Authorization System

#### Permission Check (Backend)
```javascript
function checkPermission(email, hub, action) {
  var perms = getUserPermissions(email);
  if (!perms || !perms.Active) return false;
  
  // Admin có quyền mọi thứ
  if (perms.Role === 'admin') return true;
  
  // User chỉ truy cập hub được gán
  if (perms.Role === 'user') {
    var allowedHubs = perms.Hub.split(',').map(h => h.trim());
    return allowedHubs.includes(hub);
  }
  
  return false;
}
```

#### Hub Filtering (Frontend)
```javascript
// Chỉ hiển thị hub user có quyền
function populateHubDropdown(userInfo) {
  var hubSel = document.getElementById('hub');
  hubSel.innerHTML = '';
  
  var hubs = userInfo.role === 'admin' ? Object.keys(hubData) : userInfo.hubs;
  hubs.forEach(function(hubId) {
    var opt = document.createElement('option');
    opt.value = hubId;
    opt.textContent = hubData[hubId].name || hubId;
    hubSel.appendChild(opt);
  });
}
```

### 3. Module Nâng Cấp

#### A. Module Admin (Enhanced)
**Chức năng:**
- Quản lý Users (CRUD)
- Quản lý Hubs (CRUD)
- Quản lý Permissions (assign users to hubs)
- View all data (toàn bộ hub)
- System settings

**UI Components:**
- User Management Table (add/edit/delete users)
- Hub Assignment Interface
- Permission Matrix
- System Logs Viewer

#### B. Module Báo Cáo (Export Excel + PDF)
**Chức năng:**
- Export to Excel (native Google Sheets export)
- Export to PDF (Utilities.formatString + DriveApp)
- Templates: Daily, Weekly, Monthly, Custom Range

**Implementation:**
```javascript
// Excel Export
function exportToExcel(data) {
  var ss = SpreadsheetApp.create('Report_' + new Date().getTime());
  var sheet = ss.getActiveSheet();
  
  // Populate data
  sheet.getRange(1, 1, data.length, data[0].length).setValues(data);
  
  // Return URL để user download
  return {
    url: ss.getUrl(),
    id: ss.getId()
  };
}

// PDF Export
function exportToPDF(hub, dateRange) {
  // Tạo HTML template
  var html = generateReportHTML(hub, dateRange);
  
  // Convert to PDF
  var blob = Utilities.newBlob(html, 'text/html', 'report.html');
  var pdf = blob.getAs('application/pdf');
  
  // Save to Drive
  var file = DriveApp.createFile(pdf);
  file.setName('Report_' + hub + '_' + dateRange.start + '_to_' + dateRange.end + '.pdf');
  
  return {
    url: file.getUrl(),
    id: file.getId()
  };
}
```

#### C. Module Highlight (Analytics)
**Metrics:**
1. **Truy cập theo giờ**: Số lượng presence heartbeat mỗi giờ
2. **Task SLA Performance**:
   - Hoàn thành đúng SLA
   - Hoàn thành sớm hơn SLA
   - Hoàn thành trễ SLA
3. **Performance theo Hub**: So sánh các hub

**Data Structure:**
```javascript
{
  visits_hourly: [{h: 0, count: 5}, {h: 1, count: 3}, ...],
  sla_performance: {
    on_time: 45,
    early: 12,
    late: 8,
    total: 65
  },
  by_hub: {
    '80TVH01': { on_time: 10, late: 2, rate: 83.3 },
    '80TVH02': { on_time: 15, late: 1, rate: 93.8 }
  }
}
```

#### D. Module Truy Cập (Audit Log)
**Log Events:**
- Login/Logout
- View hub/date
- Create/Edit/Delete task
- Change SLA
- Export report
- Admin actions

**AuditLog Sheet Structure:**
```
| Timestamp | Email | Action | Hub | Details | IPAddress | UserAgent |
|-----------|-------|--------|-----|---------|-----------|-----------|
```

**Implementation:**
```javascript
function logAudit(email, action, hub, details) {
  var sheet = SpreadsheetApp.openById(SPREADSHEET_ID)
    .getSheetByName(SHEET_NAMES.AUDIT);
  
  sheet.appendRow([
    new Date(),
    email,
    action,
    hub || '',
    JSON.stringify(details || {}),
    Session.getActiveUser().getEmail(), // IP không available trong Apps Script
    '' // UserAgent không available
  ]);
}
```

### 4. File Structure (Tách riêng HTML/CSS/JS)

```
gas-files/
├── Code.gs              # Backend logic
├── index.html           # HTML structure
├── styles.html          # CSS styles  
└── script.html          # JavaScript client
```

**Code.gs** - Include HTML files:
```javascript
function _buildHtml() {
  var template = HtmlService.createTemplateFromFile('index');
  return template.evaluate();
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}
```

**index.html** - Use include:
```html
<!DOCTYPE html>
<html>
<head>
  <?!= include('styles'); ?>
</head>
<body>
  <!-- Content -->
  <?!= include('script'); ?>
</body>
</html>
```

### 5. Data Flow

```
User Browser
    ↓
[Google Auth] → Session.getActiveUser()
    ↓
[Check UserPermissions Sheet] → {email, role, hubs}
    ↓
[Load UI based on permissions]
    ↓
[User interacts with App]
    ↓
[API Call via google.script.run]
    ↓
[Backend checks permission again]
    ↓
[Execute action + Log to AuditLog]
    ↓
[Return result]
```

### 6. Security Considerations

1. **Double-check permissions**: Frontend filter + Backend validate
2. **Audit logging**: Log tất cả action quan trọng
3. **Email whitelist**: Chỉ email trong UserPermissions được access
4. **No client-side secrets**: Tất cả logic quan trọng ở backend
5. **Sanitize input**: Escape HTML, validate data trước khi lưu

### 7. Deployment Plan

1. **Development**: Code trên Replit với preview server
2. **Testing**: Test đầy đủ tất cả modules
3. **Package**: Chuẩn bị 4 files (.gs + 3 .html) để copy
4. **Documentation**: Hướng dẫn setup từng bước
5. **Deploy**: User copy vào Apps Script editor

## Next Steps

1. ✅ Phân tích code gốc
2. ✅ Thiết kế kiến trúc mới
3. ⏳ Implement Code.gs (backend)
4. ⏳ Implement index.html (structure)
5. ⏳ Implement styles.html (CSS)
6. ⏳ Implement script.html (JS client)
7. ⏳ Test & Debug
8. ⏳ Create documentation
9. ⏳ Package for deployment
