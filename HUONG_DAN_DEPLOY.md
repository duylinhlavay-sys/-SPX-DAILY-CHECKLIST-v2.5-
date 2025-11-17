# 📋 Hướng Dẫn Deploy - [SPX] DAILY CHECKLIST

## ⚠️ LỖI THƯỜNG GẶP

### Lỗi: `SyntaxError: Unexpected token '<' dòng: 1 tệp: script.gs`

**Nguyên nhân:** Google Apps Script đang cố parse file HTML như JavaScript file (.gs)

**Giải pháp:**

#### Bước 1: Kiểm tra các file trong Google Apps Script Editor

1. Mở Google Apps Script Editor
2. Kiểm tra danh sách file bên trái
3. **KHÔNG ĐƯỢC CÓ** file nào tên `script.gs` hoặc có extension `.gs` chứa code HTML
4. Chỉ được có các file sau:

```
✅ Code.gs          (JavaScript file - server-side)
✅ index            (HTML file)
✅ styles           (HTML file)
✅ script           (HTML file)
✅ config           (HTML file) - NEW
✅ utils            (HTML file) - NEW
```

#### Bước 2: Xóa file sai (nếu có)

- Nếu thấy file `script.gs`, **XÓA** nó ngay lập tức
- Chỉ giữ lại file `script` (loại HTML)

#### Bước 3: Đảm bảo đúng loại file

Trong Google Apps Script Editor:
- File **JavaScript** (`.gs`): Chỉ chứa server-side code
- File **HTML**: Chứa HTML/CSS/JavaScript (client-side)

---

## 📝 THỨ TỰ TẠO FILE ĐÚNG CÁCH

### Trong Google Apps Script Editor:

#### 1. Tạo/Upload file JavaScript (.gs)

**File: `Code.gs`**
- Click **File → New → Script** (hoặc **+** button)
- Tên file: `Code`
- Type: JavaScript file (tự động)
- Copy nội dung từ `gas-files/Code.gs`

#### 2. Tạo các file HTML

**Lưu ý quan trọng:** 
- Trong Google Apps Script, file HTML **KHÔNG CÓ** extension `.html`
- Chỉ đặt tên file (ví dụ: `index`, `script`, `styles`)

**Cách tạo file HTML:**

1. **File: `index`**
   - Click **File → New → HTML file**
   - Tên file: `index` (KHÔNG phải `index.html`)
   - Copy nội dung từ `gas-files/index.html`

2. **File: `styles`**
   - Click **File → New → HTML file**
   - Tên file: `styles` (KHÔNG phải `styles.html`)
   - Copy nội dung từ `gas-files/styles.html`

3. **File: `config`** ⭐ NEW
   - Click **File → New → HTML file**
   - Tên file: `config` (KHÔNG phải `config.html`)
   - Copy nội dung từ `gas-files/config.html`

4. **File: `utils`** ⭐ NEW
   - Click **File → New → HTML file**
   - Tên file: `utils` (KHÔNG phải `utils.html`)
   - Copy nội dung từ `gas-files/utils.html`

5. **File: `script`**
   - Click **File → New → HTML file**
   - Tên file: `script` (KHÔNG phải `script.html` hoặc `script.gs`)
   - Copy nội dung từ `gas-files/script.html`

---

## 🔍 KIỂM TRA SAU KHI TẠO FILE

### Danh sách file đúng:

```
📁 Google Apps Script Project

📄 Code.gs          [JavaScript] - Server-side code
📄 index            [HTML] - Main HTML file
📄 styles           [HTML] - CSS styles
📄 config           [HTML] - Configuration (NEW)
📄 utils            [HTML] - Utilities (NEW)
📄 script           [HTML] - Main JavaScript
```

### ⚠️ KHÔNG ĐƯỢC CÓ:

```
❌ script.gs        [KHÔNG ĐƯỢC CÓ]
❌ config.gs        [KHÔNG ĐƯỢC CÓ]
❌ utils.gs         [KHÔNG ĐƯỢC CÓ]
❌ script.html      [KHÔNG CẦN EXTENSION .html]
```

---

## 🚀 THỨ TỰ DEPLOY

### Bước 1: Tạo/Update các file theo thứ tự

1. **Code.gs** (nếu chưa có, hoặc update nếu đã có)
2. **styles** (nếu chưa có, hoặc giữ nguyên nếu đã có)
3. **config** ⭐ TẠO MỚI
4. **utils** ⭐ TẠO MỚI
5. **script** (update nội dung)
6. **index** (update để include config và utils)

### Bước 2: Save và Test

1. Click **File → Save** (hoặc `Ctrl+S`)
2. Click **Run → Test as web app** (nếu cần)
3. Hoặc **Deploy → New deployment** để deploy

---

## ✅ CHECKLIST TRƯỚC KHI DEPLOY

- [ ] Không có file `script.gs` trong project
- [ ] Tất cả file HTML không có extension (chỉ tên file)
- [ ] File `index` có include đúng thứ tự:
  ```html
  <?!= include('styles'); ?>
  <?!= include('config'); ?>
  <?!= include('utils'); ?>
  ```
- [ ] File `index` có include `script` ở cuối:
  ```html
  <?!= include('script'); ?>
  ```
- [ ] Tất cả file đã được save
- [ ] Code không có lỗi syntax (check bằng Script Editor)

---

## 🐛 XỬ LÝ LỖI

### Nếu vẫn gặp lỗi `Unexpected token '<'`:

1. **Kiểm tra lại tên file:**
   - Mở Script Editor
   - Xem danh sách file
   - Đảm bảo không có file nào có extension `.gs` chứa code HTML

2. **Xóa và tạo lại file:**
   - Xóa file `script` (HTML) nếu có vấn đề
   - Tạo lại file HTML mới với tên `script`
   - Copy nội dung lại

3. **Kiểm tra hàm include() trong Code.gs:**
   ```javascript
   function include(filename) {
     return HtmlService.createHtmlOutputFromFile(filename).getContent();
   }
   ```
   - Đảm bảo hàm này tồn tại
   - Tên file truyền vào không có extension

4. **Test từng file:**
   - Comment out các include trong `index` để test từng file
   - Tìm file nào gây lỗi

---

## 📞 HỖ TRỢ

Nếu vẫn gặp vấn đề, kiểm tra:
- Console log trong Script Editor
- Execution log trong Apps Script dashboard
- Xem có file nào bị duplicate không

**SPX Express TVH** © 2025




