function formatPeriod(period, type) {
  if (type === 'day') return period;
  if (type === 'month') {
    const [year, month] = period.split('-');
    return new Date(year, month - 1).toLocaleString('default', { month: 'long', year: 'numeric' });
  }
  if (type === 'year') return period;
  return period;
}

function LineChart({ data, periodType }) {
  const displayData = useMemo(() => [...data].reverse(), [data]);
  const maxSale = useMemo(() => Math.max(...displayData.map(d => d.total), 1), [displayData]);

  const chartHeight = 256;
  const chartWidth = 500;
  const padding = 20;

  const getY = (value) => chartHeight - (value / maxSale) * (chartHeight - padding);
  const getX = (index) => (displayData.length <= 1) ? chartWidth / 2 : (index / (displayData.length - 1)) * (chartWidth - padding) + (padding / 2);

  const linePath = displayData
    .map((item, index) => {
      const x = getX(index);
      const y = getY(item.total);
      return `${index === 0 ? 'M' : 'L'} ${x},${y}`;
    })
    .join(' ');

  const points = displayData.map((item, index) => ({
    x: getX(index),
    y: getY(item.total),
    item: item,
  }));

  return (
    <Card>
      <h3 className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-2">Sales Volume</h3>
      <div className="w-full h-64" role="img" aria-label={`Line chart showing sales data by ${periodType}`}>
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full overflow-visible">
          {points.map((point, index) => (
            <text key={`label-${index}`} x={point.x} y={chartHeight} textAnchor="middle" className="text-xs text-neutral-500 fill-current">
              {periodType === 'day' ? point.item.period.slice(5) : periodType === 'month' ? point.item.period.slice(5) : point.item.period}
            </text>
          ))}
          <path d={linePath} fill="none" strokeWidth="2" className="text-blue-500 stroke-current" />
          {points.map((point, index) => (
            <g key={`point-${index}`} className="group">
              <circle cx={point.x} cy={point.y} r="4" className="text-blue-500 fill-current" />
              <circle cx={point.x} cy={point.y} r="10" className="text-blue-500 fill-current opacity-0 group-hover:opacity-20 transition-opacity" />
              <g className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" style={{ transform: `translateX(${point.x}px) translateY(${point.y - 10}px)` }}>
                <rect x="-50" y="-40" width="100" height="36" rx="4" className="text-neutral-800 dark:text-neutral-700 fill-current" />
                <text x="0" y="-26" textAnchor="middle" className="text-xs text-white fill-current font-semibold">
                  {formatPeriod(point.item.period, periodType)}
                </text>
                <text x="0" y="-12" textAnchor="middle" className="text-xs text-white fill-current font-mono">
                  {currency(point.item.total)}
                </text>
              </g>
            </g>
          ))}
        </svg>
      </div>
    </Card>
  );
}
