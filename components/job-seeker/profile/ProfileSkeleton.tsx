import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ProfileSkeleton() {
  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Profile header with photo */}
        <div className="w-full md:w-1/3">
          <Card>
            <CardHeader className="pb-2">
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4">
              <Skeleton className="h-32 w-32 rounded-full" />
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-5 w-40" />
              <div className="w-full mt-2">
                <Skeleton className="h-10 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Main content area */}
        <div className="w-full md:w-2/3">
          <Card>
            <CardHeader className="pb-2">
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="informasi-dasar">
                <TabsList className="w-full grid grid-cols-3 mb-4">
                  <Skeleton className="h-8 w-full col-span-1" />
                  <Skeleton className="h-8 w-full col-span-1" />
                  <Skeleton className="h-8 w-full col-span-1" />
                </TabsList>
                
                <TabsContent value="informasi-dasar" className="space-y-4">
                  {Array(4).fill(0).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ))}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* CV and Documents section */}
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-4">
          <Skeleton className="h-40 w-full md:w-1/3" />
          <div className="w-full md:w-2/3 space-y-3">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-10 w-40 mt-4" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 