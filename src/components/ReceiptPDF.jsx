import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 12, fontFamily: 'Helvetica' },
  header: { marginBottom: 20, textAlign: 'center' },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  subtitle: { fontSize: 10, color: '#666', marginBottom: 5 },
  divider: { borderBottom: 1, marginVertical: 10 },
  row: { flexDirection: 'row', marginVertical: 5 },
  label: { width: '30%', fontWeight: 'bold' },
  value: { width: '70%' },
  footer: { marginTop: 30, textAlign: 'center', fontSize: 10, color: '#999' }
});

export function ReceiptPDF({ receipt }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>OFFICIAL RECEIPT</Text>
          <Text style={styles.subtitle}>Mobile Money Payment</Text>
          <Text>Receipt No: {receipt.receiptNumber}</Text>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.row}>
          <Text style={styles.label}>Date:</Text>
          <Text style={styles.value}>{receipt.date} {receipt.time}</Text>
        </View>
        
        <View style={styles.row}>
          <Text style={styles.label}>Received From:</Text>
          <Text style={styles.value}>{receipt.sender}</Text>
        </View>
        
        <View style={styles.row}>
          <Text style={styles.label}>Amount:</Text>
          <Text style={styles.value}>KES {parseFloat(receipt.amount).toLocaleString()}</Text>
        </View>
        
        <View style={styles.row}>
          <Text style={styles.label}>Payment Method:</Text>
          <Text style={styles.value}>M-Pesa</Text>
        </View>
        
        <View style={styles.row}>
          <Text style={styles.label}>Transaction ID:</Text>
          <Text style={styles.value}>{receipt.txnId}</Text>
        </View>
        
        <View style={styles.row}>
          <Text style={styles.label}>Item/Service:</Text>
          <Text style={styles.value}>{receipt.description || 'Payment for goods/services'}</Text>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.footer}>
          <Text>Thank you for your payment</Text>
          <Text>This is a computer-generated receipt</Text>
        </View>
      </Page>
    </Document>
  );
}