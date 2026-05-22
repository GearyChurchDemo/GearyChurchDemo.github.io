const FUNDS = [
  { id: 'general',     name: 'General Fund',     desc: 'Operations, hospitality, the weekly meal' },
  { id: 'missions',    name: 'Missions',          desc: 'Gospel work among the nations and tribes' },
  { id: 'benevolence', name: 'Benevolence',       desc: 'Direct aid for families in need' },
  { id: 'youth',       name: 'Children & Youth',  desc: 'Sunday school, youth night, summer camp' },
];

const PRESETS = [25, 50, 100, 250, 500, 1000];

const state = {
  step: 0,
  amount: 100,
  customAmount: '',
  fund: 'general',
  coverFees: true,
  name: '',
  email: '',
  card: '',
  exp: '',
  cvc: '',
  zip: '',
};

function numericAmount() {
  const c = parseFloat(state.customAmount);
  return c > 0 ? c : state.amount;
}

function fee() {
  const n = numericAmount();
  return n > 0 ? parseFloat((n * 0.029 + 0.30).toFixed(2)) : 0;
}

function total() {
  return state.coverFees ? parseFloat((numericAmount() + fee()).toFixed(2)) : numericAmount();
}

function freqLabel(v) {
  if (v <= 50)  return 'Weekly';
  if (v <= 250) return 'Monthly';
  return 'Annual';
}

function formatCard(v) {
  return v.replace(/\D/g, '').slice(0, 19).replace(/(\d{4})(?=\d)/g, '$1 ');
}

function formatExp(v) {
  const d = v.replace(/\D/g, '').slice(0, 4);
  return d.length > 2 ? d.slice(0, 2) + ' / ' + d.slice(2) : d;
}

function cardBrand(n) {
  const d = n.replace(/\s/g, '');
  if (/^4/.test(d))      return 'VISA';
  if (/^5[1-5]/.test(d)) return 'MASTERCARD';
  if (/^3[47]/.test(d))  return 'AMEX';
  if (/^6/.test(d))      return 'DISCOVER';
  return '';
}

function detailsValid() {
  return (
    state.name.trim().length > 1 &&
    /\S+@\S+\.\S+/.test(state.email) &&
    state.card.replace(/\s/g, '').length >= 14 &&
    state.exp.length >= 4 &&
    state.cvc.length >= 3 &&
    state.zip.length >= 3
  );
}

function randomId() {
  return 'ATB-' + Math.random().toString(36).slice(2, 8).toUpperCase();
}

function formatDate() {
  return new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function render() {
  const card = document.getElementById('give-card');
  if (!card) return;
  card.innerHTML = buildCard();
  attachCardListeners();
}

function buildCard() {
  return `
    ${buildSteps()}
    <div class="give-card-step">
      ${state.step === 0 ? buildAmountStep() : ''}
      ${state.step === 1 ? buildDetailsStep() : ''}
      ${state.step === 2 ? buildReviewStep() : ''}
      ${state.step === 3 ? buildSuccessStep() : ''}
    </div>
  `;
}

function buildSteps() {
  const labels = ['Amount', 'Details', 'Review'];
  return `
    <div class="give-steps">
      ${labels.map((l, i) => {
        const cls = state.step > i ? 'give-step done' : state.step === i ? 'give-step active' : 'give-step';
        return `
          <div class="${cls}">
            <span class="dot">${state.step > i ? '✓' : i + 1}</span>
            <span class="lbl">${l}</span>
          </div>
          ${i < labels.length - 1 ? '<span class="give-step-sep"></span>' : ''}
        `;
      }).join('')}
    </div>
  `;
}

function buildAmountStep() {
  const n = numericAmount();
  const f = fee();
  const t = total();
  const selectedFund = FUNDS.find(fd => fd.id === state.fund);

  return `
    <h3>How much would you like to give?</h3>
    <p class="sub">A one-time gift, processed securely. You can change the amount or fund any time before the final step.</p>

    <div class="amounts">
      ${PRESETS.map(v => `
        <button type="button" class="amount-chip${!state.customAmount && state.amount === v ? ' active' : ''}" data-preset="${v}">
          $${v}
          <small>${freqLabel(v)}</small>
        </button>
      `).join('')}
    </div>

    <div class="custom-amount">
      <span class="dollar">$</span>
      <input type="number" id="custom-amount-input" placeholder="Other amount" value="${state.customAmount}" min="1" />
    </div>

    <span class="field-label">Designate to a fund</span>
    <div class="funds">
      ${FUNDS.map(fd => `
        <button type="button" class="fund${state.fund === fd.id ? ' active' : ''}" data-fund="${fd.id}">
          <span class="check"></span>
          <span class="fund-body">
            <strong>${fd.name}</strong>
            <span>${fd.desc}</span>
          </span>
        </button>
      `).join('')}
    </div>

    <div class="fee-toggle${state.coverFees ? ' on' : ''}" id="fee-toggle" role="checkbox" aria-checked="${state.coverFees}">
      <span class="check"></span>
      <div>
        <strong>Cover the processing fee</strong>
        <p>Adds ${f > 0 ? `$${f.toFixed(2)}` : '—'} so 100% of your gift reaches the ${selectedFund.name.toLowerCase()}.</p>
      </div>
      <span class="fee-amount">+$${f.toFixed(2)}</span>
    </div>

    <div class="step-nav">
      <button type="button" class="step-back" id="step-back-home">← Back to home</button>
      <button type="button" class="step-continue" id="step-continue" ${n <= 0 ? 'disabled' : ''}>
        Continue
        <span class="total">$${t.toFixed(2)}</span>
      </button>
    </div>
  `;
}

function buildDetailsStep() {
  const brand = cardBrand(state.card);
  const valid = detailsValid();
  const t = total();

  return `
    <h3>Your details</h3>
    <p class="sub">A receipt will be sent to your email right after. We never share or sell your information.</p>

    <div class="field">
      <label>Full name</label>
      <input type="text" id="field-name" placeholder="Your name" value="${escHtml(state.name)}" />
    </div>

    <div class="field">
      <label>Email for receipt</label>
      <input type="email" id="field-email" placeholder="you@example.com" value="${escHtml(state.email)}" />
    </div>

    <div class="field">
      <label>Card number</label>
      <div class="card-input-wrap">
        <input type="text" id="field-card" inputmode="numeric" placeholder="1234 1234 1234 1234" value="${escHtml(state.card)}" />
        ${brand ? `<span class="card-brand">${brand}</span>` : ''}
      </div>
    </div>

    <div class="field-row three">
      <div class="field" style="margin-top:0">
        <label>Expires</label>
        <input type="text" id="field-exp" inputmode="numeric" placeholder="MM / YY" value="${escHtml(state.exp)}" />
      </div>
      <div class="field" style="margin-top:0">
        <label>CVC</label>
        <input type="text" id="field-cvc" inputmode="numeric" placeholder="123" value="${escHtml(state.cvc)}" />
      </div>
      <div class="field" style="margin-top:0">
        <label>ZIP / Postal</label>
        <input type="text" id="field-zip" placeholder="ZIP" value="${escHtml(state.zip)}" />
      </div>
    </div>

    <div class="step-nav">
      <button type="button" class="step-back" id="step-back-0">← Back</button>
      <button type="button" class="step-continue" id="step-continue" ${!valid ? 'disabled' : ''}>
        Review gift
        <span class="total">$${t.toFixed(2)}</span>
      </button>
    </div>
  `;
}

function buildReviewStep() {
  const n = numericAmount();
  const f = fee();
  const t = total();
  const selectedFund = FUNDS.find(fd => fd.id === state.fund);
  const last4 = state.card.replace(/\s/g, '').slice(-4);

  return `
    <h3>Review &amp; confirm</h3>
    <p class="sub">One last look before we process your gift.</p>

    <div class="review-list">
      <div class="review-row"><span class="k">Gift</span><span class="v">$${n.toFixed(2)}</span></div>
      <div class="review-row"><span class="k">Designation</span><span class="v">${escHtml(selectedFund.name)}</span></div>
      <div class="review-row">
        <span class="k">Processing fee</span>
        <span class="v" style="opacity:${state.coverFees ? 1 : 0.5}">${state.coverFees ? `+ $${f.toFixed(2)}` : 'Not covered'}</span>
      </div>
      <div class="review-row"><span class="k">Card</span><span class="v">•••• ${last4 || '????'}</span></div>
      <div class="review-row total"><span class="k">Total today</span><span class="v">$${t.toFixed(2)}</span></div>
    </div>

    <p class="review-note">
      "Each one must give as he has decided in his heart, not reluctantly or under compulsion, for God loves a cheerful giver." — 2 Corinthians 9:7
    </p>

    <div class="step-nav">
      <button type="button" class="step-back" id="step-back-1">← Edit details</button>
      <button type="button" class="step-continue" id="step-continue">
        Give $${t.toFixed(2)}
      </button>
    </div>
  `;
}

function buildSuccessStep() {
  const t = total();
  const selectedFund = FUNDS.find(fd => fd.id === state.fund);
  const firstName = state.name.split(' ')[0] || 'friend';
  const id = randomId();
  const date = formatDate();

  return `
    <div class="success">
      <div class="success-mark">
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
          <path d="M10 18.5 15.5 24 26 13" stroke="#0c0a08" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </div>
      <h3>Thank you, ${escHtml(firstName)}.</h3>
      <p>Your gift has been received. A receipt is on its way to ${escHtml(state.email)}. May the Lord bless your generosity.</p>
      <div class="success-receipt">
        <div class="r"><span>Receipt</span><span>${id}</span></div>
        <div class="r"><span>Date</span><span>${date}</span></div>
        <div class="r"><span>Fund</span><span>${escHtml(selectedFund.name)}</span></div>
        <div class="r"><span>Amount</span><span>$${t.toFixed(2)}</span></div>
      </div>
      <div class="success-actions">
        <a href="index.html" class="btn btn-primary">Back to home</a>
        <button type="button" class="btn btn-ghost" id="give-again">Give again</button>
      </div>
    </div>
  `;
}

function attachCardListeners() {
  document.querySelectorAll('.amount-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      state.amount = parseInt(btn.dataset.preset, 10);
      state.customAmount = '';
      render();
    });
  });

  const customInput = document.getElementById('custom-amount-input');
  if (customInput) {
    customInput.addEventListener('input', e => {
      state.customAmount = e.target.value;
      updateFeeDisplay();
    });
  }

  document.querySelectorAll('.fund').forEach(btn => {
    btn.addEventListener('click', () => {
      state.fund = btn.dataset.fund;
      render();
    });
  });

  const feeToggle = document.getElementById('fee-toggle');
  if (feeToggle) {
    feeToggle.addEventListener('click', () => {
      state.coverFees = !state.coverFees;
      render();
    });
  }

  const continueBtn = document.getElementById('step-continue');
  if (continueBtn) {
    continueBtn.addEventListener('click', () => {
      if (state.step === 0 && numericAmount() > 0) setStep(1);
      else if (state.step === 1 && detailsValid()) setStep(2);
      else if (state.step === 2) setStep(3);
    });
  }

  const backHome = document.getElementById('step-back-home');
  if (backHome) backHome.addEventListener('click', () => { window.location.href = 'index.html'; });

  const back0 = document.getElementById('step-back-0');
  if (back0) back0.addEventListener('click', () => setStep(0));

  const back1 = document.getElementById('step-back-1');
  if (back1) back1.addEventListener('click', () => setStep(1));

  const giveAgain = document.getElementById('give-again');
  if (giveAgain) {
    giveAgain.addEventListener('click', () => {
      Object.assign(state, { step: 0, amount: 100, customAmount: '', fund: 'general', coverFees: true,
        name: '', email: '', card: '', exp: '', cvc: '', zip: '' });
      render();
    });
  }

  bindField('field-name',  'name');
  bindField('field-email', 'email');
  bindField('field-zip',   'zip');

  const cardField = document.getElementById('field-card');
  if (cardField) {
    cardField.addEventListener('input', e => {
      state.card = formatCard(e.target.value);
      e.target.value = state.card;
      const brand = cardBrand(state.card);
      let brandEl = e.target.parentElement.querySelector('.card-brand');
      if (brand && !brandEl) {
        brandEl = document.createElement('span');
        brandEl.className = 'card-brand';
        e.target.parentElement.appendChild(brandEl);
      }
      if (brandEl) brandEl.textContent = brand;
      updateContinueState();
    });
  }

  const expField = document.getElementById('field-exp');
  if (expField) {
    expField.addEventListener('input', e => {
      state.exp = formatExp(e.target.value);
      e.target.value = state.exp;
      updateContinueState();
    });
  }

  const cvcField = document.getElementById('field-cvc');
  if (cvcField) {
    cvcField.addEventListener('input', e => {
      state.cvc = e.target.value.replace(/\D/g, '').slice(0, 4);
      e.target.value = state.cvc;
      updateContinueState();
    });
  }
}

function bindField(id, key) {
  const el = document.getElementById(id);
  if (!el) return;
  el.addEventListener('input', e => {
    state[key] = e.target.value;
    updateContinueState();
  });
}

function updateContinueState() {
  const btn = document.getElementById('step-continue');
  if (!btn) return;
  if (state.step === 1) btn.disabled = !detailsValid();
}

function updateFeeDisplay() {
  const feeAmountEl = document.querySelector('.fee-amount');
  const feeDescEl = document.querySelector('.fee-toggle p');
  const continueTotal = document.querySelector('.step-continue .total');
  const f = fee();
  const t = total();
  const selectedFund = FUNDS.find(fd => fd.id === state.fund);

  if (feeAmountEl) feeAmountEl.textContent = `+$${f.toFixed(2)}`;
  if (feeDescEl) {
    feeDescEl.textContent = `Adds ${f > 0 ? `$${f.toFixed(2)}` : '—'} so 100% of your gift reaches the ${selectedFund.name.toLowerCase()}.`;
  }
  if (continueTotal) continueTotal.textContent = `$${t.toFixed(2)}`;

  const btn = document.getElementById('step-continue');
  if (btn && state.step === 0) btn.disabled = numericAmount() <= 0;
}

function setStep(n) {
  state.step = n;
  window.scrollTo({ top: 0, behavior: 'smooth' });
  render();
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function initGive() {
  render();
}
