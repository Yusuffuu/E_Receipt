import Dexie from 'dexie';

export const db = new Dexie('MpesaReceiptsDB');
db.version(1).stores({
  receipts: '++id, receiptNumber, date, amount, sender, txnId, createdAt'
});

export async function saveReceipt(receiptData) {
  const receipt = {
    ...receiptData,
    receiptNumber: generateReceiptNumber(),
    createdAt: new Date().toISOString()
  };
  
  const id = await db.receipts.add(receipt);
  return { ...receipt, id };
}

export async function getAllReceipts() {
  return await db.receipts.orderBy('createdAt').reverse().toArray();
}

export async function getReceipt(id) {
  return await db.receipts.get(id);
}

export async function deleteReceipt(id) {
  return await db.receipts.delete(id);
}

export async function updateReceipt(id, data) {
  return await db.receipts.update(id, data);
}

function generateReceiptNumber() {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `RCP-${year}${month}-${random}`;
}