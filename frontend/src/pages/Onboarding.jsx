function Onboarding({ onComplete, pushToast }) {
  const [form, setForm] = useState({ phone:'', businessName:'', businessType:'Manufacturing', turnover:'₹0–20L', employees:1, demo:true });

  const submit = async (e) => {
    e.preventDefault();
    try {
      onComplete({ user: demoUser, demo: form.demo });
    } catch (err) {
      pushToast({ title:'Error', message: err.message, variant:'error' });
    }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-neutral-50 dark:bg-neutral-950 p-4">
      <form onSubmit={submit} className="w-full max-w-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xl p-6 md:p-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">BizMind</h1>
          <p className="text-neutral-600 dark:text-neutral-400">Intelligent dashboard for modern MSMEs</p>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium ml-1 mb-1 block text-neutral-500">Phone Number</label>
            <Input required={!form.demo} value={form.phone} onChange={e=>setForm(f=>({...f, phone:e.target.value}))} placeholder="+91 98765 43210" />
          </div>
          <div>
            <label className="text-xs font-medium ml-1 mb-1 block text-neutral-500">Business Name</label>
            <Input required value={form.businessName} onChange={e=>setForm(f=>({...f, businessName:e.target.value}))} placeholder="e.g. Annapurna Foods" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium ml-1 mb-1 block text-neutral-500">Type</label>
              <Select value={form.businessType} onChange={e=>setForm(f=>({...f, businessType:e.target.value}))}>
                {['Manufacturing','Trading','Service'].map(o=><option key={o}>{o}</option>)}
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium ml-1 mb-1 block text-neutral-500">Turnover</label>
              <Select value={form.turnover} onChange={e=>setForm(f=>({...f, turnover:e.target.value}))}>
                {['₹0–20L','₹20–50L','₹50L–1Cr','₹1Cr+'].map(o=><option key={o}>{o}</option>)}
              </Select>
            </div>
          </div>
          <label className="flex items-center gap-3 p-3 rounded-lg border border-blue-100 dark:border-blue-900/30 bg-blue-50/50 dark:bg-blue-900/10 cursor-pointer">
            <input type="checkbox" checked={form.demo} onChange={e=>setForm(f=>({...f, demo:e.target.checked}))} className="rounded text-blue-600 focus:ring-blue-500" />
            <span className="text-sm font-medium">Use Demo Mode (Offline data)</span>
          </label>
        </div>
        <Button type="submit" variant="primary" className="w-full mt-8 py-2.5">Get Started</Button>
      </form>
    </div>
  );
}
