function Chat({ onAction }) {
  const [msgs, setMsgs] = useState([{ role:'assistant', content:"Hello! I'm your BizMind advisor. Ask me about your sales, inventory, or schemes." }]);
  const [txt, setTxt] = useState('');
  const [typing, setTyping] = useState(false);
  const endRef = useRef(null);

  useEffect(() => endRef.current?.scrollIntoView({ behavior:'smooth' }), [msgs, typing]);

  const send = async () => {
    if(!txt.trim()) return;
    const q = txt.trim(); setTxt(''); setMsgs(m => [...m, { role:'user', content:q }]); setTyping(true);
    setTimeout(() => {
      let reply = "I can help with that. Try asking about 'low stock' or 'create invoice'.";
      const lower = q.toLowerCase();
      if(lower.includes('invoice') && lower.includes('create')) { reply = 'Opening the new invoice form for you now.'; onAction('new-invoice'); }
      else if(lower.includes('stock')) reply = 'You have 3 items low on stock. \'Masala Mix\' is your top seller but running low.';
      else if(lower.includes('sales') || lower.includes('revenue')) reply = 'Your total revenue this month is ₹14,720, which is up 12% from last month.';
      setMsgs(m => [...m, { role:'assistant', content:reply }]);
      setTyping(false);
    }, 1200);
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col animate-in">
      <Card className="flex-1 mb-4 overflow-hidden flex flex-col bg-neutral-50/50 dark:bg-neutral-900/50">
        <div className="flex-1 overflow-y-auto p-2 space-y-4">
          {msgs.map((m, i) => (
            <div key={i} className={classNames('flex', m.role==='user'?'justify-end':'justify-start')}>
              <div className={classNames('max-w-[85%] rounded-2xl px-4 py-3 text-sm', m.role==='user'?'bg-blue-600 text-white rounded-br-none':'bg-white dark:bg-neutral-800 shadow-sm border border-neutral-200 dark:border-neutral-700 rounded-bl-none')}>
                {m.content}
              </div>
            </div>
          ))}
          {typing && <div className="flex"><div className="bg-neutral-200 dark:bg-neutral-800 rounded-full px-4 py-2 text-xs animate-pulse">Thinking...</div></div>}
          <div ref={endRef} />
        </div>
      </Card>
      <div className="flex gap-2">
        <Input value={txt} onChange={e=>setTxt(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()} placeholder="Ask BizMind..." className="flex-1" />
        <Button variant="primary" onClick={send}>Send</Button>
      </div>
    </div>
  );
}
