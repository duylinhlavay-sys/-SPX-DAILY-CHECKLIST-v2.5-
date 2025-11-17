# 👤 Giải Pháp Đồng Bộ Avatar User

## 🔍 Vấn Đề Hiện Tại

Avatar user không được đồng bộ tự động khi đăng nhập vì:
1. Admin SDK chưa được enable trong Google Cloud Console
2. Admin SDK cần domain-wide delegation hoặc admin credentials
3. People API cần OAuth2 setup phức tạp

## ✅ Giải Pháp Đề Xuất

### **Option 1: Enable Admin SDK (Recommended cho Google Workspace) ⭐**

#### Bước 1: Enable Admin SDK

1. Mở [Google Cloud Console](https://console.cloud.google.com/)
2. Chọn project của Google Apps Script
3. Vào **APIs & Services → Library**
4. Tìm "Admin SDK API"
5. Click **Enable**

#### Bước 2: Setup Domain-wide Delegation (Nếu cần)

1. Vào **APIs & Services → Credentials**
2. Tạo Service Account
3. Enable Domain-wide Delegation
4. Authorize scopes:
   - `https://www.googleapis.com/auth/admin.directory.user.readonly`

#### Bước 3: Test

Code đã có sẵn trong `Code.gs`:
```javascript
function getUserPhotoUrl(email) {
  // Sẽ tự động sử dụng Admin SDK nếu được enable
}
```

**Ưu điểm:**
- ✅ Tự động sync avatar từ Google Account
- ✅ Không cần user action
- ✅ Real-time updates

**Nhược điểm:**
- ❌ Cần admin access
- ❌ Cần setup trong Google Cloud Console

---

### **Option 2: Manual Avatar Upload (Fallback) ⭐⭐**

Cho phép user upload avatar thủ công trong Admin Panel.

#### Implementation:

1. **Thêm upload function trong Code.gs:**

```javascript
/**
 * Upload user avatar (admin only or self)
 * @param {string} userEmail User email
 * @param {string} imageData Base64 image data
 * @return {Object} {status: 'ok'|'error', photoUrl: string}
 */
function uploadUserAvatar(userEmail, imageData) {
  try {
    var currentUser = Session.getActiveUser();
    var email = currentUser.getEmail();
    
    // Check permission: admin or self
    if (!isAdmin(email) && email.toLowerCase() !== userEmail.toLowerCase()) {
      return { status: 'error', message: 'Permission denied' };
    }
    
    // Upload to Google Drive or Cloud Storage
    // Option A: Google Drive
    var folder = DriveApp.getFolderById('FOLDER_ID'); // Create folder for avatars
    var blob = Utilities.newBlob(Utilities.base64Decode(imageData.split(',')[1]), 'image/png', userEmail + '.png');
    var file = folder.createFile(blob);
    
    // Make file publicly accessible
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    var photoUrl = 'https://drive.google.com/uc?export=view&id=' + file.getId();
    
    // Update in UserPermissions sheet
    updateUserPhotoUrl(userEmail, photoUrl);
    
    logAudit(email, 'AVATAR_UPLOAD', '', { userEmail: userEmail });
    
    return { status: 'ok', photoUrl: photoUrl };
    
  } catch (e) {
    Logger.log('uploadUserAvatar error: ' + e.toString());
    return { status: 'error', message: e.toString() };
  }
}
```

2. **Thêm UI trong Admin Panel (script.html):**

```javascript
function showAvatarUploadModal(userEmail) {
  var modal = createModal({
    title: 'Upload Avatar',
    content: `
      <div style="padding:20px">
        <p>Upload avatar cho: <strong>${esc(userEmail)}</strong></p>
        <input type="file" id="avatarFile" accept="image/*" style="margin:10px 0" />
        <div id="avatarPreview" style="margin:10px 0;text-align:center">
          <img id="previewImg" style="max-width:200px;border-radius:50%;display:none" />
        </div>
        <button id="uploadAvatarBtn" class="btn btn-primary" style="width:100%">
          📤 Upload Avatar
        </button>
      </div>
    `,
    closable: true
  });
  
  // File input handler
  var fileInput = modal.querySelector('#avatarFile');
  var preview = modal.querySelector('#previewImg');
  
  fileInput.addEventListener('change', function(e) {
    var file = e.target.files[0];
    if (file) {
      var reader = new FileReader();
      reader.onload = function(e) {
        preview.src = e.target.result;
        preview.style.display = 'block';
      };
      reader.readAsDataURL(file);
    }
  });
  
  // Upload button handler
  modal.querySelector('#uploadAvatarBtn').addEventListener('click', function() {
    var file = fileInput.files[0];
    if (!file) {
      toast('Vui lòng chọn file ảnh', 'warn');
      return;
    }
    
    var reader = new FileReader();
    reader.onload = function(e) {
      var base64 = e.target.result;
      
      callApi('uploadUserAvatar', {
        userEmail: userEmail,
        imageData: base64
      }).then(function(result) {
        if (result.status === 'ok') {
          toast('Đã upload avatar thành công!', 'ok');
          modal.remove();
          // Refresh user list
          loadUsers();
        } else {
          toast('Lỗi: ' + (result.message || 'Upload failed'), 'err');
        }
      });
    };
    reader.readAsDataURL(file);
  });
}
```

**Ưu điểm:**
- ✅ Không cần Admin SDK
- ✅ User có thể tự upload
- ✅ Hoạt động ngay lập tức

**Nhược điểm:**
- ❌ Cần user action
- ❌ Cần storage (Google Drive)

---

### **Option 3: Gravatar Integration ⭐⭐⭐**

Sử dụng Gravatar (Globally Recognized Avatar) - service miễn phí.

#### Implementation:

1. **Update getUserPhotoUrl trong Code.gs:**

```javascript
function getUserPhotoUrl(email) {
  try {
    // Method 1: Try Admin SDK (if available)
    // ... existing code ...
    
    // Method 2: Use Gravatar (fallback)
    // Gravatar uses MD5 hash of email
    var md5Hash = Utilities.computeDigest(
      Utilities.DigestAlgorithm.MD5,
      email.toLowerCase().trim(),
      Utilities.Charset.UTF_8
    );
    
    var hashString = md5Hash.map(function(byte) {
      return ('0' + (byte & 0xFF).toString(16)).slice(-2);
    }).join('');
    
    // Gravatar URL with default image
    var gravatarUrl = 'https://www.gravatar.com/avatar/' + hashString + '?d=404&s=200';
    
    // Note: We can't verify if Gravatar exists without making HTTP request
    // So we'll return it and let frontend handle 404
    return gravatarUrl;
    
  } catch (e) {
    Logger.log('getUserPhotoUrl error: ' + e.toString());
    return '';
  }
}
```

2. **Update frontend để handle Gravatar 404:**

```javascript
// In setupUserChip() function
if (currentUser.photoUrl) {
  var img = document.createElement('img');
  img.src = currentUser.photoUrl;
  img.alt = 'Avatar';
  img.className = 'avatar';
  img.style.cssText = 'width:44px;height:44px;border-radius:50%;object-fit:cover;border:2px solid ' + roleColor;
  
  // Handle Gravatar 404
  img.onerror = function() {
    // If Gravatar doesn't exist, use default avatar
    this.style.display = 'none';
    // Show default avatar with initial
    var defaultAvatar = createDefaultAvatar(displayName, roleColor);
    this.parentNode.replaceChild(defaultAvatar, this);
  };
  
  avatarHtml = img.outerHTML;
}
```

**Ưu điểm:**
- ✅ Miễn phí
- ✅ Không cần setup
- ✅ Works với bất kỳ email nào
- ✅ User có thể setup tại gravatar.com

**Nhược điểm:**
- ❌ User phải setup Gravatar account
- ❌ Không tự động sync từ Google Account

---

### **Option 4: Google Profile Picture URL Pattern (Limited) ⚠️**

Một số Google accounts có public profile picture URL pattern, nhưng không reliable.

```javascript
// NOT RECOMMENDED - Unreliable
var profileUrl = 'https://www.google.com/s2/photos/profile/' + email;
// This often returns 404 or requires authentication
```

---

## 🎯 RECOMMENDATION

### **Best Practice: Multi-layer Approach**

1. **Primary:** Admin SDK (nếu có Google Workspace admin access)
2. **Secondary:** Gravatar (fallback tự động)
3. **Tertiary:** Manual upload (cho admin/users)

### Implementation Priority:

1. ✅ **Immediate:** Implement Gravatar (dễ nhất, hoạt động ngay)
2. ⏳ **Short-term:** Enable Admin SDK (nếu có quyền)
3. ⏳ **Long-term:** Add manual upload feature

---

## 📝 CODE CHANGES NEEDED

### 1. Update `getUserPhotoUrl()` in Code.gs:

```javascript
function getUserPhotoUrl(email) {
  try {
    // Method 1: Admin SDK
    if (typeof AdminDirectory !== 'undefined' && AdminDirectory && AdminDirectory.Users) {
      try {
        var response = AdminDirectory.Users.get(email, {
          projection: 'basic',
          fields: 'thumbnailPhotoUrl'
        });
        if (response && response.thumbnailPhotoUrl) {
          return response.thumbnailPhotoUrl;
        }
      } catch (e) {
        Logger.log('Admin SDK failed: ' + e.toString());
      }
    }
    
    // Method 2: Gravatar (reliable fallback)
    var md5Hash = Utilities.computeDigest(
      Utilities.DigestAlgorithm.MD5,
      email.toLowerCase().trim(),
      Utilities.Charset.UTF_8
    );
    var hashString = md5Hash.map(function(byte) {
      return ('0' + (byte & 0xFF).toString(16)).slice(-2);
    }).join('');
    
    return 'https://www.gravatar.com/avatar/' + hashString + '?d=404&s=200';
    
  } catch (e) {
    Logger.log('getUserPhotoUrl error: ' + e.toString());
    return '';
  }
}
```

### 2. Update frontend to handle Gravatar 404:

Đã có trong code hiện tại - frontend sẽ tự động fallback về default avatar nếu image load fails.

---

## ✅ NEXT STEPS

1. **Immediate:**
   - [ ] Add Gravatar support to `getUserPhotoUrl()`
   - [ ] Test với một vài users
   - [ ] Deploy update

2. **Short-term:**
   - [ ] Enable Admin SDK (nếu có quyền)
   - [ ] Test Admin SDK avatar sync

3. **Long-term:**
   - [ ] Add manual upload feature
   - [ ] Add avatar management in admin panel

---

**SPX Express TVH** © 2025




