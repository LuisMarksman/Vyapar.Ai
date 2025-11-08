/* Demo data */
const demoUser = { id: 'demo-uid-001', phone: '+91 99999 99999', businessName: 'Annapurna Foods', businessType: 'Manufacturing', turnoverBracket: '₹20–50L', employees: 8 };

const demoSKUs = [
  { id: 'SKU-101', name: 'Masala Mix 500g', category: 'Spices', stock: 42, cost: 95, price: 149, reorder: 15 },
  { id: 'SKU-102', name: 'Healthy Atta 1kg', category: 'Flour', stock: 18, cost: 45, price: 79, reorder: 20 },
  { id: 'SKU-103', name: 'Cold Pressed Oil 1L', category: 'Oils', stock: 7, cost: 210, price: 299, reorder: 10 },
  { id: 'SKU-104', name: 'Turmeric Powder 200g', category: 'Spices', stock: 55, cost: 40, price: 65, reorder: 20 },
  { id: 'SKU-105', name: 'Besan 500g', category: 'Flour', stock: 25, cost: 50, price: 89, reorder: 15 },
];

const demoInvoices = [
  { id: 'INV-001', number: 'INV-001', customer: 'Raghav Traders', date: d(3), total: 4500, status: 'Sent', pdfUrl: '#', items: [{ skuId: 'SKU-101', qty: 10 }, { skuId: 'SKU-104', qty: 20 }] },
  { id: 'INV-002', number: 'INV-002', customer: 'Priya Retail', date: d(5), total: 8100, status: 'Paid', pdfUrl: '#', items: [{ skuId: 'SKU-103', qty: 20 }, { skuId: 'SKU-102', qty: 15 }] },
  { id: 'INV-003', number: 'INV-003', customer: 'City Supermart', date: d(12), total: 2120, status: 'Draft', pdfUrl: '#', items: [{ skuId: 'SKU-105', qty: 10 }] },
  { id: 'INV-004', number: 'INV-004', customer: 'GreenKart', date: d(35), total: 12500, status: 'Sent', pdfUrl: '#', items: [{ skuId: 'SKU-101', qty: 50 }, { skuId: 'SKU-104', qty: 30 }] },
  { id: 'INV-005', number: 'INV-005', customer: 'Nandini Stores', date: d(40), total: 3650, status: 'Paid', pdfUrl: '#', items: [{ skuId: 'SKU-102', qty: 20 }, { skuId: 'SKU-105', qty: 10 }] },
  { id: 'INV-006', number: 'INV-006', customer: 'New Traders', date: d(3), total: 2800, status: 'Sent', pdfUrl: '#', items: [{ skuId: 'SKU-102', qty: 35 }] },
  { id: 'INV-007', number: 'INV-007', customer: 'Priya Retail', date: d(10), total: 6100, status: 'Paid', pdfUrl: '#', items: [{ skuId: 'SKU-103', qty: 10 }, { skuId: 'SKU-101', qty: 10 }] },
  { id: 'INV-008', number: 'INV-008', customer: 'GreenKart', date: d(32), total: 7500, status: 'Sent', pdfUrl: '#', items: [{ skuId: 'SKU-101', qty: 50 }] },
  { id: 'INV-009', number: 'INV-009', customer: 'City Supermart', date: d(55), total: 1900, status: 'Paid', pdfUrl: '#', items: [{ skuId: 'SKU-105', qty: 15 }] },
  { id: 'INV-010', number: 'INV-010', customer: 'Raghav Traders', date: d(61), total: 4200, status: 'Sent', pdfUrl: '#', items: [{ skuId: 'SKU-104', qty: 40 }] },
];

const demoReceipts = [
  { id: 'RCPT-001', vendor: 'Shyam Packaging', date: toISODate(), amount: 1250, confidence: 0.92 },
  { id: 'RCPT-002', vendor: 'JK Transport', date: toISODate(), amount: 850, confidence: 0.88 }
];

const demoSchemes = [
  { id: 'SCH-01', name: 'MSME Credit Guarantee', score: 0.92, reason: 'Turnover & employee count match.', docs: ['PAN', 'Udyam', 'Bank Statement'], description: 'Collateral-free loans for eligible MSMEs.' },
  { id: 'SCH-02', name: 'Manufacturing Subsidy 2.0', score: 0.84, reason: 'Manufacturing category with >5 employees.', docs: ['GST', 'Incorporation'], description: 'Capital subsidy for plant & machinery.' }
];
