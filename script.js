(function () {
  "use strict";

  // ----- Year in footer -----
  var yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  // ----- Sticky header shadow -----
  var header = document.querySelector(".header");
  function onScrollHeader() {
    if (!header) return;
    if (window.scrollY > 24) {
      header.classList.add("is-scrolled");
    } else {
      header.classList.remove("is-scrolled");
    }
  }
  window.addEventListener("scroll", onScrollHeader, { passive: true });
  onScrollHeader();

  // ----- Dynamic Mouse-Tracking Glow -----
  var glowEl = document.querySelector(".cursor-glow");
  if (glowEl) {
    window.addEventListener("mousemove", function (e) {
      window.requestAnimationFrame(function () {
        glowEl.style.setProperty("--mouse-x", e.clientX + "px");
        glowEl.style.setProperty("--mouse-y", e.clientY + "px");
      });
    });
  }

  // ----- Mobile nav toggle -----
  var navToggle = document.querySelector(".nav-toggle");
  var navMenu = document.querySelector(".nav-menu");
  var navLinks = document.querySelectorAll(".nav-link");

  function setMenuOpen(open) {
    if (!navToggle || !navMenu) return;
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    navMenu.classList.toggle("is-open", open);
    document.body.style.overflow = open ? "hidden" : "";
  }

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", function () {
      var expanded = navToggle.getAttribute("aria-expanded") === "true";
      setMenuOpen(!expanded);
    });

    navLinks.forEach(function (link) {
      link.addEventListener("click", function () {
        setMenuOpen(false);
      });
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 768) {
        setMenuOpen(false);
      }
    });
  }

  // ----- Smooth scroll for in-page links (enhanced offset for fixed nav) -----
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener("click", function (e) {
      var id = this.getAttribute("href");
      if (!id || id === "#") return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var navH = header ? header.offsetHeight : 72;
      var top = target.getBoundingClientRect().top + window.scrollY - navH - 12;
      window.scrollTo({ top: top, behavior: "smooth" });
    });
  });

  // ----- Scroll reveal -----
  var revealEls = document.querySelectorAll(".reveal");
  if (revealEls.length && "IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { root: null, rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    revealEls.forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  // ----- Fake AI demo -----
  var topicInput = document.getElementById("topic-input");
  var generateBtn = document.getElementById("generate-btn");
  var demoLoading = document.getElementById("demo-loading");
  var demoOutput = document.getElementById("demo-output");

  var sampleNotes = [
    {
      title: "Key concepts",
      bullets: [
        "Define the core terms and how they relate to the bigger picture.",
        "Identify 2–3 principles you could explain to a friend in one minute.",
        "Note common misconceptions and the correct intuition.",
      ],
    },
    {
      title: "Study plan",
      bullets: [
        "Day 1: Skim outline and build a question list.",
        "Day 2: Deep read + summarize each section in your own words.",
        "Day 3: Practice problems or flashcards + review weak spots.",
      ],
    },
  ];

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function buildDummyHtml(topic) {
    var safe =
      topic && topic.trim() ? escapeHtml(topic.trim()) : "your topic";
    return (
      "<div class=\"demo-note-wrapper\">" +
        "<div class=\"demo-note-header\">" +
          "<div class=\"demo-note-title\">📓 Topic Summary: <span style=\"color:#c4b5fd; font-weight:700;\">" + safe + "</span></div>" +
          "<div class=\"demo-chip\">AI Generated</div>" +
        "</div>" +
        
        "<div class=\"demo-note-section\">" +
          "<h4 class=\"demo-section-title\">💡 Core Concepts & Definitions</h4>" +
          "<ul class=\"demo-bullet-list\">" +
            "<li><strong>Principal Components:</strong> Key ideas extracted dynamically from textbook corpus.</li>" +
            "<li><strong>Intuitive Analogy:</strong> Simplifying the core theory so it can be explained in 1 minute.</li>" +
            "<li><strong>Common Pitfall:</strong> Avoid mixing up standard interpretations with advanced corner cases.</li>" +
          "</ul>" +
        "</div>" +
        
        "<div class=\"demo-note-section\">" +
          "<h4 class=\"demo-section-title\">📅 Custom 3-Day Study Schedule</h4>" +
          "<ul class=\"demo-bullet-list\">" +
            "<li><strong>Day 1 (Quick Scan):</strong> Review outline diagrams and formulate questions.</li>" +
            "<li><strong>Day 2 (Summarize):</strong> Read core blocks and summarize in your own words.</li>" +
            "<li><strong>Day 3 (Active Recall):</strong> Test yourself with interactive flashcards.</li>" +
          "</ul>" +
        "</div>" +

        "<div class=\"demo-note-section\">" +
          "<h4 class=\"demo-section-title\">💻 Code Blueprint & Key Formulas</h4>" +
          "<div class=\"demo-code-card\">" +
            "<div class=\"demo-code-header\">" +
              "<div class=\"demo-code-dot-group\">" +
                "<div class=\"demo-code-dot\"></div>" +
                "<div class=\"demo-code-dot\"></div>" +
                "<div class=\"demo-code-dot\"></div>" +
              "</div>" +
              "<div class=\"demo-code-lang\">python</div>" +
            "</div>" +
            "<pre class=\"demo-code-body\"><span class=\"demo-code-keyword\">def</span> <span class=\"demo-code-highlight\">explain_concept</span>(topic=<span class=\"demo-code-highlight\">\"" + safe + "\"</span>):" + "\n" +
"    <span class=\"demo-code-comment\"># AI-Powered interactive synthesis model</span>" + "\n" +
"    summary = generate_summary(topic)" + "\n" +
"    <span class=\"demo-code-keyword\">return</span> f<span class=\"demo-code-highlight\">\"StudyAI: {summary['key_points']}\"</span></pre>" +
          "</div>" +
        "</div>" +
      "</div>"
    );
  }

  var demoTimeout;
  function runDemo() {
    if (!generateBtn || !demoOutput) return;

    var topic = topicInput ? topicInput.value : "";
    generateBtn.disabled = true;
    if (demoLoading) demoLoading.classList.remove("hidden");
    demoOutput.innerHTML = "<p class=\"demo-placeholder\">Preparing output…</p>";
    demoOutput.classList.remove("has-content");

    clearTimeout(demoTimeout);
    demoTimeout = setTimeout(function () {
      if (demoLoading) demoLoading.classList.add("hidden");
      demoOutput.innerHTML = buildDummyHtml(topic);
      demoOutput.classList.add("has-content");
      generateBtn.disabled = false;
    }, 1800);
  }

  if (generateBtn) {
    generateBtn.addEventListener("click", runDemo);
  }
  if (topicInput) {
    topicInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        runDemo();
      }
    });
  }

  // ----- Contact form (front-end only) -----
  var contactForm = document.getElementById("contact-form");
  var formToast = document.getElementById("form-toast");

  if (contactForm && formToast) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = document.getElementById("name");
      var email = document.getElementById("email");
      var message = document.getElementById("message");
      if (!name || !email || !message) return;
      if (!name.value.trim() || !email.value.trim() || !message.value.trim()) {
        formToast.textContent = "Please fill in all fields.";
        formToast.style.color = "#fca5a5";
        formToast.classList.remove("hidden");
        return;
      }
      formToast.textContent = "Thanks! This is a demo—no message was sent.";
      formToast.style.color = "#86efac";
      formToast.classList.remove("hidden");
      contactForm.reset();
    });
  }
})();
