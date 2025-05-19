"use client";

import { useRouter } from "next/navigation";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Bell, Shield } from "lucide-react";
import { TopSpacing } from "@/components/top-spacing";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

export default function Settings() {
  const router = useRouter();

  const routeTo = (path: string) => {
    router.push(path);
  };

  const settingsSections = [
    {
      title: "Account",
      description: "Manage your account settings and profile information",
      icon: User,
      path: "/settings/account",
    },
    {
      title: "Notifications",
      description: "Configure your notification preferences",
      icon: Bell,
      path: "/settings/notifications",
    },
    {
      title: "Privacy",
      description: "Control your privacy settings and profile visibility",
      icon: Shield,
      path: "/settings/privacy",
    },
  ];

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

      <div className="mx-8 mb-12 mt-8">
        <h1 className="text-3xl font-bold mb-8">Settings</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {settingsSections.map((section) => (
            <Card 
              key={section.path}
              className="cursor-pointer hover:bg-accent/50 transition-colors"
              onClick={() => routeTo(section.path)}
            >
              <CardHeader>
                <div className="flex items-center gap-4">
                  <section.icon className="h-6 w-6" />
                  <div className="flex flex-col gap-1">
                    <CardTitle>{section.title}</CardTitle>
                    <CardDescription>{section.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
