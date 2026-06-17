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
    var parts = sampleNotes
      .map(function (block) {
        var lis = block.bullets
          .map(function (b) {
            return "<li>" + b + "</li>";
          })
          .join("");
        return "<h4>" + block.title + "</h4><ul>" + lis + "</ul>";
      })
      .join("");
    return (
      "<p><strong>Topic:</strong> " +
      safe +
      "</p>" +
      "<p>Here is a structured preview of what StudyAI could generate for you:</p>" +
      parts +
      "<p style=\"margin-top:1rem;font-size:0.9rem;color:var(--text-muted);\">This is a demo response—connect a real model later for live answers.</p>"
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
