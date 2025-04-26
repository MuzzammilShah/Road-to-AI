---
hide:
  - navigation
  - toc
---

<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.globe.min.js"></script>

<div id="vanta-background" class="landing-page">
  <div class="hero-content">
    <img src="assets/images/white-bg-3.png" alt="Road to AI Logo" class="hero-logo light-logo">
    <img src="assets/images/dark-bg-3.png" alt="Road to AI Logo" class="hero-logo dark-logo">
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