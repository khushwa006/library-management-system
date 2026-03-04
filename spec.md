# Library Management System

## Current State
- Single-view app with 5 pages: Dashboard (System Monitor), Books Catalog, Members, Borrow/Return, ML Recommendations
- Backend already has role-based access control: `#admin` role can manage books/members/view stats; `#user` role can borrow/return/view recommendations
- `getCallerUserRole()` and `isCallerAdmin()` APIs are available on the backend
- No login-gating or role-based page visibility in the frontend — all pages are always visible
- Header has a Sign In button using Internet Identity

## Requested Changes (Diff)

### Add
- A role-aware mode system: **Admin Mode** and **Student Mode**
- A login/role selection screen shown before the main app (if not logged in)
- After login, fetch `getCallerUserRole()` and show the appropriate mode
- Student view: shows Books Catalog, Borrow/Return, and ML Recommendations only
- Admin view: shows all pages — Dashboard, Books Catalog, Members, Borrow/Return, ML Recommendations
- A visible mode badge/label in the sidebar and header showing current mode (e.g. "Admin" or "Student")
- Role indicator in header dropdown (show "Admin" or "Student" label next to principal)

### Modify
- `AppSidebar`: filter nav items based on user role (students don't see Dashboard/Members)
- `Header`: show role badge next to the user avatar; mobile nav also filtered by role
- `App.tsx`: wrap app in a role context; redirect students away from admin-only pages
- Login flow: after sign-in, auto-detect role and show appropriate mode; if guest (not logged in), show only public book browsing

### Remove
- Nothing removed — all features remain, just gated by role

## Implementation Plan
1. Create a `RoleContext` (React context) that stores the current user role (`admin | user | guest`) and exposes it app-wide
2. On app load, after identity is established, call `getCallerUserRole()` to populate the context
3. Update `AppSidebar` to filter nav items: students see Books, Borrow/Return, Recommendations; admins see all
4. Update `Header` to show a role badge ("Admin" / "Student") next to the user avatar in the dropdown
5. Update `App.tsx` to redirect/reset active page if the current page is not accessible in the current role
6. Add a welcome/login screen shown when user is not logged in, with a clear prompt to sign in and a description of the two modes (Admin / Student)
7. Apply deterministic `data-ocid` markers to all new interactive elements
