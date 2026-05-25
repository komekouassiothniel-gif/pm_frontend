import { Inbox } from 'lucide-react'

export function EmptyState({ message = 'Aucune donnée', Icon = Inbox }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-muted">
      <Icon size={40} strokeWidth={1} className="mb-3" />
      <p className="text-sm">{message}</p>
    </div>
  )
}
