/* eslint-disable react-refresh/only-export-components */
import { useState } from 'react'
import { ArrowUp, ArrowDown, ChevronsUpDown } from 'lucide-react'

function getNestedVal(obj, key) {
  return key.split('.').reduce((o, k) => o?.[k], obj)
}

export function useSortTable(defaultKey = null, defaultDir = 'asc') {
  const [sortKey, setSortKey] = useState(defaultKey)
  const [sortDir, setSortDir] = useState(defaultDir)

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const sortData = (items) => {
    if (!sortKey || !items?.length) return items ?? []
    return [...items].sort((a, b) => {
      const av = getNestedVal(a, sortKey)
      const bv = getNestedVal(b, sortKey)
      let cmp
      if (av == null && bv == null) cmp = 0
      else if (av == null) cmp = 1
      else if (bv == null) cmp = -1
      else if (typeof av === 'number' && typeof bv === 'number') cmp = av - bv
      else cmp = String(av).localeCompare(String(bv), 'fr')
      return sortDir === 'asc' ? cmp : -cmp
    })
  }

  return { sortKey, sortDir, toggleSort, sortData }
}

export function SortIcon({ colKey, sortKey, sortDir }) {
  if (sortKey !== colKey)
    return <ChevronsUpDown size={11} className="opacity-40 shrink-0" />
  return sortDir === 'asc'
    ? <ArrowUp size={11} className="text-primary shrink-0" />
    : <ArrowDown size={11} className="text-primary shrink-0" />
}
