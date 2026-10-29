import type { DriverSubFilter } from '~/stores/driver.store'
import { driverSubFilterLabel } from '~/utils/driverSubFilters'

export const driverListFilterSummary = (opts: {
  subFilter: DriverSubFilter
  tariffName?: string
  regionTitle?: string
}) => {
  const parts: string[] = []
  if (opts.regionTitle) parts.push(opts.regionTitle)
  if (opts.tariffName) parts.push(opts.tariffName)
  const status = driverSubFilterLabel(opts.subFilter)
  if (status) parts.push(status)
  return parts.join(' · ')
}

export const driverListFilterActive = (opts: {
  subFilter: DriverSubFilter
  tariffSlug: string
  regionSlug: string
}) =>
  !!opts.subFilter || !!String(opts.tariffSlug || '').trim() || !!String(opts.regionSlug || '').trim()
