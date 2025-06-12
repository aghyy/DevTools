"use client";

import { TopSpacing } from "@/components/top-spacing";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { MagicCard } from "@/components/ui/magic-card";
import { useRouter } from "next/navigation";
import { tools, Tool } from "@/utils/tools";
import { ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

export default function Tools() {
  return (
    <div className="h-full w-full">
      <div className="relative size-0">
        <Breadcrumb className="absolute left-20 top-[22px] w-max">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Tools</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <TopSpacing />

      <div className="mx-8 mt-8 mb-24">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Developer Tools</h1>
          <p className="text-muted-foreground mt-2">A collection of useful tools for developers</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {tools.map((tool, index) => (
            <ToolCard key={tool.title} tool={tool} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
}

type ToolCardProps = {
  tool: Tool;
  index: number;
};

function ToolCard({ tool, index }: ToolCardProps) {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.1,
        delay: index * 0.05
      }}
    >
      <MagicCard className="overflow-hidden cursor-pointer h-[180px]" onClick={() => router.push(tool.url)}>
        <Card className="h-full border-0 bg-transparent">
          <CardHeader>
            <div className="flex items-center gap-3">
              {tool.icon && <tool.icon className="size-5" />}
              <CardTitle className="text-xl">{tool.title}</CardTitle>
            </div>
            <CardDescription className="mt-2">{tool.description}</CardDescription>
          </CardHeader>
          <CardFooter className="absolute bottom-0 w-full flex items-center justify-between">
            <div className="text-sm text-muted-foreground hover:underline">Open tool</div>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
          </CardFooter>
        </Card>
      </MagicCard>
    </motion.div>
  );
}
