const express = require('express');
const router = express.Router();

const SIX_WS = ['who', 'what', 'when', 'where', 'why', 'how'];

router.post('/transfer', (req, res) => {
  const { sixWs, investigatorUpdate } = req.body;
  const missing = SIX_WS.filter((key) => !sixWs || !String(sixWs[key] || '').trim());

  if (missing.length || !String(investigatorUpdate || '').trim()) {
    return res.status(400).json({
      error: 'Transfer requires all six W\'s and an investigator update.',
      missing
    });
  }

  res.status(201).json({
    message: 'Docket transfer recorded',
    transfer: {
      ...req.body,
      recordedAt: new Date().toISOString()
    }
  });
});

router.post('/:id/acknowledge', (req, res) => {
  res.status(200).json({
    message: 'Transfer acknowledged',
    docketId: req.params.id,
    acknowledgedAt: new Date().toISOString()
  });
});

router.get('/:id', (req, res) => {
  res.json({
    docketId: req.params.id,
    message: 'Docket details endpoint.',
    sixWsRequired: true,
    investigatorUpdateRequired: true
  });
});

module.exports = router;
