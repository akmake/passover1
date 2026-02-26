// client/src/components/SkeletonLoaders.jsx
// רכיבי Skeleton Loading בסגנון יוקרתי של האתר

import React from 'react';

// אנימציית shimmer בסיסית
const shimmerClass = 'animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%]';

/**
 * Skeleton עבור ProductCard
 */
export const ProductCardSkeleton = () => (
  <div className="flex flex-col items-center">
    <div className={`w-full aspect-[3/4] ${shimmerClass} rounded mb-3`} />
    <div className={`h-4 w-3/4 ${shimmerClass} rounded mb-2`} />
    <div className={`h-3 w-1/2 ${shimmerClass} rounded`} />
  </div>
);

/**
 * Skeleton Grid עבור רשימת מוצרים
 */
export const ProductGridSkeleton = ({ count = 8 }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <ProductCardSkeleton key={i} />
    ))}
  </div>
);

/**
 * Skeleton עבור PackageCard
 */
export const PackageCardSkeleton = () => (
  <div className="border border-gray-100 rounded-lg p-4 shadow-sm">
    <div className={`w-full aspect-[16/9] ${shimmerClass} rounded mb-4`} />
    <div className={`h-5 w-2/3 ${shimmerClass} rounded mb-3`} />
    <div className={`h-3 w-full ${shimmerClass} rounded mb-2`} />
    <div className={`h-3 w-4/5 ${shimmerClass} rounded mb-4`} />
    <div className={`h-10 w-full ${shimmerClass} rounded`} />
  </div>
);

/**
 * Skeleton עבור טבלת אדמין
 */
export const TableRowSkeleton = ({ cols = 5 }) => (
  <tr>
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="px-4 py-3">
        <div className={`h-4 ${shimmerClass} rounded`} style={{ width: `${60 + Math.random() * 30}%` }} />
      </td>
    ))}
  </tr>
);

export const TableSkeleton = ({ rows = 5, cols = 5 }) => (
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead>
        <tr>
          {Array.from({ length: cols }).map((_, i) => (
            <th key={i} className="px-4 py-3 text-right">
              <div className={`h-3 w-20 ${shimmerClass} rounded`} />
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: rows }).map((_, i) => (
          <TableRowSkeleton key={i} cols={cols} />
        ))}
      </tbody>
    </table>
  </div>
);

/**
 * Skeleton עבור דף הבית - Hero Section
 */
export const HeroSkeleton = () => (
  <div className="relative w-full h-[80vh]">
    <div className={`w-full h-full ${shimmerClass}`} />
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-8">
      <div className={`h-10 w-64 bg-white/30 rounded`} />
      <div className={`h-6 w-48 bg-white/20 rounded`} />
      <div className={`h-12 w-40 bg-white/25 rounded mt-4`} />
    </div>
  </div>
);

/**
 * Skeleton עבור Order Card
 */
export const OrderCardSkeleton = () => (
  <div className="border border-gray-100 rounded-lg p-5 shadow-sm space-y-3">
    <div className="flex justify-between items-center">
      <div className={`h-5 w-32 ${shimmerClass} rounded`} />
      <div className={`h-6 w-20 ${shimmerClass} rounded-full`} />
    </div>
    <div className={`h-4 w-48 ${shimmerClass} rounded`} />
    <div className={`h-4 w-36 ${shimmerClass} rounded`} />
    <div className="flex justify-between items-center pt-2">
      <div className={`h-5 w-24 ${shimmerClass} rounded`} />
      <div className={`h-8 w-28 ${shimmerClass} rounded`} />
    </div>
  </div>
);

/**
 * Skeleton גנרי - שורות תוכן
 */
export const ContentSkeleton = ({ lines = 3 }) => (
  <div className="space-y-3">
    {Array.from({ length: lines }).map((_, i) => (
      <div
        key={i}
        className={`h-4 ${shimmerClass} rounded`}
        style={{ width: `${70 + Math.random() * 25}%` }}
      />
    ))}
  </div>
);

/**
 * Skeleton עבור Dashboard Cards
 */
export const DashboardCardSkeleton = () => (
  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
    <div className={`h-4 w-20 ${shimmerClass} rounded mb-3`} />
    <div className={`h-8 w-16 ${shimmerClass} rounded`} />
  </div>
);

export const DashboardSkeleton = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <DashboardCardSkeleton key={i} />
      ))}
    </div>
    <TableSkeleton rows={5} cols={5} />
  </div>
);
