# 📚 DOCUMENTATION - TÍNH NĂNG

## 📋 MỤC LỤC
1. [Loading States Management](#1-loading-states-management)
2. [Global Search](#2-global-search)
3. [Mobile Optimization](#3-mobile-optimization)
4. [Accessibility](#4-accessibility)
5. [Modal System](#5-modal-system)
6. [Error Handling](#6-error-handling)
7. [Performance Optimizations](#7-performance-optimizations)
8. [Toast Notifications](#8-toast-notifications)
9. [Debounce & Throttle](#9-debounce--throttle)
10. [Retry Mechanism](#10-retry-mechanism)

---

## 1. LOADING STATES MANAGEMENT

### Tổng quan
Hệ thống quản lý loading states cung cấp feedback trực quan cho người dùng khi ứng dụng đang xử lý các thao tác bất đồng bộ.

### Tính năng
- ✅ Loading state cho buttons
- ✅ Loading overlay cho các thao tác dài
- ✅ Auto-restore trạng thái ban đầu
- ✅ Spinner animation

### API Reference

#### `setLoading(element, loadingText)`
Hiển thị loading state cho một element.

**Parameters:**
- `element` (HTMLElement|string): Element hoặc selector
- `loadingText` (string, optional): Text hiển thị khi loading (default: "Đang tải...")

**Example:**
```javascript
var btn = document.getElementById('saveBtn');
setLoading(btn, 'Đang lưu...');
```

**Behavior:**
- Disable button nếu là button
- Lưu trạng thái ban đầu (text, disabled state)
- Hiển thị spinner và loading text

---

#### `removeLoading(element)`
Xóa loading state và restore trạng thái ban đầu.

**Parameters:**
- `element` (HTMLElement|string): Element hoặc selector

**Example:**
```javascript
removeLoading(btn);
```

**Behavior:**
- Restore text ban đầu
- Restore disabled state ban đầu
- Xóa loading spinner

---

#### `showLoadingOverlay(message, id)`
Hiển thị loading overlay toàn màn hình.

**Parameters:**
- `message` (string, optional): Message hiển thị (default: "Đang tải...")
- `id` (string, optional): ID của overlay (default: "globalLoading")

**Example:**
```javascript
showLoadingOverlay('Đang tải danh sách users...', 'usersLoading');
```

**Behavior:**
- Tạo overlay với backdrop blur
- Hiển thị spinner animation
- Hiển thị message
- Auto-remove overlay cũ nếu có cùng ID

---

#### `hideLoadingOverlay(id)`
Ẩn loading overlay.

**Parameters:**
- `id` (string, optional): ID của overlay (default: "globalLoading")

**Example:**
```javascript
hideLoadingOverlay('usersLoading');
```

---

### Usage Examples

#### Example 1: Button Loading
```javascript
function saveTasks() {
  var btn = $('#saveBtn');
  setLoading(btn, 'Đang lưu...');
  
  callApi('saveTasks', data)
    .then(function(result) {
      toast('Đã lưu thành công!', 'ok');
    })
    .catch(function(error) {
      toast('Lỗi: ' + error.message, 'err');
    })
    .finally(function() {
      removeLoading(btn);
    });
}
```

#### Example 2: Overlay Loading
```javascript
function loadUsers() {
  showLoadingOverlay('Đang tải danh sách users...', 'usersLoading');
  
  callApi('getAllUsers')
    .then(function(users) {
      renderUsersTable(users);
    })
    .catch(function(error) {
      toast('Lỗi: ' + error.message, 'err');
    })
    .finally(function() {
      hideLoadingOverlay('usersLoading');
    });
}
```

---

### Best Practices
1. **Luôn sử dụng `finally()`** để đảm bảo loading state được remove
2. **Sử dụng overlay** cho các thao tác > 2 giây
3. **Sử dụng button loading** cho các thao tác < 2 giây
4. **Cung cấp message rõ ràng** cho người dùng

---

## 2. GLOBAL SEARCH

### Tổng quan
Hệ thống tìm kiếm toàn cục cho phép người dùng tìm kiếm tasks nhanh chóng trong toàn bộ checklist.

### Tính năng
- ✅ Tìm kiếm theo text và category
- ✅ Real-time search với debounce
- ✅ Click để scroll đến task
- ✅ Keyboard navigation
- ✅ Auto-close khi click outside

### API Reference

#### `setupGlobalSearch()`
Khởi tạo global search functionality.

**Called:** Tự động khi DOM ready

**Behavior:**
- Setup event listeners cho search input
- Setup debounced search function
- Setup click outside handler
- Setup keyboard navigation

---

#### `searchTasks(query)`
Tìm kiếm tasks theo query.

**Parameters:**
- `query` (string): Search query

**Returns:**
- `Array`: Danh sách tasks matching

**Example:**
```javascript
var results = searchTasks('Kiểm tra');
// Returns: [{ task: {...}, matchType: 'text', hub: '80TVH01' }, ...]
```

**Search Logic:**
- Tìm trong `task.text` (case-insensitive)
- Tìm trong `task.category` (case-insensitive)
- Trả về cả task object và match type

---

#### `displaySearchResults(results, query)`
Hiển thị kết quả tìm kiếm.

**Parameters:**
- `results` (Array): Kết quả từ `searchTasks()`
- `query` (string): Search query

**Behavior:**
- Hiển thị tối đa 10 kết quả
- Hiển thị status (✅/⏳)
- Hiển thị category badge
- Click vào kết quả sẽ gọi `scrollToTask()`

---

#### `window.scrollToTask(taskId)`
Scroll đến task cụ thể.

**Parameters:**
- `taskId` (string): Task ID hoặc text

**Behavior:**
- Chuyển sang Checklist tab
- Tìm task element
- Scroll đến task với smooth animation
- Highlight task (background màu brand)
- Auto-remove highlight sau 2 giây

---

### Usage Examples

#### Example 1: Manual Search
```javascript
var results = searchTasks('Kiểm tra');
displaySearchResults(results, 'Kiểm tra');
```

#### Example 2: Programmatic Scroll
```javascript
window.scrollToTask('task-id-123');
```

---

### Configuration

#### Debounce Delay
```javascript
var performSearch = debounce(function(query) {
  // Search logic
}, 300); // 300ms delay
```

#### Min Query Length
```javascript
if (!query || query.trim().length < 2) {
  // Hide results
  return;
}
```

#### Max Results Displayed
```javascript
results.slice(0, 10).forEach(function(result) {
  // Display result
});
```

---

### Best Practices
1. **Sử dụng debounce** để giảm số lần search
2. **Min length 2 characters** để tránh search quá nhiều
3. **Limit results** để tránh UI quá dài
4. **Escape user input** để tránh XSS

---

## 3. MOBILE OPTIMIZATION

### Tổng quan
Tối ưu hóa trải nghiệm người dùng trên thiết bị di động với responsive design và touch-friendly UI.

### Tính năng
- ✅ Auto-detect mobile device
- ✅ Touch-friendly buttons (44x44px minimum)
- ✅ Responsive layout
- ✅ Prevent zoom on input focus (iOS)
- ✅ Orientation change handling

### API Reference

#### `setupMobileOptimizations()`
Khởi tạo mobile optimizations.

**Called:** Tự động khi DOM ready

**Behavior:**
- Detect mobile device
- Add `is-mobile` class to body
- Inject touch-friendly styles
- Update viewport meta tag
- Setup orientation change handler

---

### Mobile Detection

#### User Agent Detection
```javascript
var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
```

#### Screen Width Detection
```javascript
var isMobile = window.innerWidth < 768;
```

---

### Responsive Breakpoints

#### Mobile (< 900px)
- Sidebar: Horizontal layout, max-height 50vh
- Topbar: Wrap, full-width search
- Tables: Horizontal scroll
- Tabs: Horizontal scroll

#### Small Mobile (< 480px)
- Reduced padding
- Smaller fonts
- Compact buttons

---

### Touch-Friendly Styles

#### Buttons
```css
.is-mobile button,
.is-mobile .btn,
.is-mobile .pill {
  min-height: 44px;
  min-width: 44px;
}
```

#### Checkboxes
```css
.is-mobile input[type="checkbox"] {
  width: 24px;
  height: 24px;
}
```

#### Items
```css
.is-mobile .item {
  padding: 16px;
}
```

---

### Viewport Configuration

#### iOS Prevent Zoom
```javascript
viewport.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no');
```

---

### Orientation Change Handling
```javascript
window.addEventListener('orientationchange', function() {
  setTimeout(function() {
    window.dispatchEvent(new Event('resize'));
  }, 100);
});
```

---

### Best Practices
1. **Test trên thiết bị thực tế** không chỉ browser DevTools
2. **Sử dụng touch-friendly sizes** (44x44px minimum)
3. **Optimize cho cả portrait và landscape**
4. **Test với slow network** để đảm bảo performance

---

## 4. ACCESSIBILITY

### Tổng quan
Cải thiện khả năng truy cập ứng dụng cho người dùng với disabilities, tuân thủ WCAG 2.1 AA.

### Tính năng
- ✅ ARIA labels và roles
- ✅ Keyboard navigation
- ✅ Focus management
- ✅ Screen reader support

### API Reference

#### `setupAccessibility()`
Khởi tạo accessibility features.

**Called:** Tự động khi DOM ready

**Behavior:**
- Add ARIA labels to buttons
- Setup keyboard navigation for tabs
- Setup skip link functionality
- Prepare focus trap for modals

---

### ARIA Labels

#### Search Input
```html
<input 
  id="globalSearch" 
  type="text" 
  aria-label="Tìm kiếm tasks"
  role="searchbox"
  autocomplete="off"
/>
```

#### Search Results
```html
<div 
  id="globalSearchResults" 
  role="listbox" 
  aria-label="Kết quả tìm kiếm"
></div>
```

#### Buttons
```html
<button 
  id="saveBtn" 
  aria-label="Lưu tasks"
>💾 Lưu</button>
```

#### Modals
```javascript
modal.setAttribute('role', 'dialog');
modal.setAttribute('aria-modal', 'true');
modal.setAttribute('aria-labelledby', 'modal-title');
```

---

### Keyboard Navigation

#### Tabs Navigation
- **Arrow Right:** Next tab
- **Arrow Left:** Previous tab
- **Home:** First tab
- **End:** Last tab

**Implementation:**
```javascript
tab.addEventListener('keydown', function(e) {
  if (e.key === 'ArrowRight') {
    // Move to next tab
  } else if (e.key === 'ArrowLeft') {
    // Move to previous tab
  }
  // ...
});
```

#### Modal Navigation
- **Tab:** Next focusable element
- **Shift+Tab:** Previous focusable element
- **Escape:** Close modal

---

### Focus Management

#### Focus Trap
```javascript
function trapFocus(modal) {
  var focusableElements = modal.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  var firstElement = focusableElements[0];
  var lastElement = focusableElements[focusableElements.length - 1];
  
  // Trap focus within modal
}
```

#### Auto Focus
```javascript
// Focus first element when modal opens
if (focusableElements.length > 0) {
  focusableElements[0].focus();
}
```

---

### Skip Link
```html
<a href="#main-content" class="skip-link">Skip to main content</a>
```

---

### Best Practices
1. **Luôn cung cấp ARIA labels** cho interactive elements
2. **Đảm bảo keyboard navigation** hoạt động đầy đủ
3. **Test với screen readers** (NVDA, JAWS, VoiceOver)
4. **Maintain focus visibility** (không ẩn focus outline)

---

## 5. MODAL SYSTEM

### Tổng quan
Hệ thống modal được nâng cấp với focus trap, keyboard navigation, và better UX.

### Tính năng
- ✅ Focus trap
- ✅ Keyboard navigation
- ✅ Auto-close button
- ✅ Backdrop blur
- ✅ Body scroll prevention

### API Reference

#### `showModal(html)`
Hiển thị modal với HTML content.

**Parameters:**
- `html` (string): HTML content cho modal

**Example:**
```javascript
var html = '<div style="padding:24px">' +
  '<h3>Modal Title</h3>' +
  '<p>Modal content</p>' +
  '</div>';
showModal(html);
```

**Behavior:**
- Tạo modal với backdrop
- Add focus trap
- Setup keyboard navigation
- Prevent body scroll
- Auto-add close button nếu chưa có

---

### Modal Features

#### Auto-Close Button
Nếu HTML không có close button, một close button sẽ được tự động thêm:
```javascript
if (html.indexOf('modal-close') === -1) {
  var closeBtn = document.createElement('button');
  closeBtn.setAttribute('aria-label', 'Đóng');
  closeBtn.textContent = '×';
  closeBtn.onclick = function() { modal.remove(); };
}
```

#### Focus Trap
Focus được giữ trong modal:
- Tab: Next element
- Shift+Tab: Previous element
- Escape: Close modal

#### Body Scroll Prevention
```javascript
document.body.style.overflow = 'hidden';
// Restore when modal closes
```

---

### Usage Examples

#### Example 1: Simple Modal
```javascript
var html = '<div style="padding:24px">' +
  '<h3>Thông báo</h3>' +
  '<p>Đây là nội dung modal</p>' +
  '<button onclick="this.closest(\'.modal\').remove()">Đóng</button>' +
  '</div>';
showModal(html);
```

#### Example 2: Modal với Form
```javascript
var html = '<div style="padding:24px">' +
  '<h3>Nhập thông tin</h3>' +
  '<input type="text" placeholder="Tên" />' +
  '<button onclick="saveData()">Lưu</button>' +
  '</div>';
showModal(html);
```

---

### Best Practices
1. **Luôn cung cấp cách đóng modal** (button hoặc Escape)
2. **Focus vào element đầu tiên** khi mở modal
3. **Prevent body scroll** để tránh confusion
4. **Responsive sizing** (`min(600px, 90vw)`)

---

## 6. ERROR HANDLING

### Tổng quan
Hệ thống xử lý lỗi toàn diện với global handlers và user-friendly messages.

### Tính năng
- ✅ Global error handler
- ✅ Unhandled promise rejection handler
- ✅ Retry mechanism
- ✅ User-friendly error messages

### API Reference

#### Global Error Handler
```javascript
window.addEventListener('error', function(event) {
  console.error('Global error:', event.error);
  toast('Đã xảy ra lỗi không mong muốn. Vui lòng thử lại hoặc liên hệ admin.', 'err', 5000);
});
```

#### Unhandled Promise Rejection Handler
```javascript
window.addEventListener('unhandledrejection', function(event) {
  console.error('Unhandled promise rejection:', event.reason);
  var errorMsg = 'Lỗi kết nối. Vui lòng thử lại.';
  if (event.reason && event.reason.message) {
    errorMsg = event.reason.message;
  }
  toast(errorMsg, 'err', 5000);
});
```

---

### Error Handling Pattern

#### Standard Pattern
```javascript
callApi('action', data)
  .then(function(result) {
    if (result && result.status === 'ok') {
      // Success
    } else {
      var errorMsg = result && result.message ? result.message : 'Lỗi không xác định';
      toast('Lỗi: ' + errorMsg, 'err', 5000);
    }
  })
  .catch(function(error) {
    var errorMsg = error && error.message ? error.message : 'Lỗi không xác định';
    toast('Lỗi: ' + errorMsg, 'err', 5000);
  });
```

---

### Best Practices
1. **Luôn catch errors** trong promises
2. **Cung cấp user-friendly messages** không phải technical details
3. **Log errors vào console** để debug
4. **Sử dụng retry mechanism** cho network errors

---

## 7. PERFORMANCE OPTIMIZATIONS

### Tổng quan
Các tối ưu hóa performance để cải thiện trải nghiệm người dùng.

### Tính năng
- ✅ Debounce cho search
- ✅ Throttle cho scroll/resize
- ✅ Lazy loading images
- ✅ RequestAnimationFrame cho rendering

### API Reference

#### `debounce(func, wait)`
Trì hoãn thực thi function cho đến sau thời gian chờ.

**Parameters:**
- `func` (Function): Function cần debounce
- `wait` (number): Thời gian chờ (ms)

**Example:**
```javascript
var debouncedSearch = debounce(function(query) {
  performSearch(query);
}, 300);
```

---

#### `throttle(func, limit)`
Giới hạn tần suất thực thi function.

**Parameters:**
- `func` (Function): Function cần throttle
- `limit` (number): Thời gian giới hạn (ms)

**Example:**
```javascript
var throttledScroll = throttle(function() {
  updateScrollPosition();
}, 100);
```

---

#### `optimizeRendering()`
Tối ưu rendering với requestAnimationFrame.

**Exposes:**
- `window.scheduleRender(fn)`: Schedule render update

**Example:**
```javascript
window.scheduleRender(function() {
  renderTasks();
});
```

---

#### `setupLazyLoading()`
Setup lazy loading cho images.

**Behavior:**
- Sử dụng IntersectionObserver
- Chỉ load images khi vào viewport
- Tự động cleanup sau khi load

**Usage:**
```html
<img data-src="image.jpg" alt="Image" />
```

---

### Best Practices
1. **Sử dụng debounce** cho search và input
2. **Sử dụng throttle** cho scroll và resize
3. **Lazy load images** để giảm initial load time
4. **Sử dụng requestAnimationFrame** cho smooth animations

---

## 8. TOAST NOTIFICATIONS

### Tổng quan
Hệ thống thông báo toast với animations và auto-dismiss.

### Tính năng
- ✅ Icons cho từng loại
- ✅ Auto-dismiss
- ✅ Click to dismiss
- ✅ Smooth animations
- ✅ Dark mode support

### API Reference

#### `toast(msg, type, duration)`
Hiển thị toast notification.

**Parameters:**
- `msg` (string): Message
- `type` (string, optional): Type ('ok', 'err', 'warn', 'info') - default: 'ok'
- `duration` (number, optional): Auto-dismiss duration (ms) - default: 3000

**Example:**
```javascript
toast('Đã lưu thành công!', 'ok', 3000);
toast('Có lỗi xảy ra!', 'err', 5000);
toast('Cảnh báo!', 'warn', 4000);
toast('Thông tin', 'info', 3000);
```

---

### Toast Types

#### Success (ok)
- Icon: ✅
- Color: Green
- Default duration: 3000ms

#### Error (err)
- Icon: ❌
- Color: Red
- Default duration: 5000ms

#### Warning (warn)
- Icon: ⚠️
- Color: Orange
- Default duration: 4000ms

#### Info (info)
- Icon: ℹ️
- Color: Blue
- Default duration: 3000ms

---

### Features

#### Auto-Dismiss
```javascript
setTimeout(function() {
  // Remove toast
}, duration || 3000);
```

#### Click to Dismiss
```javascript
el.addEventListener('click', function() {
  // Remove toast immediately
});
```

#### Animations
- Slide in from right
- Fade out
- Smooth transitions

---

### Best Practices
1. **Sử dụng đúng type** cho từng trường hợp
2. **Cung cấp duration phù hợp** (errors nên lâu hơn)
3. **Message ngắn gọn** và rõ ràng
4. **Không spam toasts** (debounce nếu cần)

---

## 9. DEBOUNCE & THROTTLE

### Tổng quan
Utility functions để tối ưu performance của event handlers.

### Debounce
Trì hoãn thực thi cho đến sau khi ngừng trigger.

**Use Cases:**
- Search input
- Resize handler
- Input validation

**Example:**
```javascript
var debouncedSearch = debounce(function(query) {
  performSearch(query);
}, 300);

searchInput.addEventListener('input', function(e) {
  debouncedSearch(e.target.value);
});
```

---

### Throttle
Giới hạn tần suất thực thi.

**Use Cases:**
- Scroll handler
- Resize handler
- Mouse move handler

**Example:**
```javascript
var throttledScroll = throttle(function() {
  updateScrollPosition();
}, 100);

window.addEventListener('scroll', throttledScroll);
```

---

### Best Practices
1. **Debounce cho search** (300-500ms)
2. **Throttle cho scroll** (100-200ms)
3. **Test với real usage** để tìm delay phù hợp

---

## 10. RETRY MECHANISM

### Tổng quan
Cơ chế retry với exponential backoff cho network requests.

### API Reference

#### `retryWithBackoff(fn, maxRetries, delay)`
Retry function với exponential backoff.

**Parameters:**
- `fn` (Function): Function trả về Promise
- `maxRetries` (number, optional): Số lần retry tối đa (default: 3)
- `delay` (number, optional): Delay ban đầu (ms) (default: 1000)

**Example:**
```javascript
retryWithBackoff(function() {
  return callApi('loadTasks', data);
}, 3, 1000);
```

---

#### `callApiWithRetry(action, data, retries)`
Wrapper cho `callApi` với retry.

**Parameters:**
- `action` (string): API action
- `data` (object): API data
- `retries` (number, optional): Số lần retry (default: 2)

**Example:**
```javascript
callApiWithRetry('saveTasks', { tasks: tasks }, 2)
  .then(function(result) {
    // Success
  })
  .catch(function(error) {
    // Failed after retries
  });
```

---

### Exponential Backoff
```
Attempt 1: Immediate
Attempt 2: 1000ms delay
Attempt 3: 2000ms delay
Attempt 4: 4000ms delay
```

**Formula:**
```javascript
var backoffDelay = delay * Math.pow(2, attempt - 1);
```

---

### Best Practices
1. **Sử dụng cho network requests** không phải validation errors
2. **Limit số lần retry** (2-3 lần)
3. **Show loading state** trong khi retry
4. **Log retry attempts** để debug

---

## 📚 TÀI LIỆU THAM KHẢO

### Standards
- [WCAG 2.1 AA](https://www.w3.org/WAI/WCAG21/quickref/?levels=aaa)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [MDN Web Docs](https://developer.mozilla.org/)

### Best Practices
- [Web.dev Performance](https://web.dev/performance/)
- [A11y Project](https://www.a11yproject.com/)
- [Google Mobile-Friendly Test](https://search.google.com/test/mobile-friendly)

---

**Last Updated:** 2024-01-XX
**Version:** 1.0.0





