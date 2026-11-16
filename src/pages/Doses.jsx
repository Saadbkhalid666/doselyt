import { useState } from 'react';
import { Plus, Layers } from 'lucide-react';
import PageHeading from '../components/shared/PageHeading.jsx';
import Button from '../components/shared/Button.jsx';
import EmptyState from '../components/shared/EmptyState.jsx';
import { CardGridSkeleton } from '../components/shared/Skeleton.jsx';
import { ConfirmDialog } from '../components/shared/Modal.jsx';
import DoseCard from '../components/doses/DoseCard.jsx';
import DoseBuilderModal from '../components/doses/DoseBuilderModal.jsx';
import useSimulatedLoad from '../hooks/useSimulatedLoad.js';
import { doses, medicines } from '../data/mockData.js';

export default function Doses() {
  const loading = useSimulatedLoad();
  const [builder, setBuilder] = useState({ open: false, dose: null });
  const [toDelete, setToDelete] = useState(null);
  const create = () => setBuilder({ open: true, dose: null });

  return (
    <>
      <PageHeading title="My Doses" description="Group medicines you take together into a named regimen. Regimens reference your existing medicines."
        actions={<Button variant="primary" icon={Plus} onClick={create}>Create dose</Button>} />

      {loading ? <CardGridSkeleton count={2} cols="lg:grid-cols-2" height="h-96" /> : doses.length === 0 ? (
        <EmptyState icon={Layers} title="No doses yet" description="Combine medicines you already track into a regimen you can follow each day."
          action={<Button variant="primary" icon={Plus} onClick={create}>Create dose</Button>} />
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {doses.map((d) => (
            <DoseCard key={d.id} dose={d} onEdit={(dose) => setBuilder({ open: true, dose })} onDelete={setToDelete} />
          ))}
        </div>
      )}

      <DoseBuilderModal key={builder.dose?.id || 'new'} open={builder.open} medicines={medicines} initialDose={builder.dose}
        onClose={() => setBuilder({ ...builder, open: false })} onSubmit={() => setBuilder({ ...builder, open: false })} />
      <ConfirmDialog open={!!toDelete} onClose={() => setToDelete(null)} onConfirm={() => setToDelete(null)}
        title="Delete dose?" description={`"${toDelete?.name ?? ''}" will be removed. The medicines in it stay in My Medicines.`} />
    </>
  );
}
