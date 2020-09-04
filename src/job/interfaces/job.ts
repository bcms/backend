export interface Job {
  handler: () => Promise<void>;
  cron: {
    minute: string;
    hour: string;
    dayOfMonth: string;
    month: string;
    dayOfWeek: string;
  };
}
