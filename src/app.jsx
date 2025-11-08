const NAV = [
  { id:'dashboard', label:'Dashboard', icon:'📊' },
  { id:'sales', label:'Sales', icon:'📈' },
  { id:'invoices', label:'Invoices', icon:'📄' },
  { id:'inventory', label:'Inventory', icon:'📦' },
  { id:'receipts', label:'Receipts', icon:'🧾' },
  { id:'gov', label:'GovConnect', icon:'🏛️' },
  { id:'chat', label:'AI Advisor', icon:'✨' },
];

function App() {
  const [authed, setAuthed] = useState(null);
  const [tab, setTab] = useState('dashboard');
  const [dark, setDark] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);

  const [invoices, setInvoices] = useState(demoInvoices);
  const [skus, setSkus] = useState(demoSKUs);
  const [receipts, setReceipts] = useState(demoReceipts);

  const pushToast = (t) => setToasts(prev => [...prev, { id: Math.random().toString(), ...t }]);

  useHotkey('n', () => { if(authed) setModalOpen(true); });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  const handleSaveInvoice = (data) => {
    const newInv = {
      id: `INV-${invoices.length + 101}`,
      number: `INV-00${invoices.length + 1}`,
      customer: data.customer,
      date: data.date,
      total: data.totals.total,
      status: 'Sent',
      pdfUrl: '#',
      items: data.items
    };
    setInvoices(prev => [newInv, ...prev]);

    const newSkus = [...skus];
    data.items.forEach(item => {
      const s = newSkus.find(x => x.id === item.skuId);
      if(s) s.stock -= Number(item.qty || 0);
    });
    setSkus(newSkus);

    setModalOpen(false);
    pushToast({ title: 'Invoice Created', message: `${newInv.number} for ${currency(newInv.total)} created successfully.`, variant: 'success' });
  };

  const handleUploadReceipt = async (file) => {
    if (!file) return;
    pushToast({ title: 'Uploading...', message: 'Parsing your receipt...' });
    try {
      await new Promise(res => setTimeout(res, 1500));
      const mockResult = {
        id: `RCPT-00${receipts.length + 2}`,
        vendor: 'Demo Vendor',
        date: toISODate(),
        amount: Math.round(Math.random() * 5000 + 200),
        confidence: 0.91
      };
      setReceipts(prev => [mockResult, ...prev]);
      pushToast({ title: 'Receipt Added', message: `${mockResult.vendor} for ${currency(mockResult.amount)}`, variant: 'success' });
    } catch (err) {
      pushToast({ title: 'Upload Failed', message: err.message, variant: 'error' });
    }
  };

  const renderTabContent = () => {
    switch(tab) {
      case 'dashboard':
        return <Dashboard invoices={invoices} skus={skus} onQuick={(t) => { if(t==='new-invoice') setModalOpen(true); else setTab(t); }} />;
      case 'sales':
        return <Sales invoices={invoices} skus={skus} />;
      case 'invoices':
        return <Invoices data={invoices} onCreate={()=>setModalOpen(true)} onResend={(i)=>pushToast({title:'Sent', message:`Invoice ${i.number} resent to customer.`, variant:'success'})} />;
      case 'inventory':
        return <Inventory skus={skus} setSkus={setSkus} pushToast={pushToast} />;
      case 'receipts':
        return <Receipts receipts={receipts} onUpload={handleUploadReceipt} />;
      case 'gov':
        return <GovConnect schemes={demoSchemes} />;
      case 'chat':
        return <Chat onAction={(a) => { if(a==='new-invoice') setModalOpen(true); }} />;
      default:
        return <Dashboard invoices={invoices} skus={skus} onQuick={(t) => { if(t==='new-invoice') setModalOpen(true); else setTab(t); }} />;
    }
  };

  if (!authed) {
    return (<><Onboarding onComplete={setAuthed} pushToast={pushToast} /><Toast toasts={toasts} setToasts={setToasts} /></>);
  }

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 md:flex">
      <aside className="hidden md:flex flex-col w-64 border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4">
        <div className="font-bold text-xl px-4 mb-8 text-blue-600 dark:text-blue-400 flex items-center gap-2">
          <span>🚀</span> BizMind
        </div>
        <nav className="space-y-1 flex-1">
          {NAV.map(n => (
            <button key={n.id} onClick={() => setTab(n.id)} className={classNames('w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all', tab === n.id ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800')}>
              <span className="text-lg">{n.icon}</span> {n.label}
            </button>
          ))}
        </nav>
        <div className="p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl border border-neutral-100 dark:border-neutral-800">
          <div className="text-xs font-medium text-neutral-500 mb-1">Logged in as</div>
          <div className="font-semibold truncate">{authed.user.businessName}</div>
          <button onClick={() => setAuthed(null)} className="text-xs text-blue-600 hover:underline mt-1">Sign Out</button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur flex items-center justify-between px-4 md:px-6 shrink-0">
          <div className="md:hidden font-bold text-blue-600">BizMind</div>
          <h1 className="text-lg font-semibold hidden md:block">{NAV.find(n=>n.id===tab)?.label}</h1>
          <div className="flex items-center gap-3">
            {authed.demo && <Badge className="bg-amber-100 text-amber-800 border-amber-300">Demo Mode</Badge>}
            <button onClick={() => setDark(!dark)} className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800" title="Toggle Theme">
              {dark ? '🌞' : '🌙'}
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-5xl mx-auto h-full">
            {renderTabContent()}
          </div>
        </div>

        <div className="md:hidden border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex justify-around p-2 shrink-0">
          {NAV.map(n => (
            <button key={n.id} onClick={() => setTab(n.id)} className={classNames('flex flex-col items-center p-2 rounded-lg w-1/5', tab === n.id ? 'text-blue-600 dark:text-blue-400' : 'text-neutral-500')}>
              <span className="text-xl">{n.icon}</span>
              <span className="text-[10px] font-medium">{n.label}</span>
            </button>
          ))}
        </div>
      </main>

      <NewInvoiceModal open={modalOpen} onClose={() => setModalOpen(false)} skus={skus} pushToast={pushToast} onSave={handleSaveInvoice} />
      <Toast toasts={toasts} setToasts={setToasts} />
    </div>
  );
}

// Mount
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
