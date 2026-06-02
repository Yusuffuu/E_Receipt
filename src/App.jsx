import { useState, useEffect } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { parseMPesaSMS } from './utils/mpesaParser';
import { saveReceipt, getAllReceipts, deleteReceipt } from './db/database';
import { ReceiptPDF } from './components/ReceiptPDF';

function App() {
  const [smsText, setSmsText] = useState('');
  const [receiptData, setReceiptData] = useState({
    amount: '',
    sender: '',
    date: '',
    time: '',
    txnId: '',
    description: ''
  });
  const [pastReceipts, setPastReceipts] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isParsing, setIsParsing] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const receipts = await getAllReceipts();
    setPastReceipts(receipts);
  };

  const handleParse = async () => {
    if (!smsText.trim()) {
      alert('📱 Please paste an M-Pesa SMS message');
      return;
    }
    
    setIsParsing(true);
    setTimeout(() => {
      const parsed = parseMPesaSMS(smsText);
      setReceiptData({
        amount: parsed.amount,
        sender: parsed.sender,
        date: parsed.date,
        time: parsed.time,
        txnId: parsed.txnId,
        description: 'Payment for rent'  // Default description
      });
      setIsParsing(false);
    }, 500);
  };

  const handleSaveReceipt = async () => {
    if (!receiptData.amount || !receiptData.sender) {
      alert('⚠️ Please fill all required fields');
      return;
    }

    await saveReceipt(receiptData);
    await loadHistory();
    alert('✅ Receipt saved successfully!');
    clearForm();
  };

  const handleDelete = async (id) => {
    if (confirm('🗑️ Delete this receipt?')) {
      await deleteReceipt(id);
      await loadHistory();
    }
  };

  const clearForm = () => {
    setSmsText('');
    setReceiptData({
      amount: '', sender: '', date: '', time: '', txnId: '', description: 'Payment for rent'
    });
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-2 drop-shadow-lg">
            🏠 511 HOMES - Receipt Generator
          </h1>
          <p className="text-white text-opacity-90 text-lg">
            Transform M-Pesa SMS into professional receipts
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex gap-3 mb-6 justify-center">
          <button 
            onClick={() => setShowHistory(false)}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
              !showHistory 
                ? 'bg-white text-blue-600 shadow-lg scale-105' 
                : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
            }`}
          >
            📝 New Receipt
          </button>
          <button 
            onClick={() => { setShowHistory(true); loadHistory(); }}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
              showHistory 
                ? 'bg-white text-blue-600 shadow-lg scale-105' 
                : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
            }`}
          >
            📚 History ({pastReceipts.length})
          </button>
        </div>

        {/* Main Content */}
        <div className="glass-card p-6 md:p-8">
          {!showHistory ? (
            <div className="space-y-6">
              {/* SMS Input Section */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl">
                <label className="block font-bold text-gray-700 mb-2 text-lg">
                  📱 Paste M-Pesa SMS
                </label>
                <textarea 
                  className="input-modern h-32 font-mono text-sm"
                  value={smsText}
                  onChange={(e) => setSmsText(e.target.value)}
                  placeholder="Paste your M-Pesa confirmation SMS here..."
                />
                <button 
                  onClick={handleParse}
                  disabled={isParsing}
                  className="mt-3 btn-primary w-full md:w-auto"
                >
                  {isParsing ? '🔄 Parsing...' : '🚀 Generate Receipt'}
                </button>
              </div>

              {/* Receipt Form Section */}
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  ✏️ Receipt Details
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Customer Name</label>
                    <input 
                      type="text" 
                      value={receiptData.sender}
                      onChange={(e) => setReceiptData({...receiptData, sender: e.target.value})}
                      className="input-modern"
                      placeholder="Customer name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Amount (KES)</label>
                    <input 
                      type="text" 
                      value={receiptData.amount}
                      onChange={(e) => setReceiptData({...receiptData, amount: e.target.value})}
                      className="input-modern"
                      placeholder="e.g., 450.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Payment Date</label>
                    <input 
                      type="text" 
                      value={receiptData.date}
                      onChange={(e) => setReceiptData({...receiptData, date: e.target.value})}
                      className="input-modern"
                      placeholder="DD/MM/YYYY"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Payment Time</label>
                    <input 
                      type="text" 
                      value={receiptData.time}
                      onChange={(e) => setReceiptData({...receiptData, time: e.target.value})}
                      className="input-modern"
                      placeholder="HH:MM AM/PM"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Transaction ID</label>
                    <input 
                      type="text" 
                      value={receiptData.txnId}
                      onChange={(e) => setReceiptData({...receiptData, txnId: e.target.value})}
                      className="input-modern font-mono text-sm"
                      placeholder="M-Pesa transaction code"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Description</label>
                    <input 
                      type="text" 
                      value={receiptData.description}
                      onChange={(e) => setReceiptData({...receiptData, description: e.target.value})}
                      className="input-modern"
                      placeholder="e.g., Payment for rent"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 mt-6">
                  <button 
                    onClick={handleSaveReceipt}
                    className="btn-primary"
                  >
                    💾 Save Receipt
                  </button>
                  
                  {receiptData.amount && (
                    <PDFDownloadLink 
                      document={<ReceiptPDF receipt={{...receiptData, receiptNumber: 'PREVIEW'}} />} 
                      fileName={`511Homes_receipt_${receiptData.txnId}.pdf`}
                    >
                      {({ loading }) => (
                        <button className="btn-success">
                          {loading ? '⏳ Generating...' : '📥 Download PDF'}
                        </button>
                      )}
                    </PDFDownloadLink>
                  )}
                  
                  <button onClick={clearForm} className="btn-secondary">
                    🗑️ Clear
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">📜 Receipt History</h2>
              {pastReceipts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No receipts yet. Create your first one!</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {pastReceipts.map(receipt => (
                    <div key={receipt.id} className="bg-gray-50 p-4 rounded-xl flex flex-wrap justify-between items-center gap-3 hover:shadow-md transition-all">
                      <div className="flex-1">
                        <p className="font-bold text-gray-800">{receipt.receiptNumber}</p>
                        <p className="text-sm text-gray-600">
                          📅 {receipt.date} | 👤 {receipt.sender} | 💰 KES {receipt.amount}
                        </p>
                        <p className="text-xs text-gray-500 font-mono">🔑 {receipt.txnId}</p>
                      </div>
                      <div className="flex gap-2">
                        <PDFDownloadLink 
                          document={<ReceiptPDF receipt={receipt} />} 
                          fileName={`511Homes_receipt_${receipt.receiptNumber}.pdf`}
                        >
                          {({ loading }) => (
                            <button className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition">
                              {loading ? '...' : '📄 PDF'}
                            </button>
                          )}
                        </PDFDownloadLink>
                        <button 
                          onClick={() => handleDelete(receipt.id)}
                          className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-white text-opacity-75 text-sm">
          <p>© 2026 511 HOMES | Official Receipt Generator | Secure & Private</p>
        </div>
      </div>
    </div>
  );
}

export default App;
