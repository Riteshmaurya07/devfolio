import { format, formatDistanceToNow, parseISO } from 'date-fns'

export function formatDate(dateString, pattern = 'MMM d, yyyy') {
  if (!dateString) return ''
  try {
    return format(parseISO(dateString), pattern)
  } catch {
    return dateString
  }
}

export function formatRelative(dateString) {
  if (!dateString) return ''
  try {
    return formatDistanceToNow(parseISO(dateString), { addSuffix: true })
  } catch {
    return dateString
  }
}

export function formatTimestamp(timestamp) {
  // Unix timestamp (seconds)
  const date = new Date(timestamp * 1000)
  return formatDistanceToNow(date, { addSuffix: true })
}

export function formatShortDate(dateString) {
  if (!dateString) return ''
  try {
    return format(parseISO(dateString), 'MMM d')
  } catch {
    return dateString
  }
}

export function formatMonthYear(dateString) {
  if (!dateString) return ''
  try {
    return format(parseISO(dateString), 'MMM yyyy')
  } catch {
    return dateString
  }
}
