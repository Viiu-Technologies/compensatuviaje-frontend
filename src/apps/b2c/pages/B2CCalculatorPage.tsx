import React from 'react';
import { useSearchParams } from 'react-router-dom';
import B2CCalculator from '../components/B2CCalculator';
import GroundTripCalculator from '../components/GroundTripCalculator';

const B2CCalculatorPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId');

  // Orden 9: ?mode=ground registra un viaje terrestre a mano.
  if (searchParams.get('mode') === 'ground') return <GroundTripCalculator />;
  return <B2CCalculator projectId={projectId} />;
};

export default B2CCalculatorPage;
