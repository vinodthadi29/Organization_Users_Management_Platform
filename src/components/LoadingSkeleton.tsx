import React from 'react';

export const CardSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
    <div className="flex items-start justify-between mb-3">
      <div className="flex items-center">
        <div className="w-8 h-8 bg-gray-200 rounded mr-3" />
        <div className="h-6 bg-gray-200 rounded w-32" />
      </div>
      <div className="flex gap-2">
        <div className="w-4 h-4 bg-gray-200 rounded" />
        <div className="w-4 h-4 bg-gray-200 rounded" />
      </div>
    </div>
    <div className="space-y-2 mb-4">
      <div className="h-4 bg-gray-200 rounded w-full" />
      <div className="h-4 bg-gray-200 rounded w-3/4" />
    </div>
    <div className="h-3 bg-gray-200 rounded w-24" />
  </div>
);

export const StatCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <div className="h-4 bg-gray-200 rounded w-24 mb-3" />
        <div className="h-8 bg-gray-200 rounded w-16" />
      </div>
      <div className="w-12 h-12 bg-gray-200 rounded" />
    </div>
  </div>
);

export const TableRowSkeleton: React.FC = () => (
  <div className="p-4 bg-gray-50 rounded-lg animate-pulse">
    <div className="flex items-center justify-between">
      <div className="flex items-center flex-1">
        <div className="w-10 h-10 bg-gray-200 rounded-full mr-3" />
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-32 mb-2" />
          <div className="h-3 bg-gray-200 rounded w-48" />
        </div>
      </div>
      <div className="h-3 bg-gray-200 rounded w-20" />
    </div>
  </div>
);
