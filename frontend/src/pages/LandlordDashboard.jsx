import { useEffect, useState } from 'react';
import { getTenants, deleteTenant, downloadAgreementFile } from '../utils/api';

export default function LandlordDashboard() {
  const [tenants, setTenants] = useState([]);
  const [filteredTenants, setFilteredTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const shareLink = `${window.location.origin}/tenant-form`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      alert('Tenant form link copied to clipboard!');
    } catch (err) {
      console.error('Clipboard copy failed', err);
      alert('Unable to copy link. Please copy it manually: ' + shareLink);
    }
  };

  const fetchTenants = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getTenants();
      setTenants(res.data);
      setFilteredTenants(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load tenants. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredTenants(tenants);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = tenants.filter(
        (t) =>
          t.full_name.toLowerCase().includes(term) ||
          t.id_number.toLowerCase().includes(term) ||
          t.house_number.toLowerCase().includes(term) ||
          t.email.toLowerCase().includes(term)
      );
      setFilteredTenants(filtered);
    }
  }, [searchTerm, tenants]);

  const getFilenameFromDisposition = (disposition) => {
    if (!disposition) return null;
    const filenameRegex = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i;
    const matches = filenameRegex.exec(disposition);
    return matches?.[1] ? decodeURIComponent(matches[1]) : null;
  };

  const formatAgreementFilename = (tenant) => {
    const cleanName = tenant.full_name?.trim().replace(/\s+/g, '_') || 'Tenant';
    const cleanHouse = tenant.house_number?.trim().replace(/\s+/g, '_') || 'House';
    return `${cleanName}_agreement_on_${cleanHouse}.pdf`;
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this tenant permanently?')) {
      await deleteTenant(id);
      fetchTenants();
    }
  };

  const handleDownload = async (tenant) => {
    try {
      const response = await downloadAgreementFile(tenant.id);
      const blob = new Blob([response.data], { type: response.headers['content-type'] || 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const disposition = response.headers['content-disposition'] || response.headers['Content-Disposition'];
      const fileName = getFilenameFromDisposition(disposition) || formatAgreementFilename(tenant);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Agreement download failed:', err);
      alert('Unable to download agreement. Please refresh the page or contact support.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-purple-600 to-blue-500">
        <div className="text-white text-xl">Loading tenants...</div>
      </div>
    );
  }

  return (
      <div className="min-h-screen py-8 px-4 bg-linear-to-br from-purple-600 to-blue-500">
        <div className="container mx-auto max-w-6xl">
          <div className="relative w-full max-w-7xl mx-auto mb-8 text-center px-4">
            <div>
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-white drop-shadow-lg leading-tight">
                🏠 511 HOMES - Landlord Dashboard
              </h1>
              <p className="text-white text-opacity-90 text-lg sm:text-base md:text-lg mt-2">
                View and manage your tenants, download agreements, and keep track of everything in one place.
              </p>
            </div>
          </div>

          <div className="glass-card p-6 md:p-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">📋 Tenants List</h1>
                <p className="text-gray-600 mt-2">Share a tenant form link, view tenant details, and download agreements from one page.</p>
              </div>
              <button
                type="button"
                onClick={copyLink}
                className="btn-success inline-flex items-center justify-center rounded-lg px-5 py-3 text-lg font-semibold"
              >
                🔗 Copy Tenant Form Link
              </button>
            </div>
            <div className="flex flex-col md:flex-row justify-between items-center mb-6">
              <div className="relative w-full md:w-80">
                <input
                  type="text"
                  placeholder="Search by name, ID, house or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-modern pl-10 pr-4 py-2 w-full"
                />
                <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
              </div>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            {filteredTenants.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No tenants found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-2 text-left">Name</th>
                      <th className="p-2 text-left">ID</th>
                      <th className="p-2 text-left">House</th>
                      <th className="p-2 text-left">Email</th>
                      <th className="p-2 text-left">Phone</th>
                      <th className="p-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTenants.map((tenant) => (
                      <tr key={tenant.id} className="border-b hover:bg-gray-50 transition">
                        <td className="p-2 font-medium">{tenant.full_name}</td>
                        <td className="p-2">{tenant.id_number}</td>
                        <td className="p-2">{tenant.house_number}</td>
                        <td className="p-2">{tenant.email}</td>
                        <td className="p-2">{tenant.phone || '—'}</td>
                        <td className="p-2 flex flex-wrap items-center gap-2">
                          {tenant.agreement_pdf_path && (
                            <button
                              onClick={() => handleDownload(tenant)}
                              className="btn-primary px-3 py-2 text-sm"
                            >
                              PDF
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(tenant.id)}
                            className="btn-secondary px-3 py-2 text-sm"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
  );
}