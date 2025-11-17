# 📥 Bulk Import Hubs và PICs - Hướng Dẫn

## 📋 Tổng Quan

Chức năng **Bulk Import Hubs và PICs** cho phép admin thêm một số lượng lớn Hub và PIC (Person In Charge) cho từng Hub cùng lúc, thay vì phải thêm từng cái một.

---

## 🎯 Tính Năng

### **1. Bulk Import từ JSON**
- Import nhiều Hub và PICs cùng lúc từ JSON array
- Tự động merge Hub nếu user đã tồn tại
- Validation đầy đủ cho email, Hub, Role

### **2. Bulk Import từ CSV**
- Import từ CSV format (dễ export từ Excel/Google Sheets)
- Tự động skip header row
- Support quoted values trong CSV

---

## 📊 Cấu Trúc Dữ Liệu

### **JSON Format:**

```json
{
  "hubsAndPics": [
    {
      "hub": "80TVH01",
      "picEmail": "user1@spx.vn",
      "picName": "Nguyễn Văn A",
      "role": "user",
      "active": true
    },
    {
      "hub": "80TVH02",
      "picEmail": "user2@spx.vn",
      "picName": "Trần Thị B",
      "role": "user",
      "active": true
    }
  ]
}
```

### **CSV Format:**

```
Hub,PIC Email,PIC Name,Role,Active
80TVH01,user1@spx.vn,Nguyễn Văn A,user,true
80TVH02,user2@spx.vn,Trần Thị B,user,true
80TVH03,user3@spx.vn,Lê Văn C,admin,true
```

**Columns:**
1. **Hub** (required) - Hub ID, ví dụ: `80TVH01`
2. **PIC Email** (required) - Email của Person In Charge
3. **PIC Name** (optional) - Tên hiển thị của PIC
4. **Role** (optional) - `user` hoặc `admin` (default: `user`)
5. **Active** (optional) - `true` hoặc `false` (default: `true`)

---

## 🔧 API Functions

### **1. bulkImportHubsAndPICs(args)**

**Mô tả:** Import Hub và PICs từ JSON array

**Parameters:**
```javascript
{
  hubsAndPics: [
    {
      hub: string,          // Required: Hub ID (e.g., "80TVH01")
      picEmail: string,     // Required: PIC email
      picName: string,      // Optional: Display name
      role: string,         // Optional: "user" | "admin" (default: "user")
      active: boolean       // Optional: true | false (default: true)
    }
  ]
}
```

**Return:**
```javascript
{
  status: "ok" | "error",
  message: string,
  total: number,           // Total items processed
  added: number,           // New users added
  updated: number,         // Existing users updated
  errors: [                // Array of errors (if any)
    {
      index: number,       // Index in input array
      hub: string,
      picEmail: string,
      error: string
    }
  ]
}
```

**Example:**
```javascript
var result = bulkImportHubsAndPICs({
  hubsAndPics: [
    {
      hub: "80TVH01",
      picEmail: "user1@spx.vn",
      picName: "Nguyễn Văn A",
      role: "user",
      active: true
    },
    {
      hub: "80TVH02",
      picEmail: "user2@spx.vn",
      picName: "Trần Thị B",
      role: "user",
      active: true
    }
  ]
});

// Result:
// {
//   status: "ok",
//   message: "Bulk import completed",
//   total: 2,
//   added: 2,
//   updated: 0,
//   errors: []
// }
```

---

### **2. bulkImportHubsAndPICsFromCSV(args)**

**Mô tả:** Import Hub và PICs từ CSV text

**Parameters:**
```javascript
{
  csvText: string  // CSV text với format: Hub,PIC Email,PIC Name,Role,Active
}
```

**Return:** Same as `bulkImportHubsAndPICs()`

**Example:**
```javascript
var csvText = `Hub,PIC Email,PIC Name,Role,Active
80TVH01,user1@spx.vn,Nguyễn Văn A,user,true
80TVH02,user2@spx.vn,Trần Thị B,user,true
80TVH03,user3@spx.vn,Lê Văn C,admin,true`;

var result = bulkImportHubsAndPICsFromCSV({ csvText: csvText });

// Result:
// {
//   status: "ok",
//   message: "Bulk import completed",
//   total: 3,
//   added: 3,
//   updated: 0,
//   errors: []
// }
```

---

## 🚀 Cách Sử Dụng

### **Cách 1: Sử dụng trong Google Apps Script Editor**

1. **Mở Apps Script Editor**
2. **Chạy function test:**

```javascript
function testBulkImport() {
  var result = bulkImportHubsAndPICs({
    hubsAndPics: [
      {
        hub: "80TVH01",
        picEmail: "user1@spx.vn",
        picName: "Nguyễn Văn A",
        role: "user",
        active: true
      },
      {
        hub: "80TVH02",
        picEmail: "user2@spx.vn",
        picName: "Trần Thị B",
        role: "user",
        active: true
      }
    ]
  });
  
  Logger.log(JSON.stringify(result, null, 2));
}
```

3. **Hoặc import từ CSV:**

```javascript
function testBulkImportFromCSV() {
  var csvText = `Hub,PIC Email,PIC Name,Role,Active
80TVH01,user1@spx.vn,Nguyễn Văn A,user,true
80TVH02,user2@spx.vn,Trần Thị B,user,true
80TVH03,user3@spx.vn,Lê Văn C,admin,true`;
  
  var result = bulkImportHubsAndPICsFromCSV({ csvText: csvText });
  Logger.log(JSON.stringify(result, null, 2));
}
```

---

### **Cách 2: Chuẩn bị file CSV từ Google Sheets**

1. **Tạo Google Sheet với format:**

| Hub | PIC Email | PIC Name | Role | Active |
|-----|-----------|----------|------|--------|
| 80TVH01 | user1@spx.vn | Nguyễn Văn A | user | true |
| 80TVH02 | user2@spx.vn | Trần Thị B | user | true |
| 80TVH03 | user3@spx.vn | Lê Văn C | admin | true |

2. **Export as CSV** hoặc **Copy to clipboard**

3. **Paste vào function:**

```javascript
function importFromSheets() {
  // Paste CSV text here
  var csvText = `Hub,PIC Email,PIC Name,Role,Active
80TVH01,user1@spx.vn,Nguyễn Văn A,user,true
80TVH02,user2@spx.vn,Trần Thị B,user,true
80TVH03,user3@spx.vn,Lê Văn C,admin,true`;
  
  var result = bulkImportHubsAndPICsFromCSV({ csvText: csvText });
  Logger.log(JSON.stringify(result, null, 2));
}
```

---

## 📝 Lưu Ý Quan Trọng

### **1. Merge Hub Logic:**
- Nếu **user đã tồn tại**, Hub mới sẽ được **merge** vào danh sách Hub hiện tại
- User có thể có **nhiều Hub** (separated by comma): `80TVH01,80TVH02,80TVH03`
- Nếu Hub đã được assign, chỉ update các fields khác (name, role, active)

### **2. Validation:**
- **Hub** và **picEmail** là **required**
- **Email format** được validate (phải có `@`)
- **Role** chỉ accept: `user` hoặc `admin` (default: `user`)
- **Active** chỉ accept: `true` hoặc `false` (default: `true`)

### **3. Error Handling:**
- Nếu một item có lỗi, các item khác vẫn được xử lý
- Tất cả errors được collect và return trong `errors` array
- Check `errors` array để biết items nào failed

### **4. Performance:**
- Sử dụng **batch operations** để optimize performance
- Có thể import **hàng trăm Hub và PICs** cùng lúc
- Mỗi item được process independently (nếu 1 item fail, không ảnh hưởng items khác)

---

## ✅ Examples

### **Example 1: Import 10 Hubs và PICs**

```javascript
function import10Hubs() {
  var result = bulkImportHubsAndPICs({
    hubsAndPics: [
      { hub: "80TVH01", picEmail: "user1@spx.vn", picName: "User 1", role: "user", active: true },
      { hub: "80TVH02", picEmail: "user2@spx.vn", picName: "User 2", role: "user", active: true },
      { hub: "80TVH03", picEmail: "user3@spx.vn", picName: "User 3", role: "user", active: true },
      { hub: "80TVH04", picEmail: "user4@spx.vn", picName: "User 4", role: "user", active: true },
      { hub: "80TVH05", picEmail: "user5@spx.vn", picName: "User 5", role: "user", active: true },
      { hub: "80TVH06", picEmail: "user6@spx.vn", picName: "User 6", role: "user", active: true },
      { hub: "80TVH07", picEmail: "user7@spx.vn", picName: "User 7", role: "user", active: true },
      { hub: "80TVH08", picEmail: "user8@spx.vn", picName: "User 8", role: "user", active: true },
      { hub: "80TVH09", picEmail: "user9@spx.vn", picName: "User 9", role: "user", active: true },
      { hub: "80TVH10", picEmail: "user10@spx.vn", picName: "User 10", role: "user", active: true }
    ]
  });
  
  Logger.log("Total: " + result.total);
  Logger.log("Added: " + result.added);
  Logger.log("Updated: " + result.updated);
  Logger.log("Errors: " + result.errors.length);
}
```

### **Example 2: Import từ CSV với Header**

```javascript
function importFromCSV() {
  var csvText = `Hub,PIC Email,PIC Name,Role,Active
80TVH01,user1@spx.vn,Nguyễn Văn A,user,true
80TVH02,user2@spx.vn,Trần Thị B,user,true
80TVH03,user3@spx.vn,Lê Văn C,admin,true
80TVH04,user4@spx.vn,Phạm Thị D,user,true
80TVH05,user5@spx.vn,Hoàng Văn E,user,true`;
  
  var result = bulkImportHubsAndPICsFromCSV({ csvText: csvText });
  
  if (result.status === 'ok') {
    Logger.log("✅ Import thành công!");
    Logger.log("- Total: " + result.total);
    Logger.log("- Added: " + result.added);
    Logger.log("- Updated: " + result.updated);
    
    if (result.errors.length > 0) {
      Logger.log("- Errors: " + result.errors.length);
      result.errors.forEach(function(err) {
        Logger.log("  - Row " + (err.index + 1) + ": " + err.error);
      });
    }
  } else {
    Logger.log("❌ Import failed: " + result.message);
  }
}
```

### **Example 3: Handle Errors**

```javascript
function importWithErrorHandling() {
  var result = bulkImportHubsAndPICs({
    hubsAndPics: [
      { hub: "80TVH01", picEmail: "user1@spx.vn", picName: "User 1" },  // ✅ OK
      { hub: "80TVH02", picEmail: "invalid-email", picName: "User 2" }, // ❌ Invalid email
      { hub: "", picEmail: "user3@spx.vn", picName: "User 3" },        // ❌ Missing hub
      { hub: "80TVH04", picEmail: "user4@spx.vn", picName: "User 4" }  // ✅ OK
    ]
  });
  
  if (result.errors.length > 0) {
    Logger.log("⚠️ Có " + result.errors.length + " lỗi:");
    result.errors.forEach(function(err) {
      Logger.log("- Row " + (err.index + 1) + " (Hub: " + err.hub + ", Email: " + err.picEmail + "): " + err.error);
    });
  }
  
  Logger.log("✅ Đã import: " + result.added + " users mới, " + result.updated + " users updated");
}
```

---

## 🎯 Use Cases

### **Use Case 1: Setup mới nhiều Hub cùng lúc**

Khi cần setup nhiều Hub mới và assign PIC cho từng Hub:

```javascript
function setupNewHubs() {
  var newHubs = [
    { hub: "80TVH11", picEmail: "pic11@spx.vn", picName: "PIC Hub 11", role: "user", active: true },
    { hub: "80TVH12", picEmail: "pic12@spx.vn", picName: "PIC Hub 12", role: "user", active: true },
    { hub: "80TVH13", picEmail: "pic13@spx.vn", picName: "PIC Hub 13", role: "user", active: true }
  ];
  
  var result = bulkImportHubsAndPICs({ hubsAndPics: newHubs });
  return result;
}
```

### **Use Case 2: Thêm Hub mới cho users hiện có**

Nếu user đã tồn tại, Hub mới sẽ được merge vào:

```javascript
function addNewHubToExistingUsers() {
  // User user1@spx.vn đã có Hub: 80TVH01
  // Thêm Hub mới: 80TVH02
  var result = bulkImportHubsAndPICs({
    hubsAndPics: [
      { hub: "80TVH02", picEmail: "user1@spx.vn", picName: "User 1", role: "user", active: true }
    ]
  });
  
  // User user1@spx.vn bây giờ có: 80TVH01,80TVH02
}
```

### **Use Case 3: Import từ file Excel**

1. **Export Excel to CSV**
2. **Copy CSV content**
3. **Paste vào function:**

```javascript
function importFromExcel() {
  // Paste CSV content here
  var csvText = `...paste CSV here...`;
  
  var result = bulkImportHubsAndPICsFromCSV({ csvText: csvText });
  Logger.log(JSON.stringify(result, null, 2));
}
```

---

## 🔒 Security & Permissions

- ✅ **Admin only** - Chỉ admin mới có thể bulk import
- ✅ **Audit logging** - Tất cả bulk imports được log vào AuditLog
- ✅ **Validation** - Email và Hub format được validate
- ✅ **Error handling** - Errors được collect và report

---

## 📊 Response Format

### **Success Response:**

```json
{
  "status": "ok",
  "message": "Bulk import completed",
  "total": 10,
  "added": 8,
  "updated": 2,
  "errors": []
}
```

### **Error Response (with errors):**

```json
{
  "status": "ok",
  "message": "Bulk import completed",
  "total": 10,
  "added": 7,
  "updated": 1,
  "errors": [
    {
      "index": 3,
      "hub": "80TVH04",
      "picEmail": "invalid-email",
      "error": "Invalid email format"
    },
    {
      "index": 7,
      "hub": "",
      "picEmail": "user8@spx.vn",
      "error": "Missing required fields: hub and picEmail are required"
    }
  ]
}
```

### **Permission Denied:**

```json
{
  "status": "error",
  "message": "Permission denied"
}
```

---

## 🎉 Kết Luận

**Bulk Import Hubs và PICs** giúp:

- ✅ **Tiết kiệm thời gian** - Thêm nhiều Hub và PICs cùng lúc
- ✅ **Dễ sử dụng** - Support cả JSON và CSV format
- ✅ **An toàn** - Validation đầy đủ và error handling
- ✅ **Flexible** - Merge Hub cho users hiện có
- ✅ **Audit trail** - Tất cả imports được log

---

**SPX Express TVH** © 2025

## 📋 Tổng Quan

Chức năng **Bulk Import Hubs và PICs** cho phép admin thêm một số lượng lớn Hub và PIC (Person In Charge) cho từng Hub cùng lúc, thay vì phải thêm từng cái một.

---

## 🎯 Tính Năng

### **1. Bulk Import từ JSON**
- Import nhiều Hub và PICs cùng lúc từ JSON array
- Tự động merge Hub nếu user đã tồn tại
- Validation đầy đủ cho email, Hub, Role

### **2. Bulk Import từ CSV**
- Import từ CSV format (dễ export từ Excel/Google Sheets)
- Tự động skip header row
- Support quoted values trong CSV

---

## 📊 Cấu Trúc Dữ Liệu

### **JSON Format:**

```json
{
  "hubsAndPics": [
    {
      "hub": "80TVH01",
      "picEmail": "user1@spx.vn",
      "picName": "Nguyễn Văn A",
      "role": "user",
      "active": true
    },
    {
      "hub": "80TVH02",
      "picEmail": "user2@spx.vn",
      "picName": "Trần Thị B",
      "role": "user",
      "active": true
    }
  ]
}
```

### **CSV Format:**

```
Hub,PIC Email,PIC Name,Role,Active
80TVH01,user1@spx.vn,Nguyễn Văn A,user,true
80TVH02,user2@spx.vn,Trần Thị B,user,true
80TVH03,user3@spx.vn,Lê Văn C,admin,true
```

**Columns:**
1. **Hub** (required) - Hub ID, ví dụ: `80TVH01`
2. **PIC Email** (required) - Email của Person In Charge
3. **PIC Name** (optional) - Tên hiển thị của PIC
4. **Role** (optional) - `user` hoặc `admin` (default: `user`)
5. **Active** (optional) - `true` hoặc `false` (default: `true`)

---

## 🔧 API Functions

### **1. bulkImportHubsAndPICs(args)**

**Mô tả:** Import Hub và PICs từ JSON array

**Parameters:**
```javascript
{
  hubsAndPics: [
    {
      hub: string,          // Required: Hub ID (e.g., "80TVH01")
      picEmail: string,     // Required: PIC email
      picName: string,      // Optional: Display name
      role: string,         // Optional: "user" | "admin" (default: "user")
      active: boolean       // Optional: true | false (default: true)
    }
  ]
}
```

**Return:**
```javascript
{
  status: "ok" | "error",
  message: string,
  total: number,           // Total items processed
  added: number,           // New users added
  updated: number,         // Existing users updated
  errors: [                // Array of errors (if any)
    {
      index: number,       // Index in input array
      hub: string,
      picEmail: string,
      error: string
    }
  ]
}
```

**Example:**
```javascript
var result = bulkImportHubsAndPICs({
  hubsAndPics: [
    {
      hub: "80TVH01",
      picEmail: "user1@spx.vn",
      picName: "Nguyễn Văn A",
      role: "user",
      active: true
    },
    {
      hub: "80TVH02",
      picEmail: "user2@spx.vn",
      picName: "Trần Thị B",
      role: "user",
      active: true
    }
  ]
});

// Result:
// {
//   status: "ok",
//   message: "Bulk import completed",
//   total: 2,
//   added: 2,
//   updated: 0,
//   errors: []
// }
```

---

### **2. bulkImportHubsAndPICsFromCSV(args)**

**Mô tả:** Import Hub và PICs từ CSV text

**Parameters:**
```javascript
{
  csvText: string  // CSV text với format: Hub,PIC Email,PIC Name,Role,Active
}
```

**Return:** Same as `bulkImportHubsAndPICs()`

**Example:**
```javascript
var csvText = `Hub,PIC Email,PIC Name,Role,Active
80TVH01,user1@spx.vn,Nguyễn Văn A,user,true
80TVH02,user2@spx.vn,Trần Thị B,user,true
80TVH03,user3@spx.vn,Lê Văn C,admin,true`;

var result = bulkImportHubsAndPICsFromCSV({ csvText: csvText });

// Result:
// {
//   status: "ok",
//   message: "Bulk import completed",
//   total: 3,
//   added: 3,
//   updated: 0,
//   errors: []
// }
```

---

## 🚀 Cách Sử Dụng

### **Cách 1: Sử dụng trong Google Apps Script Editor**

1. **Mở Apps Script Editor**
2. **Chạy function test:**

```javascript
function testBulkImport() {
  var result = bulkImportHubsAndPICs({
    hubsAndPics: [
      {
        hub: "80TVH01",
        picEmail: "user1@spx.vn",
        picName: "Nguyễn Văn A",
        role: "user",
        active: true
      },
      {
        hub: "80TVH02",
        picEmail: "user2@spx.vn",
        picName: "Trần Thị B",
        role: "user",
        active: true
      }
    ]
  });
  
  Logger.log(JSON.stringify(result, null, 2));
}
```

3. **Hoặc import từ CSV:**

```javascript
function testBulkImportFromCSV() {
  var csvText = `Hub,PIC Email,PIC Name,Role,Active
80TVH01,user1@spx.vn,Nguyễn Văn A,user,true
80TVH02,user2@spx.vn,Trần Thị B,user,true
80TVH03,user3@spx.vn,Lê Văn C,admin,true`;
  
  var result = bulkImportHubsAndPICsFromCSV({ csvText: csvText });
  Logger.log(JSON.stringify(result, null, 2));
}
```

---

### **Cách 2: Chuẩn bị file CSV từ Google Sheets**

1. **Tạo Google Sheet với format:**

| Hub | PIC Email | PIC Name | Role | Active |
|-----|-----------|----------|------|--------|
| 80TVH01 | user1@spx.vn | Nguyễn Văn A | user | true |
| 80TVH02 | user2@spx.vn | Trần Thị B | user | true |
| 80TVH03 | user3@spx.vn | Lê Văn C | admin | true |

2. **Export as CSV** hoặc **Copy to clipboard**

3. **Paste vào function:**

```javascript
function importFromSheets() {
  // Paste CSV text here
  var csvText = `Hub,PIC Email,PIC Name,Role,Active
80TVH01,user1@spx.vn,Nguyễn Văn A,user,true
80TVH02,user2@spx.vn,Trần Thị B,user,true
80TVH03,user3@spx.vn,Lê Văn C,admin,true`;
  
  var result = bulkImportHubsAndPICsFromCSV({ csvText: csvText });
  Logger.log(JSON.stringify(result, null, 2));
}
```

---

## 📝 Lưu Ý Quan Trọng

### **1. Merge Hub Logic:**
- Nếu **user đã tồn tại**, Hub mới sẽ được **merge** vào danh sách Hub hiện tại
- User có thể có **nhiều Hub** (separated by comma): `80TVH01,80TVH02,80TVH03`
- Nếu Hub đã được assign, chỉ update các fields khác (name, role, active)

### **2. Validation:**
- **Hub** và **picEmail** là **required**
- **Email format** được validate (phải có `@`)
- **Role** chỉ accept: `user` hoặc `admin` (default: `user`)
- **Active** chỉ accept: `true` hoặc `false` (default: `true`)

### **3. Error Handling:**
- Nếu một item có lỗi, các item khác vẫn được xử lý
- Tất cả errors được collect và return trong `errors` array
- Check `errors` array để biết items nào failed

### **4. Performance:**
- Sử dụng **batch operations** để optimize performance
- Có thể import **hàng trăm Hub và PICs** cùng lúc
- Mỗi item được process independently (nếu 1 item fail, không ảnh hưởng items khác)

---

## ✅ Examples

### **Example 1: Import 10 Hubs và PICs**

```javascript
function import10Hubs() {
  var result = bulkImportHubsAndPICs({
    hubsAndPics: [
      { hub: "80TVH01", picEmail: "user1@spx.vn", picName: "User 1", role: "user", active: true },
      { hub: "80TVH02", picEmail: "user2@spx.vn", picName: "User 2", role: "user", active: true },
      { hub: "80TVH03", picEmail: "user3@spx.vn", picName: "User 3", role: "user", active: true },
      { hub: "80TVH04", picEmail: "user4@spx.vn", picName: "User 4", role: "user", active: true },
      { hub: "80TVH05", picEmail: "user5@spx.vn", picName: "User 5", role: "user", active: true },
      { hub: "80TVH06", picEmail: "user6@spx.vn", picName: "User 6", role: "user", active: true },
      { hub: "80TVH07", picEmail: "user7@spx.vn", picName: "User 7", role: "user", active: true },
      { hub: "80TVH08", picEmail: "user8@spx.vn", picName: "User 8", role: "user", active: true },
      { hub: "80TVH09", picEmail: "user9@spx.vn", picName: "User 9", role: "user", active: true },
      { hub: "80TVH10", picEmail: "user10@spx.vn", picName: "User 10", role: "user", active: true }
    ]
  });
  
  Logger.log("Total: " + result.total);
  Logger.log("Added: " + result.added);
  Logger.log("Updated: " + result.updated);
  Logger.log("Errors: " + result.errors.length);
}
```

### **Example 2: Import từ CSV với Header**

```javascript
function importFromCSV() {
  var csvText = `Hub,PIC Email,PIC Name,Role,Active
80TVH01,user1@spx.vn,Nguyễn Văn A,user,true
80TVH02,user2@spx.vn,Trần Thị B,user,true
80TVH03,user3@spx.vn,Lê Văn C,admin,true
80TVH04,user4@spx.vn,Phạm Thị D,user,true
80TVH05,user5@spx.vn,Hoàng Văn E,user,true`;
  
  var result = bulkImportHubsAndPICsFromCSV({ csvText: csvText });
  
  if (result.status === 'ok') {
    Logger.log("✅ Import thành công!");
    Logger.log("- Total: " + result.total);
    Logger.log("- Added: " + result.added);
    Logger.log("- Updated: " + result.updated);
    
    if (result.errors.length > 0) {
      Logger.log("- Errors: " + result.errors.length);
      result.errors.forEach(function(err) {
        Logger.log("  - Row " + (err.index + 1) + ": " + err.error);
      });
    }
  } else {
    Logger.log("❌ Import failed: " + result.message);
  }
}
```

### **Example 3: Handle Errors**

```javascript
function importWithErrorHandling() {
  var result = bulkImportHubsAndPICs({
    hubsAndPics: [
      { hub: "80TVH01", picEmail: "user1@spx.vn", picName: "User 1" },  // ✅ OK
      { hub: "80TVH02", picEmail: "invalid-email", picName: "User 2" }, // ❌ Invalid email
      { hub: "", picEmail: "user3@spx.vn", picName: "User 3" },        // ❌ Missing hub
      { hub: "80TVH04", picEmail: "user4@spx.vn", picName: "User 4" }  // ✅ OK
    ]
  });
  
  if (result.errors.length > 0) {
    Logger.log("⚠️ Có " + result.errors.length + " lỗi:");
    result.errors.forEach(function(err) {
      Logger.log("- Row " + (err.index + 1) + " (Hub: " + err.hub + ", Email: " + err.picEmail + "): " + err.error);
    });
  }
  
  Logger.log("✅ Đã import: " + result.added + " users mới, " + result.updated + " users updated");
}
```

---

## 🎯 Use Cases

### **Use Case 1: Setup mới nhiều Hub cùng lúc**

Khi cần setup nhiều Hub mới và assign PIC cho từng Hub:

```javascript
function setupNewHubs() {
  var newHubs = [
    { hub: "80TVH11", picEmail: "pic11@spx.vn", picName: "PIC Hub 11", role: "user", active: true },
    { hub: "80TVH12", picEmail: "pic12@spx.vn", picName: "PIC Hub 12", role: "user", active: true },
    { hub: "80TVH13", picEmail: "pic13@spx.vn", picName: "PIC Hub 13", role: "user", active: true }
  ];
  
  var result = bulkImportHubsAndPICs({ hubsAndPics: newHubs });
  return result;
}
```

### **Use Case 2: Thêm Hub mới cho users hiện có**

Nếu user đã tồn tại, Hub mới sẽ được merge vào:

```javascript
function addNewHubToExistingUsers() {
  // User user1@spx.vn đã có Hub: 80TVH01
  // Thêm Hub mới: 80TVH02
  var result = bulkImportHubsAndPICs({
    hubsAndPics: [
      { hub: "80TVH02", picEmail: "user1@spx.vn", picName: "User 1", role: "user", active: true }
    ]
  });
  
  // User user1@spx.vn bây giờ có: 80TVH01,80TVH02
}
```

### **Use Case 3: Import từ file Excel**

1. **Export Excel to CSV**
2. **Copy CSV content**
3. **Paste vào function:**

```javascript
function importFromExcel() {
  // Paste CSV content here
  var csvText = `...paste CSV here...`;
  
  var result = bulkImportHubsAndPICsFromCSV({ csvText: csvText });
  Logger.log(JSON.stringify(result, null, 2));
}
```

---

## 🔒 Security & Permissions

- ✅ **Admin only** - Chỉ admin mới có thể bulk import
- ✅ **Audit logging** - Tất cả bulk imports được log vào AuditLog
- ✅ **Validation** - Email và Hub format được validate
- ✅ **Error handling** - Errors được collect và report

---

## 📊 Response Format

### **Success Response:**

```json
{
  "status": "ok",
  "message": "Bulk import completed",
  "total": 10,
  "added": 8,
  "updated": 2,
  "errors": []
}
```

### **Error Response (with errors):**

```json
{
  "status": "ok",
  "message": "Bulk import completed",
  "total": 10,
  "added": 7,
  "updated": 1,
  "errors": [
    {
      "index": 3,
      "hub": "80TVH04",
      "picEmail": "invalid-email",
      "error": "Invalid email format"
    },
    {
      "index": 7,
      "hub": "",
      "picEmail": "user8@spx.vn",
      "error": "Missing required fields: hub and picEmail are required"
    }
  ]
}
```

### **Permission Denied:**

```json
{
  "status": "error",
  "message": "Permission denied"
}
```

---

## 🎉 Kết Luận

**Bulk Import Hubs và PICs** giúp:

- ✅ **Tiết kiệm thời gian** - Thêm nhiều Hub và PICs cùng lúc
- ✅ **Dễ sử dụng** - Support cả JSON và CSV format
- ✅ **An toàn** - Validation đầy đủ và error handling
- ✅ **Flexible** - Merge Hub cho users hiện có
- ✅ **Audit trail** - Tất cả imports được log

---

**SPX Express TVH** © 2025
