function Receipts({ receipts, onUpload }) {
  const fileRef = useRef(null);
  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    if (file) onUpload(file);
    e.target.value = null;
  };
  return (
    <div className="space-y-4 animate-in">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Receipt Uploads</h2>
        <Button variant="primary" onClick={() => fileRef.current?.click()}>+ Upload Receipt</Button>
        <input ref={fileRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={handleFileChange} />
      </div>
      {receipts.length === 0 ? (
        <Empty title="No receipts uploaded" hint="Upload a bill or receipt (image or PDF) to get started." action={<Button onClick={() => fileRef.current?.click()}>Upload Now</Button>} />
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {receipts.map(r => (
            <Card key={r.id}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold">{r.vendor}</div>
                  <div className="text-xs text-neutral-500">{r.date}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold">{currency(r.amount)}</div>
                  {r.confidence != null && <div className="text-xs text-neutral-500">Confidence: {(r.confidence * 100).toFixed(0)}%</div>}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
