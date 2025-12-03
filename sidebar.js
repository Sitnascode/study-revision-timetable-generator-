/**
 * Sidebar Navigation Component
 * Implements expand/collapse on hover, click-to-lock, and click-outside-to-collapse functionality
 */

class SidebarNavigation {
  constructor() {
    this.sidebar = document.getElementById("sidebar");
    this.menuItems = document.querySelectorAll(".menu-item");
    this.logoutBtn = document.getElementById("logoutBtn");
    this.isClickLocked = false;

    this.init();
  }

  init() {
    if (!this.sidebar) {
      console.error("Sidebar element not found");
      return;
    }

    this.setupHoverBehavior();
    this.setupClickLockBehavior();
    this.setupClickOutsideBehavior();
    this.setupNavigationHandlers();
    this.setupLogoutHandler();
  }

  /**
   * Requirement 6.4, 7.1: Expand sidebar on hover
   */
  setupHoverBehavior() {
    this.sidebar.addEventListener("mouseenter", () => {
      this.sidebar.classList.add("expanded");
    });

    /**
     * Requirement 7.2: Collapse on mouse leave (only if not click-locked)
     */
    this.sidebar.addEventListener("mouseleave", () => {
      if (!this.isClickLocked) {
        this.sidebar.classList.remove("expanded");
      }
    });
  }

  /**
   * Requirement 7.3: Click to lock sidebar in expanded state
   */
  setupClickLockBehavior() {
    this.sidebar.addEventListener("click", (e) => {
      // Don't toggle lock if clicking on a menu item or logout button
      const clickedMenuItem = e.target.closest(".menu-item");
      const clickedProfile = e.target.closest(".user-profile-item");

      // If clicking menu item, let navigation handler deal with it
      if (clickedMenuItem) {
        return;
      }

      // Toggle click-lock state when clicking sidebar itself or profile item
      if (
        clickedProfile ||
        e.target === this.sidebar ||
        e.target.closest(".sidebar-header") ||
        e.target.closest(".sidebar-logo")
      ) {
        this.isClickLocked = !this.isClickLocked;

        if (this.isClickLocked) {
          this.sidebar.classList.add("expanded");
        } else {
          this.sidebar.classList.remove("expanded");
        }
      }
    });
  }

  /**
   * Requirement 7.4: Click outside to unlock and collapse sidebar
   */
  setupClickOutsideBehavior() {
    document.addEventListener("click", (e) => {
      // Check if click is outside sidebar
      if (!this.sidebar.contains(e.target) && this.isClickLocked) {
        this.isClickLocked = false;
        this.sidebar.classList.remove("expanded");
      }
    });
  }

  /**
   * Requirements 6.5: Wire up navigation handlers for menu items
   * Requirement 6.3: Update active state highlighting
   */
  setupNavigationHandlers() {
    this.menuItems.forEach((item) => {
      item.addEventListener("click", (e) => {
        e.preventDefault();

        // Don't handle logout item here
        if (item.classList.contains("logout-item")) {
          return;
        }

        const page = item.getAttribute("data-page");

        // Update active state
        this.menuItems.forEach((menuItem) => {
          menuItem.classList.remove("active");
        });
        item.classList.add("active");

        // Call navigation handler
        this.handleNavigation(page);
      });
    });
  }

  /**
   * Navigation handler - can be customized for actual page navigation
   */
  handleNavigation(page) {
    console.log(`Navigating to: ${page}`);

    // In a real application, this would handle routing
    // For now, we'll just log and update the URL hash
    window.location.hash = page;

    // Dispatch custom event for other components to listen to
    const navigationEvent = new CustomEvent("sidebar-navigation", {
      detail: { page },
    });
    document.dispatchEvent(navigationEvent);
  }

  /**
   * Requirement 8.5: Wire up logout handler
   */
  setupLogoutHandler() {
    if (this.logoutBtn) {
      this.logoutBtn.addEventListener("click", (e) => {
        e.preventDefault();
        this.handleLogout();
      });
    }
  }

  /**
   * Logout handler - can be customized for actual logout logic
   */
  handleLogout() {
    console.log("Logout initiated");

    // Confirm logout
    if (confirm("Are you sure you want to log out?")) {
      // In a real application, this would:
      // 1. Clear user session/tokens
      // 2. Clear localStorage/sessionStorage
      // 3. Redirect to login page

      // For now, just dispatch a logout event
      const logoutEvent = new CustomEvent("user-logout");
      document.dispatchEvent(logoutEvent);

      // Simulate redirect
      console.log("User logged out successfully");
      alert("Logged out successfully!");
    }
  }

  /**
   * Public method to programmatically set active page
   */
  setActivePage(page) {
    this.menuItems.forEach((item) => {
      const itemPage = item.getAttribute("data-page");
      if (itemPage === page) {
        item.classList.add("active");
      } else {
        item.classList.remove("active");
      }
    });
  }

  /**
   * Public method to update user info in sidebar footer
   */
  updateUserInfo(name, email, avatarText) {
    const userNameEl = document.querySelector(".user-name");
    const userEmailEl = document.querySelector(".user-email");
    const userAvatarEl = document.querySelector(".user-avatar");

    if (userNameEl) userNameEl.textContent = name;
    if (userEmailEl) userEmailEl.textContent = email;
    if (userAvatarEl && avatarText) userAvatarEl.textContent = avatarText;
  }

  /**
   * Public method to get current locked state
   */
  isLocked() {
    return this.isClickLocked;
  }

  /**
   * Public method to get current expanded state
   */
  isExpanded() {
    return this.sidebar.classList.contains("expanded");
  }
}

// Initialize sidebar when DOM is ready
let sidebarInstance = null;

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    sidebarInstance = new SidebarNavigation();
  });
} else {
  sidebarInstance = new SidebarNavigation();
}

// Export for use in other modules (if using module system)
if (typeof module !== "undefined" && module.exports) {
  module.exports = SidebarNavigation;
}
