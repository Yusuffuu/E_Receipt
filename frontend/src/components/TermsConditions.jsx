export default function TermsConditions({ onAccept, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
      <div className="glass-card relative w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl overflow-hidden">
        <button
          type="button"
          onClick={onCancel}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-900 text-xl font-bold"
          aria-label="Close terms modal"
        >
          ×
        </button>

        <div className="pb-4 border-b border-gray-200 mb-6">
          <h2 className="text-2xl font-bold">Terms & Conditions</h2>
          <p className="text-sm text-gray-600 mt-1">Review the agreement details below before accepting.</p>
        </div>

        <div className="space-y-4 text-sm text-gray-700 max-h-[60vh] overflow-y-auto pr-2">
          <p>By accepting these terms, the tenant confirms that all provided information is true and that they agree to follow the tenancy obligations listed below.</p>
          <div className="space-y-3">
            <p className="font-semibold">1. Rent & Payment</p>
            <p>Rent is due on the agreed payment date every month. Late payment may incur penalties and could affect your tenancy standing.</p>
          </div>
          <div className="space-y-3">
            <p className="font-semibold">2. Use of Property</p>
            <p>The property must be used for residential purposes only. Subletting, commercial activity, or excessive noise that disturbs neighbors is not permitted.</p>
          </div>
          <div className="space-y-3">
            <p className="font-semibold">3. Repairs & Maintenance</p>
            <p>The tenant is responsible for reporting maintenance issues promptly. Damage caused by negligence or misuse may be charged to the tenant.</p>
          </div>
          <div className="space-y-3">
            <p className="font-semibold">4. Identification & Documentation</p>
            <p>The tenant agrees that the uploaded ID images are accurate copies of their identification and may be used to verify their identity for the tenancy agreement.</p>
          </div>
          <div className="space-y-3">
            <p className="font-semibold">5. Termination</p>
            <p>Either party may terminate the tenancy in accordance with the agreement terms. The tenant must leave the property in good condition and settle any outstanding obligations.</p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onAccept} className="btn-primary">
            Accept terms & conditions
          </button>
          <button type="button" onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
