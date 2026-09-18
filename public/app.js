const STORAGE_KEY = 'saps-case-docket-system';
const SIX_WS_KEYS = ['who', 'what', 'when', 'where', 'why', 'how'];

const caseForm = document.getElementById('case-form');
const stepForm = document.getElementById('step-form');
const commanderForm = document.getElementById('commander-form');
const caseSelect = document.getElementById('case-select');
const commanderCaseSelect = document.getElementById('commander-case-select');
const casesContainer = document.getElementById('cases-container');

function loadCases() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
}

function saveCases(cases) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cases));
}

function getSixWsFromForm(prefix) {
  return Object.fromEntries(
    SIX_WS_KEYS.map((key) => [key, document.querySelector(`[name="${prefix}${key.charAt(0).toUpperCase() + key.slice(1)}"]`)?.value || ''])
  );
}

function toInputValue(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return String(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

function validateSixWs(sixWs) {
  const missing = SIX_WS_KEYS.filter((key) => !String(sixWs[key] || '').trim());
  return missing;
}

function createCaseRecord(formData) {
  const sixWs = {
    who: formData.get('who'),
    what: formData.get('what'),
    when: formData.get('when'),
    where: formData.get('where'),
    why: formData.get('why'),
    how: formData.get('how')
  };

  const missing = validateSixWs(sixWs);
  if (missing.length) {
    throw new Error(`Missing six W's: ${missing.join(', ')}`);
  }

  const investigatorUpdate = formData.get('investigatorUpdate');
  if (!String(investigatorUpdate || '').trim()) {
    throw new Error('Investigator update is required.');
  }

  return {
    id: `CASE-${Date.now()}`,
    casNumber: `CAS-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`,
    station: formData.get('station'),
    complainantName: formData.get('complainantName') || 'Not provided',
    offenceDetails: formData.get('offenceDetails'),
    status: 'registered',
    commanderAccepted: false,
    events: [{
      id: `EVT-${Date.now()}`,
      step: 'registration',
      action: 'CASE_REGISTERED',
      actorRole: 'CSC_OFFICIAL',
      actorId: 'csc-officer',
      sixWs,
      investigatorUpdate,
      timestamp: new Date().toISOString()
    }]
  };
}

function renderCaseOptions() {
  const cases = loadCases();
  const options = cases.map((item) => `<option value="${item.id}">${item.casNumber} - ${item.status}</option>`).join('');
  caseSelect.innerHTML = `<option value="">Select a case</option>${options}`;
  commanderCaseSelect.innerHTML = `<option value="">Select a case</option>${options}`;
}

function renderTimeline() {
  const cases = loadCases();
  if (!cases.length) {
    casesContainer.innerHTML = '<p>No cases recorded yet.</p>';
    return;
  }

  casesContainer.innerHTML = cases.map((item) => {
    const timeline = item.events.map((event) => {
      const sixWList = SIX_WS_KEYS.map((key) => `<li><strong>${key.toUpperCase()}:</strong> ${event.sixWs[key]}</li>`).join('');
      return `
        <div class="case-card">
          <div class="case-header">
            <div>
              <h3>${item.casNumber}</h3>
              <p>${item.station}</p>
            </div>
            <span class="badge ${item.commanderAccepted ? 'accepted' : ''}">${item.commanderAccepted ? 'ACCEPTED' : item.status}</span>
          </div>
          <p><strong>Complainant:</strong> ${item.complainantName}</p>
          <p><strong>Offence:</strong> ${item.offenceDetails}</p>
          <p><strong>Investigator update:</strong> ${event.investigatorUpdate}</p>
          <ul class="timeline">${sixWList}</ul>
        </div>
      `;
    }).join('');

    return timeline;
  }).join('');
}

function refreshViews() {
  renderCaseOptions();
  renderTimeline();
}

caseForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(caseForm);

  try {
    const newCase = createCaseRecord(formData);
    const cases = loadCases();
    cases.push(newCase);
    saveCases(cases);
    caseForm.reset();
    refreshViews();
    casesContainer.insertAdjacentHTML('beforeend', '<p class="success">Case registered successfully.</p>');
  } catch (error) {
    const errorBox = document.createElement('p');
    errorBox.className = 'error';
    errorBox.textContent = error.message;
    caseForm.appendChild(errorBox);
  }
});

stepForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(stepForm);
  const caseId = formData.get('caseId');
  if (!caseId) {
    alert('Select a case first.');
    return;
  }

  const sixWs = {
    who: formData.get('stepWho'),
    what: formData.get('stepWhat'),
    when: formData.get('stepWhen'),
    where: formData.get('stepWhere'),
    why: formData.get('stepWhy'),
    how: formData.get('stepHow')
  };

  const missing = validateSixWs(sixWs);
  if (missing.length) {
    alert(`Missing six W's: ${missing.join(', ')}`);
    return;
  }

  const investigatorUpdate = formData.get('stepInvestigatorUpdate');
  if (!String(investigatorUpdate || '').trim()) {
    alert('Investigator update is required.');
    return;
  }

  const cases = loadCases();
  const item = cases.find((caseEntry) => caseEntry.id === caseId);
  if (!item) {
    alert('Case not found.');
    return;
  }

  const step = formData.get('step');
  item.events.push({
    id: `EVT-${Date.now()}`,
    step,
    action: 'STEP_UPDATE',
    actorRole: 'INVESTIGATOR',
    actorId: 'investigator',
    sixWs,
    investigatorUpdate,
    timestamp: new Date().toISOString()
  });
  item.status = step;
  item.commanderAccepted = false;
  item.updatedAt = new Date().toISOString();
  saveCases(cases);
  stepForm.reset();
  refreshViews();
  alert('Workflow update recorded successfully.');
});

commanderForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(commanderForm);
  const caseId = formData.get('caseId');
  if (!caseId) {
    alert('Select a case for commander acceptance.');
    return;
  }

  const sixWs = {
    who: formData.get('commanderWho'),
    what: formData.get('commanderWhat'),
    when: formData.get('commanderWhen'),
    where: formData.get('commanderWhere'),
    why: formData.get('commanderWhy'),
    how: formData.get('commanderHow')
  };

  const invalidEvents = loadCases().find((caseEntry) => caseEntry.id === caseId)?.events.filter((event) => {
    return validateSixWs(event.sixWs).length > 0 || !String(event.investigatorUpdate || '').trim();
  });

  if (invalidEvents && invalidEvents.length) {
    alert('Commander acceptance blocked: every workflow step must have all six W\'s and an investigator update.');
    return;
  }

  const missing = validateSixWs(sixWs);
  if (missing.length) {
    alert(`Commander review missing six W's: ${missing.join(', ')}`);
    return;
  }

  const investigatorUpdate = formData.get('commanderInvestigatorUpdate');
  if (!String(investigatorUpdate || '').trim()) {
    alert('Commander acceptance requires an investigator update.');
    return;
  }

  const cases = loadCases();
  const item = cases.find((caseEntry) => caseEntry.id === caseId);
  if (!item) {
    alert('Case not found.');
    return;
  }

  item.events.push({
    id: `EVT-${Date.now()}`,
    step: 'commander_review',
    action: 'COMMANDER_ACCEPTED',
    actorRole: 'STATION_COMMANDER',
    actorId: 'station-commander',
    sixWs,
    investigatorUpdate,
    timestamp: new Date().toISOString()
  });
  item.commanderAccepted = true;
  item.status = 'commander_accepted';
  saveCases(cases);
  commanderForm.reset();
  refreshViews();
  alert('Case accepted by Station Commander.');
});

refreshViews();
