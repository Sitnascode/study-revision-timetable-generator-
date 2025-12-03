/**
 * User Profile Dashboard - Main JavaScript
 * Requirements: 1.1, 2.1, 3.1-3.5, 4.1-4.5, 5.1-5.5, 6.1-6.5, 7.1-7.5, 8.1-8.5
 */

// ============================================
// DATA MODEL
// ============================================

/**
 * Creates a default user profile
 */
function createDefaultProfile(name, email) {
  return {
    identity: {
      userId: generateUserId(),
      name: name,
      email: email,
      createdAt: new Date(),
      lastUpdated: new Date(),
    },
    preferences: {
      preferredStudyTime: "Evening",
      sessionType: {
        studyMinutes: 25,
        breakMinutes: 5,
      },
      dailyMaxHours: 5,
      sleepHours: 8,
      learningStyle: "Mixed",
    },
    statistics: {
      totalStudyHours: 0,
      currentStreak: 0,
      subjectCount: 0,
      completedSessions: 0,
    },
  };
}

function generateUserId() {
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Validates user profile data
 */
function validateUserProfile(data) {
  const errors = [];

  if (!data || typeof data !== "object") {
    errors.push("Profile data must be an object");
    return { valid: false, errors };
  }

  // Validate identity
  if (!data.identity) {
    errors.push("Identity section is required");
  } else {
    if (
      !data.identity.name ||
      data.identity.name.length < 1 ||
      data.identity.name.length > 100
    ) {
      errors.push("Name must be between 1 and 100 characters");
    }
    if (!data.identity.email || !isValidEmail(data.identity.email)) {
      errors.push("Valid email is required");
    }
  }

  // Validate preferences
  if (!data.preferences) {
    errors.push("Preferences section is required");
  } else {
    if (
      data.preferences.dailyMaxHours < 1 ||
      data.preferences.dailyMaxHours > 24
    ) {
      errors.push("Daily max hours must be between 1 and 24");
    }
    if (data.preferences.sleepHours < 1 || data.preferences.sleepHours > 12) {
      errors.push("Sleep hours must be between 1 and 12");
    }
  }

  return { valid: errors.length === 0, errors };
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ============================================
// STORAGE UTILITIES
// ============================================

const STORAGE_KEY = "userProfile";

function saveProfile(profile) {
  try {
    const validation = validateUserProfile(profile);
    if (!validation.valid) {
      return { success: false, error: validation.errors.join(", ") };
    }

    profile.identity.lastUpdated = new Date();
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: "1.0", data: profile })
    );
    return { success: true };
  } catch (error) {
    console.error("Error saving profile:", error);
    return { success: false, error: error.message };
  }
}

function loadProfile() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return { success: false, error: "No profile found" };
    }

    const parsed = JSON.parse(stored);

    // Convert date strings back to Date objects
    if (parsed.data.identity) {
      parsed.data.identity.createdAt = new Date(parsed.data.identity.createdAt);
      parsed.data.identity.lastUpdated = new Date(
        parsed.data.identity.lastUpdated
      );
    }

    return { success: true, data: parsed.data };
  } catch (error) {
    console.error("Error loading profile:", error);
    return { success: false, error: error.message };
  }
}

function hasProfile() {
  return localStorage.getItem(STORAGE_KEY) !== null;
}

function clearProfile() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ============================================
// SIDEBAR NAVIGATION
// ============================================

class SidebarNavigation {
  constructor() {
    this.sidebar = document.getElementById("sidebar");
    this.menuItems = document.querySelectorAll(".menu-item");
    this.logoutBtn = document.getElementById("logoutBtn");
    this.isClickLocked = false;

    this.init();
  }

  init() {
    if (!this.sidebar) return;

    this.setupHoverBehavior();
    this.setupClickLockBehavior();
    this.setupClickOutsideBehavior();
    this.setupNavigationHandlers();
    this.setupLogoutHandler();
  }

  updateMainContentMargin() {
    const mainContent = document.querySelector(".main-content");
    if (mainContent) {
      if (this.sidebar.classList.contains("expanded")) {
        mainContent.style.marginLeft = "240px";
      } else {
        mainContent.style.marginLeft = "70px";
      }
    }
  }

  setupHoverBehavior() {
    this.sidebar.addEventListener("mouseenter", () => {
      this.sidebar.classList.add("expanded");
      this.updateMainContentMargin();
    });

    this.sidebar.addEventListener("mouseleave", () => {
      if (!this.isClickLocked) {
        this.sidebar.classList.remove("expanded");
        this.updateMainContentMargin();
      }
    });
  }

  setupClickLockBehavior() {
    this.sidebar.addEventListener("click", (e) => {
      const clickedMenuItem = e.target.closest(".menu-item");
      const clickedProfile = e.target.closest(".user-profile-item");

      if (clickedMenuItem) return;

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
        this.updateMainContentMargin();
      }
    });
  }

  setupClickOutsideBehavior() {
    document.addEventListener("click", (e) => {
      if (!this.sidebar.contains(e.target) && this.isClickLocked) {
        this.isClickLocked = false;
        this.sidebar.classList.remove("expanded");
        this.updateMainContentMargin();
      }
    });
  }

  setupNavigationHandlers() {
    this.menuItems.forEach((item) => {
      item.addEventListener("click", (e) => {
        e.preventDefault();

        if (item.classList.contains("logout-item")) return;

        const page = item.getAttribute("data-page");

        this.menuItems.forEach((menuItem) => {
          menuItem.classList.remove("active");
        });
        item.classList.add("active");

        console.log(`Navigating to: ${page}`);
        window.location.hash = page;
      });
    });
  }

  setupLogoutHandler() {
    if (this.logoutBtn) {
      this.logoutBtn.addEventListener("click", (e) => {
        e.preventDefault();
        // Use LogoutManager if available, otherwise fallback
        if (window.LogoutManager) {
          window.LogoutManager.logout();
        } else {
          if (confirm("Are you sure you want to log out?")) {
            localStorage.removeItem("userProfile");
            localStorage.removeItem("userAvatar");
            window.location.href = "landing_profile_page_final/index.html";
          }
        }
      });
    }
  }

  updateUserInfo(name, email, avatarUrl) {
    const userNameEl = document.querySelector(".user-name");
    const userEmailEl = document.querySelector(".user-email");
    const userAvatarImg = document.getElementById("userAvatarImg");

    if (userNameEl) userNameEl.textContent = name;
    if (userEmailEl) userEmailEl.textContent = email;
    if (userAvatarImg && avatarUrl) {
      userAvatarImg.src = avatarUrl;
    }
  }
}

// ============================================
// PROFILE DASHBOARD
// ============================================

class ProfileDashboard {
  constructor() {
    this.profile = null;
    this.modal = document.getElementById("modalBackdrop");
    this.modalTitle = document.getElementById("modalTitle");
    this.modalBody = document.getElementById("modalBody");

    this.init();
  }

  init() {
    this.loadAndDisplayProfile();
    this.setupEventListeners();
    this.setupDarkMode();
  }

  loadAndDisplayProfile() {
    // First check if there's data from profile setup page
    const setupData = localStorage.getItem("userProfile");

    if (setupData) {
      try {
        const parsedSetupData = JSON.parse(setupData);
        console.log("Loading profile from setup page...");
        this.createProfileFromSetup(parsedSetupData);
        return;
      } catch (error) {
        console.error("Error parsing setup data:", error);
      }
    }

    // Check for existing dashboard profile
    if (!hasProfile()) {
      console.log("No profile found, creating demo profile...");
      this.createDemoProfile();
    } else {
      const result = loadProfile();
      if (result.success) {
        this.profile = result.data;
        this.updateUI();
      } else {
        console.error("Failed to load profile:", result.error);
        this.createDemoProfile();
      }
    }
  }

  createProfileFromSetup(setupData) {
    // Convert profile setup data to dashboard format
    const name = setupData.name || setupData.username || "User";
    const email = setupData.email || "user@email.com";

    this.profile = createDefaultProfile(name, email);

    // Map avatar
    if (setupData.avatar) {
      this.profile.identity.avatar = setupData.avatar;
    } else {
      this.profile.identity.avatar = localStorage.getItem("userAvatar") || null;
    }

    // Map grade/level
    if (setupData.grade) {
      this.profile.identity.level = setupData.grade;
    }

    // Map preferences
    if (setupData.focus) {
      this.profile.preferences.preferredStudyTime = setupData.focus;
    }

    // Map session type
    if (setupData.session) {
      if (
        setupData.session === "Custom" &&
        setupData.customStudy &&
        setupData.customBreak
      ) {
        this.profile.preferences.sessionType = {
          studyMinutes: parseInt(setupData.customStudy),
          breakMinutes: parseInt(setupData.customBreak),
        };
      } else {
        // Parse standard session formats like "25/5 (25 min study + 5 min break)"
        const match = setupData.session.match(/(\d+)\/(\d+)/);
        if (match) {
          this.profile.preferences.sessionType = {
            studyMinutes: parseInt(match[1]),
            breakMinutes: parseInt(match[2]),
          };
        }
      }
    }

    // Map daily max hours
    if (setupData.maxHours) {
      this.profile.preferences.dailyMaxHours = parseInt(setupData.maxHours);
    }

    // Map sleep hours
    if (setupData.sleep) {
      this.profile.preferences.sleepHours = parseInt(setupData.sleep);
    }

    // Map learning style
    if (setupData.style) {
      // Convert from setup format to dashboard format
      const styleMap = {
        "Theory / Reading": "Reading/Theory",
        "Practice / Exercises": "Practice",
        "Mixed / Balanced": "Mixed",
      };
      this.profile.preferences.learningStyle =
        styleMap[setupData.style] || setupData.style;
    }

    // Map goals from setup data
    this.profile.goals = {
      weeklyHours: setupData.weeklyHours
        ? parseInt(setupData.weeklyHours)
        : null,
      dailyGoal: setupData.dailyGoal || null,
      subjectGoals: [],
      learningTarget: setupData.learningTarget || null,
    };

    // Initialize statistics
    this.profile.statistics = {
      totalStudyHours: 0,
      currentStreak: 0,
      subjectCount: 0,
      completedSessions: 0,
      lastStudyDate: null,
    };

    // Save the converted profile
    saveProfile(this.profile);
    this.updateUI();
  }

  createDemoProfile() {
    this.profile = createDefaultProfile("Alex Smith", "alex@email.com");

    // Add demo data
    this.profile.identity.avatar =
      "https://ui-avatars.com/api/?name=Alex+Smith&background=3b82f6&color=fff&size=256";
    this.profile.identity.level = "Intermediate";
    this.profile.preferences.preferredStudyTime = "Evening";
    this.profile.preferences.sessionType = {
      studyMinutes: 50,
      breakMinutes: 10,
    };
    this.profile.preferences.dailyMaxHours = 5;
    this.profile.preferences.sleepHours = 8;
    this.profile.preferences.learningStyle = "Mixed";

    this.profile.goals = {
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

    this.profile.statistics = {
      totalStudyHours: 42.5,
      currentStreak: 7,
      subjectCount: 5,
      completedSessions: 85,
      lastStudyDate: new Date(),
    };

    saveProfile(this.profile);
    this.updateUI();
  }

  updateUI() {
    // Update identity section - Requirement 1.1, 1.2, 1.3
    const greeting = document.getElementById("greeting");
    const levelBadge = document.getElementById("levelBadge");
    const userAvatarLarge = document.getElementById("userAvatarLarge");

    if (greeting) {
      greeting.textContent = `Hi, ${this.profile.identity.name} 👋`;
    }

    if (levelBadge) {
      if (this.profile.identity.level) {
        levelBadge.textContent = this.profile.identity.level;
        levelBadge.style.display = "inline-block";
      } else {
        levelBadge.style.display = "none";
      }
    }

    if (userAvatarLarge) {
      if (this.profile.identity.avatar) {
        userAvatarLarge.src = this.profile.identity.avatar;
      } else {
        // Fallback to generated avatar
        const name = encodeURIComponent(this.profile.identity.name);
        userAvatarLarge.src = `https://ui-avatars.com/api/?name=${name}&background=3b82f6&color=fff&size=256`;
      }
    }

    // Update preferences - Requirement 2.1
    document.getElementById("studyTime").textContent =
      this.profile.preferences.preferredStudyTime;
    document.getElementById(
      "sessionType"
    ).textContent = `${this.profile.preferences.sessionType.studyMinutes} min study + ${this.profile.preferences.sessionType.breakMinutes} min break`;
    document.getElementById(
      "dailyMax"
    ).textContent = `${this.profile.preferences.dailyMaxHours} hours`;
    document.getElementById(
      "sleepHours"
    ).textContent = `${this.profile.preferences.sleepHours} hours`;
    document.getElementById("learningStyle").textContent =
      this.profile.preferences.learningStyle;

    // Update goals - Requirement 4.1-4.4
    if (this.profile.goals) {
      if (this.profile.goals.weeklyHours) {
        document.getElementById(
          "weeklyHours"
        ).textContent = `${this.profile.goals.weeklyHours} hours`;
      }
      if (this.profile.goals.dailyGoal) {
        document.getElementById("dailyGoal").textContent =
          this.profile.goals.dailyGoal;
      }
      if (this.profile.goals.subjectGoals) {
        const subjectGoalsEl = document.getElementById("subjectGoals");
        subjectGoalsEl.innerHTML = this.profile.goals.subjectGoals
          .map((g) => `<div class="subject-goal">${g.subject}: ${g.goal}</div>`)
          .join("");
      }
      if (this.profile.goals.learningTarget) {
        document.getElementById("learningTarget").textContent =
          this.profile.goals.learningTarget;
      }
    }

    // Update statistics - Requirement 5.1-5.4
    document.getElementById("totalHours").textContent =
      this.profile.statistics.totalStudyHours;
    document.getElementById("currentStreak").textContent =
      this.profile.statistics.currentStreak;
    document.getElementById("subjectCount").textContent =
      this.profile.statistics.subjectCount;
    document.getElementById("completedSessions").textContent =
      this.profile.statistics.completedSessions;

    // Update sidebar
    if (window.sidebarInstance) {
      const avatarUrl =
        this.profile.identity.avatar ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(
          this.profile.identity.name
        )}&background=3b82f6&color=fff&size=128`;
      window.sidebarInstance.updateUserInfo(
        this.profile.identity.name,
        this.profile.identity.email,
        avatarUrl
      );
    }

    // Re-initialize Feather icons
    if (typeof feather !== "undefined") {
      feather.replace();
    }
  }

  setupEventListeners() {
    // Edit buttons - Requirement 3.1
    document.getElementById("editProfileBtn")?.addEventListener("click", () => {
      this.openEditModal("profile");
    });

    document
      .getElementById("editPreferencesBtn")
      ?.addEventListener("click", () => {
        this.openEditModal("preferences");
      });

    document.getElementById("editGoalsBtn")?.addEventListener("click", () => {
      this.openEditModal("goals");
    });

    // Modal controls
    document.getElementById("closeModalBtn")?.addEventListener("click", () => {
      this.closeModal();
    });

    document.getElementById("cancelBtn")?.addEventListener("click", () => {
      this.closeModal();
    });

    document.getElementById("saveBtn")?.addEventListener("click", () => {
      this.saveChanges();
    });

    // Close modal on backdrop click
    this.modal?.addEventListener("click", (e) => {
      if (e.target === this.modal) {
        this.closeModal();
      }
    });

    // Close modal on ESC key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.modal.classList.contains("active")) {
        this.closeModal();
      }
    });
  }

  openEditModal(type) {
    this.currentEditType = type;

    if (type === "profile") {
      this.modalTitle.textContent = "Edit Profile";
      this.modalBody.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <div>
            <label style="display: block; margin-bottom: 8px; font-weight: 600;">Name</label>
            <input type="text" id="editName" value="${
              this.profile.identity.name
            }" 
              style="width: 100%; padding: 10px; border: 1px solid var(--border-subtle); border-radius: 8px; font-family: var(--font-family);">
          </div>
          <div>
            <label style="display: block; margin-bottom: 8px; font-weight: 600;">Email</label>
            <input type="email" id="editEmail" value="${
              this.profile.identity.email
            }" 
              style="width: 100%; padding: 10px; border: 1px solid var(--border-subtle); border-radius: 8px; font-family: var(--font-family);">
          </div>
          <div>
            <label style="display: block; margin-bottom: 8px; font-weight: 600;">Level</label>
            <select id="editLevel" style="width: 100%; padding: 10px; border: 1px solid var(--border-subtle); border-radius: 8px; font-family: var(--font-family);">
              <option value="">None</option>
              <option value="Beginner" ${
                this.profile.identity.level === "Beginner" ? "selected" : ""
              }>Beginner</option>
              <option value="Intermediate" ${
                this.profile.identity.level === "Intermediate" ? "selected" : ""
              }>Intermediate</option>
              <option value="Advanced" ${
                this.profile.identity.level === "Advanced" ? "selected" : ""
              }>Advanced</option>
            </select>
          </div>
        </div>
      `;
    } else if (type === "preferences") {
      this.modalTitle.textContent = "Edit Study Preferences";
      this.modalBody.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <div>
            <label style="display: block; margin-bottom: 8px; font-weight: 600;">Preferred Study Time</label>
            <select id="editStudyTime" style="width: 100%; padding: 10px; border: 1px solid var(--border-subtle); border-radius: 8px; font-family: var(--font-family);">
              <option value="Morning" ${
                this.profile.preferences.preferredStudyTime === "Morning"
                  ? "selected"
                  : ""
              }>Morning</option>
              <option value="Afternoon" ${
                this.profile.preferences.preferredStudyTime === "Afternoon"
                  ? "selected"
                  : ""
              }>Afternoon</option>
              <option value="Evening" ${
                this.profile.preferences.preferredStudyTime === "Evening"
                  ? "selected"
                  : ""
              }>Evening</option>
              <option value="Night" ${
                this.profile.preferences.preferredStudyTime === "Night"
                  ? "selected"
                  : ""
              }>Night</option>
            </select>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div>
              <label style="display: block; margin-bottom: 8px; font-weight: 600;">Study Minutes</label>
              <input type="number" id="editStudyMinutes" value="${
                this.profile.preferences.sessionType.studyMinutes
              }" min="5" max="180"
                style="width: 100%; padding: 10px; border: 1px solid var(--border-subtle); border-radius: 8px; font-family: var(--font-family);">
            </div>
            <div>
              <label style="display: block; margin-bottom: 8px; font-weight: 600;">Break Minutes</label>
              <input type="number" id="editBreakMinutes" value="${
                this.profile.preferences.sessionType.breakMinutes
              }" min="5" max="60"
                style="width: 100%; padding: 10px; border: 1px solid var(--border-subtle); border-radius: 8px; font-family: var(--font-family);">
            </div>
          </div>
          <div>
            <label style="display: block; margin-bottom: 8px; font-weight: 600;">Daily Max Hours (1-24)</label>
            <input type="number" id="editDailyMax" value="${
              this.profile.preferences.dailyMaxHours
            }" min="1" max="24"
              style="width: 100%; padding: 10px; border: 1px solid var(--border-subtle); border-radius: 8px; font-family: var(--font-family);">
          </div>
          <div>
            <label style="display: block; margin-bottom: 8px; font-weight: 600;">Sleep Hours (1-12)</label>
            <input type="number" id="editSleepHours" value="${
              this.profile.preferences.sleepHours
            }" min="1" max="12"
              style="width: 100%; padding: 10px; border: 1px solid var(--border-subtle); border-radius: 8px; font-family: var(--font-family);">
          </div>
          <div>
            <label style="display: block; margin-bottom: 8px; font-weight: 600;">Learning Style</label>
            <select id="editLearningStyle" style="width: 100%; padding: 10px; border: 1px solid var(--border-subtle); border-radius: 8px; font-family: var(--font-family);">
              <option value="Reading/Theory" ${
                this.profile.preferences.learningStyle === "Reading/Theory"
                  ? "selected"
                  : ""
              }>Reading/Theory</option>
              <option value="Practice" ${
                this.profile.preferences.learningStyle === "Practice"
                  ? "selected"
                  : ""
              }>Practice</option>
              <option value="Mixed" ${
                this.profile.preferences.learningStyle === "Mixed"
                  ? "selected"
                  : ""
              }>Mixed</option>
            </select>
          </div>
        </div>
      `;
    } else if (type === "goals") {
      this.modalTitle.textContent = "Edit Study Goals";

      // Get existing subject goals
      const subjectGoals = this.profile.goals?.subjectGoals || [];
      const subjectGoalsHTML = subjectGoals
        .map(
          (goal, index) => `
        <div class="subject-goal-item" style="display: flex; gap: 8px; margin-bottom: 8px;">
          <input type="text" class="subject-name" data-index="${index}" value="${goal.subject}" placeholder="Subject"
            style="flex: 1; padding: 8px; border: 1px solid var(--border-subtle); border-radius: 8px; font-family: var(--font-family);">
          <input type="text" class="subject-goal" data-index="${index}" value="${goal.goal}" placeholder="Goal"
            style="flex: 2; padding: 8px; border: 1px solid var(--border-subtle); border-radius: 8px; font-family: var(--font-family);">
          <button type="button" class="remove-subject-goal" data-index="${index}"
            style="padding: 8px 12px; background: var(--error); color: white; border: none; border-radius: 8px; cursor: pointer;">Remove</button>
        </div>
      `
        )
        .join("");

      this.modalBody.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <div>
            <label style="display: block; margin-bottom: 8px; font-weight: 600;">Weekly Hours Goal</label>
            <input type="number" id="editWeeklyHours" value="${
              this.profile.goals?.weeklyHours || ""
            }" min="1" max="168"
              style="width: 100%; padding: 10px; border: 1px solid var(--border-subtle); border-radius: 8px; font-family: var(--font-family);">
          </div>
          <div>
            <label style="display: block; margin-bottom: 8px; font-weight: 600;">Daily Goal</label>
            <input type="text" id="editDailyGoal" value="${
              this.profile.goals?.dailyGoal || ""
            }"
              style="width: 100%; padding: 10px; border: 1px solid var(--border-subtle); border-radius: 8px; font-family: var(--font-family);">
          </div>
          <div>
            <label style="display: block; margin-bottom: 8px; font-weight: 600;">Subject Goals</label>
            <div id="subjectGoalsList">
              ${subjectGoalsHTML}
            </div>
            <button type="button" id="addSubjectGoal"
              style="margin-top: 8px; padding: 8px 16px; background: var(--accent); color: white; border: none; border-radius: 8px; cursor: pointer;">
              + Add Subject Goal
            </button>
          </div>
          <div>
            <label style="display: block; margin-bottom: 8px; font-weight: 600;">Learning Target</label>
            <textarea id="editLearningTarget" rows="3"
              style="width: 100%; padding: 10px; border: 1px solid var(--border-subtle); border-radius: 8px; font-family: var(--font-family);">${
                this.profile.goals?.learningTarget || ""
              }</textarea>
          </div>
        </div>
      `;

      // Add event listeners for subject goals
      setTimeout(() => {
        document
          .getElementById("addSubjectGoal")
          ?.addEventListener("click", () => {
            const list = document.getElementById("subjectGoalsList");
            const index = list.children.length;
            const newGoal = document.createElement("div");
            newGoal.className = "subject-goal-item";
            newGoal.style.cssText =
              "display: flex; gap: 8px; margin-bottom: 8px;";
            newGoal.innerHTML = `
            <input type="text" class="subject-name" data-index="${index}" placeholder="Subject"
              style="flex: 1; padding: 8px; border: 1px solid var(--border-subtle); border-radius: 8px; font-family: var(--font-family);">
            <input type="text" class="subject-goal" data-index="${index}" placeholder="Goal"
              style="flex: 2; padding: 8px; border: 1px solid var(--border-subtle); border-radius: 8px; font-family: var(--font-family);">
            <button type="button" class="remove-subject-goal" data-index="${index}"
              style="padding: 8px 12px; background: var(--error); color: white; border: none; border-radius: 8px; cursor: pointer;">Remove</button>
          `;
            list.appendChild(newGoal);

            // Add remove listener
            newGoal
              .querySelector(".remove-subject-goal")
              .addEventListener("click", (e) => {
                e.target.closest(".subject-goal-item").remove();
              });
          });

        // Add remove listeners to existing items
        document.querySelectorAll(".remove-subject-goal").forEach((btn) => {
          btn.addEventListener("click", (e) => {
            e.target.closest(".subject-goal-item").remove();
          });
        });
      }, 10);
    }

    this.modal.classList.add("active");

    if (typeof feather !== "undefined") {
      feather.replace();
    }
  }

  closeModal() {
    this.modal.classList.remove("active");
  }

  saveChanges() {
    // Requirement 3.2 - Validation, 3.3 - Persistence, 3.4 - Immediate UI update
    try {
      if (this.currentEditType === "profile") {
        const name = document.getElementById("editName").value.trim();
        const email = document.getElementById("editEmail").value.trim();
        const level = document.getElementById("editLevel").value;

        if (!name || name.length < 1 || name.length > 100) {
          alert("Name must be between 1 and 100 characters");
          return;
        }

        if (!isValidEmail(email)) {
          alert("Please enter a valid email address");
          return;
        }

        this.profile.identity.name = name;
        this.profile.identity.email = email;
        this.profile.identity.level = level || undefined;
      } else if (this.currentEditType === "preferences") {
        const studyTime = document.getElementById("editStudyTime").value;
        const studyMinutes = parseInt(
          document.getElementById("editStudyMinutes").value
        );
        const breakMinutes = parseInt(
          document.getElementById("editBreakMinutes").value
        );
        const dailyMax = parseInt(
          document.getElementById("editDailyMax").value
        );
        const sleepHours = parseInt(
          document.getElementById("editSleepHours").value
        );
        const learningStyle =
          document.getElementById("editLearningStyle").value;

        if (studyMinutes < 5 || studyMinutes > 180) {
          alert("Study minutes must be between 5 and 180");
          return;
        }

        if (breakMinutes < 5 || breakMinutes > 60) {
          alert("Break minutes must be between 5 and 60");
          return;
        }

        if (dailyMax < 1 || dailyMax > 24) {
          alert("Daily max hours must be between 1 and 24");
          return;
        }

        if (sleepHours < 1 || sleepHours > 12) {
          alert("Sleep hours must be between 1 and 12");
          return;
        }

        this.profile.preferences.preferredStudyTime = studyTime;
        this.profile.preferences.sessionType.studyMinutes = studyMinutes;
        this.profile.preferences.sessionType.breakMinutes = breakMinutes;
        this.profile.preferences.dailyMaxHours = dailyMax;
        this.profile.preferences.sleepHours = sleepHours;
        this.profile.preferences.learningStyle = learningStyle;
      } else if (this.currentEditType === "goals") {
        const weeklyHours =
          parseInt(document.getElementById("editWeeklyHours").value) ||
          undefined;
        const dailyGoal =
          document.getElementById("editDailyGoal").value.trim() || undefined;
        const learningTarget =
          document.getElementById("editLearningTarget").value.trim() ||
          undefined;

        // Collect subject goals
        const subjectGoalItems =
          document.querySelectorAll(".subject-goal-item");
        const subjectGoals = [];
        subjectGoalItems.forEach((item, index) => {
          const subject = item.querySelector(".subject-name").value.trim();
          const goal = item.querySelector(".subject-goal").value.trim();
          if (subject && goal) {
            subjectGoals.push({
              subjectId: `subject_${Date.now()}_${index}`,
              subject: subject,
              goal: goal,
            });
          }
        });

        if (!this.profile.goals) {
          this.profile.goals = {};
        }

        this.profile.goals.weeklyHours = weeklyHours;
        this.profile.goals.dailyGoal = dailyGoal;
        this.profile.goals.subjectGoals =
          subjectGoals.length > 0 ? subjectGoals : undefined;
        this.profile.goals.learningTarget = learningTarget;
      }

      const saveResult = saveProfile(this.profile);
      if (!saveResult.success) {
        alert("Failed to save: " + saveResult.error);
        return;
      }

      this.updateUI();
      this.closeModal();

      // Show success message
      this.showNotification("Changes saved successfully!", "success");
    } catch (error) {
      console.error("Error saving changes:", error);
      alert("An error occurred while saving changes");
    }
  }

  showNotification(message, type = "success") {
    const notification = document.createElement("div");
    notification.style.cssText = `
      position: fixed;
      top: 24px;
      right: 24px;
      background: ${type === "success" ? "var(--success)" : "var(--error)"};
      color: white;
      padding: 16px 24px;
      border-radius: 12px;
      box-shadow: var(--shadow-lg);
      z-index: 10000;
      animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  setupDarkMode() {
    const darkModeToggle = document.getElementById("darkModeToggle");
    const darkModeEnabled = localStorage.getItem("darkMode") === "true";

    // Function to update icon based on mode
    const updateIcon = (isDark) => {
      const icon = darkModeToggle?.querySelector(".toggle-icon");
      if (icon) {
        if (isDark) {
          icon.textContent = "☀️"; // Sun emoji for dark mode
        } else {
          icon.textContent = "🌙"; // Moon emoji for light mode
        }
      }
    };

    if (darkModeEnabled) {
      document.body.classList.add("dark-mode");
      updateIcon(true);
    }

    darkModeToggle?.addEventListener("click", () => {
      const isDarkMode = document.body.classList.toggle("dark-mode");
      localStorage.setItem("darkMode", isDarkMode.toString());
      updateIcon(isDarkMode);
    });
  }
}

// ============================================
// INITIALIZATION
// ============================================

let sidebarInstance = null;
let dashboardInstance = null;

function initializeApp() {
  // Initialize sidebar
  sidebarInstance = new SidebarNavigation();
  window.sidebarInstance = sidebarInstance;

  // Initialize dashboard
  dashboardInstance = new ProfileDashboard();
  window.dashboardInstance = dashboardInstance;

  console.log("User Profile Dashboard initialized successfully");
}

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeApp);
} else {
  initializeApp();
}

// Utility function to reset profile (accessible from console)
window.resetProfile = function () {
  clearProfile();
  console.log("Profile cleared! Refreshing page...");
  location.reload();
};
