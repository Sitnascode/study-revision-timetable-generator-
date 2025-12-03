/**
 * Logout Utility - Reusable logout functionality
 * Can be included in any page that needs logout functionality
 */

(function () {
  "use strict";

  // Logout configuration
  const LOGOUT_CONFIG = {
    confirmMessage: "Are you sure you want to log out?",
    redirectUrl: "landing_profile_page_final/index.html", // Landing page
    clearStorage: true,
    showNotification: true,
  };

  /**
   * Performs the logout action
   * @param {Object} options - Optional configuration overrides
   */
  function performLogout(options = {}) {
    const config = { ...LOGOUT_CONFIG, ...options };

    // Show confirmation dialog
    if (config.confirmMessage) {
      const confirmed = confirm(config.confirmMessage);
      if (!confirmed) {
        return false;
      }
    }

    // Clear storage if configured
    if (config.clearStorage) {
      clearUserData();
    }

    // Show notification
    if (config.showNotification) {
      showLogoutNotification();
    }

    // Redirect after a short delay
    setTimeout(() => {
      window.location.href = config.redirectUrl;
    }, 500);

    return true;
  }

  /**
   * Clears user data from localStorage
   * Keeps theme preference
   */
  function clearUserData() {
    // Save theme preference before clearing
    const theme = localStorage.getItem("theme");
    const darkMode = localStorage.getItem("darkMode");

    // Clear all user data
    localStorage.removeItem("userProfile");
    localStorage.removeItem("userAvatar");

    // Restore theme preference
    if (theme) {
      localStorage.setItem("theme", theme);
    }
    if (darkMode) {
      localStorage.setItem("darkMode", darkMode);
    }

    console.log("User data cleared successfully");
  }

  /**
   * Shows a logout notification
   */
  function showLogoutNotification() {
    const notification = document.createElement("div");
    notification.style.cssText = `
      position: fixed;
      top: 24px;
      right: 24px;
      background: #10b981;
      color: white;
      padding: 16px 24px;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 10000;
      font-family: 'Poppins', sans-serif;
      font-weight: 500;
      animation: slideIn 0.3s ease;
    `;
    notification.textContent = "Logged out successfully!";

    // Add animation
    const style = document.createElement("style");
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(400px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(notification);

    // Remove after animation
    setTimeout(() => {
      notification.remove();
      style.remove();
    }, 400);
  }

  /**
   * Initializes logout buttons on the page
   * Automatically finds and attaches logout handlers
   */
  function initializeLogoutButtons() {
    // Find all logout buttons by common selectors
    const logoutSelectors = [
      "#logoutBtn",
      ".logout-btn",
      ".logout-item",
      '[data-action="logout"]',
      'a[href*="logout"]',
      'button[name="logout"]',
    ];

    logoutSelectors.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      elements.forEach((element) => {
        // Remove existing listeners by cloning
        const newElement = element.cloneNode(true);
        element.parentNode.replaceChild(newElement, element);

        // Add new logout listener
        newElement.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          performLogout();
        });
      });
    });

    console.log("Logout buttons initialized");
  }

  /**
   * Check if user is logged in
   * @returns {boolean}
   */
  function isLoggedIn() {
    return localStorage.getItem("userProfile") !== null;
  }

  /**
   * Redirect to login if not logged in
   * @param {string} loginUrl - URL to redirect to if not logged in
   */
  function requireLogin(loginUrl = "landing_profile_page_final/index.html") {
    if (!isLoggedIn()) {
      window.location.href = loginUrl;
    }
  }

  // Expose public API
  window.LogoutManager = {
    logout: performLogout,
    clearUserData: clearUserData,
    initializeLogoutButtons: initializeLogoutButtons,
    isLoggedIn: isLoggedIn,
    requireLogin: requireLogin,
  };

  // Auto-initialize when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeLogoutButtons);
  } else {
    initializeLogoutButtons();
  }
})();
