import React from 'react';

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
      <div className="aspect-square bg-gray-200"></div>
      <div className="p-4 space-y-3">
        <div className="h-3 bg-gray-200 rounded w-1/4"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="flex items-center gap-2">
          <div className="h-3 bg-gray-200 rounded w-1/3"></div>
          <div className="h-3 bg-gray-200 rounded w-1/4"></div>
        </div>
        <div className="flex items-end justify-between pt-2">
          <div className="h-5 bg-gray-200 rounded w-1/3"></div>
          <div className="h-3 bg-gray-200 rounded w-1/4"></div>
        </div>
      </div>
    </div>
  );
};

export const ProductGridSkeleton: React.FC<{ count?: number }> = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
};

export const ProductDetailSkeleton: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 animate-pulse">
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
          <div className="aspect-square bg-gray-200"></div>
        </div>
        <div className="space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          <div className="h-20 bg-gray-200 rounded-xl"></div>
          <div className="grid grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const TableRowSkeleton: React.FC = () => {
  return (
    <tr className="border-b border-gray-50 animate-pulse">
      <td className="py-4 px-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
          <div className="space-y-1">
            <div className="h-3 bg-gray-200 rounded w-20"></div>
            <div className="h-2 bg-gray-200 rounded w-16"></div>
          </div>
        </div>
      </td>
      <td className="py-4 px-4">
        <div className="h-4 bg-gray-200 rounded w-16 ml-auto"></div>
      </td>
      <td className="py-4 px-4">
        <div className="h-4 bg-gray-200 rounded w-12 ml-auto"></div>
      </td>
      <td className="py-4 px-4">
        <div className="h-5 bg-gray-200 rounded w-20 ml-auto"></div>
      </td>
      <td className="py-4 px-4">
        <div className="h-4 bg-gray-200 rounded w-16 mx-auto"></div>
      </td>
      <td className="py-4 px-4">
        <div className="h-6 bg-gray-200 rounded-full w-16 mx-auto"></div>
      </td>
      <td className="py-4 px-4">
        <div className="h-4 bg-gray-200 rounded w-12 mx-auto"></div>
      </td>
      <td className="py-4 px-4">
        <div className="h-8 bg-gray-200 rounded-lg w-20 mx-auto"></div>
      </td>
    </tr>
  );
};

export const ComparisonTableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="p-6 space-y-4">
        <div className="h-6 bg-gray-200 rounded w-1/3"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              {Array.from({ length: 8 }).map((_, i) => (
                <th key={i} className="py-3 px-4">
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, i) => (
              <TableRowSkeleton key={i} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const ChartSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
      <div className="space-y-4">
        <div className="h-6 bg-gray-200 rounded w-1/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        <div className="grid grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded-xl"></div>
          ))}
        </div>
        <div className="h-80 bg-gray-200 rounded-xl"></div>
      </div>
    </div>
  );
};

export const WatchlistSkeleton: React.FC = () => {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
          <div className="flex gap-6">
            <div className="w-32 h-32 bg-gray-200 rounded-xl"></div>
            <div className="flex-1 space-y-3">
              <div className="h-5 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="grid grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, j) => (
                  <div key={j} className="space-y-1">
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
