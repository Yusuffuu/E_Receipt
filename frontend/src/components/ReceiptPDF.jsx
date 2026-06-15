import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { HouseLogo } from './Logo';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottom: 2,
    borderBottomColor: '#000000',
    paddingBottom: 15,
  },
  logoContainer: {
    width: 80,
    height: 80,
  },
  titleContainer: {
    flex: 1,
    textAlign: 'right',
  },
  businessName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
    letterSpacing: 1,
    color: '#1a1a1a',
  },
  receiptTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  infoBox: {
    marginBottom: 20,
    border: 1,
    borderColor: '#dddddd',
    padding: 12,
    backgroundColor: '#fafafa',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
    fontSize: 10,
  },
  infoLabel: {
    width: '30%',
    fontWeight: 'bold',
    color: '#555555',
  },
  infoValue: {
    width: '70%',
    color: '#000000',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 5,
    backgroundColor: '#f0f0f0',
    padding: 4,
    paddingLeft: 8,
  },
  paymentRow: {
    flexDirection: 'row',
    marginBottom: 6,
    fontSize: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
    paddingVertical: 4,
  },
  paymentLabel: {
    width: '30%',
    fontWeight: 'bold',
    color: '#555555',
  },
  paymentValue: {
    width: '70%',
    color: '#000000',
  },
  balanceBox: {
    marginTop: 10,
    padding: 8,
    backgroundColor: '#f0f8ff',
    border: 1,
    borderColor: '#87ceeb',
    borderRadius: 4,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
    fontSize: 9,
  },
  balanceLabel: {
    fontWeight: 'bold',
    color: '#555555',
  },
  balanceValue: {
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  footer: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#dddddd',
    paddingTop: 10,
    textAlign: 'center',
    fontSize: 8,
    color: '#888888',
  },
  footerText: {
    marginBottom: 2,
  },
  disclaimer: {
    marginTop: 15,
    fontSize: 7,
    color: '#999999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  amountHighlight: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  thankYou: {
    marginTop: 15,
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#2e7d32',
  },
});

export function ReceiptPDF({ receipt, monthlyRent = 2000 }) {
  const getCurrentDateTime = () => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const timeStr = `${hours}:${minutes} ${ampm}`;
    return `${day}/${month}/${year} ${timeStr}`;
  };

  const formatPaymentDate = (dateStr, timeStr) => {
    if (dateStr && dateStr !== 'N/A') {
      return `${dateStr} ${timeStr || ''}`.trim();
    }
    return 'N/A';
  };

  const formatAmount = (amount) => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) return 'KES 0.00';
    return `KES ${numAmount.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const currentDateTime = getCurrentDateTime();
  const paymentDateTime = formatPaymentDate(receipt.date, receipt.time);
  const previousBalance = parseFloat(receipt.previousBalance) || 0;
  const amountPaid = parseFloat(receipt.amount) || 0;
  const totalDue = previousBalance + monthlyRent;
  const currentBalance = parseFloat(receipt.currentBalance) || (totalDue - amountPaid);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <HouseLogo size={70} />
          </View>
          <View style={styles.titleContainer}>
            <Text style={styles.businessName}>511 HOMES</Text>
            <Text style={styles.receiptTitle}>OFFICIAL RECEIPT</Text>
          </View>
        </View>

        <View style={styles.infoBox}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Name:</Text>
            <Text style={styles.infoValue}>{receipt.sender || 'Customer'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>House Number:</Text>
            <Text style={styles.infoValue}>{receipt.houseNumber || 'N/A'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Receipt Date:</Text>
            <Text style={styles.infoValue}>{currentDateTime}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Payment Details</Text>
        
        <View style={styles.paymentRow}>
          <Text style={styles.paymentLabel}>Payment Date:</Text>
          <Text style={styles.paymentValue}>{paymentDateTime}</Text>
        </View>
        
        <View style={styles.paymentRow}>
          <Text style={styles.paymentLabel}>Paid For Month:</Text>
          <Text style={styles.paymentValue}>{receipt.paidForMonth || 'N/A'}</Text>
        </View>
        
        <View style={styles.paymentRow}>
          <Text style={styles.paymentLabel}>Amount Paid:</Text>
          <Text style={[styles.paymentValue, styles.amountHighlight]}>{formatAmount(receipt.amount)}</Text>
        </View>
        
        <View style={styles.paymentRow}>
          <Text style={styles.paymentLabel}>Payment Mode:</Text>
          <Text style={styles.paymentValue}>M-Pesa</Text>
        </View>
        
        <View style={styles.paymentRow}>
          <Text style={styles.paymentLabel}>Transaction ID:</Text>
          <Text style={styles.paymentValue}>{receipt.txnId || 'N/A'}</Text>
        </View>
        
        <View style={styles.paymentRow}>
          <Text style={styles.paymentLabel}>Details:</Text>
          <Text style={styles.paymentValue}>{receipt.description || 'Payment for rent'}</Text>
        </View>

        {/* Rent Balance Summary */}
        <Text style={styles.sectionTitle}>Rent Balance Summary</Text>
        
        <View style={styles.balanceBox}>
          <View style={styles.balanceRow}>
            <Text style={styles.balanceLabel}>Monthly Rent:</Text>
            <Text style={styles.balanceValue}>{formatAmount(monthlyRent)}</Text>
          </View>
          <View style={styles.balanceRow}>
            <Text style={styles.balanceLabel}>Previous Balance:</Text>
            <Text style={styles.balanceValue}>{formatAmount(previousBalance)}</Text>
          </View>
          <View style={styles.balanceRow}>
            <Text style={styles.balanceLabel}>Total Due:</Text>
            <Text style={styles.balanceValue}>{formatAmount(totalDue)}</Text>
          </View>
          <View style={styles.balanceRow}>
            <Text style={styles.balanceLabel}>Amount Paid:</Text>
            <Text style={styles.balanceValue}>{formatAmount(amountPaid)}</Text>
          </View>
          <View style={[styles.balanceRow, { marginTop: 5, borderTopWidth: 1, borderTopColor: '#87ceeb', paddingTop: 4 }]}>
            <Text style={[styles.balanceLabel, { fontSize: 10 }]}>Current Balance:</Text>
            <Text style={[styles.balanceValue, { fontSize: 10, color: currentBalance > 0 ? '#d32f2f' : '#2e7d32' }]}>
              {formatAmount(currentBalance)}
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Document is generated digitally as receipt payment acknowledgment
          </Text>
          <Text style={styles.footerText}>
            & does not need any authorized signature.
          </Text>
        </View>
        
        <View style={styles.thankYou}>
          <Text>Thank you for your payment</Text>
        </View>
      </Page>
    </Document>
  );
}

export default ReceiptPDF;
