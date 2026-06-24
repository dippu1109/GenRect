(function initNeuralCanvas() {
  const canvas = document.getElementById('neuralCanvas');
  const ctx = canvas.getContext('2d');
  let W, H, nodes = [], animId;

  const NODE_COUNT = 55;
  const MAX_DIST   = 160;
  const NODE_SPEED = 0.35;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function createNodes() {
    nodes = [];
    for (let i = 0; i < NODE_COUNT; i++) {
      nodes.push({
        x:  Math.random() * W,
        y:  Math.random() * H,
        vx: (Math.random() - 0.5) * NODE_SPEED,
        vy: (Math.random() - 0.5) * NODE_SPEED,
        r:  Math.random() * 2 + 1.2,
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    const color = '15, 35, 72';

    // Draw edges
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const d  = Math.hypot(dx, dy);
        if (d < MAX_DIST) {
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.strokeStyle = `rgba(${color}, ${(1 - d / MAX_DIST) * 0.5})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }

    // Draw nodes
    nodes.forEach(n => {
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${color}, 0.65)`;
      ctx.fill();
    });
  }

  function update() {
    nodes.forEach(n => {
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < 0 || n.x > W) n.vx *= -1;
      if (n.y < 0 || n.y > H) n.vy *= -1;
    });
  }

  function loop() {
    update();
    draw();
    animId = requestAnimationFrame(loop);
  }

  resize();
  createNodes();
  loop();
  window.addEventListener('resize', () => {
    resize();
    createNodes();
  });
})();


/* ─────────────────────────────────────────────
   Navbar — scroll effect & hamburger
   ───────────────────────────────────────────── */
(function initNavbar() {
  const navbar   = document.querySelector('.navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');
  const navCta    = document.querySelector('.nav-cta');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  });

  hamburger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', isOpen);
    if (navCta) navCta.classList.toggle('open', isOpen);
  });

  // Close menu on link click
  navLinks.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.setAttribute('aria-expanded', false);
      if (navCta) navCta.classList.remove('open');
    });
  });

  // Nav CTA scrolls to upload
  const navCtaBtn = document.getElementById('navCta');
  if (navCtaBtn) navCtaBtn.addEventListener('click', () => scrollTo('#upload'));
})();


/* ─────────────────────────────────────────────
   Scroll-reveal animation
   ───────────────────────────────────────────── */
(function initReveal() {
  const revealEls = document.querySelectorAll(
    '.feature-card, .step-card, .cta-card, .section-header, .hero-stats'
  );
  revealEls.forEach(el => el.classList.add('reveal'));

  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add('visible'), i * 80);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });

  revealEls.forEach(el => obs.observe(el));
})();


/* ─────────────────────────────────────────────
   Upload & Detection Logic
   ───────────────────────────────────────────── */
(function initUpload() {
  const dropZone        = document.getElementById('dropZone');
  const dropZoneInner   = document.getElementById('dropZoneInner');
  const dropZonePreview = document.getElementById('dropZonePreview');
  const fileInput       = document.getElementById('fileInput');
  const uploadBtn       = document.getElementById('uploadBtn');
  const changeBtn       = document.getElementById('changeBtn');
  const analyzeBtn      = document.getElementById('analyzeBtn');
  const previewImage    = document.getElementById('previewImage');
  const previewFilename = document.getElementById('previewFilename');
  const resultsSection  = document.getElementById('resultsSection');
  const loadingCard     = document.getElementById('loadingCard');
  const resultCard      = document.getElementById('resultCard');

  let selectedFile = null;

  // ── Helper: scroll to element ──
  function scrollTo(selector) {
    const el = document.querySelector(selector);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // ── Show file preview ──
  function showPreview(file) {
    if (!file || !file.type.match(/image\/(jpeg|png|webp)/)) {
      showToast('Please upload a JPG, PNG, or WEBP image.', 'error');
      return;
    }
    selectedFile = file;
    const url = URL.createObjectURL(file);
    previewImage.src = url;
    previewFilename.textContent = file.name;
    dropZoneInner.hidden   = true;
    dropZonePreview.hidden = false;
    analyzeBtn.disabled    = false;
    analyzeBtn.focus();
  }

  // ── Reset to upload state ──
  function resetUpload() {
    selectedFile = null;
    fileInput.value = '';
    previewImage.src = '';
    dropZoneInner.hidden   = false;
    dropZonePreview.hidden = true;
    analyzeBtn.disabled    = true;
    resultsSection.hidden  = true;
    loadingCard.hidden     = true;
    resultCard.hidden      = true;
  }

  // ── File input trigger ──
  uploadBtn.addEventListener('click', (e) => { e.stopPropagation(); fileInput.click(); });
  dropZone.addEventListener('click',  () => { if (!selectedFile) fileInput.click(); });
  dropZone.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInput.click(); }
  });
  fileInput.addEventListener('change', (e) => {
    if (e.target.files[0]) showPreview(e.target.files[0]);
  });
  changeBtn.addEventListener('click', (e) => { e.stopPropagation(); resetUpload(); });

  // ── Drag & Drop ──
  dropZone.addEventListener('dragover',  (e) => { e.preventDefault(); dropZone.classList.add('drag-over'); });
  dropZone.addEventListener('dragleave', ()  => { dropZone.classList.remove('drag-over'); });
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file) showPreview(file);
  });

  // ── Reset buttons ──
  document.getElementById('resetBtn').addEventListener('click', resetUpload);
  document.getElementById('analyzeAnotherBtn').addEventListener('click', () => {
    resetUpload();
    scrollTo('#upload');
  });

  // ── Analyze Button ──
  analyzeBtn.addEventListener('click', () => {
    if (!selectedFile) return;
    startAnalysis();
  });

  // ─────────────────────────────────────────
  // Analysis Simulation
  // ─────────────────────────────────────────
  function startAnalysis() {
    resultsSection.hidden = false;
    loadingCard.hidden    = false;
    resultCard.hidden     = true;

    // Smooth scroll to results
    setTimeout(() => resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);

    // Animate loading steps
    const steps = ['step1','step2','step3','step4'];
    const delays = [0, 900, 1800, 2600];

    // Reset steps
    steps.forEach(id => {
      const el = document.getElementById(id);
      el.classList.remove('active', 'done');
    });
    document.getElementById('step1').classList.add('active');

    delays.forEach((delay, idx) => {
      setTimeout(() => {
        if (idx > 0) {
          document.getElementById(steps[idx - 1]).classList.remove('active');
          document.getElementById(steps[idx - 1]).classList.add('done');
        }
        if (idx < steps.length) {
          document.getElementById(steps[idx]).classList.add('active');
        }
      }, delay);
    });

    // After last step, mark done and show results
    setTimeout(() => {
      document.getElementById(steps[steps.length - 1]).classList.remove('active');
      document.getElementById(steps[steps.length - 1]).classList.add('done');
    }, 3500);

    setTimeout(() => {
      loadingCard.hidden = true;
      showResults();
    }, 3800);
  }

  // ─────────────────────────────────────────
  // Show Results — randomised realistic data
  // ─────────────────────────────────────────
  function showResults() {
    // Generate random result (weighted towards REAL for demo)
    const isReal = Math.random() > 0.38;

    const confidence   = isReal
      ? +(92 + Math.random() * 7.5).toFixed(1)
      : +(73 + Math.random() * 22).toFixed(1);

    const authenticity = isReal
      ? +(90 + Math.random() * 9).toFixed(1)
      : +(12 + Math.random() * 28).toFixed(1);

    const deepfakeProb = isReal
      ? +(1.5 + Math.random() * 6).toFixed(1)
      : +(68 + Math.random() * 28).toFixed(1);

    const modelConf    = +(confidence - (Math.random() * 3 - 1.5)).toFixed(1);

    const confidenceLevel = confidence >= 90 ? 'HIGH' : confidence >= 75 ? 'MEDIUM' : 'LOW';

    // ── Populate DOM ──
    // Status
    const statusIconWrap  = document.getElementById('statusIconWrap');
    const statusBadge     = document.getElementById('statusBadge');
    const statusSub       = document.getElementById('statusSub');
    const imgResultBadge  = document.getElementById('imgResultBadge');
    const progressFill    = document.getElementById('progressFill');
    const progressValue   = document.getElementById('progressValue');
    const accuracyBar     = document.getElementById('accuracyBar');
    const accuracyValue   = document.getElementById('accuracyValue');
    const confidenceLevelBadge = document.getElementById('confidenceLevelBadge');
    const authenticityScore = document.getElementById('authenticityScore');
    const deepfakeProbEl  = document.getElementById('deepfakeProb');
    const modelConfEl     = document.getElementById('modelConf');
    const authenticityBar = document.getElementById('authenticityBar');
    const deepfakeBar     = document.getElementById('deepfakeBar');
    const modelBar        = document.getElementById('modelBar');
    const analyzedImage   = document.getElementById('analyzedImage');

    // Reset classes
    statusIconWrap.className = 'status-icon-wrap';
    statusBadge.className    = 'status-badge';
    imgResultBadge.className = 'img-result-badge';
    progressFill.className   = 'progress-fill';
    confidenceLevelBadge.className = 'confidence-level-badge';
    accuracyBar.className    = 'bar-fill';
    deepfakeBar.className    = 'metric-bar-fill';
    modelBar.className       = 'metric-bar-fill';

    if (isReal) {
      statusIconWrap.classList.add('real');
      statusIconWrap.innerHTML = `
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>`;
      statusBadge.classList.add('real');
      statusBadge.textContent = 'REAL IMAGE';
      statusSub.textContent   = 'No manipulation detected — image appears authentic';
      imgResultBadge.classList.add('real');
      imgResultBadge.textContent = 'REAL';
    } else {
      statusIconWrap.classList.add('fake');
      statusIconWrap.innerHTML = `
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>`;
      statusBadge.classList.add('fake');
      statusBadge.textContent = 'DEEPFAKE DETECTED';
      statusSub.textContent   = 'AI manipulation signatures found in this image';
      imgResultBadge.classList.add('fake');
      imgResultBadge.textContent = 'DEEPFAKE';
      progressFill.classList.add('danger');
      deepfakeBar.classList.add('danger');
      accuracyBar.classList.add('danger');
    }

    // Confidence level badge
    confidenceLevelBadge.classList.add(confidenceLevel.toLowerCase());
    confidenceLevelBadge.textContent = confidenceLevel;

    // Analyzed image
    analyzedImage.src = previewImage.src;
    analyzedImage.alt = `Analyzed image: ${previewFilename.textContent}`;

    // Show card
    resultCard.hidden = false;
    resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    // ── Animate numbers ──
    animateCircularProgress(confidence, isReal);
    animateBar(accuracyBar, confidence, accuracyValue, '%');
    animateBar(authenticityBar, authenticity, authenticityScore, '%', true);
    animateBar(deepfakeBar, deepfakeProb, deepfakeProbEl, '%', true);
    animateBar(modelBar, modelConf, modelConfEl, '%', true);
  }

  // Circular progress animation
  function animateCircularProgress(target, isReal) {
    const progressFill  = document.getElementById('progressFill');
    const progressValue = document.getElementById('progressValue');
    const circumference = 364.4; // 2 * π * 58
    let current = 0;
    const duration = 1500;
    const start = performance.now();

    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      current = target * eased;

      const offset = circumference - (current / 100) * circumference;
      progressFill.style.strokeDashoffset = offset;
      progressValue.textContent = current.toFixed(1) + '%';

      if (progress < 1) requestAnimationFrame(tick);
      else progressValue.textContent = target.toFixed(1) + '%';
    }
    requestAnimationFrame(tick);
  }

  // Bar + text animation
  function animateBar(barEl, target, textEl, suffix = '%', updateText = false) {
    barEl.style.width = '0%';
    const duration = 1500;
    const start = performance.now();

    function tick(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 3);
      const current  = target * eased;
      barEl.style.width = current + '%';

      if (textEl) {
        if (updateText) textEl.textContent = current.toFixed(1) + suffix;
        else if (barEl.id === 'accuracyBar') {
          document.getElementById('accuracyValue').textContent = current.toFixed(1) + suffix;
        }
      }
      if (progress < 1) requestAnimationFrame(tick);
      else {
        barEl.style.width = target + '%';
        if (textEl && updateText) textEl.textContent = target.toFixed(1) + suffix;
        if (barEl.id === 'accuracyBar') document.getElementById('accuracyValue').textContent = target.toFixed(1) + suffix;
      }
    }
    setTimeout(() => requestAnimationFrame(tick), 200);
  }

})(); // end initUpload


/* ─────────────────────────────────────────────
   Toast Notification
   ───────────────────────────────────────────── */
function showToast(msg, type = 'info') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'assertive');
  toast.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
      ${type === 'error'
        ? '<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>'
        : '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>'}
    </svg>
    <span>${msg}</span>`;

  Object.assign(toast.style, {
    position:     'fixed',
    bottom:       '28px',
    right:        '28px',
    display:      'flex',
    alignItems:   'center',
    gap:          '10px',
    background:   type === 'error' ? '#FEE2E2' : '#DCFCE7',
    color:        type === 'error' ? '#991B1B' : '#166534',
    border:       `1px solid ${type === 'error' ? '#FECACA' : '#BBF7D0'}`,
    padding:      '14px 20px',
    borderRadius: '12px',
    fontSize:     '0.875rem',
    fontWeight:   '500',
    fontFamily:   'Inter, Helvetica, sans-serif',
    boxShadow:    '0 8px 32px rgba(0,0,0,.12)',
    zIndex:       '9999',
    animation:    'fadeInUp 0.3s ease',
    maxWidth:     '340px',
  });

  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'fadeInUp 0.3s ease reverse';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}


/* ─────────────────────────────────────────────
   Smooth scroll helper
   ───────────────────────────────────────────── */
function scrollTo(selector) {
  const el = document.querySelector(selector);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Nav CTA
document.getElementById('navCta')?.addEventListener('click', () => scrollTo('#upload'));
document.getElementById('heroAnalyzeBtn')?.addEventListener('click', (e) => {
  e.preventDefault();
  scrollTo('#upload');
});
