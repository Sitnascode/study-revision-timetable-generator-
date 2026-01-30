// ===========================
// Sidebar Toggle Functionality
// ===========================

function initSidebar() {
  const sidebar = document.getElementById("sidebar");
  const menuItems = document.querySelectorAll(".menu-item");
  let isClickExpanded = false;

  // Expand on hover
  sidebar.addEventListener("mouseenter", () => {
    sidebar.classList.add("expanded");
  });

  // Collapse on mouse leave (only if not click-expanded)
  sidebar.addEventListener("mouseleave", () => {
    if (!isClickExpanded) {
      sidebar.classList.remove("expanded");
    }
  });

  // Toggle on click
  sidebar.addEventListener("click", (e) => {
    const clickedItem = e.target.closest(".menu-item");
    const clickedProfile = e.target.closest(".user-profile-item");

    // If clicking a menu item, update active state
    if (clickedItem && !clickedItem.classList.contains("logout-item")) {
      menuItems.forEach((i) => i.classList.remove("active"));
      clickedItem.classList.add("active");
    }

    // Toggle click-expanded state
    isClickExpanded = !isClickExpanded;

    if (isClickExpanded) {
      sidebar.classList.add("expanded");
    } else {
      sidebar.classList.remove("expanded");
    }
  });

  // Close sidebar when clicking outside
  document.addEventListener("click", (e) => {
    if (!sidebar.contains(e.target) && isClickExpanded) {
      sidebar.classList.remove("expanded");
      isClickExpanded = false;
    }
  });
}

// ===========================
// Theme Toggle
// ===========================

function initThemeToggle() {
  const themeToggle = document.getElementById("themeToggle");
  const themeIcon = themeToggle.querySelector(".theme-icon");

  // Check for saved theme preference
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
    themeIcon.textContent = "☀️";
  }

  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    const isDark = document.body.classList.contains("dark-mode");
    themeIcon.textContent = isDark ? "☀️" : "🌙";
    localStorage.setItem("theme", isDark ? "dark" : "light");
  });
}

// ===========================
// Dynamic Placeholder Text
// ===========================

function initDynamicPlaceholder() {
  const chatInput = document.getElementById("chatInput");
  const placeholders = [
    "What should I study today?",
    "How can I improve my revision efficiency?",
    "What's the best way to manage my time?",
    "How do I stay motivated while studying?",
    "Can you suggest a study schedule for me?",
    "What are the best revision techniques?",
    "How can I improve my focus?",
    "What should I prioritize this week?",
    "How do I balance multiple subjects?",
    "Tips for exam preparation?",
  ];

  let currentIndex = 0;
  let charIndex = 0;
  let isTyping = false;
  let typingInterval;

  function typePlaceholder() {
    if (isTyping) return;

    isTyping = true;
    charIndex = 0;
    const currentText = placeholders[currentIndex];
    chatInput.placeholder = "";

    typingInterval = setInterval(() => {
      if (charIndex < currentText.length) {
        chatInput.placeholder += currentText[charIndex];
        charIndex++;
      } else {
        clearInterval(typingInterval);
        isTyping = false;
        currentIndex = (currentIndex + 1) % placeholders.length;

        // Wait 3 seconds before typing next placeholder
        setTimeout(typePlaceholder, 3000);
      }
    }, 80); // Typing speed: 80ms per character
  }

  // Start typing effect
  typePlaceholder();
}

// ===========================
// Chat Functionality with Real AI
// ===========================

function initChat() {
  const chatInput = document.getElementById("chatInput");
  const sendButton = document.getElementById("sendButton");
  const chatWindow = document.getElementById("chatWindow");
  const suggestionButtons = document.querySelectorAll(".suggestion-btn");

  // Backend API URL - change this if deploying to a different server
  const API_URL =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
      ? "http://localhost:3000"
      : ""; // Use same origin in production

  function getFallbackChatResponse(message) {
    const lowerMessage = message.toLowerCase();

    // Specific answers for the 4 suggestion buttons
    if (lowerMessage.includes("what should i study today")) {
      return "Start with your most challenging subject while your mind is fresh! Review any topics from recent classes, then move to subjects with upcoming tests or assignments. Don't forget to mix in some review of older material to keep it fresh in your memory.";
    } else if (
      lowerMessage.includes("improve my revision efficiency") ||
      lowerMessage.includes("revision efficiency")
    ) {
      return "Use active recall instead of passive reading - test yourself without looking at notes! Try the Feynman technique: explain concepts in simple terms as if teaching someone else. Space out your revision sessions over several days rather than cramming everything at once.";
    } else if (
      lowerMessage.includes("best way to manage my time") ||
      lowerMessage.includes("manage my time")
    ) {
      return "Try the Pomodoro technique: 25 minutes of focused study, then a 5-minute break. Plan your day the night before and prioritize tasks by importance and deadline. Block out specific time slots for each subject and stick to your schedule. Remember to include buffer time for unexpected tasks!";
    } else if (
      lowerMessage.includes("stay motivated while studying") ||
      lowerMessage.includes("motivated while studying")
    ) {
      return "Set small, achievable goals and reward yourself when you complete them! Create a study playlist, find a study buddy for accountability, and remind yourself why you're working toward your goals. Take regular breaks to avoid burnout - a refreshed mind is more productive than a tired one.";
    }
    // General keyword-based responses
    else if (
      lowerMessage.includes("motivat") ||
      lowerMessage.includes("inspire")
    ) {
      return "Stay focused on your goals! Break your study sessions into manageable chunks and celebrate small wins. Remember, consistency beats intensity every time.";
    } else if (
      lowerMessage.includes("time") ||
      lowerMessage.includes("schedule")
    ) {
      return "Plan your day the night before and tackle the hardest subjects when you're most alert. Use time-blocking to dedicate specific hours to each subject, and don't forget to schedule breaks!";
    } else if (
      lowerMessage.includes("memory") ||
      lowerMessage.includes("remember") ||
      lowerMessage.includes("forget")
    ) {
      return "Use active recall and spaced repetition! Test yourself regularly instead of just re-reading. Review material within 24 hours to boost retention by up to 60%.";
    } else if (
      lowerMessage.includes("exam") ||
      lowerMessage.includes("test") ||
      lowerMessage.includes("prep")
    ) {
      return "Practice past papers under timed conditions. Focus on understanding concepts, not memorizing. Get good sleep before the exam - your brain consolidates memory during sleep!";
    } else if (
      lowerMessage.includes("stress") ||
      lowerMessage.includes("anxious") ||
      lowerMessage.includes("worry")
    ) {
      return "Take deep breaths and break tasks into smaller steps. Regular exercise and good sleep help manage stress. Remember, it's okay to take breaks - they actually improve productivity!";
    } else if (
      lowerMessage.includes("focus") ||
      lowerMessage.includes("distract") ||
      lowerMessage.includes("concentrate")
    ) {
      return "Remove distractions: put your phone away and use website blockers. Study in a dedicated space and use background music or white noise if it helps you concentrate.";
    } else if (
      lowerMessage.includes("revision") ||
      lowerMessage.includes("revise")
    ) {
      return "Use active learning techniques like flashcards, practice questions, and teaching others. Break topics into smaller chunks and review them regularly using spaced repetition.";
    } else {
      return "Great question! Try breaking your study material into smaller chunks, use active recall techniques, and don't forget to take regular breaks. Consistency is key to success!";
    }
  }

  async function getAIResponse(userMessage) {
    try {
      console.log("Sending message to backend:", userMessage);

      const response = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
        }),
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      console.log("Received data:", data);

      if (data.response) {
        console.log(`Using ${data.source || "backend"} response`);
        return data.response;
      }

      throw new Error("No response from server");
    } catch (error) {
      console.log("Using fallback chat response");
      return getFallbackChatResponse(userMessage);
    }
  }

  // Hardcoded fallback content that rotates based on time
  const FALLBACK_CONTENT = {
    quotes: [
      {
        quote: "Stay focused and consistent",
        text: "Every step brings you closer to success",
      },
      {
        quote: "Believe in your potential",
        text: "You're capable of amazing things",
      },
      {
        quote: "Progress over perfection",
        text: "Small steps lead to big achievements",
      },
      {
        quote: "Keep pushing forward",
        text: "Your future self will thank you",
      },
      {
        quote: "Study smart, not just hard",
        text: "Quality beats quantity every time",
      },
      { quote: "You've got this", text: "Challenges make you stronger" },
    ],
    tips: [
      [
        { icon: "☕", text: "Take 5-min breaks" },
        { icon: "💧", text: "Drink water hourly" },
        { icon: "😴", text: "Sleep 7-8 hours" },
      ],
      [
        { icon: "🏃", text: "Move every hour" },
        { icon: "🥗", text: "Eat brain foods" },
        { icon: "📱", text: "Limit phone time" },
      ],
      [
        { icon: "☕", text: "Study in morning" },
        { icon: "💧", text: "Stay hydrated" },
        { icon: "😴", text: "Rest is important" },
      ],
    ],
    challenges: [
      "Complete 3 focused study sessions today",
      "Review your notes from yesterday",
      "Teach someone what you learned",
      "Create a mind map of your topic",
      "Practice 10 past exam questions",
      "Summarize a chapter in your own words",
    ],
    insights: [
      [
        {
          icon: "📊",
          text: "Use the Pomodoro technique: 25 minutes focus, 5 minutes break",
        },
        {
          icon: "⏱️",
          text: "Study during your peak energy hours for better retention",
        },
        {
          icon: "🧠",
          text: "Test yourself regularly instead of just re-reading notes",
        },
        {
          icon: "📚",
          text: "Review material within 24 hours to boost memory by 60%",
        },
      ],
      [
        {
          icon: "🌅",
          text: "Start with the hardest subject when your mind is fresh",
        },
        {
          icon: "✍️",
          text: "Write summaries by hand to improve understanding",
        },
        { icon: "🎯", text: "Set specific goals for each study session" },
        {
          icon: "💪",
          text: "Take breaks to let your brain consolidate information",
        },
      ],
      [
        {
          icon: "📊",
          text: "Use active recall: quiz yourself without looking at notes",
        },
        {
          icon: "⏱️",
          text: "Space out your study sessions over multiple days",
        },
        {
          icon: "🧠",
          text: "Explain concepts out loud to identify gaps in knowledge",
        },
        {
          icon: "📚",
          text: "Mix up subjects to keep your brain engaged and alert",
        },
      ],
    ],
  };

  function getRotatingIndex(arrayLength) {
    const hour = new Date().getHours();
    return hour % arrayLength;
  }

  function getFallbackContent() {
    return {
      quote:
        FALLBACK_CONTENT.quotes[
          getRotatingIndex(FALLBACK_CONTENT.quotes.length)
        ],
      tips: FALLBACK_CONTENT.tips[
        getRotatingIndex(FALLBACK_CONTENT.tips.length)
      ],
      challenge:
        FALLBACK_CONTENT.challenges[
          getRotatingIndex(FALLBACK_CONTENT.challenges.length)
        ],
      insights:
        FALLBACK_CONTENT.insights[
          getRotatingIndex(FALLBACK_CONTENT.insights.length)
        ],
    };
  }

  // Load dynamic content from backend
  async function loadDynamicContent() {
    // First, immediately show fallback content
    const fallback = getFallbackContent();
    updateMotivationSection({
      quote: fallback.quote,
      tips: fallback.tips,
      challenge: fallback.challenge,
    });
    updateInsightsSection({ insights: fallback.insights });

    console.log("Loading content from backend...");

    try {
      // Try to load from backend (will use AI if available, or server fallback)
      const motivationResponse = await fetch(`${API_URL}/api/motivation`);
      if (motivationResponse.ok) {
        const motivationData = await motivationResponse.json();
        console.log("Backend motivation loaded");
        updateMotivationSection(motivationData);
      }

      const insightsResponse = await fetch(`${API_URL}/api/insights`);
      if (insightsResponse.ok) {
        const insightsData = await insightsResponse.json();
        console.log("Backend insights loaded");
        updateInsightsSection(insightsData);
      }
    } catch (error) {
      console.log("Using fallback content (backend not available)");
      // Fallback content is already shown, so do nothing
    }
  }

  function updateMotivationSection(data) {
    const motivationQuote = document.querySelector(".motivation-quote");
    const motivationText = document.querySelector(".motivation-text");
    const tipsList = document.querySelector(".tips-list");
    const challengeText = document.querySelector(".challenge-text");

    if (motivationQuote && data.quote) {
      motivationQuote.textContent = `"${data.quote.quote}"`;
    }
    if (motivationText && data.quote) {
      motivationText.textContent = data.quote.text;
    }
    if (tipsList && data.tips) {
      tipsList.innerHTML = data.tips
        .map(
          (tip) => `
        <div class="tip-item">
          <span class="tip-icon">${tip.icon}</span>
          <span>${tip.text}</span>
        </div>
      `
        )
        .join("");
    }
    if (challengeText && data.challenge) {
      challengeText.textContent = data.challenge;
    }
  }

  function updateInsightsSection(data) {
    const insightsList = document.querySelector(".insights-list");
    if (insightsList && data.insights) {
      insightsList.innerHTML = data.insights
        .map(
          (insight, index) => `
        <div class="insight-item ${
          index === data.insights.length - 1 ? "highlight" : ""
        }">
          <span class="insight-icon">${insight.icon}</span>
          <p>${insight.text}</p>
        </div>
      `
        )
        .join("");
    }
  }

  // Load dynamic content on page load
  loadDynamicContent();

  async function sendMessage(messageText) {
    if (!messageText.trim()) return;

    // Disable input while processing
    chatInput.disabled = true;
    sendButton.disabled = true;

    // Add user message
    const userMessage = createMessage(messageText, "user");
    chatWindow.appendChild(userMessage);

    // Clear input
    chatInput.value = "";

    // Scroll to bottom
    chatWindow.scrollTop = chatWindow.scrollHeight;

    // Show typing indicator
    const typingIndicator = createTypingIndicator();
    chatWindow.appendChild(typingIndicator);
    chatWindow.scrollTop = chatWindow.scrollHeight;

    try {
      // Get AI response
      const aiResponseText = await getAIResponse(messageText);

      // Remove typing indicator
      typingIndicator.remove();

      // Add AI response
      const aiMessage = createMessage(aiResponseText, "ai");
      chatWindow.appendChild(aiMessage);
      chatWindow.scrollTop = chatWindow.scrollHeight;
    } catch (error) {
      typingIndicator.remove();
      const errorMessage = createMessage(
        "Sorry, I'm having trouble connecting right now. Please try again.",
        "ai"
      );
      chatWindow.appendChild(errorMessage);
    }

    // Re-enable input
    chatInput.disabled = false;
    sendButton.disabled = false;
    chatInput.focus();
  }

  function createMessage(text, type) {
    const messageDiv = document.createElement("div");
    messageDiv.className = `chat-message ${type}-message`;

    const avatar = document.createElement("div");
    avatar.className = "message-avatar";
    avatar.textContent = type === "ai" ? "🤖" : "👤";

    const content = document.createElement("div");
    content.className = "message-content";

    const paragraph = document.createElement("p");
    paragraph.textContent = text;
    paragraph.style.whiteSpace = "pre-line";

    content.appendChild(paragraph);
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);

    return messageDiv;
  }

  function createTypingIndicator() {
    const messageDiv = document.createElement("div");
    messageDiv.className = "chat-message ai-message typing-indicator";

    const avatar = document.createElement("div");
    avatar.className = "message-avatar";
    avatar.textContent = "🤖";

    const content = document.createElement("div");
    content.className = "message-content";
    content.innerHTML =
      '<p class="typing-dots"><span>.</span><span>.</span><span>.</span></p>';

    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);

    return messageDiv;
  }

  // Send message on button click
  sendButton.addEventListener("click", () => {
    sendMessage(chatInput.value);
  });

  // Send message on Enter key
  chatInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && !chatInput.disabled) {
      sendMessage(chatInput.value);
    }
  });

  // Handle suggestion button clicks
  suggestionButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const question = btn.getAttribute("data-question");
      chatInput.value = question;
      sendMessage(question);
    });
  });
}

// ===========================
// Initialize Everything
// ===========================

window.addEventListener("load", () => {
  initSidebar();
  initThemeToggle();
  initDynamicPlaceholder();
  initChat();
});
