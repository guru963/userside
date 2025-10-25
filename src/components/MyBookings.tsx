// src/pages/MyBookings.tsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getMyBookings, getBookingEvents, type BookingRow, type BookingEvent } from '../services/bookings'

const money = (n:number)=> `₹${n.toLocaleString('en-IN')}`

function StatusBadge({ s }: { s: BookingRow['status'] }) {
  const map: Record<BookingRow['status'], string> = {
    hold: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    confirmed: 'bg-green-100 text-green-800 border-green-300',
    completed: 'bg-blue-100 text-blue-800 border-blue-300',
    cancelled: 'bg-red-100 text-red-800 border-red-300',
  }
  const labelMap: Record<BookingRow['status'], string> = {
    hold: 'On Hold',
    confirmed: 'Confirmed',
    completed: 'Completed',
    cancelled: 'Cancelled',
  }
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-[11px] sm:text-xs rounded-full border whitespace-nowrap ${map[s]}`}
      title={labelMap[s]}
    >
      {labelMap[s]}
    </span>
  )
}

export default function MyBookings() {
  const [rows, setRows] = useState<BookingRow[]>([])
  const [open, setOpen] = useState<Record<string, boolean>>({})
  const [events, setEvents] = useState<Record<string, BookingEvent[]>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        const data = await getMyBookings()
        setRows(data)
      } catch (e) {
        console.error('[MyBookings] load error:', e)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const toggle = async (id: string) => {
    setOpen((p) => ({ ...p, [id]: !p[id] }))
    // lazy-load timeline
    if (!events[id]) {
      try {
        const evs = await getBookingEvents(id)
        setEvents((p) => ({ ...p, [id]: evs }))
      } catch (e) {
        console.error('[events] error:', e)
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      <div className="max-w-5xl mx-auto px-3 sm:px-6 py-6">
        <h1 className="text-xl sm:text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#F53C44] via-[#FA7236] to-[#FA9F2C]">
          My Bookings
        </h1>

        {/* Loading */}
        {loading && (
          <div className="mt-6 grid gap-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="rounded-xl border-2 border-orange-100 bg-white p-4">
                <div className="flex gap-3">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-100 rounded w-1/2 animate-pulse" />
                    <div className="h-3 bg-gray-100 rounded w-3/4 animate-pulse" />
                    <div className="h-3 bg-gray-100 rounded w-1/3 animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && rows.length === 0 && (
          <div className="mt-8 text-center text-black/70 bg-white rounded-xl border border-dashed border-gray-300 p-10">
            <div className="text-2xl mb-2">🕉️</div>
            <div className="font-semibold mb-1">No bookings yet</div>
            <p className="text-sm text-black/60">Your bookings will show up here once you make one.</p>
          </div>
        )}

        {/* List */}
        {!loading && rows.length > 0 && (
          <div className="mt-4 grid gap-3">
            {rows.map((b) => {
              const isOpen = !!open[b.id]
              return (
                <div
                  key={b.id}
                  className="rounded-xl border-2 border-orange-200 bg-white overflow-hidden"
                >
                  {/* Header row */}
                  <div className="p-3 sm:p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      {/* Left: thumb + info */}
                      <div className="flex items-start gap-3 min-w-0">
                        {/* Thumb */}
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden bg-orange-50 border shrink-0">
                          <img
                            src={b.pandits?.photo_url || 'https://picsum.photos/seed/pandit/160/120'}
                            alt={b.pandits?.full_name || 'Pandit'}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Main */}
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <div className="font-semibold text-gray-900 truncate">
                              {b.pandits?.full_name || 'Pandit'}
                            </div>
                            <StatusBadge s={b.status} />
                          </div>

                          <div className="mt-0.5 text-xs sm:text-sm text-black/70 truncate">
                            {b.services?.name || 'Service'} •{' '}
                            {new Date(b.starts_at).toLocaleString()}
                          </div>

                          <div className="mt-1 text-xs sm:text-sm text-black/70">
                            Total <span className="font-semibold text-gray-900">{money(b.total_inr)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: actions (stack on mobile, inline on md+) */}
                      <div className="grid grid-cols-2 sm:flex sm:flex-row gap-2 sm:gap-3">
                        <Link
                          to={`/booking/${b.id}/confirmation`}
                          className="col-span-2 sm:col-span-1 inline-flex items-center justify-center px-3 py-2 rounded-lg text-white text-sm font-medium shadow-sm hover:shadow transition"
                          style={{ background: 'linear-gradient(90deg,#F53C44,#FA7236)' }}
                          title="View/Print confirmation letter"
                        >
                          Confirmation
                        </Link>
                        <button
                          onClick={() => toggle(b.id)}
                          className="col-span-2 sm:col-span-1 inline-flex items-center justify-center px-3 py-2 rounded-lg border text-sm font-medium hover:bg-orange-50"
                          aria-expanded={isOpen}
                          aria-controls={`booking-${b.id}`}
                        >
                          {isOpen ? 'Hide details' : 'View details'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Details */}
                  {isOpen && (
                    <div id={`booking-${b.id}`} className="px-3 sm:px-4 pb-4">
                      {/* Info grid */}
                      <div className="rounded-lg border p-3 sm:p-4 bg-amber-50/40">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-xs sm:text-sm">
                          <div>
                            <span className="font-semibold text-gray-800">Mode:</span>{' '}
                            <span className="text-gray-700">{b.mode}</span>
                          </div>
                          <div>
                            <span className="font-semibold text-gray-800">Ends:</span>{' '}
                            <span className="text-gray-700">
                              {new Date(b.ends_at).toLocaleTimeString()}
                            </span>
                          </div>

                          {b.location_text && (
                            <div className="sm:col-span-2">
                              <span className="font-semibold text-gray-800">Address:</span>{' '}
                              <span className="text-gray-700">{b.location_text}</span>
                            </div>
                          )}

                          {b.notes && (
                            <div className="sm:col-span-2">
                              <span className="font-semibold text-gray-800">Notes:</span>{' '}
                              <span className="text-gray-700">{b.notes}</span>
                            </div>
                          )}

                          {b.pandits?.base_location && (
                            <div className="sm:col-span-2">
                              <span className="font-semibold text-gray-800">Pandit Location:</span>{' '}
                              <span className="text-gray-700">{b.pandits.base_location}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Timeline */}
                      <div className="mt-3 sm:mt-4">
                        <div className="font-semibold text-gray-900 mb-1 sm:mb-2">Timeline</div>
                        {!events[b.id]?.length ? (
                          <div className="text-xs sm:text-sm text-black/60">No updates yet.</div>
                        ) : (
                          <ul className="grid gap-2">
                            {events[b.id].map((ev) => (
                              <li
                                key={ev.id}
                                className="rounded-lg border border-gray-200 bg-white px-3 py-2 sm:px-4 sm:py-3"
                              >
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                                  <span className="capitalize font-medium text-gray-900 text-sm">
                                    {ev.type.replace(/_/g, ' ')}
                                  </span>
                                  <span className="text-[11px] sm:text-xs text-black/60">
                                    {new Date(ev.created_at).toLocaleString()}
                                  </span>
                                </div>
                                {ev.message && (
                                  <div className="text-xs sm:text-sm text-black/80 mt-1">
                                    {ev.message}
                                  </div>
                                )}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
