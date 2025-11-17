# 🎨 VIDEO DEMO STORYBOARD

## 📋 TỔNG QUAN

Storyboard chi tiết cho từng scene trong video demo, bao gồm visual elements, timing, và narration.

---

## VIDEO 1: LOADING STATES & TOAST NOTIFICATIONS

### Scene 1: Introduction
**Timing:** 0:00 - 0:15 (15 seconds)

**Visual:**
```
[Screen: Application interface]
- Topbar visible
- Main content area
- Sidebar visible
- Highlight: Topbar và main content với subtle glow
```

**Narration:**
> "Xin chào! Hôm nay chúng ta sẽ xem các tính năng mới của SPX Daily Checklist. Bắt đầu với Loading States và Toast Notifications - hai tính năng giúp cải thiện trải nghiệm người dùng."

**Text Overlay:**
- "Loading States & Toast Notifications"

---

### Scene 2: Button Loading State
**Timing:** 0:15 - 0:45 (30 seconds)

**Visual:**
```
[Screen: Checklist tab]
- Show "💾 Lưu" button
- Cursor moves to button
- Click button
- Button changes:
  * Disabled state
  * Spinner appears (animated)
  * Text changes to "Đang lưu..."
- Wait 2 seconds
- Button restores:
  * Enabled state
  * Spinner disappears
  * Text back to "💾 Lưu"
```

**Narration:**
> "Khi bạn click vào button Lưu, bạn sẽ thấy button hiển thị loading state với spinner animation và text 'Đang lưu...'. Điều này giúp người dùng biết rằng hệ thống đang xử lý yêu cầu của họ. Sau khi lưu xong, button tự động trở về trạng thái ban đầu."

**Text Overlay:**
- "Button Loading State"
- Arrow pointing to spinner
- Highlight button state changes

---

### Scene 3: Loading Overlay
**Timing:** 0:45 - 1:15 (30 seconds)

**Visual:**
```
[Screen: Application]
- Click on "⚙️ Admin" tab
- Screen dims with backdrop blur
- Overlay appears:
  * Centered modal
  * Spinner (large, animated)
  * Text: "Đang tải danh sách users..."
- Wait 2 seconds
- Overlay disappears
- Users table appears
```

**Narration:**
> "Đối với các thao tác dài hơn, chúng ta sử dụng loading overlay toàn màn hình. Khi bạn vào Admin tab, bạn sẽ thấy overlay với backdrop blur và spinner animation. Overlay này đảm bảo người dùng biết rằng hệ thống đang xử lý và không thể tương tác với các phần khác của ứng dụng."

**Text Overlay:**
- "Loading Overlay"
- Highlight: Backdrop blur effect
- Highlight: Spinner animation

---

### Scene 4: Toast Notifications
**Timing:** 1:15 - 2:30 (75 seconds)

**Visual:**
```
[Screen: Application]

Part 1: Success Toast (0:00 - 0:20)
- Save tasks successfully
- Toast slides in from right:
  * Green background
  * ✅ Icon
  * Text: "Đã lưu thành công!"
- Auto-dismiss after 3 seconds

Part 2: Error Toast (0:20 - 0:40)
- Trigger error (disconnect network)
- Toast slides in:
  * Red background
  * ❌ Icon
  * Text: "Lỗi: Không thể kết nối đến server"
- Auto-dismiss after 5 seconds

Part 3: Warning Toast (0:40 - 1:00)
- Trigger warning
- Toast slides in:
  * Orange background
  * ⚠️ Icon
  * Text: "Cảnh báo: Vui lòng kiểm tra lại"
- Auto-dismiss after 4 seconds

Part 4: Info Toast (1:00 - 1:15)
- Trigger info
- Toast slides in:
  * Blue background
  * ℹ️ Icon
  * Text: "Thông tin: Đã cập nhật"
- Auto-dismiss after 3 seconds

Part 5: Click to Dismiss (1:15 - 1:30)
- Show toast
- Cursor clicks on toast
- Toast immediately dismisses

Part 6: Multiple Toasts (1:30 - 1:45)
- Trigger multiple actions quickly
- Show 3-4 toasts stacking vertically
- Each dismisses independently
```

**Narration:**
> "Toast notifications cung cấp feedback ngay lập tức cho người dùng. Chúng ta có 4 loại toast: Success với icon checkmark màu xanh, Error với icon X màu đỏ, Warning màu cam, và Info màu xanh dương. Mỗi toast có animation slide in từ bên phải và tự động dismiss sau vài giây. Bạn cũng có thể click vào toast để đóng ngay lập tức. Khi có nhiều toasts, chúng sẽ stack lại với nhau một cách gọn gàng."

**Text Overlay:**
- "Toast Types: Success, Error, Warning, Info"
- Highlight: Icons và colors
- Highlight: Stacking behavior

---

### Scene 5: Summary
**Timing:** 2:30 - 2:45 (15 seconds)

**Visual:**
```
[Screen: Application]
- Quick montage:
  * Button loading
  * Overlay loading
  * Success toast
  * Error toast
```

**Narration:**
> "Đó là Loading States và Toast Notifications. Những tính năng này giúp người dùng luôn biết trạng thái của hệ thống và nhận được feedback rõ ràng cho mọi hành động."

**Text Overlay:**
- "Loading States & Toast Notifications"
- "Improved User Experience"

---

## VIDEO 2: GLOBAL SEARCH

### Scene 1: Introduction
**Timing:** 0:00 - 0:10 (10 seconds)

**Visual:**
```
[Screen: Application topbar]
- Highlight search box
- Zoom in on search box
```

**Narration:**
> "Tính năng Global Search cho phép bạn tìm kiếm tasks nhanh chóng trong toàn bộ checklist."

**Text Overlay:**
- "Global Search"

---

### Scene 2: Basic Search
**Timing:** 0:10 - 0:50 (40 seconds)

**Visual:**
```
[Screen: Search box]
- Click on search box
- Type "Kiểm tra" slowly:
  * Type "K" → wait
  * Type "i" → wait
  * Type "ểm tra" → wait 300ms
- Search results appear:
  * Dropdown below search box
  * "Tìm thấy 3 kết quả"
  * List of tasks:
    - ✅ Task 1 (Đầu Ca)
    - ⏳ Task 2 (Trong Ca)
    - ✅ Task 3 (Cuối Ca)
```

**Narration:**
> "Bạn chỉ cần nhập text vào search box. Hệ thống sẽ tự động tìm kiếm sau khi bạn ngừng gõ 300ms - điều này giúp giảm số lần tìm kiếm không cần thiết. Kết quả hiển thị với status icon, category badge, và số lượng kết quả tìm được."

**Text Overlay:**
- "Debounce: 300ms"
- Highlight: Status icons
- Highlight: Category badges

---

### Scene 3: Search Results Click
**Timing:** 0:50 - 1:30 (40 seconds)

**Visual:**
```
[Screen: Search results]
- Hover over a result
- Click on result
- Screen transitions:
  * Switch to Checklist tab
  * Smooth scroll to task
  * Task highlighted (orange background)
- Wait 2 seconds
- Highlight fades out
- Search box cleared
- Results closed
```

**Narration:**
> "Khi bạn click vào một kết quả, ứng dụng sẽ tự động chuyển sang Checklist tab, scroll đến task tương ứng với smooth animation, và highlight task đó. Highlight sẽ tự động mất sau 2 giây, giúp bạn dễ dàng tìm thấy task bạn đang tìm."

**Text Overlay:**
- "Auto-scroll to Task"
- Highlight: Smooth animation
- Highlight: Task highlight

---

### Scene 4: Search Features
**Timing:** 1:30 - 2:20 (50 seconds)

**Visual:**
```
Part 1: Search by Category (0:00 - 0:15)
- Type "Đầu Ca"
- Show all tasks in "Đầu Ca" category

Part 2: Special Characters (0:15 - 0:30)
- Type "Task's & Items"
- Show results (no errors)

Part 3: Empty Results (0:30 - 0:40)
- Type "XYZ123ABC"
- Show "Không tìm thấy kết quả"

Part 4: Keyboard Navigation (0:40 - 0:50)
- Press Escape
- Results close
- Search box blur
```

**Narration:**
> "Bạn có thể tìm kiếm theo cả text và category. Hệ thống cũng xử lý tốt các ký tự đặc biệt. Nếu không tìm thấy kết quả, bạn sẽ thấy message thông báo. Bạn có thể đóng search results bằng cách nhấn Escape hoặc click bên ngoài."

**Text Overlay:**
- "Search by Category"
- "Special Characters Support"
- "Keyboard Navigation"

---

### Scene 5: Summary
**Timing:** 2:20 - 2:30 (10 seconds)

**Visual:**
```
[Screen: Search box]
- Quick montage of search features
```

**Narration:**
> "Global Search giúp bạn tìm kiếm tasks một cách nhanh chóng và hiệu quả."

**Text Overlay:**
- "Global Search"
- "Fast & Efficient"

---

## VIDEO 3: MOBILE OPTIMIZATION

### Scene 1: Introduction
**Timing:** 0:00 - 0:10 (10 seconds)

**Visual:**
```
[Screen: Desktop view]
- Show full desktop layout
- Resize animation to mobile
```

**Narration:**
> "Ứng dụng được tối ưu hóa hoàn toàn cho thiết bị di động."

**Text Overlay:**
- "Mobile Optimization"

---

### Scene 2: Responsive Layout
**Timing:** 0:10 - 1:00 (50 seconds)

**Visual:**
```
[Screen: Resize animation]
- Start: Desktop view (1920px)
- Resize to 900px:
  * Sidebar moves to top (horizontal)
  * Sidebar max-height: 50vh
  * Sidebar scrollable
- Resize to 768px:
  * Topbar wraps
  * Global search full-width
  * Tabs scrollable horizontally
- Resize to 480px:
  * Compact layout
  * Smaller fonts
  * Reduced padding
```

**Narration:**
> "Khi bạn mở ứng dụng trên mobile hoặc resize browser nhỏ hơn 900px, layout tự động điều chỉnh. Sidebar chuyển thành horizontal layout ở trên cùng, topbar wrap để phù hợp với màn hình nhỏ, và global search chiếm toàn bộ chiều rộng. Tabs cũng có thể scroll ngang để dễ dàng truy cập."

**Text Overlay:**
- "Responsive Breakpoints"
- "900px, 768px, 480px"
- Highlight: Layout changes

---

### Scene 3: Touch-Friendly UI
**Timing:** 1:00 - 1:45 (45 seconds)

**Visual:**
```
[Screen: Mobile view]
- Show buttons with measurement overlay (44x44px)
- Show checkboxes with measurement (24x24px)
- Show items with increased padding
- Tap on buttons (show touch feedback)
- Tap on checkboxes
- Scroll through items
```

**Narration:**
> "Tất cả các interactive elements được thiết kế với kích thước tối thiểu 44x44 pixels - đây là kích thước được khuyến nghị cho touch interfaces. Checkboxes được làm lớn hơn, và items có padding lớn hơn để dễ dàng tap."

**Text Overlay:**
- "Touch-Friendly: 44x44px minimum"
- Highlight: Button sizes
- Highlight: Checkbox sizes

---

### Scene 4: Mobile Tables
**Timing:** 1:45 - 2:15 (30 seconds)

**Visual:**
```
[Screen: Reports tab on mobile]
- Show table
- Horizontal scroll gesture
- Smooth scrolling
- Show all columns accessible
```

**Narration:**
> "Tables trên mobile có thể scroll ngang một cách mượt mà, đảm bảo bạn có thể xem tất cả dữ liệu mà không bị mất thông tin."

**Text Overlay:**
- "Horizontal Scroll"
- Highlight: Smooth scrolling

---

### Scene 5: Orientation Change
**Timing:** 2:15 - 2:30 (15 seconds)

**Visual:**
```
[Screen: Mobile device]
- Portrait mode
- Rotate to landscape
- Layout adjusts automatically
- Sidebar max-height: 40vh
```

**Narration:**
> "Ứng dụng tự động điều chỉnh layout khi bạn xoay màn hình, đảm bảo trải nghiệm tốt nhất ở cả portrait và landscape mode."

**Text Overlay:**
- "Orientation Support"
- "Portrait & Landscape"

---

## VIDEO 4: ACCESSIBILITY & KEYBOARD NAVIGATION

### Scene 1: Introduction
**Timing:** 0:00 - 0:10 (10 seconds)

**Visual:**
```
[Screen: Application interface]
- Show keyboard icon overlay
```

**Narration:**
> "Ứng dụng được thiết kế với accessibility là ưu tiên hàng đầu, tuân thủ WCAG 2.1 AA standards."

**Text Overlay:**
- "Accessibility"
- "WCAG 2.1 AA Compliant"

---

### Scene 2: ARIA Labels
**Timing:** 0:10 - 0:40 (30 seconds)

**Visual:**
```
[Screen: DevTools open]
- Inspect search input
- Highlight: aria-label="Tìm kiếm tasks"
- Highlight: role="searchbox"
- Inspect button
- Highlight: aria-label="Lưu tasks"
- Inspect modal
- Highlight: role="dialog"
- Highlight: aria-modal="true"
```

**Narration:**
> "Tất cả các interactive elements đều có ARIA labels và roles phù hợp. Điều này giúp screen readers có thể đọc và hiểu được các elements, cải thiện trải nghiệm cho người dùng khiếm thị."

**Text Overlay:**
- "ARIA Labels & Roles"
- Highlight: Accessibility attributes

---

### Scene 3: Keyboard Navigation - Tabs
**Timing:** 0:40 - 1:20 (40 seconds)

**Visual:**
```
[Screen: Tabs]
- Focus indicator on first tab
- Press Arrow Right → Focus moves to next tab
- Tab activates
- Press Arrow Left → Focus moves to previous tab
- Press Home → Focus jumps to first tab
- Press End → Focus jumps to last tab
```

**Narration:**
> "Bạn có thể điều hướng giữa các tabs hoàn toàn bằng keyboard. Arrow Right và Arrow Left để di chuyển giữa các tabs, Home để về tab đầu tiên, và End để đến tab cuối cùng. Tab sẽ tự động activate khi được focus."

**Text Overlay:**
- "Keyboard Navigation"
- "Arrow Keys, Home, End"
- Highlight: Focus indicator

---

### Scene 4: Keyboard Navigation - Modal
**Timing:** 1:20 - 2:00 (40 seconds)

**Visual:**
```
[Screen: Modal]
- Open modal
- Focus on first element (highlighted)
- Tab through elements:
  * Element 1 → Element 2 → Element 3
- Tab at last element → Focus cycles to first
- Shift+Tab → Focus moves backward
- Press Escape → Modal closes
- Focus returns to trigger button
```

**Narration:**
> "Trong modals, focus được trap bên trong modal. Bạn có thể Tab để di chuyển giữa các elements, và Shift+Tab để quay ngược lại. Nhấn Escape để đóng modal, và focus sẽ quay về element đã trigger modal."

**Text Overlay:**
- "Focus Trap"
- "Tab, Shift+Tab, Escape"
- Highlight: Focus cycling

---

### Scene 5: Screen Reader Demo
**Timing:** 2:00 - 2:30 (30 seconds)

**Visual:**
```
[Screen: Application with screen reader overlay]
- Show screen reader reading labels
- Navigate through application
- Show announcements
```

**Narration:**
> "Với screen reader, người dùng khiếm thị có thể điều hướng và sử dụng ứng dụng một cách độc lập. Screen reader sẽ đọc các labels, roles, và trạng thái của các elements."

**Text Overlay:**
- "Screen Reader Support"
- "NVDA, JAWS, VoiceOver"

---

## VIDEO 5: MODAL SYSTEM

### Scene 1: Introduction
**Timing:** 0:00 - 0:10 (10 seconds)

**Visual:**
```
[Screen: Application interface]
```

**Narration:**
> "Hệ thống modal được nâng cấp với nhiều tính năng mới."

**Text Overlay:**
- "Enhanced Modal System"

---

### Scene 2: Modal Open
**Timing:** 0:10 - 0:40 (30 seconds)

**Visual:**
```
[Screen: Checklist]
- Click task info icon (💡)
- Screen dims with backdrop blur
- Modal appears:
  * Centered
  * Close button (×) top right
  * Focus on first element (highlighted)
- Show body scroll disabled (try to scroll)
```

**Narration:**
> "Khi mở modal, bạn sẽ thấy backdrop blur effect tạo cảm giác depth. Modal tự động có close button ở góc trên bên phải, và focus tự động vào element đầu tiên. Body scroll được disable để tránh confusion."

**Text Overlay:**
- "Backdrop Blur"
- "Auto Focus"
- "Body Scroll Prevention"

---

### Scene 3: Modal Close Methods
**Timing:** 0:40 - 1:20 (40 seconds)

**Visual:**
```
Part 1: Close Button (0:00 - 0:15)
- Click close button (×)
- Modal closes
- Body scroll restored

Part 2: Backdrop Click (0:15 - 0:30)
- Open modal again
- Click on backdrop
- Modal closes

Part 3: Escape Key (0:30 - 0:40)
- Open modal again
- Press Escape
- Modal closes
```

**Narration:**
> "Bạn có thể đóng modal bằng 3 cách: click vào close button, click vào backdrop, hoặc nhấn Escape key. Khi modal đóng, body scroll được restore tự động."

**Text Overlay:**
- "3 Ways to Close"
- "Button, Backdrop, Escape"

---

### Scene 4: Focus Trap
**Timing:** 1:20 - 1:50 (30 seconds)

**Visual:**
```
[Screen: Modal with form]
- Tab through elements:
  * Input 1 → Input 2 → Button
- Tab at last element
- Focus cycles to first element
- Try to Tab outside (cannot)
- Shift+Tab cycles backward
```

**Narration:**
> "Focus được trap bên trong modal. Khi bạn Tab đến element cuối cùng và Tab thêm một lần nữa, focus sẽ quay về element đầu tiên. Điều này đảm bảo người dùng keyboard không thể focus ra ngoài modal."

**Text Overlay:**
- "Focus Trap"
- Highlight: Focus cycling

---

### Scene 5: Responsive Modal
**Timing:** 1:50 - 2:00 (10 seconds)

**Visual:**
```
[Screen: Modal]
- Resize browser to mobile
- Modal width adjusts to 90vw
- Still looks good
```

**Narration:**
> "Modal tự động responsive, width sẽ adjust để phù hợp với màn hình nhỏ."

**Text Overlay:**
- "Responsive Design"
- "90vw on mobile"

---

## VIDEO 6: ERROR HANDLING & RETRY

### Scene 1: Introduction
**Timing:** 0:00 - 0:10 (10 seconds)

**Visual:**
```
[Screen: Application interface]
```

**Narration:**
> "Hệ thống xử lý lỗi được cải thiện với retry mechanism và user-friendly messages."

**Text Overlay:**
- "Error Handling & Retry"

---

### Scene 2: Global Error Handler
**Timing:** 0:10 - 0:40 (30 seconds)

**Visual:**
```
[Screen: Application]
- Open DevTools console
- Trigger JavaScript error (via console)
- Error toast appears
- Console shows error log
- Application continues working
- Try to use app (still functional)
```

**Narration:**
> "Khi có lỗi JavaScript xảy ra, global error handler sẽ catch lỗi, log vào console để debug, và hiển thị user-friendly message. Ứng dụng không bị crash và vẫn tiếp tục hoạt động."

**Text Overlay:**
- "Global Error Handler"
- "No Application Crash"

---

### Scene 3: Network Error với Retry
**Timing:** 0:40 - 1:40 (60 seconds)

**Visual:**
```
[Screen: Network tab in DevTools]
- Disconnect network (offline mode)
- Click "💾 Lưu"
- Button shows loading state
- Console shows retry attempts:
  * Attempt 1: Immediate
  * Attempt 2: After 1 second
  * Attempt 3: After 2 seconds
- Error toast appears after retries exhausted
- Reconnect network
- Click "💾 Lưu" again
- Success after retry
```

**Narration:**
> "Khi có network error, hệ thống sẽ tự động retry với exponential backoff. Bạn sẽ thấy loading state trong khi retry. Sau khi retry hết số lần cho phép, error message sẽ hiển thị. Khi network được restore, request sẽ thành công."

**Text Overlay:**
- "Automatic Retry"
- "Exponential Backoff"
- Highlight: Retry attempts

---

### Scene 4: API Error Messages
**Timing:** 1:40 - 2:10 (30 seconds)

**Visual:**
```
[Screen: Application]
- Trigger API error
- User-friendly error toast appears
- Toast type: Error (red)
- Auto-dismiss after 5 seconds
```

**Narration:**
> "Tất cả error messages đều user-friendly, không chứa technical details. Error toast tự động dismiss sau 5 giây, đủ thời gian để người dùng đọc."

**Text Overlay:**
- "User-Friendly Messages"
- "No Technical Details"

---

### Scene 5: Unhandled Promise Rejection
**Timing:** 2:10 - 2:30 (20 seconds)

**Visual:**
```
[Screen: Application]
- Trigger unhandled promise rejection
- Error handler catches it
- Toast message appears
```

**Narration:**
> "Unhandled promise rejections cũng được catch và xử lý, đảm bảo không có errors nào bị bỏ sót."

**Text Overlay:**
- "Comprehensive Error Handling"

---

## PRODUCTION NOTES

### Visual Effects
- Use subtle animations
- Highlight important elements
- Use smooth transitions
- Add measurement overlays where needed

### Text Overlays
- Use clear, readable fonts
- Position strategically
- Don't obstruct important UI
- Use consistent styling

### Timing
- Allow time for animations
- Pause for emphasis
- Don't rush through features
- Keep videos concise (2-3 min)

---

**Last Updated:** 2024-01-XX
**Version:** 1.0.0





