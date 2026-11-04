import Container from 'src/components/container/PageContainer';
import AnalyticsDashboard from './components/AnalyticsDashboard';

const Content = () => {
  return (
    <Container title="Insight" description="this is Dashboard page">
      <AnalyticsDashboard />
    </Container>
  );
};

export default Content;
