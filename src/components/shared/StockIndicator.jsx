import ProgressBar from './ProgressBar.jsx';
import { stockTone } from './Badges.jsx';

export default function StockIndicator({ stock, unit, pct, status, className = '' }) {
  return (
    <div className={className}>
      <div className="mb-1.5 flex items-baseline justify-between text-xs">
        <span className="font-medium text-ink">{stock} <span className="font-normal text-muted">{unit}</span></span>
      </div>
      <ProgressBar value={pct} tone={stockTone[status]} />
    </div>
  );
}
