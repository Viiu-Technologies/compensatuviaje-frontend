import React from 'react';

interface ImpactCardProps {
  icon: React.ReactNode;
  value: number | string;
  label: string;
  unit?: string;
}

const ImpactCard: React.FC<ImpactCardProps> = ({ icon, value, label, unit }) => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
          {icon}
        </div>
        <div className="text-center">
          <div className="text-4xl font-bold text-gray-900">
            {value}
            {unit && <span className="text-2xl align-super ml-1">{unit}</span>}
          </div>
          <p className="text-sm text-gray-600 mt-2">{label}</p>
        </div>
      </div>
    </div>
  );
};

export default ImpactCard;
