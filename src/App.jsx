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
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const receipts = await getAllReceipts();
    setPastReceipts(receipts);
  };

  const handleParse = () => {
    if (!smsText.trim()) {
      alert('Please paste an M-Pesa SMS message');
      return;
    }
    const parsed = parseMPesaSMS(smsText);
    setReceiptData({
      amount: parsed.amount,
      sender: parsed.sender,
      date: parsed.date,
      time: parsed.time,
      txnId: parsed.txnId,
      description: ''
    });
  };

  const handleSaveReceipt = async () => {
    if (!receiptData.amount || !receiptData.sender) {
      alert('Please fill all required fields');
      return;
    }

    await saveReceipt(receiptData);
    await loadHistory();
    alert('Receipt saved successfully!');
    clearForm();
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this receipt?')) {
      await deleteReceipt(id);
      await loadHistory();
    }
  };

  const clearForm = () => {
    setSmsText('');
    setReceiptData({
      amount: '', sender: '', date: '', time: '', txnId: '', description: ''
    });
    setEditingId(null);
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold text-center mb-8">M-Pesa Receipt Generator</h1>
      
      <div className="flex gap-2 mb-6">
        <button 
          onClick={() => setShowHistory(false)}
          className={`px-4 py-2 rounded ${!showHistory ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          New Receipt
        </button>
        <button 
          onClick={() => { setShowHistory(true); loadHistory(); }}
          className={`px-4 py-2 rounded ${showHistory ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          History ({pastReceipts.length})
        </button>
      </div>

      {!showHistory ? (
        <div className="space-y-6">
          <div className="bg-gray-50 p-4 rounded">
            <label className="block font-bold mb-2">Paste M-Pesa SMS:</label>
            <textarea 
              className="w-full p-2 border rounded h-32"
              value={smsText}
              onChange={(e) => setSmsText(e.target.value)}
              placeholder="Paste the M-Pesa confirmation SMS here..."
            />
            <button 
              onClick={handleParse}
              className="mt-2 bg-green-600 text-white px-4 py-2 rounded"
            >
              Parse SMS
            </button>
          </div>

          <div className="border p-4 rounded shadow">
            <h2 className="text-xl font-bold mb-4">Receipt Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input 
                type="text" placeholder="Amount (KES)" 
                value={receiptData.amount}
                onChange={(e) => setReceiptData({...receiptData, amount: e.target.value})}
                className="p-2 border rounded"
              />
              <input 
                type="text" placeholder="Sender Name" 
                value={receiptData.sender}
                onChange={(e) => setReceiptData({...receiptData, sender: e.target.value})}
                className="p-2 border rounded"
              />
              <input 
                type="text" placeholder="Date" 
                value={receiptData.date}
                onChange={(e) => setReceiptData({...receiptData, date: e.target.value})}
                className="p-2 border rounded"
              />
              <input 
                type="text" placeholder="Time" 
                value={receiptData.time}
                onChange={(e) => setReceiptData({...receiptData, time: e.target.value})}
                className="p-2 border rounded"
              />
              <input 
                type="text" placeholder="Transaction ID" 
                value={receiptData.txnId}
                onChange={(e) => setReceiptData({...receiptData, txnId: e.target.value})}
                className="p-2 border rounded"
              />
              <input 
                type="text" placeholder="Item/Service Description" 
                value={receiptData.description}
                onChange={(e) => setReceiptData({...receiptData, description: e.target.value})}
                className="p-2 border rounded"
              />
            </div>

            <div className="flex gap-2 mt-4">
              <button 
                onClick={handleSaveReceipt}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Save Receipt
              </button>
              
              {receiptData.amount && (
                <PDFDownloadLink 
                  document={<ReceiptPDF receipt={{...receiptData, receiptNumber: 'PREVIEW'}} />} 
                  fileName={`receipt-${receiptData.txnId}.pdf`}
                >
                  {({ loading }) => (
                    <button className="bg-green-600 text-white px-4 py-2 rounded">
                      {loading ? 'Generating PDF...' : 'Download PDF'}
                    </button>
                  )}
                </PDFDownloadLink>
              )}
              
              <button onClick={clearForm} className="bg-gray-500 text-white px-4 py-2 rounded">
                Clear
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {pastReceipts.length === 0 ? (
            <p className="text-center text-gray-500">No receipts yet. Create your first one!</p>
          ) : (
            pastReceipts.map(receipt => (
              <div key={receipt.id} className="border p-3 rounded flex justify-between items-center">
                <div>
                  <p className="font-bold">{receipt.receiptNumber}</p>
                  <p className="text-sm">{receipt.date} - {receipt.sender} - KES {receipt.amount}</p>
                  <p className="text-xs text-gray-500">Txn: {receipt.txnId}</p>
                </div>
                <div className="flex gap-2">
                  <PDFDownloadLink 
                    document={<ReceiptPDF receipt={receipt} />} 
                    fileName={`receipt-${receipt.receiptNumber}.pdf`}
                  >
                    {({ loading }) => (
                      <button className="text-green-600">{loading ? '...' : 'PDF'}</button>
                    )}
                  </PDFDownloadLink>
                  <button 
                    onClick={() => handleDelete(receipt.id)}
                    className="text-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default App;
