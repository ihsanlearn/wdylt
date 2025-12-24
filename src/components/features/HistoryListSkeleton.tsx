import { Card, CardContent } from "@/components/ui/card";

export function HistorySkeleton() {
  return (
    <div className="space-y-8">
      {[1, 2].map((group) => (
        <div key={group} className="relative pl-6 border-l border-border/50">
          <div className="absolute -left-1.5 top-0 h-3 w-3 rounded-full bg-border" />
          <div className="mb-4 h-4 w-32 rounded bg-muted animate-pulse" />
          
          <div className="space-y-4">
            {[1, 2].map((item) => (
              <Card key={item} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-3 w-full">
                       <div className="flex items-center gap-2">
                          <div className="h-5 w-24 rounded-full bg-muted animate-pulse" />
                       </div>
                       <div className="space-y-2">
                          <div className="h-4 w-3/4 rounded bg-muted animate-pulse" />
                          <div className="h-4 w-1/2 rounded bg-muted animate-pulse" />
                       </div>
                       <div className="h-3 w-40 rounded bg-muted/50 animate-pulse border-l-2 pl-2" />
                    </div>
                    <div className="flex flex-col gap-2">
                        <div className="h-6 w-6 rounded bg-muted animate-pulse" />
                        <div className="h-6 w-6 rounded bg-muted animate-pulse" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
