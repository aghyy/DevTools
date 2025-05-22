import { CardHeader, CardContent, CardTitle, CardDescription, Card } from "@/components/ui/card";
import { MagicCard } from "@/components/ui/magic-card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Code, Hammer, Book } from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";

export default function FeaturedSection({ loading = false }: { loading?: boolean }) {
  const featuredLinks = [
    {
      name: "Tools",
      href: "/tools",
      icon: Hammer,
      description: "Use our suite of developer tools"
    },
    {
      name: "Bookmarks",
      href: "/bookmarks",
      icon: Book,
      description: "Browse through your bookmarks"
    },
    {
      name: "Code Snippets",
      href: "/code-snippets",
      icon: Code,
      description: "Browse through your code snippets"
    }
  ];

  const { theme, systemTheme } = useTheme();
  const resolvedTheme = theme === 'system' ? systemTheme : theme;
  const isDark = resolvedTheme === 'dark';
  const router = useRouter();

  const routeTo = (path: string) => {
    router.push(path);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-[160px] md:h-[180px] w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
      {featuredLinks.map((link, index) => (
        <MagicCard
          key={index}
          className="overflow-hidden cursor-pointer h-[160px] md:h-[180px]"
          onClick={() => routeTo(link.href)}
        >
          <Card className="h-full border-0 bg-transparent">
            <CardHeader className="p-3 md:p-4 pb-0">
              <div
                className={cn(
                  "p-1.5 md:p-2 rounded-full w-fit",
                  isDark ? "bg-primary/10" : "bg-primary/5"
                )}
                suppressHydrationWarning
              >
                <link.icon className="h-4 w-4 md:h-5 md:w-5" />
              </div>
            </CardHeader>
            <CardContent className="p-3 md:p-4">
              <CardTitle className="text-base md:text-lg">{link.name}</CardTitle>
              <CardDescription className="mt-1 text-xs md:text-sm">{link.description}</CardDescription>
            </CardContent>
          </Card>
        </MagicCard>
      ))}
    </div>
  )
}