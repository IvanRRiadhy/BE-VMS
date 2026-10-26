export interface NotificationItem {
  id: string;
  type: string;
  icon: string;
  title: string;
  message: string;

  trx_visitor_id: string;
  visitor_id: string;
  visitor_name: string;
  visitor_type: string;

  site_id: string;
  site_name: string;

  visit_end: string;
  remaining_minutes: number;
  created_at: string;

  is_read: boolean;
}
