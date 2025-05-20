import { getIconComponent } from "@/utils/icons";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { MagicCard } from "@/components/ui/magic-card";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { MostUsedItem } from "@/services/activity";

export default function MostUsed({ loading, mostUsedItems }: { loading: boolean, mostUsedItems: MostUsedItem[] }) {
  const { theme, systemTheme } = useTheme();
  const resolvedTheme = theme === 'system' ? systemTheme : theme;
  const isDark = resolvedTheme === 'dark';

  const router = useRouter();

  const routeTo = (path: string) => {
    router.push(path);
  };

  return (
    <>
      {!loading && mostUsedItems.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {mostUsedItems.slice(0, 6).map((item, idx) => {
            const IconComponent = getIconComponent(item.icon);
            // Ensure count is a number
            const count = typeof item.count === 'number' ? item.count : parseInt(String(item.count), 10) || 0;
            return (
              <MagicCard
                key={idx}
                className="overflow-hidden cursor-pointer"
                onClick={() => routeTo(item.path)}
              >
                <Card className="h-full border-0 bg-transparent">
                  <CardContent className="p-3 md:p-4 flex items-center gap-3 md:gap-4">
                    <div className={cn(
                      "p-2 md:p-3 rounded-full",
                      isDark ? "bg-primary/10" : "bg-primary/5"
                    )}>
                      <IconComponent className="h-4 w-4 md:h-5 md:w-5" />
                    </div>
                    <div className="flex flex-col flex-1 gap-1">
                      <h3 className="font-medium">{item.name}</h3>
                      <div className="flex items-center text-xs">
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-xs",
                          isDark ? "bg-primary/10 text-muted-foreground" : "bg-primary/5 text-muted-foreground"
                        )}>
                          Used {count} time{count !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </MagicCard>
            );
          })}
        </div>
      )
      }
    </>
  )
}