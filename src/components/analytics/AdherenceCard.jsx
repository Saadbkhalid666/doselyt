import ProgressBar from '../shared/ProgressBar.jsx';

export default function AdherenceCard({ data }) {
  return (
    <section className="flex flex-col rounded-lg border border-line bg-surface p-5 shadow-card">
      <h3 className="text-sm font-medium">Adherence</h3>
      <p className="mt-0.5 text-xs text-muted">{data.note}</p>
      <div className="mt-6 text-5xl font-semibold tracking-tight">{data.percent}<span className="text-2xl text-muted">%</span></div>
      <ProgressBar className="mt-4" value={data.percent} tone="accent" />
      <dl className="mt-auto grid grid-cols-3 gap-2 pt-6 text-sm">
        <div><dt className="text-xs text-muted">Taken</dt><dd className="mt-0.5 font-medium">{data.taken}</dd></div>
        <div><dt className="text-xs text-muted">Missed</dt><dd className="mt-0.5 font-medium">{data.missed}</dd></div>
        <div><dt className="text-xs text-muted">Streak</dt><dd className="mt-0.5 font-medium">{data.streak}</dd></div>
      </dl>
    </section>
  );
} 
