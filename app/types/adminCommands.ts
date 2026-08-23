export interface AdminSlashCommandItem {
  cmd: string
  label: string
  group: string
  needsPeer?: boolean
  needsReply?: boolean
}
