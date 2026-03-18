import { dateFnsLocalizer } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { it } from 'date-fns/locale'

const locales = { 'it-IT': it }

export const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
})

export interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  resource: {
    status: string
    priority: string
    categoryId?: string
    categoryColor?: string
    categoryName?: string
  }
}