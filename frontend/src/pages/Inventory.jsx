function Inventory({ skus, setSkus, pushToast }) {
  const [draft, setDraft] = useState({ name: '', category: '', stock: '', cost: '', price: '', reorder: '10' });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isEditing, setIsEditing] = useState(false);

  const add = () => {
    if (!draft.name || !draft.stock || !draft.price) {
      pushToast({ title: 'Missing Fields', message: 'Please enter at least Name, Stock, and Price.', variant: 'error' });
      return;
    }
    const newSKU = {
      id: `SKU-${Math.floor(Math.random() * 9000) + 1000}`,
      name: draft.name,
      category: draft.category || 'Uncategorized',
      stock: Number(draft.stock),
      cost: Number(draft.cost) || 0,
      price: Number(draft.price),
      reorder: Number(draft.reorder) || 5,
    };
    setSkus(s => [newSKU, ...s]);
    setDraft({ name: '', category: '', stock: '', cost: '', price: '', reorder: '10' });
    pushToast({ title: 'SKU Added', message: `${newSKU.name} added to inventory.`, variant: 'success' });
  };

  const updateSKU = (id, field, value) => {
    setSkus(currentSKUs =>
      currentSKUs.map(sku =>
        sku.id === id ? { ...sku, [field]: value } : sku
      )
    );
  };

  const handleNumberChange = (id, field, value) => {
    const num = value === '' ? '' : parseFloat(value);
    if (value === '' || (!isNaN(num) && num >= 0)) {
      updateSKU(id, field, num);
    }
  };

  const deleteSKU = (id) => {
    setSkus(currentSKUs => currentSKUs.filter(sku => sku.id !== id));
    pushToast({ title: 'SKU Removed', message: 'Item removed from inventory.' });
  };

  const categories = useMemo(() => {
    const cats = new Set(skus.map(s => s.category));
    return ['all', ...Array.from(cats).sort()];
  }, [skus]);

  const filteredAndSortedSkus = useMemo(() => {
    return skus
      .filter(sku => {
        const categoryMatch = selectedCategory === 'all' || sku.category === selectedCategory;
        const searchMatch = !searchTerm || sku.name.toLowerCase().includes(searchTerm.toLowerCase());
        return categoryMatch && searchMatch;
      })
      .sort((a, b) => {
        if (a.category < b.category) return -1;
        if (a.category > b.category) return 1;
        if (a.name < b.name) return -1;
        if (a.name > b.name) return 1;
        return 0;
      });
  }, [skus, searchTerm, selectedCategory]);

  const handleSave = () => {
    setIsEditing(false);
    pushToast({ title: 'Inventory Saved', message: 'Your changes have been saved.', variant: 'success' });
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {isEditing && (
        <Card>
          <h3 className="font-medium mb-3">Add New Product</h3>
          <div className="grid grid-cols-1 md:grid-cols-7 gap-3 items-end">
            <div className="md:col-span-2"><label className="text-xs font-medium text-neutral-500">Name</label><Input placeholder="Product Name" value={draft.name} onChange={e => setDraft(d => ({ ...d, name: e.target.value }))} /></div>
            <div><label className="text-xs font-medium text-neutral-500">Category</label><Input placeholder="e.g. Spices" value={draft.category} onChange={e => setDraft(d => ({ ...d, category: e.target.value }))} /></div>
            <div><label className="text-xs font-medium text-neutral-500">Stock</label><Input type="number" placeholder="0" value={draft.stock} onChange={e => setDraft(d => ({ ...d, stock: e.target.value }))} /></div>
            <div><label className="text-xs font-medium text-neutral-500">Cost</label><Input type="number" placeholder="0.00" value={draft.cost} onChange={e => setDraft(d => ({ ...d, cost: e.target.value }))} /></div>
            <div><label className="text-xs font-medium text-neutral-500">Price</label><Input type="number" placeholder="0.00" value={draft.price} onChange={e => setDraft(d => ({ ...d, price: e.target.value }))} /></div>
            <Button variant="primary" onClick={add} className="h-10">Add SKU</Button>
          </div>
        </Card>
      )}

      <Card>
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1">
            <label className="text-xs font-medium text-neutral-500">Search by Name</label>
            <Input placeholder="Search products..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} disabled={isEditing} />
          </div>
          <div className="md:w-1/3">
            <label className="text-xs font-medium text-neutral-500">Filter by Category</label>
            <Select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} disabled={isEditing}>
              {categories.map(cat => (<option key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat}</option>))}
            </Select>
          </div>
          <div className="flex items-end gap-2">
            {isEditing ? (
              <Button variant="primary" className="bg-emerald-600 hover:bg-emerald-700 text-white h-10" onClick={handleSave}>Save Changes</Button>
            ) : (
              <Button variant="outline" className="h-10" onClick={() => setIsEditing(true)}>Edit Inventory</Button>
            )}
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden p-0 md:p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-neutral-50 dark:bg-neutral-800/50 text-neutral-500 border-b border-neutral-200 dark:border-neutral-800">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Stock</th>
                <th className="px-4 py-3 font-medium">Cost (₹)</th>
                <th className="px-4 py-3 font-medium">Price (₹)</th>
                <th className="px-4 py-3 font-medium">Reorder At</th>
                {isEditing && <th className="px-4 py-3 font-medium">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {filteredAndSortedSkus.map(s => (
                <tr key={s.id} className={classNames(s.stock <= s.reorder ? 'bg-red-50/50 dark:bg-red-900/10' : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/30')}>
                  <td className="px-4 py-2">
                    {isEditing ? (
                      <input type="text" value={s.name} onChange={e => updateSKU(s.id, 'name', e.target.value)} className="table-input" />
                    ) : (<span className="table-text font-medium">{s.name}</span>)}
                  </td>
                  <td className="px-4 py-2 w-36">
                    {isEditing ? (
                      <input type="text" value={s.category} onChange={e => updateSKU(s.id, 'category', e.target.value)} className="table-input" />
                    ) : (<span className="table-text text-neutral-600 dark:text-neutral-400">{s.category}</span>)}
                  </td>
                  <td className="px-4 py-2 w-24">
                    {isEditing ? (
                      <input type="number" value={s.stock} onChange={e => handleNumberChange(s.id, 'stock', e.target.value)} className="table-input" />
                    ) : (<span className="table-text">{s.stock}</span>)}
                  </td>
                  <td className="px-4 py-2 w-28">
                    {isEditing ? (
                      <input type="number" value={s.cost} onChange={e => handleNumberChange(s.id, 'cost', e.target.value)} className="table-input" />
                    ) : (<span className="table-text">{currency(s.cost)}</span>)}
                  </td>
                  <td className="px-4 py-2 w-28">
                    {isEditing ? (
                      <input type="number" value={s.price} onChange={e => handleNumberChange(s.id, 'price', e.target.value)} className="table-input" />
                    ) : (<span className="table-text">{currency(s.price)}</span>)}
                  </td>
                  <td className="px-4 py-2 w-28">
                    {isEditing ? (
                      <input type="number" value={s.reorder} onChange={e => handleNumberChange(s.id, 'reorder', e.target.value)} className="table-input" />
                    ) : (<span className="table-text">{s.reorder}</span>)}
                  </td>
                  {isEditing && (
                    <td className="px-4 py-2 w-24">
                      <Button variant="outline" className="text-red-600 border-red-300 dark:border-red-700/50 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={() => deleteSKU(s.id)}>Delete</Button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {filteredAndSortedSkus.length === 0 && (
            <div className="p-4 text-center text-sm text-neutral-500">No products match your search.</div>
          )}
        </div>
      </Card>
    </div>
  );
}
