import { useState } from 'react'

function toInputDate(val) {
  if (!val) return ''
  if (val instanceof Date) {
    const y = val.getFullYear()
    const m = String(val.getMonth() + 1).padStart(2, '0')
    const d = String(val.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }
  if (typeof val === 'string') return val.slice(0, 10)
  return ''
}

function buildInitial(schema, initialValues) {
  const out = {}
  schema.forEach(field => {
    const raw = initialValues?.[field.key]
    if (field.type === 'date') {
      out[field.key] = toInputDate(raw ?? field.defaultValue ?? '')
    } else if (field.type === 'boolean') {
      out[field.key] = raw != null ? !!raw : !!(field.defaultValue)
    } else if (field.type === 'select') {
      const v = raw ?? field.defaultValue ?? ''
      out[field.key] = v != null ? String(v) : ''
    } else {
      out[field.key] = raw ?? field.defaultValue ?? ''
    }
  })
  return out
}

const inputCls = 'w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30'

export default function EntityForm({ schema, initialValues, data, isEditing, onSubmit, onCancel }) {
  const [values, setValues] = useState(() => buildInitial(schema, initialValues))

  function set(key, value) {
    setValues(prev => ({ ...prev, [key]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    const out = {}
    schema.forEach(field => {
      const v = values[field.key]
      if (field.type === 'number') {
        out[field.key] = v === '' || v == null ? null : Number(v)
      } else if (field.type === 'boolean') {
        out[field.key] = !!v
      } else if (field.type === 'select') {
        if (v === '' || v == null) {
          out[field.key] = null
        } else {
          const n = Number(v)
          out[field.key] = isNaN(n) ? v : n
        }
      } else if (field.type === 'date') {
        out[field.key] = v || null
      } else {
        out[field.key] = v === '' ? null : v
      }
    })
    if (initialValues?._rowIndex != null) {
      out._rowIndex = initialValues._rowIndex
    }
    onSubmit(out)
  }

  function renderField(field) {
    const value = values[field.key]

    if (field.type === 'select') {
      const opts = field.options
        ? field.options.map(o => ({ value: String(o), label: String(o) }))
        : (field.optionsFromData ? field.optionsFromData(data) : []).map(o =>
            typeof o === 'object' ? { value: String(o.value), label: o.label } : { value: String(o), label: String(o) }
          )
      return (
        <select value={value ?? ''} onChange={e => set(field.key, e.target.value)} className={inputCls}>
          <option value="">— select —</option>
          {opts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      )
    }

    if (field.type === 'boolean') {
      return (
        <div className="flex items-center h-10">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={!!value}
              onChange={e => set(field.key, e.target.checked)}
              className="w-4 h-4 rounded accent-blue-500"
            />
            <span className="text-slate-300 text-sm">{value ? 'Yes' : 'No'}</span>
          </label>
        </div>
      )
    }

    if (field.type === 'textarea') {
      return (
        <textarea
          value={value ?? ''}
          onChange={e => set(field.key, e.target.value)}
          rows={3}
          className={inputCls + ' resize-none'}
        />
      )
    }

    const inputType = field.type === 'date' ? 'date' : field.type === 'number' ? 'number' : 'text'
    return (
      <input
        type={inputType}
        value={value ?? ''}
        step={field.step}
        onChange={e => set(field.key, e.target.value)}
        required={field.required}
        className={inputCls}
      />
    )
  }

  const mainFields = schema.filter(f => f.type !== 'textarea')
  const textareaFields = schema.filter(f => f.type === 'textarea')

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-2 gap-x-4 gap-y-4">
        {mainFields.map(field => (
          <div key={field.key}>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
              {field.label}
              {field.required && <span className="text-red-400 ml-0.5">*</span>}
            </label>
            {renderField(field)}
          </div>
        ))}
      </div>

      {textareaFields.map(field => (
        <div key={field.key}>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
            {field.label}
          </label>
          {renderField(field)}
        </div>
      ))}

      <div className="flex justify-end gap-3 pt-2 border-t border-slate-700">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-5 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
        >
          {isEditing ? 'Save Changes' : 'Add'}
        </button>
      </div>
    </form>
  )
}
