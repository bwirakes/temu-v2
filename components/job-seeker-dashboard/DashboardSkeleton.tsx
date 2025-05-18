"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <Skeleton className="h-10 w-64" />
        <div className="flex w-full md:w-auto gap-2">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      {/* Sample Job IDs Card Skeleton */}
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {Array(4).fill(0).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardHeader className="py-2 px-3">
                  <Skeleton className="h-5 w-24" />
                </CardHeader>
                <CardContent className="py-2 px-3">
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-3 w-24" />
                </CardContent>
                <CardFooter className="py-2 px-3 border-t">
                  <Skeleton className="h-4 w-28" />
                </CardFooter>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Menu Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array(3).fill(0).map((_, i) => (
          <Card key={i} className="h-full">
            <CardHeader className="pb-2">
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-5 w-24" />
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Applications Table Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40 mb-2" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    {['ID Lowongan', 'Posisi', 'Perusahaan', 'Status', 'Tanggal', ''].map((header, i) => (
                      <th key={i} className="text-left py-2 px-2 font-medium">
                        <Skeleton className="h-4 w-20" />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array(3).fill(0).map((_, i) => (
                    <tr key={i} className="border-b">
                      <td className="py-2 px-2"><Skeleton className="h-4 w-16" /></td>
                      <td className="py-2 px-2"><Skeleton className="h-4 w-32" /></td>
                      <td className="py-2 px-2"><Skeleton className="h-4 w-24" /></td>
                      <td className="py-2 px-2"><Skeleton className="h-4 w-16" /></td>
                      <td className="py-2 px-2"><Skeleton className="h-4 w-20" /></td>
                      <td className="py-2 px-2 text-right">
                        <Skeleton className="h-8 w-16 ml-auto" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 