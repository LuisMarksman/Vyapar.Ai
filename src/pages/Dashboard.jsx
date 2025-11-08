function Dashboard({ invoices, skus, onQuick }) {
  const revenue = useMemo(()=> invoices.reduce((s,i)=> s + (i.total||0), 0), [invoices]);
  const topSKU = useMemo(()=> [...skus].sort((a,b)=> (b.price-b.cost)-(a.price-a.cost))[0], [skus]);
  const lowStock = skus.filter(s=> s.stock <= s.reorder).length;

  return (
    <div className="space-y-6 animate-in">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-neutral-900">
          <div className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-1">Total Revenue</div>
          <div className="text-3xl font-bold">{currency(revenue)}</div>
          <div className="text-xs text-neutral-500 mt-2">
            <a href="#sales" onClick={(e) => { e.preventDefault(); onQuick('sales'); }} className="text-blue-600 hover:underline">View detailed report →</a>
          </div>
        </Card>
        <Card>
          <div className="text-sm text-neutral-500 font-medium mb-1">Top Margin SKU</div>
          <div className="text-2xl font-semibold truncate" title={topSKU?.name}>{topSKU?.name || '—'}</div>
          {topSKU && <div className="text-xs text-emerald-600 mt-2">Margin: {currency(topSKU.price - topSKU.cost)}/unit</div>}
        </Card>
        <Card className={lowStock > 0 ? 'border-red-500/20 bg-red-50/50 dark:bg-red-900/10' : ''}>
          <div className="text-sm text-neutral-500 font-medium mb-1">Low Stock Alerts</div>
          <div className={classNames('text-3xl font-bold', lowStock>0 ? 'text-red-600 dark:text-red-400' : 'text-neutral-900 dark:text-white')}>{lowStock}</div>
          <div className="text-xs text-neutral-500 mt-2">{lowStock > 0 ? 'Requires attention' : 'Everything looks good'}</div>
        </Card>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { id:'new-invoice', label:'New Invoice', icon:'📄', color:'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' },
            { id:'receipts', label:'Upload Receipt', icon:'📸', color:'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' },
            { id:'gov', label:'Gov Schemes', icon:'🏛️', color:'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400' },
            { id:'chat', label:'Ask AI Advisor', icon:'🤖', color:'bg-violet-50 text-violet-700 dark:bg-violet-900/20 dark:text-violet-400' }
          ].map(action => (
            <button key={action.id} onClick={()=>onQuick(action.id)} className={classNames('p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 flex flex-col items-center gap-2 transition-all hover:scale-[1.02] hover:shadow-md bg-white dark:bg-neutral-900')}>
              <span className={classNames('text-2xl p-2 rounded-full', action.color)}>{action.icon}</span>
              <span className="text-sm font-medium">{action.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
