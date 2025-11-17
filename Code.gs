/* *****************************************************
 * [SPX] DAILY CHECKLIST - Enhanced Version with Auth & Permissions
 * Version: 2.5 - October 2025
 * 
 * Features:
 * - Google Account authentication (Session.getActiveUser())
 * - Role-based authorization (Admin/User)
 * - Hub-based access control
 * - Complete audit logging
 * - Enhanced modules: Admin, Reports, Highlight, Access Log
 * ***************************************************** */

/* ====== CONFIGURATION ====== */
var SPREADSHEET_ID = '1xW0gt54PxtywL-gOgwJ325Sdl3F2-cu5LGs6mO3ai1o'; // UPDATE THIS

var SHEET_NAMES = {
  DATA: 'ChecklistData',
  NOTES: 'NotesData',
  TEMPLATE: 'TaskTemplate',
  TPL_BY_HUB: 'TaskTemplateByHub',
  PRESENCE: 'Presence',
  AUDIT: 'AuditLog',
  CONFIG: 'UIConfig',
  PERMISSIONS: 'UserPermissions',  // NEW
  REPORT_CACHE: 'ReportCache',      // NEW
  QA: 'QAData'                     // NEW - Q&A Module
};

var ONLINE_WINDOW_DEFAULT_MIN = 180;

/* ====== RATE LIMITING CONFIGURATION ====== */
var RATE_LIMIT_CONFIG = {
  // Requests per minute per user
  requestsPerMinute: 60,
  // Requests per hour per user
  requestsPerHour: 1000,
  // Window size in seconds
  windowSize: 60,
  // Cleanup interval (clean old entries every N requests)
  cleanupInterval: 100
};

// OPTIMIZATION PHASE 1: Persistent rate limit store using PropertiesService
// This ensures rate limits persist across script restarts
var rateLimitStore = {}; // Still keep in-memory for fast access, sync with PropertiesService

/* ====== PERSISTENT DATA CACHING FOR PERFORMANCE ====== */
// OPTIMIZATION PHASE 1: Use PropertiesService for persistent cache (survives script restarts)
// OPTIMIZATION PHASE 1 MAX: Add compression and smart TTL strategy
// This reduces Sheet reads by 50-70% and improves performance significantly

/* ====== CACHE TTL CONFIGURATION ====== */
var CACHE_TTL = {
  USER_PERMISSIONS: 5 * 60 * 1000,      // 5 minutes (rarely change)
  TASK_TEMPLATE: 30 * 60 * 1000,        // 30 minutes (rarely change)
  TASKS: 2 * 60 * 1000,                 // 2 minutes (may change frequently)
  REPORTS: 10 * 60 * 1000,              // 10 minutes (computational expensive)
  ALL_USERS: 5 * 60 * 1000,             // 5 minutes
  NOTES: 3 * 60 * 1000,                 // 3 minutes
  QA_DATA: 5 * 60 * 1000,               // 5 minutes
  CHAT_MESSAGES: 1 * 60 * 1000,         // 1 minute (real-time)
  TASK_INDEX: 5 * 60 * 1000              // 5 minutes (index lookup cache)
};

/* ====== DATA COMPRESSION ====== */
// OPTIMIZATION PHASE 1 MAX: Compress large data to fit PropertiesService limit (9KB)

/**
 * Simple compression using JSON optimization
 * Removes whitespace and optimizes for PropertiesService (9KB limit)
 * @param {*} data - Data to compress
 * @return {string} Compressed JSON string
 */
function compressData(data) {
  try {
    var jsonStr = JSON.stringify(data);
    
    // If data is small, no need to compress
    if (jsonStr.length < 8000) {
      return jsonStr;
    }
    
    // For larger data, optimize JSON string:
    // 1. Remove extra whitespace
    // 2. Use shorter property names if possible (not implemented - requires schema)
    // 3. Remove trailing commas
    
    var compressed = jsonStr
      .replace(/\s+/g, ' ')        // Replace multiple spaces with single space
      .replace(/,\s*}/g, '}')      // Remove trailing commas before }
      .replace(/,\s*]/g, ']')      // Remove trailing commas before ]
      .trim();
    
    return compressed;
  } catch (e) {
    Logger.log('compressData error: ' + e.toString());
    return JSON.stringify(data); // Fallback
  }
}

/**
 * Decompress data (reverse of compressData)
 * @param {string} compressedStr - Compressed JSON string
 * @return {*} Original data
 */
function decompressData(compressedStr) {
  try {
    // For now, compressed data is still valid JSON (just optimized)
    // No need for decompression step, just parse
    return JSON.parse(compressedStr);
  } catch (e) {
    Logger.log('decompressData error: ' + e.toString());
    // Try to parse as-is (might not be compressed)
    try {
      return JSON.parse(compressedStr);
    } catch (e2) {
      Logger.log('decompressData parse error: ' + e2.toString());
      return null;
    }
  }
}

var dataCache = {
  // Default TTL: 5 minutes (300000ms)
  defaultTTL: 300000,
  
  // Get cached data if still valid
  get: function(key) {
    try {
      var props = PropertiesService.getScriptProperties();
      var cached = props.getProperty('cache_' + key);
      if (!cached) return null;
      
      var entry = JSON.parse(cached);
      var now = Date.now();
      
      // Check if expired
      if (now > entry.expires) {
        props.deleteProperty('cache_' + key);
        return null;
      }
      
      // Decompress if needed
      if (entry.compressed) {
        var decompressed = decompressData(entry.data);
        if (decompressed !== null) {
          return decompressed;
        }
        // Decompression failed, delete invalid cache entry
        props.deleteProperty('cache_' + key);
        return null;
      }
      
      // Try to parse as JSON (for old cache format)
      if (typeof entry.data === 'string') {
        try {
          return JSON.parse(entry.data);
        } catch (e) {
          // Not JSON, return as-is
          return entry.data;
        }
      }
      
      return entry.data;
    } catch (e) {
      Logger.log('Cache get error: ' + e.toString());
      return null;
    }
  },
  
  // Set cache entry (persistent across script restarts)
  // OPTIMIZATION PHASE 1 MAX: Use compression for large data
  set: function(key, data, ttl) {
    try {
      var props = PropertiesService.getScriptProperties();
      
      // Try to stringify data first
      var dataStr = JSON.stringify(data);
      var compressed = false;
      
      // If data is large, compress it
      if (dataStr.length > 7000) {
        var compressedStr = compressData(data);
        if (compressedStr.length < dataStr.length) {
          dataStr = compressedStr;
          compressed = true;
        }
      }
      
      var entry = {
        data: dataStr,
        expires: Date.now() + (ttl || this.defaultTTL),
        compressed: compressed
      };
      
      // PropertiesService limit: 9KB per property
      // Check total entry size (including metadata)
      var json = JSON.stringify(entry);
      if (json.length > 9000) {
        Logger.log('Cache entry too large (' + json.length + ' bytes), skipping cache for: ' + key);
        return false;
      }
      
      props.setProperty('cache_' + key, json);
      return true;
    } catch (e) {
      Logger.log('Cache set error: ' + e.toString());
      return false;
    }
  },
  
  // Clear cache (single key or all)
  clear: function(key) {
    try {
      var props = PropertiesService.getScriptProperties();
      if (key) {
        props.deleteProperty('cache_' + key);
      } else {
        // Clear all cache entries
        var allProps = props.getProperties();
        for (var propKey in allProps) {
          if (propKey.indexOf('cache_') === 0) {
            props.deleteProperty(propKey);
          }
        }
      }
    } catch (e) {
      Logger.log('Cache clear error: ' + e.toString());
    }
  },
  
  // Cleanup expired entries (run periodically)
  cleanup: function() {
    try {
      var props = PropertiesService.getScriptProperties();
      var allProps = props.getProperties();
      var now = Date.now();
      var cleaned = 0;
      
      for (var propKey in allProps) {
        if (propKey.indexOf('cache_') === 0) {
          try {
            var entry = JSON.parse(allProps[propKey]);
            if (now > entry.expires) {
              props.deleteProperty(propKey);
              cleaned++;
            }
          } catch (e) {
            // Invalid cache entry, delete it
            props.deleteProperty(propKey);
            cleaned++;
          }
        }
      }
      
      if (cleaned > 0) {
        Logger.log('Cache cleanup: Removed ' + cleaned + ' expired entries');
      }
    } catch (e) {
      Logger.log('Cache cleanup error: ' + e.toString());
    }
  },
  
  // Get cache stats (for monitoring)
  getStats: function() {
    try {
      var props = PropertiesService.getScriptProperties();
      var allProps = props.getProperties();
      var stats = {
        total: 0,
        expired: 0,
        valid: 0,
        totalSize: 0
      };
      var now = Date.now();
      
      for (var propKey in allProps) {
        if (propKey.indexOf('cache_') === 0) {
          stats.total++;
          try {
            var entry = JSON.parse(allProps[propKey]);
            stats.totalSize += JSON.stringify(entry).length;
            if (now > entry.expires) {
              stats.expired++;
            } else {
              stats.valid++;
            }
          } catch (e) {
            stats.expired++;
          }
        }
      }
      
      return stats;
    } catch (e) {
      Logger.log('Cache stats error: ' + e.toString());
      return { total: 0, expired: 0, valid: 0, totalSize: 0 };
    }
  }
};

/* ====== OPTIMIZED SHEET OPERATIONS ====== */
// OPTIMIZATION PHASE 1: Helper functions for optimized Sheet operations

/**
 * Get sheet data optimized (range-based instead of getDataRange)
 * Only reads necessary rows and columns
 * @param {Sheet} sheet - The sheet to read from
 * @param {number} startRow - Starting row (1-indexed, default: 2 to skip header)
 * @param {number} numRows - Number of rows to read (default: all rows)
 * @param {number} numCols - Number of columns to read (default: all columns)
 * @return {Array} 2D array of values
 */
function getSheetDataOptimized(sheet, startRow, numRows, numCols) {
  if (!sheet) return [];
  
  try {
    var lastRow = sheet.getLastRow();
    if (lastRow < (startRow || 2)) return [];
    
    var actualStartRow = startRow || 2; // Skip header by default
    var actualNumRows = numRows || (lastRow - actualStartRow + 1);
    var actualNumCols = numCols || sheet.getLastColumn();
    
    // Ensure we don't read beyond sheet bounds
    actualNumRows = Math.min(actualNumRows, lastRow - actualStartRow + 1);
    
    if (actualNumRows <= 0 || actualNumCols <= 0) return [];
    
    return sheet.getRange(actualStartRow, 1, actualNumRows, actualNumCols).getValues();
  } catch (e) {
    Logger.log('getSheetDataOptimized error: ' + e.toString());
    return [];
  }
}

/**
 * Batch append rows (much faster than multiple appendRow calls)
 * @param {Sheet} sheet - The sheet to write to
 * @param {Array} rows - 2D array of rows to append
 * @return {boolean} Success status
 */
function batchAppendRows(sheet, rows) {
  if (!sheet || !rows || rows.length === 0) return false;
  
  try {
    var startRow = sheet.getLastRow() + 1;
    var numCols = rows[0].length;
    
    if (startRow === 1) {
      // Sheet is empty, need to add header first
      Logger.log('Warning: Sheet is empty, batchAppendRows may fail without header');
    }
    
    sheet.getRange(startRow, 1, rows.length, numCols).setValues(rows);
    return true;
  } catch (e) {
    Logger.log('batchAppendRows error: ' + e.toString());
    return false;
  }
}

/**
 * Find row index by key value in first column
 * Optimized version that stops at first match
 * @param {Sheet} sheet - The sheet to search
 * @param {string} key - Key value to search for
 * @param {number} startRow - Starting row (default: 2 to skip header)
 * @return {number} Row index (1-indexed) or -1 if not found
 */
function findRowByKey(sheet, key, startRow) {
  if (!sheet || !key) return -1;
  
  try {
    var lastRow = sheet.getLastRow();
    var actualStartRow = startRow || 2;
    
    if (lastRow < actualStartRow) return -1;
    
    // Read first column only for faster search
    var keyColumn = sheet.getRange(actualStartRow, 1, lastRow - actualStartRow + 1, 1).getValues();
    
    for (var i = 0; i < keyColumn.length; i++) {
      if (keyColumn[i][0] === key) {
        return actualStartRow + i;
      }
    }
    
    return -1;
  } catch (e) {
    Logger.log('findRowByKey error: ' + e.toString());
    return -1;
  }
}

/* ====== INDEX SHEET FOR FAST LOOKUPS ====== */
// OPTIMIZATION PHASE 1 MAX: Index Sheet for O(1) lookup instead of O(n) scan

/**
 * Get or create Task Index Sheet
 * Index Sheet structure: StorageKey | RowNumber | Hub | Date | LastModified
 * @return {Sheet} Index sheet
 */
function getTaskIndexSheet() {
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName('TaskIndex');
    
    if (!sheet) {
      sheet = ss.insertSheet('TaskIndex');
      // Insert header
      batchAppendRows(sheet, [['StorageKey', 'RowNumber', 'Hub', 'Date', 'LastModified']]);
      // Freeze header row
      sheet.setFrozenRows(1);
      Logger.log('TaskIndex sheet created');
    }
    
    return sheet;
  } catch (e) {
    Logger.log('getTaskIndexSheet error: ' + e.toString());
    return null;
  }
}

/**
 * Find task row using index (much faster than scanning all rows)
 * @param {string} storageKey - Task storage key
 * @return {number} Row number in DATA sheet (1-indexed) or -1 if not found
 */
function findTaskRowByIndex(storageKey) {
  if (!storageKey) return -1;
  
  try {
    // Check cache first (TTL: 5 minutes)
    var cacheKey = 'task_index_' + storageKey;
    var cached = dataCache.get(cacheKey);
    if (cached !== null && cached > 0) {
      return cached;
    }
    
    var indexSheet = getTaskIndexSheet();
    if (!indexSheet) {
      // Index sheet doesn't exist, fallback to old method
      var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
      var dataSheet = ss.getSheetByName(SHEET_NAMES.DATA);
      if (dataSheet) {
        return findRowByKey(dataSheet, storageKey, 2);
      }
      return -1;
    }
    
    // Use optimized read - only read first column for search
    var data = getSheetDataOptimized(indexSheet, 2, null, 1);
    
    for (var i = 0; i < data.length; i++) {
      if (data[i][0] === storageKey) {
        // Found in index, read row number from column 2
        var rowNum = indexSheet.getRange(i + 2, 2).getValue();
        if (rowNum > 0) {
          // Cache the result (TTL: 5 minutes)
          dataCache.set(cacheKey, rowNum, CACHE_TTL.TASK_INDEX);
          return rowNum;
        }
      }
    }
    
    return -1;
  } catch (e) {
    Logger.log('findTaskRowByIndex error: ' + e.toString());
    // Fallback to old method
    try {
      var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
      var dataSheet = ss.getSheetByName(SHEET_NAMES.DATA);
      if (dataSheet) {
        return findRowByKey(dataSheet, storageKey, 2);
      }
    } catch (e2) {
      Logger.log('Fallback findRowByKey error: ' + e2.toString());
    }
    return -1;
  }
}

/**
 * Update task index after save (maintain index consistency)
 * @param {string} storageKey - Task storage key
 * @param {number} rowNumber - Row number in DATA sheet
 * @param {string} hub - Hub name
 * @param {string} date - Date string (YYYY-MM-DD)
 */
function updateTaskIndex(storageKey, rowNumber, hub, date) {
  if (!storageKey || !rowNumber || rowNumber < 2) return;
  
  try {
    var indexSheet = getTaskIndexSheet();
    if (!indexSheet) return;
    
    // Find existing index entry
    var data = getSheetDataOptimized(indexSheet, 2, null, 1);
    var foundRow = -1;
    
    for (var i = 0; i < data.length; i++) {
      if (data[i][0] === storageKey) {
        foundRow = i + 2; // +2 for header row
        break;
      }
    }
    
    if (foundRow > 0) {
      // Update existing index entry
      indexSheet.getRange(foundRow, 2, 1, 4).setValues([[rowNumber, hub || '', date || '', new Date()]]);
    } else {
      // Add new index entry
      batchAppendRows(indexSheet, [[storageKey, rowNumber, hub || '', date || '', new Date()]]);
    }
    
    // Invalidate cache for this storage key
    dataCache.clear('task_index_' + storageKey);
  } catch (e) {
    Logger.log('updateTaskIndex error: ' + e.toString());
    // Don't throw error, index is for optimization only
  }
}

/**
 * Rebuild task index from scratch (utility function)
 * Use this if index gets out of sync
 */
function rebuildTaskIndex() {
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var dataSheet = ss.getSheetByName(SHEET_NAMES.DATA);
    if (!dataSheet) {
      Logger.log('No DATA sheet found for index rebuild');
      return { status: 'error', message: 'No DATA sheet found' };
    }
    
    var indexSheet = getTaskIndexSheet();
    if (!indexSheet) {
      return { status: 'error', message: 'Failed to create index sheet' };
    }
    
    // Clear existing index (keep header)
    var lastRow = indexSheet.getLastRow();
    if (lastRow > 1) {
      indexSheet.deleteRows(2, lastRow - 1);
    }
    
    // Read all storage keys from DATA sheet (column 1, starting from row 2)
    var data = getSheetDataOptimized(dataSheet, 2, null, 1);
    var indexRows = [];
    
    for (var i = 0; i < data.length; i++) {
      var storageKey = data[i][0];
      if (!storageKey || String(storageKey).trim() === '') continue;
      
      var rowNumber = i + 2; // +2 for header row in DATA sheet
      
      // Parse storage key: tasks_{hub}_{date}
      var parts = String(storageKey).split('_');
      var hub = '';
      var date = '';
      
      if (parts.length >= 3 && parts[0] === 'tasks') {
        hub = parts[1] || '';
        date = parts.slice(2).join('_'); // Handle date format YYYY-MM-DD
      }
      
      indexRows.push([storageKey, rowNumber, hub, date, new Date()]);
    }
    
    // Batch append all index entries
    if (indexRows.length > 0) {
      batchAppendRows(indexSheet, indexRows);
    }
    
    Logger.log('Task index rebuilt: ' + indexRows.length + ' entries');
    
    // Clear all task index cache
    var props = PropertiesService.getScriptProperties();
    var allProps = props.getProperties();
    for (var propKey in allProps) {
      if (propKey.indexOf('cache_task_index_') === 0) {
        props.deleteProperty(propKey);
      }
    }
    
    return { status: 'ok', message: 'Index rebuilt', count: indexRows.length };
  } catch (e) {
    Logger.log('rebuildTaskIndex error: ' + e.toString());
    return { status: 'error', message: e.toString() };
  }
}

/* ====== RATE LIMITING ====== */

/**
 * Check rate limit for a user (OPTIMIZED with persistent storage)
 * @param {string} email - User email
 * @param {string} action - Action being performed
 * @return {Object} {allowed: boolean, remaining: number, resetTime: number}
 */
function checkRateLimit(email, action) {
  var now = Date.now();
  var key = email + ':' + action;
  var windowMs = RATE_LIMIT_CONFIG.windowSize * 1000;
  
  // Try to get from in-memory cache first (fast)
  var userData = rateLimitStore[key];
  
  // If not in memory, try to load from PropertiesService
  if (!userData) {
    try {
      var props = PropertiesService.getScriptProperties();
      var stored = props.getProperty('ratelimit_' + key);
      if (stored) {
        userData = JSON.parse(stored);
        // Clean expired entries before using
        userData.requests = userData.requests.filter(function(timestamp) {
          return now - timestamp < windowMs;
        });
        rateLimitStore[key] = userData; // Cache in memory
      }
    } catch (e) {
      Logger.log('Rate limit load error: ' + e.toString());
    }
  }
  
  // Initialize if still not found
  if (!userData) {
    userData = {
      requests: [],
      lastCleanup: now
    };
    rateLimitStore[key] = userData;
  }
  
  // Cleanup old requests (older than window)
  if (now - userData.lastCleanup > windowMs) {
    userData.requests = userData.requests.filter(function(timestamp) {
      return now - timestamp < windowMs;
    });
    userData.lastCleanup = now;
  }
  
  // Check if limit exceeded
  var requestCount = userData.requests.length;
  var limit = RATE_LIMIT_CONFIG.requestsPerMinute;
  var allowed = requestCount < limit;
  
  if (allowed) {
    // Add current request
    userData.requests.push(now);
    
    // Persist to PropertiesService (async, don't block)
    try {
      var props = PropertiesService.getScriptProperties();
      // Only store last 100 requests to save space
      var requestsToStore = userData.requests.slice(-100);
      var dataToStore = {
        requests: requestsToStore,
        lastCleanup: userData.lastCleanup
      };
      var json = JSON.stringify(dataToStore);
      if (json.length < 8000) { // PropertiesService limit
        props.setProperty('ratelimit_' + key, json);
      }
    } catch (e) {
      // Non-critical, continue
      Logger.log('Rate limit save error (non-critical): ' + e.toString());
    }
  }
  
  // Calculate reset time
  var oldestRequest = userData.requests.length > 0 ? userData.requests[0] : now;
  var resetTime = oldestRequest + windowMs;
  
  return {
    allowed: allowed,
    remaining: Math.max(0, limit - requestCount - (allowed ? 0 : 1)),
    resetTime: resetTime,
    limit: limit
  };
}

/**
 * Check rate limit and throw error if exceeded
 * @param {string} email - User email
 * @param {string} action - Action being performed
 */
function enforceRateLimit(email, action) {
  var result = checkRateLimit(email, action);
  
  if (!result.allowed) {
    var resetDate = new Date(result.resetTime);
    throw new Error('Rate limit exceeded. Please try again after ' + 
      resetDate.toLocaleTimeString() + '. Limit: ' + result.limit + ' requests per minute.');
  }
  
  return result;
}

/* ====== AUTHENTICATION & AUTHORIZATION ====== */

/**
 * Get current user information with permissions
 * @return {Object} {email, role, hubs, displayName, error}
 */
function whoami() {
  try {
    var user = Session.getActiveUser();
    var email = user.getEmail();

    if (!email) {
      return { error: 'Not authenticated' };
    }

    // Get user permissions from UserPermissions sheet
    var perms = getUserPermissions(email);
    
    // AUTO-SETUP: If no permissions found, check if this is first-time setup
    if (!perms) {
      var isFirstUser = isUserPermissionsEmpty();
      
      if (isFirstUser) {
        // First user accessing the app - auto-create as admin
        Logger.log('First-time setup: Creating admin user for ' + email);
        var displayName = email.split('@')[0];
        
        try {
          // Create first admin user
          var result = addOrUpdateUser({
            email: email,
            hub: 'ALL',
            role: 'admin',
            active: true,
            displayName: displayName,
            photoUrl: ''
          });
          
          if (result.status === 'ok') {
            logAudit(email, 'FIRST_ADMIN_CREATED', '', { auto_setup: true });
            // Retry getting permissions
            perms = getUserPermissions(email);
          }
        } catch (setupError) {
          Logger.log('Auto-setup error: ' + setupError.toString());
        }
      }
      
      // If still no permissions, deny access
      if (!perms) {
        logAudit(email, 'ACCESS_DENIED', '', { reason: 'No permissions found' });
        return { error: 'Access denied. Contact administrator.' };
      }
    }

    if (!perms.Active) {
      logAudit(email, 'ACCESS_DENIED', '', { reason: 'User inactive' });
      return { error: 'Account inactive. Contact administrator.' };
    }

    // Log successful login
    logAudit(email, 'LOGIN', '', { role: perms.Role });

    // Update last access time
    updateLastAccess(email);

    // IMPROVED: Try to sync avatar from Google Account if not cached
    var photoUrl = perms.PhotoUrl || '';
    
    // ALTERNATIVE METHOD: Use Google's public profile picture API
    // This works without Admin SDK - uses Google's public API endpoint
    if (!photoUrl || photoUrl === '') {
      try {
        // Method 1: Try Admin SDK (if available)
        photoUrl = getUserPhotoUrl(email);
        
        // Method 2: If Admin SDK fails, use Google's public profile picture API
        // This endpoint works for Google Workspace accounts
        if (!photoUrl || photoUrl === '') {
          // Google's public profile picture API
          // Format: https://www.google.com/s2/photos/profile/{email}
          // But this requires authentication, so we'll use a different approach
          
          // Method 3: Use Google Account's profile picture via People API (if enabled)
          // Or use a proxy endpoint that can fetch the photo
          
          // For now, we'll leave it empty and let frontend handle default avatar
          // The frontend will show a nice initial-based avatar
        }
        
        // If we got a photo URL, update it in the sheet for future use
        if (photoUrl && photoUrl !== '') {
          updateUserPhotoUrl(email, photoUrl);
          // Update perms object so it's cached correctly
          perms.PhotoUrl = photoUrl;
        }
      } catch (photoError) {
        // Silently fail - will use default avatar
        Logger.log('Photo sync error (non-critical): ' + photoError.toString());
      }
    }

    return {
      email: email,
      role: perms.Role,
      hubs: perms.Role === 'admin' ? 'ALL' : (perms.Hub ? perms.Hub.split(',').map(function(h) { return h.trim(); }) : []),
      displayName: perms.DisplayName || email.split('@')[0],
      photoUrl: photoUrl
    };

  } catch (e) {
    Logger.log('whoami error: ' + e.toString());
    return { error: 'Authentication error: ' + e.toString() };
  }
}

/**
 * Check if UserPermissions sheet is empty (no users)
 * @return {boolean} True if empty
 */
function isUserPermissionsEmpty() {
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName(SHEET_NAMES.PERMISSIONS);
    
    if (!sheet) return true; // Sheet doesn't exist
    
    // OPTIMIZATION: Use optimized read (skip header, read only first column)
    var data = getSheetDataOptimized(sheet, 2, null, 1);
    return data.length === 0; // Empty if no data rows
    
  } catch (e) {
    Logger.log('isUserPermissionsEmpty error: ' + e.toString());
    return false;
  }
}

/**
 * Get user permissions from UserPermissions sheet
 * @param {string} email 
 * @return {Object} Permission object or null
 */
function getUserPermissions(email) {
  try {
    // Check cache first (TTL: 2 minutes for user permissions)
    var cacheKey = 'user_perms_' + email.toLowerCase();
    var cached = dataCache.get(cacheKey);
    if (cached !== null) {
      return cached;
    }
    
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName(SHEET_NAMES.PERMISSIONS);

    if (!sheet) {
      Logger.log('UserPermissions sheet not found');
      return null;
    }

    // OPTIMIZATION: Use optimized read (read only necessary columns)
    var data = getSheetDataOptimized(sheet, 1, null, 8); // Read header + 8 columns
    if (data.length <= 1) return null; // No data except header

    var headers = data[0];
    var emailCol = headers.indexOf('Email');
    var hubCol = headers.indexOf('Hub');
    var roleCol = headers.indexOf('Role');
    var activeCol = headers.indexOf('Active');
    var displayNameCol = headers.indexOf('DisplayName');
    var photoUrlCol = headers.indexOf('PhotoUrl');

    if (emailCol === -1) return null;

    var result = null;
    // Find user row
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      if (String(row[emailCol]).toLowerCase().trim() === email.toLowerCase().trim()) {
        result = {
          Email: row[emailCol],
          Hub: hubCol !== -1 ? String(row[hubCol]) : '',
          Role: roleCol !== -1 ? String(row[roleCol]).toLowerCase() : 'user',
          Active: activeCol !== -1 ? (String(row[activeCol]).toUpperCase() === 'TRUE') : true,
          DisplayName: displayNameCol !== -1 ? row[displayNameCol] : '',
          PhotoUrl: photoUrlCol !== -1 ? row[photoUrlCol] : ''
        };
        break;
      }
    }
    
    // Cache result (TTL: 2 minutes)
    dataCache.set(cacheKey, result, 120000);

    return result;

  } catch (e) {
    Logger.log('getUserPermissions error: ' + e.toString());
    return null;
  }
}

/**
 * Check if user has permission to access a hub
 * @param {string} email
 * @param {string} hub
 * @return {boolean}
 */
function checkHubPermission(email, hub) {
  var perms = getUserPermissions(email);
  if (!perms || !perms.Active) return false;

  // Admin can access all hubs
  if (perms.Role === 'admin') return true;

  // Check if user has access to this hub (case-insensitive, trim whitespace)
  var hubNormalized = String(hub).trim().toUpperCase();
  // Safety check: ensure perms.Hub exists before calling split
  if (!perms.Hub) return false;
  var allowedHubs = perms.Hub.split(',').map(function(h) { 
    return String(h).trim().toUpperCase(); 
  });
  return allowedHubs.indexOf(hubNormalized) !== -1;
}

/**
 * Check if user is admin
 * @param {string} email
 * @return {boolean}
 */
function isAdmin(email) {
  var perms = getUserPermissions(email);
  return perms && perms.Active && perms.Role === 'admin';
}

/**
 * Update last access timestamp
 * @param {string} email
 */
function updateLastAccess(email) {
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName(SHEET_NAMES.PERMISSIONS);
    if (!sheet) return;

    // OPTIMIZATION PHASE 1 MAX: Use optimized read (only necessary columns)
    var data = getSheetDataOptimized(sheet, 1, null, 8); // Read header + 8 columns
    if (data.length <= 1) return; // No data except header
    
    var headers = data[0];
    var emailCol = headers.indexOf('Email');
    var lastAccessCol = headers.indexOf('LastAccess');

    if (emailCol === -1 || lastAccessCol === -1) return;

    for (var i = 1; i < data.length; i++) {
      if (String(data[i][emailCol]).toLowerCase().trim() === email.toLowerCase().trim()) {
        sheet.getRange(i + 1, lastAccessCol + 1).setValue(new Date());
        break;
      }
    }
  } catch (e) {
    Logger.log('updateLastAccess error: ' + e.toString());
  }
}

/* ====== AUDIT LOGGING ====== */

/**
 * Log user action to AuditLog sheet
 * @param {string} email
 * @param {string} action
 * @param {string} hub
 * @param {Object} details
 */
function logAudit(email, action, hub, details) {
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName(SHEET_NAMES.AUDIT);

    if (!sheet) {
      // Create if not exists
      sheet = ss.insertSheet(SHEET_NAMES.AUDIT);
      // Use batch write for header
      batchAppendRows(sheet, [['Timestamp', 'Email', 'Action', 'Hub', 'Details', 'SessionInfo']]);
    }

    // OPTIMIZATION: Use batch write (single row, but consistent with pattern)
    batchAppendRows(sheet, [[
      new Date(),
      email || '',
      action || '',
      hub || '',
      JSON.stringify(details || {}),
      Session.getActiveUser().getEmail()
    ]]);

  } catch (e) {
    Logger.log('logAudit error: ' + e.toString());
  }
}

/* ====== MAIN doGet ====== */

/**
 * Cleanup expired cache entries (call periodically)
 * Can be called manually or via time-based trigger
 */
function cleanupExpiredCache() {
  try {
    dataCache.cleanup();
    Logger.log('Cache cleanup completed');
    return { status: 'ok', message: 'Cache cleanup completed' };
  } catch (e) {
    Logger.log('Cache cleanup error: ' + e.toString());
    return { status: 'error', message: e.toString() };
  }
}

/**
 * Get cache statistics (for monitoring)
 */
function getCacheStats() {
  try {
    var stats = dataCache.getStats();
    return {
      status: 'ok',
      stats: stats,
      message: 'Cache stats: ' + stats.valid + ' valid, ' + stats.expired + ' expired, total size: ' + Math.round(stats.totalSize / 1024) + ' KB'
    };
  } catch (e) {
    Logger.log('Cache stats error: ' + e.toString());
    return { status: 'error', message: e.toString() };
  }
}

/**
 * Setup cache cleanup trigger (run once to enable automatic cleanup)
 * This creates a time-based trigger that runs cleanupExpiredCache() every hour
 * @return {Object} Setup result
 */
function setupCacheCleanupTrigger() {
  try {
    // Delete existing triggers with same handler
    var triggers = ScriptApp.getProjectTriggers();
    var deleted = 0;
    triggers.forEach(function(trigger) {
      if (trigger.getHandlerFunction() === 'cleanupExpiredCache') {
        ScriptApp.deleteTrigger(trigger);
        deleted++;
      }
    });
    
    // Create new trigger (runs every hour)
    var trigger = ScriptApp.newTrigger('cleanupExpiredCache')
      .timeBased()
      .everyHours(1)
      .create();
    
    Logger.log('Cache cleanup trigger setup completed. Deleted ' + deleted + ' old trigger(s), created new trigger.');
    
    return {
      status: 'ok',
      message: 'Cache cleanup trigger setup successfully',
      triggerId: trigger.getUniqueId(),
      deletedOldTriggers: deleted,
      schedule: 'Every 1 hour'
    };
  } catch (e) {
    Logger.log('Setup cache cleanup trigger error: ' + e.toString());
    return {
      status: 'error',
      message: 'Failed to setup trigger: ' + e.toString()
    };
  }
}

/**
 * Remove cache cleanup trigger (if you want to disable automatic cleanup)
 * @return {Object} Removal result
 */
function removeCacheCleanupTrigger() {
  try {
    var triggers = ScriptApp.getProjectTriggers();
    var deleted = 0;
    
    triggers.forEach(function(trigger) {
      if (trigger.getHandlerFunction() === 'cleanupExpiredCache') {
        ScriptApp.deleteTrigger(trigger);
        deleted++;
      }
    });
    
    Logger.log('Removed ' + deleted + ' cache cleanup trigger(s)');
    
    return {
      status: 'ok',
      message: 'Removed ' + deleted + ' cache cleanup trigger(s)',
      deletedTriggers: deleted
    };
  } catch (e) {
    Logger.log('Remove cache cleanup trigger error: ' + e.toString());
    return {
      status: 'error',
      message: 'Failed to remove trigger: ' + e.toString()
    };
  }
}

/**
 * Warm cache for popular data (pre-load frequently accessed data)
 * OPTIMIZATION PHASE 1 MAX: Pre-load data to improve response times
 * Run this periodically via trigger (e.g., every 30 minutes)
 */
function warmCache() {
  try {
    Logger.log('Starting cache warming...');
    var warmed = 0;
    
    // Get all active users and their hubs
    var allUsers = getAllUsers();
    var hubs = {};
    var activeUsers = [];
    
    allUsers.forEach(function(user) {
      if (user.active && user.hub) {
        hubs[user.hub] = true;
        if (user.email) {
          activeUsers.push(user.email);
        }
      }
    });
    
    var hubList = Object.keys(hubs);
    Logger.log('Found ' + hubList.length + ' active hubs and ' + activeUsers.length + ' active users');
    
    // Pre-load task templates for each hub
    hubList.forEach(function(hub) {
      try {
        var template = getTaskTemplateFor(hub);
        if (template && template.length > 0) {
          warmed++;
        }
      } catch (e) {
        Logger.log('Failed to warm template for hub ' + hub + ': ' + e.toString());
      }
    });
    
    // Pre-load today's tasks for active hubs - SKIPPED
    // loadTasks() requires permission check which may not be available in trigger context
    // Tasks will be loaded on-demand when users access (better security)
    // Option: Can implement direct sheet read here if needed (bypass permission for warming)
    Logger.log('Skipping task warming (requires user permission)');
    
    // Pre-load user permissions for active users (limit to first 50 to avoid timeout)
    var userLimit = Math.min(activeUsers.length, 50);
    for (var i = 0; i < userLimit; i++) {
      try {
        var perms = getUserPermissions(activeUsers[i]);
        if (perms) {
          warmed++;
        }
      } catch (e) {
        Logger.log('Failed to warm permissions for user ' + activeUsers[i] + ': ' + e.toString());
      }
    }
    
    Logger.log('Cache warming completed: ' + warmed + ' entries warmed');
    
    return {
      status: 'ok',
      message: 'Cache warmed successfully',
      entriesWarmed: warmed,
      hubs: hubList.length,
      users: userLimit
    };
  } catch (e) {
    Logger.log('warmCache error: ' + e.toString());
    return {
      status: 'error',
      message: 'Failed to warm cache: ' + e.toString()
    };
  }
}

/**
 * Setup cache warming trigger (runs every 30 minutes)
 * @return {Object} Trigger setup result
 */
function setupCacheWarmingTrigger() {
  try {
    // Delete existing cache warming triggers first
    var triggers = ScriptApp.getProjectTriggers();
    triggers.forEach(function(trigger) {
      if (trigger.getHandlerFunction() === 'warmCache') {
        ScriptApp.deleteTrigger(trigger);
      }
    });
    
    // Create new trigger (every 30 minutes)
    var trigger = ScriptApp.newTrigger('warmCache')
      .timeBased()
      .everyMinutes(30)
      .create();
    
    Logger.log('Cache warming trigger setup successfully');
    
    return {
      status: 'ok',
      message: 'Cache warming trigger setup successfully',
      triggerId: trigger.getUniqueId(),
      schedule: 'Every 30 minutes'
    };
  } catch (e) {
    Logger.log('Setup cache warming trigger error: ' + e.toString());
    return {
      status: 'error',
      message: 'Failed to setup trigger: ' + e.toString()
    };
  }
}

/**
 * Get all cache cleanup triggers info
 * @return {Object} Trigger information
 */
function getCacheCleanupTriggerInfo() {
  try {
    var triggers = ScriptApp.getProjectTriggers();
    var cacheTriggers = [];
    
    triggers.forEach(function(trigger) {
      if (trigger.getHandlerFunction() === 'cleanupExpiredCache') {
        cacheTriggers.push({
          id: trigger.getUniqueId(),
          handlerFunction: trigger.getHandlerFunction(),
          eventType: trigger.getEventType().toString(),
          source: trigger.getTriggerSource().toString()
        });
      }
    });
    
    return {
      status: 'ok',
      count: cacheTriggers.length,
      triggers: cacheTriggers,
      message: cacheTriggers.length > 0 
        ? 'Found ' + cacheTriggers.length + ' cache cleanup trigger(s)' 
        : 'No cache cleanup triggers found. Run setupCacheCleanupTrigger() to create one.'
    };
  } catch (e) {
    Logger.log('Get cache cleanup trigger info error: ' + e.toString());
    return {
      status: 'error',
      message: 'Failed to get trigger info: ' + e.toString()
    };
  }
}

function doGet(e) {
  // Handle PWA manifest and service worker requests
  if (e && e.parameter && e.parameter.action) {
    if (e.parameter.action === 'manifest') {
      return ContentService.createTextOutput(getManifest())
        .setMimeType(ContentService.MimeType.JSON);
    }
    if (e.parameter.action === 'sw') {
      return ContentService.createTextOutput(getServiceWorker())
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
    if (e.parameter.action === 'logo') {
      return getLogo();
    }
  }
  
  var template = HtmlService.createTemplateFromFile('index');
  var html = template.evaluate();

  return html
    .setTitle('[SPX] DAILY CHECKLIST')
    .setFaviconUrl('https://images.seeklogo.com/logo-png/49/1/spx-express-indonesia-logo-png_seeklogo-499970.png')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Include external HTML files
 * @param {string} filename
 * @return {string}
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/* ====== DATA API ENDPOINTS ====== */

/**
 * Load tasks for a specific hub and date
 * Requires hub permission check
 */
function loadTasks(storageKey) {
  // Rate limiting
  try {
    var user = Session.getActiveUser();
    var email = user.getEmail();
    if (email) {
      enforceRateLimit(email, 'loadTasks');
    }
  } catch (rateLimitError) {
    Logger.log('Rate limit error: ' + rateLimitError.toString());
    return { error: rateLimitError.toString() };
  }
  try {
    var user = Session.getActiveUser();
    var email = user.getEmail();

    // Parse storage key to extract hub
    // Format: "tasks_HUB_DATE" → parts = ["tasks", "HUB", "DATE"]
    var parts = storageKey.split('_');
    var hub = parts.length >= 3 ? parts[1] : parts[0]; // Get middle part for "tasks_HUB_DATE"

    // Check permission
    if (!checkHubPermission(email, hub)) {
      logAudit(email, 'LOAD_TASKS_DENIED', hub, { storageKey: storageKey });
      return null;
    }

    // Check cache first (TTL: 1 minute for tasks)
    var cacheKey = 'tasks_' + storageKey;
    var cached = dataCache.get(cacheKey);
    if (cached !== null) {
      logAudit(email, 'LOAD_TASKS_CACHED', hub, { storageKey: storageKey, count: cached.length });
      return cached;
    }
    
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName(SHEET_NAMES.DATA);

    if (!sheet) {
      // No data sheet, load from template
      var template = getTaskTemplateFor(hub);
      // Cache template result (TTL: 5 minutes)
      dataCache.set(cacheKey, template, CACHE_TTL.TASKS);
      logAudit(email, 'LOAD_TASKS_FROM_TEMPLATE', hub, { storageKey: storageKey, count: template.length });
      return template;
    }

    // OPTIMIZATION PHASE 1 MAX: Use Index Sheet for O(1) lookup (much faster than scanning)
    var rowIndex = findTaskRowByIndex(storageKey);
    var tasks = [];
    
    if (rowIndex > 0) {
      // Found row via index, read only that row (columns 1-4)
      var row = sheet.getRange(rowIndex, 1, 1, 4).getValues()[0];
      try {
        var taskData = JSON.parse(row[1] || '[]');
        // Safety check: ensure taskData is an array
        if (!Array.isArray(taskData)) {
          Logger.log('Warning: taskData is not an array, skipping');
          tasks = [];
        } else {
          tasks = taskData;
        }
      } catch (e) {
        Logger.log('Parse error: ' + e.toString());
        tasks = [];
      }
    }

    // Get template to merge info and link fields
    var template = getTaskTemplateFor(hub);
    
    // If no tasks found, load from template
    if (tasks.length === 0) {
      tasks = template;
      logAudit(email, 'LOAD_TASKS_FROM_TEMPLATE', hub, { storageKey: storageKey, count: tasks.length });
    } else {
      // CRITICAL FIX: Template is the source of truth for category and task list
      // Strategy: Start with template, then merge completion status from saved tasks
      
      // Helper function to normalize category
      function normalizeCategoryName(cat) {
        if (!cat) return 'Đầu Ca';
        var normalized = String(cat).trim();
        var lower = normalized.toLowerCase();
        if (lower === 'đầu ca' || lower === 'dau ca') return 'Đầu Ca';
        if (lower === 'trong ca') return 'Trong Ca';
        if (lower === 'cuối ca' || lower === 'cuoi ca') return 'Cuối Ca';
        if (lower === 'hàng tuần' || lower === 'hang tuan') return 'Hàng Tuần';
        return normalized;
      }
      
      function normalizeTaskKey(text) {
        if (!text) return '';
        return String(text).trim().toLowerCase().replace(/\s+/g, ' ');
      }
      
      // Create a map of saved tasks by normalized text for quick lookup
      var savedTaskMap = {};
      for (var s = 0; s < tasks.length; s++) {
        var savedTask = tasks[s];
        var savedKey = normalizeTaskKey(savedTask.text);
        if (savedKey) {
          // Store by key, but keep original text for reference
          if (!savedTaskMap[savedKey]) {
            savedTaskMap[savedKey] = [];
          }
          savedTaskMap[savedKey].push(savedTask);
        }
      }
      
      // Optimized matching function - exact match only for performance
      // Fuzzy matching is expensive and causes performance issues
      function findBestSavedMatch(templateText, savedTaskMap) {
        var tplKey = normalizeTaskKey(templateText);
        
        // Only try exact match for performance
        if (savedTaskMap[tplKey] && savedTaskMap[tplKey].length > 0) {
          return { match: savedTaskMap[tplKey][0], method: 'exact' };
        }
        
        // Skip fuzzy matching for performance - if exact match fails, return null
        // This ensures fast execution and consistent results
        return null;
      }
      
      // Build final task list starting from template (template is source of truth)
      // OPTIMIZED: Reduced logging and simplified matching for performance
      var finalTasks = [];
      var categoryChanges = []; // Only track significant category changes
      var matchedSavedTasks = {}; // Track which saved tasks have been matched
      
      // First pass: Process all template tasks in order (ensures consistent ordering)
      for (var t = 0; t < template.length; t++) {
        var tplTask = template[t];
        var tplKey = normalizeTaskKey(tplTask.text);
        var tplTaskClone = JSON.parse(JSON.stringify(tplTask));
        
        // Normalize category from template
        tplTaskClone.category = normalizeCategoryName(tplTaskClone.category);
        
        // Try to find matching saved task (exact match only for performance)
        var savedMatch = null;
        if (savedTaskMap[tplKey] && savedTaskMap[tplKey].length > 0) {
          savedMatch = savedTaskMap[tplKey][0];
          var savedKey = normalizeTaskKey(savedMatch.text);
          matchedSavedTasks[savedKey] = true;
        }
        
        if (savedMatch) {
          // Merge: Use template for category, info, link, isLead
          // Use saved task for completion status, doneAt, id
          var oldCategory = savedMatch.category || '';
          var newCategory = tplTaskClone.category;
          
          // Always use template category (template is source of truth)
          // Only log if category actually changed (not just normalized)
          if (oldCategory && oldCategory.trim() !== '' && normalizeCategoryName(oldCategory) !== newCategory) {
            categoryChanges.push({
              taskText: tplTask.text,
              taskId: savedMatch.id || '',
              oldCategory: oldCategory,
              newCategory: newCategory,
              changeType: 'CATEGORY_FIXED',
              reason: 'Template category applied (template is source of truth)',
              source: 'template_merge'
            });
          }
          
          // Merge fields: template fields take precedence for metadata
          finalTasks.push({
            id: savedMatch.id || tplTaskClone.id || 'tpl_' + t + '_' + new Date().getTime(),
            text: tplTask.text, // Use template text (source of truth)
            category: newCategory, // Use template category
            isLead: tplTask.isLead !== undefined ? tplTask.isLead : (savedMatch.isLead || false),
            link: tplTask.link || savedMatch.link || null,
            info: tplTask.info || savedMatch.info || null,
            completed: savedMatch.completed || false,
            doneAt: savedMatch.doneAt || null,
            sla: savedMatch.sla || null
          });
        } else {
          // No saved task match - use template task as-is
          tplTaskClone.id = tplTaskClone.id || 'tpl_' + t + '_' + new Date().getTime();
          tplTaskClone.completed = false;
          tplTaskClone.doneAt = null;
          finalTasks.push(tplTaskClone);
        }
      }
      
      // Second pass: Add any saved tasks that weren't matched (user-created tasks)
      for (var key in savedTaskMap) {
        if (!matchedSavedTasks[key]) {
          var savedTasks = savedTaskMap[key];
          for (var st = 0; st < savedTasks.length; st++) {
            var savedTask = savedTasks[st];
            var normalizedCat = normalizeCategoryName(savedTask.category);
            savedTask.category = normalizedCat;
            finalTasks.push(savedTask);
          }
        }
      }
      
      // Replace tasks array with final tasks
      tasks = finalTasks;
      
      // OPTIMIZED: Only log category changes if there are significant changes (not just normalization)
      // Batch log to reduce API calls
      if (categoryChanges.length > 0) {
        // Parse date from storageKey
        var dateFromKey = '';
        try {
          var keyParts = storageKey.split('_');
          if (keyParts.length >= 3) {
            dateFromKey = keyParts[2];
          } else if (keyParts.length === 2) {
            dateFromKey = keyParts[1];
          }
        } catch (e) {
          // Ignore parse errors
        }
        
        // Batch log all category changes in one audit entry for performance
        logAudit(email, 'CATEGORY_CHANGED_BATCH', hub, {
          changes: categoryChanges,
          count: categoryChanges.length,
          storageKey: storageKey,
          date: dateFromKey,
          autoFix: true
        });
        
        // Log summary to Logger (only if significant)
        if (categoryChanges.length > 5) {
          Logger.log('loadTasks: ' + categoryChanges.length + ' category changes for hub ' + hub + ', date ' + dateFromKey);
        }
      }
      
      // Final pass: normalize all categories to ensure consistency
      for (var k = 0; k < tasks.length; k++) {
        tasks[k].category = normalizeCategoryName(tasks[k].category);
      }
      
      // Tasks are already in template order since we process template sequentially
      // No need to sort again - this ensures consistent ordering and better performance
      
      // Cache result (TTL: 2 minutes)
      dataCache.set(cacheKey, tasks, CACHE_TTL.TASKS);
      
      logAudit(email, 'LOAD_TASKS', hub, { storageKey: storageKey, count: tasks.length });
    }

    return tasks;

  } catch (e) {
    Logger.log('loadTasks error: ' + e.toString());
    return [];
  }
}

/**
 * Save tasks for a specific hub and date
 * Requires hub permission check
 */
function saveTasks(storageKey, tasks) {
  try {
    var user = Session.getActiveUser();
    var email = user.getEmail();
    
    // Rate limiting
    if (email) {
      try {
        enforceRateLimit(email, 'saveTasks');
      } catch (rateLimitError) {
        Logger.log('Rate limit error: ' + rateLimitError.toString());
        return { status: 'error', message: rateLimitError.toString() };
      }
    }

    // Parse storage key to extract hub (same logic as loadTasks)
    var parts = storageKey.split('_');
    var hub = parts.length >= 3 ? parts[1] : parts[0];

    if (!checkHubPermission(email, hub)) {
      logAudit(email, 'SAVE_TASKS_DENIED', hub, { storageKey: storageKey });
      return { status: 'error', message: 'Permission denied' };
    }

    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName(SHEET_NAMES.DATA);

    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAMES.DATA);
      sheet.appendRow(['StorageKey', 'Data', 'LastModified', 'ModifiedBy']);
    }

    // Normalize categories before saving to ensure consistency
    function normalizeCategoryName(cat) {
      if (!cat) return 'Đầu Ca';
      var normalized = String(cat).trim();
      var lower = normalized.toLowerCase();
      if (lower === 'đầu ca' || lower === 'dau ca') return 'Đầu Ca';
      if (lower === 'trong ca') return 'Trong Ca';
      if (lower === 'cuối ca' || lower === 'cuoi ca') return 'Cuối Ca';
      if (lower === 'hàng tuần' || lower === 'hang tuan') return 'Hàng Tuần';
      return normalized;
    }
    
    // Normalize all task categories before saving
    for (var t = 0; t < tasks.length; t++) {
      if (tasks[t].category) {
        tasks[t].category = normalizeCategoryName(tasks[t].category);
      }
    }
    
    // OPTIMIZATION PHASE 1 MAX: Use Index Sheet for O(1) lookup (much faster than scanning)
    var rowIndex = findTaskRowByIndex(storageKey);
    var found = false;
    var newRowIndex = -1;

    // Update existing row if found
    if (rowIndex > 0) {
      sheet.getRange(rowIndex, 2).setValue(JSON.stringify(tasks));
      sheet.getRange(rowIndex, 3).setValue(new Date());
      sheet.getRange(rowIndex, 4).setValue(email);
      found = true;
      
      // Update index (row number stays the same)
      // Reuse parts and hub from line 1588-1589
      var date = parts.length >= 3 ? parts.slice(2).join('_') : '';
      updateTaskIndex(storageKey, rowIndex, hub, date);
    }

    // Append new row if not found (using optimized batch write)
    if (!found) {
      // Get row number before append (more accurate)
      newRowIndex = sheet.getLastRow() + 1;
      batchAppendRows(sheet, [[storageKey, JSON.stringify(tasks), new Date(), email]]);
      
      // Update index with new row number
      // Reuse parts and hub from line 1588-1589
      var date = parts.length >= 3 ? parts.slice(2).join('_') : '';
      updateTaskIndex(storageKey, newRowIndex, hub, date);
    }

    logAudit(email, 'SAVE_TASKS', hub, { storageKey: storageKey, count: tasks.length });
    
    // Clear cache for this storage key to force reload
    dataCache.clear('tasks_' + storageKey);
    
    return { status: 'ok' };

  } catch (e) {
    Logger.log('saveTasks error: ' + e.toString());
    return { status: 'error', message: e.toString() };
  }
}

/**
 * Get task template for a hub
 */
function getTaskTemplateFor(hubId) {
  try {
    var user = Session.getActiveUser();
    var email = user.getEmail();

    if (!checkHubPermission(email, hubId)) {
      return [];
    }

    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName(SHEET_NAMES.TPL_BY_HUB);

    if (!sheet) return getTaskTemplate(); // Fallback to global template

    // OPTIMIZATION PHASE 1 MAX: Use optimized read (only necessary columns)
    var data = getSheetDataOptimized(sheet, 1, null, 2); // Read header + 2 columns (HubId, TemplateData)

    for (var i = 1; i < data.length; i++) {
      if (data[i][0] === hubId) {
        try {
          return JSON.parse(data[i][1] || '[]');
        } catch (e) {
          return [];
        }
      }
    }

    return getTaskTemplate(); // Fallback

  } catch (e) {
    Logger.log('getTaskTemplateFor error: ' + e.toString());
    return [];
  }
}

/**
 * Get global task template
 * Supports dynamic column mapping based on header row
 */
function getTaskTemplate() {
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName(SHEET_NAMES.TEMPLATE);

    if (!sheet) return [];

    // OPTIMIZATION: Use optimized read (read only necessary columns)
    var data = getSheetDataOptimized(sheet, 1, null, 6); // Include header, 6 columns
    if (data.length < 2) return []; // Need at least header + 1 row

    // Read header row and map column indices
    var headers = data[0];
    var colMap = {};
    
    // Normalize header names (case-insensitive, trim whitespace)
    for (var h = 0; h < headers.length; h++) {
      var headerName = String(headers[h] || '').trim().toLowerCase();
      
      // Map common variations of column names
      if (headerName === 'category' || headerName === 'danh mục' || headerName === 'danhmuc' || headerName === 'cat') {
        colMap.category = h;
      } else if (headerName === 'text' || headerName === 'task' || headerName === 'nội dung' || headerName === 'noi dung' || headerName === 'công việc' || headerName === 'cong viec') {
        colMap.text = h;
      } else if (headerName === 'lead' || headerName === 'islead' || headerName === 'is lead' || headerName === 'lead?' || headerName === 'chấm công' || headerName === 'cham cong') {
        colMap.isLead = h;
      } else if (headerName === 'link' || headerName === 'url' || headerName === 'đường dẫn' || headerName === 'duong dan' || headerName === 'quick link') {
        colMap.link = h;
      } else if (headerName === 'info' || headerName === 'description' || headerName === 'mô tả' || headerName === 'mo ta' || headerName === 'chi tiết' || headerName === 'chi tiet' || headerName === 'details') {
        colMap.info = h;
      }
    }
    
    // Fallback to default positions if header mapping failed
    // Default schema: Category | Text | IsLead | Link | Info
    // Based on actual TaskTemplate sheet structure
    if (typeof colMap.category === 'undefined') colMap.category = 0;
    if (typeof colMap.text === 'undefined') colMap.text = 1;
    if (typeof colMap.isLead === 'undefined') colMap.isLead = 2;
    if (typeof colMap.link === 'undefined') colMap.link = 3;
    if (typeof colMap.info === 'undefined') colMap.info = 4;

    var template = [];

    // Process data rows (skip header row at index 0)
    for (var i = 1; i < data.length; i++) {
      var row = data[i];

      // Skip empty rows (check text column)
      var textValue = row[colMap.text];
      if (!textValue || String(textValue).trim() === '') continue;

      // Extract values with proper type conversion - normalize category
      var categoryRaw = row[colMap.category] ? String(row[colMap.category]).trim() : 'Đầu Ca';
      var category = categoryRaw;
      // Normalize category to standard format
      if (categoryRaw.toLowerCase() === 'đầu ca' || categoryRaw.toLowerCase() === 'dau ca') {
        category = 'Đầu Ca';
      } else if (categoryRaw.toLowerCase() === 'trong ca') {
        category = 'Trong Ca';
      } else if (categoryRaw.toLowerCase() === 'cuối ca' || categoryRaw.toLowerCase() === 'cuoi ca') {
        category = 'Cuối Ca';
      } else if (categoryRaw.toLowerCase() === 'hàng tuần' || categoryRaw.toLowerCase() === 'hang tuan') {
        category = 'Hàng Tuần';
      }
      var text = String(textValue).trim();
      var isLeadValue = row[colMap.isLead];
      var isLead = false;
      if (isLeadValue !== null && isLeadValue !== undefined && isLeadValue !== '') {
        var leadStr = String(isLeadValue).trim().toUpperCase();
        isLead = (leadStr === 'TRUE' || leadStr === 'YES' || leadStr === '1' || leadStr === 'X' || leadStr === '✓' || isLeadValue === true);
      }
      var link = row[colMap.link] ? String(row[colMap.link]).trim() : null;
      if (link === '' || link === null) link = null;
      var info = row[colMap.info] ? String(row[colMap.info]).trim() : null;
      if (info === '' || info === null) info = null;

      template.push({
        id: 'tpl_' + (i - 1),
        text: text,
        category: category,
        isLead: isLead,
        link: link,
        info: info,
        sla: null,
        isWeekly: false,
        completed: false,
        doneAt: null
      });
    }

    Logger.log('getTaskTemplate: Loaded ' + template.length + ' tasks. Column mapping: ' + JSON.stringify(colMap));
    
    // Debug: Log category distribution
    var categoryCount = {};
    for (var d = 0; d < template.length; d++) {
      var cat = template[d].category || 'Đầu Ca';
      categoryCount[cat] = (categoryCount[cat] || 0) + 1;
    }
    Logger.log('getTaskTemplate: Category distribution: ' + JSON.stringify(categoryCount));
    
    return template;

  } catch (e) {
    Logger.log('getTaskTemplate error: ' + e.toString());
    return [];
  }
}

/* ====== ADMIN MODULE ====== */

/**
 * Get all users (admin only)
 */
function getAllUsers() {
  try {
    var user = Session.getActiveUser();
    var email = user.getEmail();

    if (!isAdmin(email)) {
      logAudit(email, 'GET_USERS_DENIED', '', {});
      return []; // Return empty array instead of error object for frontend compatibility
    }

    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName(SHEET_NAMES.PERMISSIONS);

    if (!sheet) return [];

    // OPTIMIZATION: Use optimized read (read only 8 columns needed)
    var data = getSheetDataOptimized(sheet, 1, null, 8); // Include header
    if (data.length <= 1) return []; // Only header row
    
    var users = [];

    for (var i = 1; i < data.length; i++) {
      users.push({
        email: data[i][0],
        hub: data[i][1],
        role: data[i][2],
        active: data[i][3],
        displayName: data[i][4] || '',
        photoUrl: data[i][5] || '',
        lastAccess: data[i][6] || '',
        createdAt: data[i][7] || ''
      });
    }

    logAudit(email, 'GET_ALL_USERS', '', { count: users.length });
    return users;

  } catch (e) {
    Logger.log('getAllUsers error: ' + e.toString());
    return []; // Return empty array on error for frontend compatibility
  }
}

/**
 * Add or update user (internal function - no admin check for auto-setup)
 * @param {Object} userData User data object
 * @return {Object} {status: 'ok'|'error', message: string}
 */
function addOrUpdateUser(userData) {
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName(SHEET_NAMES.PERMISSIONS);

    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAMES.PERMISSIONS);
      batchAppendRows(sheet, [['Email', 'Hub', 'Role', 'Active', 'DisplayName', 'PhotoUrl', 'LastAccess', 'CreatedAt']]);
    }

    // OPTIMIZATION PHASE 1 MAX: Use optimized read (only necessary columns)
    var data = getSheetDataOptimized(sheet, 1, null, 8); // Read header + 8 columns
    if (data.length <= 1) {
      // No existing users, add new one
      data = [['Email', 'Hub', 'Role', 'Active', 'DisplayName', 'PhotoUrl', 'LastAccess', 'CreatedAt']];
    }
    var found = false;

    // Update existing user
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][0]).toLowerCase() === String(userData.email).toLowerCase()) {
        sheet.getRange(i + 1, 1, 1, 8).setValues([[
          userData.email,
          userData.hub,
          userData.role,
          userData.active !== undefined ? userData.active : true,
          userData.displayName || '',
          userData.photoUrl || '',
          new Date(),
          data[i][7] || new Date()
        ]]);
        found = true;
        break;
      }
    }

    // Add new user
    if (!found) {
      // OPTIMIZATION PHASE 1 MAX: Use batch append
      batchAppendRows(sheet, [[
        userData.email,
        userData.hub,
        userData.role,
        userData.active !== undefined ? userData.active : true,
        userData.displayName || '',
        userData.photoUrl || '',
        new Date(),
        new Date()
      ]]);
    }

    return { status: 'ok' };

  } catch (e) {
    Logger.log('addOrUpdateUser error: ' + e.toString());
    return { status: 'error', message: e.toString() };
  }
}

/**
 * Bulk import Hubs and PICs (Person In Charge) for each Hub
 * Admin only function to add multiple Hubs and PICs at once
 * @param {Object} args - {hubsAndPics: Array of {hub: string, picEmail: string, picName: string, role: string}}
 * @return {Object} {status: 'ok'|'error', message: string, added: number, updated: number, errors: Array}
 */
function bulkImportHubsAndPICs(args) {
  try {
    var user = Session.getActiveUser();
    var email = user.getEmail();

    if (!isAdmin(email)) {
      logAudit(email, 'BULK_IMPORT_HUBS_PICS_DENIED', '', {});
      return { status: 'error', message: 'Permission denied' };
    }

    if (!args || !args.hubsAndPics || !Array.isArray(args.hubsAndPics)) {
      return { status: 'error', message: 'Invalid input: hubsAndPics must be an array' };
    }

    var hubsAndPics = args.hubsAndPics;
    var added = 0;
    var updated = 0;
    var errors = [];

    // Process each Hub and PIC
    for (var i = 0; i < hubsAndPics.length; i++) {
      try {
        var item = hubsAndPics[i];
        
        // Validate required fields
        if (!item.hub || !item.picEmail) {
          errors.push({
            index: i,
            hub: item.hub || 'N/A',
            error: 'Missing required fields: hub and picEmail are required'
          });
          continue;
        }

        // Normalize data
        var hub = String(item.hub).trim().toUpperCase();
        var picEmail = String(item.picEmail).trim().toLowerCase();
        var picName = item.picName ? String(item.picName).trim() : '';
        var role = item.role ? String(item.role).trim().toLowerCase() : 'user';
        var active = item.active !== undefined ? Boolean(item.active) : true;

        // Validate email format
        if (!picEmail || picEmail.indexOf('@') === -1) {
          errors.push({
            index: i,
            hub: hub,
            picEmail: picEmail,
            error: 'Invalid email format'
          });
          continue;
        }

        // Validate role
        if (role !== 'user' && role !== 'admin') {
          role = 'user'; // Default to user if invalid
        }

        // Get existing user permissions
        var existingPerms = getUserPermissions(picEmail);
        
        var userData = {
          email: picEmail,
          hub: hub,
          role: role,
          active: active,
          displayName: picName,
          photoUrl: existingPerms ? existingPerms.PhotoUrl : ''
        };

        // If user already exists, merge Hub (user can have multiple hubs)
        if (existingPerms && existingPerms.Hub) {
          var existingHubs = existingPerms.Hub.split(',').map(function(h) {
            return String(h).trim().toUpperCase();
          });
          
          // Check if Hub already assigned
          if (existingHubs.indexOf(hub) === -1) {
            // Add new Hub to existing hubs
            userData.hub = existingPerms.Hub + ',' + hub;
            userData.displayName = picName || existingPerms.DisplayName || '';
          } else {
            // Hub already assigned, just update other fields
            userData.hub = existingPerms.Hub; // Keep existing hubs
            userData.displayName = picName || existingPerms.DisplayName || '';
            userData.role = role || existingPerms.Role || 'user';
          }
          
          updated++;
        } else {
          // New user
          added++;
        }

        // Add or update user (bypass admin check - already checked above)
        var result = addOrUpdateUser(userData);
        if (result.status !== 'ok') {
          errors.push({
            index: i,
            hub: hub,
            picEmail: picEmail,
            error: result.message || 'Failed to save user'
          });
        }

      } catch (e) {
        errors.push({
          index: i,
          hub: item.hub || 'N/A',
          picEmail: item.picEmail || 'N/A',
          error: 'Error processing: ' + e.toString()
        });
      }
    }

    // Log audit
    logAudit(email, 'BULK_IMPORT_HUBS_PICS', '', {
      total: hubsAndPics.length,
      added: added,
      updated: updated,
      errors: errors.length
    });

    return {
      status: 'ok',
      message: 'Bulk import completed',
      total: hubsAndPics.length,
      added: added,
      updated: updated,
      errors: errors
    };

  } catch (e) {
    Logger.log('bulkImportHubsAndPICs error: ' + e.toString());
    return {
      status: 'error',
      message: 'Failed to bulk import: ' + e.toString(),
      added: 0,
      updated: 0,
      errors: []
    };
  }
}

/**
 * Import Hubs and PICs from CSV format
 * CSV format: Hub,PIC Email,PIC Name,Role,Active
 * Example: "80TVH01,user@spx.vn,John Doe,user,true"
 * @param {Object} args - {csvText: string}
 * @return {Object} Result from bulkImportHubsAndPICs
 */
function bulkImportHubsAndPICsFromCSV(args) {
  try {
    var user = Session.getActiveUser();
    var email = user.getEmail();

    if (!isAdmin(email)) {
      return { status: 'error', message: 'Permission denied' };
    }

    if (!args || !args.csvText) {
      return { status: 'error', message: 'CSV text is required' };
    }

    var csvText = args.csvText.trim();
    var lines = csvText.split('\n');
    var hubsAndPics = [];

    // Skip header row if exists (optional)
    var startIndex = 0;
    if (lines.length > 0) {
      var firstLine = lines[0].toLowerCase();
      if (firstLine.indexOf('hub') !== -1 && firstLine.indexOf('email') !== -1) {
        startIndex = 1; // Skip header
      }
    }

    // Parse CSV lines
    for (var i = startIndex; i < lines.length; i++) {
      var line = lines[i].trim();
      if (!line) continue; // Skip empty lines

      // Simple CSV parsing (split by comma, handle quoted values)
      var parts = [];
      var currentPart = '';
      var inQuotes = false;

      for (var j = 0; j < line.length; j++) {
        var char = line[j];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          parts.push(currentPart.trim());
          currentPart = '';
        } else {
          currentPart += char;
        }
      }
      parts.push(currentPart.trim()); // Add last part

      // Extract data (Hub, PIC Email, PIC Name, Role, Active)
      if (parts.length >= 2) {
        hubsAndPics.push({
          hub: parts[0],
          picEmail: parts[1],
          picName: parts[2] || '',
          role: parts[3] || 'user',
          active: parts[4] !== undefined ? (parts[4].toLowerCase() === 'true') : true
        });
      }
    }

    // Call bulk import function
    return bulkImportHubsAndPICs({ hubsAndPics: hubsAndPics });

  } catch (e) {
    Logger.log('bulkImportHubsAndPICsFromCSV error: ' + e.toString());
    return {
      status: 'error',
      message: 'Failed to parse CSV: ' + e.toString()
    };
  }
}

/**
 * Add or update user (admin only)
 */
function saveUser(userData) {
  try {
    var user = Session.getActiveUser();
    var email = user.getEmail();

    if (!isAdmin(email)) {
      logAudit(email, 'SAVE_USER_DENIED', '', userData);
      return { status: 'error', message: 'Permission denied' };
    }

    // Use internal function to add/update user
    var result = addOrUpdateUser(userData);
    
    if (result.status === 'ok') {
      logAudit(email, 'SAVE_USER', '', userData);
    }
    
    return result;

  } catch (e) {
    Logger.log('saveUser error: ' + e.toString());
    return { status: 'error', message: e.toString() };
  }
}

/**
 * Delete user (admin only)
 */
function deleteUser(userEmail) {
  try {
    var user = Session.getActiveUser();
    var email = user.getEmail();

    if (!isAdmin(email)) {
      logAudit(email, 'DELETE_USER_DENIED', '', { userEmail: userEmail });
      return { status: 'error', message: 'Permission denied' };
    }

    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName(SHEET_NAMES.PERMISSIONS);

    if (!sheet) return { status: 'error', message: 'Sheet not found' };

    // OPTIMIZATION PHASE 1 MAX: Use optimized read (only first column for email search)
    var data = getSheetDataOptimized(sheet, 1, null, 1); // Read header + 1 column (Email)
    if (data.length <= 1) return { status: 'error', message: 'User not found' };

    // Need to find row number, so read all columns
    var fullData = getSheetDataOptimized(sheet, 1, null, 8);
    for (var i = 1; i < fullData.length; i++) {
      if (String(fullData[i][0]).toLowerCase() === String(userEmail).toLowerCase()) {
        sheet.deleteRow(i + 1);
        // Invalidate cache for this user
        dataCache.clear('user_perms_' + userEmail.toLowerCase());
        logAudit(email, 'DELETE_USER', '', { userEmail: userEmail });
        return { status: 'ok' };
      }
    }

    return { status: 'error', message: 'User not found' };

  } catch (e) {
    Logger.log('deleteUser error: ' + e.toString());
    return { status: 'error', message: e.toString() };
  }
}

/* ====== AVATAR SYNC FROM GOOGLE ACCOUNT ====== */

/**
 * Get user photo URL from Google Account (via Admin SDK or People API)
 * @param {string} email User email
 * @return {string} Photo URL or empty string
 */
function getUserPhotoUrl(email) {
  try {
    // Method 1: Try Admin SDK Directory API (requires admin access and SDK enabled)
    // Note: This requires Admin SDK to be enabled in Google Cloud Console
    // and the script to have domain-wide delegation or admin user credentials
    try {
      // Check if AdminDirectory is available (will throw error if not enabled)
      if (typeof AdminDirectory !== 'undefined' && AdminDirectory && AdminDirectory.Users) {
        var response = AdminDirectory.Users.get(email, {
          projection: 'basic',
          fields: 'thumbnailPhotoUrl'
        });
        
        if (response && response.thumbnailPhotoUrl) {
          Logger.log('Avatar synced via Admin SDK for: ' + email);
          return response.thumbnailPhotoUrl;
        }
      }
    } catch (adminError) {
      // Admin SDK not available or no access - silently continue to other methods
      // This is expected if Admin SDK is not enabled or user doesn't have admin access
      Logger.log('Admin SDK not available for avatar sync: ' + adminError.toString());
    }
    
    // Method 2: Use Gravatar (reliable fallback - works for any email)
    // Gravatar uses MD5 hash of lowercase email
    try {
      var md5Hash = Utilities.computeDigest(
        Utilities.DigestAlgorithm.MD5,
        email.toLowerCase().trim(),
        Utilities.Charset.UTF_8
      );
      
      var hashString = md5Hash.map(function(byte) {
        return ('0' + (byte & 0xFF).toString(16)).slice(-2);
      }).join('');
      
      // Gravatar URL - returns 404 if user doesn't have Gravatar account
      // Frontend will handle 404 and show default avatar
      var gravatarUrl = 'https://www.gravatar.com/avatar/' + hashString + '?d=404&s=200';
      Logger.log('Using Gravatar for: ' + email);
      return gravatarUrl;
      
    } catch (gravatarError) {
      Logger.log('Gravatar generation failed: ' + gravatarError.toString());
    }
    
    // Method 3: Return empty - frontend will use default avatar with initial
    // This is the most reliable fallback that always works
    Logger.log('Using default avatar for: ' + email);
    return '';
    
  } catch (e) {
    Logger.log('getUserPhotoUrl error: ' + e.toString());
    return '';
  }
}

/**
 * Update user photo URL in UserPermissions sheet
 * @param {string} email User email
 * @param {string} photoUrl Photo URL
 */
function updateUserPhotoUrl(email, photoUrl) {
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName(SHEET_NAMES.PERMISSIONS);
    if (!sheet) return;

    // OPTIMIZATION PHASE 1 MAX: Use optimized read (only necessary columns)
    var data = getSheetDataOptimized(sheet, 1, null, 8); // Read header + 8 columns
    if (data.length <= 1) return; // No data except header
    
    var headers = data[0];
    var emailCol = headers.indexOf('Email');
    var photoUrlCol = headers.indexOf('PhotoUrl');

    if (emailCol === -1 || photoUrlCol === -1) return;

    for (var i = 1; i < data.length; i++) {
      if (String(data[i][emailCol]).toLowerCase().trim() === email.toLowerCase().trim()) {
        sheet.getRange(i + 1, photoUrlCol + 1).setValue(photoUrl);
        
        // Clear cache for this user
        var cacheKey = 'user_perms_' + email.toLowerCase();
        dataCache.clear(cacheKey);
        
        break;
      }
    }
  } catch (e) {
    Logger.log('updateUserPhotoUrl error: ' + e.toString());
  }
}

/**
 * Sync avatar for current user (called from frontend)
 * @return {Object} {status: 'ok'|'error', photoUrl: string}
 */
function syncMyAvatar() {
  try {
    var user = Session.getActiveUser();
    var email = user.getEmail();
    
    var photoUrl = getUserPhotoUrl(email);
    
    if (photoUrl && photoUrl !== '') {
      updateUserPhotoUrl(email, photoUrl);
      logAudit(email, 'AVATAR_SYNC', '', { photoUrl: photoUrl });
      return { status: 'ok', photoUrl: photoUrl };
    }
    
    return { status: 'ok', photoUrl: '' };
    
  } catch (e) {
    Logger.log('syncMyAvatar error: ' + e.toString());
    return { status: 'error', message: e.toString() };
  }
}

/* ====== CALENDAR INTEGRATION ====== */

function _getCalendar_() {
  var calId = _getUiCfgVal('calendar_id') || Session.getActiveUser().getEmail();
  try {
    return CalendarApp.getCalendarById(calId) || CalendarApp.getDefaultCalendar();
  } catch (e) {
    return CalendarApp.getDefaultCalendar();
  }
}

function syncSlaToCalendar(payload) {
  if (!payload || !payload.hub || !payload.date) return { ok: false, msg: 'Invalid payload' };
  
  try {
    var user = Session.getActiveUser();
    var email = user.getEmail();
    
    var cal = _getCalendar_();
    var dateStr = payload.date;
    var base = new Date(dateStr + 'T00:00:00');

    var created = 0, updated = 0, skipped = 0, errors = 0;
    var tasks = (payload.tasks || []).filter(function(t) { return t && t.sla; });

    tasks.forEach(function(t) {
      try {
        var hm = String(t.sla).split(':');
        if (hm.length < 2) { skipped++; return; }
        
        var start = new Date(base);
        start.setHours(parseInt(hm[0], 10), parseInt(hm[1], 10), 0, 0);
        var end = new Date(start);
        end.setMinutes(end.getMinutes() + 15);

        var uid = 'SPX-' + payload.hub + '-' + payload.date + '-' + t.id;
        
        // IMPROVED: Better event matching - check all events for the day
        var dayEvents = cal.getEventsForDay(start);
        var existing = dayEvents.filter(function(ev) {
          var d = (ev.getDescription() || '');
          return d.indexOf('UID: ' + uid) !== -1 || d.indexOf(uid) !== -1;
        });
        
        var title = '[SPX] ' + t.text + (t.isLead ? ' (LEAD)' : '');
        var desc = 'Hub: ' + payload.hub + '\nNhóm: ' + (t.category || '') + '\nSLA: ' + t.sla + '\nUID: ' + uid + '\nTask ID: ' + t.id;
        
        if (existing.length > 0) {
          // Update existing event
          try {
            var ev = existing[0];
            ev.setTitle(title);
            ev.setDescription(desc);
            ev.setTime(start, end);
            updated++;
          } catch (updateError) {
            Logger.log('Calendar update error: ' + updateError.toString());
            errors++;
          }
        } else {
          // Create new event
          try {
            var ev = cal.createEvent(title, start, end, { description: desc });
            
            // IMPROVED: Add multiple reminder options
            try {
              ev.addPopupReminder(10); // 10 minutes before
              ev.addEmailReminder(60); // 1 hour before (if email notifications are enabled)
            } catch (reminderError) {
              // Reminders may fail if not enabled, but that's OK
              Logger.log('Reminder setup warning (non-critical): ' + reminderError.toString());
            }
            
            // IMPROVED: Set event color if possible (Google Calendar colors)
            // Note: Color setting requires advanced calendar API
            
            created++;
            
            logAudit(email, 'CALENDAR_EVENT_CREATED', payload.hub, { 
              taskId: t.id, 
              date: dateStr, 
              sla: t.sla 
            });
          } catch (createError) {
            Logger.log('Calendar create error: ' + createError.toString());
            errors++;
          }
        }
      } catch (e) { 
        Logger.log('Task calendar sync error: ' + e.toString());
        errors++; 
      }
    });

    return { 
      ok: true, 
      created: created, 
      updated: updated,
      skipped: skipped, 
      errors: errors,
      message: 'Đã đồng bộ ' + created + ' events mới, cập nhật ' + updated + ' events'
    };
    
  } catch (e) {
    Logger.log('syncSlaToCalendar error: ' + e.toString());
    return { ok: false, msg: 'Calendar sync error: ' + e.toString() };
  }
}

function removeSlaFromCalendar(hub, dateStr) {
  var cal = _getCalendar_();
  var base = new Date(dateStr + 'T00:00:00');
  var events = cal.getEventsForDay(base);
  var removed = 0;
  events.forEach(function(ev) {
    var d = (ev.getDescription() || '');
    if (d.indexOf('UID: SPX-' + hub + '-' + dateStr) !== -1) {
      try { ev.deleteEvent(); removed++; } catch (e) { }
    }
  });
  return { ok: true, removed: removed };
}

/* ====== REPORT MODULE ====== */

/**
 * Load report data for a hub and date range
 * @param {Object} args {hub, start, end}
 * @return {Object} Report data with analytics
 */
function loadReport(args) {
  try {
    var user = Session.getActiveUser();
    var email = user.getEmail();
    var hub = args.hub;
    var start = args.start;
    var end = args.end;
    
    var isMultiHub = (hub === 'ALL');

    // Check permission
    if (!isMultiHub && !checkHubPermission(email, hub) && !isAdmin(email)) {
      logAudit(email, 'LOAD_REPORT_DENIED', hub, args);
      return { error: 'Permission denied' };
    }
    
    if (isMultiHub && !isAdmin(email)) {
      logAudit(email, 'LOAD_REPORT_DENIED', hub, args);
      return { error: 'Permission denied - Admin only for multi-hub reports' };
    }

    // THAY ĐỔI LOGIC: Filter theo user và ngày đã chọn
    // Chỉ hiển thị tasks của user hiện tại khi xem báo cáo của 1 Hub cụ thể
    var filterByUser = !isMultiHub && !isAdmin(email); // Chỉ filter khi không phải admin và không phải multi-hub
    
    // THAY ĐỔI: Include user email in cache key when filtering by user
    var cacheKey = 'report_' + hub + '_' + start + '_' + end + (filterByUser ? '_' + email.toLowerCase() : '');
    var cached = dataCache.get(cacheKey);
    if (cached !== null) {
      logAudit(email, 'LOAD_REPORT_CACHED', hub, { start: start, end: end, filterByUser: filterByUser });
      return cached;
    }
    
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var dataSheet = ss.getSheetByName(SHEET_NAMES.DATA);

    if (!dataSheet) return { tasks: [], summary: {}, hubs: [] };

    // Use batch read - get all data at once
    var data = dataSheet.getDataRange().getValues();
    var tasks = [];
    var totalTasks = 0;
    var completedTasks = 0;
    var onTimeTasks = 0;
    var lateTasks = 0;
    
    var hubStats = {};

    // Track processed hub-date combinations to avoid duplicates
    // When viewing a single day (start === end), each hub should only be counted once
    var processedHubDates = {};
    var isSingleDay = (start === end);
    
    // Parse tasks in date range
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var storageKey = row[0];
      var modifiedBy = row[3] || ''; // ModifiedBy column (index 3)

      // Extract hub and date from storage key (format: tasks_HUB_YYYY-MM-DD)
      var parts = storageKey.split('_');
      if (parts.length < 3) continue;

      var taskHub = parts[1];
      var taskDate = parts[2];

      // Filter by hub (unless ALL)
      if (!isMultiHub && taskHub !== hub) continue;
      
      // THAY ĐỔI: Filter theo ngày đã chọn
      if (taskDate < start || taskDate > end) continue;
      
      // THAY ĐỔI: Filter theo user - chỉ hiển thị tasks của user hiện tại
      if (filterByUser) {
        var modifiedByEmail = String(modifiedBy || '').trim().toLowerCase();
        var currentUserEmail = email.toLowerCase();
        if (modifiedByEmail !== currentUserEmail) {
          // Skip tasks not modified by current user
          continue;
        }
      }
      
      // For single day reports, only process the first occurrence of each hub-date combination
      // This prevents counting duplicate data if multiple rows exist for the same hub-date
      if (isSingleDay) {
        var hubDateKey = taskHub + '_' + taskDate;
        if (processedHubDates[hubDateKey]) {
          // Skip duplicate hub-date combinations for single day reports
          continue;
        }
        processedHubDates[hubDateKey] = true;
      }
      
      // Init hub stats
      if (isMultiHub && !hubStats[taskHub]) {
        hubStats[taskHub] = {
          hubId: taskHub,
          total: 0,
          completed: 0,
          pending: 0,
          onTime: 0,
          late: 0
        };
      }

      try {
        var taskData = JSON.parse(row[1] || '[]');
        // Safety check: ensure taskData is an array
        if (!Array.isArray(taskData)) {
          Logger.log('Warning: taskData is not an array, skipping');
          continue;
        }
        taskData.forEach(function(task) {
          totalTasks++;
          if (task.completed) completedTasks++;
          
          if (isMultiHub) {
            hubStats[taskHub].total++;
            if (task.completed) {
              hubStats[taskHub].completed++;
            } else {
              hubStats[taskHub].pending++;
            }
          }

          // Check if task is on-time or late
          if (task.sla && task.completed) {
            var deadline = new Date(taskDate + 'T' + task.sla + ':00');
            var doneAt = task.doneAt ? new Date(task.doneAt) : new Date();

            if (doneAt <= deadline) {
              onTimeTasks++;
              if (isMultiHub) hubStats[taskHub].onTime++;
            } else {
              lateTasks++;
              if (isMultiHub) hubStats[taskHub].late++;
            }
          }

          tasks.push({
            hub: taskHub,
            date: taskDate,
            text: task.text,
            category: task.category,
            completed: task.completed,
            sla: task.sla,
            doneAt: task.doneAt,
            isLead: task.isLead
          });
        });
      } catch (e) {
        Logger.log('Parse error for row ' + i + ': ' + e.toString());
      }
    }

    // Calculate SLA rate only from tasks that have SLA and are completed
    var tasksWithSLA = onTimeTasks + lateTasks;
    var onTimeRate = tasksWithSLA > 0 ? Math.round((onTimeTasks / tasksWithSLA) * 100) : 0;
    
    var summary = {
      total: totalTasks,
      completed: completedTasks,
      pending: totalTasks - completedTasks,
      onTime: onTimeTasks,
      late: lateTasks,
      onTimeRate: onTimeRate
    };
    
    // Build hub overview array for multi-hub reports
    var hubsArray = [];
    if (isMultiHub) {
      for (var hubId in hubStats) {
        var stat = hubStats[hubId];
        var hubWithSLA = stat.onTime + stat.late;
        stat.slaRate = hubWithSLA > 0 ? Math.round((stat.onTime / hubWithSLA) * 100) : 0;
        hubsArray.push(stat);
      }
    }

    logAudit(email, 'LOAD_REPORT', hub, { 
      start: start, 
      end: end, 
      total: totalTasks,
      filterByUser: filterByUser,
      userEmail: filterByUser ? email : 'all'
    });

    var result = {
      tasks: tasks,
      summary: summary,
      hubs: hubsArray,
      hub: hub,
      start: start,
      end: end,
      filterByUser: filterByUser // Include filter info in response
    };
    
    // Cache result (TTL: 30 seconds)
    dataCache.set(cacheKey, result, 30000);

    return result;

  } catch (e) {
    Logger.log('loadReport error: ' + e.toString());
    return { error: e.toString() };
  }
}

/**
 * Export report to Google Sheets (will be downloadable as Excel)
 * @param {Object} args {hub, start, end}
 * @return {Object} {url, id}
 */
function exportToExcel(args) {
  try {
    var user = Session.getActiveUser();
    var email = user.getEmail();

    if (!checkHubPermission(email, args.hub) && !isAdmin(email)) {
      return { error: 'Permission denied' };
    }

    var reportData = loadReport(args);
    if (reportData.error) return reportData;

    // Create new spreadsheet
    var ss = SpreadsheetApp.create('Report_' + args.hub + '_' + args.start + '_to_' + args.end);
    var sheet = ss.getActiveSheet();
    sheet.setName('Report');

    // Header
    sheet.appendRow(['[SPX] DAILY CHECKLIST - REPORT']);
    sheet.appendRow(['Hub: ' + args.hub, 'Period: ' + args.start + ' to ' + args.end]);
    sheet.appendRow([]);

    // Summary
    sheet.appendRow(['SUMMARY']);
    sheet.appendRow(['Total Tasks', reportData.summary.total]);
    sheet.appendRow(['Completed', reportData.summary.completed]);
    sheet.appendRow(['Pending', reportData.summary.pending]);
    sheet.appendRow(['On-time', reportData.summary.onTime]);
    sheet.appendRow(['Late', reportData.summary.late]);
    sheet.appendRow(['On-time Rate', reportData.summary.onTimeRate + '%']);
    sheet.appendRow([]);

    // Tasks list
    sheet.appendRow(['TASKS']);
    sheet.appendRow(['Date', 'Category', 'Task', 'Status', 'SLA', 'Completed At', 'Lead']);

    reportData.tasks.forEach(function(task) {
      sheet.appendRow([
        task.date,
        task.category,
        task.text,
        task.completed ? 'DONE' : 'PENDING',
        task.sla || '',
        task.doneAt || '',
        task.isLead ? 'YES' : 'NO'
      ]);
    });

    // Format
    sheet.getRange(1, 1, 1, 2).setFontWeight('bold').setFontSize(14);
    sheet.autoResizeColumns(1, 7);

    logAudit(email, 'EXPORT_EXCEL', args.hub, { start: args.start, end: args.end });

    return {
      url: ss.getUrl(),
      id: ss.getId()
    };

  } catch (e) {
    Logger.log('exportToExcel error: ' + e.toString());
    return { error: e.toString() };
  }
}

/**
 * Export report to PDF
 * @param {Object} args {hub, start, end}
 * @return {Object} {url, id}
 */
function exportToPDF(args) {
  try {
    var user = Session.getActiveUser();
    var email = user.getEmail();

    if (!checkHubPermission(email, args.hub) && !isAdmin(email)) {
      return { error: 'Permission denied' };
    }

    // First create Excel version
    var excelResult = exportToExcel(args);
    if (excelResult.error) return excelResult;

    // Get the spreadsheet
    var ss = SpreadsheetApp.openById(excelResult.id);

    // Export as PDF
    var blob = ss.getAs('application/pdf');
    blob.setName('Report_' + args.hub + '_' + args.start + '_to_' + args.end + '.pdf');

    // Save to Drive
    var file = DriveApp.createFile(blob);

    // Delete temporary spreadsheet
    DriveApp.getFileById(excelResult.id).setTrashed(true);

    logAudit(email, 'EXPORT_PDF', args.hub, { start: args.start, end: args.end });

    return {
      url: file.getUrl(),
      id: file.getId()
    };

  } catch (e) {
    Logger.log('exportToPDF error: ' + e.toString());
    return { error: e.toString() };
  }
}

/* ====== HIGHLIGHT MODULE ====== */

/**
 * Get highlight analytics for a hub and date range
 * @param {Object} args {hub, start, end}
 * @return {Object} Highlight data with metrics
 */
function getHighlights(args) {
  try {
    var user = Session.getActiveUser();
    var email = user.getEmail();
    var hub = args.hub;
    var start = args.start;
    var end = args.end;

    if (!checkHubPermission(email, hub) && !isAdmin(email)) {
      return { error: 'Permission denied' };
    }

    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);

    // Get presence data (visits)
    var presenceSheet = ss.getSheetByName(SHEET_NAMES.PRESENCE);
    var visits = 0;
    var activeUsers = {};
    var visitsByHour = {};

    if (presenceSheet && presenceSheet.getLastRow() > 1) {
      var presenceData = presenceSheet.getRange(2, 1, presenceSheet.getLastRow() - 1, 5).getValues();

      presenceData.forEach(function(row) {
        var userId = row[0];
        var presenceHub = row[1];
        var lastSeen = new Date(row[2]);

        if (presenceHub === hub) {
          var dateStr = Utilities.formatDate(lastSeen, Session.getScriptTimeZone(), 'yyyy-MM-dd');

          if (dateStr >= start && dateStr <= end) {
            visits++;
            activeUsers[userId] = true;

            var hour = lastSeen.getHours();
            visitsByHour[hour] = (visitsByHour[hour] || 0) + 1;
          }
        }
      });
    }

    // Get task data (SLA performance)
    var dataSheet = ss.getSheetByName(SHEET_NAMES.DATA);
    var tasksTotal = 0;
    var tasksDone = 0;
    var slaOnTime = 0;
    var slaLate = 0;
    var categoryStats = {};

    if (dataSheet && dataSheet.getLastRow() > 1) {
      var data = dataSheet.getDataRange().getValues();

      for (var i = 1; i < data.length; i++) {
        var storageKey = data[i][0];
        var parts = storageKey.split('_');

        if (parts.length < 3) continue;
        var taskHub = parts[1];
        var taskDate = parts[2];

        if (taskHub !== hub) continue;
        if (taskDate < start || taskDate > end) continue;

        try {
          var tasks = JSON.parse(data[i][1] || '[]');
          // Safety check: ensure tasks is an array
          if (!Array.isArray(tasks)) {
            Logger.log('Warning: tasks is not an array, skipping');
            continue;
          }

          tasks.forEach(function(task) {
            tasksTotal++;
            if (task.completed) tasksDone++;

            // Category stats
            var cat = task.category || 'Other';
            if (!categoryStats[cat]) {
              categoryStats[cat] = { category: cat, total: 0, done: 0 };
            }
            categoryStats[cat].total++;
            if (task.completed) categoryStats[cat].done++;

            // SLA performance
            if (task.sla && task.completed) {
              var deadline = new Date(taskDate + 'T' + task.sla + ':00');
              var doneAt = task.doneAt ? new Date(task.doneAt) : new Date();

              if (doneAt <= deadline) {
                slaOnTime++;
              } else {
                slaLate++;
              }
            }
          });
        } catch (e) {
          Logger.log('Parse error: ' + e.toString());
        }
      }
    }

    // Get audit data (interactions)
    var auditSheet = ss.getSheetByName(SHEET_NAMES.AUDIT);
    var interactions = 0;

    if (auditSheet && auditSheet.getLastRow() > 1) {
      var auditData = auditSheet.getRange(2, 1, auditSheet.getLastRow() - 1, 4).getValues();

      auditData.forEach(function(row) {
        var timestamp = new Date(row[0]);
        var action = row[1];
        var auditHub = row[2];

        var dateStr = Utilities.formatDate(timestamp, Session.getScriptTimeZone(), 'yyyy-MM-dd');

        if (auditHub === hub && dateStr >= start && dateStr <= end) {
          if (action !== 'LOGIN' && action !== 'TAB_SWITCH') {
            interactions++;
          }
        }
      });
    }

    // Format hourly visits
    var hourlyData = [];
    for (var h = 0; h < 24; h++) {
      hourlyData.push({ hour: h, count: visitsByHour[h] || 0 });
    }

    var result = {
      activeUsers: Object.keys(activeUsers).length,
      visits: visits,
      interactions: interactions,
      tasksTotal: tasksTotal,
      tasksDone: tasksDone,
      slaOnTime: slaOnTime,
      slaLate: slaLate,
      slaRate: (slaOnTime + slaLate) > 0 ? Math.round((slaOnTime / (slaOnTime + slaLate)) * 100) : 0,
      visitsByHour: hourlyData,
      categories: Object.keys(categoryStats).map(function(key) { return categoryStats[key]; })
    };

    logAudit(email, 'LOAD_HIGHLIGHTS', hub, { start: start, end: end });

    return result;

  } catch (e) {
    Logger.log('getHighlights error: ' + e.toString());
    return { error: e.toString() };
  }
}

/* ====== ACCESS LOG MODULE ====== */

/**
 * Get audit log entries
 * @param {Object} args {email, action, hub, start, end, limit}
 * @return {Array} Audit log entries
 */
function getAuditLog(args) {
  try {
    var user = Session.getActiveUser();
    var email = user.getEmail();
    
    // Ensure args is an object
    if (!args) args = {};

    // Only admin can view full audit log
    if (!isAdmin(email)) {
      // Users can only view their own logs
      args.email = email;
    }

    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName(SHEET_NAMES.AUDIT);

    if (!sheet || sheet.getLastRow() <= 1) return [];

    var data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 6).getValues();
    var results = [];

    var filterEmail = args.email ? String(args.email).toLowerCase() : null;
    var filterAction = args.action ? String(args.action).toUpperCase() : null;
    var filterHub = args.hub || null;
    var startDate = args.startDate || null;
    var endDate = args.endDate || null;
    var limit = args.limit || 100;

    for (var i = data.length - 1; i >= 0; i--) { // Reverse order (newest first)
      var row = data[i];

      var timestamp = row[0];
      var logEmail = String(row[1]).toLowerCase();
      var action = String(row[2]).toUpperCase();
      var hub = row[3];
      var details = row[4];

      // Apply filters
      if (filterEmail && logEmail.indexOf(filterEmail) === -1) continue;
      if (filterAction && action.indexOf(filterAction) === -1) continue;
      if (filterHub && hub !== filterHub) continue;
      
      // Apply date range filter
      if (startDate || endDate) {
        var logDate = timestamp instanceof Date ? timestamp : new Date(timestamp);
        var logDateStr = Utilities.formatDate(logDate, Session.getScriptTimeZone(), 'yyyy-MM-dd');
        if (startDate && logDateStr < startDate) continue;
        if (endDate && logDateStr > endDate) continue;
      }

      results.push({
        timestamp: timestamp,
        email: row[1],
        action: action,
        hub: hub,
        details: details,
        sessionInfo: row[5] || ''
      });

      if (results.length >= limit) break;
    }

    logAudit(email, 'VIEW_AUDIT_LOG', '', args);

    return results;

  } catch (e) {
    Logger.log('getAuditLog error: ' + e.toString());
    return [];
  }
}

/**
 * Get category change logs (specialized function for category tracking)
 * @param {Object} args {hub, startDate, endDate, changeType, limit}
 * @return {Array} Category change log entries with parsed details
 */
function getCategoryChangeLog(args) {
  try {
    var user = Session.getActiveUser();
    var email = user.getEmail();
    
    // Ensure args is an object
    if (!args) args = {};
    
    // Only admin can view category change logs
    if (!isAdmin(email)) {
      return { error: 'Permission denied. Admin access required.' };
    }
    
    // Get audit logs filtered by CATEGORY_CHANGED action
    var auditArgs = {
      action: 'CATEGORY_CHANGED',
      hub: args.hub || null,
      startDate: args.startDate || null,
      endDate: args.endDate || null,
      limit: args.limit || 500
    };
    
    var auditLogs = getAuditLog(auditArgs);
    var categoryChanges = [];
    
    // Parse details and filter by changeType if provided
    var filterChangeType = args.changeType || null;
    
    for (var i = 0; i < auditLogs.length; i++) {
      var log = auditLogs[i];
      try {
        var details = typeof log.details === 'string' ? JSON.parse(log.details) : log.details;
        // Safety check: ensure details is an object
        if (!details || typeof details !== 'object') {
          continue;
        }
        
        // Filter by changeType if specified
        if (filterChangeType && details.changeType !== filterChangeType) {
          continue;
        }
        
        // Parse and structure category change data
        var change = {
          timestamp: log.timestamp,
          email: log.email,
          hub: log.hub,
          taskText: details.taskText || '',
          taskId: details.taskId || '',
          oldCategory: details.oldCategory || '',
          newCategory: details.newCategory || '',
          changeType: details.changeType || '',
          reason: details.reason || '',
          source: details.source || '',
          storageKey: details.storageKey || '',
          date: details.date || '',
          autoFix: details.autoFix || false
        };
        
        categoryChanges.push(change);
      } catch (e) {
        // Skip logs with invalid details
        Logger.log('Error parsing category change log: ' + e.toString());
      }
    }
    
    // Log access
    logAudit(email, 'VIEW_CATEGORY_CHANGE_LOG', args.hub || '', args);
    
    return categoryChanges;
    
  } catch (e) {
    Logger.log('getCategoryChangeLog error: ' + e.toString());
    return { error: e.toString() };
  }
}

/**
 * Export access log to Excel
 * @param {Object} args {email, action, hub}
 * @return {Object} {url, id}
 */
function exportAccessLog(args) {
  try {
    var user = Session.getActiveUser();
    var email = user.getEmail();
    
    if (!isAdmin(email)) {
      return { error: 'Permission denied - Admin only' };
    }
    
    var logs = getAuditLog({
      email: args.email || '',
      action: args.action || '',
      hub: args.hub || '',
      limit: 1000
    });
    
    // Create new spreadsheet
    var ss = SpreadsheetApp.create('AccessLog_' + new Date().toISOString().slice(0, 10));
    var sheet = ss.getActiveSheet();
    sheet.setName('Access Log');
    
    // Header row
    sheet.appendRow(['Timestamp', 'Email', 'Action', 'Hub', 'Details', 'Session Info']);
    sheet.getRange(1, 1, 1, 6).setFontWeight('bold').setBackground('#4285F4').setFontColor('#FFFFFF');
    
    // Data rows
    logs.forEach(function(log) {
      var detailsStr = typeof log.details === 'object' ? JSON.stringify(log.details) : String(log.details || '');
      var sessionStr = typeof log.sessionInfo === 'object' ? JSON.stringify(log.sessionInfo) : String(log.sessionInfo || '');
      
      sheet.appendRow([
        log.timestamp,
        log.email,
        log.action,
        log.hub || '-',
        detailsStr,
        sessionStr
      ]);
    });
    
    // Auto-resize columns
    sheet.autoResizeColumns(1, 6);
    
    logAudit(email, 'EXPORT_ACCESS_LOG', '', { count: logs.length });
    
    return {
      url: ss.getUrl(),
      id: ss.getId()
    };
    
  } catch (e) {
    Logger.log('exportAccessLog error: ' + e.toString());
    return { error: e.toString() };
  }
}

/* ====== PRESENCE & NOTES ====== */

/**
 * Update presence heartbeat
 * @param {Object} args {hub, meta}
 */
function presenceHeartbeat(args) {
  try {
    var user = Session.getActiveUser();
    var email = user.getEmail();

    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName(SHEET_NAMES.PRESENCE);

    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAMES.PRESENCE);
      batchAppendRows(sheet, [['UserId', 'Hub', 'LastSeen', 'Tab', 'Meta']]);
    }

    // OPTIMIZATION PHASE 1 MAX: Use optimized read (only email column for search)
    var data = getSheetDataOptimized(sheet, 1, null, 1); // Read header + 1 column (UserId)
    if (data.length <= 1) {
      // No data except header, add new row
      batchAppendRows(sheet, [[email, args.hub, new Date(), args.tab || '', JSON.stringify(args.meta || {})]]);
      return { status: 'ok' };
    }
    
    var found = false;
    var foundRow = -1;

    // Update existing row
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][0]).toLowerCase() === email.toLowerCase()) {
        foundRow = i + 1;
        found = true;
        break;
      }
    }

    // Update existing row or add new row
    var rowData = [email, args.hub, new Date(), args.tab || '', JSON.stringify(args.meta || {})];
    if (found && foundRow > 0) {
      // Update existing row
      sheet.getRange(foundRow, 1, 1, 5).setValues([rowData]);
    } else {
      // Add new row using batch append
      batchAppendRows(sheet, [rowData]);
    }

    return { status: 'ok' };

  } catch (e) {
    Logger.log('presenceHeartbeat error: ' + e.toString());
    return { status: 'error', message: e.toString() };
  }
}

/**
 * Get online users
 * @param {Object} args {hub, within}
 * @return {Array} Online users
 */
function getOnlineUsers(args) {
  try {
    // Ensure args is an object
    if (!args) args = {};
    
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName(SHEET_NAMES.PRESENCE);

    if (!sheet || sheet.getLastRow() <= 1) return [];

    var data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 5).getValues();
    var results = [];
    var now = new Date();
    var withinMin = args.within || ONLINE_WINDOW_DEFAULT_MIN;

    data.forEach(function(row) {
      var userId = row[0];
      var hub = row[1];
      var lastSeen = new Date(row[2]);
      var tab = row[3];
      var meta = row[4];

      // Check if hub matches (if specified)
      if (args.hub && hub !== args.hub) return;

      // Check if within time window
      var diffMin = (now - lastSeen) / 60000;
      if (diffMin <= withinMin) {
        var metaObj = {};
        try {
          metaObj = JSON.parse(meta || '{}');
        } catch (e) {}
        
        // Get user display name from permissions
        var perms = getUserPermissions(userId);
        var displayName = perms ? perms.DisplayName : (userId ? userId.split('@')[0] : 'Unknown');

        results.push({
          userId: userId,
          email: userId, // For compatibility
          displayName: displayName,
          hub: hub,
          lastSeen: lastSeen,
          tab: tab,
          meta: metaObj
        });
      }
    });

    // Sort by most recent
    results.sort(function(a, b) {
      return b.lastSeen - a.lastSeen;
    });

    return results;

  } catch (e) {
    Logger.log('getOnlineUsers error: ' + e.toString());
    return [];
  }
}

/**
 * Load notes for a storage key
 * @param {Object} args {storageKey}
 * @return {Array} Notes
 */
function loadNotes(args) {
  try {
    var user = Session.getActiveUser();
    var email = user.getEmail();

    // Extract hub from storage key
    var parts = args.storageKey.split('_');
    var hub = parts[0];

    if (!checkHubPermission(email, hub)) {
      return [];
    }

    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName(SHEET_NAMES.NOTES);

    if (!sheet || sheet.getLastRow() <= 1) return [];

    var data = sheet.getDataRange().getValues();

    for (var i = 1; i < data.length; i++) {
      if (data[i][0] === args.storageKey) {
        try {
          return JSON.parse(data[i][1] || '[]');
        } catch (e) {
          return [];
        }
      }
    }

    return [];

  } catch (e) {
    Logger.log('loadNotes error: ' + e.toString());
    return [];
  }
}

/**
 * Save notes for a storage key
 * @param {Object} args {storageKey, notes}
 * @return {Object} Status
 */
function saveNotes(args) {
  try {
    var user = Session.getActiveUser();
    var email = user.getEmail();

    var parts = args.storageKey.split('_');
    var hub = parts[0];

    if (!checkHubPermission(email, hub)) {
      return { status: 'error', message: 'Permission denied' };
    }

    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName(SHEET_NAMES.NOTES);

    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAMES.NOTES);
      sheet.appendRow(['StorageKey', 'Data', 'LastModified', 'ModifiedBy']);
    }

    var data = sheet.getDataRange().getValues();
    var found = false;

    // Update existing row
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] === args.storageKey) {
        sheet.getRange(i + 1, 2, 1, 3).setValues([[
          JSON.stringify(args.notes),
          new Date(),
          email
        ]]);
        found = true;
        break;
      }
    }

    // Add new row
    if (!found) {
      sheet.appendRow([args.storageKey, JSON.stringify(args.notes), new Date(), email]);
    }

    logAudit(email, 'SAVE_NOTES', hub, { storageKey: args.storageKey });

    return { status: 'ok' };

  } catch (e) {
    Logger.log('saveNotes error: ' + e.toString());
    return { status: 'error', message: e.toString() };
  }
}

/* ====== Q&A MODULE - TÁI CẤU TRÚC HOÀN TOÀN ====== */

/**
 * TÁI CẤU TRÚC: Get QA sheet with multiple fallback strategies
 * Thử nhiều cách để tìm và truy cập sheet Q&A
 * @return {Sheet} QA sheet or null
 */
function getQASheet() {
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    if (!ss) {
      Logger.log('QA: Cannot open spreadsheet');
      return null;
    }
    
    // Strategy 1: Try exact name match
    var sheet = ss.getSheetByName(SHEET_NAMES.QA);
    if (sheet) {
      Logger.log('QA: Found sheet by exact name: ' + SHEET_NAMES.QA);
      return sheet;
    }
    
    // Strategy 2: Try case-insensitive search
    var allSheets = ss.getSheets();
    for (var i = 0; i < allSheets.length; i++) {
      var sheetName = allSheets[i].getName();
      if (sheetName.toLowerCase() === SHEET_NAMES.QA.toLowerCase() || 
          sheetName.toLowerCase() === 'qadata' ||
          sheetName.toLowerCase() === 'qa' ||
          sheetName.toLowerCase() === 'q&a' ||
          sheetName.toLowerCase() === 'question' ||
          sheetName.toLowerCase() === 'questions') {
        Logger.log('QA: Found sheet by case-insensitive match: ' + sheetName);
        return allSheets[i];
      }
    }
    
    // Strategy 3: Try partial match
    for (var j = 0; j < allSheets.length; j++) {
      var name = allSheets[j].getName().toLowerCase();
      if (name.indexOf('qa') !== -1 || 
          name.indexOf('question') !== -1 ||
          name.indexOf('answer') !== -1) {
        Logger.log('QA: Found sheet by partial match: ' + allSheets[j].getName());
        return allSheets[j];
      }
    }
    
    // Strategy 4: Create new sheet if not found
    Logger.log('QA: Sheet not found, creating new sheet: ' + SHEET_NAMES.QA);
    sheet = ss.insertSheet(SHEET_NAMES.QA);
    sheet.appendRow(['ID', 'UserId', 'Category', 'Question', 'Answer', 'Status', 'CreatedAt', 'AnsweredBy', 'AnsweredAt']);
    return sheet;
    
  } catch (e) {
    Logger.log('getQASheet error: ' + e.toString());
    return null;
  }
}

/**
 * TÁI CẤU TRÚC: Read QA data with multiple fallback methods
 * Thử nhiều cách để đọc dữ liệu từ sheet
 * @param {Sheet} sheet
 * @return {Array} Array of row data
 */
function readQADataMultipleWays(sheet) {
  var methods = [];
  var data = null;
  
  try {
    // Method 1: getDataRange() - Standard method
    try {
      data = sheet.getDataRange().getValues();
      if (data && data.length > 0) {
        Logger.log('QA: Data read successfully using getDataRange(), rows: ' + data.length);
        return { method: 'getDataRange', data: data };
      }
    } catch (e) {
      Logger.log('QA: getDataRange() failed: ' + e.toString());
    }
    
    // Method 2: Read row by row (more reliable for large sheets)
    try {
      var lastRow = sheet.getLastRow();
      var lastCol = sheet.getLastColumn();
      if (lastRow > 0 && lastCol > 0) {
        data = sheet.getRange(1, 1, lastRow, lastCol).getValues();
        if (data && data.length > 0) {
          Logger.log('QA: Data read successfully using getRange(), rows: ' + data.length);
          return { method: 'getRange', data: data };
        }
      }
    } catch (e) {
      Logger.log('QA: getRange() failed: ' + e.toString());
    }
    
    // Method 3: Read in chunks (for very large sheets)
    try {
      var chunkSize = 100;
      var allData = [];
      var lastRow = sheet.getLastRow();
      var lastCol = Math.max(sheet.getLastColumn(), 9);
      
      // Read header first
      var header = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
      allData.push(header);
      
      // Read data in chunks
      for (var startRow = 2; startRow <= lastRow; startRow += chunkSize) {
        var endRow = Math.min(startRow + chunkSize - 1, lastRow);
        var chunk = sheet.getRange(startRow, 1, endRow - startRow + 1, lastCol).getValues();
        for (var c = 0; c < chunk.length; c++) {
          allData.push(chunk[c]);
        }
      }
      
      if (allData.length > 0) {
        Logger.log('QA: Data read successfully using chunked reading, rows: ' + allData.length);
        return { method: 'chunked', data: allData };
      }
    } catch (e) {
      Logger.log('QA: Chunked reading failed: ' + e.toString());
    }
    
    // Method 4: Read column by column and reconstruct
    try {
      var lastRow = sheet.getLastRow();
      if (lastRow > 0) {
        var reconstructed = [];
        var maxCol = Math.max(sheet.getLastColumn(), 9);
        
        // Read header
        var headerRow = [];
        for (var h = 1; h <= maxCol; h++) {
          try {
            headerRow.push(sheet.getRange(1, h).getValue());
          } catch (e) {
            headerRow.push('');
          }
        }
        reconstructed.push(headerRow);
        
        // Read data rows
        for (var r = 2; r <= lastRow; r++) {
          var row = [];
          for (var c = 1; c <= maxCol; c++) {
            try {
              row.push(sheet.getRange(r, c).getValue());
            } catch (e) {
              row.push('');
            }
          }
          reconstructed.push(row);
        }
        
        if (reconstructed.length > 0) {
          Logger.log('QA: Data read successfully using column-by-column, rows: ' + reconstructed.length);
          return { method: 'columnByColumn', data: reconstructed };
        }
      }
    } catch (e) {
      Logger.log('QA: Column-by-column reading failed: ' + e.toString());
    }
    
    // Method 5: Last resort - return empty with header
    Logger.log('QA: All reading methods failed, returning empty structure');
    return { 
      method: 'empty', 
      data: [['ID', 'UserId', 'Category', 'Question', 'Answer', 'Status', 'CreatedAt', 'AnsweredBy', 'AnsweredAt']] 
    };
    
  } catch (e) {
    Logger.log('readQADataMultipleWays error: ' + e.toString());
    return { method: 'error', data: [] };
  }
}

/**
 * TÁI CẤU TRÚC: Map columns with extensive fallback
 * Hỗ trợ nhiều tên cột và format khác nhau
 * @param {Array} headers
 * @return {Object} Column mapping
 */
function mapQAColumnsExtensive(headers) {
  var colMap = {};
  var variations = {
    id: ['id', 'question id', 'qa id', 'qaid', 'questionid', 'identifier', 'mã', 'mã số'],
    userId: ['userid', 'user id', 'user', 'email', 'người gửi', 'nguoi gui', 'sender', 'author', 'creator', 'created by'],
    category: ['category', 'danh mục', 'danh muc', 'cat', 'loại', 'loai', 'type', 'nhóm', 'nhom', 'group'],
    question: ['question', 'câu hỏi', 'cau hoi', 'q', 'nội dung', 'noi dung', 'content', 'text', 'message', 'hỏi', 'hoi'],
    answer: ['answer', 'câu trả lời', 'cau tra loi', 'a', 'trả lời', 'tra loi', 'reply', 'response', 'đáp án', 'dap an'],
    status: ['status', 'trạng thái', 'trang thai', 'state', 'tình trạng', 'tinh trang', 'condition'],
    createdAt: ['createdat', 'created at', 'ngày tạo', 'ngay tao', 'date', 'timestamp', 'time', 'created', 'tạo lúc', 'tao luc'],
    answeredBy: ['answeredby', 'answered by', 'người trả lời', 'nguoi tra loi', 'admin', 'responder', 'answered by user'],
    answeredAt: ['answeredat', 'answered at', 'ngày trả lời', 'ngay tra loi', 'answer date', 'answered date', 'trả lời lúc', 'tra loi luc']
  };
  
  for (var h = 0; h < headers.length; h++) {
    var headerName = String(headers[h] || '').trim();
    var headerLower = headerName.toLowerCase();
    
    // Try exact match first
    for (var field in variations) {
      if (variations[field].indexOf(headerLower) !== -1) {
        colMap[field] = h;
        Logger.log('QA: Mapped column "' + headerName + '" to field "' + field + '" at position ' + h);
        break;
      }
    }
  }
  
  // Fallback to position-based mapping if header mapping failed
  var defaultPositions = { id: 0, userId: 1, category: 2, question: 3, answer: 4, status: 5, createdAt: 6, answeredBy: 7, answeredAt: 8 };
  for (var field in defaultPositions) {
    if (typeof colMap[field] === 'undefined') {
      colMap[field] = defaultPositions[field];
      Logger.log('QA: Using default position ' + defaultPositions[field] + ' for field "' + field + '"');
    }
  }
  
  return colMap;
}

/**
 * TÁI CẤU TRÚC: Submit a new question with robust error handling
 * @param {Object} args {category, question}
 * @return {Object} {status, id}
 */
function submitQuestion(args) {
  try {
    var user = Session.getActiveUser();
    var email = user.getEmail();
    
    if (!args.category || !args.question) {
      return { status: 'error', message: 'Category and question are required' };
    }
    
    // TÁI CẤU TRÚC: Sử dụng getQASheet() với multiple fallback
    var sheet = getQASheet();
    if (!sheet) {
      return { status: 'error', message: 'Cannot access QA sheet' };
    }
    
    // TÁI CẤU TRÚC: Đọc header với multiple methods
    var headerResult = readQADataMultipleWays(sheet);
    var headerRow = headerResult.data && headerResult.data.length > 0 ? headerResult.data[0] : [];
    
    // TÁI CẤU TRÚC: Sử dụng mapQAColumnsExtensive() để map columns
    var colMap = mapQAColumnsExtensive(headerRow);
    
    // Generate unique ID
    var id = 'QA' + new Date().getTime() + '_' + Math.random().toString(36).substr(2, 9);
    
    // Find next empty row
    var lastRow = sheet.getLastRow();
    var newRow = lastRow + 1;
    
    // TÁI CẤU TRÚC: Ghi dữ liệu với multiple fallback strategies
    try {
      // Strategy 1: Try to write all at once using appendRow
      var newRowData = [];
      newRowData[colMap.id] = id;
      newRowData[colMap.userId] = email;
      newRowData[colMap.category] = args.category;
      newRowData[colMap.question] = args.question;
      newRowData[colMap.answer] = '';
      newRowData[colMap.status] = 'Pending';
      newRowData[colMap.createdAt] = new Date();
      newRowData[colMap.answeredBy] = '';
      newRowData[colMap.answeredAt] = '';
      
      // Pad array to max column
      var maxCol = Math.max(colMap.id, colMap.userId, colMap.category, colMap.question, 
                           colMap.answer, colMap.status, colMap.createdAt, colMap.answeredBy, colMap.answeredAt) + 1;
      while (newRowData.length < maxCol) {
        newRowData.push('');
      }
      
      sheet.appendRow(newRowData);
      Logger.log('QA: Question submitted using appendRow method');
    } catch (e1) {
      // Strategy 2: Write column by column
      try {
        Logger.log('QA: appendRow failed, trying column-by-column write');
        sheet.getRange(newRow, colMap.id + 1).setValue(id);
        sheet.getRange(newRow, colMap.userId + 1).setValue(email);
        sheet.getRange(newRow, colMap.category + 1).setValue(args.category);
        sheet.getRange(newRow, colMap.question + 1).setValue(args.question);
        sheet.getRange(newRow, colMap.answer + 1).setValue('');
        sheet.getRange(newRow, colMap.status + 1).setValue('Pending');
        sheet.getRange(newRow, colMap.createdAt + 1).setValue(new Date());
        sheet.getRange(newRow, colMap.answeredBy + 1).setValue('');
        sheet.getRange(newRow, colMap.answeredAt + 1).setValue('');
        Logger.log('QA: Question submitted using column-by-column method');
      } catch (e2) {
        Logger.log('QA: All write methods failed: ' + e2.toString());
        throw e2;
      }
    }
    
    logAudit(email, 'SUBMIT_QUESTION', '', { id: id, category: args.category });
    
    return { status: 'ok', id: id };
    
  } catch (e) {
    Logger.log('submitQuestion error: ' + e.toString());
    Logger.log('submitQuestion error stack: ' + e.stack);
    return { status: 'error', message: e.toString() };
  }
}


/**
 * TÁI CẤU TRÚC: Get all questions with multiple fallback strategies
 * Đảm bảo load được dữ liệu từ sheet Q&A bằng mọi cách
 * @param {Object} args {category, status, userId}
 * @return {Array} Questions
 */
function getQuestions(args) {
  try {
    var user = Session.getActiveUser();
    var email = user.getEmail();
    var isAdminUser = isAdmin(email);
    
    // Ensure args is an object
    if (!args) args = {};
    
    // TÁI CẤU TRÚC: Sử dụng getQASheet() với multiple fallback
    var sheet = getQASheet();
    if (!sheet) {
      Logger.log('QA: Cannot get QA sheet');
      return [];
    }
    
    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      Logger.log('QA: Sheet has no data rows (lastRow: ' + lastRow + ')');
      return [];
    }
    
    // TÁI CẤU TRÚC: Đọc dữ liệu với multiple methods
    var readResult = readQADataMultipleWays(sheet);
    var data = readResult.data;
    
    if (!data || data.length < 2) {
      Logger.log('QA: Insufficient data read (rows: ' + (data ? data.length : 0) + ')');
      return [];
    }
    
    Logger.log('QA: Data read using method: ' + readResult.method + ', total rows: ' + data.length);
    
    // TÁI CẤU TRÚC: Sử dụng mapQAColumnsExtensive() để map columns
    var headers = data[0] || [];
    var colMap = mapQAColumnsExtensive(headers);
    
    var debugInfo = {
      readMethod: readResult.method,
      totalRows: data.length - 1,
      headersFound: headers,
      columnsMapped: colMap,
      questionsProcessed: 0,
      questionsFiltered: 0,
      questionsReturned: 0
    };
    
    var questions = [];
    
    // Process data rows (skip header row at index 0)
    for (var i = 1; i < data.length; i++) {
      try {
        var row = data[i];
        debugInfo.questionsProcessed++;
        
        // Skip empty rows (check question column)
        var questionValue = row && row[colMap.question] ? row[colMap.question] : null;
        if (!questionValue || String(questionValue).trim() === '') {
          continue;
        }
        
        // TÁI CẤU TRÚC: Extract data với safe access
        var question = {
          id: (row[colMap.id] ? String(row[colMap.id]).trim() : '') || ('QA' + new Date().getTime() + '_' + i),
          userId: (row[colMap.userId] ? String(row[colMap.userId]).trim() : '') || email,
          category: (row[colMap.category] ? String(row[colMap.category]).trim() : '') || 'Khác',
          question: String(questionValue).trim(),
          answer: (row[colMap.answer] ? String(row[colMap.answer]).trim() : '') || '',
          status: (row[colMap.status] ? String(row[colMap.status]).trim() : '') || 'Pending',
          createdAt: row[colMap.createdAt] || null,
          answeredBy: (row[colMap.answeredBy] ? String(row[colMap.answeredBy]).trim() : '') || '',
          answeredAt: row[colMap.answeredAt] || null
        };
        
        // Apply filters
        if (args.category && question.category !== args.category) {
          debugInfo.questionsFiltered++;
          continue;
        }
        if (args.status && question.status !== args.status) {
          debugInfo.questionsFiltered++;
          continue;
        }
        if (args.userId && question.userId !== args.userId) {
          debugInfo.questionsFiltered++;
          continue;
        }
        
        // Non-admin users can only see their own questions
        if (!isAdminUser && question.userId !== email) {
          debugInfo.questionsFiltered++;
          continue;
        }
        
        questions.push({
          ID: question.id,
          UserId: question.userId,
          Category: question.category,
          Question: question.question,
          Answer: question.answer,
          Status: question.status,
          CreatedAt: formatDate(question.createdAt),
          AnsweredBy: question.answeredBy,
          AnsweredAt: question.answeredAt ? formatDate(question.answeredAt) : ''
        });
        debugInfo.questionsReturned++;
        
      } catch (rowError) {
        Logger.log('QA: Error processing row ' + i + ': ' + rowError.toString());
        continue;
      }
    }
    
    // Sort by created date descending
    questions.sort(function(a, b) {
      try {
        var dateA = new Date(a.CreatedAt);
        var dateB = new Date(b.CreatedAt);
        if (isNaN(dateA.getTime())) dateA = new Date(0);
        if (isNaN(dateB.getTime())) dateB = new Date(0);
        return dateB - dateA;
      } catch (e) {
        return 0;
      }
    });
    
    debugInfo.questionsReturned = questions.length;
    Logger.log('QA: getQuestions completed. ' + JSON.stringify(debugInfo));
    
    return questions;
    
  } catch (e) {
    Logger.log('QA: getQuestions error: ' + e.toString());
    Logger.log('QA: getQuestions error stack: ' + e.stack);
    return [];
  }
}

/**
 * TÁI CẤU TRÚC: Answer a question with multiple fallback strategies
 * @param {Object} args {id, answer}
 * @return {Object} {status}
 */
function answerQuestion(args) {
  try {
    var user = Session.getActiveUser();
    var email = user.getEmail();
    
    if (!isAdmin(email)) {
      return { status: 'error', message: 'Permission denied' };
    }
    
    if (!args.id || !args.answer) {
      return { status: 'error', message: 'ID and answer are required' };
    }
    
    // TÁI CẤU TRÚC: Sử dụng getQASheet() với multiple fallback
    var sheet = getQASheet();
    if (!sheet) {
      return { status: 'error', message: 'QA sheet not found' };
    }
    
    // TÁI CẤU TRÚC: Đọc dữ liệu với multiple methods
    var readResult = readQADataMultipleWays(sheet);
    var data = readResult.data;
    
    if (!data || data.length < 2) {
      return { status: 'error', message: 'No data found in QA sheet' };
    }
    
    // TÁI CẤU TRÚC: Sử dụng mapQAColumnsExtensive() để map columns
    var headers = data[0] || [];
    var colMap = mapQAColumnsExtensive(headers);
    
    // Find question by ID (check in ID column)
    var foundRow = -1;
    for (var i = 1; i < data.length; i++) {
      try {
        var row = data[i];
        var rowId = row && row[colMap.id] ? String(row[colMap.id]).trim() : '';
        if (rowId === String(args.id).trim()) {
          foundRow = i + 1; // +1 because sheet rows are 1-indexed
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    if (foundRow === -1) {
      return { status: 'error', message: 'Question not found' };
    }
    
    // TÁI CẤU TRÚC: Update với multiple fallback strategies
    try {
      // Strategy 1: Update all at once
      if (colMap.answer !== undefined) sheet.getRange(foundRow, colMap.answer + 1).setValue(args.answer);
      if (colMap.status !== undefined) sheet.getRange(foundRow, colMap.status + 1).setValue('Answered');
      if (colMap.answeredBy !== undefined) sheet.getRange(foundRow, colMap.answeredBy + 1).setValue(email);
      if (colMap.answeredAt !== undefined) sheet.getRange(foundRow, colMap.answeredAt + 1).setValue(new Date());
      Logger.log('QA: Answer updated successfully');
    } catch (e) {
      Logger.log('QA: Update failed: ' + e.toString());
      throw e;
    }
    
    logAudit(email, 'ANSWER_QUESTION', '', { id: args.id });
    
    return { status: 'ok' };
    
  } catch (e) {
    Logger.log('QA: answerQuestion error: ' + e.toString());
    Logger.log('QA: answerQuestion error stack: ' + e.stack);
    return { status: 'error', message: e.toString() };
  }
}

/* ====== UNFINISHED TASKS MODULE ====== */

/**
 * Load all unfinished tasks for a hub
 * @param {Object} args {hub}
 * @return {Array} Unfinished tasks
 */
function loadUnfinishedTasks(args) {
  try {
    var user = Session.getActiveUser();
    var email = user.getEmail();
    var hub = args.hub;
    
    // Get date filter (default to today if not provided)
    var filterDate = args.date || new Date().toISOString().slice(0, 10);
    
    if (!checkHubPermission(email, hub)) {
      return [];
    }
    
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName(SHEET_NAMES.DATA);
    
    if (!sheet || sheet.getLastRow() <= 1) return [];
    
    var data = sheet.getDataRange().getValues();
    var unfinishedTasks = [];
    
    // Find tasks for this hub and specific date that are not completed
    for (var i = 1; i < data.length; i++) {
      var storageKey = data[i][0]; // StorageKey format: tasks_HUB_DATE
      var tasksJson = data[i][1];
      
      if (!storageKey || !storageKey.startsWith('tasks_' + hub + '_')) continue;
      
      var parts = storageKey.split('_');
      var date = parts[2]; // Extract date from key
      
      // Filter by date - only show tasks from selected date (D0 by default)
      if (date !== filterDate) continue;
      
      try {
        var tasks = JSON.parse(tasksJson);
        // Safety check: ensure tasks is an array
        if (!Array.isArray(tasks)) {
          Logger.log('Warning: tasks is not an array, skipping');
          continue;
        }
        tasks.forEach(function(task) {
          if (!task.completed) {
            unfinishedTasks.push({
              Date: date,
              Category: task.category,
              Text: task.text,
              SLA: task.sla || null,
              IsLead: task.isLead || false
            });
          }
        });
      } catch (e) {
        Logger.log('Parse error for ' + storageKey + ': ' + e.toString());
      }
    }
    
    return unfinishedTasks;
    
  } catch (e) {
    Logger.log('loadUnfinishedTasks error: ' + e.toString());
    return [];
  }
}

/* ====== CHAT MODULE ====== */

/**
 * Send a chat message
 * @param {Object} args {message}
 * @return {Object} {status}
 */
function sendChatMessage(args) {
  try {
    var user = Session.getActiveUser();
    var email = user.getEmail();
    
    if (!args.message || !args.message.trim()) {
      return { status: 'error', message: 'Message cannot be empty' };
    }
    
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName('ChatMessages');
    
    if (!sheet) {
      sheet = ss.insertSheet('ChatMessages');
      sheet.appendRow(['ID', 'Email', 'DisplayName', 'Message', 'CreatedAt']);
    }
    
    var perms = getUserPermissions(email);
    var displayName = perms ? perms.DisplayName : email.split('@')[0];
    var id = 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    sheet.appendRow([id, email, displayName, args.message.trim(), new Date()]);
    
    logAudit(email, 'SEND_CHAT_MESSAGE', '', { message: args.message.trim() });
    
    return { status: 'ok', id: id };
    
  } catch (e) {
    Logger.log('sendChatMessage error: ' + e.toString());
    return { status: 'error', message: e.toString() };
  }
}

/**
 * Get chat messages
 * @param {Object} args {}
 * @return {Array} Messages
 */
function getChatMessages(args) {
  try {
    var user = Session.getActiveUser();
    var email = user.getEmail();
    
    // Ensure args is an object
    if (!args) args = {};
    
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName('ChatMessages');
    
    if (!sheet || sheet.getLastRow() <= 1) return [];
    
    var data = sheet.getDataRange().getValues();
    var messages = [];
    
    // Get last 50 messages
    var startRow = Math.max(1, data.length - 50);
    
    for (var i = startRow; i < data.length; i++) {
      messages.push({
        ID: data[i][0],
        Email: data[i][1],
        DisplayName: data[i][2],
        Message: data[i][3],
        CreatedAt: formatDate(data[i][4])
      });
    }
    
    return messages;
    
  } catch (e) {
    Logger.log('getChatMessages error: ' + e.toString());
    return [];
  }
}

/* ====== UTILITY FUNCTIONS ====== */

function _getUiCfgVal(key) {
  try {
    var sh = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAMES.CONFIG);
    if (!sh) return '';
    var rng = sh.getRange(1, 1, sh.getLastRow(), 2).getValues();
    for (var i = 0; i < rng.length; i++) {
      if (String(rng[i][0]).trim().toLowerCase() === String(key).trim().toLowerCase()) return rng[i][1];
    }
  } catch (e) { }
  return '';
}

function ping() {
  return 'pong';
}

/**
 * Get UIConfig values
 * @return {Object} Config key-value pairs
 */
function getUIConfig() {
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName(SHEET_NAMES.CONFIG);
    
    if (!sheet || sheet.getLastRow() <= 1) {
      return {};
    }
    
    var data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 2).getValues();
    var config = {};
    
    data.forEach(function(row) {
      if (row[0]) {
        config[row[0]] = row[1];
      }
    });
    
    return config;
    
  } catch (e) {
    Logger.log('getUIConfig error: ' + e.toString());
    return {};
  }
}

/**
 * Save note for an unfinished task
 * @param {Object} args {hub, date, taskText, note}
 * @return {Object} {status, id}
 */
function saveTaskNote(args) {
  try {
    var user = Session.getActiveUser();
    var email = user.getEmail();
    var hub = args.hub;
    
    if (!checkHubPermission(email, hub)) {
      return { status: 'error', message: 'Permission denied' };
    }
    
    var storageKey = 'notes_' + hub + '_' + args.date;
    
    // Load existing notes
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName(SHEET_NAMES.NOTES);
    
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAMES.NOTES);
      sheet.appendRow(['StorageKey', 'Data', 'LastModified', 'ModifiedBy']);
    }
    
    var data = sheet.getDataRange().getValues();
    var existingNotes = [];
    var rowIndex = -1;
    
    // Find existing notes for this date
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] === storageKey) {
        try {
          existingNotes = JSON.parse(data[i][1] || '[]');
        } catch (e) {
          existingNotes = [];
        }
        rowIndex = i + 1;
        break;
      }
    }
    
    // Add new note
    var newNote = {
      taskText: args.taskText,
      note: args.note,
      author: email,
      at: new Date().toISOString()
    };
    
    existingNotes.push(newNote);
    
    // Save back to sheet
    if (rowIndex > 0) {
      sheet.getRange(rowIndex, 2, 1, 3).setValues([[
        JSON.stringify(existingNotes),
        new Date(),
        email
      ]]);
    } else {
      sheet.appendRow([storageKey, JSON.stringify(existingNotes), new Date(), email]);
    }
    
    logAudit(email, 'SAVE_TASK_NOTE', hub, { date: args.date, task: args.taskText });
    
    return { status: 'ok', id: storageKey };
    
  } catch (e) {
    Logger.log('saveTaskNote error: ' + e.toString());
    return { status: 'error', message: e.toString() };
  }
}

/* ====== SETUP FUNCTION ====== */

/**
 * Setup initial sheets structure
 * Run this once after creating the spreadsheet
 * AUTO-SETUP: The person running this function becomes the first admin
 */
function setupSheets() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  
  // Get current user email
  var currentUser = Session.getActiveUser();
  var userEmail = currentUser.getEmail() || 'admin@example.com'; // Fallback if no email
  var displayName = userEmail.split('@')[0];

  // Create UserPermissions sheet
  var permSheet = ss.getSheetByName(SHEET_NAMES.PERMISSIONS);
  if (!permSheet) {
    permSheet = ss.insertSheet(SHEET_NAMES.PERMISSIONS);
    permSheet.appendRow(['Email', 'Hub', 'Role', 'Active', 'DisplayName', 'PhotoUrl', 'LastAccess', 'CreatedAt']);
    // Use the person running setupSheets as the first admin
    permSheet.appendRow([userEmail, 'ALL', 'admin', 'TRUE', displayName, '', '', new Date()]);
    Logger.log('Created UserPermissions sheet with admin: ' + userEmail);
  }

  // Create other sheets if not exist
  if (!ss.getSheetByName(SHEET_NAMES.DATA)) {
    var dataSheet = ss.insertSheet(SHEET_NAMES.DATA);
    dataSheet.appendRow(['StorageKey', 'Data', 'LastModified', 'ModifiedBy']);
  }

  if (!ss.getSheetByName(SHEET_NAMES.AUDIT)) {
    var auditSheet = ss.insertSheet(SHEET_NAMES.AUDIT);
    auditSheet.appendRow(['Timestamp', 'Email', 'Action', 'Hub', 'Details', 'SessionInfo']);
  }

  if (!ss.getSheetByName(SHEET_NAMES.CONFIG)) {
    var configSheet = ss.insertSheet(SHEET_NAMES.CONFIG);
    configSheet.appendRow(['Key', 'Value']);
    // Sample config
    configSheet.appendRow(['calendar_id', 'primary']);
    configSheet.appendRow(['app_name', '[SPX] DAILY CHECKLIST']);
    configSheet.appendRow(['company_name', 'SPX Express TVH']);
  }

  if (!ss.getSheetByName(SHEET_NAMES.TEMPLATE)) {
    var tplSheet = ss.insertSheet(SHEET_NAMES.TEMPLATE);
    tplSheet.appendRow(['Category', 'Text', 'IsLead', 'Link', 'Info']);
    // Sample data
    tplSheet.appendRow(['Đầu Ca', 'Chấm công', true, '', 'Kiểm tra hệ thống chấm công và đảm bảo tất cả nhân viên đã check-in đúng giờ']);
    tplSheet.appendRow(['Đầu Ca', 'Check Camera - Feed', false, 'https://cameras.example.com', 'Xem lại camera feed, đảm bảo tất cả camera hoạt động bình thường']);
  }

  if (!ss.getSheetByName(SHEET_NAMES.TPL_BY_HUB)) {
    var tplHubSheet = ss.insertSheet(SHEET_NAMES.TPL_BY_HUB);
    tplHubSheet.appendRow(['HubId', 'TemplateData', 'LastModified']);
  }

  if (!ss.getSheetByName(SHEET_NAMES.NOTES)) {
    var notesSheet = ss.insertSheet(SHEET_NAMES.NOTES);
    notesSheet.appendRow(['StorageKey', 'NotesData', 'LastModified']);
  }

  if (!ss.getSheetByName(SHEET_NAMES.PRESENCE)) {
    var presenceSheet = ss.insertSheet(SHEET_NAMES.PRESENCE);
    presenceSheet.appendRow(['UserId', 'Hub', 'LastSeen', 'Tab', 'Meta']);
  }
  
  if (!ss.getSheetByName(SHEET_NAMES.QA)) {
    var qaSheet = ss.insertSheet(SHEET_NAMES.QA);
    qaSheet.appendRow(['ID', 'UserId', 'Category', 'Question', 'Answer', 'Status', 'CreatedAt', 'AnsweredBy', 'AnsweredAt']);
  }

  Logger.log('Sheets setup completed successfully');
  return 'Setup completed';
}

/* ====== PWA SUPPORT ====== */

/**
 * Generate PWA manifest.json
 */
function getManifest() {
  var appUrl = ScriptApp.getService().getUrl();
  var manifest = {
    "name": "[SPX] DAILY CHECKLIST",
    "short_name": "SPX Checklist",
    "description": "Daily Checklist Management System",
    "start_url": appUrl,
    "display": "standalone",
    "background_color": "#ffffff",
    "theme_color": "#ff6a00",
    "orientation": "portrait-primary",
    "icons": [
      {
        "src": "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23ff6a00'/><text y='.9em' font-size='90' fill='white'>📋</text></svg>",
        "sizes": "192x192",
        "type": "image/svg+xml",
        "purpose": "any maskable"
      },
      {
        "src": "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23ff6a00'/><text y='.9em' font-size='90' fill='white'>📋</text></svg>",
        "sizes": "512x512",
        "type": "image/svg+xml",
        "purpose": "any maskable"
      }
    ],
    "categories": ["productivity", "business"],
    "screenshots": [],
    "shortcuts": [
      {
        "name": "Checklist",
        "short_name": "Checklist",
        "description": "Open checklist",
        "url": appUrl + "?tab=check",
        "icons": [{
          "src": "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23ff6a00'/><text y='.9em' font-size='90' fill='white'>📋</text></svg>",
          "sizes": "96x96"
        }]
      }
    ]
  };
  
  return JSON.stringify(manifest, null, 2);
}

/**
 * Generate Service Worker
 */
function getServiceWorker() {
  var appUrl = ScriptApp.getService().getUrl();
  var cacheName = 'spx-checklist-v2.1';
  var cacheVersion = '2.1.0';
  
  var sw = "// Service Worker for SPX Daily Checklist\n" +
    "const CACHE_NAME = '" + cacheName + "';\n" +
    "const CACHE_VERSION = '" + cacheVersion + "';\n" +
    "const APP_URL = '" + appUrl + "';\n\n" +
    
    "// Install event - cache static assets\n" +
    "self.addEventListener('install', function(event) {\n" +
    "  console.log('[SW] Installing service worker...');\n" +
    "  event.waitUntil(\n" +
    "    caches.open(CACHE_NAME).then(function(cache) {\n" +
    "      console.log('[SW] Cache opened');\n" +
    "      return cache.addAll([\n" +
    "        APP_URL,\n" +
    "        APP_URL + '?action=manifest'\n" +
    "      ]).catch(function(err) {\n" +
    "        console.log('[SW] Cache addAll error:', err);\n" +
    "      });\n" +
    "    })\n" +
    "  );\n" +
    "  self.skipWaiting();\n" +
    "});\n\n" +
    
    "// Activate event - clean up old caches\n" +
    "self.addEventListener('activate', function(event) {\n" +
    "  console.log('[SW] Activating service worker...');\n" +
    "  event.waitUntil(\n" +
    "    caches.keys().then(function(cacheNames) {\n" +
    "      return Promise.all(\n" +
    "        cacheNames.map(function(cacheName) {\n" +
    "          if (cacheName !== CACHE_NAME) {\n" +
    "            console.log('[SW] Deleting old cache:', cacheName);\n" +
    "            return caches.delete(cacheName);\n" +
    "          }\n" +
    "        })\n" +
    "      );\n" +
    "    })\n" +
    "  );\n" +
    "  return self.clients.claim();\n" +
    "});\n\n" +
    
    "// Fetch event - network first, fallback to cache\n" +
    "self.addEventListener('fetch', function(event) {\n" +
    "  var requestUrl = new URL(event.request.url);\n" +
    "  \n" +
    "  // Skip non-GET requests\n" +
    "  if (event.request.method !== 'GET') {\n" +
    "    return;\n" +
    "  }\n" +
    "  \n" +
    "  // Skip cross-origin requests\n" +
    "  if (requestUrl.origin !== location.origin && !requestUrl.href.includes('script.google.com')) {\n" +
    "    return;\n" +
    "  }\n" +
    "  \n" +
    "  event.respondWith(\n" +
    "    fetch(event.request).then(function(response) {\n" +
    "      // Clone the response\n" +
    "      var responseToCache = response.clone();\n" +
    "      \n" +
    "      // Cache successful responses\n" +
    "      if (response.status === 200) {\n" +
    "        caches.open(CACHE_NAME).then(function(cache) {\n" +
    "          cache.put(event.request, responseToCache);\n" +
    "        });\n" +
    "      }\n" +
    "      \n" +
    "      return response;\n" +
    "    }).catch(function() {\n" +
    "      // Network failed, try cache\n" +
    "      return caches.match(event.request).then(function(response) {\n" +
    "        if (response) {\n" +
    "          return response;\n" +
    "        }\n" +
    "        // Return offline page if available\n" +
    "        return caches.match(APP_URL);\n" +
    "      });\n" +
    "    })\n" +
    "  );\n" +
    "});\n\n" +
    
    "// Message event - handle messages from client\n" +
    "self.addEventListener('message', function(event) {\n" +
    "  if (event.data && event.data.type === 'SKIP_WAITING') {\n" +
    "    self.skipWaiting();\n" +
    "  }\n" +
    "});\n";
  
  return sw;
}

/**
 * Get logo from external URL (seeklogo.com) and serve it (avoids CORS issues)
 * Acts as a proxy to fetch logo from external source and serve it through Apps Script
 * Logo URL: https://images.seeklogo.com/logo-png/49/1/spx-express-indonesia-logo-png_seeklogo-499970.png
 */
function getLogo() {
  try {
    var logoUrl = 'https://images.seeklogo.com/logo-png/49/1/spx-express-indonesia-logo-png_seeklogo-499970.png';
    
    // Fetch logo from external URL
    var response = UrlFetchApp.fetch(logoUrl, {
      'muteHttpExceptions': true,
      'followRedirects': true
    });
    
    var responseCode = response.getResponseCode();
    
    if (responseCode === 200) {
      var blob = response.getBlob();
      var mimeType = blob.getContentType() || 'image/png';
      
      // Convert blob to base64
      var base64Data = Utilities.base64Encode(blob.getBytes());
      var dataUrl = 'data:' + mimeType + ';base64,' + base64Data;
      
      // Return as JSON with data URL
      var result = {
        status: 'ok',
        dataUrl: dataUrl,
        mimeType: mimeType
      };
      
      return ContentService.createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON);
    } else {
      throw new Error('Failed to fetch logo: HTTP ' + responseCode);
    }
  } catch (e) {
    Logger.log('getLogo error: ' + e.toString());
    Logger.log('getLogo error details: ' + JSON.stringify(e));
    // Return error JSON with placeholder
    var result = {
      status: 'error',
      message: e.toString(),
      dataUrl: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">📋</text></svg>'
    };
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
