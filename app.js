const STORAGE_KEY = 'credit-perks-data-v2-static';
const accents = ['#d4a74f', '#aeb4bd', '#f58220', '#117aca', '#5e5ce6', '#34c759', '#ff3b30'];
const frequencies = ['monthly', 'quarterly', 'semi-annual', 'annual', 'custom', 'ongoing'];
const types = ['fixed credit', 'statement credit', 'rotating category', 'activation required', 'limited time cashback reminder', 'ongoing cashback reminder', 'other'];

const sampleData = {
  cards: [
    { id: 'card-amex-platinum', name: 'Amex Platinum', issuer: 'American Express', annualFee: 895, accent: '#aeb4bd' },
    { id: 'card-marriott-brilliant', name: 'Amex Marriott Brilliant', issuer: 'American Express', annualFee: 650, accent: '#7d5a3c' },
    { id: 'card-discover-it', name: 'Discover It', issuer: 'Discover', annualFee: 0, accent: '#f58220' },
    { id: 'card-boa-321', name: 'BOA 321', issuer: 'Bank of America', annualFee: 0, accent: '#d71920' },
    { id: 'card-apple-card', name: 'Apple Card', issuer: 'Apple', annualFee: 0, accent: '#1d1d1f' },
  ],
  benefits: [
    benefit('benefit-platinum-resy', 'card-amex-platinum', 'Resy Credit', '$100', 100, 'quarterly', 'fixed credit', false, { notes: 'Total $400 per year' }),
    benefit('benefit-platinum-hotel', 'card-amex-platinum', 'Hotel Credit', '$300', 300, 'semi-annual', 'fixed credit', false, { notes: 'Total $600 per year' }),
    benefit('benefit-platinum-entertainment', 'card-amex-platinum', 'Digital Entertainment Credit', '$25', 25, 'monthly', 'fixed credit', false, { notes: 'Total $300 per year' }),
    benefit('benefit-platinum-airline', 'card-amex-platinum', 'Airline Credit', '$200', 200, 'annual', 'fixed credit', false, { notes: 'Lower priority' }),
    benefit('benefit-platinum-lululemon', 'card-amex-platinum', 'Lululemon Credit', '$75', 75, 'quarterly', 'fixed credit', false, { notes: 'Total $300 per year' }),
    benefit('benefit-platinum-clear', 'card-amex-platinum', 'CLEAR+ Credit', '$209', 209, 'annual', 'fixed credit', false),
    benefit('benefit-platinum-equinox', 'card-amex-platinum', 'Equinox Credit', '$300', 300, 'annual', 'fixed credit', false),
    benefit('benefit-platinum-uber', 'card-amex-platinum', 'Uber Cash', '$15', 15, 'monthly', 'fixed credit', false, { notes: 'December value is $20 instead of $15', specialMonthValues: { '12': 20 } }),
    benefit('benefit-marriott-restaurant', 'card-marriott-brilliant', 'Restaurant Credit', '$25', 25, 'monthly', 'fixed credit', false, { notes: 'Total $300 per year' }),
    benefit('benefit-discover-rotating', 'card-discover-it', 'Restaurants', '5% up to $1,500 spend', undefined, 'quarterly', 'rotating category', false, {
      deadline: '2026-06-30', notes: 'Track how much of the $1,500 quarterly spend cap has been used.', activationRequired: true, activated: false,
      spendCap: 1500, currentSpend: 0, quarter: 'Q2', quarterPeriod: 'Apr-Jun', capLabel: '5% cashback up to $1,500 spend',
      rotatingCategories: { q1: 'To be updated', q2: 'Restaurants', q3: 'To be updated', q4: 'To be updated' },
    }),
    benefit('benefit-boa-321-rotating', 'card-boa-321', 'Customized Cash Rewards', '3% online shopping / 2% grocery up to $2,500 combined quarterly spend', undefined, 'quarterly', 'rotating category', false, {
      deadline: '2026-06-30', notes: 'The 3% category is currently Online Shopping and should be editable by the user.', activationRequired: false, activated: true,
      spendCap: 2500, currentSpend: 0, quarter: 'Q2', quarterPeriod: 'Apr-Jun', capLabel: 'Combined quarterly cap $2,500',
      rotatingCategories: { q1: 'To be updated', q2: 'Online Shopping 3%, Grocery 2%', q3: 'To be updated', q4: 'To be updated' },
    }),
    benefit('benefit-apple-walgreens-limited', 'card-apple-card', 'Walgreens Limited-Time Cashback', '5% cashback through May 20', undefined, 'custom', 'limited time cashback reminder', false, { deadline: '2026-05-20', notes: 'Temporary offer. Reminder only.', important: true }),
    benefit('benefit-apple-booking', 'card-apple-card', 'Booking.com Cashback', '3% cashback', undefined, 'ongoing', 'ongoing cashback reminder', false),
    benefit('benefit-apple-ace', 'card-apple-card', 'ACE Hardware Cashback', '3% cashback', undefined, 'ongoing', 'ongoing cashback reminder', false),
    benefit('benefit-apple-chargepoint', 'card-apple-card', 'ChargePoint Cashback', '3% cashback', undefined, 'ongoing', 'ongoing cashback reminder', false),
    benefit('benefit-apple-exxon', 'card-apple-card', 'Exxon and Mobil Cashback', '3% cashback', undefined, 'ongoing', 'ongoing cashback reminder', false),
    benefit('benefit-apple-hertz', 'card-apple-card', 'Hertz Cashback', '3% cashback', undefined, 'ongoing', 'ongoing cashback reminder', false),
    benefit('benefit-apple-nike', 'card-apple-card', 'Nike Cashback', '3% cashback', undefined, 'ongoing', 'ongoing cashback reminder', false),
    benefit('benefit-apple-uber', 'card-apple-card', 'Uber Cashback', '3% cashback', undefined, 'ongoing', 'ongoing cashback reminder', false),
    benefit('benefit-apple-ubereats', 'card-apple-card', 'Uber Eats Cashback', '3% cashback', undefined, 'ongoing', 'ongoing cashback reminder', false),
    benefit('benefit-apple-walgreens', 'card-apple-card', 'Walgreens Cashback', '3% cashback', undefined, 'ongoing', 'ongoing cashback reminder', false),
  ],
};

function benefit(id, cardId, name, valueLabel, numericValue, frequency, type, currentPeriodUsed, extra = {}) {
  return { id, cardId, name, valueLabel, numericValue, frequency, type, currentPeriodUsed, activationRequired: false, activated: true, ...extra };
}

let data = loadData();
let valueView = false;
let modal = null;
let attentionOpen = true;

function loadData() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || sampleData; } catch { return sampleData; }
}

// Future cloud sync should require explicit user opt-in and preferably client-side encryption before any upload.
function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function id(prefix) {
  return `${prefix}-${crypto.randomUUID()}`;
}

function monthLabel() {
  return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date());
}

function quarterKey() {
  return `q${Math.floor(new Date().getMonth() / 3) + 1}`;
}

function deadlineLabel(value) {
  if (!value) return '';
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? '' : new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
}

function daysUntil(value) {
  if (!value) return Number.POSITIVE_INFINITY;
  const date = new Date(`${value}T23:59:59`);
  return Number.isNaN(date.getTime()) ? Number.POSITIVE_INFINITY : Math.ceil((date.getTime() - Date.now()) / 86400000);
}

function availableItems() {
  return data.benefits
    .filter((b) => !b.currentPeriodUsed)
    .filter((benefit) => benefit.type !== 'ongoing cashback reminder' || benefit.important)
    .filter((benefit) => daysUntil(benefit.deadline) >= 0)
    .map((benefit) => ({ benefit, card: data.cards.find((card) => card.id === benefit.cardId) }))
    .filter((item) => item.card)
    .sort((a, b) => priority(a.benefit) - priority(b.benefit));
}

function capturedYtd(benefits) {
  return benefits
    .filter((benefit) => benefit.currentPeriodUsed)
    .reduce((sum, benefit) => sum + (benefit.manuallyCapturedValue ?? effectiveNumericValue(benefit)), 0);
}

function effectiveNumericValue(benefit, date = new Date()) {
  const monthValue = benefit.specialMonthValues?.[String(date.getMonth() + 1)];
  return monthValue ?? benefit.numericValue ?? 0;
}

function effectiveValueLabel(benefit, date = new Date()) {
  const monthValue = benefit.specialMonthValues?.[String(date.getMonth() + 1)];
  return typeof monthValue === 'number' ? `$${monthValue}` : benefit.valueLabel;
}

function titleCaseLabel(value) {
  const normalizedValue = String(value).replace(/(\d+%)\s+up\s+to/gi, '$1 Up to');
  const lowerWords = new Set(['a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'from', 'in', 'nor', 'of', 'on', 'or', 'per', 'the', 'to', 'up', 'with']);
  return normalizedValue
    .split(/(\s+|\/|·|-)/)
    .map((part, index, parts) => {
      if (/^(\s+|\/|·|-)$/.test(part) || part === '') return part;
      if (/[A-Z]{2,}|\d|[$+]/.test(part)) return part.replace(/cashback/gi, 'Cashback').replace(/spend/gi, 'Spend').replace(/\bup\b/g, 'Up').replace(/\bto\b/g, 'to');
      const lower = part.toLowerCase();
      const isEdge = index === 0 || index === parts.length - 1;
      if (!isEdge && lowerWords.has(lower)) return lower;
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join('')
    .replace(/(\d+%) up to/gi, '$1 Up to');
}

function priority(benefit) {
  return Math.min(daysUntil(benefit.deadline), 365)
    - effectiveNumericValue(benefit) / 10
    + (benefit.activationRequired && !benefit.activated ? -40 : 0)
    + (benefit.frequency === 'monthly' ? 8 : 0)
    + (String(benefit.notes || '').toLowerCase().includes('lower priority') ? 100 : 0);
}

function moneySummary() {
  const calculable = data.benefits.filter((benefit) => typeof benefit.numericValue === 'number');
  const used = calculable.filter((b) => b.currentPeriodUsed).reduce((sum, b) => sum + effectiveNumericValue(b), 0);
  const remaining = calculable.filter((b) => !b.currentPeriodUsed).reduce((sum, b) => sum + effectiveNumericValue(b), 0);
  return { available: used + remaining, used, remaining, missed: 0 };
}

function render() {
  const app = document.querySelector('#app');
  app.innerHTML = `
    <div class="shell stack">
      ${renderHeader()}
      ${valueView ? renderValueSummary() : ''}
      ${renderAvailable()}
      <section class="cards-grid">${data.cards.map(renderCard).join('')}</section>
      ${data.cards.length ? '' : `<section class="panel empty"><h2>Start with your first card</h2><p>Add a card, then add its monthly or quarterly perks.</p><button class="button primary" data-action="add-card">Add Card</button></section>`}
      ${renderPrivacy()}
    </div>
    ${modal ? renderModal() : ''}
  `;
  bindEvents();
}

function renderPrivacy() {
  return `
    <footer class="privacy">
      <p>Your data is stored locally in this browser only. No credit card numbers or payment credentials are collected.</p>
      <div class="row-actions">
        <button class="button" data-action="export-backup">Export / Backup</button>
        <label class="button file-button">Import Backup<input type="file" accept="application/json" data-action="import-backup"></label>
        <button class="button danger" data-action="clear-local">Clear All Local Data</button>
      </div>
    </footer>`;
}

function renderHeader() {
  return `
    <header class="header">
      <div><p class="eyebrow">${monthLabel()}</p><h1><span class="title-emoji">💰</span><span class="gold-title">Credit Perks</span></h1></div>
      <div class="controls">
        <span class="stat-pill">💳 ${data.cards.length} Cards</span>
        <button class="pill toggle" data-action="toggle-value" data-on="${valueView}"><span>Value View</span><span class="switch"></span></button>
        <button class="button" data-action="reset-month">Reset Month</button>
        <button class="button" data-action="reset-quarter">Reset Quarter</button>
        <button class="button primary" data-action="add-card">💳 Add Card</button>
      </div>
    </header>
  `;
}

function renderValueSummary() {
  const summary = moneySummary();
  return `<section class="summary-grid">
    ${metric('Available value', summary.available)}
    ${metric('Used value', summary.used)}
    ${metric('Remaining value', summary.remaining)}
    ${metric('Missed last month', summary.missed)}
  </section>`;
}

function metric(label, value) {
  return `<div class="metric"><p>${label}</p><strong>$${value.toLocaleString()}</strong></div>`;
}

function renderAvailable() {
  const items = availableItems();
  const visibleItems = items.slice(0, 6);
  return `
    <section class="panel attention-panel">
      <div class="panel-head">
        <div><h2>🎯 Still Available</h2><p class="row-sub">${monthLabel()}</p></div>
        <div class="panel-tools">
          <span class="count">${items.length} open</span>
          <button class="fold-button" data-action="toggle-attention" aria-expanded="${attentionOpen}">${attentionOpen ? 'Fold' : 'Open'}</button>
        </div>
      </div>
      ${attentionOpen ? (items.length ? `<div class="available-list">${visibleItems.map(renderAvailableRow).join('')}${items.length > visibleItems.length ? `<p class="more-line">${items.length - visibleItems.length} more items in card modules</p>` : ''}</div>` : `<div class="empty">Everything is checked off for this period.</div>`) : ''}
    </section>`;
}

function renderAvailableRow({ card, benefit }) {
  const deadline = deadlineLabel(benefit.deadline);
  return `
    <div class="available-row">
      <div><p class="row-title">${escapeHtml(titleCaseLabel(card.name))} · ${escapeHtml(titleCaseLabel(benefit.name))} · ${escapeHtml(titleCaseLabel(effectiveValueLabel(benefit)))}</p><p class="row-sub">${deadline ? `By ${deadline}` : escapeHtml(benefit.notes || benefit.frequency)}${benefit.activationRequired && !benefit.activated ? ' · Activation Needed' : ''}</p></div>
      <div class="row-actions">
        ${benefit.activationRequired ? `<button class="button activation ${benefit.activated ? 'is-active' : ''}" data-action="toggle-activated" data-id="${benefit.id}">${benefit.activated ? 'Activated' : 'Activation Needed'}</button>` : ''}
        <button class="button primary" data-action="toggle-used" data-id="${benefit.id}">Mark Used</button>
      </div>
    </div>`;
}

function renderCard(card) {
  const benefits = data.benefits.filter((benefit) => benefit.cardId === card.id);
  const used = benefits.filter((benefit) => benefit.currentPeriodUsed).length;
  const rotating = benefits.find((benefit) => benefit.type === 'rotating category');
  const currentCategory = rotating?.rotatingCategories?.[quarterKey()];
  const captured = capturedYtd(benefits);
  const feeText = card.annualFee === 0 ? '0️⃣ Annual Fee' : `Annual Fee: $${(card.annualFee || 0).toLocaleString()} · Captured YTD: $${captured.toLocaleString()} / $${(card.annualFee || 0).toLocaleString()}`;
  return `
    <article class="card">
      <div class="card-head">
        <div>
          <div class="card-title">${renderCardIcon(card)}<h2>${escapeHtml(titleCaseLabel(card.name))}</h2></div>
          <p class="row-sub">${used} / ${benefits.length} benefits used this month</p>
          <p class="row-sub fee-line">${feeText}</p>
          ${currentCategory ? `<p class="row-sub">Current quarter: ${escapeHtml(currentCategory)}</p>` : ''}
        </div>
        <div class="card-actions">
          <div class="secondary-actions">
            <button class="button" data-action="edit-card" data-id="${card.id}">Edit</button>
            <button class="button danger" data-action="delete-card" data-id="${card.id}">Delete</button>
          </div>
          <button class="button primary add-benefit-action" data-action="add-benefit" data-card-id="${card.id}">Add Benefit ✨</button>
        </div>
      </div>
      <div class="benefits">${benefits.length ? benefits.map(renderBenefit).join('') : '<div class="empty">No benefits yet. Add the first one for this card.</div>'}</div>
    </article>`;
}

function renderBenefit(benefit) {
  const deadline = deadlineLabel(benefit.deadline);
  const hasSpend = typeof benefit.spendCap === 'number';
  const spendPct = hasSpend ? Math.min(((benefit.currentSpend || 0) / (benefit.spendCap || 1)) * 100, 100) : 0;
  const subText = benefitSubText(benefit, deadline);
  return `
    <div class="benefit ${benefit.currentPeriodUsed ? 'used' : ''} ${hasSpend ? 'has-spend' : ''}">
      <label>
        <input type="checkbox" ${benefit.currentPeriodUsed ? 'checked' : ''} data-action="toggle-used" data-id="${benefit.id}">
        <span><span class="benefit-name">${escapeHtml(titleCaseLabel(benefit.name))} · ${escapeHtml(titleCaseLabel(effectiveValueLabel(benefit)))}</span><span class="row-sub">${escapeHtml(subText)}</span>${hasSpend ? `<span class="spend-block"><span>$${(benefit.currentSpend || 0).toLocaleString()} / $${benefit.spendCap.toLocaleString()} Used This Quarter</span><span class="progress"><span style="width:${spendPct}%"></span></span></span>` : ''}</span>
      </label>
      <div class="row-actions">
        ${hasSpend ? `<label class="spend-input"><span>$</span><input type="number" min="0" max="${benefit.spendCap}" value="${benefit.currentSpend || 0}" data-action="update-spend" data-id="${benefit.id}" aria-label="Current spend for ${escapeAttr(benefit.name)}"></label>` : ''}
        ${benefit.activationRequired ? `<button class="button activation ${benefit.activated ? 'is-active' : ''}" data-action="toggle-activated" data-id="${benefit.id}">${benefit.activated ? 'Activated' : 'Activation Needed'}</button>` : ''}
        <button class="button" data-action="edit-benefit" data-id="${benefit.id}">Edit</button>
        <button class="button danger" data-action="delete-benefit" data-id="${benefit.id}">Delete</button>
      </div>
    </div>`;
}

function benefitSubText(benefit, deadline) {
  if (benefit.type === 'rotating category') {
    const currentCategory = benefit.rotatingCategories?.q2 || benefit.name;
    const rate = benefit.valueLabel.startsWith('3%') ? '3%' : benefit.valueLabel.startsWith('5%') ? '5%' : 'Cashback';
    return [rate === 'Cashback' ? `This Q: ${titleCaseLabel(currentCategory)}` : `${rate} This Q: ${titleCaseLabel(currentCategory)}`, benefit.quarterPeriod, deadline ? `By ${deadline}` : '']
      .filter(Boolean)
      .join(' · ');
  }
  return `${titleCaseLabel(benefit.frequency)}${benefit.quarterPeriod ? ` · ${benefit.quarterPeriod}` : ''}${deadline ? ` · By ${deadline}` : ''}${benefit.notes ? ` · ${benefit.notes}` : ''}`;
}

function renderCardIcon(card) {
  const key = card.id.replace('card-', '');
  const shortName = card.name.includes('Platinum') ? '' : card.name.includes('Marriott') ? 'BONVOY' : card.name.includes('Discover') ? 'it' : card.name.includes('BOA') ? '321' : '';
  return `<span class="card-mini card-mini-${key}" aria-hidden="true"><span>${escapeHtml(shortName)}</span></span>`;
}

function renderModal() {
  return modal.kind.includes('card') ? renderCardModal() : renderBenefitModal();
}

function renderCardModal() {
  const card = modal.card || { name: '', issuer: '', annualFee: '', accent: accents[0] };
  return `
    <div class="modal-backdrop"><div class="modal">
      <div class="modal-head"><h2>${modal.card ? 'Edit Card' : 'Add Card'}</h2><button class="icon-button" data-action="close-modal">×</button></div>
      <form class="form" data-form="card">
        ${field('Card name', 'name', card.name, 'Card nickname, e.g. Amex Gold', 'text')}
        <div class="grid-2">${field('Issuer', 'issuer', card.issuer || '', 'American Express', 'text')}${field('Annual fee', 'annualFee', card.annualFee || '', '325', 'number')}</div>
        <label class="field">
          <span>Last 4 digits optional, for your reference only.</span>
          <input name="last4" inputmode="numeric" value="${escapeAttr(card.last4 || '')}" placeholder="1234" maxlength="19">
          <span class="${modal.last4Error ? 'error' : 'muted'}">${modal.last4Error || 'Do not enter your full card number.'}</span>
        </label>
        <div><p class="row-title">Accent</p><div class="swatches">${accents.map((color) => `<button type="button" class="swatch ${card.accent === color ? 'selected' : ''}" style="background:${color}" data-action="set-accent" data-color="${color}"></button>`).join('')}</div></div>
        <div class="form-actions"><button type="button" class="button" data-action="close-modal">Cancel</button><button class="button primary">Save Card</button></div>
      </form>
    </div></div>`;
}

function renderBenefitModal() {
  const benefit = modal.benefit || {
    cardId: modal.cardId || data.cards[0]?.id, name: '', valueLabel: '', numericValue: '', frequency: 'monthly', type: 'statement credit',
    deadline: '', notes: '', currentPeriodUsed: false, activationRequired: false, activated: false, rotatingCategories: { q1: '', q2: '', q3: '', q4: '' }, capLabel: '', spendCap: '', currentSpend: '',
  };
  const isRotating = benefit.type === 'rotating category';
  return `
    <div class="modal-backdrop"><div class="modal">
      <div class="modal-head"><h2>${modal.benefit ? 'Edit Benefit' : 'Add Benefit'}</h2><button class="icon-button" data-action="close-modal">×</button></div>
      <form class="form" data-form="benefit">
        <div class="grid-2">
          <label class="field"><span>Card</span><select name="cardId">${data.cards.map((card) => `<option value="${card.id}" ${card.id === benefit.cardId ? 'selected' : ''}>${escapeHtml(card.name)}</option>`).join('')}</select></label>
          <label class="field"><span>Type</span><select name="type" data-action="type-select">${types.map((type) => `<option value="${type}" ${type === benefit.type ? 'selected' : ''}>${type}</option>`).join('')}</select></label>
        </div>
        ${field('Benefit name', 'name', benefit.name, 'Dining Credit', 'text')}
        <div class="grid-3">${field('Value label', 'valueLabel', benefit.valueLabel, '$15 or 5% up to $1,500 spend', 'text')}${field('Numeric value', 'numericValue', benefit.numericValue || '', '15', 'number')}</div>
        <div class="grid-2">
          <label class="field"><span>Frequency</span><select name="frequency">${frequencies.map((item) => `<option value="${item}" ${item === benefit.frequency ? 'selected' : ''}>${item}</option>`).join('')}</select></label>
          ${field('Deadline', 'deadline', benefit.deadline || '', '', 'date')}
        </div>
        <label class="field"><span>Notes</span><textarea name="notes" placeholder="By Jun 30, semi-annual, next reset details...">${escapeHtml(benefit.notes || '')}</textarea></label>
        <div class="check-grid">
          ${check('currentPeriodUsed', 'Used this period', benefit.currentPeriodUsed)}
          ${check('activationRequired', 'Activation required', benefit.activationRequired)}
          ${check('activated', 'Activated', benefit.activated)}
        </div>
        ${isRotating ? renderQuarterFields(benefit) : ''}
        <div class="form-actions"><button type="button" class="button" data-action="close-modal">Cancel</button><button class="button primary">Save Benefit</button></div>
      </form>
    </div></div>`;
}

function renderQuarterFields(benefit) {
  const q = benefit.rotatingCategories || {};
  return `<div class="quarter-box"><h3>Quarterly categories</h3><div class="grid-2">${['q1', 'q2', 'q3', 'q4'].map((key) => field(key.toUpperCase(), key, q[key] || '', 'To be updated', 'text')).join('')}</div>${field('Cap label', 'capLabel', benefit.capLabel || '', '5% up to $1,500 spend', 'text')}<div class="grid-2">${field('Spend cap', 'spendCap', benefit.spendCap || '', '1500', 'number')}${field('Current spend', 'currentSpend', benefit.currentSpend || '', '0', 'number')}</div></div>`;
}

function field(label, name, value, placeholder, type) {
  return `<label class="field"><span>${label}</span><input name="${name}" type="${type}" value="${escapeAttr(value)}" placeholder="${escapeAttr(placeholder)}"></label>`;
}

function check(name, label, checked) {
  return `<label class="check"><input type="checkbox" name="${name}" ${checked ? 'checked' : ''}>${label}</label>`;
}

function bindEvents() {
  document.querySelectorAll('[data-action]').forEach((element) => {
    element.addEventListener('click', handleAction);
    if (element.dataset.action === 'update-spend') element.addEventListener('change', updateSpend);
    if (element.dataset.action === 'import-backup') element.addEventListener('change', importBackup);
    if (element.dataset.action === 'type-select') element.addEventListener('change', handleTypeChange);
  });
  document.querySelector('input[name="last4"]')?.addEventListener('input', (event) => {
    const rawValue = event.currentTarget.value.replace(/\D/g, '');
    const value = rawValue.slice(0, 4);
    if (rawValue.length > 4) {
      modal.last4Error = 'Please enter only the last 4 digits, not the full card number.';
    } else {
      modal.last4Error = '';
    }
    event.currentTarget.value = value;
    const message = event.currentTarget.parentElement?.querySelector('span:last-child');
    if (message) {
      message.textContent = modal.last4Error || 'Do not enter your full card number.';
      message.className = modal.last4Error ? 'error' : 'muted';
    }
  });
  document.querySelectorAll('form').forEach((form) => form.addEventListener('submit', handleSubmit));
}

function handleAction(event) {
  const target = event.currentTarget;
  const action = target.dataset.action;
  if (action === 'toggle-used' && target.tagName === 'INPUT') return updateBenefit(target.dataset.id, (b) => ({ ...b, currentPeriodUsed: target.checked }));
  if (action === 'toggle-used') return updateBenefit(target.dataset.id, (b) => ({ ...b, currentPeriodUsed: !b.currentPeriodUsed }));
  if (action === 'toggle-activated') return updateBenefit(target.dataset.id, (b) => ({ ...b, activated: !b.activated }));
  if (action === 'update-spend') return;
  if (action === 'toggle-value') { valueView = !valueView; return render(); }
  if (action === 'toggle-attention') { attentionOpen = !attentionOpen; return render(); }
  if (action === 'reset-month') { data.benefits = data.benefits.map((b) => ({ ...b, currentPeriodUsed: b.frequency === 'monthly' ? false : b.currentPeriodUsed, activated: b.activationRequired ? false : b.activated })); saveData(); return render(); }
  if (action === 'reset-quarter') { data.benefits = data.benefits.map((b) => b.frequency === 'quarterly' ? { ...b, currentPeriodUsed: false, activated: b.activationRequired ? false : b.activated, currentSpend: typeof b.currentSpend === 'number' ? 0 : b.currentSpend } : b); saveData(); return render(); }
  if (action === 'export-backup') return exportBackup();
  if (action === 'clear-local') return clearLocalData();
  if (action === 'import-backup') return;
  if (action === 'add-card') { modal = { kind: 'add-card', accent: accents[0] }; return render(); }
  if (action === 'edit-card') { modal = { kind: 'edit-card', card: { ...data.cards.find((c) => c.id === target.dataset.id) } }; return render(); }
  if (action === 'delete-card') return deleteCard(target.dataset.id);
  if (action === 'add-benefit') { modal = { kind: 'add-benefit', cardId: target.dataset.cardId }; return render(); }
  if (action === 'edit-benefit') { modal = { kind: 'edit-benefit', benefit: structuredClone(data.benefits.find((b) => b.id === target.dataset.id)) }; return render(); }
  if (action === 'delete-benefit') return deleteBenefit(target.dataset.id);
  if (action === 'close-modal') { modal = null; return render(); }
  if (action === 'set-accent') { modal.card = { ...(modal.card || {}), accent: target.dataset.color }; return render(); }
}

function updateSpend(event) {
  const input = event.currentTarget;
  const value = Math.max(0, Number(input.value || 0));
  data.benefits = data.benefits.map((benefit) => benefit.id === input.dataset.id ? { ...benefit, currentSpend: value } : benefit);
  saveData();
  render();
}

function handleTypeChange(event) {
  if (!modal?.benefit) modal.benefit = {};
  modal.benefit.type = event.target.value;
  render();
}

function handleSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const fd = new FormData(form);
  if (form.dataset.form === 'card') saveCard(fd);
  if (form.dataset.form === 'benefit') saveBenefit(fd);
}

function saveCard(fd) {
  const last4 = String(fd.get('last4') || '').replace(/\D/g, '');
  if (last4 && !/^\d{1,4}$/.test(last4)) {
    modal.last4Error = 'Please enter only the last 4 digits, not the full card number.';
    return render();
  }
  const card = {
    id: modal.card?.id || id('card'),
    name: String(fd.get('name') || '').trim(),
    issuer: String(fd.get('issuer') || '').trim() || undefined,
    annualFee: fd.get('annualFee') ? Number(fd.get('annualFee')) : undefined,
    accent: modal.card?.accent || accents[0],
    last4: last4 || undefined,
  };
  if (!card.name) return;
  data.cards = data.cards.some((c) => c.id === card.id) ? data.cards.map((c) => c.id === card.id ? card : c) : [...data.cards, card];
  modal = null;
  saveData();
  render();
}

function exportBackup() {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `credit-perks-backup-${new Date().toISOString().slice(0, 10)}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

async function importBackup(event) {
  const file = event.currentTarget.files?.[0];
  if (!file) return;
  try {
    const parsed = JSON.parse(await file.text());
    if (!Array.isArray(parsed.cards) || !Array.isArray(parsed.benefits)) throw new Error('Invalid backup file');
    data = parsed;
    saveData();
    render();
  } catch {
    alert('That backup file could not be imported.');
  }
}

function clearLocalData() {
  if (!confirm('Clear all Credit Perks data stored in this browser? This cannot be undone.')) return;
  data = { cards: [], benefits: [] };
  saveData();
  render();
}

function saveBenefit(fd) {
  const type = String(fd.get('type'));
  const activationRequired = fd.get('activationRequired') === 'on';
  const item = {
    ...(modal.benefit || {}),
    id: modal.benefit?.id || id('benefit'),
    cardId: String(fd.get('cardId')),
    name: String(fd.get('name') || '').trim(),
    valueLabel: String(fd.get('valueLabel') || '').trim(),
    numericValue: fd.get('numericValue') ? Number(fd.get('numericValue')) : undefined,
    frequency: String(fd.get('frequency')),
    type,
    deadline: String(fd.get('deadline') || '') || undefined,
    notes: String(fd.get('notes') || '').trim() || undefined,
    currentPeriodUsed: fd.get('currentPeriodUsed') === 'on',
    activationRequired,
    activated: activationRequired ? fd.get('activated') === 'on' : true,
    capLabel: String(fd.get('capLabel') || '').trim() || undefined,
    spendCap: fd.get('spendCap') ? Number(fd.get('spendCap')) : undefined,
    currentSpend: fd.get('currentSpend') ? Number(fd.get('currentSpend')) : undefined,
    rotatingCategories: type === 'rotating category' ? {
      q1: String(fd.get('q1') || ''),
      q2: String(fd.get('q2') || ''),
      q3: String(fd.get('q3') || ''),
      q4: String(fd.get('q4') || ''),
    } : undefined,
  };
  if (!item.name || !item.valueLabel) return;
  data.benefits = data.benefits.some((b) => b.id === item.id) ? data.benefits.map((b) => b.id === item.id ? item : b) : [...data.benefits, item];
  modal = null;
  saveData();
  render();
}

function updateBenefit(benefitId, updater) {
  data.benefits = data.benefits.map((benefit) => benefit.id === benefitId ? updater(benefit) : benefit);
  saveData();
  render();
}

function deleteCard(cardId) {
  const card = data.cards.find((c) => c.id === cardId);
  if (!card || !confirm(`Delete ${card.name} and its benefits?`)) return;
  data.cards = data.cards.filter((c) => c.id !== cardId);
  data.benefits = data.benefits.filter((b) => b.cardId !== cardId);
  saveData();
  render();
}

function deleteBenefit(benefitId) {
  if (!confirm('Delete this benefit?')) return;
  data.benefits = data.benefits.filter((b) => b.id !== benefitId);
  saveData();
  render();
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[char]);
}

function escapeAttr(value) {
  return escapeHtml(value ?? '');
}

render();
