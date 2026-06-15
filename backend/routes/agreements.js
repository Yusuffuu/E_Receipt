const express = require('express');
const fs = require('fs');
const path = require('path');
const db = require('../config/db');
const router = express.Router();

// Download agreement PDF (protected)
router.get('/download/:id', async (req, res) => {
  try {
    const tenants = await db.query(
      'SELECT agreement_pdf_path FROM tenants WHERE id = ?',
      [req.params.id]
    );

    if (tenants.length === 0 || !tenants[0].agreement_pdf_path) {
      return res.status(404).json({ error: 'PDF not found' });
    }

    const pdfPath = path.resolve(tenants[0].agreement_pdf_path);

    try {
      await fs.promises.access(pdfPath, fs.constants.R_OK);
    } catch (accessError) {
      console.error('PDF file not accessible:', pdfPath, accessError);
      return res.status(404).json({ error: 'PDF file not found' });
    }

    res.download(pdfPath, path.basename(pdfPath), (err) => {
      if (err) {
        console.error('Download error:', err);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Unable to download PDF' });
        }
      }
    });
  } catch (error) {
    console.error('Download route error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all agreement logs (protected)
router.get('/logs', async (req, res) => {
  try {
    const [logs] = await db.execute(
      `SELECT l.*, t.full_name, t.house_number 
       FROM agreement_logs l 
       JOIN tenants t ON l.tenant_id = t.id 
       ORDER BY l.generated_at DESC`
    );
    res.json(logs);
  } catch (error) {
    console.error('Fetch logs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;