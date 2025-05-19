"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { getUserDetails, uploadAvatar, removeAvatar } from "@/services/auth";
import { UserData } from "@/types/user";

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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Camera, X } from "lucide-react";

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

export default function Account() {
  const router = useRouter();
  const { toast } = useToast();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const routeTo = (path: string) => {
    router.push(path);
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const data = await getUserDetails();
      setUserData(data);
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast({
        title: "Error",
        description: "Failed to load user data",
        variant: "destructive",
      });
    }
  };

  const handleUploadClick = () => {
    console.log('Upload button clicked'); // Debug log
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('File input changed'); // Debug log
    const file = event.target.files?.[0];
    if (!file) return;

    console.log('Selected file:', file); // Debug log

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Error",
        description: "Please upload a valid image file (JPEG, PNG, or GIF)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "File size must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      console.log('Uploading file...'); // Debug log
      const response = await uploadAvatar(file);
      console.log('Upload response:', response); // Debug log
      await fetchUserData();
      toast({
        title: "Success",
        description: "Profile picture updated successfully",
      });
    } catch (error) {
      console.error("Error uploading avatar:", error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : (error as ApiError)?.response?.data?.message || "Failed to upload profile picture";
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      await removeAvatar();
      await fetchUserData();
      toast({
        title: "Success",
        description: "Profile picture removed successfully",
      });
    } catch (error) {
      console.error("Error removing avatar:", error);
      toast({
        title: "Error",
        description: "Failed to remove profile picture",
        variant: "destructive",
      });
    }
  };

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
              <BreadcrumbPage>Account</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <TopSpacing />

      <div className="mx-12 mb-24">
        <Card>
          <CardHeader>
            <CardTitle>Profile Picture</CardTitle>
            <CardDescription>
              Upload or remove your profile picture
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <Avatar className="h-32 w-32 border-4 border-white/20 hover:border-white/40 transition-all duration-200">
                  <AvatarImage 
                    src={userData?.avatar ? `http://localhost:5039/uploads/avatars/${userData.avatar}` : undefined} 
                    alt={`${userData?.firstName} ${userData?.lastName}'s profile picture`}
                  />
                  <AvatarFallback className="text-4xl">
                    {userData?.firstName?.[0]}{userData?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                {userData?.avatar && (
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 rounded-full"
                    onClick={handleRemoveAvatar}
                    disabled={isUploading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="flex flex-col items-center gap-2">
                <Button 
                  variant="outline" 
                  className="gap-2" 
                  disabled={isUploading}
                  onClick={handleUploadClick}
                >
                  <Camera className="h-4 w-4" />
                  {userData?.avatar ? 'Change Picture' : 'Upload Picture'}
                </Button>
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif"
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={isUploading}
                />
                <p className="text-sm text-muted-foreground">
                  JPG, PNG or GIF. Max size: 5MB
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
