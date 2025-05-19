"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { updateNotificationPreferences } from "@/services/auth";
import { useAtom } from "jotai";
import { userDataAtom, updateUserDataAtom } from "@/atoms/auth";

import { TopSpacing } from "@/components/top-spacing";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

export default function Notifications() {
  const router = useRouter();
  const { toast } = useToast();
  const [userData] = useAtom(userDataAtom);
  const [, updateUserData] = useAtom(updateUserDataAtom);
  const [notifications, setNotifications] = useState<{
    emailNotifications: boolean;
    pushNotifications: boolean;
    marketingEmails: boolean;
  } | null>(null);

  const routeTo = (path: string) => {
    router.push(path);
  };

  useEffect(() => {
    if (userData) {
      setNotifications({
        emailNotifications: userData.emailNotifications,
        pushNotifications: userData.pushNotifications,
        marketingEmails: userData.marketingEmails,
      });
    }
  }, [userData]);

  type NotificationKey = 'emailNotifications' | 'pushNotifications' | 'marketingEmails';

  const handleNotificationChange = async (key: NotificationKey, value: boolean) => {
    if (!notifications) return;

    try {
      const updatedNotifications = { ...notifications, [key]: value };
      const updatedUser = await updateNotificationPreferences(updatedNotifications);
      updateUserData(updatedUser);
      setNotifications(updatedNotifications);
      toast({
        title: "Success",
        description: "Notification preferences updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update notification preferences",
        variant: "destructive",
      });
      // Revert the change in UI
      setNotifications(prev => prev ? { ...prev } : null);
    }
  };

  if (!notifications) {
    return null; // or a loading state
  }

  return (
    <div className="h-full w-full">
      <div className="relative size-0">
        <Breadcrumb className="absolute left-20 top-[22px] w-max">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink className="cursor-pointer" onClick={() => routeTo('/settings')}>Settings</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Notifications</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <TopSpacing />

      <div className="mx-12 mb-12 space-y-6 mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5" /> Notification Preferences</CardTitle>
            <CardDescription>
              Manage how you receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications via email
                </p>
              </div>
              <Switch
                checked={notifications?.emailNotifications}
                onCheckedChange={(checked) => handleNotificationChange('emailNotifications', checked)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Push Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive push notifications
                </p>
              </div>
              <Switch
                checked={notifications?.pushNotifications}
                onCheckedChange={(checked) => handleNotificationChange('pushNotifications', checked)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Marketing Emails</Label>
                <p className="text-sm text-muted-foreground">
                  Receive marketing and promotional emails
                </p>
              </div>
              <Switch
                checked={notifications?.marketingEmails}
                onCheckedChange={(checked) => handleNotificationChange('marketingEmails', checked)}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 