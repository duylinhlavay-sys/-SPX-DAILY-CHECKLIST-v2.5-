# [SPX] DAILY CHECKLIST - Enhanced Version v2.0

## Overview
This project is a daily task checklist management system designed for SPX Express, built on Google Apps Script. Its primary purpose is to provide hub-based task management, incorporating SLA tracking, role-based access control, and comprehensive reporting capabilities. The system leverages Google Sheets as a backend database and presents a single-page web application with a modern glass morphism UI design. The ambition is to streamline daily operations, ensure task accountability, and provide insightful data for performance analysis within SPX Express.

## Recent Changes
- **October 30, 2025 - 6 MAJOR ENHANCEMENTS v2.2**:
  - **NEW FEATURE 1: Task Info System**:
    - TaskTemplate sheet now includes Info column for customizable task descriptions
    - Info icon (ℹ️) displays on each task with detailed descriptions in popup modal
    - getTaskTemplate() loads info field, displayed via showTaskInfoModal()
  - **NEW FEATURE 2: Visual Hub Progress Indicators**:
    - Reports module now shows color-coded progress bars for each hub
    - Completion rate progress bar (green fill showing % tasks completed)
    - SLA rate progress bar (green ≥90%, yellow ≥70%, red <70%)
    - Multi-hub overview displays aggregated stats with visual progress indicators
  - **REMOVED: Highlight Feature**:
    - Completely removed Highlight tab, content section, and all references
    - Simplified navigation and reduced code complexity
    - Users can still access report analytics via Reports module
  - **FIX: Data Loading for All Modules**:
    - Tab switching now automatically triggers data load for each module
    - Added mock data for Access Log, Q&A, Chat modules in preview server
    - setupAccessFilters(), setupQA(), setupChat() auto-load on tab switch
  - **NEW FEATURE 3: UIConfig System**:
    - Created getUIConfig() API endpoint (Code.gs lines 1783-1807)
    - Loads configuration from UIConfig sheet (calendar_id, app_name, company_name)
    - Sample config auto-created during setupSheets()
    - Frontend can load and apply config dynamically via callApi('getUIConfig')
  - **NEW FEATURE 4: Unfinished Task Notes**:
    - Added Note button to Unfinished Tasks module
    - saveTaskNote() API persists notes to NotesData sheet (Code.gs lines 1814-1881)
    - Storage format: notes_HUB_DATE with JSON array of note objects
    - Frontend showUnfinishedNote() prompts user and saves via API
    - Audit logging for all note saves (SAVE_TASK_NOTE action)
  - **CODE ORGANIZATION**:
    - Wire getUIConfig and saveTaskNote to callApi switch (script.html lines 252-257)
    - Added currentUnfinishedTasks array to track tasks for note function
    - Enhanced preview server with getUIConfig and saveTaskNote mock endpoints
    - All 6 features architect-reviewed and production-ready

- **October 30, 2025 - MAJOR UI/UX REMAKE v2.1**:
  - **CRITICAL FIX**: Rebuilt styles.html with proper <style> tag wrapper (was causing CSS to display as text)
  - **NEW FEATURE**: Task Info Icon (ℹ️) - Click to view detailed task description in beautiful popup modal
  - **NEW FEATURE**: Improved Quick Links - Redesigned as gradient pill buttons with hover effects
  - **UI/UX IMPROVEMENTS**:
    - Merged enhanced CSS from both codebase versions
    - Added 904-line comprehensive styles.html with all modern components
    - Task info popup modal with glass morphism design
    - Improved task item layout with action buttons
    - Enhanced button animations and hover states
    - Better responsive design for mobile devices
  - **CODE ORGANIZATION**:
    - Fixed all DOM manipulation to use native methods (document.getElementById, querySelector)
    - Fixed renderTasks() and showSkeleton() functions
    - Added showTaskInfoModal() and closeTaskInfoModal() functions
    - Improved task rendering with task-info-btn and task-link classes
    - Better error handling and null checks
  - **PREVIOUS FIXES** (earlier today):
    - Fixed DOM manipulation errors caused by jQuery-like $() helper conflicts
    - Fixed setupAccessFilters(), setupUnfinished(), setupReportHub(), setupTheme() functions
    - Fixed showCover() and enterApp() functions
    - Resolved "Access Denied" error on first-time Google Apps Script deployment
    - Fixed preview server integration - callApi() now uses fetch() for preview mode
    - Implemented auto-admin feature
    - Enhanced preview server with proper /api/:action endpoints
  
- **October 23, 2025**: 
  - Added Q&A Module: Users submit questions with categories (Thao tác, Giao diện, Nội dung, Khác), admins answer
  - Added Unfinished Tasks Module: Shows all incomplete tasks across dates with sidebar quick access
  - Added Internal Chat Module: Real-time messaging between users with auto-polling every 3 seconds
  - Enhanced Reports Module: Multi-hub overview mode for admins to see aggregated data across all hubs
  - Enhanced Access Log Module: Advanced filters (user, action), view details modal, Excel export
  - Enhanced tab switching to auto-load module data
  - Updated API bridge with 7 new endpoints (submitQuestion, getQuestions, answerQuestion, loadUnfinishedTasks, sendChatMessage, getChatMessages, exportAccessLog)

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The system utilizes a Single-Page Application (SPA) architecture built with Vanilla JavaScript for dynamic content loading and state management, avoiding framework overhead. The UI employs a Glass Morphism design pattern, featuring CSS custom properties for effects like aurora gradient backgrounds, frosted glass cards, and smooth theme transitions, with full light/dark mode support. The interface is structured with a cover page, topbar navigation, and tab-based modules including Checklist, Templates, Notes, Report, Unfinished, Online, Access Log, Q&A, Chat, and Admin panels. State management uses a global state object and LocalStorage for user preferences and hub selection.

### Backend Architecture
The backend is a Google Apps Script server, deployed as a web app using HtmlService. Authentication relies on `Session.getActiveUser()` for Google account verification, with access control managed via a UserPermissions sheet, supporting 'admin' and hub-restricted 'user' roles. A standardized API pattern uses `google.script.run` calls, with robust error handling and audit logging for all CRUD operations to an AuditLog sheet. The data access layer interacts directly with Google Sheets using `SpreadsheetApp` for row-based record management and in-memory caching.

### Data Storage
Google Sheets serve as the primary database, with multiple sheets acting as tables within a single spreadsheet. Key sheets include:
- **ChecklistData**: Stores task records with details like Hub, Date, Category, Task, Status, SLA, and timestamps.
- **NotesData**: Manages daily notes per hub.
- **TaskTemplate**: Global and hub-specific task templates.
- **UserPermissions**: Controls access with user emails, hubs, and roles.
- **Presence**: Tracks online users.
- **AuditLog**: Logs all user actions.
- **UIConfig**: Stores dynamic application configurations like `calendar_id` and UI strings.
- **QAData**: Stores user questions with categories, admin answers, timestamps.
- **ChatMessages**: Stores internal chat messages with user info and timestamps.
Data is stored with a `YYYY-MM-DD` date format, supports multi-hub operations, and uses a sheet-based data model.

### UI/UX Decisions
- **Glass Morphism UI**: Modern aesthetic with transparent, frosted elements and aurora gradient backgrounds.
- **Language Toggle**: Full i18n system for Vietnamese/English.
- **Holiday Greetings**: Dynamic display of greetings for Vietnam national holidays.
- **SLA Setup UI**: Integrated within tasks, allowing users to set, edit, and remove deadlines with Google Calendar sync.
- **Task Completion Feedback**: Visual cues like strikethrough text, dynamic category status ("Đã hoàn thành" / "Chưa hoàn thành"), and task counts.
- **Collapsible Categories**: Tasks are grouped by categories with collapsible headers and completion status.

### Feature Specifications
- **Hub-based Task Management**: Tasks are organized and filtered by operational hubs.
- **SLA Tracking**: Tasks can have deadlines, which sync with Google Calendar.
- **Role-Based Access Control**: Admins have full access; users are restricted to their assigned hubs.
- **Multi-Hub Reporting**: Admins can view "All Hubs" overview with aggregated stats per hub (total tasks, completion rate, SLA rate) with visual progress bars.
- **Task Info System**: Tasks display info icon (ℹ️) to view detailed descriptions from TaskTemplate.Info column in popup modal.
- **Advanced Access Log**: Filter by user and action type, view detailed log entries in modal, export to Excel (admin only).
- **Q&A Module**: Users submit questions with 4 categories (Thao tác, Giao diện, Nội dung, Khác), admins can answer, filter by category and status.
- **Unfinished Tasks Module**: Displays all incomplete tasks from all dates, accessible via sidebar button or tab. Users can add notes via Note button, persisted to NotesData sheet.
- **Internal Chat Module**: Real-time team communication with message history (last 50 messages), auto-polling every 3 seconds.
- **Online Detection**: Tracks active users within the system.
- **User Avatar Sync**: Displays Google account avatars or default initials.
- **UIConfig System**: Dynamic configuration loading from UIConfig sheet (calendar_id, app_name, company_name).
- **Informative "Thông Tin" Module**: Provides documentation, features, and usage tips.

## External Dependencies

### Google Workspace APIs
- **CalendarApp**: Used for creating, updating, and removing calendar events related to task SLAs, syncing with the user's primary or configured Google Calendar.
- **Session API**: Utilized for user authentication and identification via `Session.getActiveUser().getEmail()`.
- **SpreadsheetApp**: The core API for all data persistence and manipulation within Google Sheets.

### Third-Party Services
- **None**: The project is entirely self-contained within the Google Workspace ecosystem, requiring no external third-party services.

### Development Tools
- **Express.js**: Used solely as a development preview server for local testing and mocking APIs, not part of the production deployment.