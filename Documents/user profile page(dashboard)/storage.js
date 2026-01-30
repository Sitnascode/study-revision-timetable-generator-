/**
 * Storage Utility Functions
 * Handles localStorage operations for user profile data
 * Requirements: 1.1, 2.1, 9.2, 10.1
 */

const STORAGE_KEYS = {
  USER_PROFILE: "userProfile",
  STUDY_SESSIONS: "studySessions",
  STORAGE_VERSION: "storageVersion",
};

const CURRENT_VERSION = "1.0";

/**
 * Saves user profile to localStorage
 * @param {UserProfile} profile - User profile data to save
 * @returns {{success: boolean, error?: string}}
 */
function saveProfile(profile) {
  try {
    // Validate profile before saving
    if (typeof validateUserProfile === "function") {
      const validation = validateUserProfile(profile);
      if (!validation.valid) {
        return {
          success: false,
          error: `Validation failed: ${validation.errors.join(", ")}`,
        };
      }
    }

    // Update lastUpdated timestamp
    profile.identity.lastUpdated = new Date();

    // Prepare storage object with version
    const storageData = {
      version: CURRENT_VERSION,
      data: profile,
    };

    // Save to localStorage
    localStorage.setItem(
      STORAGE_KEYS.USER_PROFILE,
      JSON.stringify(storageData)
    );

    return { success: true };
  } catch (error) {
    console.error("Error saving profile:", error);

    // Try fallback to sessionStorage
    try {
      const storageData = {
        version: CURRENT_VERSION,
        data: profile,
      };
      sessionStorage.setItem(
        STORAGE_KEYS.USER_PROFILE,
        JSON.stringify(storageData)
      );
      console.warn("Saved to sessionStorage as fallback");
      return { success: true };
    } catch (fallbackError) {
      return {
        success: false,
        error: `Failed to save profile: ${error.message}`,
      };
    }
  }
}

/**
 * Loads user profile from localStorage
 * @returns {{success: boolean, data?: UserProfile, error?: string}}
 */
function loadProfile() {
  try {
    // Try localStorage first
    let storageData = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    let source = "localStorage";

    // Fallback to sessionStorage if localStorage is empty
    if (!storageData) {
      storageData = sessionStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      source = "sessionStorage";
    }

    if (!storageData) {
      return {
        success: false,
        error: "No profile data found",
      };
    }

    // Parse stored data
    const parsed = JSON.parse(storageData);

    // Check version compatibility
    if (parsed.version !== CURRENT_VERSION) {
      console.warn(
        `Storage version mismatch: ${parsed.version} vs ${CURRENT_VERSION}`
      );
      // Could implement migration logic here
    }

    // Validate loaded data
    if (typeof validateUserProfile === "function") {
      const validation = validateUserProfile(parsed.data);
      if (!validation.valid) {
        return {
          success: false,
          error: `Corrupted profile data: ${validation.errors.join(", ")}`,
        };
      }
    }

    // Convert date strings back to Date objects
    if (parsed.data.identity) {
      if (parsed.data.identity.createdAt) {
        parsed.data.identity.createdAt = new Date(
          parsed.data.identity.createdAt
        );
      }
      if (parsed.data.identity.lastUpdated) {
        parsed.data.identity.lastUpdated = new Date(
          parsed.data.identity.lastUpdated
        );
      }
    }
    if (parsed.data.statistics && parsed.data.statistics.lastStudyDate) {
      parsed.data.statistics.lastStudyDate = new Date(
        parsed.data.statistics.lastStudyDate
      );
    }
    if (parsed.data.goals && parsed.data.goals.subjectGoals) {
      parsed.data.goals.subjectGoals.forEach((goal) => {
        if (goal.deadline) {
          goal.deadline = new Date(goal.deadline);
        }
      });
    }

    console.log(`Profile loaded from ${source}`);
    return {
      success: true,
      data: parsed.data,
    };
  } catch (error) {
    console.error("Error loading profile:", error);
    return {
      success: false,
      error: `Failed to load profile: ${error.message}`,
    };
  }
}

/**
 * Updates specific fields in the user profile
 * @param {Object} updates - Object containing fields to update
 * @returns {{success: boolean, data?: UserProfile, error?: string}}
 */
function updateProfile(updates) {
  try {
    // Load current profile
    const loadResult = loadProfile();
    if (!loadResult.success) {
      return loadResult;
    }

    const profile = loadResult.data;

    // Apply updates (deep merge)
    if (updates.identity) {
      profile.identity = { ...profile.identity, ...updates.identity };
    }
    if (updates.preferences) {
      profile.preferences = { ...profile.preferences, ...updates.preferences };
      if (updates.preferences.sessionType) {
        profile.preferences.sessionType = {
          ...profile.preferences.sessionType,
          ...updates.preferences.sessionType,
        };
      }
    }
    if (updates.goals) {
      profile.goals = { ...profile.goals, ...updates.goals };
    }
    if (updates.statistics) {
      profile.statistics = { ...profile.statistics, ...updates.statistics };
    }

    // Save updated profile
    const saveResult = saveProfile(profile);
    if (!saveResult.success) {
      return saveResult;
    }

    return {
      success: true,
      data: profile,
    };
  } catch (error) {
    console.error("Error updating profile:", error);
    return {
      success: false,
      error: `Failed to update profile: ${error.message}`,
    };
  }
}

/**
 * Clears all profile data from storage
 * @returns {{success: boolean, error?: string}}
 */
function clearProfile() {
  try {
    localStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
    sessionStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
    return { success: true };
  } catch (error) {
    console.error("Error clearing profile:", error);
    return {
      success: false,
      error: `Failed to clear profile: ${error.message}`,
    };
  }
}

/**
 * Checks if a user profile exists in storage
 * @returns {boolean}
 */
function hasProfile() {
  try {
    const data =
      localStorage.getItem(STORAGE_KEYS.USER_PROFILE) ||
      sessionStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    return data !== null;
  } catch (error) {
    console.error("Error checking profile existence:", error);
    return false;
  }
}

/**
 * Gets available storage space information
 * @returns {{available: boolean, message: string}}
 */
function checkStorageAvailability() {
  try {
    const testKey = "__storage_test__";
    localStorage.setItem(testKey, "test");
    localStorage.removeItem(testKey);
    return {
      available: true,
      message: "localStorage is available",
    };
  } catch (error) {
    if (error.name === "QuotaExceededError") {
      return {
        available: false,
        message: "Storage quota exceeded",
      };
    }
    return {
      available: false,
      message: "localStorage is not available",
    };
  }
}

// Export for use in other modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    saveProfile,
    loadProfile,
    updateProfile,
    clearProfile,
    hasProfile,
    checkStorageAvailability,
    STORAGE_KEYS,
  };
}
