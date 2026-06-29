(function () {
  'use strict';

  // Apps Script Web App URL (see google-apps-script/README.md to deploy).
  // Leave empty during local testing — sendLead() just no-ops if unset.
  var GOOGLE_SCRIPT_URL = '';

  function sendLead(data) {
    if (!GOOGLE_SCRIPT_URL) return;
    fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(data)
    }).catch(function () {
      // Best-effort — a failed lead ping shouldn't block the success UI.
    });
  }

  // ───────── Countdown timer ─────────
  var seconds = 23 * 3600 + 59 * 59;
  var countdownEl = document.getElementById('countdown');

  function renderCountdown() {
    var h = String(Math.floor(seconds / 3600)).padStart(2, '0');
    var m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
    var s = String(seconds % 60).padStart(2, '0');
    if (countdownEl) countdownEl.textContent = h + ':' + m + ':' + s;
  }
  renderCountdown();
  setInterval(function () {
    seconds = Math.max(0, seconds - 1);
    renderCountdown();
  }, 1000);

  // ───────── Stock counter (slowly decreasing) ─────────
  var stock = 22;
  var stockEls = [document.getElementById('stock'), document.getElementById('stockForm')];

  function renderStock() {
    stockEls.forEach(function (el) { if (el) el.textContent = stock; });
  }
  renderStock();
  setInterval(function () {
    if (Math.random() < 0.07 && stock > 4) {
      stock -= 1;
      renderStock();
    }
  }, 10000);

  // ───────── Popup ─────────
  var popupOverlay = document.getElementById('popupOverlay');

  function openPopup() {
    if (popupOverlay) popupOverlay.style.display = 'flex';
  }
  function closePopup() {
    if (popupOverlay) popupOverlay.style.display = 'none';
  }
  document.querySelectorAll('.js-open-popup').forEach(function (btn) {
    btn.addEventListener('click', openPopup);
  });
  document.querySelectorAll('[data-action="close-popup"]').forEach(function (el) {
    el.addEventListener('click', closePopup);
  });
  setTimeout(openPopup, 6000);

  // ───────── Symptom selector ─────────
  var symTips = {
    'Vàng Lá': 'Thiếu đạm + vi lượng. Dùng 20-20-20 pha 1ml/lít tưới gốc + phun lá đều 2 mặt. Sau 5–7 ngày lá xanh đậm bền trở lại, không vàng tái phát.',
    'Đọt Không Ra': 'Thiếu lân kích thích phân hoá mầm. Dùng 10-55-10 pha 1ml/lít tưới gốc + phun đọt non. Chỉ 7 ngày đọt bung đều, cây tăng trưởng mạnh.',
    'Rễ Kém / Đất Chai': 'Thiếu hữu cơ + vi sinh. Dùng 30-10-10 (hữu cơ 70%) tưới gốc 2 lần/tuần. Sau 3 ngày đất xốp hơn, rễ non nhú rõ, nước thấm đều.',
    'Cây Ốm Yếu': 'Thiếu kali + vi lượng tổng hợp. Dùng 10-0-30 pha 1ml/lít tưới đều. Sau 14 ngày cành cứng, lá dày bóng, thân to khoẻ hẳn.'
  };
  var symNames = ['Vàng Lá', 'Đọt Không Ra', 'Rễ Kém / Đất Chai', 'Cây Ốm Yếu'];
  var symRecBlock = document.getElementById('symRecBlock');
  var symRecName = document.getElementById('symRecName');
  var symRecText = document.getElementById('symRecText');

  document.querySelectorAll('[data-sym-btn]').forEach(function (btn, idx) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('[data-sym-btn]').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      var name = symNames[idx];
      if (symRecName) symRecName.textContent = name;
      if (symRecText) symRecText.textContent = symTips[name];
      if (symRecBlock) symRecBlock.style.display = 'block';
    });
  });

  // ───────── Products carousel ─────────
  var car = document.getElementById('carousel');
  if (car) {
    var activeSlide = 0;
    var paused = false;
    var resumeTimer;

    function updateDots(i) {
      document.querySelectorAll('[data-dot]').forEach(function (d, j) {
        d.classList.toggle('active', j === i);
      });
    }

    function scrollToSlide(i) {
      var card = car.querySelector('[data-card="1"]');
      if (!card) return;
      car.scrollTo({ left: i * (card.offsetWidth + 12), behavior: 'smooth' });
      updateDots(i);
      activeSlide = i;
    }

    car.addEventListener('scroll', function () {
      var card = car.querySelector('[data-card="1"]');
      if (!card) return;
      var w = card.offsetWidth + 12;
      var i = Math.min(3, Math.round(car.scrollLeft / w));
      updateDots(i);
      activeSlide = i;
    }, { passive: true });

    function pause() { paused = true; clearTimeout(resumeTimer); }
    function resume() { resumeTimer = setTimeout(function () { paused = false; }, 1200); }
    car.addEventListener('touchstart', pause, { passive: true });
    car.addEventListener('touchend', resume, { passive: true });
    car.addEventListener('mousedown', pause, { passive: true });
    car.addEventListener('mouseup', resume, { passive: true });

    setInterval(function () {
      if (paused) return;
      scrollToSlide((activeSlide + 1) % 4);
    }, 3500);

    document.querySelectorAll('[data-dot]').forEach(function (dot) {
      dot.addEventListener('click', function () {
        scrollToSlide(parseInt(dot.getAttribute('data-slide'), 10));
      });
    });
  }

  // ───────── Form submit handlers (client-side only for now) ─────────
  function submitDone(id, msg) {
    var btn = document.getElementById(id);
    if (!btn) return;
    btn.textContent = msg;
    btn.classList.add('submitted');
    btn.disabled = true;
  }

  // Set GOOGLE_SCRIPT_URL above (after deploying google-apps-script/Code.gs)
  // to have these actually log to the Sheet + ping Telegram.

  var mainBtn = document.querySelector('[data-action="main-submit"]');
  if (mainBtn) {
    mainBtn.addEventListener('click', function () {
      var comboInput = document.querySelector('input[name="opt"]:checked');
      var comboLabel = comboInput && comboInput.value === '1'
        ? 'Mua 3 tặng 1 — combo tốt nhất'
        : 'Tư vấn mã phù hợp với cây của tôi';
      sendLead({
        source: 'main-form',
        name: (document.getElementById('mainName') || {}).value || '',
        phone: (document.getElementById('mainPhone') || {}).value || '',
        combo: comboLabel
      });
      submitDone('mainBtn', '✅ Đã nhận — Kỹ sư gọi lại trong 15 phút');
    });
  }

  var miniBtn = document.querySelector('[data-action="mini-submit"]');
  if (miniBtn) {
    miniBtn.addEventListener('click', function () {
      sendLead({
        source: 'mini-form',
        phone: (document.getElementById('miniPhone') || {}).value || '',
        crop: (document.getElementById('miniCrop') || {}).value || ''
      });
      submitDone('miniBtn', '✅ Đã gửi — Kỹ sư liên hệ ngay');
    });
  }

  var stickyBtn = document.querySelector('[data-action="sticky-submit"]');
  if (stickyBtn) {
    stickyBtn.addEventListener('click', function () {
      sendLead({
        source: 'sticky-bar',
        phone: (document.getElementById('stickyPhone') || {}).value || ''
      });
      submitDone('stickyBtn', '✅ Đã nhận!');
    });
  }

  var popupBtn = document.querySelector('[data-action="popup-submit"]');
  if (popupBtn) {
    popupBtn.addEventListener('click', function () {
      sendLead({
        source: 'popup',
        phone: (document.getElementById('popupPhone') || {}).value || '',
        combo: 'Mua 3 tặng 1'
      });
      submitDone('popupBtn', '✅ Đã đăng ký!');
      setTimeout(closePopup, 1500);
    });
  }
})();
