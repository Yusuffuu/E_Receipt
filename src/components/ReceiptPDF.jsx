import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { logoBase64 } from '../logoBase64';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
  },
  // Header Section with Logo
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
  logo: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
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
  },
  receiptTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  // Info Box
  infoBox: {
    marginBottom: 25,
    border: 1,
    borderColor: '#dddddd',
    padding: 15,
    backgroundColor: '#fafafa',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 10,
    fontSize: 11,
  },
  infoLabel: {
    width: '35%',
    fontWeight: 'bold',
    color: '#555555',
  },
  infoValue: {
    width: '65%',
    color: '#000000',
  },
  // Payment Details Section
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 12,
    marginTop: 10,
    backgroundColor: '#f0f0f0',
    padding: 5,
    paddingLeft: 10,
  },
  paymentRow: {
    flexDirection: 'row',
    marginBottom: 8,
    fontSize: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
    paddingVertical: 6,
  },
  paymentLabel: {
    width: '35%',
    fontWeight: 'bold',
    color: '#555555',
  },
  paymentValue: {
    width: '65%',
    color: '#000000',
  },
  // Footer
  footer: {
    marginTop: 40,
    borderTopWidth: 1,
    borderTopColor: '#dddddd',
    paddingTop: 15,
    textAlign: 'center',
    fontSize: 9,
    color: '#888888',
  },
  footerText: {
    marginBottom: 4,
  },
  disclaimer: {
    marginTop: 20,
    fontSize: 8,
    color: '#999999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  amountHighlight: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
});

export function ReceiptPDF({ receipt }) {
  // Get current date and time for receipt generation
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

  // Format payment date nicely
  const formatPaymentDate = (dateStr, timeStr) => {
    if (dateStr && dateStr !== 'N/A') {
      return `${dateStr} ${timeStr || ''}`.trim();
    }
    return 'N/A';
  };

  // Format amount
  const formatAmount = (amount) => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) return amount;
    return `KES ${numAmount.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const currentDateTime = getCurrentDateTime();
  const paymentDateTime = formatPaymentDate(receipt.date, receipt.time);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header with Logo - Using embedded Base64 for reliability */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image src={logoBase64} style={styles.logo} />
          </View>
          <View style={styles.titleContainer}>
            <Text style={styles.businessName}>511 HOMES</Text>
            <Text style={styles.receiptTitle}>OFFICIAL RECEIPT</Text>
          </View>
        </View>

        {/* Customer Information Box */}
        <View style={styles.infoBox}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Name:</Text>
            <Text style={styles.infoValue}>{receipt.sender || 'Customer'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Receipt Date:</Text>
            <Text style={styles.infoValue}>{currentDateTime}</Text>
          </View>
        </View>

        {/* Payment Details Section */}
        <Text style={styles.sectionTitle}>Payment Details</Text>
        
        <View style={styles.paymentRow}>
          <Text style={styles.paymentLabel}>Payment Date:</Text>
          <Text style={styles.paymentValue}>{paymentDateTime}</Text>
        </View>
        
        <View style={styles.paymentRow}>
          <Text style={styles.paymentLabel}>Amount paid:</Text>
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
          <Text style={styles.paymentValue}>{receipt.description || 'Payment for goods/services'}</Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Document is generated digitally as receipt payment acknowledgment
          </Text>
          <Text style={styles.footerText}>
            & does not need any authorized signature.
          </Text>
        </View>
        
        <View style={styles.disclaimer}>
          <Text>Thank you for your payment</Text>
        </View>
      </Page>
    </Document>
  );
}

export default ReceiptPDF;
