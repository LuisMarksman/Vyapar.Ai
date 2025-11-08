function SalesDayModal({ open, onClose, date, invoices, skus }) {
  const itemsSold = useMemo(() => {
    if (!date) return [];
    const itemsMap = new Map();
    invoices
      .filter(inv => inv.date === date)
      .forEach(inv => {
        (inv.items || []).forEach(item => {
          const currentQty = itemsMap.get(item.skuId) || 0;
          itemsMap.set(item.skuId, currentQty + item.qty);
        });
      });
    return Array.from(itemsMap.entries()).map(([skuId, totalQty]) => {
      const sku = skus.find(s => s.id === skuId);
      return { name: sku ? sku.name : `Unknown SKU (${skuId})`, qty: totalQty };
    });
  }, [date, invoices, skus]);

  return (
    <Modal open={open} onClose={onClose} title={date ? ('Items Sold on ' + date) : 'Items Sold'}>
      <div className="space-y-2">
        {itemsSold.length === 0 ? (
          <p className="text-neutral-500">No item data found for this day.</p>
        ) : (
          <ul className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {itemsSold.map(item => (
              <li key={item.name} className="flex justify-between items-center py-2">
                <span className="font-medium">{item.name}</span>
                <span className="text-neutral-500">{item.qty} units</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Modal>
  );
}

function Sales({ invoices, skus }) {
  const [period, setPeriod] = useState('day');
  const [dayModalData, setDayModalData] = useState(null);
  const [dateRange, setDateRange] = useState({ from: d(90), to: d(0) });

  const aggregatedData = useMemo(() => {
    const groups = invoices
      .filter(inv => {
        if (dateRange.from && inv.date < dateRange.from) return false;
        if (dateRange.to && inv.date > dateRange.to) return false;
        return true;
      })
      .reduce((acc, inv) => {
        let key;
        if (period === 'day') key = inv.date;
        else if (period === 'month') key = inv.date.substring(0, 7);
        else key = inv.date.substring(0, 4);
        if (!acc[key]) acc[key] = 0;
        acc[key] += inv.total;
        return acc;
      }, {});

    return Object.entries(groups).map(([periodKey, total]) => ({
      period: periodKey,
      total: total,
    })).sort((a, b) => b.period.localeCompare(a.period));
  }, [invoices, period, dateRange]);

  const PeriodButton = ({ value, label }) => (
    <Button variant={period === value ? 'primary' : 'outline'} onClick={() => setPeriod(value)}>{label}</Button>
  );

  return (
    <div className="space-y-6 animate-in">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-xl font-bold">Sales Report</h2>
        <div className="flex gap-2">
          <PeriodButton value="day" label="By Day" />
          <PeriodButton value="month" label="By Month" />
          <PeriodButton value="year" label="By Year" />
        </div>
      </div>

      <Card>
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="text-xs font-medium text-neutral-500">From</label>
            <Input type="date" value={dateRange.from} onChange={e => setDateRange(dr => ({ ...dr, from: e.target.value }))} />
          </div>
          <div className="flex-1">
            <label className="text-xs font-medium text-neutral-500">To</label>
            <Input type="date" value={dateRange.to} onChange={e => setDateRange(dr => ({ ...dr, to: e.target.value }))} />
          </div>
        </div>
      </Card>

      {aggregatedData.length === 0 ? (
        <Empty title="No Sales Data" hint="No sales match your selected filters. Try expanding the date range." />
      ) : (
        <>
          <LineChart data={aggregatedData} periodType={period} />

          <Card className="overflow-hidden p-0 md:p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-neutral-50 dark:bg-neutral-800/50 text-neutral-500 border-b border-neutral-200 dark:border-neutral-800">
                  <tr>
                    <th className="px-4 py-3 font-medium">Period</th>
                    <th className="px-4 py-3 font-medium text-right">Total Sales</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {aggregatedData.map(data => (
                    <tr
                      key={data.period}
                      className={classNames('hover:bg-neutral-50 dark:hover:bg-neutral-800/30', period === 'day' ? 'cursor-pointer' : '')}
                      onClick={() => period === 'day' ? setDayModalData(data.period) : null}
                    >
                      <td className="px-4 py-3 font-medium text-neutral-900 dark:text-neutral-100">{formatPeriod(data.period, period)}</td>
                      <td className="px-4 py-3 font-medium text-right font-mono">{currency(data.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      <SalesDayModal open={!!dayModalData} onClose={() => setDayModalData(null)} date={dayModalData} invoices={invoices} skus={skus} />
    </div>
  );
}
