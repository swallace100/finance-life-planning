import { useState } from 'react'
import Modal from '../components/Modal'
import EntityForm from '../components/EntityForm'
import { SCHEMAS } from '../data/schemas'
import { useEntityModal } from '../hooks/useEntityModal'

const fmtDate = d =>
  d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : null

function age(dob) {
  if (!dob) return null
  const today = new Date()
  const b = new Date(dob)
  let a = today.getFullYear() - b.getFullYear()
  if (today < new Date(today.getFullYear(), b.getMonth(), b.getDate())) a--
  return a
}

function contactHref(type, value) {
  if (!value) return null
  if (type === 'Email')   return `mailto:${value}`
  if (type === 'Phone')   return `tel:${value.replace(/\D/g, '')}`
  if (type === 'Website') return value.startsWith('http') ? value : `https://${value}`
  if (type === 'Social' && value.startsWith('http')) return value
  return null
}

const TYPE_ICONS = {
  Email: (
    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  ),
  Phone: (
    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
    </svg>
  ),
  Address: (
    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
  ),
  Website: (
    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
    </svg>
  ),
  Social: (
    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
    </svg>
  ),
  Other: (
    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
}

const TYPE_ORDER = ['Email', 'Phone', 'Address', 'Website', 'Social', 'Other']

function ContactEntry({ entry, onEdit }) {
  const href = contactHref(entry.Type, entry.Value)
  return (
    <div className="flex items-start justify-between py-2.5 border-b border-slate-700/40 last:border-0 gap-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-slate-500 text-xs font-semibold uppercase tracking-wide">{entry.Label}</span>
          {entry.Primary && (
            <span className="text-xs text-blue-400 bg-blue-400/10 px-1.5 py-0.5 rounded">primary</span>
          )}
        </div>
        {href ? (
          <a
            href={href}
            target={entry.Type === 'Email' || entry.Type === 'Phone' ? undefined : '_blank'}
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 text-sm transition-colors break-all mt-0.5 block"
          >
            {entry.Value}
          </a>
        ) : (
          <p className="text-slate-200 text-sm break-all mt-0.5">{entry.Value}</p>
        )}
        {entry.Notes && <p className="text-slate-600 text-xs mt-0.5">{entry.Notes}</p>}
      </div>
      <button
        onClick={() => onEdit(entry)}
        className="text-xs text-slate-600 hover:text-slate-400 transition-colors flex-shrink-0 pt-0.5"
      >
        Edit
      </button>
    </div>
  )
}

function ContactGroup({ type, entries, onEdit }) {
  const sorted = [...entries].sort((a, b) => {
    if (a.Primary && !b.Primary) return -1
    if (!a.Primary && b.Primary) return 1
    return (a.Label || '').localeCompare(b.Label || '')
  })
  return (
    <div>
      <div className="flex items-center gap-2 mb-1 text-slate-400">
        {TYPE_ICONS[type] || TYPE_ICONS.Other}
        <span className="text-xs font-semibold uppercase tracking-wide">{type}</span>
        <span className="text-slate-600 text-xs">({entries.length})</span>
      </div>
      <div className="pl-6">
        {sorted.map(e => (
          <ContactEntry key={e._rowIndex ?? e.ID} entry={e} onEdit={onEdit} />
        ))}
      </div>
    </div>
  )
}

export default function PersonalInfoPage({ data, onSave, onDelete }) {
  const [identityOpen, setIdentityOpen] = useState(false)
  const contactModal = useEntityModal()

  const rows     = data?.PersonalInfo    || []
  const contacts = data?.PersonalContacts || []
  const info     = rows[0] ?? null

  const grouped = {}
  contacts.forEach(c => {
    const t = c.Type || 'Other'
    if (!grouped[t]) grouped[t] = []
    grouped[t].push(c)
  })
  const orderedTypes = [
    ...TYPE_ORDER.filter(t => grouped[t]),
    ...Object.keys(grouped).filter(t => !TYPE_ORDER.includes(t)),
  ]

  async function handleIdentitySubmit(row) {
    const isNew = !info || info._rowIndex == null
    if (!isNew) row._rowIndex = info._rowIndex
    await onSave('PersonalInfo', row, isNew)
    setIdentityOpen(false)
  }

  async function handleContactSubmit(row) {
    await onSave('PersonalContacts', row, row._rowIndex == null)
    contactModal.close()
  }

  async function handleContactDelete(row) {
    await onDelete('PersonalContacts', row._rowIndex)
    contactModal.close()
  }

  const dobDisplay = info?.DateOfBirth
    ? `${fmtDate(info.DateOfBirth)}${age(info.DateOfBirth) != null ? ` (age ${age(info.DateOfBirth)})` : ''}`
    : null

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-100">Personal Info</h2>
      </div>

      {/* Identity card */}
      <div className="card p-6">
        <div className="flex items-start justify-between gap-3 mb-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Identity</p>
          <button
            onClick={() => setIdentityOpen(true)}
            className="text-xs font-medium text-blue-400 hover:text-blue-300 bg-blue-400/10 hover:bg-blue-400/20 px-3 py-1.5 rounded-lg transition-colors flex-shrink-0"
          >
            {info ? 'Edit' : 'Set Up Profile'}
          </button>
        </div>

        {!info ? (
          <p className="text-slate-500 text-sm">No profile saved yet.</p>
        ) : (
          <div className="space-y-0">
            {info.Name && (
              <div className="flex items-start gap-3 py-2.5 border-b border-slate-700/50">
                <span className="text-slate-500 text-xs font-semibold uppercase tracking-wide w-28 flex-shrink-0 pt-0.5">Full Name</span>
                <span className="text-slate-200 text-sm">{info.Name}</span>
              </div>
            )}
            {info.Nickname && (
              <div className="flex items-start gap-3 py-2.5 border-b border-slate-700/50">
                <span className="text-slate-500 text-xs font-semibold uppercase tracking-wide w-28 flex-shrink-0 pt-0.5">Nickname</span>
                <span className="text-slate-200 text-sm">{info.Nickname}</span>
              </div>
            )}
            {dobDisplay && (
              <div className="flex items-start gap-3 py-2.5 border-b border-slate-700/50">
                <span className="text-slate-500 text-xs font-semibold uppercase tracking-wide w-28 flex-shrink-0 pt-0.5">Birthday</span>
                <span className="text-slate-200 text-sm">{dobDisplay}</span>
              </div>
            )}
            {info.Notes && (
              <div className="pt-3">
                <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide mb-1.5">Bio</p>
                <p className="text-slate-300 text-sm leading-relaxed">{info.Notes}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Contact info card */}
      <div className="card p-6">
        <div className="flex items-center justify-between gap-3 mb-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Contact Info</p>
          <button
            onClick={() => contactModal.openAdd({})}
            className="text-xs font-medium text-blue-400 hover:text-blue-300 bg-blue-400/10 hover:bg-blue-400/20 px-3 py-1.5 rounded-lg transition-colors flex-shrink-0"
          >
            + Add
          </button>
        </div>

        {contacts.length === 0 ? (
          <p className="text-slate-500 text-sm">No contact info yet. Add emails, phones, addresses, and social profiles.</p>
        ) : (
          <div className="space-y-5">
            {orderedTypes.map(type => (
              <ContactGroup
                key={type}
                type={type}
                entries={grouped[type]}
                onEdit={contactModal.openEdit}
              />
            ))}
          </div>
        )}
      </div>

      {/* Identity modal */}
      <Modal open={identityOpen} onClose={() => setIdentityOpen(false)} title="Edit Profile">
        <EntityForm
          schema={SCHEMAS.PersonalInfo}
          initialValues={info}
          isEditing={!!info}
          onSubmit={handleIdentitySubmit}
          onCancel={() => setIdentityOpen(false)}
        />
      </Modal>

      {/* Contact modal */}
      <Modal
        open={contactModal.open}
        onClose={contactModal.close}
        title={contactModal.editing ? 'Edit Contact Info' : 'Add Contact Info'}
      >
        <EntityForm
          schema={SCHEMAS.PersonalContacts}
          initialValues={contactModal.row}
          isEditing={contactModal.editing}
          onSubmit={handleContactSubmit}
          onDelete={contactModal.editing ? handleContactDelete : undefined}
          onCancel={contactModal.close}
        />
      </Modal>

    </div>
  )
}
