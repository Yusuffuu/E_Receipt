const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Generates Tenancy Agreement PDF matching the formatting, spacing,
 * and layout of JOSEPH MAINA AGREEMENT H04.pdf
 */
async function generateAgreementPDF(tenant) {
  return new Promise((resolve, reject) => {
    try {
      // Ensure agreements directory exists
      const agreementsDir = path.join(__dirname, '../uploads/agreements');
      if (!fs.existsSync(agreementsDir)) {
        fs.mkdirSync(agreementsDir, { recursive: true });
      }

      const sanitize = (text) =>
        String(text || '')
          .trim()
          .replace(/[\s\/\\]+/g, ' ')
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, ' ');

      const safeName = sanitize(tenant.full_name).replace(/\s+/g, ' ');
      const safeHouse = sanitize(tenant.house_number).replace(/\s+/g, ' ');
      const fileName = `${safeName} agreement for ${safeHouse}.pdf`;
      const filePath = path.join(agreementsDir, fileName);
      const stream = fs.createWriteStream(filePath);
      
      // Target document uses tight standard margins to control page split precisely
      const doc = new PDFDocument({ margin: 40, size: 'A4', autoFirstPage: true });
      
      doc.pipe(stream);

      // Helper: Format date to exact structure like "3rd June 2026"
      function formatDate(date) {
        const day = date.getDate();
        const suffix = (day % 10 === 1 && day !== 11) ? 'st' :
                       (day % 10 === 2 && day !== 12) ? 'nd' :
                       (day % 10 === 3 && day !== 13) ? 'rd' : 'th';
        const months = ['January', 'February', 'March', 'April', 'May', 'June',
                        'July', 'August', 'September', 'October', 'November', 'December'];
        return `${day}${suffix} ${months[date.getMonth()]} ${date.getFullYear()}`;
      }
      
      // Helper: Short date for signatures block "03/06/2026"
      function formatShortDate(date) {
        const dd = String(date.getDate()).padStart(2, '0');
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const yyyy = date.getFullYear();
        return `${dd}/${mm}/${yyyy}`;
      }

      const rawDate = new Date();
      const currentDateString = formatDate(rawDate);
      const shortDateString = formatShortDate(rawDate);

      // Header component
      function addHeader() {
        doc.fontSize(16).font('Helvetica-Bold').text('511 HOMES NAKURU', { align: 'center' });
        doc.fontSize(12).font('Helvetica-Bold').text('0789 735 474', { align: 'center' });
        doc.moveDown(0.4);
        doc.fontSize(14).font('Helvetica-Bold').text('TENANCY AGREEMENT', { align: 'center' });
        doc.moveDown(0.8);
      }

      // ========== PAGE 1 ==========
      addHeader();

      // 1. PARTIES
      doc.fontSize(11).font('Helvetica-Bold').text('1. PARTIES. ', { continued: true });
      doc.font('Helvetica').text(`This Residential Tenance Agreement ("Agreement") made on ${currentDateString} is between the Landlord 511 HOMES ("Landlord"), AND the "Tenant" below`);
      doc.moveDown(0.4);

      // Tenant details structured closely line-by-line
      doc.font('Helvetica').text('Tenant Name(s):   ', { continued: true }).font('Helvetica-Bold').text((tenant.full_name || '').toUpperCase());
      doc.moveDown(0.2);

      doc.font('Helvetica').text('ID Number:   ', { continued: true }).font('Helvetica-Bold').text(`${tenant.id_number || ''} (Attach copy)`);
      doc.moveDown(0.2);

      doc.font('Helvetica').text('Phone Number(s):   ', { continued: true }).font('Helvetica-Bold').text(tenant.phone || '');
      doc.moveDown(0.2);

      doc.font('Helvetica').text('Occupation:   ', { continued: true }).font('Helvetica-Bold').text((tenant.occupation || '').toUpperCase());
      doc.moveDown(0.2);

      doc.font('Helvetica').text('Next of kin name:   ', { continued: true }).font('Helvetica-Bold').text((tenant.next_of_kin_name || '').toUpperCase());
      doc.moveDown(0.2);

      doc.font('Helvetica').text('Next of kin contacts:   ', { continued: true }).font('Helvetica-Bold').text(tenant.next_of_kin_phone || '');
      doc.moveDown(0.5);

      // 2. PROPERTY
      doc.font('Helvetica-Bold').text('2. PROPERTY. ', { continued: true });
      doc.font('Helvetica').text('The Landlord agrees to rent the described property to the Tenant:');
      doc.text('1 Bedsitter Unit located at Kirima area, Echariria, Nakuru County.');
      doc.font('Helvetica').text('House number:   ', { continued: true }).font('Helvetica-Bold').text(tenant.house_number || '');
      doc.font('Helvetica-Bold').text('Residence Type: ', { continued: true }).font('Helvetica').text('Single-family');
      doc.moveDown(0.8);

      // 3. RENT
      doc.font('Helvetica-Bold').text('3. RENT.');
      doc.font('Helvetica').text(`The Tenant shall pay the Landlord in equal monthly installments of Ksh 2,000 ("Rent").`);
      doc.text(`The Rent shall be due on the 5th of every month and paid under the following instructions:`);
      doc.moveDown(0.6);
      doc.font('Helvetica-Bold').text('Paybill:719968');
      doc.text('A/c 020008504');
      doc.text('Fantom Capital.');
      doc.moveDown(0.6);
      doc.font('Helvetica').text('The confirmation message to be sent to 0789 735 474');
      doc.text('Late payment shall attract a penalty of Kshs. 500.');
      doc.moveDown(0.8);

      // 4. SECURITY DEPOSIT
      doc.font('Helvetica-Bold').text('4. SECURITY DEPOSIT. ', { continued: true });
      doc.font('Helvetica').text(`The Tenant Shall deposit with the Landlord 1 month (the sum of Ksh 2,000) security deposit as security for any damage caused to the Premises during their stay.`);
      doc.text('Such deposit shall be returned to the Tenant, less any repair deductions, within 30 days after the date of vacation.');
      doc.moveDown(0.8);

      // 5. VACATION NOTICE
      doc.font('Helvetica-Bold').text('5. VACATION NOTICE. ', { continued: true });
      doc.font('Helvetica').text('The tenant is supposed to give the Landlord a 1 month written vacation notice in case they need to vacate the house.');
      doc.moveDown(0.8);

      // 6. DESTRUCTION OF LANDLORD'S PROPERTY
      doc.font('Helvetica-Bold').text('6. DESTRUCTION OF LANDLORD\'S PROPERTY: ', { continued: true });
      doc.font('Helvetica').text('If the tenant removes or destroys any property belonging to Landlord without the express written consent of the Landlord, they will be held liable and will be required to replace/repair, failure to which might lead to termination of this Rental Agreement.');
      doc.text('The Landlord may also take further legal action.');
      doc.moveDown(0.8);

      // 7. UTILITIES (Spills perfectly onto Page 2 right after the word "deduct")
      doc.font('Helvetica-Bold').text('7. UTILITIES: ', { continued: true });
      doc.font('Helvetica').text('Resident will be responsible for payment of all utilities;', { continued: true });
      doc.text(' electricity, water, garbage, or other bills incurred during their residency. They specifically authorize Landlord to deduct');

      // ========== PAGE 2 ==========
      doc.addPage();
      
      // Clean header block for page 2
      doc.fontSize(16).font('Helvetica-Bold').text('511 HOMES NAKURU', { align: 'center' });
      doc.fontSize(12).font('Helvetica-Bold').text('0789 735 474', { align: 'center' });
      doc.moveDown(0.8);

      doc.fontSize(11).font('Helvetica').text('amounts of unpaid bills from their Security Deposits in the event they remain unpaid after termination of this agreement.');
      doc.moveDown(1);

      // 8. SIGNATURES
      doc.font('Helvetica-Bold').text('8. SIGNATURES.');
      doc.moveDown(0.5);

      // Landlord Signature Block
      const label = 'Landlord Signature: ';
      doc.font('Helvetica-Bold').text(label, { continued: true });
      const landlordSignPathJpg = path.join(__dirname, '../uploads/Landlord_sign.jpg');
      const landlordSignPathPng = path.join(__dirname, '../uploads/Landlord_sign.png');
      const landlordSignPath = fs.existsSync(landlordSignPathJpg)
        ? landlordSignPathJpg
        : fs.existsSync(landlordSignPathPng)
        ? landlordSignPathPng
        : null;

      if (landlordSignPath) {
        const imageY = doc.y;
        doc.image(landlordSignPath, doc.page.margins.left, imageY, { width: 120 });
        doc.moveDown(5);
      } else {
        doc.moveDown(1);
      }
      doc.text('Date:', { continued: true }).font('Helvetica-Bold').text(shortDateString);
      doc.font('Helvetica-Bold').text('Name:', { continued: true }).font('Helvetica-Bold').text('JOSEPH KARANJA');
      doc.moveDown(1);

      // Tenant Signature Block
      doc.font('Helvetica-Bold').text('Tenant Signature:');
      if (tenant.tenant_signature_path && fs.existsSync(tenant.tenant_signature_path)) {
        try {
          const sigY = doc.y + 4;
          doc.image(tenant.tenant_signature_path, doc.x, sigY, { width: 140 });
          doc.moveDown(4);
        } catch (sigErr) {
          console.error('Tenant signature image error:', sigErr);
          doc.moveDown(1);
        }
      } else {
        doc.moveDown(1); // Leave a gap for signature lines if no image is available
      }
      doc.font('Helvetica').text(`Date:`, { continued: true }).font('Helvetica-Bold').text(`${shortDateString}`);
      doc.font('Helvetica').text('Name:', { continued: true }).font('Helvetica-Bold').text((tenant.full_name || '').toUpperCase());

      // ========== PAGE 3: ID IMAGE PLACEMENT ==========
      doc.addPage();

      doc.fontSize(16).font('Helvetica-Bold').text('511 HOMES NAKURU', { align: 'center' });
      doc.fontSize(12).font('Helvetica-Bold').text('0789 735 474', { align: 'center' });
      doc.moveDown(0.8);

      // Render images side by side or clearly aligned without document styling headers
      const frontPath = tenant.id_front_path;
      if (frontPath && fs.existsSync(frontPath)) {
        try {
          doc.image(frontPath, { width: 340, align: 'center' });
          doc.moveDown(1);
        } catch (err) {
          console.error('Error rendering front ID:', err);
        }
      }

      const backPath = tenant.id_back_path;
      if (backPath && fs.existsSync(backPath)) {
        try {
          doc.image(backPath, { width: 340, align: 'center' });
        } catch (err) {
          console.error('Error rendering back ID:', err);
        }
      }

      doc.on('error', (err) => {
        stream.destroy(err);
        reject(err);
      });

      doc.end();

      stream.on('finish', async () => {
        try {
          const stats = await fs.promises.stat(filePath);
          if (stats.size < 100) {
            await fs.promises.unlink(filePath).catch(() => {});
            return reject(new Error('Generated PDF file is too small or invalid')); 
          }
          resolve(filePath);
        } catch (statErr) {
          reject(statErr);
        }
      });
      stream.on('error', (err) => reject(err));
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = { generateAgreementPDF };