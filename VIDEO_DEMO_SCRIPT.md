# 🎬 VIDEO DEMO SCRIPT - HƯỚNG DẪN QUAY VIDEO

## 📋 MỤC LỤC
1. [Tổng quan](#tổng-quan)
2. [Chuẩn bị](#chuẩn-bị)
3. [Video 1: Loading States & Toast Notifications](#video-1-loading-states--toast-notifications)
4. [Video 2: Global Search](#video-2-global-search)
5. [Video 3: Mobile Optimization](#video-3-mobile-optimization)
6. [Video 4: Accessibility & Keyboard Navigation](#video-4-accessibility--keyboard-navigation)
7. [Video 5: Modal System](#video-5-modal-system)
8. [Video 6: Error Handling & Retry](#video-6-error-handling--retry)
9. [Tips & Best Practices](#tips--best-practices)

---

## TỔNG QUAN

### Video Structure
- **6 videos ngắn** (2-3 phút mỗi video)
- **1 video tổng hợp** (5-7 phút)
- **Format:** Screen recording với narration

### Tools Recommended
- **Screen Recording:** OBS Studio, Camtasia, Loom, QuickTime (Mac)
- **Editing:** DaVinci Resolve (Free), Adobe Premiere, Camtasia
- **Microphone:** USB mic hoặc headset mic

---

## CHUẨN BỊ

### Pre-Recording Checklist
- [ ] Clear browser cache
- [ ] Prepare test data (tasks, users, etc.)
- [ ] Close unnecessary applications
- [ ] Set screen resolution: 1920x1080 (Full HD)
- [ ] Test microphone
- [ ] Test screen recording software
- [ ] Prepare script/narration

### Test Data Setup
```javascript
// Cần có:
- 10-15 tasks trong checklist
- Tasks với các categories khác nhau
- Một số tasks đã completed
- Test user với admin role
- Network có thể disconnect để test error handling
```

---

## VIDEO 1: LOADING STATES & TOAST NOTIFICATIONS

### Duration: 2-3 minutes

### Scene 1: Introduction (0:00 - 0:15)
**Visual:**
- Show application interface
- Highlight topbar và main content

**Narration:**
> "Xin chào! Hôm nay chúng ta sẽ xem các tính năng mới của SPX Daily Checklist. Bắt đầu với Loading States và Toast Notifications - hai tính năng giúp cải thiện trải nghiệm người dùng."

---

### Scene 2: Button Loading State (0:15 - 0:45)
**Visual:**
1. Click vào button "💾 Lưu"
2. Show button với spinner và text "Đang lưu..."
3. Wait for save to complete
4. Show button trở về trạng thái ban đầu

**Narration:**
> "Khi bạn click vào button Lưu, bạn sẽ thấy button hiển thị loading state với spinner animation và text 'Đang lưu...'. Điều này giúp người dùng biết rằng hệ thống đang xử lý yêu cầu của họ. Sau khi lưu xong, button tự động trở về trạng thái ban đầu."

**Key Points:**
- ✅ Button disabled khi loading
- ✅ Spinner animation
- ✅ Text thay đổi
- ✅ Auto-restore

---

### Scene 3: Loading Overlay (0:45 - 1:15)
**Visual:**
1. Navigate to Admin tab
2. Show loading overlay khi load users
3. Show spinner và message "Đang tải danh sách users..."
4. Show overlay disappear khi load xong

**Narration:**
> "Đối với các thao tác dài hơn, chúng ta sử dụng loading overlay toàn màn hình. Khi bạn vào Admin tab, bạn sẽ thấy overlay với backdrop blur và spinner animation. Overlay này đảm bảo người dùng biết rằng hệ thống đang xử lý và không thể tương tác với các phần khác của ứng dụng."

**Key Points:**
- ✅ Full-screen overlay
- ✅ Backdrop blur
- ✅ Spinner animation
- ✅ Clear message

---

### Scene 4: Toast Notifications (1:15 - 2:30)
**Visual:**
1. Save tasks successfully → Show success toast (✅)
2. Trigger an error → Show error toast (❌)
3. Show warning toast (⚠️)
4. Show info toast (ℹ️)
5. Click on toast to dismiss
6. Show multiple toasts stacking

**Narration:**
> "Toast notifications cung cấp feedback ngay lập tức cho người dùng. Chúng ta có 4 loại toast: Success với icon checkmark màu xanh, Error với icon X màu đỏ, Warning màu cam, và Info màu xanh dương. Mỗi toast có animation slide in từ bên phải và tự động dismiss sau vài giây. Bạn cũng có thể click vào toast để đóng ngay lập tức. Khi có nhiều toasts, chúng sẽ stack lại với nhau một cách gọn gàng."

**Key Points:**
- ✅ 4 types: success, error, warning, info
- ✅ Icons và colors
- ✅ Auto-dismiss
- ✅ Click to dismiss
- ✅ Stacking

---

### Scene 5: Summary (2:30 - 2:45)
**Visual:**
- Show all features briefly

**Narration:**
> "Đó là Loading States và Toast Notifications. Những tính năng này giúp người dùng luôn biết trạng thái của hệ thống và nhận được feedback rõ ràng cho mọi hành động."

---

## VIDEO 2: GLOBAL SEARCH

### Duration: 2-3 minutes

### Scene 1: Introduction (0:00 - 0:10)
**Visual:**
- Show search box trong topbar

**Narration:**
> "Tính năng Global Search cho phép bạn tìm kiếm tasks nhanh chóng trong toàn bộ checklist."

---

### Scene 2: Basic Search (0:10 - 0:50)
**Visual:**
1. Click vào search box
2. Type "Kiểm tra" (slowly, showing debounce)
3. Show results appearing after 300ms
4. Show results với status icons và category badges
5. Show "Tìm thấy X kết quả"

**Narration:**
> "Bạn chỉ cần nhập text vào search box. Hệ thống sẽ tự động tìm kiếm sau khi bạn ngừng gõ 300ms - điều này giúp giảm số lần tìm kiếm không cần thiết. Kết quả hiển thị với status icon, category badge, và số lượng kết quả tìm được."

**Key Points:**
- ✅ Debounce 300ms
- ✅ Real-time search
- ✅ Status icons
- ✅ Category badges

---

### Scene 3: Search Results Click (0:50 - 1:30)
**Visual:**
1. Click vào một kết quả trong search results
2. Show switching to Checklist tab
3. Show smooth scroll to task
4. Show task highlighted với background color
5. Show highlight fade out after 2 seconds

**Narration:**
> "Khi bạn click vào một kết quả, ứng dụng sẽ tự động chuyển sang Checklist tab, scroll đến task tương ứng với smooth animation, và highlight task đó. Highlight sẽ tự động mất sau 2 giây, giúp bạn dễ dàng tìm thấy task bạn đang tìm."

**Key Points:**
- ✅ Auto-switch tab
- ✅ Smooth scroll
- ✅ Highlight task
- ✅ Auto-remove highlight

---

### Scene 4: Search Features (1:30 - 2:20)
**Visual:**
1. Search với category name
2. Search với special characters
3. Search empty results
4. Press Escape to close
5. Click outside to close

**Narration:**
> "Bạn có thể tìm kiếm theo cả text và category. Hệ thống cũng xử lý tốt các ký tự đặc biệt. Nếu không tìm thấy kết quả, bạn sẽ thấy message thông báo. Bạn có thể đóng search results bằng cách nhấn Escape hoặc click bên ngoài."

**Key Points:**
- ✅ Search by category
- ✅ Special characters support
- ✅ Empty results handling
- ✅ Keyboard navigation
- ✅ Click outside to close

---

### Scene 5: Summary (2:20 - 2:30)
**Visual:**
- Show search box

**Narration:**
> "Global Search giúp bạn tìm kiếm tasks một cách nhanh chóng và hiệu quả."

---

## VIDEO 3: MOBILE OPTIMIZATION

### Duration: 2-3 minutes

### Scene 1: Introduction (0:00 - 0:10)
**Visual:**
- Show desktop view
- Resize to mobile view

**Narration:**
> "Ứng dụng được tối ưu hóa hoàn toàn cho thiết bị di động."

---

### Scene 2: Responsive Layout (0:10 - 1:00)
**Visual:**
1. Show desktop layout
2. Resize browser to mobile (< 900px)
3. Show sidebar chuyển thành horizontal
4. Show topbar wrap
5. Show global search full-width
6. Show tabs scrollable

**Narration:**
> "Khi bạn mở ứng dụng trên mobile hoặc resize browser nhỏ hơn 900px, layout tự động điều chỉnh. Sidebar chuyển thành horizontal layout ở trên cùng, topbar wrap để phù hợp với màn hình nhỏ, và global search chiếm toàn bộ chiều rộng. Tabs cũng có thể scroll ngang để dễ dàng truy cập."

**Key Points:**
- ✅ Responsive breakpoints
- ✅ Sidebar horizontal
- ✅ Topbar wrap
- ✅ Full-width search
- ✅ Scrollable tabs

---

### Scene 3: Touch-Friendly UI (1:00 - 1:45)
**Visual:**
1. Show buttons với size 44x44px minimum
2. Show checkboxes 24x24px
3. Show items với padding lớn hơn
4. Tap on buttons để show easy interaction

**Narration:**
> "Tất cả các interactive elements được thiết kế với kích thước tối thiểu 44x44 pixels - đây là kích thước được khuyến nghị cho touch interfaces. Checkboxes được làm lớn hơn, và items có padding lớn hơn để dễ dàng tap."

**Key Points:**
- ✅ 44x44px minimum buttons
- ✅ 24x24px checkboxes
- ✅ Increased padding
- ✅ Touch-friendly

---

### Scene 4: Mobile Tables (1:45 - 2:15)
**Visual:**
1. Navigate to Reports tab
2. Show table scrollable horizontally
3. Show smooth scrolling với touch

**Narration:**
> "Tables trên mobile có thể scroll ngang một cách mượt mà, đảm bảo bạn có thể xem tất cả dữ liệu mà không bị mất thông tin."

**Key Points:**
- ✅ Horizontal scroll
- ✅ Smooth touch scrolling
- ✅ No overflow

---

### Scene 5: Orientation Change (2:15 - 2:30)
**Visual:**
1. Rotate device/browser (portrait → landscape)
2. Show layout adjust automatically

**Narration:**
> "Ứng dụng tự động điều chỉnh layout khi bạn xoay màn hình, đảm bảo trải nghiệm tốt nhất ở cả portrait và landscape mode."

**Key Points:**
- ✅ Auto-adjust layout
- ✅ Portrait & landscape support

---

## VIDEO 4: ACCESSIBILITY & KEYBOARD NAVIGATION

### Duration: 2-3 minutes

### Scene 1: Introduction (0:00 - 0:10)
**Visual:**
- Show application interface

**Narration:**
> "Ứng dụng được thiết kế với accessibility là ưu tiên hàng đầu, tuân thủ WCAG 2.1 AA standards."

---

### Scene 2: ARIA Labels (0:10 - 0:40)
**Visual:**
1. Inspect search input → Show aria-label
2. Inspect buttons → Show aria-labels
3. Inspect modals → Show role="dialog"

**Narration:**
> "Tất cả các interactive elements đều có ARIA labels và roles phù hợp. Điều này giúp screen readers có thể đọc và hiểu được các elements, cải thiện trải nghiệm cho người dùng khiếm thị."

**Key Points:**
- ✅ ARIA labels
- ✅ Roles
- ✅ Screen reader support

---

### Scene 3: Keyboard Navigation - Tabs (0:40 - 1:20)
**Visual:**
1. Focus vào tab đầu tiên
2. Press Arrow Right → Move to next tab
3. Press Arrow Left → Move to previous tab
4. Press Home → Jump to first tab
5. Press End → Jump to last tab

**Narration:**
> "Bạn có thể điều hướng giữa các tabs hoàn toàn bằng keyboard. Arrow Right và Arrow Left để di chuyển giữa các tabs, Home để về tab đầu tiên, và End để đến tab cuối cùng. Tab sẽ tự động activate khi được focus."

**Key Points:**
- ✅ Arrow keys navigation
- ✅ Home/End keys
- ✅ Auto-activate on focus

---

### Scene 4: Keyboard Navigation - Modal (1:20 - 2:00)
**Visual:**
1. Open a modal
2. Show focus trap (Tab cycles within modal)
3. Press Escape to close
4. Show focus returns to trigger element

**Narration:**
> "Trong modals, focus được trap bên trong modal. Bạn có thể Tab để di chuyển giữa các elements, và Shift+Tab để quay ngược lại. Nhấn Escape để đóng modal, và focus sẽ quay về element đã trigger modal."

**Key Points:**
- ✅ Focus trap
- ✅ Tab navigation
- ✅ Escape to close
- ✅ Focus management

---

### Scene 5: Screen Reader Demo (2:00 - 2:30)
**Visual:**
1. Enable screen reader (NVDA/JAWS/VoiceOver)
2. Navigate through application
3. Show screen reader reading labels

**Narration:**
> "Với screen reader, người dùng khiếm thị có thể điều hướng và sử dụng ứng dụng một cách độc lập. Screen reader sẽ đọc các labels, roles, và trạng thái của các elements."

**Key Points:**
- ✅ Screen reader compatible
- ✅ Clear labels
- ✅ Status announcements

---

## VIDEO 5: MODAL SYSTEM

### Duration: 2 minutes

### Scene 1: Introduction (0:00 - 0:10)
**Visual:**
- Show application interface

**Narration:**
> "Hệ thống modal được nâng cấp với nhiều tính năng mới."

---

### Scene 2: Modal Open (0:10 - 0:40)
**Visual:**
1. Click task info icon (💡)
2. Show modal với backdrop blur
3. Show close button (×)
4. Show focus auto-focus vào first element
5. Show body scroll disabled

**Narration:**
> "Khi mở modal, bạn sẽ thấy backdrop blur effect tạo cảm giác depth. Modal tự động có close button ở góc trên bên phải, và focus tự động vào element đầu tiên. Body scroll được disable để tránh confusion."

**Key Points:**
- ✅ Backdrop blur
- ✅ Auto close button
- ✅ Auto focus
- ✅ Body scroll prevention

---

### Scene 3: Modal Close Methods (0:40 - 1:20)
**Visual:**
1. Close bằng close button
2. Close bằng clicking backdrop
3. Close bằng Escape key
4. Show body scroll restored

**Narration:**
> "Bạn có thể đóng modal bằng 3 cách: click vào close button, click vào backdrop, hoặc nhấn Escape key. Khi modal đóng, body scroll được restore tự động."

**Key Points:**
- ✅ 3 ways to close
- ✅ Body scroll restored

---

### Scene 4: Focus Trap (1:20 - 1:50)
**Visual:**
1. Open modal với form
2. Tab through elements
3. Show focus cycles within modal
4. Show cannot Tab outside modal

**Narration:**
> "Focus được trap bên trong modal. Khi bạn Tab đến element cuối cùng và Tab thêm một lần nữa, focus sẽ quay về element đầu tiên. Điều này đảm bảo người dùng keyboard không thể focus ra ngoài modal."

**Key Points:**
- ✅ Focus trap
- ✅ Cycle focus
- ✅ Cannot escape

---

### Scene 5: Responsive Modal (1:50 - 2:00)
**Visual:**
1. Resize browser to mobile
2. Show modal width adjusts (90vw)

**Narration:**
> "Modal tự động responsive, width sẽ adjust để phù hợp với màn hình nhỏ."

**Key Points:**
- ✅ Responsive width
- ✅ Mobile-friendly

---

## VIDEO 6: ERROR HANDLING & RETRY

### Duration: 2-3 minutes

### Scene 1: Introduction (0:00 - 0:10)
**Visual:**
- Show application interface

**Narration:**
> "Hệ thống xử lý lỗi được cải thiện với retry mechanism và user-friendly messages."

---

### Scene 2: Global Error Handler (0:10 - 0:40)
**Visual:**
1. Trigger a JavaScript error (via console)
2. Show error toast appearing
3. Show error logged in console
4. Show application still works

**Narration:**
> "Khi có lỗi JavaScript xảy ra, global error handler sẽ catch lỗi, log vào console để debug, và hiển thị user-friendly message. Ứng dụng không bị crash và vẫn tiếp tục hoạt động."

**Key Points:**
- ✅ Global error handler
- ✅ User-friendly messages
- ✅ Console logging
- ✅ No crash

---

### Scene 3: Network Error với Retry (0:40 - 1:40)
**Visual:**
1. Disconnect network
2. Click "💾 Lưu"
3. Show loading state
4. Show retry attempts (console logs)
5. Show error message after retries exhausted
6. Reconnect network
7. Show success after retry

**Narration:**
> "Khi có network error, hệ thống sẽ tự động retry với exponential backoff. Bạn sẽ thấy loading state trong khi retry. Sau khi retry hết số lần cho phép, error message sẽ hiển thị. Khi network được restore, request sẽ thành công."

**Key Points:**
- ✅ Automatic retry
- ✅ Exponential backoff
- ✅ Loading state
- ✅ Clear error messages

---

### Scene 4: API Error Messages (1:40 - 2:10)
**Visual:**
1. Trigger API error
2. Show user-friendly error message
3. Show toast với appropriate type

**Narration:**
> "Tất cả error messages đều user-friendly, không chứa technical details. Error toast tự động dismiss sau 5 giây, đủ thời gian để người dùng đọc."

**Key Points:**
- ✅ User-friendly messages
- ✅ Appropriate toast type
- ✅ Auto-dismiss

---

### Scene 5: Unhandled Promise Rejection (2:10 - 2:30)
**Visual:**
1. Trigger unhandled promise rejection
2. Show error handler catching it
3. Show toast message

**Narration:**
> "Unhandled promise rejections cũng được catch và xử lý, đảm bảo không có errors nào bị bỏ sót."

**Key Points:**
- ✅ Promise rejection handler
- ✅ Comprehensive error handling

---

## TIPS & BEST PRACTICES

### Recording Tips
1. **Screen Resolution:** Use 1920x1080 (Full HD)
2. **Frame Rate:** 30fps minimum, 60fps preferred
3. **Audio:** Use good microphone, record in quiet environment
4. **Cursor:** Highlight cursor movements, use cursor effects
5. **Zoom:** Zoom in on important areas when needed

### Editing Tips
1. **Transitions:** Use smooth transitions between scenes
2. **Text Overlays:** Add text overlays for key points
3. **Highlights:** Highlight important UI elements
4. **Speed:** Adjust playback speed for slow actions
5. **Music:** Add subtle background music (optional)

### Narration Tips
1. **Clear Speech:** Speak clearly and at moderate pace
2. **Pauses:** Add pauses for emphasis
3. **Enthusiasm:** Show enthusiasm but stay professional
4. **Script:** Follow script but sound natural
5. **Practice:** Practice narration before recording

### Post-Production
1. **Thumbnails:** Create eye-catching thumbnails
2. **Titles:** Add title cards for each section
3. **Captions:** Add captions/subtitles
4. **Annotations:** Add annotations for key features
5. **End Screen:** Add end screen with links

---

## VIDEO CHECKLIST

### Pre-Production
- [ ] Script finalized
- [ ] Test data prepared
- [ ] Screen recording software tested
- [ ] Microphone tested
- [ ] Browser cache cleared

### Production
- [ ] Video 1: Loading States & Toast (2-3 min)
- [ ] Video 2: Global Search (2-3 min)
- [ ] Video 3: Mobile Optimization (2-3 min)
- [ ] Video 4: Accessibility (2-3 min)
- [ ] Video 5: Modal System (2 min)
- [ ] Video 6: Error Handling (2-3 min)

### Post-Production
- [ ] Edit videos
- [ ] Add transitions
- [ ] Add text overlays
- [ ] Add captions
- [ ] Create thumbnails
- [ ] Export in multiple formats (MP4, WebM)

---

## FINAL VIDEO STRUCTURE

### Option 1: Individual Videos
- 6 separate videos (2-3 min each)
- Easy to share specific features
- Better for documentation

### Option 2: Combined Video
- 1 comprehensive video (10-15 min)
- All features in one place
- Better for overview

### Option 3: Both
- Individual videos + combined video
- Maximum flexibility

---

**Last Updated:** 2024-01-XX
**Version:** 1.0.0





