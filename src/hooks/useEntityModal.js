import { useState } from 'react'

export function useEntityModal() {
  const [open, setOpen] = useState(false)
  const [editRow, setEditRow] = useState(null)

  function openAdd(defaults = null) {
    setEditRow(defaults)
    setOpen(true)
  }

  function openEdit(row) {
    setEditRow(row)
    setOpen(true)
  }

  function close() {
    setOpen(false)
    setEditRow(null)
  }

  const isEditing = open && editRow != null && editRow._rowIndex != null

  return { open, editRow, isEditing, openAdd, openEdit, close }
}
