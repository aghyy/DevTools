"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { updatePrivacySettings } from "@/services/auth";
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
import { Shield } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select";

export default function PrivacyPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [userData] = useAtom(userDataAtom);
  const [, updateUserData] = useAtom(updateUserDataAtom);
  const [privacy, setPrivacy] = useState<{
    profileVisibility: 'public' | 'private' | 'connections';
    showEmail: boolean;
    showActivity: boolean;
  } | null>(null);

  const routeTo = (path: string) => {
    router.push(path);
  };

  useEffect(() => {
    if (userData) {
      setPrivacy({
        profileVisibility: userData.profileVisibility,
        showEmail: userData.showEmail,
        showActivity: userData.showActivity,
      });
    }
  }, [userData]);

  type PrivacyKey = 'profileVisibility' | 'showEmail' | 'showActivity';

  const handlePrivacyChange = async (key: PrivacyKey, value: string | boolean) => {
    if (!privacy) return;

    try {
      const updatedPrivacy = { ...privacy };
      if (key === 'profileVisibility' && typeof value === 'string') {
        updatedPrivacy.profileVisibility = value as 'public' | 'private' | 'connections';
      } else if (key === 'showEmail' || key === 'showActivity') {
        updatedPrivacy[key] = value as boolean;
      }
      const updatedUser = await updatePrivacySettings(updatedPrivacy);
      updateUserData(updatedUser);
      setPrivacy(updatedPrivacy);
      toast({
        title: "Success",
        description: "Privacy settings updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update privacy settings",
        variant: "destructive",
      });
      // Revert the change in UI
      setPrivacy(prev => prev ? { ...prev } : null);
    }
  };

  if (!privacy) {
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
              <BreadcrumbPage>Privacy</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <TopSpacing />

      <div className="mx-8 mb-12 space-y-6 mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" /> Privacy Settings</CardTitle>
            <CardDescription>
              Control your privacy preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Profile Visibility</Label>
                <p className="text-sm text-muted-foreground">
                  Control who can see your profile
                </p>
              </div>
              <div className="w-48">
                <Select
                  value={privacy.profileVisibility}
                  onValueChange={(value) => handlePrivacyChange('profileVisibility', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select visibility" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="connections">Connections Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Show Email</Label>
                <p className="text-sm text-muted-foreground">
                  Display your email on your profile
                </p>
              </div>
              <Switch
                checked={privacy.showEmail}
                onCheckedChange={(checked) => handlePrivacyChange('showEmail', checked)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Activity Status</Label>
                <p className="text-sm text-muted-foreground">
                  Show when you&apos;re active
                </p>
              </div>
              <Switch
                checked={privacy.showActivity}
                onCheckedChange={(checked) => handlePrivacyChange('showActivity', checked)}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 