function Invoices({ data, onCreate, onResend }) {
  return (
    <div className="space-y-4 animate-in">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Invoices</h2>
        <Button variant="primary" onClick={onCreate}>+ New Invoice</Button>
      </div>
      {data.length === 0 ? (
        <Empty title="No invoices" hint="Create your first invoice to see it here." action={<Button onClick={onCreate}>Create Now</Button>} />
      ) : (
        <Card className="overflow-hidden p-0 md:p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-neutral-50 dark:bg-neutral-800/50 text-neutral-500 border-b border-neutral-200 dark:border-neutral-800">
                <tr>
                  {['Number','Customer','Date','Total','Status','Actions'].map(h=><th key={h} className="px-4 py-3 font-medium">{h}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {data.map(inv => (
                  <tr key={inv.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/30">
                    <td className="px-4 py-3 font-mono text-neutral-600 dark:text-neutral-400">{inv.number}</td>
                    <td className="px-4 py-3 font-medium">{inv.customer}</td>
                    <td className="px-4 py-3 text-neutral-500">{inv.date}</td>
                    <td className="px-4 py-3 font-medium">{currency(inv.total)}</td>
                    <td className="px-4 py-3">
                      <Badge className={inv.status==='Paid'?'bg-emerald-50 text-emerald-700 border-emerald-200':'bg-neutral-100 text-neutral-700 border-neutral-200'}>{inv.status}</Badge>
                    </td>
                    <td className="px-4 py-3 flex gap-3 text-blue-600 dark:text-blue-400">
                      <button onClick={()=>onResend(inv)} className="hover:underline">Resend</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
