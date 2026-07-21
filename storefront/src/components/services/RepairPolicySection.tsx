import {
  INSPECTION_FEE_SUMMARY,
  NO_FIX_NO_CHARGE_SUMMARY,
  PREVIOUS_LIQUID_DAMAGE_LIMITATION,
  REPAIR_PATH_SUMMARY,
  STANDARD_WARRANTY_SUMMARY,
  WARRANTY_EXCLUSIONS,
  WATER_DAMAGE_WARRANTY_SUMMARY,
  type RepairPolicyVariant,
} from '@/lib/repairPolicy';

interface RepairPolicySectionProps {
  variant: RepairPolicyVariant;
}

export default function RepairPolicySection({ variant }: RepairPolicySectionProps) {
  const isWaterDamageRepair = variant === 'water-damage';

  return (
    <section className="page-container" aria-labelledby="repair-policy-heading" style={{ paddingTop: '0', paddingBottom: '0' }}>
      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '1rem', marginBottom: '3rem', padding: '2rem' }}>
        <p style={{ color: '#2563eb', fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.08em', margin: '0 0 0.5rem', textTransform: 'uppercase' }}>
          Before we start
        </p>
        <h2 id="repair-policy-heading" style={{ color: '#0f172a', fontSize: '1.5rem', margin: '0 0 0.75rem' }}>
          Warranty and repair policy
        </h2>
        <p style={{ color: '#334155', lineHeight: 1.6, margin: 0 }}>
          {isWaterDamageRepair ? WATER_DAMAGE_WARRANTY_SUMMARY : STANDARD_WARRANTY_SUMMARY}
        </p>
        {!isWaterDamageRepair && (
          <p style={{ color: '#334155', lineHeight: 1.6, margin: '0.75rem 0 0' }}>
            {PREVIOUS_LIQUID_DAMAGE_LIMITATION}
          </p>
        )}

        <div style={{ display: 'grid', gap: '1.25rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', marginTop: '1.5rem' }}>
          <div>
            <h3 style={{ color: '#0f172a', fontSize: '1rem', margin: '0 0 0.5rem' }}>What is not covered</h3>
            <ul style={{ color: '#334155', lineHeight: 1.6, margin: 0, paddingLeft: '1.25rem' }}>
              {WARRANTY_EXCLUSIONS.map((exclusion) => <li key={exclusion}>{exclusion}</li>)}
            </ul>
          </div>
          <div>
            <h3 style={{ color: '#0f172a', fontSize: '1rem', margin: '0 0 0.5rem' }}>No Fix, No Charge</h3>
            <p style={{ color: '#334155', lineHeight: 1.6, margin: 0 }}>{NO_FIX_NO_CHARGE_SUMMARY}</p>
          </div>
          <div>
            <h3 style={{ color: '#0f172a', fontSize: '1rem', margin: '0 0 0.5rem' }}>Inspection and repair path</h3>
            <p style={{ color: '#334155', lineHeight: 1.6, margin: 0 }}>{INSPECTION_FEE_SUMMARY}</p>
            <p style={{ color: '#334155', lineHeight: 1.6, margin: '0.75rem 0 0' }}>{REPAIR_PATH_SUMMARY}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
