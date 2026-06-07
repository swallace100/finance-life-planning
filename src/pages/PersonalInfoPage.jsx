import { useState } from 'react'
import Modal from '../components/Modal'
import EntityForm from '../components/EntityForm'
import { SCHEMAS } from '../data/schemas'

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : null

function age(dob) {
  if (!dob) return null
  const today = new Date()
  const b = new Date(dob)
  let a = today.getFullYear() - b.getFullYear()
  if (today < new Date(today.getFullYear(), b.getMonth(), b.getDate())) a--
  return a
}

function InfoRow({ label, value, href }) {
  if (!value) return null
  return (
    <div className="flex items-start gap-3 py-3 border-b border-slate-700/50 last:border-0">
      <span className="text-slate-500 text-xs font-semibold uppercase tracking-wide w-28 flex-shrink-0 pt-0.5">
        {label}
      </span>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-300 text-sm transition-colors break-all"
        >
          {value}
        </a>
      ) : (
        <span className="text-slate-200 text-sm break-all">{value}</span>
      )}
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="card p-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">{title}</p>
      {children}
    </div>
  )
}

export default function PersonalInfoPage({ data, onSave }) {
  const [open, setOpen] = useState(false)
  const rows = data?.PersonalInfo || []
  const info = rows[0] ?? null

  async function handleSubmit(row) {
    // Always upsert the single record
    const isNew = !info || info._rowIndex == null
    if (!isNew) row._rowIndex = info._rowIndex
    await onSave('PersonalInfo', row, isNew)
    setOpen(false)
  }

  const dobDisplay = info?.DateOfBirth
    ? `${fmtDate(info.DateOfBirth)}${age(info.DateOfBirth) != null ? ` (age ${age(info.DateOfBirth)})` : ''}`
    : null

  const addressParts = [info?.Address, info?.City, info?.State, info?.Country].filter(Boolean)
  const addressDisplay = addressParts.length ? addressParts.join(', ') : null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-100">Personal Info</h2>
        <button
          onClick={() => setOpen(true)}
          className="text-xs font-medium text-blue-400 hover:text-blue-300 bg-blue-400/10 hover:bg-blue-400/20 px-3 py-2 rounded-lg transition-colors"
        >
          {info ? 'Edit' : 'Set Up Profile'}
        </button>
      </div>

      {!info ? (
        <div className="card p-8 text-center">
          <p className="text-slate-400 text-sm mb-4">No personal info saved yet.</p>
          <button
            onClick={() => setOpen(true)}
            className="text-sm font-medium text-blue-400 hover:text-blue-300 bg-blue-400/10 hover:bg-blue-400/20 px-4 py-2 rounded-lg transition-colors"
          >
            Set Up Profile
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Identity */}
          <Section title="Identity">
            <InfoRow label="Full Name"  value={info.Name} />
            <InfoRow label="Nickname"   value={info.Nickname} />
            <InfoRow label="Birthday"   value={dobDisplay} />
            <InfoRow label="Location"   value={addressDisplay} />
            {info.Notes && (
              <div className="pt-3">
                <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide mb-1.5">Bio</p>
                <p className="text-slate-300 text-sm leading-relaxed">{info.Notes}</p>
              </div>
            )}
          </Section>

          {/* Contact */}
          <Section title="Contact">
            <InfoRow label="Phone" value={info.Phone} />
            <InfoRow label="Email" value={info.Email} href={info.Email ? `mailto:${info.Email}` : null} />
            <InfoRow label="Website" value={info.Website} href={info.Website} />
          </Section>

          {/* Online */}
          {(info.LinkedIn || info.GitHub) && (
            <Section title="Online">
              <InfoRow
                label="LinkedIn"
                value={info.LinkedIn}
                href={info.LinkedIn
                  ? info.LinkedIn.startsWith('http') ? info.LinkedIn : `https://linkedin.com/in/${info.LinkedIn}`
                  : null}
              />
              <InfoRow
                label="GitHub"
                value={info.GitHub}
                href={info.GitHub
                  ? info.GitHub.startsWith('http') ? info.GitHub : `https://github.com/${info.GitHub}`
                  : null}
              />
            </Section>
          )}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Edit Personal Info"
      >
        <EntityForm
          schema={SCHEMAS.PersonalInfo}
          initialValues={info}
          isEditing={!!info}
          onSubmit={handleSubmit}
          onCancel={() => setOpen(false)}
        />
      </Modal>
    </div>
  )
}
