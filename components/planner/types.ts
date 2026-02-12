export interface Activity {
  id: string;
  activityName: string;
  description?: string;
  remarks?: string;
  activityStatus: string;
  estimatedStart: string;
  createdAt?: string;
  updatedAt?: string;
  assignedGroupLeader?: {
    id: string;
    firstName: string;
    lastName: string;
    nrp: number;
    email?: string;
  } | null;
  unit: {
    id: string;
    unitCode: string;
    unitType: string;
    unitBrand: string;
    unitDescription?: string;
  };
  mechanics: Array<{
    id: string;
    status?: string;
    startedAt?: string | null;
    stoppedAt?: string | null;
    totalWorkTime?: number;
    mechanic: {
      id: string;
      firstName: string;
      lastName: string;
      nrp: number;
      email?: string;
    };
    tasks?: Array<{
      id: string;
      taskName: string;
      order: number;
      startedAt: string | null;
      stoppedAt: string | null;
      durationMinutes?: number;
      durationFormatted?: string;
      isActive?: boolean;
    }>;
    totalTaskTimeMinutes?: number;
    totalTaskTimeFormatted?: string;
  }>;
}

export interface Unit {
  id: string;
  unitCode: string;
  unitType: string;
  unitBrand: string;
  unitDescription?: string;
  unitStatus?: string;
}

