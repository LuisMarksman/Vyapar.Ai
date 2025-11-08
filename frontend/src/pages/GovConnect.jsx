function GovConnect({ schemes }) {
  return (
    <div className="space-y-4 animate-in">
      <h2 className="text-xl font-bold">Matched Government Schemes</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {schemes.map((s, i) => (
          <Card key={s.id} className={classNames('flex flex-col', i===0 ? 'ring-2 ring-blue-500/20' : '')}>
            <div className="flex justify-between items-start">
              <Badge className="bg-blue-50 text-blue-700 border-blue-200">{(s.score*100).toFixed(0)}% Match</Badge>
            </div>
            <h3 className="text-lg font-semibold mt-3">{s.name}</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1 flex-1">{s.description}</p>
            <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800">
              <div className="text-xs text-neutral-500 mb-3"><strong>Why:</strong> {s.reason}</div>
              <Button variant="primary" className="w-full">Check Eligibility & Apply →</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
