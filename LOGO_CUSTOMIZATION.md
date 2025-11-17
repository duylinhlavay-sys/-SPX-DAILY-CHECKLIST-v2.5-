# 🎨 HƯỚNG DẪN TÙY CHỈNH LOGO & BRANDING

## 📋 Tổng Quan
File `app-config.js` cho phép bạn dễ dàng thay đổi logo, favicon, và branding của app mà không cần sửa code phức tạp.

---

## 🚀 Cách Thay Đổi Logo

### Bước 1: Chuẩn Bị Ảnh Logo
1. **Tìm hoặc tạo logo** (PNG, SVG, hoặc JPG)
2. **Kích thước khuyên dùng**:
   - Logo chính: **64x64px** trở lên
   - Favicon: **32x32px** hoặc **16x16px**
3. **Nền trong suốt** (PNG) sẽ đẹp hơn

### Bước 2: Upload Logo Lên Internet
Có 3 cách:

#### Cách 1: Google Drive (Khuyên dùng)
1. Upload ảnh lên Google Drive
2. Click chuột phải → **Get link** → **Anyone with the link**
3. Copy link có dạng: `https://drive.google.com/file/d/FILE_ID/view`
4. Đổi thành link trực tiếp: `https://drive.google.com/uc?export=view&id=FILE_ID`

#### Cách 2: Imgur
1. Vào https://imgur.com
2. Upload ảnh
3. Click chuột phải vào ảnh → **Copy image address**
4. Link có dạng: `https://i.imgur.com/abc123.png`

#### Cách 3: Direct URL
Nếu bạn có hosting hoặc CDN, upload ảnh và lấy direct URL.

### Bước 3: Cập Nhật File `app-config.js`
1. Mở file **`app-config.js`** (ở thư mục root)
2. Tìm dòng:
```javascript
logoUrl: 'https://example.com/your-logo.png',
faviconUrl: 'https://example.com/your-favicon.png',
```
3. **Thay bằng link ảnh của bạn**:
```javascript
logoUrl: 'https://i.imgur.com/YOUR_LOGO.png',
faviconUrl: 'https://i.imgur.com/YOUR_FAVICON.png',
```
4. **Lưu file** (Ctrl+S hoặc Cmd+S)

### Bước 4: Xem Kết Quả
1. **Refresh trang web** (Ctrl+R hoặc Cmd+R)
2. Hoặc **Hard refresh** để clear cache (Ctrl+Shift+R hoặc Cmd+Shift+R)
3. Logo mới sẽ xuất hiện ở:
   - ✅ Favicon (tab browser)
   - ✅ Topbar (thanh trên cùng)
   - ✅ Cover page (trang chào)

---

## 🎯 Tùy Chỉnh Khác

### Đổi Tên App
```javascript
appTitle: 'TÊN APP CỦA BẠN',
```

### Đổi Phiên Bản
```javascript
appVersion: 'v3.0',
```

### Đổi Công Ty
```javascript
companyName: 'TÊN CÔNG TY CỦA BẠN',
copyrightYear: '2025',
```

---

## ⚠️ Lưu Ý Quan Trọng

### ✅ Link Ảnh Hợp Lệ
- Phải là **Direct URL** (kết thúc bằng .png, .jpg, .svg)
- Link phải **công khai**, không cần đăng nhập
- Test link bằng cách paste vào trình duyệt

### ❌ Link Không Hoạt Động
- ❌ Link Google Drive dạng `/view` (phải đổi sang `/uc?export=view&id=`)
- ❌ Link Dropbox dạng `dl=0` (phải đổi thành `dl=1`)
- ❌ Link yêu cầu đăng nhập

### 🎨 Chất Lượng Hình Ảnh
- **Favicon**: Nên dùng ảnh vuông, kích thước nhỏ (32x32px)
- **Logo**: Có thể chữ nhật, kích thước lớn hơn (64x64px+)
- **Format**: PNG với nền trong suốt là tốt nhất

---

## 📝 Ví Dụ Cấu Hình Hoàn Chỉnh

```javascript
const APP_CONFIG = {
  appTitle: '[ABC] QUẢN LÝ CÔNG VIỆC',
  appVersion: 'v3.0',
  logoUrl: 'https://i.imgur.com/abc123.png',
  faviconUrl: 'https://i.imgur.com/favicon123.png',
  companyName: 'ABC Company Ltd',
  copyrightYear: '2025',
  footerText: 'Hệ Thống Quản Lý Nội Bộ'
};
```

---

## 🔧 Troubleshooting

### Logo không hiển thị?
1. Kiểm tra link ảnh có mở được trong browser không
2. Hard refresh (Ctrl+Shift+R)
3. Check browser console (F12) xem có lỗi không

### Logo bị vỡ hoặc mờ?
1. Dùng ảnh có độ phân giải cao hơn
2. Chuyển sang format PNG hoặc SVG

### Thay đổi không có hiệu lực?
1. Đảm bảo đã **lưu file** app-config.js
2. **Hard refresh** browser để clear cache
3. Nếu dùng Google Apps Script, phải deploy lại web app

---

## 📞 Hỗ Trợ
Nếu gặp vấn đề, liên hệ IT Department hoặc check file này lại.

**Chúc bạn tùy chỉnh thành công! 🎉**
