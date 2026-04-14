import { useAuthStore } from 'src/stores/auth';

/**
 * Navigation guard to check authentication
 */
export const authGuard = (to, from, next) => {
  const authStore = useAuthStore();

  // Initialize auth from localStorage if not already done
  if (!authStore.isAuthenticated) {
    authStore.initFromStorage();
  }

  // Check if route requires authentication
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    // Redirect to login with return URL
    next({
      path: '/login',
      query: { redirect: to.fullPath }
    });
    return;
  }

  // Check role permissions
  if (to.meta.role && authStore.isAuthenticated) {
    const userRole = authStore.user?.role;
    const allowedRoles = Array.isArray(to.meta.role) ? to.meta.role : [to.meta.role];

    if (userRole && !allowedRoles.includes(userRole)) {
      // User doesn't have required role
      next('/unauthorized');
      return;
    }
  }

  // Allow navigation
  next();
};

/**
 * Navigation guard for guest-only routes (like login)
 */
export const guestGuard = (to, from, next) => {
  const authStore = useAuthStore();

  // Initialize auth from localStorage
  if (!authStore.isAuthenticated) {
    authStore.initFromStorage();
  }

  // If already authenticated, redirect to home
  if (authStore.isAuthenticated) {
    next('/');
    return;
  }

  next();
};

