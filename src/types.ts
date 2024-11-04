export interface Meeting {
  id: string;
  contactName: string;
  companyName: string;
  meetingDate: string;
  outcome: 'Scheduled' | 'No show' | 'Completed' | 'Rescheduled' | 'Unqualified';
}

export interface Deal {
  id: string;
  name: string;
  value: number;
}

export interface Goals {
  meetingGoal: number;
  mmrGoal: number;
}