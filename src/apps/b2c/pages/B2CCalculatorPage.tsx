import React from 'react';
import { useSearchParams } from 'react-router-dom';
import B2CCalculator from '../components/B2CCalculator';

const B2CCalculatorPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId');

  return <B2CCalculator projectId={projectId} />;
};

export default B2CCalculatorPage;
