"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Edit, Trash2, Globe, Lock, User } from "lucide-react";
import { Bookmark } from "@/types/bookmarks";
import { LinkPreview } from "@/components/ui/link-preview";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface BookmarkCardProps {
  bookmark: Bookmark;
  onEdit?: (bookmark: Bookmark) => void;
  onDelete?: (bookmark: Bookmark) => void;
  showControls?: boolean;
  userInfo?: {
    firstName: string;
    lastName: string;
    username: string;
  };
}

export const BookmarkCard: React.FC<BookmarkCardProps> = ({
  bookmark,
  onEdit,
  onDelete,
  showControls = true,
  userInfo,
}) => {
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (onEdit) {
      onEdit(bookmark);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (onDelete) {
      onDelete(bookmark);
    }
  };

  const renderFavicon = () => {
    if (bookmark.favicon) {
      return (
        <div className="w-6 h-6 p-1 mr-2 overflow-hidden rounded-full bg-white border">
          <Image
            src={bookmark.favicon}
            alt={`${bookmark.title} favicon`}
            width={16}
            height={16}
            className="object-contain"
          />
        </div>
      );
    }
    return <Globe className="w-4 h-4 mr-2" />;
  };

  return (
    <Card className="overflow-hidden group transition-all duration-300 hover:shadow-md h-full flex flex-col">
      {bookmark.screenshotUrl && (
        <div className="relative h-48 w-full overflow-hidden bg-muted">
          <div className="h-full w-full">
            <Image
              src={bookmark.screenshotUrl}
              alt={bookmark.title}
              fill
              className="object-cover object-top"
            />
          </div>
        </div>
      )}

      <CardHeader className={cn("pb-2", !bookmark.screenshotUrl && "pt-5")}>
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            {renderFavicon()}
            <CardTitle className="text-lg line-clamp-1">{bookmark.title}</CardTitle>
          </div>
          {bookmark.isPublic ? (
            <Globe className="w-4 h-4 text-muted-foreground" />
          ) : (
            <Lock className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
        <CardDescription className="line-clamp-2 mt-1">
          {bookmark.description || "No description provided"}
        </CardDescription>
        {userInfo && (
          <div className="flex items-center gap-2 mt-2">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-[10px]">
                {userInfo.firstName.charAt(0)}
                {userInfo.lastName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <User size={12} />
              <span>{userInfo.firstName} {userInfo.lastName}</span>
              <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">
                @{userInfo.username}
              </Badge>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="pb-2 flex-grow">
        {bookmark.tags && bookmark.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {bookmark.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {bookmark.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{bookmark.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-2 pb-4 flex justify-between">
        <LinkPreview
          url={bookmark.url}
          onClick={() => window.open(bookmark.url, "_blank")}
          width={300}
          height={200}
        >
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              window.open(bookmark.url, "_blank");
            }}
          >
            <ExternalLink className="w-3 h-3 mr-1" />
            Open Link
          </Button>
        </LinkPreview>

        {showControls && (
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handleEditClick}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
              onClick={handleDeleteClick}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}; 