"use client";

import { useRouter } from "next/navigation";

import { TopSpacing } from "@/components/top-spacing";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export default function Settings() {
  const router = useRouter();

  const routeTo = (path: string) => {
    router.push(path);
  }

  return (
    <div className="h-full w-full">
      <div className="relative size-0">
        <Breadcrumb className="absolute left-20 top-[22px] w-max">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Settings</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <TopSpacing />

      <div className="mx-12 mb-24">
        
      </div>
    </div>
  );
}
