// Enum constants that match the Prisma schema
// Update this file whenever enum values change in schema.prisma

export const UNIT_TYPES = [
  'PMVV',
  'DOLLY',
  'VESSEL',
  'SELF_LOADER',
  'TELEHANDLER',
  'GENERATOR_SET',
  'EXCAVATOR',
  'BUS_MANHAUL',
  'AIR_COMPRESSSOR',
  'DT',
  'LV',
  'CT',
  'WT',
  'GENSET',
  'OTHER',
] as const;

export const UNIT_BRANDS = [
  'VOLVO',
  'NISSAN',
  'TOYOTA',
  'MITSUBISHI',
  'KOMATSU',
  'LIEBHERR',
  'ISUZU',
  'DAIHATSU',
  'KENT_POWER',
  'SANY',
  'JIEFANG',
  'HYUNDAI',
  'FUJI',
  'YUCHAI',
  'YANMAR',
  'DONGFENG',
  'MONTOYA',
  'SHARK',
  'KAESER',
  'KORINDO',
  'TRUPOWER',
  'PRO_QUIP',
  'AMIX',
  'MANITOU',
  'OTHER',
] as const;

export const UNIT_STATUSES = ['ACTIVE', 'BREAKDOWN', 'INACTIVE'] as const;

export const ROLES = ['ADMIN', 'USERS', 'SUPERADMIN'] as const;

export const POSISIONS = [
  'MEKANIK',
  'ELECTRICIAN',
  'WELDER',
  'TYREMAN',
  'GROUP_LEADER_MEKANIK',
  'GROUP_LEADER_TYRE',
  'SUPERVISOR',
  'DEPT_HEAD',
  'MANAGEMENT',
  'PLANNER',
] as const;

export const ACTIVITY_NAMES = [
  'PERIODIC_SERVICE',
  'SCHEDULED_MAINTENANCE',
  'UNSCHEDULED_MAINTENANCE',
  'TROUBLESHOOTING',
  'REPAIR_AND_ADJUSTMENT',
  'GENERAL_REPAIR',
  'PERIODIC_INSPECTION',
  'PERIODIC_INSPECTION_TYRE',
  'PERIODIC_SERVICE_TYRE',
  'RETORQUE_TYRE',
  'REPAIR_TYRE',
  'TROUBLESHOOTING_TYRE',
  'OTHER',
] as const;

export const ACTIVITY_STATUSES = [
  'PENDING',
  'OPEN',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
  'DELAYED',
] as const;

export const PAUSE_REASONS = ['WAITING_PARTS', 'REST_AND_PRAY', 'OTHER'] as const;

export const TASK_NAMES = [
  'PREPARING_PART',
  'PREPARING_PARTS',
  'PREPARING_TOOLS',
  'PREPARING_TYRE_AND_MATERIAL',
  'TRAVELING',
  'WASHING_UNIT',
  'WASHING_UNITS',
  'PRE_INSPECTION',
  'ON_PROCESS',
  'PELAKSANAAN_PS',
  'PELAKSANAAN_BACKLOG',
  'PAP',
  'PPM',
  'REMOVE_INSTALL_TYRE',
  'RETORQUE',
  'FINAL_CHECK',
  'FINAL_CHECK_AND_GROUND_TEST',
  'REPORTING',
  'HOUSEKEEPING',
] as const;

// Type exports for TypeScript
export type UnitType = typeof UNIT_TYPES[number];
export type UnitBrand = typeof UNIT_BRANDS[number];
export type UnitStatus = typeof UNIT_STATUSES[number];
export type Role = typeof ROLES[number];
export type Posision = typeof POSISIONS[number];
export type ActivityName = typeof ACTIVITY_NAMES[number];
export type ActivityStatus = typeof ACTIVITY_STATUSES[number];
export type PauseReason = typeof PAUSE_REASONS[number];
export type TaskName = typeof TASK_NAMES[number];

