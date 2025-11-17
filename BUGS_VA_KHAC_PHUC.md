# 🐛 Bugs Phát Hiện & Phương Án Khắc Phục

## ✅ Đã Kiểm Tra

### 1. **Linter Errors**
- ✅ **Không có linter errors** - Code syntax đúng

### 2. **Logic Errors**
- ✅ **Index Sheet functions** - Logic đúng
- ✅ **Compression functions** - Logic đúng
- ⚠️ **saveTasks()** - Có bug nhỏ cần fix
- ⚠️ **warmCache()** - Có bug về permission check cần fix
- ⚠️ **presenceHeartbeat()** - Chưa optimize, cần optimize

---

## 🐛 Bugs Đã Phát Hiện

### **Bug 1: saveTasks() - Duplicate variable declaration**

**File:** `gas-files/Code.gs` (line 1636)

**Vấn đề:**
```javascript
// Line 1588: var parts = storageKey.split('_');
// Line 1589: var hub = parts.length >= 3 ? parts[1] : parts[0];

// Line 1636: var parts = storageKey.split('_'); // ❌ Duplicate declaration
// Line 1637: var hub = parts.length >= 3 ? parts[1] : parts[0]; // ❌ Duplicate declaration
```

**Tác động:**
- Không ảnh hưởng chức năng (vì đã khai báo ở trên)
- Gây confusion và không efficient
- Redundant code

**Phương án khắc phục:**
- Xóa duplicate declarations ở line 1636-1637
- Sử dụng lại `parts` và `hub` đã khai báo ở đầu function

---

### **Bug 2: saveTasks() - newRowIndex không chính xác sau batchAppendRows**

**File:** `gas-files/Code.gs` (line 1641-1647)

**Vấn đề:**
```javascript
// Append new row if not found (using optimized batch write)
if (!found) {
  batchAppendRows(sheet, [[storageKey, JSON.stringify(tasks), new Date(), email]]);
  newRowIndex = sheet.getLastRow(); // ⚠️ Có thể không chính xác nếu sheet bị modify đồng thời
  ...
}
```

**Tác động:**
- Trong trường hợp hiếm (concurrent modifications), `sheet.getLastRow()` có thể không chính xác
- Index có thể trỏ đến sai row

**Phương án khắc phục:**
- Sử dụng `findRowByKey()` sau khi append để tìm chính xác row number
- Hoặc tính toán row number từ `sheet.getLastRow()` trước khi append

---

### **Bug 3: warmCache() - loadTasks() requires permission check**

**File:** `gas-files/Code.gs` (line 1155)

**Vấn đề:**
```javascript
// Pre-load today's tasks for active hubs
hubList.forEach(function(hub) {
  try {
    var storageKey = 'tasks_' + hub + '_' + today;
    var tasks = loadTasks(storageKey); // ⚠️ loadTasks() checks permission
    ...
  }
});
```

**Tác động:**
- `loadTasks()` kiểm tra permission của user hiện tại
- Trong trigger context (time-based), có thể không có user session
- `loadTasks()` có thể trả về `null` hoặc `{error: ...}` do permission denied

**Phương án khắc phục:**
- Option 1: Bypass permission check trong `loadTasks()` khi được gọi từ `warmCache()`
- Option 2: Skip `loadTasks()` trong `warmCache()` và chỉ warm template/permissions
- Option 3: Warm cache bằng cách đọc trực tiếp từ sheet (không qua `loadTasks()`)

**Recommendation:** Option 2 hoặc Option 3 (đơn giản và an toàn hơn)

---

### **Bug 4: presenceHeartbeat() - Chưa optimize**

**File:** `gas-files/Code.gs` (line 2981, 3001)

**Vấn đề:**
```javascript
var data = sheet.getDataRange().getValues(); // ⚠️ Chưa optimize
...
sheet.appendRow([...]); // ⚠️ Chưa optimize
```

**Tác động:**
- Performance không tối ưu
- Không critical (presence không được gọi thường xuyên)

**Phương án khắc phục:**
- Replace `getDataRange()` với `getSheetDataOptimized()`
- Replace `appendRow()` với `batchAppendRows()` hoặc `findRowByKey()` + `setValues()`

---

### **Bug 5: Còn nhiều getDataRange() và appendRow() chưa optimize**

**Files:**
- `loadReport()` (line 2296)
- `exportToExcel()` (line 2488-2507)
- `exportAccessLog()` (line 2928-2937)
- `getPresence()` (line 2981)
- `presenceHeartbeat()` (line 2981, 3001)
- `loadNotes()` (line 3147)
- `saveNotes()` (line 3165)
- `getQAData()` (line 3251)
- `submitQuestion()` (line 3457)
- `getUnfinishedTasks()` (line 3739)
- `sendChatMessage()` (line 3814)
- `getChatMessages()` (line 3844)
- `saveNotes()` (line 3942, 3977)
- `setupSheets()` (nhiều `appendRow()`)

**Tác động:**
- Performance không tối ưu cho các functions này
- Không critical (các functions này không được gọi thường xuyên)

**Phương án khắc phục:**
- Optimize dần dần theo priority:
  1. **High priority**: `loadReport()`, `getUnfinishedTasks()` (được gọi thường xuyên)
  2. **Medium priority**: `presenceHeartbeat()`, `getPresence()`, `loadNotes()`, `saveNotes()`
  3. **Low priority**: `exportToExcel()`, `exportAccessLog()`, `setupSheets()` (chỉ gọi một lần)

---

## 🔧 Phương Án Khắc Phục

### **Fix 1: saveTasks() - Remove duplicate declarations**

**Change:**
```javascript
// BEFORE (line 1636-1639):
// Update index (row number stays the same)
var parts = storageKey.split('_');
var hub = parts.length >= 3 ? parts[1] : parts[0];
var date = parts.length >= 3 ? parts.slice(2).join('_') : '';
updateTaskIndex(storageKey, rowIndex, hub, date);

// AFTER:
// Update index (row number stays the same)
// Reuse parts and hub from line 1588-1589
var date = parts.length >= 3 ? parts.slice(2).join('_') : '';
updateTaskIndex(storageKey, rowIndex, hub, date);
```

---

### **Fix 2: saveTasks() - Fix newRowIndex calculation**

**Change:**
```javascript
// BEFORE (line 1641-1647):
if (!found) {
  batchAppendRows(sheet, [[storageKey, JSON.stringify(tasks), new Date(), email]]);
  newRowIndex = sheet.getLastRow(); // ⚠️

// AFTER:
if (!found) {
  // Get row number before append (more accurate)
  newRowIndex = sheet.getLastRow() + 1;
  batchAppendRows(sheet, [[storageKey, JSON.stringify(tasks), new Date(), email]]);
  // Verify row number (optional, for safety)
  // newRowIndex = sheet.getLastRow(); // Fallback check
```

---

### **Fix 3: warmCache() - Skip loadTasks() hoặc bypass permission**

**Option A: Skip loadTasks() (Recommended)**
```javascript
// BEFORE (line 1150-1162):
// Pre-load today's tasks for active hubs
var today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
hubList.forEach(function(hub) {
  try {
    var storageKey = 'tasks_' + hub + '_' + today;
    var tasks = loadTasks(storageKey); // ⚠️
    ...
  }
});

// AFTER:
// Skip loadTasks() - it requires permission check
// Tasks will be loaded on-demand when users access
// Only warm templates and permissions
// Pre-load today's tasks for active hubs - SKIPPED (requires permission)
// Tasks will be loaded on-demand when users access
Logger.log('Skipping task warming (requires user permission)');
```

**Option B: Direct sheet read (Advanced)**
```javascript
// Pre-load today's tasks for active hubs (direct sheet read)
var today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
var dataSheet = ss.getSheetByName(SHEET_NAMES.DATA);
if (dataSheet) {
  hubList.forEach(function(hub) {
    try {
      var storageKey = 'tasks_' + hub + '_' + today;
      // Direct read from sheet (bypass permission check for warming)
      var rowIndex = findTaskRowByIndex(storageKey);
      if (rowIndex > 0) {
        var row = dataSheet.getRange(rowIndex, 1, 1, 4).getValues()[0];
        var taskData = JSON.parse(row[1] || '[]');
        if (Array.isArray(taskData) && taskData.length > 0) {
          // Cache directly
          var cacheKey = 'tasks_' + storageKey;
          dataCache.set(cacheKey, taskData, CACHE_TTL.TASKS);
          warmed++;
        }
      }
    } catch (e) {
      Logger.log('Failed to warm tasks for hub ' + hub + ': ' + e.toString());
    }
  });
}
```

**Recommendation:** Option A (đơn giản và an toàn hơn)

---

### **Fix 4: presenceHeartbeat() - Optimize**

**Change:**
```javascript
// BEFORE:
var data = sheet.getDataRange().getValues();
var found = false;

for (var i = 1; i < data.length; i++) {
  if (String(data[i][0]).toLowerCase() === email.toLowerCase()) {
    sheet.getRange(i + 1, 1, 1, 5).setValues([[...]]);
    found = true;
    break;
  }
}

if (!found) {
  sheet.appendRow([...]);
}

// AFTER:
// OPTIMIZATION PHASE 1 MAX: Use optimized read
var data = getSheetDataOptimized(sheet, 1, null, 1); // Only read email column for search
var found = false;
var foundRow = -1;

for (var i = 1; i < data.length; i++) {
  if (String(data[i][0]).toLowerCase() === email.toLowerCase()) {
    foundRow = i + 1;
    found = true;
    break;
  }
}

if (found && foundRow > 0) {
  // Update existing row
  sheet.getRange(foundRow, 1, 1, 5).setValues([[
    email,
    args.hub,
    new Date(),
    args.tab || '',
    JSON.stringify(args.meta || {})
  ]]);
} else {
  // Add new row using batch append
  batchAppendRows(sheet, [[
    email,
    args.hub,
    new Date(),
    args.tab || '',
    JSON.stringify(args.meta || {})
  ]]);
}
```

---

## 📋 Priority Fix List

### **High Priority (Fix ngay):**
1. ✅ Fix Bug 1: saveTasks() duplicate declarations
2. ✅ Fix Bug 2: saveTasks() newRowIndex calculation
3. ✅ Fix Bug 3: warmCache() permission check

### **Medium Priority (Fix sau):**
4. Fix Bug 4: presenceHeartbeat() optimize
5. Optimize `loadReport()` - getDataRange()
6. Optimize `getUnfinishedTasks()` - getDataRange()

### **Low Priority (Fix sau nữa):**
7. Optimize export functions (`exportToExcel()`, `exportAccessLog()`)
8. Optimize setup functions (`setupSheets()`)
9. Optimize other remaining `getDataRange()` and `appendRow()` calls

---

## ✅ Testing Checklist

Sau khi fix bugs, cần test:

### Bug 1 & 2 (saveTasks):
- [ ] Test saveTasks() với existing row - index updated correctly
- [ ] Test saveTasks() với new row - index created correctly
- [ ] Test saveTasks() với concurrent modifications - row number accurate

### Bug 3 (warmCache):
- [ ] Test warmCache() - không error khi không có user session
- [ ] Test warmCache() - templates warmed correctly
- [ ] Test warmCache() - permissions warmed correctly
- [ ] Test warmCache() - tasks skipped hoặc warmed correctly

### Bug 4 (presenceHeartbeat):
- [ ] Test presenceHeartbeat() với existing user - updated correctly
- [ ] Test presenceHeartbeat() với new user - appended correctly
- [ ] Test performance improvement

---

## 🎯 Kết Luận

**Bugs Critical:** 0
**Bugs Medium:** 3
**Bugs Low:** 1

**Tất cả bugs đều có phương án khắc phục rõ ràng.**

**Recommendation:** Fix 3 bugs high priority trước, sau đó test và fix các bugs còn lại.

---

**SPX Express TVH** © 2025

## ✅ Đã Kiểm Tra

### 1. **Linter Errors**
- ✅ **Không có linter errors** - Code syntax đúng

### 2. **Logic Errors**
- ✅ **Index Sheet functions** - Logic đúng
- ✅ **Compression functions** - Logic đúng
- ⚠️ **saveTasks()** - Có bug nhỏ cần fix
- ⚠️ **warmCache()** - Có bug về permission check cần fix
- ⚠️ **presenceHeartbeat()** - Chưa optimize, cần optimize

---

## 🐛 Bugs Đã Phát Hiện

### **Bug 1: saveTasks() - Duplicate variable declaration**

**File:** `gas-files/Code.gs` (line 1636)

**Vấn đề:**
```javascript
// Line 1588: var parts = storageKey.split('_');
// Line 1589: var hub = parts.length >= 3 ? parts[1] : parts[0];

// Line 1636: var parts = storageKey.split('_'); // ❌ Duplicate declaration
// Line 1637: var hub = parts.length >= 3 ? parts[1] : parts[0]; // ❌ Duplicate declaration
```

**Tác động:**
- Không ảnh hưởng chức năng (vì đã khai báo ở trên)
- Gây confusion và không efficient
- Redundant code

**Phương án khắc phục:**
- Xóa duplicate declarations ở line 1636-1637
- Sử dụng lại `parts` và `hub` đã khai báo ở đầu function

---

### **Bug 2: saveTasks() - newRowIndex không chính xác sau batchAppendRows**

**File:** `gas-files/Code.gs` (line 1641-1647)

**Vấn đề:**
```javascript
// Append new row if not found (using optimized batch write)
if (!found) {
  batchAppendRows(sheet, [[storageKey, JSON.stringify(tasks), new Date(), email]]);
  newRowIndex = sheet.getLastRow(); // ⚠️ Có thể không chính xác nếu sheet bị modify đồng thời
  ...
}
```

**Tác động:**
- Trong trường hợp hiếm (concurrent modifications), `sheet.getLastRow()` có thể không chính xác
- Index có thể trỏ đến sai row

**Phương án khắc phục:**
- Sử dụng `findRowByKey()` sau khi append để tìm chính xác row number
- Hoặc tính toán row number từ `sheet.getLastRow()` trước khi append

---

### **Bug 3: warmCache() - loadTasks() requires permission check**

**File:** `gas-files/Code.gs` (line 1155)

**Vấn đề:**
```javascript
// Pre-load today's tasks for active hubs
hubList.forEach(function(hub) {
  try {
    var storageKey = 'tasks_' + hub + '_' + today;
    var tasks = loadTasks(storageKey); // ⚠️ loadTasks() checks permission
    ...
  }
});
```

**Tác động:**
- `loadTasks()` kiểm tra permission của user hiện tại
- Trong trigger context (time-based), có thể không có user session
- `loadTasks()` có thể trả về `null` hoặc `{error: ...}` do permission denied

**Phương án khắc phục:**
- Option 1: Bypass permission check trong `loadTasks()` khi được gọi từ `warmCache()`
- Option 2: Skip `loadTasks()` trong `warmCache()` và chỉ warm template/permissions
- Option 3: Warm cache bằng cách đọc trực tiếp từ sheet (không qua `loadTasks()`)

**Recommendation:** Option 2 hoặc Option 3 (đơn giản và an toàn hơn)

---

### **Bug 4: presenceHeartbeat() - Chưa optimize**

**File:** `gas-files/Code.gs` (line 2981, 3001)

**Vấn đề:**
```javascript
var data = sheet.getDataRange().getValues(); // ⚠️ Chưa optimize
...
sheet.appendRow([...]); // ⚠️ Chưa optimize
```

**Tác động:**
- Performance không tối ưu
- Không critical (presence không được gọi thường xuyên)

**Phương án khắc phục:**
- Replace `getDataRange()` với `getSheetDataOptimized()`
- Replace `appendRow()` với `batchAppendRows()` hoặc `findRowByKey()` + `setValues()`

---

### **Bug 5: Còn nhiều getDataRange() và appendRow() chưa optimize**

**Files:**
- `loadReport()` (line 2296)
- `exportToExcel()` (line 2488-2507)
- `exportAccessLog()` (line 2928-2937)
- `getPresence()` (line 2981)
- `presenceHeartbeat()` (line 2981, 3001)
- `loadNotes()` (line 3147)
- `saveNotes()` (line 3165)
- `getQAData()` (line 3251)
- `submitQuestion()` (line 3457)
- `getUnfinishedTasks()` (line 3739)
- `sendChatMessage()` (line 3814)
- `getChatMessages()` (line 3844)
- `saveNotes()` (line 3942, 3977)
- `setupSheets()` (nhiều `appendRow()`)

**Tác động:**
- Performance không tối ưu cho các functions này
- Không critical (các functions này không được gọi thường xuyên)

**Phương án khắc phục:**
- Optimize dần dần theo priority:
  1. **High priority**: `loadReport()`, `getUnfinishedTasks()` (được gọi thường xuyên)
  2. **Medium priority**: `presenceHeartbeat()`, `getPresence()`, `loadNotes()`, `saveNotes()`
  3. **Low priority**: `exportToExcel()`, `exportAccessLog()`, `setupSheets()` (chỉ gọi một lần)

---

## 🔧 Phương Án Khắc Phục

### **Fix 1: saveTasks() - Remove duplicate declarations**

**Change:**
```javascript
// BEFORE (line 1636-1639):
// Update index (row number stays the same)
var parts = storageKey.split('_');
var hub = parts.length >= 3 ? parts[1] : parts[0];
var date = parts.length >= 3 ? parts.slice(2).join('_') : '';
updateTaskIndex(storageKey, rowIndex, hub, date);

// AFTER:
// Update index (row number stays the same)
// Reuse parts and hub from line 1588-1589
var date = parts.length >= 3 ? parts.slice(2).join('_') : '';
updateTaskIndex(storageKey, rowIndex, hub, date);
```

---

### **Fix 2: saveTasks() - Fix newRowIndex calculation**

**Change:**
```javascript
// BEFORE (line 1641-1647):
if (!found) {
  batchAppendRows(sheet, [[storageKey, JSON.stringify(tasks), new Date(), email]]);
  newRowIndex = sheet.getLastRow(); // ⚠️

// AFTER:
if (!found) {
  // Get row number before append (more accurate)
  newRowIndex = sheet.getLastRow() + 1;
  batchAppendRows(sheet, [[storageKey, JSON.stringify(tasks), new Date(), email]]);
  // Verify row number (optional, for safety)
  // newRowIndex = sheet.getLastRow(); // Fallback check
```

---

### **Fix 3: warmCache() - Skip loadTasks() hoặc bypass permission**

**Option A: Skip loadTasks() (Recommended)**
```javascript
// BEFORE (line 1150-1162):
// Pre-load today's tasks for active hubs
var today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
hubList.forEach(function(hub) {
  try {
    var storageKey = 'tasks_' + hub + '_' + today;
    var tasks = loadTasks(storageKey); // ⚠️
    ...
  }
});

// AFTER:
// Skip loadTasks() - it requires permission check
// Tasks will be loaded on-demand when users access
// Only warm templates and permissions
// Pre-load today's tasks for active hubs - SKIPPED (requires permission)
// Tasks will be loaded on-demand when users access
Logger.log('Skipping task warming (requires user permission)');
```

**Option B: Direct sheet read (Advanced)**
```javascript
// Pre-load today's tasks for active hubs (direct sheet read)
var today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
var dataSheet = ss.getSheetByName(SHEET_NAMES.DATA);
if (dataSheet) {
  hubList.forEach(function(hub) {
    try {
      var storageKey = 'tasks_' + hub + '_' + today;
      // Direct read from sheet (bypass permission check for warming)
      var rowIndex = findTaskRowByIndex(storageKey);
      if (rowIndex > 0) {
        var row = dataSheet.getRange(rowIndex, 1, 1, 4).getValues()[0];
        var taskData = JSON.parse(row[1] || '[]');
        if (Array.isArray(taskData) && taskData.length > 0) {
          // Cache directly
          var cacheKey = 'tasks_' + storageKey;
          dataCache.set(cacheKey, taskData, CACHE_TTL.TASKS);
          warmed++;
        }
      }
    } catch (e) {
      Logger.log('Failed to warm tasks for hub ' + hub + ': ' + e.toString());
    }
  });
}
```

**Recommendation:** Option A (đơn giản và an toàn hơn)

---

### **Fix 4: presenceHeartbeat() - Optimize**

**Change:**
```javascript
// BEFORE:
var data = sheet.getDataRange().getValues();
var found = false;

for (var i = 1; i < data.length; i++) {
  if (String(data[i][0]).toLowerCase() === email.toLowerCase()) {
    sheet.getRange(i + 1, 1, 1, 5).setValues([[...]]);
    found = true;
    break;
  }
}

if (!found) {
  sheet.appendRow([...]);
}

// AFTER:
// OPTIMIZATION PHASE 1 MAX: Use optimized read
var data = getSheetDataOptimized(sheet, 1, null, 1); // Only read email column for search
var found = false;
var foundRow = -1;

for (var i = 1; i < data.length; i++) {
  if (String(data[i][0]).toLowerCase() === email.toLowerCase()) {
    foundRow = i + 1;
    found = true;
    break;
  }
}

if (found && foundRow > 0) {
  // Update existing row
  sheet.getRange(foundRow, 1, 1, 5).setValues([[
    email,
    args.hub,
    new Date(),
    args.tab || '',
    JSON.stringify(args.meta || {})
  ]]);
} else {
  // Add new row using batch append
  batchAppendRows(sheet, [[
    email,
    args.hub,
    new Date(),
    args.tab || '',
    JSON.stringify(args.meta || {})
  ]]);
}
```

---

## 📋 Priority Fix List

### **High Priority (Fix ngay):**
1. ✅ Fix Bug 1: saveTasks() duplicate declarations
2. ✅ Fix Bug 2: saveTasks() newRowIndex calculation
3. ✅ Fix Bug 3: warmCache() permission check

### **Medium Priority (Fix sau):**
4. Fix Bug 4: presenceHeartbeat() optimize
5. Optimize `loadReport()` - getDataRange()
6. Optimize `getUnfinishedTasks()` - getDataRange()

### **Low Priority (Fix sau nữa):**
7. Optimize export functions (`exportToExcel()`, `exportAccessLog()`)
8. Optimize setup functions (`setupSheets()`)
9. Optimize other remaining `getDataRange()` and `appendRow()` calls

---

## ✅ Testing Checklist

Sau khi fix bugs, cần test:

### Bug 1 & 2 (saveTasks):
- [ ] Test saveTasks() với existing row - index updated correctly
- [ ] Test saveTasks() với new row - index created correctly
- [ ] Test saveTasks() với concurrent modifications - row number accurate

### Bug 3 (warmCache):
- [ ] Test warmCache() - không error khi không có user session
- [ ] Test warmCache() - templates warmed correctly
- [ ] Test warmCache() - permissions warmed correctly
- [ ] Test warmCache() - tasks skipped hoặc warmed correctly

### Bug 4 (presenceHeartbeat):
- [ ] Test presenceHeartbeat() với existing user - updated correctly
- [ ] Test presenceHeartbeat() với new user - appended correctly
- [ ] Test performance improvement

---

## 🎯 Kết Luận

**Bugs Critical:** 0
**Bugs Medium:** 3
**Bugs Low:** 1

**Tất cả bugs đều có phương án khắc phục rõ ràng.**

**Recommendation:** Fix 3 bugs high priority trước, sau đó test và fix các bugs còn lại.

---

**SPX Express TVH** © 2025
