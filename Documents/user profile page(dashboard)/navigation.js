/**
 * Navigation Utility - Handles page navigation across the app
 */

(function () {
  "use strict";

  // Page URLs
  const PAGES = {
    home: "landing_profile_page_final/index.html",
    profile: "user-profile-dashboard.html",
    progress: "progress.html",
    aiAdvisor: "ai-advisor.html",
    subject: "/subjects.html",
    generate: "/generate.html",
    timetable: "/timetable.html",
  };

  // Check if we're in the generate folder
  const isInGenerateFolder = window.location.pathname.includes("/generate/");
  if (isInGenerateFolder) {
    PAGES.home = "../landing_profile_page_final/index.html";
    PAGES.profile = "../user-profile-dashboard.html";
    PAGES.progress = "../progress.html";
    PAGES.aiAdvisor = "../ai-advisor.html";
    PAGES.subject = "../subjects.html";
    PAGES.generate = "../generate.html";
    PAGES.timetable = "../timetable.html";
  }

  /**
   * Navigate to a specific page
   * @param {string} page - Page key from PAGES object
   */
  function navigateTo(page) {
    const url = PAGES[page];
    if (url) {
      window.location.href = url;
    } else {
      console.warn(`Page "${page}" not found`);
    }
  }

  /**
   * Initialize navigation for sidebar menu items
   */
  function initializeSidebarNavigation() {
    const menuItems = document.querySelectorAll(".sidebar-menu .menu-item");

    menuItems.forEach((item) => {
      const text = item.querySelector(".menu-text")?.textContent.trim();

      item.addEventListener("click", (e) => {
        e.preventDefault();

        switch (text) {
          case "Subject":
            navigateTo("subject");
            break;
          case "Generate":
            navigateTo("generate");
            break;
          case "Timetable":
            navigateTo("timetable");
            break;
          case "Progress":
            navigateTo("progress");
            break;
          case "AI Advisor":
            navigateTo("aiAdvisor");
            break;
          case "User Profile":
            navigateTo("profile");
            break;
          default:
            console.log(`Navigation for "${text}" not implemented yet`);
        }
      });
    });
  }

  /**
   * Initialize user profile avatar click to navigate to profile
   */
  function initializeProfileNavigation() {
    const profileItems = document.querySelectorAll(".user-profile-item");

    profileItems.forEach((item) => {
      // Only add navigation if it's not already a link and not the logout item
      if (!item.classList.contains("logout-item")) {
        item.style.cursor = "pointer";
        item.addEventListener("click", (e) => {
          e.preventDefault();
          navigateTo("profile");
        });
      }
    });
  }

  /**
   * Initialize home button/link navigation
   */
  function initializeHomeNavigation() {
    const homeButtons = document.querySelectorAll(
      ".home-btn, .logo-text, .sidebar-logo",
    );

    homeButtons.forEach((btn) => {
      btn.style.cursor = "pointer";
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        navigateTo("home");
      });
    });
  }

  /**
   * Add home button to header if it doesn't exist
   * This function is now disabled - home buttons should be added manually in HTML
   */
  function addHomeButton() {
    // Disabled - home buttons are now added manually in HTML for better control
    return;
  }

  /**
   * Initialize all navigation
   */
  function initializeNavigation() {
    initializeSidebarNavigation();
    initializeProfileNavigation();
    initializeHomeNavigation();
    addHomeButton();
    console.log("Navigation initialized");
  }

  // Expose public API
  window.NavigationManager = {
    navigateTo: navigateTo,
    initialize: initializeNavigation,
    pages: PAGES,
  };

  // Auto-initialize when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeNavigation);
  } else {
    initializeNavigation();
  }
})();
