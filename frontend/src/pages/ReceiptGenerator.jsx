import { useState, useEffect } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { parseMPesaSMS } from '../utils/mpesaParser';
import { saveReceipt, getAllReceipts, deleteReceipt } from '../db/database';
import { ReceiptPDF } from '../components/ReceiptPDF';

function ReceiptGenerator() {
  const [smsText, setSmsText] = useState('');
  const [receiptData, setReceiptData] = useState({
    amount: '',
    sender: '',
    date: '',
    time: '',
    txnId: '',
    description: '',
    houseNumber: '',
    previousBalance: '0',
    paidForMonth: '',
    currentBalance: '0'
  });
  const [pastReceipts, setPastReceipts] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isParsing, setIsParsing] = useState(false);

  const MONTHLY_RENT = 2000;

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const receipts = await getAllReceipts();
    setPastReceipts(receipts);
  };

  const calculateCurrentBalance = (previousBalance, amountPaid) => {
    const prev = parseFloat(previousBalance) || 0;
    const paid = parseFloat(amountPaid) || 0;
    const totalDue = prev + MONTHLY_RENT;
    const current = totalDue - paid;
    return current.toFixed(2);
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
        description: 'Payment for rent',
        houseNumber: '',
        previousBalance: '0',
        paidForMonth: '',
        currentBalance: '0'
      });
      setIsParsing(false);
    }, 500);
  };

  const handleAmountChange = (value) => {
    setReceiptData((prev) => {
      const newAmount = value;
      const newCurrentBalance = calculateCurrentBalance(prev.previousBalance, newAmount);
      return { ...prev, amount: newAmount, currentBalance: newCurrentBalance };
    });
  };

  const handlePreviousBalanceChange = (value) => {
    setReceiptData((prev) => {
      const newPreviousBalance = value;
      const newCurrentBalance = calculateCurrentBalance(newPreviousBalance, prev.amount);
      return { ...prev, previousBalance: newPreviousBalance, currentBalance: newCurrentBalance };
    });
  };

  const handleSaveReceipt = async () => {
    if (!receiptData.amount || !receiptData.sender) {
      alert('⚠️ Please fill all required fields');
      return;
    }

    if (!receiptData.houseNumber) {
      alert('⚠️ Please enter the house number');
      return;
    }

    if (!receiptData.paidForMonth) {
      alert('⚠️ Please enter the month being paid for');
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
      amount: '',
      sender: '',
      date: '',
      time: '',
      txnId: '',
      description: 'Payment for rent',
      houseNumber: '',
      previousBalance: '0',
      paidForMonth: '',
      currentBalance: '0'
    });
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        
        <div className="w-full max-w-7xl mx-auto mb-8 text-center px-4">
          <div>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-white drop-shadow-lg leading-tight">
              🏠 511 HOMES - Receipt Generator
            </h1>
            <p className="text-white text-opacity-90 text-lg sm:text-base md:text-lg mt-2">
              Transform M-Pesa SMS into professional receipts
            </p>
          </div>
        </div>

        <div className="flex gap-3 mb-6 justify-center">
          <button
            onClick={() => setShowHistory(false)}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
              !showHistory
                ? 'bg-white text-blue-600 shadow-lg scale-105'
                : 'bg-white bg-opacity-20 text-blue-600 hover:bg-opacity-30'
            }`}
          >
            📝 New Receipt
          </button>
          <button
            onClick={() => { setShowHistory(true); loadHistory(); }}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
              showHistory
                ? 'bg-white text-blue-600 shadow-lg scale-105'
                : 'bg-white bg-opacity-20 text-blue-600 hover:bg-opacity-30'
            }`}
          >
            📚 History ({pastReceipts.length})
          </button>
        </div>

        <div className="glass-card p-6 md:p-8">
          {!showHistory ? (
            <div className="space-y-6">
              <div className="bg-linear-to-r from-blue-50 to-indigo-50 p-6 rounded-xl">
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
                      onChange={(e) => setReceiptData({ ...receiptData, sender: e.target.value })}
                      className="input-modern"
                      placeholder="Customer name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">House Number *</label>
                    <input
                      type="text"
                      value={receiptData.houseNumber}
                      onChange={(e) => setReceiptData({ ...receiptData, houseNumber: e.target.value })}
                      className="input-modern"
                      placeholder="e.g., A12, B5, 3B"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Amount Paid (KES)</label>
                    <input
                      type="number"
                      value={receiptData.amount}
                      onChange={(e) => handleAmountChange(e.target.value)}
                      className="input-modern"
                      placeholder="e.g., 450.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Payment Date</label>
                    <input
                      type="text"
                      value={receiptData.date}
                      onChange={(e) => setReceiptData({ ...receiptData, date: e.target.value })}
                      className="input-modern"
                      placeholder="DD/MM/YYYY"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Payment Time</label>
                    <input
                      type="text"
                      value={receiptData.time}
                      onChange={(e) => setReceiptData({ ...receiptData, time: e.target.value })}
                      className="input-modern"
                      placeholder="HH:MM AM/PM"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Transaction ID</label>
                    <input
                      type="text"
                      value={receiptData.txnId}
                      onChange={(e) => setReceiptData({ ...receiptData, txnId: e.target.value })}
                      className="input-modern font-mono text-sm"
                      placeholder="M-Pesa transaction code"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Previous Rent Balance (KES)</label>
                    <input
                      type="number"
                      value={receiptData.previousBalance}
                      onChange={(e) => handlePreviousBalanceChange(e.target.value)}
                      className="input-modern"
                      placeholder="0.00"
                    />
                    <p className="text-xs text-gray-400 mt-1">Previous unpaid balance (if any)</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Paid For Month *</label>
                    <select
                      value={receiptData.paidForMonth}
                      onChange={(e) => setReceiptData({ ...receiptData, paidForMonth: e.target.value })}
                      className="input-modern"
                    >
                      <option value="">Select Month</option>
                      <option value="January">January</option>
                      <option value="February">February</option>
                      <option value="March">March</option>
                      <option value="April">April</option>
                      <option value="May">May</option>
                      <option value="June">June</option>
                      <option value="July">July</option>
                      <option value="August">August</option>
                      <option value="September">September</option>
                      <option value="October">October</option>
                      <option value="November">November</option>
                      <option value="December">December</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Monthly Rent (KES)</label>
                    <input
                      type="text"
                      value={`${MONTHLY_RENT.toFixed(2)}`}
                      disabled
                      className="input-modern bg-gray-100"
                    />
                    <p className="text-xs text-gray-400 mt-1">Fixed rent amount</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Current Rent Balance (KES)</label>
                    <input
                      type="text"
                      value={receiptData.currentBalance}
                      disabled
                      className="input-modern bg-gray-100 font-bold text-blue-600"
                    />
                    <p className="text-xs text-gray-400 mt-1">Auto-calculated: (Previous + Rent) - Paid</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Description</label>
                    <input
                      type="text"
                      value={receiptData.description}
                      onChange={(e) => setReceiptData({ ...receiptData, description: e.target.value })}
                      className="input-modern"
                      placeholder="e.g., Payment for rent"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 mt-6">
                  <button onClick={handleSaveReceipt} className="btn-primary">
                    💾 Save Receipt
                  </button>
                  {receiptData.amount && (
                    <PDFDownloadLink
                      document={<ReceiptPDF receipt={receiptData} monthlyRent={MONTHLY_RENT} />}
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
                  {pastReceipts.map((receipt) => (
                    <div key={receipt.id} className="bg-gray-50 p-4 rounded-xl flex flex-wrap justify-between items-center gap-3 hover:shadow-md transition-all">
                      <div className="flex-1">
                        <p className="font-bold text-gray-800">{receipt.receiptNumber}</p>
                        <p className="text-sm text-gray-600">
                          🏠 {receipt.houseNumber || 'N/A'} | 👤 {receipt.sender} | 💰 KES {receipt.amount}
                        </p>
                        <p className="text-xs text-gray-500">
                          📅 {receipt.date} | 📆 {receipt.paidForMonth || 'N/A'} | Balance: KES {receipt.currentBalance}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <PDFDownloadLink
                          document={<ReceiptPDF receipt={receipt} monthlyRent={MONTHLY_RENT} />}
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

        <div className="text-center mt-8 text-white text-opacity-75 text-sm">
          <p>© 2026 511 HOMES | Official Receipt Generator | Secure & Private</p>
          <p className="text-xs mt-1">Monthly Rent: KES {MONTHLY_RENT.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}

export default ReceiptGenerator;