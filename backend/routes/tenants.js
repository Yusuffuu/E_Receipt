const express = require('express');
const multer = require('multer');
const db = require('../config/db');
const { uploadID } = require('../middleware/upload');
const { sendAgreementEmail } = require('../utils/emailService');
const { generateAgreementPDF } = require('../utils/pdfGenerator');
const fs = require('fs').promises;
const router = express.Router();

// Submit new tenant form (public)
router.post('/submit', uploadID.fields([
  { name: 'idFront', maxCount: 1 },
  { name: 'idBack', maxCount: 1 },
  { name: 'tenantSignature', maxCount: 1 }
]), async (req, res) => {
  try {
    console.log('Request body:', req.body);
    console.log('Request files:', req.files);

    const {
      full_name,
      id_number,
      phone,
      email,
      occupation,
      next_of_kin_name,
      next_of_kin_phone,
      house_number
    } = req.body;

    if (!full_name || !id_number || !email || !house_number) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const idFrontFile = req.files?.idFront?.[0];
    const idBackFile = req.files?.idBack?.[0];
    const tenantSignatureFile = req.files?.tenantSignature?.[0];
    if (!idFrontFile || !idBackFile) {
      return res.status(400).json({ error: 'Both front and back ID images are required' });
    }
    if (!tenantSignatureFile) {
      return res.status(400).json({ error: 'Tenant signature is required when accepting terms.' });
    }

    const idFrontPath = idFrontFile.path;
    const idBackPath = idBackFile.path;
    const tenantSignaturePath = tenantSignatureFile.path;

    // Insert tenant – result is an object (not array)
    const insertResult = await db.execute(
      `INSERT INTO tenants 
       (full_name, id_number, phone, email, occupation, next_of_kin_name, 
        next_of_kin_phone, house_number, id_front_path, id_back_path) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
      [full_name, id_number, phone, email, occupation, next_of_kin_name, 
       next_of_kin_phone, house_number, idFrontPath, idBackPath]
    );
    const tenantId = Number(insertResult.insertId);

    // Insert initial agreement log (pdf_path will be updated later if PDF generation succeeds)
    await db.execute(
      'INSERT INTO agreement_logs (tenant_id, pdf_path, email_sent) VALUES ($1, $2, $3)',
      [tenantId, null, false]
    );

    // Generate PDF agreement
    let pdfPath = null;
    try {
      console.log('Generating PDF for tenant:', tenantId);
      pdfPath = await generateAgreementPDF({
        id: tenantId,
        full_name,
        id_number,
        phone,
        email,
        occupation,
        next_of_kin_name,
        next_of_kin_phone,
        house_number,
        id_front_path: idFrontPath,
        id_back_path: idBackPath,
        tenant_signature_path: tenantSignaturePath
      });
      console.log('PDF generated at:', pdfPath);

      // Update tenant with PDF path
      await db.execute(
        'UPDATE tenants SET agreement_pdf_path = $1 WHERE id = $2',
        [pdfPath, tenantId]
      );
      // Update agreement log with the PDF path
      await db.execute(
        'UPDATE agreement_logs SET pdf_path = $1 WHERE tenant_id = $2',
        [pdfPath, tenantId]
      );
      console.log('PDF path saved to DB');
    } catch (pdfErr) {
      console.error('PDF generation failed:', pdfErr);
      // Continue without PDF – log is already inserted with pdf_path = null
    }

    // Send email (only if PDF was generated successfully, otherwise skip or send without attachment)
    let emailResult = { success: false };
    if (pdfPath) {
      emailResult = await sendAgreementEmail(email, full_name, pdfPath, house_number);
      if (emailResult.success) {
        await db.execute(
          'UPDATE agreement_logs SET email_sent = true, email_sent_at = NOW() WHERE tenant_id = $1',
          [tenantId]
        );
      }
    } else {
      console.warn('Email not sent because PDF generation failed');
    }

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    res.json({
      success: true,
      message: pdfPath ? 'Tenant registered successfully' : 'Tenant registered but PDF generation failed. Please contact support.',
      tenantId,
      downloadLink: pdfPath ? `${baseUrl}/api/agreements/download/${tenantId}` : null,
      emailSent: emailResult.success
    });

  } catch (error) {
    console.error('Submit error:', error);
    console.error(error.stack);

    if (error instanceof multer.MulterError) {
      return res.status(400).json({ error: error.message });
    }
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'A tenant with that ID number already exists.' });
    }
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Get all tenants
router.get('/all', async (req, res) => {
  try {
    const rows = await db.query(
      `SELECT id, full_name, id_number, phone, email, occupation, 
              next_of_kin_name, next_of_kin_phone, house_number, 
              status, created_at, agreement_pdf_path 
       FROM tenants ORDER BY created_at DESC`
    );
    res.json(rows);
  } catch (error) {
    console.error('Fetch tenants error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single tenant
router.get('/:id', async (req, res) => {
  try {
    const rows = await db.query(
      'SELECT * FROM tenants WHERE id = $1',
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Tenant not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Fetch tenant error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete tenant
router.delete('/:id', async (req, res) => {
  try {
    const rows = await db.query(
      'SELECT id_front_path, id_back_path, agreement_pdf_path FROM tenants WHERE id = $1',
      [req.params.id]
    );
    if (rows.length > 0) {
      const tenant = rows[0];
      if (tenant.id_front_path) await fs.unlink(tenant.id_front_path).catch(() => {});
      if (tenant.id_back_path) await fs.unlink(tenant.id_back_path).catch(() => {});
      if (tenant.agreement_pdf_path) await fs.unlink(tenant.agreement_pdf_path).catch(() => {});
    }

    await db.execute('DELETE FROM tenants WHERE id = $1', [req.params.id]);
    res.json({ success: true, message: 'Tenant deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;