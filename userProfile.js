/**
 * User Profile Data Model
 * Defines the structure for user profile data including identity, preferences, goals, and statistics
 * Requirements: 1.1, 2.1, 9.2, 10.1
 */

/**
 * @typedef {Object} UserIdentity
 * @property {string} userId - Unique user identifier
 * @property {string} name - User's full name
 * @property {string} email - User's email address
 * @property {string} [avatar] - URL to user's profile picture
 * @property {'Beginner'|'Intermediate'|'Advanced'} [level] - User's skill level
 * @property {Date} createdAt - Account creation date
 * @property {Date} lastUpdated - Last profile update date
 */

/**
 * @typedef {Object} SessionType
 * @property {number} studyMinutes - Study duration in minutes
 * @property {number} breakMinutes - Break duration in minutes
 */

/**
 * @typedef {Object} StudyPreferences
 * @property {'Morning'|'Afternoon'|'Evening'|'Night'} preferredStudyTime - Preferred time of day for studying
 * @property {SessionType} sessionType - Pomodoro-style session configuration
 * @property {number} dailyMaxHours - Maximum study hours per day
 * @property {number} sleepHours - Hours allocated for sleep
 * @property {'Reading/Theory'|'Practice'|'Mixed'} learningStyle - Preferred learning approach
 */

/**
 * @typedef {Object} SubjectGoal
 * @property {string} subjectId - Unique subject identifier
 * @property {string} subject - Subject name
 * @property {string} goal - Goal description
 * @property {Date} [deadline] - Optional goal deadline
 */

/**
 * @typedef {Object} StudyGoals
 * @property {number} [weeklyHours] - Target weekly study hours
 * @property {string} [dailyGoal] - Daily goal description
 * @property {SubjectGoal[]} [subjectGoals] - Subject-specific goals
 * @property {string} [learningTarget] - Overall learning target
 */

/**
 * @typedef {Object} StudyStatistics
 * @property {number} totalStudyHours - Total hours studied
 * @property {number} currentStreak - Current study streak in days
 * @property {number} subjectCount - Number of subjects being studied
 * @property {number} completedSessions - Number of completed study sessions
 * @property {Date} [lastStudyDate] - Date of last study session
 */

/**
 * @typedef {Object} UserProfile
 * @property {UserIdentity} identity - User identity information
 * @property {StudyPreferences} preferences - Study preferences
 * @property {StudyGoals} [goals] - Study goals (optional)
 * @property {StudyStatistics} statistics - Study statistics
 */

/**
 * Creates a default user profile with minimal required data
 * @param {string} name - User's name
 * @param {string} email - User's email
 * @returns {UserProfile}
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

/**
 * Generates a simple unique user ID
 * @returns {string}
 */
function generateUserId() {
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Validates user profile data structure
 * @param {any} data - Data to validate
 * @returns {{valid: boolean, errors: string[]}}
 */
function validateUserProfile(data) {
  const errors = [];

  if (!data || typeof data !== "object") {
    errors.push("Profile data must be an object");
    return { valid: false, errors };
  }

  // Validate identity
  if (!data.identity || typeof data.identity !== "object") {
    errors.push("Identity section is required");
  } else {
    if (!data.identity.userId || typeof data.identity.userId !== "string") {
      errors.push("User ID is required and must be a string");
    }
    if (!data.identity.name || typeof data.identity.name !== "string") {
      errors.push("Name is required and must be a string");
    } else if (
      data.identity.name.length < 1 ||
      data.identity.name.length > 100
    ) {
      errors.push("Name must be between 1 and 100 characters");
    }
    if (!data.identity.email || typeof data.identity.email !== "string") {
      errors.push("Email is required and must be a string");
    } else if (!isValidEmail(data.identity.email)) {
      errors.push("Email must be a valid email address");
    }
    if (
      data.identity.level &&
      !["Beginner", "Intermediate", "Advanced"].includes(data.identity.level)
    ) {
      errors.push("Level must be one of: Beginner, Intermediate, or Advanced");
    }
  }

  // Validate preferences
  if (!data.preferences || typeof data.preferences !== "object") {
    errors.push("Preferences section is required");
  } else {
    if (
      !["Morning", "Afternoon", "Evening", "Night"].includes(
        data.preferences.preferredStudyTime
      )
    ) {
      errors.push(
        "Preferred study time must be one of: Morning, Afternoon, Evening, or Night"
      );
    }
    if (
      !data.preferences.sessionType ||
      typeof data.preferences.sessionType !== "object"
    ) {
      errors.push("Session type is required");
    } else {
      if (
        typeof data.preferences.sessionType.studyMinutes !== "number" ||
        data.preferences.sessionType.studyMinutes < 5 ||
        data.preferences.sessionType.studyMinutes > 180
      ) {
        errors.push("Study minutes must be between 5 and 180");
      }
      if (
        typeof data.preferences.sessionType.breakMinutes !== "number" ||
        data.preferences.sessionType.breakMinutes < 5 ||
        data.preferences.sessionType.breakMinutes > 60
      ) {
        errors.push("Break minutes must be between 5 and 60");
      }
    }
    if (
      typeof data.preferences.dailyMaxHours !== "number" ||
      data.preferences.dailyMaxHours < 1 ||
      data.preferences.dailyMaxHours > 24
    ) {
      errors.push("Daily max hours must be between 1 and 24");
    }
    if (
      typeof data.preferences.sleepHours !== "number" ||
      data.preferences.sleepHours < 1 ||
      data.preferences.sleepHours > 12
    ) {
      errors.push("Sleep hours must be between 1 and 12");
    }
    if (
      !["Reading/Theory", "Practice", "Mixed"].includes(
        data.preferences.learningStyle
      )
    ) {
      errors.push(
        "Learning style must be one of: Reading/Theory, Practice, or Mixed"
      );
    }
  }

  // Validate statistics
  if (!data.statistics || typeof data.statistics !== "object") {
    errors.push("Statistics section is required");
  } else {
    if (
      typeof data.statistics.totalStudyHours !== "number" ||
      data.statistics.totalStudyHours < 0
    ) {
      errors.push("Total study hours must be a non-negative number");
    }
    if (
      typeof data.statistics.currentStreak !== "number" ||
      data.statistics.currentStreak < 0
    ) {
      errors.push("Current streak must be a non-negative number");
    }
    if (
      typeof data.statistics.subjectCount !== "number" ||
      data.statistics.subjectCount < 0
    ) {
      errors.push("Subject count must be a non-negative number");
    }
    if (
      typeof data.statistics.completedSessions !== "number" ||
      data.statistics.completedSessions < 0
    ) {
      errors.push("Completed sessions must be a non-negative number");
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Simple email validation
 * @param {string} email
 * @returns {boolean}
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Export for use in other modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    createDefaultProfile,
    validateUserProfile,
    generateUserId,
  };
}
