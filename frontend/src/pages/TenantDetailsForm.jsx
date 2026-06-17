import { useState, useRef, useEffect } from 'react';
import { submitTenantForm, downloadAgreementFile } from '../utils/api';
import TermsConditions from '../components/TermsConditions';

const houseNumbers = ['H01', 'H02', 'H03', 'H04', 'H05', 'H06', 'H07', 'H08', 'H09', 'H10'];

export default function TenantDetailsForm() {
  const [formData, setFormData] = useState({
    full_name: '',
    id_number: '',
    phone: '',
    email: '',
    occupation: '',
    next_of_kin_name: '',
    next_of_kin_phone: '',
    house_number: '',
  });
  const [idFront, setIdFront] = useState(null);
  const [idBack, setIdBack] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [tenantInfo, setTenantInfo] = useState({ full_name: '', house_number: '' });
  const [error, setError] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [signatureDataUrl, setSignatureDataUrl] = useState('');
  const [isSigning, setIsSigning] = useState(false);
  const signatureCanvasRef = useRef(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    if (!/^[0-9]{10}$/.test(formData.phone)) {
      setError('Phone number must be exactly 10 digits, for example 0712345678.');
      setLoading(false);
      return;
    }

    if (!acceptTerms) {
      setError('You must accept the terms & conditions before submitting.');
      setLoading(false);
      return;
    }

    if (!signatureDataUrl) {
      setError('Please add your signature after accepting the terms.');
      setLoading(false);
      return;
    }

    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    if (idFront) data.append('idFront', idFront);
    if (idBack) data.append('idBack', idBack);
    const canvas = signatureCanvasRef.current;
    if (canvas) {
      const croppedSignature = cropSignatureCanvas(canvas);
      if (croppedSignature) {
        const blob = await (await fetch(croppedSignature)).blob();
        data.append('tenantSignature', blob, 'tenant-signature.png');
      }
    }

    try {
      const res = await submitTenantForm(data);
      setResult(res.data);
      setTenantInfo({ full_name: formData.full_name, house_number: formData.house_number });
      // Reset form
      setFormData({
        full_name: '', id_number: '', phone: '', email: '', occupation: '',
        next_of_kin_name: '', next_of_kin_phone: '', house_number: 'H01'
      });
      setIdFront(null);
      setIdBack(null);
      setAcceptTerms(false);
      setSignatureDataUrl('');
    } catch (err) {
      console.error('Tenant submission error:', err.response?.data || err.message || err);
      setError(err.response?.data?.error || err.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  const getFilenameFromDisposition = (disposition) => {
    if (!disposition) return null;
    const filenameRegex = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i;
    const matches = filenameRegex.exec(disposition);
    return matches?.[1] ? decodeURIComponent(matches[1]) : null;
  };

  const formatAgreementFilename = (tenantName, houseNumber) => {
    const cleanName = tenantName.trim().replace(/\s+/g, '_');
    const cleanHouse = houseNumber.trim().replace(/\s+/g, '_');
    return `${cleanName}_agreement_on_${cleanHouse}.pdf`;
  };

  const handleDownload = async (tenantId) => {
    try {
      const response = await downloadAgreementFile(tenantId);
      const blob = new Blob([response.data], { type: response.headers['content-type'] || 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const disposition = response.headers['content-disposition'] || response.headers['Content-Disposition'];
      const defaultName = formatAgreementFilename(
        tenantInfo.full_name || formData.full_name || 'tenant',
        tenantInfo.house_number || formData.house_number || 'house'
      );
      const fileName = getFilenameFromDisposition(disposition) || defaultName;
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
      setError('Unable to download agreement. Please refresh or contact support.');
    }
  };

  const clearSignature = () => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureDataUrl('');
  };

  const cropSignatureCanvas = (canvas) => {
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const imageData = ctx.getImageData(0, 0, width, height);
    let minX = width;
    let minY = height;
    let maxX = 0;
    let maxY = 0;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * 4;
        const alpha = imageData.data[index + 3];
        if (alpha > 10) {
          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
        }
      }
    }

    if (maxX === 0 && maxY === 0) {
      return null;
    }

    const padding = 12;
    minX = Math.max(0, minX - padding);
    minY = Math.max(0, minY - padding);
    maxX = Math.min(width, maxX + padding);
    maxY = Math.min(height, maxY + padding);

    const croppedWidth = maxX - minX;
    const croppedHeight = maxY - minY;
    const croppedCanvas = document.createElement('canvas');
    croppedCanvas.width = croppedWidth;
    croppedCanvas.height = croppedHeight;
    const croppedCtx = croppedCanvas.getContext('2d');
    croppedCtx.putImageData(ctx.getImageData(minX, minY, croppedWidth, croppedHeight), 0, 0);
    return croppedCanvas.toDataURL('image/png');
  };

  const resizeSignatureCanvas = () => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scale = window.devicePixelRatio || 1;
    canvas.width = rect.width * scale;
    canvas.height = rect.height * scale;
    const ctx = canvas.getContext('2d');
    ctx.scale(scale, scale);
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#111827';
    ctx.lineWidth = 2;
  };

  useEffect(() => {
    resizeSignatureCanvas();
    window.addEventListener('resize', resizeSignatureCanvas);
    return () => window.removeEventListener('resize', resizeSignatureCanvas);
  }, []);

  const getPointerPosition = (event) => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  };

  const startSignature = (event) => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const pos = getPointerPosition(event);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    setIsSigning(true);
  };

  const drawSignature = (event) => {
    if (!isSigning) return;
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const pos = getPointerPosition(event);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const endSignature = () => {
    if (!isSigning) return;
    setIsSigning(false);
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    setSignatureDataUrl(canvas.toDataURL('image/png'));
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto max-w-3xl">
        <div className="glass-card p-6 md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold align-center">🏠 Tenant Details Form</h1>
              <p className="text-gray-600">Complete the tenant profile and generate the tenancy agreement.</p>
            </div>
          </div>

          {result ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
              <h3 className="text-xl font-bold text-green-700 mb-2">✅ Submission Successful!</h3>
              <p className="text-green-600 mb-4">Your tenant has been registered successfully.</p>
              {result.downloadLink ? (
                <button
                  onClick={() => handleDownload(result.tenantId)}
                  className="btn-primary inline-block"
                >
                  📄 Download Agreement PDF
                </button>
              ) : (
                <div className="bg-yellow-100 border border-yellow-300 text-yellow-800 rounded-lg p-4 mb-4">
                  <p>Agreement generation failed, so no PDF is available yet.</p>
                  <p>Please refresh the page or contact support if the PDF is still missing.</p>
                </div>
              )}
              <button
                onClick={() => setResult(null)}
                className="mt-4 text-blue-600 underline"
              >
                Submit another tenant
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold">Full Name *</label>
                  <input name="full_name" value={formData.full_name} onChange={handleChange} required className="input-modern" />
                </div>
                <div>
                  <label className="block text-sm font-semibold">ID Number *</label>
                  <input name="id_number" inputMode="numeric" pattern="[0-9]{8,10}" minLength={8} maxLength={10} value={formData.id_number} onChange={handleChange} required className="input-modern" />
                </div>
                <div>
                  <label className="block text-sm font-semibold">Phone Number *</label>
                  <input
                    name="phone"
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]{10}"
                    maxLength={10}
                    placeholder="e.g, 0712345678"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="input-modern"
                  />
                  <p className="text-xs text-gray-500 mt-1">Enter exactly 10 digits, for example 0712345678.</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold">Email *</label>
                  <input name="email" type="email" value={formData.email} onChange={handleChange} required className="input-modern" />
               <p className="text-xs text-gray-500 mt-1">Enter a valid email address, for example user@example.com.</p>
               </div>
                <div>
                  <label className="block text-sm font-semibold">Occupation (what you do for a living)*</label>
                  <input name="occupation" value={formData.occupation} onChange={handleChange} required className="input-modern" />
                </div>
                <div>
                  <label className="block text-sm font-semibold">House Number *</label>
                     <select
                       name="house_number"
                       value={formData.house_number || ''}
                       onChange={handleChange}
                        required
                        className="input-modern"
                      >
                       <option value="" disabled>Select house number</option>
                        {houseNumbers.map((h) => (
                       <option key={h} value={h}>{h}</option>
                        ))}
                      </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold">Next of Kin Name *</label>
                  <input name="next_of_kin_name" value={formData.next_of_kin_name} onChange={handleChange} required className="input-modern" />
                </div>
                <div>
                  <label className="block text-sm font-semibold">Next of Kin Phone *</label>
                  <input name="next_of_kin_phone" value={formData.next_of_kin_phone} onChange={handleChange} required className="input-modern" />
                </div>
              </div>

              <div className="border-t pt-4">
                <label className="block text-sm font-semibold mb-2">Upload ID (Front) *</label>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={(e) => setIdFront(e.target.files[0])}
                  required
                  className="input-modern"
                />
                <p className="text-xs text-gray-500 mt-1">Use your phone camera or pick an image. JPG, PNG, or HEIC formats are accepted, max 5MB.</p>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Upload ID (Back) *</label>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={(e) => setIdBack(e.target.files[0])}
                  required
                  className="input-modern"
                />
              </div>

              <div className="flex items-start gap-3 mt-3">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => {
                      setAcceptTerms(e.target.checked);
                      if (!e.target.checked) {
                        clearSignature();
                      }
                    }}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>I accept the terms & conditions</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowTerms(true)}
                  className="text-blue-600 underline text-sm"
                >
                  Read terms & conditions
                </button>
              </div>

              {acceptTerms && (
                <div className="mt-4 rounded-2xl border border-gray-300 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-semibold">Tenant Signature</p>
                      <p className="text-xs text-gray-500">Draw your signature below using your finger or mouse.</p>
                    </div>
                    <button
                      type="button"
                      onClick={clearSignature}
                      className="btn-secondary px-3 py-1 text-sm"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="rounded-xl border border-gray-200 bg-gray-50">
                    <canvas
                      ref={signatureCanvasRef}
                      className="w-full h-32 touch-none"
                      onPointerDown={startSignature}
                      onPointerMove={drawSignature}
                      onPointerUp={endSignature}
                      onPointerLeave={endSignature}
                    />
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    {signatureDataUrl ? 'Signature captured.' : 'Please sign inside the box above.'}
                  </p>
                </div>
              )}

              {error && <p className="text-red-600 text-sm">{error}</p>}

              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? 'Submitting...' : 'Submit & Generate Agreement'}
              </button>
            </form>
          )}

          {showTerms && (
            <TermsConditions
              onAccept={() => {
                setAcceptTerms(true);
                setShowTerms(false);
              }}
              onCancel={() => setShowTerms(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
}