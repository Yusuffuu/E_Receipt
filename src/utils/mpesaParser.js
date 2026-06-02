// Handles multiple M-Pesa message formats
export function parseMPesaSMS(text) {
  let amount = null;
  let sender = null;
  let date = null;
  let time = null;
  let txnId = null;
  
  // Extract Transaction ID (first 10-12 characters at start of message)
  const txnIdRegex = /^([A-Z0-9]{10,12})\s/;
  const txnIdMatch = text.match(txnIdRegex);
  if (txnIdMatch) txnId = txnIdMatch[1];
  
  // Extract Amount - handles both KES and Ksh, with or without decimal
  const amountPatterns = [
    /Ksh([\d,]+\.?\d*)/i,
    /KES\s?([\d,]+\.?\d*)/i,
    /Ksh\s?([\d,]+\.?\d*)/i,
    /received\sKsh([\d,]+\.?\d*)/i,
    /received\sKES\s?([\d,]+\.?\d*)/i
  ];
  
  for (const pattern of amountPatterns) {
    const match = text.match(pattern);
    if (match) {
      amount = match[1].replace(/,/g, '');
      break;
    }
  }
  
  // Extract Sender - handles "from NAME" or "NAME sent you"
  const senderPatterns = [
    /from\s+([A-Za-z\s]+?)(?:\s+on|\s+\(|\d{4}|\s+via)/i,
    /received\s+from\s+([A-Za-z\s]+?)(?:\s+on|\s+via|$)/i,
    /([A-Za-z\s]+)\s+sent\s+you/i,
    /Confirmed\.You have received.*?from\s+([A-Za-z\s]+?)(?:\s+\d{4}|\s+on|\s+\d)/i
  ];
  
  for (const pattern of senderPatterns) {
    const match = text.match(pattern);
    if (match && match[1] && match[1].trim().length > 2) {
      sender = match[1].trim();
      // Clean up extra spaces
      sender = sender.replace(/\s+/g, ' ').trim();
      break;
    }
  }
  
  // If sender is still null, try to extract after "from" until a number or keyword
  if (!sender) {
    const fromMatch = text.match(/from\s+([A-Za-z\s]+?)(?:\s+\d|\s+on|\s+via)/);
    if (fromMatch) sender = fromMatch[1].trim();
  }
  
  // Extract Date - handles DD/MM/YY, DD/MM/YYYY, DD-MM-YY
  const datePatterns = [
    /on\s+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/,
    /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/
  ];
  
  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      date = match[1];
      // Convert 2-digit year to 4-digit if needed
      if (date && date.match(/\d{2}$/)) {
        const year = date.match(/\d{2}$/)[0];
        const fullYear = parseInt(year) < 30 ? `20${year}` : `19${year}`;
        date = date.replace(/\d{2}$/, fullYear);
      }
      break;
    }
  }
  
  // Extract Time
  const timePatterns = [
    /at\s+(\d{1,2}:\d{2}\s?(?:AM|PM)?)/i,
    /on\s+.*?\s+(\d{1,2}:\d{2}\s?(?:AM|PM)?)/i,
    /(\d{1,2}:\d{2}\s?(?:AM|PM))/i
  ];
  
  for (const pattern of timePatterns) {
    const match = text.match(pattern);
    if (match) {
      time = match[1];
      break;
    }
  }
  
  // If date is still null, use today's date
  if (!date) {
    const today = new Date();
    date = today.toLocaleDateString();
    time = time || today.toLocaleTimeString();
  }
  
  // Clean up sender name (remove phone numbers and extra text)
  if (sender) {
    sender = sender.replace(/\d{10,12}/g, '').trim();
    sender = sender.replace(/\s+/g, ' ').trim();
  }
  
  return {
    amount: amount || '',
    sender: sender || 'Customer',
    date: date,
    time: time || '',
    txnId: txnId || 'MANUAL-' + Date.now(),
    rawText: text
  };
}

// Test function for debugging
export function testParser() {
  const sampleSMS = "UF16G65RKV Confirmed.You have received Ksh450.00 from PHILOMENA WANJIKU KARANJA 0721***376 on 1/6/26 at 8:21 PM New M-PESA balance is Ksh772.74.";
  console.log(parseMPesaSMS(sampleSMS));
}
