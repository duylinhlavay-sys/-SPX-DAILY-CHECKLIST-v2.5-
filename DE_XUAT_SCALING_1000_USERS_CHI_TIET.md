# 🚀 Đề Xuất Scaling Chi Tiết - 1000 Users

## 📊 Phân Tích Hiện Trạng

### Vấn Đề Hiện Tại (Dựa trên Code Analysis)

1. **Performance Bottlenecks:**
   - ❌ 112 lần gọi `getDataRange()` - đọc toàn bộ sheet mỗi lần
   - ❌ Cache chỉ in-memory (reset khi script restart)
   - ❌ Rate limiting chỉ in-memory (không persistent)
   - ❌ Không có batch operations thực sự
   - ❌ Mỗi request phải mở lại Spreadsheet connection

2. **Google Apps Script Limitations:**
   - ⚠️ Execution time: 6 phút max
   - ⚠️ Quota: 20,000 requests/day (free) hoặc 100,000/day (paid)
   - ⚠️ Concurrent users: ~50-100 users đồng thời
   - ⚠️ Google Sheets: Chậm với >10,000 rows

3. **Với 1000 Users:**
   - Mỗi user ~10 requests/ngày = 10,000 requests/ngày
   - Peak hours: ~100-200 concurrent users
   - **→ Vượt quá khả năng của GAS**

---

## 🎯 GIẢI PHÁP 3 GIAI ĐOẠN

### **GIAI ĐOẠN 1: Tối Ưu Trong GAS (1-2 tháng) - IMMEDIATE** ⚡

**Mục tiêu:** Tăng capacity lên 200-300 users với chi phí tối thiểu

#### 1.1. Persistent Cache với PropertiesService

**Vấn đề:** Cache hiện tại reset khi script restart

**Giải pháp:**
```javascript
// Thay thế dataCache bằng PropertiesService
var PropertiesCache = {
  get: function(key) {
    var props = PropertiesService.getScriptProperties();
    var cached = props.getProperty('cache_' + key);
    if (!cached) return null;
    
    var entry = JSON.parse(cached);
    if (Date.now() > entry.expires) {
      props.deleteProperty('cache_' + key);
      return null;
    }
    return entry.data;
  },
  
  set: function(key, data, ttl) {
    var props = PropertiesService.getScriptProperties();
    var entry = {
      data: data,
      expires: Date.now() + ttl
    };
    props.setProperty('cache_' + key, JSON.stringify(entry));
  }
};
```

**Lợi ích:**
- ✅ Cache persistent qua script restarts
- ✅ Giảm 50-70% Sheet reads
- ✅ Chi phí: $0 (trong quota)

#### 1.2. Range-Based Reads Thay Vì getDataRange()

**Vấn đề:** `getDataRange()` đọc toàn bộ sheet

**Giải pháp:**
```javascript
// Thay vì:
var data = sheet.getDataRange().getValues();

// Dùng:
var lastRow = sheet.getLastRow();
if (lastRow > 1) {
  var data = sheet.getRange(2, 1, lastRow - 1, 8).getValues();
}
```

**Lợi ích:**
- ✅ Giảm 30-50% thời gian đọc
- ✅ Chỉ đọc columns cần thiết

#### 1.3. Batch Writes

**Vấn đề:** Mỗi `appendRow()` là một API call

**Giải pháp:**
```javascript
// Thay vì:
sheet.appendRow([...]);
sheet.appendRow([...]);

// Dùng:
var rows = [[...], [...]];
sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, rows[0].length)
     .setValues(rows);
```

**Lợi ích:**
- ✅ Giảm 80% write operations
- ✅ Nhanh hơn 5-10 lần

#### 1.4. Index Sheet cho Fast Lookups

**Tạo sheet mới: `TaskIndex`**
```
StorageKey | RowNumber | Hub | Date
tasks_80TVH01_2025-01-15 | 2 | 80TVH01 | 2025-01-15
```

**Lợi ích:**
- ✅ Tìm task nhanh hơn 10x (không cần scan toàn bộ)
- ✅ Dễ dàng query theo hub/date

#### 1.5. Optimize Rate Limiting với PropertiesService

**Vấn đề:** Rate limit reset khi script restart

**Giải pháp:**
```javascript
// Store rate limits trong PropertiesService
// Cleanup tự động mỗi giờ
```

**Chi phí Giai đoạn 1:**
- Development: 2-3 tuần
- Testing: 1 tuần
- **Total: ~$0 (vẫn dùng GAS free tier)**

**Kết quả:**
- ✅ Tăng capacity: 200-300 users
- ✅ Response time: Giảm 40-60%
- ✅ Sheet reads: Giảm 50-70%

---

### **GIAI ĐOẠN 2: Hybrid Architecture (3-6 tháng) - RECOMMENDED** ⭐

**Mục tiêu:** Scale lên 500-1000 users với performance tốt

#### 2.1. Architecture

```
┌─────────────────────────────────────────┐
│         Google Cloud Platform            │
│                                          │
│  ┌──────────────┐  ┌──────────────┐   │
│  │  Cloud SQL   │  │  Cloud Run    │   │
│  │ (PostgreSQL) │  │  (Backend)    │   │
│  └──────┬───────┘  └──────┬───────┘   │
│         │                  │            │
│         └──────────┬───────┘            │
│                    │                    │
│         ┌──────────▼──────────┐         │
│         │   Google Sheets     │         │
│         │   (Sync/Backup)    │         │
│         └────────────────────┘         │
└─────────────────────────────────────────┘
```

#### 2.2. Tech Stack

**Backend:**
- **Node.js + Express** hoặc **Python + FastAPI**
- Deploy trên **Cloud Run** (auto-scaling)
- **Cloud SQL (PostgreSQL)** cho database
- **Redis (Cloud Memorystore)** cho cache

**Frontend:**
- Giữ nguyên HTML/CSS/JS hiện tại
- Hoặc migrate sang **React/Vue** (optional)

**Sync:**
- **Cloud Functions** sync Sheets → Cloud SQL (mỗi 5 phút)
- Hoặc real-time sync với Apps Script triggers

#### 2.3. Migration Strategy

**Phase 2.1: Setup Infrastructure (Week 1-2)**
- [ ] Setup Cloud SQL instance
- [ ] Setup Cloud Run service
- [ ] Setup Redis cache
- [ ] Design database schema

**Phase 2.2: Data Migration (Week 3-4)**
- [ ] Export data từ Google Sheets
- [ ] Transform và import vào Cloud SQL
- [ ] Setup sync mechanism (Sheets → SQL)
- [ ] Verify data integrity

**Phase 2.3: API Development (Week 5-8)**
- [ ] Convert GAS functions → REST API
- [ ] Implement authentication (Google OAuth)
- [ ] Add rate limiting
- [ ] Add caching layer
- [ ] Add monitoring & logging

**Phase 2.4: Frontend Integration (Week 9-10)**
- [ ] Update API endpoints trong frontend
- [ ] Test tất cả features
- [ ] Performance testing

**Phase 2.5: Deployment (Week 11-12)**
- [ ] Deploy to staging
- [ ] Load testing (1000 users)
- [ ] Production deployment
- [ ] Monitor & optimize

#### 2.4. Database Schema

```sql
-- Users table
CREATE TABLE users (
  email VARCHAR(255) PRIMARY KEY,
  hub VARCHAR(50),
  role VARCHAR(20),
  active BOOLEAN,
  display_name VARCHAR(255),
  photo_url TEXT,
  last_access TIMESTAMP,
  created_at TIMESTAMP
);

-- Tasks table
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  storage_key VARCHAR(255) NOT NULL,
  hub VARCHAR(50) NOT NULL,
  date DATE NOT NULL,
  task_data JSONB NOT NULL,
  last_modified TIMESTAMP,
  modified_by VARCHAR(255),
  INDEX idx_storage_key (storage_key),
  INDEX idx_hub_date (hub, date)
);

-- Audit log table
CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  timestamp TIMESTAMP,
  email VARCHAR(255),
  action VARCHAR(100),
  hub VARCHAR(50),
  details JSONB,
  session_info JSONB,
  INDEX idx_timestamp (timestamp),
  INDEX idx_email (email)
);
```

#### 2.5. API Endpoints

```javascript
// Authentication
POST /api/auth/whoami
GET  /api/auth/permissions

// Tasks
GET  /api/tasks?hub={hub}&date={date}
POST /api/tasks
PUT  /api/tasks/{id}

// Reports
GET  /api/reports?hub={hub}&start={start}&end={end}

// Users (Admin)
GET  /api/users
POST /api/users
PUT  /api/users/{email}
DELETE /api/users/{email}
```

#### 2.6. Caching Strategy

```javascript
// Multi-layer cache
1. Browser Cache (LocalStorage) - 5 phút
2. CDN Cache (Cloud CDN) - 10 phút
3. Redis Cache - 5 phút
   - User permissions: user:perms:{email}
   - Tasks: tasks:{hub}:{date}
   - Reports: report:{hub}:{start}:{end}
4. Database - Source of truth
```

**Chi phí Giai đoạn 2:**
- Cloud Run: ~$50-100/month
- Cloud SQL (db-small): ~$100-150/month
- Redis: ~$30-50/month
- **Total: ~$180-300/month**

**Kết quả:**
- ✅ Capacity: 500-1000 users
- ✅ Response time: <500ms (p95)
- ✅ Availability: 99.9%
- ✅ Real-time sync với Sheets (optional)

---

### **GIAI ĐOẠN 3: Full Migration (6-12 tháng) - LONG TERM** 🚀

**Mục tiêu:** Enterprise-grade, 1000+ users, real-time features

#### 3.1. Full Firebase Migration (Recommended)

**Lý do:**
- ✅ Real-time updates tự động
- ✅ Offline support
- ✅ Auto-scaling
- ✅ Cost-effective (~$100-200/month)

**Architecture:**
```
Firebase Firestore (Database)
    ↓
Firebase Functions (Backend)
    ↓
Firebase Hosting (Frontend)
    ↓
Firebase Auth (Authentication)
```

#### 3.2. Hoặc Full GCP Native

**Nếu cần:**
- More control
- Custom solutions
- Enterprise features

**Chi phí: ~$300-500/month**

---

## 📋 ROADMAP THỰC TẾ

### **Tháng 1-2: Giai Đoạn 1 (Tối Ưu GAS)**

**Week 1-2:**
- [ ] Implement PropertiesService cache
- [ ] Convert getDataRange() → range-based reads
- [ ] Implement batch writes

**Week 3-4:**
- [ ] Create TaskIndex sheet
- [ ] Optimize rate limiting
- [ ] Testing & deployment

**Kết quả:** 200-300 users capacity

---

### **Tháng 3-6: Giai Đoạn 2 (Hybrid)**

**Month 3:**
- [ ] Setup Cloud SQL & Cloud Run
- [ ] Design database schema
- [ ] Data migration scripts

**Month 4:**
- [ ] API development
- [ ] Authentication setup
- [ ] Caching layer

**Month 5:**
- [ ] Frontend integration
- [ ] Testing
- [ ] Staging deployment

**Month 6:**
- [ ] Load testing
- [ ] Production deployment
- [ ] Monitoring setup

**Kết quả:** 500-1000 users capacity

---

### **Tháng 7-12: Giai Đoạn 3 (Full Migration)**

**Nếu cần scale hơn nữa:**
- [ ] Full Firebase migration
- [ ] Real-time features
- [ ] Advanced analytics

---

## 💰 COST COMPARISON

| Giai Đoạn | Chi Phí/Tháng | Capacity | Response Time |
|-----------|---------------|----------|---------------|
| **Hiện tại** | $0-20 | 50-100 users | 2-5s |
| **Giai đoạn 1** | $0 | 200-300 users | 1-2s |
| **Giai đoạn 2** | $180-300 | 500-1000 users | <500ms |
| **Giai đoạn 3** | $100-500 | 1000+ users | <300ms |

---

## 🎯 RECOMMENDATION

### **Immediate (Ngay bây giờ):**

1. ✅ **Implement Giai đoạn 1** (1-2 tháng)
   - Tối ưu trong GAS
   - Chi phí: $0
   - Tăng capacity: 200-300 users

2. ✅ **Monitor usage**
   - Track số users thực tế
   - Track response times
   - Identify bottlenecks

### **Short-term (3-6 tháng):**

3. ✅ **Plan Giai đoạn 2** (nếu cần >300 users)
   - Hybrid architecture
   - Chi phí: $180-300/month
   - Capacity: 500-1000 users

### **Long-term (6-12 tháng):**

4. ✅ **Consider Giai đoạn 3** (nếu cần >1000 users)
   - Full migration
   - Real-time features
   - Enterprise-grade

---

## 🔧 TECHNICAL DETAILS

### 1. PropertiesService Cache Implementation

```javascript
// File: Code.gs
var PersistentCache = {
  get: function(key) {
    try {
      var props = PropertiesService.getScriptProperties();
      var cached = props.getProperty('cache_' + key);
      if (!cached) return null;
      
      var entry = JSON.parse(cached);
      var now = Date.now();
      
      if (now > entry.expires) {
        props.deleteProperty('cache_' + key);
        return null;
      }
      
      return entry.data;
    } catch (e) {
      Logger.log('Cache get error: ' + e.toString());
      return null;
    }
  },
  
  set: function(key, data, ttl) {
    try {
      var props = PropertiesService.getScriptProperties();
      var entry = {
        data: data,
        expires: Date.now() + (ttl || 300000) // Default 5 min
      };
      
      // PropertiesService limit: 9KB per property
      var json = JSON.stringify(entry);
      if (json.length > 8000) {
        Logger.log('Cache entry too large, skipping');
        return false;
      }
      
      props.setProperty('cache_' + key, json);
      return true;
    } catch (e) {
      Logger.log('Cache set error: ' + e.toString());
      return false;
    }
  },
  
  clear: function(pattern) {
    try {
      var props = PropertiesService.getScriptProperties();
      var allProps = props.getProperties();
      
      for (var key in allProps) {
        if (key.indexOf('cache_') === 0) {
          if (!pattern || key.indexOf(pattern) !== -1) {
            props.deleteProperty(key);
          }
        }
      }
    } catch (e) {
      Logger.log('Cache clear error: ' + e.toString());
    }
  }
};
```

### 2. Range-Based Read Optimization

```javascript
// Thay thế tất cả getDataRange() bằng:
function getSheetDataOptimized(sheet, startRow, numRows, numCols) {
  if (!sheet) return [];
  
  var lastRow = sheet.getLastRow();
  if (lastRow < startRow) return [];
  
  var actualRows = Math.min(numRows || (lastRow - startRow + 1), lastRow - startRow + 1);
  var actualCols = numCols || sheet.getLastColumn();
  
  if (actualRows <= 0 || actualCols <= 0) return [];
  
  return sheet.getRange(startRow, 1, actualRows, actualCols).getValues();
}
```

### 3. Batch Write Optimization

```javascript
// Thay thế multiple appendRow() bằng:
function batchAppendRows(sheet, rows) {
  if (!sheet || !rows || rows.length === 0) return;
  
  var startRow = sheet.getLastRow() + 1;
  var numCols = rows[0].length;
  
  sheet.getRange(startRow, 1, rows.length, numCols).setValues(rows);
}
```

---

## 📊 PERFORMANCE TARGETS

### Giai Đoạn 1 (Tối Ưu GAS):
- Load Tasks: 1-2s → <1s
- Save Tasks: 1-3s → <500ms
- Load Report: 5-10s → 2-3s
- Capacity: 50-100 → 200-300 users

### Giai Đoạn 2 (Hybrid):
- Load Tasks: <500ms (p95)
- Save Tasks: <300ms (p95)
- Load Report: <1s (p95)
- Capacity: 500-1000 users
- Availability: 99.9%

---

## ✅ ACTION ITEMS

### **This Week:**
1. [ ] Review và approve roadmap
2. [ ] Assign developer cho Giai đoạn 1
3. [ ] Setup monitoring để track current performance

### **This Month:**
1. [ ] Implement PropertiesService cache
2. [ ] Convert to range-based reads
3. [ ] Implement batch writes
4. [ ] Testing & deployment

### **Next 3 Months:**
1. [ ] Evaluate nếu cần Giai đoạn 2
2. [ ] Plan hybrid architecture (nếu cần)
3. [ ] Setup infrastructure (nếu cần)

---

## 📞 SUPPORT

Mọi câu hỏi về scaling, vui lòng liên hệ IT Department.

**SPX Express TVH** © 2025


