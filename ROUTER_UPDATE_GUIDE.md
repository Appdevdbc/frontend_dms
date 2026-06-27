# Router Update Guide - MainLayout Integration

## Problem
Routes `/master_plant`, `/master_menu`, `/master_user` currently load components directly without MainLayout (no sidebar).

## Solution
These routes are already defined in `/master` routes with MainLayout. We just need to redirect old routes to new ones.

## Manual Changes Required in `dms-fe/src/routes/router.js`

### Current Code (Lines 46-54)
```javascript
// Redirect old routes to new routes for backward compatibility
{
  path: "/master_menu",
  component: () => import("./../pages/Master/Menu.vue"),
},
{
  path: "/master_user",
  component: () => import("./../pages/Master/User.vue"),
},
{
  path: "/master_plant",
  component: () => import("./../pages/Master/Plant.vue"),
},
```

### Replace With (Lines 46-54)
```javascript
// Redirect old routes to new routes for backward compatibility
{
  path: "/master_menu",
  redirect: "/master/menu"
},
{
  path: "/master_user",
  redirect: "/master/users"
},
{
  path: "/master_plant",
  redirect: "/master/plant"
},
```

## Explanation

**Before:**
- `/master_menu` → Loads `Menu.vue` directly (NO SIDEBAR ❌)
- `/master_user` → Loads `User.vue` directly (NO SIDEBAR ❌)
- `/master_plant` → Loads `Plant.vue` directly (NO SIDEBAR ❌)

**After:**
- `/master_menu` → Redirects to `/master/menu` (WITH SIDEBAR ✅)
- `/master_user` → Redirects to `/master/users` (WITH SIDEBAR ✅)
- `/master_plant` → Redirects to `/master/plant` (WITH SIDEBAR ✅)

## Why This Works

In `dms-fe/src/routes/master.js`, we already have:

```javascript
{
  path: "/master",
  component: () => import("./../layouts/MainLayout.vue"), // ← MainLayout with sidebar!
  children: [
    {
      path: "menu",
      component: () => import("./../pages/Master/Menu.vue"),
    },
    {
      path: "users",
      component: () => import("./../pages/Master/UserManagement.vue"),
    },
    {
      path: "plant",
      component: () => import("./../pages/Master/Plant.vue"),
    },
  ]
}
```

So when you redirect from `/master_menu` → `/master/menu`, it automatically uses MainLayout!

## Testing

After making the change:

1. **Go to**: `http://localhost:7060/#/master_plant`
2. **Expected**: Page with sidebar on the left ✅
3. **Test old route**: `http://localhost:7060/#/master_plant` should redirect and show sidebar
4. **Test new route**: `http://localhost:7060/#/master/plant` should show sidebar

## Important Note

**Both routes will work and show the same page with sidebar:**
- Old route: `/master_plant` (redirects to new route)
- New route: `/master/plant` (actual route with MainLayout)

This maintains backward compatibility while using MainLayout properly.
