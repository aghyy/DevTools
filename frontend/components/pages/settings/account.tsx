"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { uploadAvatar, removeAvatar, updateProfile, changePassword } from "@/services/auth";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Camera, Mail, User, Lock, Minus } from "lucide-react";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function AccountPage() {
  const router = useRouter();
  const [userData] = useAtom(userDataAtom);
  const [, updateUserData] = useAtom(updateUserDataAtom);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const routeTo = (path: string) => {
    router.push(path);
  };

  useEffect(() => {
    if (userData) {
      setFormData({
        firstName: userData.firstName,
        lastName: userData.lastName,
        username: userData.username,
        email: userData.email,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    }
  }, [userData]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload a valid image file (JPEG, PNG, or GIF)");
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setIsUploading(true);
    try {
      const updatedUser = await uploadAvatar(file);
      updateUserData(updatedUser);
      toast.success("Profile picture updated successfully");
    } catch {
      toast.error("Failed to upload profile picture");
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
      const updatedUser = await removeAvatar();
      updateUserData(updatedUser);
      toast.success("Profile picture removed successfully");
    } catch {
      toast.error("Failed to remove profile picture");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      const updatedUser = await updateProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        username: formData.username,
        email: formData.email,
      });
      updateUserData(updatedUser);
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      await changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      toast.success("Password changed successfully");
      // Clear password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to change password");
    } finally {
      setIsLoading(false);
    }
  };

  if (!userData) {
    return null;
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
              <BreadcrumbPage>Account</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <TopSpacing />

      <div className="mx-8 mb-12 space-y-6 mt-8">
        {/* Profile Picture Card */}
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
                <Avatar className="h-32 w-32 border-4 border-primary/20 hover:border-primary/40 transition-all duration-200">
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
                    className="absolute -top-1 -right-1 rounded-full bg-red-500 hover:bg-red-500/80"
                    onClick={handleRemoveAvatar}
                    disabled={isUploading}
                  >
                    <Minus className="h-3 w-3" />
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

        {/* Personal Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><User className="h-5 w-5" /> Personal Information</CardTitle>
            <CardDescription>
              Update your personal details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="flex items-center gap-1"><User className="h-4 w-4" /> First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="Enter your first name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="flex items-center gap-1"><User className="h-4 w-4" /> Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Enter your last name"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="username" className="flex items-center gap-1"><User className="h-4 w-4" /> Username</Label>
              <Input
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Choose a username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-1"><Mail className="h-4 w-4" /> Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
              />
            </div>
            <Button onClick={handleSaveProfile} disabled={isLoading}>
              Save Changes
            </Button>
          </CardContent>
        </Card>

        {/* Password Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Lock className="h-5 w-5" /> Change Password</CardTitle>
            <CardDescription>
              Update your password to keep your account secure
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword" className="flex items-center gap-1"><Lock className="h-4 w-4" /> Current Password</Label>
              <Input
                id="currentPassword"
                name="currentPassword"
                type="password"
                value={formData.currentPassword}
                onChange={handleInputChange}
                placeholder="Enter current password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="flex items-center gap-1"><Lock className="h-4 w-4" /> New Password</Label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                value={formData.newPassword}
                onChange={handleInputChange}
                placeholder="Enter new password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="flex items-center gap-1"><Lock className="h-4 w-4" /> Confirm New Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm new password"
              />
            </div>
            <Button onClick={handleChangePassword} disabled={isLoading}>
              Update Password
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
