# 📖 HƯỚNG DẪN SỬ DỤNG - [SPX] DAILY CHECKLIST

## 🚀 BẮT ĐẦU NHANH

### 1. Khôi phục script.html ✅
File `script.html` đã được khôi phục từ backup. Ứng dụng hiện đã có thể hoạt động.

### 2. Test ứng dụng
1. Mở Google Apps Script Editor
2. Upload các file:
   - `Code.gs`
   - `index.html`
   - `script.html` (đã khôi phục)
   - `styles.html`
3. Deploy as Web App
4. Test các tính năng

---

## ✨ TÍNH NĂNG MỚI ĐÃ THÊM

### 1. Enhanced Error Handling
- Tự động bắt lỗi và hiển thị thông báo thân thiện
- Log lỗi vào console để debug
- Xử lý lỗi Promise rejection

### 2. Enhanced Toast Notifications
- Icons tự động (✅ ❌ ⚠️ ℹ️)
- Animations mượt mà
- Click để đóng
- Auto-dismiss sau 3 giây (có thể tùy chỉnh)

### 3. Retry Mechanism
- Tự động retry khi API call fail
- Exponential backoff (tăng dần thời gian chờ)
- Sử dụng: `callApiWithRetry(action, data, retries)`

### 4. Enhanced Security
- XSS protection cải thiện
- Safe HTML insertion
- Input sanitization

---

## 🔧 CÁCH SỬ DỤNG

### Error Handling
```javascript
// Tự động hoạt động - không cần code thêm
// Global error handler sẽ bắt tất cả lỗi
```

### Toast Notifications
```javascript
// Cơ bản
toast('Thông báo thành công!', 'ok');

// Với duration tùy chỉnh
toast('Lỗi xảy ra!', 'err', 5000);

// Các types: 'ok', 'err', 'warn', 'info'
```

### Retry Mechanism
```javascript
// Thay vì callApi trực tiếp
callApi('loadTasks', { storageKey: key })

// Sử dụng callApiWithRetry
callApiWithRetry('loadTasks', { storageKey: key }, 3)
// 3 = số lần retry tối đa
```

### Security
```javascript
// Luôn sử dụng esc() cho user input
var userInput = document.getElementById('input').value;
element.innerHTML = esc(userInput); // ✅ Safe

// Hoặc sử dụng safeHTML()
element.innerHTML = safeHTML(userInput); // ✅ Safe
```

---

## 📝 CHECKLIST TRƯỚC KHI DEPLOY

- [ ] Test authentication
- [ ] Test load tasks
- [ ] Test save tasks
- [ ] Test reports
- [ ] Test admin functions
- [ ] Test Q&A module
- [ ] Test chat module
- [ ] Test trên mobile
- [ ] Test error scenarios
- [ ] Verify toast notifications
- [ ] Check console for errors

---

## 🐛 TROUBLESHOOTING

### Lỗi "Cannot connect to server"
- Kiểm tra Google Apps Script deployment
- Kiểm tra permissions
- Kiểm tra network connection
- Xem console logs

### Toast không hiện
- Kiểm tra element `#toast` có tồn tại trong HTML
- Kiểm tra CSS styles
- Xem console logs

### API calls fail
- Kiểm tra Google Apps Script logs
- Kiểm tra permissions
- Sử dụng `callApiWithRetry` để tự động retry

---

## 📞 SUPPORT

Nếu gặp vấn đề, vui lòng:
1. Kiểm tra console logs
2. Kiểm tra Google Apps Script execution logs
3. Xem file `TROUBLESHOOTING.md` (nếu có)
4. Liên hệ development team

---

*Last Updated: 2025-01-XX*





