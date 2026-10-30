(function () {
  /**
   * Configuration for debug mode.
   * When set to true, debug logs will be enabled in the browser's developer console.
   * @type {boolean}
   */
  const DEBUG = true;

  /**
   * Prefix for logging messages to easily identify widget-related logs.
   * @type {string}
   */
  const LOG_PREFIX = "[X-Twitter-Widget]";

  /**
   * Logs debug messages when DEBUG mode is enabled.
   *
   * @param {string} message - The primary log message
   * @param {...*} args - Additional arguments to log
   */
  function log(message, ...args) {
    if (DEBUG) {
      console.log(`${LOG_PREFIX} ${message}`, ...args);
    }
  }

  /**
   * Determines the current color scheme of the document.
   *
   * Checks color scheme in the following order:
   * 1. HTML or body element's data-md-color-scheme attribute
   * 2. Palette component's selected radio input
   * 3. Locally stored color scheme
   * 4. Default to light mode
   *
   * @returns {string} 'dark' or 'light' color scheme
   */
  function getColorScheme() {
    // Retrieve existing color scheme
    const html = document.documentElement;
    const body = document.body;
    const currentScheme =
      html.getAttribute("data-md-color-scheme") ||
      body.getAttribute("data-md-color-scheme");

    if (currentScheme) {
      log("Current document color scheme:", currentScheme);
      return currentScheme === "slate" ? "dark" : "light";
    }

    // Get selected palette
    const palette = document.querySelector('[data-md-component="palette"]');
    if (palette) {
      const checkedInput = palette.querySelector('input[type="radio"]:checked');
      if (checkedInput) {
        const scheme = checkedInput.getAttribute("data-md-color-scheme");
        log("Using palette color scheme:", scheme);
        return scheme === "slate" ? "dark" : "light";
      }
    }

    // Check localStorage
    const storedScheme = localStorage.getItem("data-md-color-scheme");
    if (storedScheme) {
      log("Using stored color scheme:", storedScheme);
      return storedScheme === "slate" ? "dark" : "light";
    }

    // Default to light mode
    log("Using default light theme");
    return "light";
  }

  /**
   * Recreates a tweet widget in the specified container.
   *
   * Clears existing content, creates a new blockquote with the tweet,
   * and reloads the Twitter widget with the current color scheme.
   *
   * @param {HTMLElement} container - The container element for the tweet
   */
  function recreateTweet(container) {
    const theme = getColorScheme();
    const url = container.getAttribute("data-url");
    log("Recreating tweet:", url, "with theme:", theme);

    // Clear existing content
    container.innerHTML = "";

    // Create new blockquote
    const blockquote = document.createElement("blockquote");
    blockquote.className = "twitter-tweet";
    blockquote.setAttribute("data-theme", theme);

    const link = document.createElement("a");
    link.href = url;
    blockquote.appendChild(link);

    container.appendChild(blockquote);

    // Reload widget
    if (window.twttr && window.twttr.widgets) {
      window.twttr.widgets
        .load(container)
        .then(() => log("Tweet widget loaded successfully"))
        .catch((err) => log("Error loading tweet widget:", err));
    }
  }

  /**
   * Recreates all Twitter tweet widgets on the page.
   * Finds all elements with the 'x-twitter-embed' class and reloads them.
   */
  function recreateAllTweets() {
    log("Recreating all tweets");
    document.querySelectorAll(".x-twitter-embed").forEach((container) => {
      recreateTweet(container);
    });
  }

  /**
   * Creates a debounced version of a function to limit the rate of execution.
   *
   * @param {Function} func - The function to debounce
   * @param {number} wait - The wait time in milliseconds
   * @returns {Function} A debounced version of the input function
   */
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * Initializes the Twitter widget.
   *
   * Loads the Twitter script if not already loaded,
   * then recreates all tweets after a short delay.
   */
  function initializeWidget() {
    log("Initializing Twitter widget");

    if (!window.twttr) {
      log("Loading Twitter script");
      const script = document.createElement("script");
      script.src = "https://platform.twitter.com/widgets.js";
      script.async = true;
      script.onload = () => {
        log("Twitter script loaded");
        setTimeout(recreateAllTweets, 500);
      };
      document.head.appendChild(script);
    } else {
      setTimeout(recreateAllTweets, 500);
    }
  }

  /**
   * Sets up an observer to detect color scheme changes in Material for MkDocs.
   *
   * Monitors changes to data-md-color-scheme attributes on HTML and body elements,
   * as well as changes in the palette component.
   * Uses debounce to prevent excessive re-rendering.
   */
  function setupColorSchemeObserver() {
    log("Setting up color scheme observer");

    // Debounce recreation of tweets
    const debouncedRecreate = debounce(recreateAllTweets, 100);

    // Observe HTML element for color scheme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "data-md-color-scheme") {
          log("Color scheme mutation detected");
          debouncedRecreate();
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-md-color-scheme"],
    });

    // Observe body element for color scheme changes
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["data-md-color-scheme"],
    });

    // Listen for palette changes
    const palette = document.querySelector('[data-md-component="palette"]');
    if (palette) {
      palette.addEventListener("change", () => {
        log("Palette change detected");
        debouncedRecreate();
      });
    }
  }

  /**
   * Main initialization function.
   *
   * Sets up color scheme observer and initializes the Twitter widget.
   * Handles cases where the document might still be loading.
   */
  function initialize() {
    log("Starting initialization");

    if (document.readyState === "loading") {
      log("Document still loading, waiting for DOMContentLoaded");
      document.addEventListener("DOMContentLoaded", () => {
        setupColorSchemeObserver();
        setTimeout(initializeWidget, 1000);
      });
      return;
    }

    setupColorSchemeObserver();
    setTimeout(initializeWidget, 1000);
  }

  // Start script execution
  log("Script loaded");
  initialize();
})();
