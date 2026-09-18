const express = require('express');
const router = express.Router();

const cases = new Map();
const SIX_WS = ['who', 'what', 'when', 'where', 'why', 'how'];
const WORKFLOW_STEPS = ['registration', 'allocation', 'investigation', 'transfer', 'commander_review', 'resolution'];

function now() {
  return new Date().toISOString();
}

function validateSixWs(sixWs) {
  if (!sixWs) return SIX_WS;
  return SIX_WS.filter((key) => !String(sixWs[key] || '').trim());
}

function makeCaseId() {
  return `CASE-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function makeEvent({ actorRole, actorId, step, sixWs, investigatorUpdate, action }) {
  const missing = validateSixWs(sixWs);
  if (missing.length) {
    const err = new Error(`All six W's required. Missing: ${missing.join(', ')}`);
    err.status = 400;
    throw err;
  }
  if (!String(investigatorUpdate || '').trim()) {
    const err = new Error('An investigator update is required for every workflow step.');
    err.status = 400;
    throw err;
  }

  return {
    id: `EVT-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    actorRole,
    actorId: actorId || 'unknown-user',
    step,
    action,
    sixWs: Object.fromEntries(SIX_WS.map((key) => [key, String(sixWs[key]).trim()])),
    investigatorUpdate: String(investigatorUpdate).trim(),
    timestamp: now()
  };
}

router.post('/register', (req, res, next) => {
  try {
    const { sixWs, investigatorUpdate, station, complainantName, offenceDetails } = req.body;
    const event = makeEvent({
      actorRole: 'CSC_OFFICIAL',
      actorId: req.body.actorId || 'csc-officer',
      step: 'registration',
      sixWs,
      investigatorUpdate,
      action: 'CASE_REGISTERED'
    });

    const caseRecord = {
      id: makeCaseId(),
      casNumber: `CAS-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`,
      complainantName: complainantName || 'Not provided',
      offenceDetails: offenceDetails || 'Not provided',
      station: station || sixWs.where,
      status: 'registered',
      commanderAccepted: false,
      createdAt: event.timestamp,
      updatedAt: event.timestamp,
      events: [event]
    };

    cases.set(caseRecord.id, caseRecord);
    res.status(201).json(caseRecord);
  } catch (error) {
    next(error);
  }
});

router.post('/:id/updates', (req, res, next) => {
  try {
    const caseRecord = cases.get(req.params.id);
    if (!caseRecord) return res.status(404).json({ error: 'Case not found' });

    const { step, sixWs, investigatorUpdate, actorId, actorRole, action } = req.body;
    if (!WORKFLOW_STEPS.includes(step)) {
      return res.status(400).json({ error: `Invalid workflow step. Allowed: ${WORKFLOW_STEPS.join(', ')}` });
    }

    const event = makeEvent({
      actorRole: actorRole || 'INVESTIGATOR',
      actorId: actorId || 'investigator',
      step,
      sixWs,
      investigatorUpdate,
      action: action || 'STEP_UPDATE'
    });

    caseRecord.events.push(event);
    caseRecord.status = step;
    caseRecord.updatedAt = event.timestamp;
    caseRecord.commanderAccepted = false;
    res.status(201).json({ case: caseRecord, event });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/commander-acceptance', (req, res, next) => {
  try {
    const caseRecord = cases.get(req.params.id);
    if (!caseRecord) return res.status(404).json({ error: 'Case not found' });

    const invalidEvents = caseRecord.events.filter((event) => {
      return validateSixWs(event.sixWs).length > 0 || !String(event.investigatorUpdate || '').trim();
    });

    if (invalidEvents.length) {
      return res.status(409).json({
        accepted: false,
        error: 'Commander cannot accept until every step contains all six W\'s and an investigator update.',
        invalidEvents: invalidEvents.map((event) => ({ id: event.id, step: event.step }))
      });
    }

    const commanderEvent = makeEvent({
      actorRole: 'STATION_COMMANDER',
      actorId: req.body.actorId || 'station-commander',
      step: 'commander_review',
      sixWs: req.body.sixWs,
      investigatorUpdate: req.body.investigatorUpdate,
      action: 'COMMANDER_ACCEPTED'
    });

    caseRecord.events.push(commanderEvent);
    caseRecord.commanderAccepted = true;
    caseRecord.status = 'commander_accepted';
    caseRecord.updatedAt = commanderEvent.timestamp;
    res.json({ accepted: true, case: caseRecord });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', (req, res) => {
  const caseRecord = cases.get(req.params.id);
  if (!caseRecord) return res.status(404).json({ error: 'Case not found' });
  res.json(caseRecord);
});

router.get('/', (req, res) => {
  res.json(Array.from(cases.values()));
});

module.exports = router;
module.exports.SIX_WS = SIX_WS;
module.exports.WORKFLOW_STEPS = WORKFLOW_STEPS;
module.exports.validateSixWs = validateSixWs;
