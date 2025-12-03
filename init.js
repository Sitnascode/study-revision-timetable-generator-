/**
 * Initialization Script
 * Sets up demo data if no profile exists
 * Requirements: 1.1, 2.1
 */

/**
 * Initialize the application
 */
function initializeApp() {
  // Prevent transitions on page load
  document.body.classList.add("preload");
  setTimeout(() => {
    document.body.classList.remove("preload");
  }, 100);

  // Check if profile exists
  if (!hasProfile()) {
    console.log("No profile found, creating demo profile...");
    createDemoProfile();
  } else {
    console.log("Profile found, loading...");
    const result = loadProfile();
    if (result.success) {
      console.log("Profile loaded successfully:", result.data);
      updateUIWithProfile(result.data);
    } else {
      console.error("Failed to load profile:", result.error);
      // Show error message to user
      showError("Failed to load your profile. Please try refreshing the page.");
    }
  }

  // Set up dark mode toggle (if exists)
  setupDarkModeToggle();
}

/**
 * Creates a demo profile for testing
 */
function createDemoProfile() {
  const demoProfile = createDefaultProfile("Alex Smith", "alex@email.com");

  // Add some demo data
  demoProfile.identity.level = "Intermediate";
  demoProfile.preferences.preferredStudyTime = "Evening";
  demoProfile.preferences.sessionType = {
    studyMinutes: 50,
    breakMinutes: 10,
  };
  demoProfile.preferences.dailyMaxHours = 5;
  demoProfile.preferences.sleepHours = 8;
  demoProfile.preferences.learningStyle = "Mixed";

  // Add demo goals
  demoProfile.goals = {
    weeklyHours: 20,
    dailyGoal: "Complete 2 study sessions",
    subjectGoals: [
      {
        subjectId: "math_101",
        subject: "Mathematics",
        goal: "Master calculus fundamentals",
      },
      {
        subjectId: "cs_201",
        subject: "Computer Science",
        goal: "Complete data structures course",
      },
    ],
    learningTarget: "Prepare for final exams in May",
  };

  // Add demo statistics
  demoProfile.statistics = {
    totalStudyHours: 42.5,
    currentStreak: 7,
    subjectCount: 5,
    completedSessions: 85,
    lastStudyDate: new Date(),
  };

  // Save the demo profile
  const result = saveProfile(demoProfile);
  if (result.success) {
    console.log("Demo profile created successfully");
    updateUIWithProfile(demoProfile);
  } else {
    console.error("Failed to create demo profile:", result.error);
    showError(
      "Failed to initialize profile. Please check your browser settings."
    );
  }
}

/**
 * Updates UI elements with profile data
 * @param {UserProfile} profile
 */
function updateUIWithProfile(profile) {
  // Update sidebar user info
  if (typeof sidebarInstance !== "undefined" && sidebarInstance) {
    const initials = profile.identity.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);

    sidebarInstance.updateUserInfo(
      profile.identity.name,
      profile.identity.email,
      initials
    );
  }

  // Dispatch event for other components
  const profileLoadedEvent = new CustomEvent("profile-loaded", {
    detail: { profile },
  });
  document.dispatchEvent(profileLoadedEvent);
}

/**
 * Sets up dark mode toggle functionality
 */
function setupDarkModeToggle() {
  // Check for saved dark mode preference
  const darkModeEnabled = localStorage.getItem("darkMode") === "true";
  if (darkModeEnabled) {
    document.body.classList.add("dark-mode");
  }

  // Listen for dark mode toggle events
  document.addEventListener("toggle-dark-mode", () => {
    const isDarkMode = document.body.classList.toggle("dark-mode");
    localStorage.setItem("darkMode", isDarkMode.toString());
  });
}

/**
 * Shows an error message to the user
 * @param {string} message
 */
function showError(message) {
  // Simple error display - can be enhanced with a modal or toast
  const errorDiv = document.createElement("div");
  errorDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: var(--error);
    color: white;
    padding: 16px 24px;
    border-radius: 12px;
    box-shadow: var(--shadow-lg);
    z-index: 10000;
    max-width: 400px;
  `;
  errorDiv.textContent = message;
  document.body.appendChild(errorDiv);

  // Auto-remove after 5 seconds
  setTimeout(() => {
    errorDiv.remove();
  }, 5000);
}

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeApp);
} else {
  initializeApp();
}

// Export for use in other modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    initializeApp,
    createDemoProfile,
    updateUIWithProfile,
  };
}
