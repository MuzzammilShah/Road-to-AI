---
hide:
  - navigation
  - toc
---

<style>
  #vanta-background {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    width: 100vw !important;
    min-height: 100vh !important;
    overflow: hidden !important;
    z-index: -1 !important;
  }

  .landing-page .hero-content {
    position: absolute !important;
    top: 50% !important;
    left: 10% !important;
    transform: translateY(-50%) !important;
    width: min(40%, 480px) !important;
    padding: 20px !important;
    z-index: 1 !important;
  }

  .hero-logo {
    display: none !important;
    width: 80% !important;
    margin-bottom: 10px !important;
  }

  body[data-md-color-scheme="default"] .light-logo {
    display: block !important;
  }

  body[data-md-color-scheme="slate"] .dark-logo {
    display: block !important;
  }

  .hero-content h1 {
    font-size: 0.1em !important;
  }

  .hero-content p {
    font-size: 1.2em !important;
  }

  @media (max-width: 768px) {
    .landing-page .hero-content {
      left: 5% !important;
      width: 90% !important;
      padding: 10px !important;
    }

    .hero-logo {
      width: 100% !important;
    }

    .hero-content p {
      font-size: 1.1em !important;
    }
  }
</style>

<script>
(function ensureLandingStyles() {
  var existing = document.querySelector('link[data-landing-custom-style]');
  if (!existing) {
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = new URL('stylesheets/custom.css', document.baseURI).href;
    link.setAttribute('data-landing-custom-style', 'true');
    document.head.appendChild(link);
  }
})();
</script>

<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.globe.min.js"></script>

<div id="vanta-background" class="landing-page">
  <div class="hero-content">
    <img src="assets/images/white-bg-logo.png" alt="Road to AI Logo" class="hero-logo light-logo">
    <img src="assets/images/black-bg-logo.png" alt="Road to AI Logo" class="hero-logo dark-logo">
    <!-- <h1>Road to AI</h1> -->
    <p>Documenting My Journey in Artificial Intelligence.</p>
    <!-- <a href="/ZeroToHero/" class="hero-button">Start Learning</a> -->
  </div>
</div>

<script>
var vantaEffect = VANTA.GLOBE({
  el: "#vanta-background.landing-page",
  mouseControls: true,
  touchControls: true,
  gyroControls: false,
  scale: 1.00,
  scaleMobile: 1.00,
  color: document.body.getAttribute('data-md-color-scheme') === 'slate' ? 0xffffff : 0x121212,
  color2: document.body.getAttribute('data-md-color-scheme') === 'slate' ? 0xffffff : 0x121212,
  backgroundColor: document.body.getAttribute('data-md-color-scheme') === 'slate' ? 0x121212 : 0xffffff
});

// Set up observer for theme changes
var observer = new MutationObserver(function(mutations) {
  mutations.forEach(function(mutation) {
    if (mutation.attributeName === 'data-md-color-scheme') {
      var newScheme = document.body.getAttribute('data-md-color-scheme');
      var newOptions = {
        color: newScheme === 'slate' ? 0xffffff : 0x121212,
        color2: newScheme === 'slate' ? 0xffffff : 0x121212,
        backgroundColor: newScheme === 'slate' ? 0x121212 : 0xffffff
      };
      vantaEffect.setOptions(newOptions);
    }
  });
});
observer.observe(document.body, {
  attributes: true,
  attributeFilter: ['data-md-color-scheme']
});
</script>