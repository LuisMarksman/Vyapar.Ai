function NewInvoiceModal({ open, onClose, skus, onSave, pushToast }) {
  const [form, setForm] = useState({ customer:'', date: toISODate(), gst:true, items:[] });

  useEffect(() => {
    if(open) {
      const availableSkus = skus.filter(s => s.stock > 0);
      setForm({
        customer:'',
        date: toISODate(),
        gst:true,
        items: availableSkus.length > 0 ? [{ skuId: availableSkus[0]?.id, qty:1, rate:availableSkus[0]?.price }] : []
      });
    }
  }, [open, skus]);

  const updateItem = (i, p) => setForm(f => ({...f, items: f.items.map((x,idx)=>idx===i ? {...x, ...p} : x)}));
  const subtotal = form.items.reduce((s, i) => s + (Number(i.qty || 0) * Number(i.rate || 0)), 0);
  const tax = form.gst ? subtotal * 0.18 : 0;

  const handleSave = () => {
    if(!form.customer) return pushToast({title:'Missing details', message:'Please enter customer name.', variant:'error'});
    const invalid = form.items.find(i => {
      const sku = skus.find(s=>s.id===i.skuId);
      return !sku || Number(i.qty || 0) > sku.stock;
    });
    if(invalid) {
      const sku = skus.find(s=>s.id===invalid.skuId);
      return pushToast({title:'Stock Error', message: `Insufficient stock for ${sku?.name || 'item'}. Only ${sku?.stock || 0} available.`, variant:'error'});
    }
    if(form.items.length === 0) return pushToast({title:'No Items', message:'Please add at least one item to the invoice.', variant:'error'});
    onSave({ ...form, totals: { subtotal, tax, total: subtotal + tax } });
  };

  const availableSkus = skus.filter(s => s.stock > 0);

  return (
    <Modal open={open} onClose={onClose} title="Create New Invoice" footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button variant="primary" onClick={handleSave}>Create Invoice</Button></>}>
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs mb-1 block text-neutral-500">Customer Name</label>
            <Input value={form.customer} onChange={e=>setForm(f=>({...f, customer:e.target.value}))} placeholder="Enter name" />
          </div>
          <div>
            <label className="text-xs mb-1 block text-neutral-500">Invoice Date</label>
            <Input type="date" value={form.date} onChange={e=>setForm(f=>({...f, date:e.target.value}))} />
          </div>
        </div>
        <div>
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-medium">Items</h4>
            <Button variant="ghost" className="text-xs" onClick={()=>setForm(f=>({...f, items:[...f.items, {skuId:availableSkus[0]?.id, qty:1, rate:availableSkus[0]?.price}]}))} disabled={availableSkus.length === 0}>+ Add Item</Button>
          </div>
          {availableSkus.length === 0 && <p className="text-sm text-red-600">You are out of stock of all items. Add stock in the Inventory tab first.</p>}
          <div className="space-y-2 max-h-[30vh] overflow-y-auto pr-1">
            {form.items.map((item, idx) => (
              <div key={idx} className="flex gap-2 items-end p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg border border-neutral-100 dark:border-neutral-800">
                <div className="flex-1">
                  <label className="text-xs mb-1 block text-neutral-500">SKU</label>
                  <Select value={item.skuId} onChange={e => {
                    const newSku = skus.find(s=>s.id===e.target.value);
                    updateItem(idx, {skuId: newSku?.id, rate: newSku?.price || 0})
                  }}>
                    {availableSkus.map(s=><option key={s.id} value={s.id}>{s.name} (Stk: {s.stock})</option>)}
                  </Select>
                </div>
                <div className="w-20">
                  <label className="text-xs mb-1 block text-neutral-500">Qty</label>
                  <Input type="number" min={1} value={item.qty} onChange={e=>updateItem(idx, {qty:e.target.value})} />
                </div>
                <div className="w-24">
                  <label className="text-xs mb-1 block text-neutral-500">Rate</label>
                  <Input type="number" min={0} value={item.rate} onChange={e=>updateItem(idx, {rate:e.target.value})} />
                </div>
                <button onClick={()=>setForm(f=>({...f, items:f.items.filter((_,i)=>i!==idx)}))} className="p-2 text-red-500 hover:bg-red-50 rounded">✕</button>
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-between items-center pt-4 border-t dark:border-neutral-800">
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.gst} onChange={e=>setForm(f=>({...f, gst:e.target.checked}))} /> Apply 18% GST</label>
          <div className="text-right">
            <div className="text-sm text-neutral-500">Subtotal: {currency(subtotal)}</div>
            <div className="text-sm text-neutral-500">Tax: {currency(tax)}</div>
            <div className="text-xl font-bold mt-1">{currency(subtotal+tax)}</div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
