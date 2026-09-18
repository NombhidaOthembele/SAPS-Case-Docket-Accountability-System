const STORAGE_KEY = 'saps-accountability-cases-v2';
const SESSION_KEY = 'saps-accountability-session-v2';
const OTP = '482913';
const W_FIELDS = ['who', 'what', 'when', 'where', 'why', 'how'];
const STEP_LABELS = { registration: 'Statement registered', commander_review: 'Commander review', investigation: 'Investigation update', resolution: 'Resolution' };

const $ = (selector) => document.querySelector(selector);
const getCases = () => JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
const saveCases = (items) => localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
const session = () => JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));

function makeId(prefix) { return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`; }
function stamp() { return new Date().toISOString(); }
function sixWsFrom(form, prefix = '') { return Object.fromEntries(W_FIELDS.map((key) => [key, form.get(`${prefix}${key}`) || ''])); }
function missingWs(ws) { return W_FIELDS.filter((key) => !String(ws[key] || '').trim()); }
function label(key) { return key === 'who' ? 'Who' : key.charAt(0).toUpperCase() + key.slice(1); }

function addAudit(caseItem, action, actor, details = {}) {
  caseItem.audit.push({ id: makeId('AUD'), action, actor, timestamp: stamp(), ...details });
}

function eventFrom({ step, ws, update, actor, action }) {
  const missing = missingWs(ws);
  if (missing.length) throw new Error(`Complete the six W's: ${missing.map(label).join(', ')}`);
  if (!String(update || '').trim()) throw new Error('An investigator update is required for every workflow step.');
  return { id: makeId('EVT'), step, sixWs: ws, investigatorUpdate: update.trim(), actor, action, timestamp: stamp() };
}

function signIn(identity, role) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ identity, role, signedInAt: stamp() }));
  $('#login-view').classList.add('hidden'); $('#app-view').classList.remove('hidden');
  $('#user-name').textContent = identity; $('#user-role').textContent = role.replace('_', ' ').toUpperCase();
  $('#user-avatar').textContent = identity.slice(0, 2).toUpperCase();
  document.querySelectorAll('.nav-item').forEach((item) => item.classList.toggle('hidden', item.classList.contains(`${role}-only` ) || (!item.classList.contains(`${role}-only`) && ['officer-only','commander-only','investigator-only','analyst-only'].some((c) => item.classList.contains(c)) && !item.classList.contains(`${role}-only`))));
  render('dashboard');
}

function render(page = 'dashboard') {
  const current = session(); if (!current) return;
  document.querySelectorAll('.nav-item').forEach((item) => item.classList.toggle('active', item.dataset.page === page));
  const titles = { dashboard: 'Operations overview', register: 'Victim statement registration', review: 'Commander acceptance queue', investigation: 'Investigator workbench', analytics: 'Case analysis & statistics', audit: 'Accountability trail' };
  $('#page-title').textContent = titles[page] || titles.dashboard;
  const pages = { dashboard: renderDashboard, register: renderRegister, review: renderReview, investigation: renderInvestigation, analytics: renderAnalytics, audit: renderAudit };
  $('#page-content').innerHTML = pages[page]();
  bindPage(page);
}

function metric(labelText, value, tone = '') { return `<div class="metric ${tone}"><span>${labelText}</span><strong>${value}</strong></div>`; }
function statusBadge(status) { return `<span class="status status-${status.replaceAll('_', '-')}">${status.replaceAll('_', ' ')}</span>`; }
function sixWsCard(ws) { return `<div class="six-ws-grid">${W_FIELDS.map((key) => `<div><b>${label(key)}</b><span>${esc(ws[key])}</span></div>`).join('')}</div>`; }
function caseRow(item, action = '') { return `<tr><td><strong>${esc(item.casNumber)}</strong><small>${esc(item.station)}</small></td><td>${esc(item.offenceDetails)}</td><td>${statusBadge(item.status)}</td><td>${item.events.length}</td><td>${action}</td></tr>`; }

function renderDashboard() {
  const items = getCases(); const pending = items.filter((item) => item.status === 'awaiting_commander').length; const active = items.filter((item) => item.status === 'assigned' || item.status === 'investigation').length; const accepted = items.filter((item) => item.commanderAccepted).length;
  return `<section class="hero"><div><p class="eyebrow">LIVE ACCOUNTABILITY BOARD</p><h1>Good morning, ${esc(session().identity)}</h1><p>Every registration, review and investigation update is time-stamped and attributable.</p></div><div class="hero-seal">SAPS<br><small>CASE CONTROL</small></div></section><div class="metrics">${metric('Total cases', items.length)}${metric('Awaiting commander', pending, 'amber')}${metric('Approved cases', accepted, 'green')}${metric('Active investigations', active, 'blue')}</div><section class="panel"><div class="panel-heading"><div><h3>Recent case activity</h3><p class="muted">The latest accountable actions across your station.</p></div><button class="ghost" data-go="audit">View full trail →</button></div><div class="table-wrap"><table><thead><tr><th>Case</th><th>Offence</th><th>Status</th><th>Events</th><th>Last action</th></tr></thead><tbody>${items.length ? items.slice().reverse().slice(0, 8).map((item) => caseRow(item, `<small>${esc(item.events.at(-1)?.action || '')}</small>`)).join('') : '<tr><td colspan="5" class="empty">No cases have been registered.</td></tr>'}</tbody></table></div></section>`;
}

function sixWsForm(prefix = '', values = {}) { return `<div class="section-label">Six W's control record <span>All six fields are mandatory</span></div><div class="six-ws-form">${W_FIELDS.map((key) => `<label><span>${label(key)}</span><input name="${prefix}${key}" value="${esc(values[key] || '')}" ${key === 'when' ? 'type="datetime-local"' : ''} placeholder="Record ${key}..." required /></label>`).join('')}</div>`; }

function renderRegister() { return `<section class="panel form-panel"><div class="panel-heading"><div><p class="eyebrow">STEP 01 · COMMUNITY SERVICE CENTRE</p><h3>Capture victim statement</h3><p class="muted">The statement creates the official case record. Do not use real personal information in this prototype.</p></div><span class="step-number">01</span></div><form id="register-form"><div class="grid two"><label>Station / facility<input name="station" placeholder="Durban Central SAPS" required /></label><label>Officer reference<input name="officerReference" placeholder="CSC-001" required /></label></div><div class="grid two"><label>Victim / complainant name<input name="complainantName" placeholder="Full name" required /></label><label>Preferred contact<input name="contact" placeholder="Contact details" /></label></div><label>Victim statement / offence details<textarea name="offenceDetails" rows="5" placeholder="Capture the statement accurately and objectively..." required></textarea></label>${sixWsForm()}<label>Investigator update <textarea name="investigatorUpdate" rows="3" placeholder="Record what was verified or done at this step" required></textarea></label><button class="primary" type="submit">Create case and generate CAS number</button><p id="register-message" class="form-message"></p></form></section>`; }

function renderReview() { const items = getCases().filter((item) => item.status === 'awaiting_commander'); return `<section class="panel"><div class="panel-heading"><div><p class="eyebrow">STEP 02 · STATION COMMANDER</p><h3>Evaluate six-W compliance</h3><p class="muted">Approval is blocked until the registration record is complete and accountable.</p></div><span class="count-pill">${items.length} pending</span></div>${items.length ? items.map((item) => `<article class="review-card"><div class="case-heading"><div><h3>${esc(item.casNumber)}</h3><p>${esc(item.complainantName)} · ${esc(item.station)}</p></div>${statusBadge(item.status)}</div><p><b>Statement:</b> ${esc(item.offenceDetails)}</p><h4>Registration six W's</h4>${sixWsCard(item.events[0].sixWs)}<p class="update"><b>Investigator update:</b> ${esc(item.events[0].investigatorUpdate)}</p><form class="review-form" data-case-id="${item.id}">${sixWsForm('review', { where: item.station })}<label>Commander decision note<textarea name="decisionNote" rows="2" required placeholder="Explain the acceptance decision..."></textarea></label><div class="button-row"><button class="primary" name="decision" value="approve">Approve and assign investigators</button><button class="danger-outline" name="decision" value="return">Return for correction</button></div><p class="form-message"></p></form></article>`).join('') : '<div class="empty-state"><strong>No cases waiting for review</strong><p>New registrations will appear here with their generated CAS number.</p></div>'}</section>`; }

function renderInvestigation() { const items = getCases().filter((item) => item.commanderAccepted); return `<section class="panel"><div class="panel-heading"><div><p class="eyebrow">STEP 03 · INVESTIGATIONS</p><h3>Investigator workbench</h3><p class="muted">Approved cases are assigned here. Every update carries its own six-W accountability record.</p></div></div>${items.length ? items.map((item) => `<article class="investigation-card"><div class="case-heading"><div><h3>${esc(item.casNumber)}</h3><p>${esc(item.offenceDetails)}</p></div>${statusBadge(item.status)}</div><p><b>Assigned team:</b> ${esc(item.investigationTeam || 'Pending team assignment')}</p><form class="investigation-form" data-case-id="${item.id}"><div class="grid two"><label>Lead investigator<input name="lead" value="${esc(item.investigationTeam || '')}" required /></label><label>Next review date<input type="date" name="reviewDate" required /></label></div>${sixWsForm('investigation')}<label>Investigator progress update<textarea name="investigatorUpdate" rows="3" required placeholder="What was done, discovered, or handed over?"></textarea></label><button class="primary">Save accountable update</button><p class="form-message"></p></form></article>`).join('') : '<div class="empty-state"><strong>No approved cases</strong><p>Commander-approved cases will be routed to the investigation team.</p></div>'}</section>`; }

function renderAnalytics() { const items = getCases(); const byStatus = items.reduce((out, item) => { out[item.status] = (out[item.status] || 0) + 1; return out; }, {}); const stations = [...new Set(items.map((item) => item.station))]; return `<section class="metrics">${metric('Cases this period', items.length)}${metric('Average timeline events', items.length ? (items.reduce((sum, item) => sum + item.events.length, 0) / items.length).toFixed(1) : '0')}${metric('Stations represented', stations.length)}${metric('Auditable actions', items.reduce((sum, item) => sum + item.audit.length, 0), 'green')}</section><div class="analytics-grid"><section class="panel"><h3>Cases by status</h3>${Object.keys(byStatus).length ? Object.entries(byStatus).map(([key, value]) => `<div class="bar-row"><span>${key.replaceAll('_', ' ')}</span><div><i style="width:${Math.max(8, (value / Math.max(items.length, 1)) * 100)}%"></i></div><b>${value}</b></div>`).join('') : '<p class="empty">No data available.</p>'}</section><section class="panel"><h3>Accountability health</h3><div class="health-score">${items.length ? '100%' : '—'}<small>records with traceable events</small></div><p class="muted">Each action records the actor, timestamp, six W's and investigator update before progressing.</p></section></div><section class="panel"><h3>Station distribution</h3><div class="station-list">${stations.map((station) => `<div><span>${esc(station)}</span><b>${items.filter((item) => item.station === station).length}</b></div>`).join('') || '<p class="empty">No stations recorded.</p>'}</div></section>`; }

function renderAudit() { const audit = getCases().flatMap((item) => item.audit.map((event) => ({ ...event, casNumber: item.casNumber }))).sort((a, b) => b.timestamp.localeCompare(a.timestamp)); return `<section class="panel"><div class="panel-heading"><div><p class="eyebrow">IMMUTABLE ACTIVITY VIEW</p><h3>Accountability trail</h3><p class="muted">A chronological record of who did what, when and to which case.</p></div><span class="secure-status">● Audit enabled</span></div><div class="audit-list">${audit.length ? audit.map((event) => `<div class="audit-item"><div class="audit-icon">✓</div><div><strong>${esc(event.action)}</strong><p>${esc(event.casNumber)} · ${esc(event.actor)}</p><small>${new Date(event.timestamp).toLocaleString()} ${event.details ? `· ${esc(event.details)}` : ''}</small></div></div>`).join('') : '<p class="empty">No activity recorded.</p>'}</div></section>`; }

function bindPage(page) {
  document.querySelectorAll('[data-go]').forEach((button) => button.addEventListener('click', () => render(button.dataset.go)));
  const current = session();
  if (page === 'register') $('#register-form')?.addEventListener('submit', registerCase);
  document.querySelectorAll('.review-form').forEach((form) => form.addEventListener('submit', commanderReview));
  document.querySelectorAll('.investigation-form').forEach((form) => form.addEventListener('submit', investigatorUpdate));
  if (page === 'analytics' && current.role !== 'analyst') return;
}

function registerCase(event) { event.preventDefault(); const form = new FormData(event.target); const ws = sixWsFrom(form); try { const item = { id: makeId('CASE'), casNumber: `CAS-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`, station: form.get('station'), officerReference: form.get('officerReference'), complainantName: form.get('complainantName'), contact: form.get('contact'), offenceDetails: form.get('offenceDetails'), status: 'awaiting_commander', commanderAccepted: false, createdAt: stamp(), events: [eventFrom({ step: 'registration', ws, update: form.get('investigatorUpdate'), actor: session().identity, action: 'CASE_REGISTERED' })], audit: [] }; addAudit(item, 'CASE_REGISTERED', session().identity, { details: 'Victim statement captured and CAS number generated.' }); const items = getCases(); items.push(item); saveCases(items); event.target.reset(); $('#register-message').textContent = `Case ${item.casNumber} created and sent to the Station Commander.`; $('#register-message').className = 'form-message success'; } catch (error) { $('#register-message').textContent = error.message; $('#register-message').className = 'form-message error'; } }

function commanderReview(event) { event.preventDefault(); const form = new FormData(event.target); const items = getCases(); const item = items.find((entry) => entry.id === event.target.dataset.caseId); const decision = event.submitter.value; const message = event.target.querySelector('.form-message'); try { const ws = sixWsFrom(form, 'review'); if (decision === 'return') { item.status = 'returned_for_correction'; addAudit(item, 'CASE_RETURNED', session().identity, { details: form.get('decisionNote') }); saveCases(items); render('review'); return; } const reviewEvent = eventFrom({ step: 'commander_review', ws, update: form.get('decisionNote'), actor: session().identity, action: 'COMMANDER_APPROVED' }); item.events.push(reviewEvent); item.commanderAccepted = true; item.status = 'assigned'; item.investigationTeam = 'Investigation team to be assigned'; addAudit(item, 'COMMANDER_APPROVED', session().identity, { details: 'Six-W review passed; routed to investigators.' }); saveCases(items); render('review'); } catch (error) { message.textContent = error.message; message.className = 'form-message error'; } }

function investigatorUpdate(event) { event.preventDefault(); const form = new FormData(event.target); const items = getCases(); const item = items.find((entry) => entry.id === event.target.dataset.caseId); try { item.investigationTeam = form.get('lead'); const ws = sixWsFrom(form, 'investigation'); item.events.push(eventFrom({ step: 'investigation', ws, update: form.get('investigatorUpdate'), actor: session().identity, action: 'INVESTIGATOR_UPDATE' })); item.status = 'investigation'; addAudit(item, 'INVESTIGATOR_UPDATE', session().identity, { details: form.get('investigatorUpdate') }); saveCases(items); render('investigation'); } catch (error) { const message = event.target.querySelector('.form-message'); message.textContent = error.message; message.className = 'form-message error'; } }

$('#login-form').addEventListener('submit', (event) => { event.preventDefault(); const form = new FormData(event.target); $('#otp-panel').classList.remove('hidden'); $('#login-message').textContent = 'Verification code issued. Check your approved device.'; window.pendingLogin = { identity: form.get('identity'), role: form.get('role') }; });
$('#otp-form').addEventListener('submit', (event) => { event.preventDefault(); const code = new FormData(event.target).get('otp'); if (code !== OTP) { $('#login-message').textContent = 'Invalid OTP. Try the prototype code shown above.'; $('#login-message').className = 'form-message error'; return; } signIn(window.pendingLogin.identity, window.pendingLogin.role); });
$('#logout').addEventListener('click', () => { localStorage.removeItem(SESSION_KEY); location.reload(); });
document.querySelectorAll('.nav-item').forEach((item) => item.addEventListener('click', () => render(item.dataset.page)));
setInterval(() => { $('#clock').textContent = new Date().toLocaleTimeString(); }, 1000);
if (session()) signIn(session().identity, session().role);
