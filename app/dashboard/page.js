import { redirect } from 'next/navigation';

// Default dashboard landing page is Analytics & Reports
export default function DashboardIndex() {
  redirect('/dashboard/analytics');
}
