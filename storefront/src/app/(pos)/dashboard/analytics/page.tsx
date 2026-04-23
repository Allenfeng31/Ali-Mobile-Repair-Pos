import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Sales Analytics | Admin Dashboard',
  description: 'View real-time performance and conversion metrics by Ali Mobile Repair.',
};

export default function AnalyticsPage() {
  return <AnalyticsDashboard />;
}
