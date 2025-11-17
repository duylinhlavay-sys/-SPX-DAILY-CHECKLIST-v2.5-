# 🧪 TEST CASES CHI TIẾT

## 📋 MỤC LỤC
1. [Loading States Management](#1-loading-states-management)
2. [Global Search](#2-global-search)
3. [Mobile Optimization](#3-mobile-optimization)
4. [Accessibility](#4-accessibility)
5. [Modal System](#5-modal-system)
6. [Error Handling](#6-error-handling)
7. [Performance](#7-performance)
8. [Toast Notifications](#8-toast-notifications)

---

## 1. LOADING STATES MANAGEMENT

### Test Case 1.1: Button Loading State
**Mục đích:** Kiểm tra button hiển thị loading state khi thực hiện action

**Preconditions:**
- User đã đăng nhập
- Ứng dụng đã load xong

**Steps:**
1. Click vào button "💾 Lưu" trong Checklist tab
2. Quan sát button

**Expected Results:**
- ✅ Button bị disable
- ✅ Button hiển thị spinner (loading icon)
- ✅ Text thay đổi thành "Đang lưu..."
- ✅ Sau khi lưu xong, button trở về trạng thái ban đầu

**Test Data:**
- Button ID: `#saveBtn`
- Loading text: "Đang lưu..."

---

### Test Case 1.2: Loading Overlay
**Mục đích:** Kiểm tra loading overlay hiển thị cho các thao tác dài

**Preconditions:**
- User có quyền admin
- Đang ở Admin tab

**Steps:**
1. Click vào Admin tab
2. Quan sát khi load danh sách users

**Expected Results:**
- ✅ Overlay hiển thị với backdrop blur
- ✅ Spinner animation hoạt động
- ✅ Message "Đang tải danh sách users..." hiển thị
- ✅ Overlay tự động ẩn sau khi load xong

**Test Data:**
- Overlay ID: `usersLoading`
- Message: "Đang tải danh sách users..."

---

### Test Case 1.3: Multiple Loading States
**Mục đích:** Kiểm tra nhiều loading states cùng lúc

**Preconditions:**
- User đã đăng nhập
- Có nhiều tabs đang mở

**Steps:**
1. Click "💾 Lưu" trong Checklist tab
2. Ngay lập tức click "Refresh" trong Q&A tab

**Expected Results:**
- ✅ Mỗi button có loading state riêng
- ✅ Không bị conflict giữa các loading states
- ✅ Mỗi button restore về trạng thái ban đầu đúng lúc

---

### Test Case 1.4: Loading State với Error
**Mục đích:** Kiểm tra loading state khi có lỗi xảy ra

**Preconditions:**
- User đã đăng nhập
- Simulate network error (disconnect network)

**Steps:**
1. Disconnect network
2. Click "💾 Lưu"
3. Chờ error xảy ra

**Expected Results:**
- ✅ Loading state hiển thị
- ✅ Error message hiển thị
- ✅ Loading state được remove
- ✅ Button trở về trạng thái ban đầu

---

## 2. GLOBAL SEARCH

### Test Case 2.1: Basic Search
**Mục đích:** Kiểm tra tìm kiếm cơ bản

**Preconditions:**
- User đã đăng nhập
- Có ít nhất 5 tasks trong checklist
- Đang ở Checklist tab

**Steps:**
1. Click vào search box "🔍 Tìm kiếm toàn bộ..."
2. Nhập text của một task (ví dụ: "Kiểm tra")
3. Quan sát kết quả

**Expected Results:**
- ✅ Kết quả hiển thị sau 300ms (debounce)
- ✅ Hiển thị task matching với text
- ✅ Hiển thị status (✅ hoặc ⏳)
- ✅ Hiển thị category badge
- ✅ Hiển thị số lượng kết quả

**Test Data:**
- Search query: "Kiểm tra"
- Min length: 2 characters

---

### Test Case 2.2: Search với Special Characters
**Mục đích:** Kiểm tra search với ký tự đặc biệt

**Preconditions:**
- User đã đăng nhập
- Có task với special characters

**Steps:**
1. Nhập search query: "Task's & Items"
2. Quan sát kết quả

**Expected Results:**
- ✅ Không có syntax errors
- ✅ Search hoạt động bình thường
- ✅ Results được escape đúng

---

### Test Case 2.3: Search Results Click
**Mục đích:** Kiểm tra click vào kết quả search

**Preconditions:**
- User đã đăng nhập
- Đã có kết quả search

**Steps:**
1. Search một task
2. Click vào một kết quả trong danh sách

**Expected Results:**
- ✅ Chuyển sang Checklist tab
- ✅ Scroll đến task tương ứng
- ✅ Task được highlight (background màu brand)
- ✅ Highlight tự động mất sau 2 giây
- ✅ Search box được clear
- ✅ Search results được đóng

---

### Test Case 2.4: Search Empty Results
**Mục đích:** Kiểm tra khi không tìm thấy kết quả

**Preconditions:**
- User đã đăng nhập

**Steps:**
1. Nhập search query không có trong tasks: "XYZ123ABC"
2. Quan sát kết quả

**Expected Results:**
- ✅ Hiển thị message "Không tìm thấy kết quả cho 'XYZ123ABC'"
- ✅ Không có errors

---

### Test Case 2.5: Search Debounce
**Mục đích:** Kiểm tra debounce hoạt động đúng

**Preconditions:**
- User đã đăng nhập

**Steps:**
1. Nhập từng ký tự nhanh: "K", "i", "e", "m", "t", "r", "a"
2. Quan sát số lần API call

**Expected Results:**
- ✅ Chỉ search 1 lần sau khi ngừng gõ 300ms
- ✅ Không search sau mỗi ký tự

---

### Test Case 2.6: Search Keyboard Navigation
**Mục đích:** Kiểm tra keyboard navigation

**Preconditions:**
- User đã đăng nhập
- Search box đang focus

**Steps:**
1. Nhập search query
2. Nhấn Escape key

**Expected Results:**
- ✅ Search results đóng
- ✅ Search box blur

---

### Test Case 2.7: Search Click Outside
**Mục đích:** Kiểm tra đóng search khi click outside

**Preconditions:**
- User đã đăng nhập
- Search results đang hiển thị

**Steps:**
1. Click vào bất kỳ đâu ngoài search box và results

**Expected Results:**
- ✅ Search results tự động đóng

---

### Test Case 2.8: Search với Category
**Mục đích:** Kiểm tra search theo category

**Preconditions:**
- User đã đăng nhập
- Có tasks với category "Đầu Ca"

**Steps:**
1. Nhập "Đầu Ca" vào search box

**Expected Results:**
- ✅ Hiển thị tất cả tasks trong category "Đầu Ca"
- ✅ Category badge hiển thị đúng

---

## 3. MOBILE OPTIMIZATION

### Test Case 3.1: Mobile Detection
**Mục đích:** Kiểm tra detect mobile device

**Preconditions:**
- Mở ứng dụng trên mobile device hoặc resize browser < 768px

**Steps:**
1. Mở ứng dụng
2. Kiểm tra body class

**Expected Results:**
- ✅ Body có class `is-mobile`
- ✅ Touch-friendly styles được apply

---

### Test Case 3.2: Touch-Friendly Buttons
**Mục đích:** Kiểm tra buttons có kích thước phù hợp cho touch

**Preconditions:**
- Đang ở mobile mode

**Steps:**
1. Quan sát tất cả buttons

**Expected Results:**
- ✅ Buttons có min-height: 44px
- ✅ Buttons có min-width: 44px
- ✅ Dễ dàng click bằng ngón tay

---

### Test Case 3.3: Mobile Sidebar
**Mục đích:** Kiểm tra sidebar trên mobile

**Preconditions:**
- Đang ở mobile mode (< 900px width)

**Steps:**
1. Quan sát layout

**Expected Results:**
- ✅ Sidebar ở trên cùng (horizontal)
- ✅ Sidebar có max-height: 50vh
- ✅ Sidebar scrollable
- ✅ Main content ở dưới sidebar

---

### Test Case 3.4: Mobile Topbar
**Mục đích:** Kiểm tra topbar trên mobile

**Preconditions:**
- Đang ở mobile mode

**Steps:**
1. Quan sát topbar

**Expected Results:**
- ✅ Topbar wrap được
- ✅ Global search full-width
- ✅ Buttons có kích thước phù hợp

---

### Test Case 3.5: Mobile Tables
**Mục đích:** Kiểm tra tables scrollable trên mobile

**Preconditions:**
- Đang ở mobile mode
- Mở tab có table (Reports, Admin)

**Steps:**
1. Scroll table ngang

**Expected Results:**
- ✅ Table scrollable ngang
- ✅ Smooth scrolling với touch
- ✅ Không bị overflow

---

### Test Case 3.6: Mobile Orientation Change
**Mục đích:** Kiểm tra khi xoay màn hình

**Preconditions:**
- Đang ở mobile device

**Steps:**
1. Xoay màn hình từ portrait sang landscape
2. Quan sát layout

**Expected Results:**
- ✅ Layout tự động adjust
- ✅ Không bị lỗi
- ✅ Sidebar có max-height: 40vh trong landscape

---

### Test Case 3.7: Prevent Zoom on Input Focus
**Mục đích:** Kiểm tra không zoom khi focus input (iOS)

**Preconditions:**
- Đang ở iOS device

**Steps:**
1. Click vào input field

**Expected Results:**
- ✅ Không bị zoom in
- ✅ Viewport giữ nguyên

---

## 4. ACCESSIBILITY

### Test Case 4.1: ARIA Labels
**Mục đích:** Kiểm tra ARIA labels có đầy đủ

**Preconditions:**
- Ứng dụng đã load

**Steps:**
1. Inspect các elements quan trọng

**Expected Results:**
- ✅ Search input có `aria-label="Tìm kiếm tasks"`
- ✅ Search input có `role="searchbox"`
- ✅ Search results có `role="listbox"`
- ✅ Save button có `aria-label="Lưu tasks"`
- ✅ Modals có `role="dialog"` và `aria-modal="true"`

---

### Test Case 4.2: Keyboard Navigation - Tabs
**Mục đích:** Kiểm tra điều hướng tabs bằng keyboard

**Preconditions:**
- User đã đăng nhập
- Focus vào tab đầu tiên

**Steps:**
1. Nhấn Arrow Right key
2. Nhấn Arrow Left key
3. Nhấn Home key
4. Nhấn End key

**Expected Results:**
- ✅ Arrow Right: chuyển sang tab tiếp theo
- ✅ Arrow Left: chuyển sang tab trước
- ✅ Home: chuyển về tab đầu tiên
- ✅ End: chuyển đến tab cuối cùng
- ✅ Tab được activate khi focus

---

### Test Case 4.3: Keyboard Navigation - Modal
**Mục đích:** Kiểm tra điều hướng trong modal bằng keyboard

**Preconditions:**
- Modal đang mở

**Steps:**
1. Nhấn Tab key nhiều lần
2. Nhấn Shift+Tab
3. Nhấn Escape

**Expected Results:**
- ✅ Tab: focus di chuyển forward
- ✅ Shift+Tab: focus di chuyển backward
- ✅ Focus trap hoạt động (không ra ngoài modal)
- ✅ Escape: đóng modal

---

### Test Case 4.4: Focus Trap
**Mục đích:** Kiểm tra focus trap trong modal

**Preconditions:**
- Modal đang mở
- Focus ở element cuối cùng

**Steps:**
1. Nhấn Tab (không nhấn Shift)

**Expected Results:**
- ✅ Focus quay về element đầu tiên trong modal
- ✅ Không focus ra ngoài modal

---

### Test Case 4.5: Screen Reader Support
**Mục đích:** Kiểm tra hỗ trợ screen reader

**Preconditions:**
- Bật screen reader (NVDA, JAWS, VoiceOver)

**Steps:**
1. Navigate qua ứng dụng bằng screen reader

**Expected Results:**
- ✅ Screen reader đọc được ARIA labels
- ✅ Screen reader đọc được role
- ✅ Screen reader đọc được trạng thái (loading, error, success)

---

## 5. MODAL SYSTEM

### Test Case 5.1: Modal Open
**Mục đích:** Kiểm tra mở modal

**Preconditions:**
- User đã đăng nhập

**Steps:**
1. Click vào task info icon (💡)
2. Quan sát modal

**Expected Results:**
- ✅ Modal hiển thị với backdrop blur
- ✅ Modal có close button (×)
- ✅ Focus tự động vào element đầu tiên
- ✅ Body scroll bị disable

---

### Test Case 5.2: Modal Close - Button
**Mục đích:** Kiểm tra đóng modal bằng close button

**Preconditions:**
- Modal đang mở

**Steps:**
1. Click vào close button (×)

**Expected Results:**
- ✅ Modal đóng
- ✅ Body scroll được restore

---

### Test Case 5.3: Modal Close - Backdrop
**Mục đích:** Kiểm tra đóng modal bằng click backdrop

**Preconditions:**
- Modal đang mở

**Steps:**
1. Click vào backdrop (vùng tối bên ngoài modal)

**Expected Results:**
- ✅ Modal đóng
- ✅ Body scroll được restore

---

### Test Case 5.4: Modal Close - Escape
**Mục đích:** Kiểm tra đóng modal bằng Escape key

**Preconditions:**
- Modal đang mở

**Steps:**
1. Nhấn Escape key

**Expected Results:**
- ✅ Modal đóng
- ✅ Body scroll được restore

---

### Test Case 5.5: Modal Focus Trap
**Mục đích:** Kiểm tra focus trap trong modal

**Preconditions:**
- Modal đang mở với nhiều focusable elements

**Steps:**
1. Tab đến element cuối cùng
2. Nhấn Tab thêm 1 lần nữa

**Expected Results:**
- ✅ Focus quay về element đầu tiên
- ✅ Không focus ra ngoài modal

---

### Test Case 5.6: Modal Responsive
**Mục đích:** Kiểm tra modal responsive

**Preconditions:**
- Modal đang mở
- Resize browser window

**Steps:**
1. Resize window xuống < 600px

**Expected Results:**
- ✅ Modal width: 90vw (không vượt quá màn hình)
- ✅ Modal vẫn hiển thị đẹp

---

## 6. ERROR HANDLING

### Test Case 6.1: Global Error Handler
**Mục đích:** Kiểm tra global error handler

**Preconditions:**
- Ứng dụng đang chạy

**Steps:**
1. Trigger một error (ví dụ: call undefined function)
2. Quan sát console và UI

**Expected Results:**
- ✅ Error được log vào console
- ✅ Toast error message hiển thị
- ✅ Ứng dụng không bị crash

---

### Test Case 6.2: Unhandled Promise Rejection
**Mục đích:** Kiểm tra xử lý unhandled promise rejection

**Preconditions:**
- Ứng dụng đang chạy

**Steps:**
1. Simulate một promise rejection không được catch

**Expected Results:**
- ✅ Error được log vào console
- ✅ Toast error message hiển thị
- ✅ Ứng dụng không bị crash

---

### Test Case 6.3: Network Error với Retry
**Mục đích:** Kiểm tra retry mechanism khi network error

**Preconditions:**
- Disconnect network
- User đã đăng nhập

**Steps:**
1. Click "💾 Lưu"
2. Quan sát retry behavior

**Expected Results:**
- ✅ Retry 2 lần với exponential backoff
- ✅ Hiển thị error message sau khi retry hết
- ✅ Loading state được remove

---

### Test Case 6.4: API Error Message
**Mục đích:** Kiểm tra error message từ API

**Preconditions:**
- API trả về error

**Steps:**
1. Trigger một API call sẽ fail
2. Quan sát error message

**Expected Results:**
- ✅ Error message hiển thị user-friendly
- ✅ Message không chứa technical details
- ✅ Toast tự động dismiss sau 5 giây

---

## 7. PERFORMANCE

### Test Case 7.1: Debounce Search
**Mục đích:** Kiểm tra debounce giảm số lần search

**Preconditions:**
- User đã đăng nhập

**Steps:**
1. Nhập 10 ký tự liên tiếp nhanh
2. Quan sát số lần search được thực hiện

**Expected Results:**
- ✅ Chỉ search 1 lần sau khi ngừng gõ 300ms
- ✅ Không search sau mỗi ký tự

---

### Test Case 7.2: Lazy Loading Images
**Mục đích:** Kiểm tra lazy loading images

**Preconditions:**
- Có images trong ứng dụng

**Steps:**
1. Scroll đến vùng có images
2. Quan sát khi images load

**Expected Results:**
- ✅ Images chỉ load khi vào viewport
- ✅ Không load tất cả images cùng lúc

---

### Test Case 7.3: RequestAnimationFrame
**Mục đích:** Kiểm tra smooth rendering

**Preconditions:**
- Có nhiều tasks cần render

**Steps:**
1. Load checklist với 100+ tasks
2. Quan sát rendering performance

**Expected Results:**
- ✅ Rendering smooth
- ✅ Không bị lag
- ✅ Sử dụng requestAnimationFrame

---

## 8. TOAST NOTIFICATIONS

### Test Case 8.1: Toast Success
**Mục đích:** Kiểm tra toast success message

**Preconditions:**
- User đã đăng nhập

**Steps:**
1. Lưu tasks thành công
2. Quan sát toast

**Expected Results:**
- ✅ Toast hiển thị với icon ✅
- ✅ Background màu xanh lá
- ✅ Tự động dismiss sau 3 giây
- ✅ Có animation slide in

---

### Test Case 8.2: Toast Error
**Mục đích:** Kiểm tra toast error message

**Preconditions:**
- User đã đăng nhập

**Steps:**
1. Trigger một error
2. Quan sát toast

**Expected Results:**
- ✅ Toast hiển thị với icon ❌
- ✅ Background màu đỏ
- ✅ Tự động dismiss sau 5 giây
- ✅ Có animation slide in

---

### Test Case 8.3: Toast Click to Dismiss
**Mục đích:** Kiểm tra click để dismiss toast

**Preconditions:**
- Toast đang hiển thị

**Steps:**
1. Click vào toast

**Expected Results:**
- ✅ Toast đóng ngay lập tức
- ✅ Có animation slide out

---

### Test Case 8.4: Multiple Toasts
**Mục đích:** Kiểm tra nhiều toasts cùng lúc

**Preconditions:**
- User đã đăng nhập

**Steps:**
1. Trigger nhiều actions liên tiếp (save, error, success)

**Expected Results:**
- ✅ Mỗi toast hiển thị riêng biệt
- ✅ Toasts stack vertically
- ✅ Mỗi toast có animation riêng

---

### Test Case 8.5: Toast Dark Mode
**Mục đích:** Kiểm tra toast trong dark mode

**Preconditions:**
- Đang ở dark mode

**Steps:**
1. Trigger một toast

**Expected Results:**
- ✅ Toast có màu phù hợp với dark mode
- ✅ Text readable
- ✅ Background có độ trong suốt phù hợp

---

## 📊 TEST SUMMARY

### Priority Levels:
- **P0 (Critical):** Test Case 1.1, 1.2, 2.1, 2.3, 4.1, 5.1, 6.1, 8.1
- **P1 (High):** Test Case 1.3, 1.4, 2.2, 2.5, 3.1, 3.2, 4.2, 5.2, 6.3, 7.1
- **P2 (Medium):** Test Case 2.4, 2.6, 2.7, 3.3, 3.4, 4.3, 5.3, 7.2, 8.2
- **P3 (Low):** Test Case 2.8, 3.5, 3.6, 3.7, 4.4, 4.5, 5.4, 5.5, 5.6, 6.2, 6.4, 7.3, 8.3, 8.4, 8.5

### Test Coverage:
- ✅ Loading States: 4 test cases
- ✅ Global Search: 8 test cases
- ✅ Mobile Optimization: 7 test cases
- ✅ Accessibility: 5 test cases
- ✅ Modal System: 6 test cases
- ✅ Error Handling: 4 test cases
- ✅ Performance: 3 test cases
- ✅ Toast Notifications: 5 test cases

**Total: 42 test cases**

---

## 🎯 TEST EXECUTION CHECKLIST

### Before Testing:
- [ ] Setup test environment
- [ ] Prepare test data
- [ ] Clear browser cache
- [ ] Open browser DevTools

### During Testing:
- [ ] Execute each test case
- [ ] Document results (Pass/Fail)
- [ ] Screenshot issues
- [ ] Log errors

### After Testing:
- [ ] Review all results
- [ ] Create bug reports for failures
- [ ] Update test documentation
- [ ] Plan fixes

---

**Last Updated:** 2024-01-XX
**Version:** 1.0.0





