"use client";

import React, { useState, useEffect } from "react";
import { TopSpacing } from "@/components/top-spacing";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage
} from "@/components/ui/breadcrumb";
import { BookmarkCard } from "@/components/bookmarks/bookmark-card";
import { BookmarkForm } from "@/components/bookmarks/bookmark-form";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, ExternalLink, Filter, TagIcon, FolderIcon, Globe, User } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bookmark, BookmarkFormData } from "@/types/bookmarks";
import {
  getUserBookmarks,
  createBookmark,
  updateBookmark,
  deleteBookmark,
  getUserCategories,
  getUserTags,
  getAllPublicBookmarks
} from "@/services/bookmarkService";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAtom } from "jotai";
import { userDataAtom } from "@/atoms/auth";
import { toast } from "sonner";
import { ActiveTab } from "@/types/user";

// Interface for public bookmarks by user
interface UserPublicBookmarks {
  user: string;
  username: string;
  bookmarks: Bookmark[];
}

export default function Bookmarks() {
  // Atoms
  const [userData] = useAtom(userDataAtom);

  // State
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>("personal");
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [filteredBookmarks, setFilteredBookmarks] = useState<Bookmark[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [tags, setTags] = useState<{ tag: string; count: number }[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [publicBookmarks, setPublicBookmarks] = useState<UserPublicBookmarks[]>([]);

  // Form and dialog state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | undefined>(undefined);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bookmarkToDelete, setBookmarkToDelete] = useState<Bookmark | null>(null);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);

  // Initialize data
  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true);
      try {
        // Set initial tab based on auth state
        if (!userData) {
          setActiveTab("public");
          await fetchPublicBookmarks();
        } else {
          setActiveTab("personal");
          await Promise.all([
            fetchPublicBookmarks(),
            fetchPersonalBookmarks(),
            fetchCategories(),
            fetchTags()
          ]);
        }
      } catch {
        toast.error("Failed to load bookmarks");
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();
  }, [userData]);

  // Handle tab changes
  useEffect(() => {
    const loadTabData = async () => {
      if (isLoading || !userData) return; // Don't load if guest or loading

      setIsLoading(true);
      try {
        if (activeTab === "public") {
          await fetchPublicBookmarks();
        } else {
          await Promise.all([
            fetchPersonalBookmarks(),
            fetchCategories(),
            fetchTags()
          ]);
        }
      } catch (err) {
        console.error('Failed to load tab data:', err);
        toast.error("Failed to load bookmarks");
      } finally {
        setIsLoading(false);
      }
    };

    loadTabData();
  }, [activeTab, userData]);

  // Apply filters and search
  useEffect(() => {
    let results: Bookmark[] = [];

    if (activeTab === "personal" && userData) {
      results = [...bookmarks];
    } else {
      // Flatten public bookmarks
      publicBookmarks.forEach(userBookmarks => {
        results = results.concat(userBookmarks.bookmarks);
      });
    }

    // Apply user filter
    if (selectedUser) {
      const userBookmarks = publicBookmarks.find(ub => ub.username === selectedUser);
      if (userBookmarks) {
        results = userBookmarks.bookmarks;
      }
    }

    // Apply category filter
    if (selectedCategory) {
      results = results.filter(bookmark => bookmark.category === selectedCategory);
    }

    // Apply tag filter
    if (selectedTag) {
      results = results.filter(bookmark => bookmark.tags.includes(selectedTag));
    }

    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(bookmark =>
        bookmark.title.toLowerCase().includes(term) ||
        (bookmark.description && bookmark.description.toLowerCase().includes(term)) ||
        bookmark.url.toLowerCase().includes(term) ||
        (bookmark.category && bookmark.category.toLowerCase().includes(term)) ||
        bookmark.tags.some(tag => tag.toLowerCase().includes(term))
      );
    }

    setFilteredBookmarks(results);
  }, [bookmarks, publicBookmarks, searchTerm, selectedCategory, selectedTag, selectedUser, activeTab, userData]);

  // Fetch functions
  const fetchPersonalBookmarks = async () => {
    setIsLoading(true);
    try {
      const bookmarks = await getUserBookmarks();
      setBookmarks(bookmarks);
      setFilteredBookmarks(bookmarks);
    } catch {
      toast.error("Failed to load bookmarks");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPublicBookmarks = async () => {
    setIsLoading(true);
    try {
      const allPublicBookmarks = await getAllPublicBookmarks();
      setPublicBookmarks(allPublicBookmarks);

      // Get all unique categories and tags from public bookmarks
      const categoryMap = new Map<string, number>();
      const tagMap = new Map<string, number>();

      allPublicBookmarks.forEach(userBookmarks => {
        userBookmarks.bookmarks.forEach(bookmark => {
          // Count categories
          if (bookmark.category) {
            categoryMap.set(bookmark.category, (categoryMap.get(bookmark.category) || 0) + 1);
          }

          // Count tags
          bookmark.tags.forEach(tag => {
            tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
          });
        });
      });

      // Update categories and tags for public view
      if (activeTab === "public") {
        setCategories(Array.from(categoryMap.keys()));
        setTags(Array.from(tagMap.entries()).map(([tag, count]) => ({ tag, count })));
      }

      // Flatten all public bookmarks for display
      let allBookmarks: Bookmark[] = [];
      allPublicBookmarks.forEach(userBookmarks => {
        allBookmarks = allBookmarks.concat(userBookmarks.bookmarks);
      });

      setFilteredBookmarks(allBookmarks);
    } catch {
      toast.error("Failed to load public bookmarks");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await getUserCategories();
      setCategories(data);
    } catch {
      toast.error("Failed to load categories");
    }
  };

  const fetchTags = async () => {
    try {
      const data = await getUserTags();
      setTags(data);
    } catch {
      toast.error("Failed to load tags");
    }
  };

  // Form handling
  const handleOpenForm = (bookmark?: Bookmark) => {
    setEditingBookmark(bookmark);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingBookmark(undefined);
  };

  const handleFormSubmit = async (data: BookmarkFormData) => {
    setIsProcessing(true);
    try {
      if (editingBookmark) {
        // Update existing bookmark
        const updated = await updateBookmark(editingBookmark.id, data);
        setBookmarks(bookmarks.map(bookmark => bookmark.id === editingBookmark.id ? updated : bookmark));
        toast.success("Bookmark updated successfully");
      } else {
        // Create new bookmark
        const created = await createBookmark(data);
        setBookmarks([created, ...bookmarks]);
        toast.success("Bookmark added successfully");
      }
      handleCloseForm();
      // Refresh data
      fetchCategories();
      fetchTags();
    } catch {
      toast.error(editingBookmark
        ? "Failed to update bookmark"
        : "Failed to add bookmark");
    } finally {
      setIsProcessing(false);
    }
  };

  // Delete handling
  const handleDeleteClick = (bookmark: Bookmark) => {
    setBookmarkToDelete(bookmark);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!bookmarkToDelete) return;

    try {
      await deleteBookmark(bookmarkToDelete.id);
      setBookmarks(bookmarks.filter(bookmark => bookmark.id !== bookmarkToDelete.id));
      toast.success("Bookmark deleted successfully");
      // Refresh data
      fetchCategories();
      fetchTags();
    } catch {
      toast.error("Failed to delete bookmark");
    } finally {
      setDeleteDialogOpen(false);
      setBookmarkToDelete(null);
    }
  };

  // Filter handling
  const clearFilters = () => {
    setSelectedCategory(null);
    setSelectedTag(null);
    setSelectedUser(null);
    setSearchTerm("");
    setFilterDialogOpen(false);
  };

  // Handle tab change - only called for logged-in users
  const handleTabChange = (value: string) => {
    // Only allow switching to personal if logged in
    if (value === "personal" && !userData) {
      return;
    }
    setActiveTab(value as ActiveTab);
  };

  // Rendering
  const renderNoResults = () => (
    <div className="text-center py-16">
      <div className="flex justify-center mb-4">
        <ExternalLink className="h-16 w-16 text-muted-foreground/50" />
      </div>
      <h3 className="text-xl font-medium mb-2">No bookmarks found</h3>
      <p className="text-muted-foreground mb-6">
        {activeTab === "personal" ? (
          bookmarks.length > 0
            ? "Try adjusting your filters or search term"
            : "Add your first bookmark to get started"
        ) : (
          "No public bookmarks available"
        )}
      </p>
      {activeTab === "personal" && userData && (
        <Button onClick={() => handleOpenForm()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Bookmark
        </Button>
      )}
    </div>
  );

  return (
    <div className="h-full w-full">
      <div className="relative size-0">
        <Breadcrumb className="absolute z-50 left-20 top-[22px] w-max">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Bookmarks</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <TopSpacing />

      <div className="w-full px-8 pt-8 pb-24 mx-auto">
        <div className="flex flex-col mb-8">
          <h1 className="text-3xl font-bold mb-2">Bookmarks</h1>
          <div className="text-muted-foreground">
            {userData ? (
              `${userData.firstName}'s bookmarks and favorite resources`
            ) : (
              "Public bookmarks shared by the community"
            )}
          </div>
        </div>

        {/* Tabs - Show for everyone but disable personal if not logged in */}
        {userData && (
          <div className="flex justify-between items-center mb-4">
            <Tabs value={activeTab} onValueChange={handleTabChange}>
              <TabsList>
                <TabsTrigger
                  value="personal"
                  className="flex items-center gap-2"
                  disabled={!userData}
                >
                  <User className="h-4 w-4" />
                  Personal
                </TabsTrigger>
                <TabsTrigger value="public" className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Public
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {userData && activeTab === "personal" && (
              <Button onClick={() => handleOpenForm()} className="gap-1">
                <Plus size={16} />
                Add Bookmark
              </Button>
            )}
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-6">
          {/* Main content */}
          <div className="flex-1">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="w-full h-[250px] animate-pulse">
                    <div className="h-32 bg-muted" />
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-muted rounded w-3/4" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                    </div>
                  </Card>
                ))}
              </div>
            ) : filteredBookmarks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredBookmarks.map((bookmark) => {
                  // Find the user who owns this bookmark
                  const userBookmarks = publicBookmarks.find(ub =>
                    ub.bookmarks.some(b => b.id === bookmark.id)
                  );

                  return (
                    <BookmarkCard
                      key={bookmark.id}
                      bookmark={bookmark}
                      onEdit={activeTab === "personal" && userData ? handleOpenForm : undefined}
                      onDelete={activeTab === "personal" && userData ? handleDeleteClick : undefined}
                      showControls={Boolean(activeTab === "personal" && userData)}
                      userInfo={userBookmarks ? {
                        firstName: userBookmarks.user.split(' ')[0],
                        lastName: userBookmarks.user.split(' ')[1] || '',
                        username: userBookmarks.username
                      } : undefined}
                    />
                  );
                })}
              </div>
            ) : (
              renderNoResults()
            )}
          </div>

          {/* Sidebar */}
          <div className="md:w-64 space-y-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search bookmarks..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Users list - Only show for public bookmarks */}
            {(activeTab === "public" || !userData) && publicBookmarks.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Users
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1.5">
                  {publicBookmarks.map((userBookmarks) => (
                    <div
                      key={userBookmarks.username}
                      className={`flex items-center p-2 rounded-md hover:bg-muted cursor-pointer ${selectedUser === userBookmarks.username ? 'bg-muted' : ''}`}
                      onClick={() => setSelectedUser(selectedUser === userBookmarks.username ? null : userBookmarks.username)}
                    >
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarFallback className="text-xs">
                          {userBookmarks.username.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-sm font-medium">{userBookmarks.user}</div>
                        <div className="text-xs text-muted-foreground">
                          {userBookmarks.bookmarks.length} bookmarks
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Popular Tags */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center">
                  <TagIcon className="h-4 w-4 mr-2" />
                  Popular Tags
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {tags.slice(0, 15).map((tag) => (
                    <Badge
                      key={tag.tag}
                      variant={selectedTag === tag.tag ? "default" : "secondary"}
                      className="cursor-pointer"
                      onClick={() => setSelectedTag(selectedTag === tag.tag ? null : tag.tag)}
                    >
                      {tag.tag}
                      <span className="ml-1 text-xs opacity-70">{tag.count}</span>
                    </Badge>
                  ))}
                  {tags.length === 0 && (
                    <div className="text-sm text-muted-foreground py-2">
                      No tags yet
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Categories */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <FolderIcon className="h-4 w-4 mr-2" />
                    Categories
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-1.5">
                <div
                  className={`text-sm px-2 py-1.5 rounded-md cursor-pointer hover:bg-muted flex items-center justify-between ${selectedCategory === null ? 'bg-muted font-medium' : ''}`}
                  onClick={() => setSelectedCategory(null)}
                >
                  <span>All Categories</span>
                  <Badge variant="outline" className="ml-auto">
                    {activeTab === "personal" ? bookmarks.length : filteredBookmarks.length}
                  </Badge>
                </div>
                {categories.map((category) => (
                  <div
                    key={category}
                    className={`text-sm px-2 py-1.5 rounded-md cursor-pointer hover:bg-muted flex items-center justify-between ${selectedCategory === category ? 'bg-muted font-medium' : ''}`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    <span>{category}</span>
                    <Badge variant="outline" className="ml-auto">
                      {filteredBookmarks.filter(bookmark => bookmark.category === category).length}
                    </Badge>
                  </div>
                ))}
                {categories.length === 0 && (
                  <div className="text-sm text-muted-foreground p-2">
                    No categories yet
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Mobile filters dialog */}
            <div className="md:hidden">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setFilterDialogOpen(true)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {(selectedCategory || selectedTag) && (
                  <Badge variant="secondary" className="ml-2">
                    {(selectedCategory ? 1 : 0) + (selectedTag ? 1 : 0)}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Form Sheet - Only show for logged in users */}
      {userData && (
        <Sheet open={isFormOpen} onOpenChange={setIsFormOpen}>
          <SheetContent className="sm:max-w-xl overflow-y-auto">
            <SheetHeader>
              <SheetTitle>{editingBookmark ? 'Edit' : 'Add'} Bookmark</SheetTitle>
              <SheetDescription>
                {editingBookmark
                  ? 'Update the details of your bookmark'
                  : 'Add a new bookmark to your collection'}
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6">
              <BookmarkForm
                initialData={editingBookmark}
                onSubmit={handleFormSubmit}
                onCancel={handleCloseForm}
                isProcessing={isProcessing}
              />
            </div>
          </SheetContent>
        </Sheet>
      )}

      {/* Delete Confirmation Dialog - Only show for logged in users */}
      {userData && (
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Bookmark</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this bookmark? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Mobile Filters Dialog - Only show for logged in users */}
      {userData && (
        <Dialog open={filterDialogOpen} onOpenChange={setFilterDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Filters</DialogTitle>
              <DialogDescription>
                Filter your bookmarks by category or tag
              </DialogDescription>
            </DialogHeader>

            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Categories</h4>
              <div className="space-y-1 mb-4">
                <div
                  className={`text-sm px-2 py-1.5 rounded-md cursor-pointer hover:bg-muted ${selectedCategory === null ? 'bg-muted font-medium' : ''}`}
                  onClick={() => setSelectedCategory(null)}
                >
                  All Categories
                </div>
                {categories.map((category) => (
                  <div
                    key={category}
                    className={`text-sm px-2 py-1.5 rounded-md cursor-pointer hover:bg-muted ${selectedCategory === category ? 'bg-muted font-medium' : ''}`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </div>
                ))}
              </div>

              <h4 className="text-sm font-medium mb-2">Tags</h4>
              <div className="flex flex-wrap gap-2 mb-4">
                {tags.slice(0, 20).map((tag) => (
                  <Badge
                    key={tag.tag}
                    variant={selectedTag === tag.tag ? "default" : "secondary"}
                    className="cursor-pointer"
                    onClick={() => setSelectedTag(selectedTag === tag.tag ? null : tag.tag)}
                  >
                    {tag.tag}
                  </Badge>
                ))}
              </div>

              <div className="flex justify-between mt-6">
                <Button
                  variant="outline"
                  onClick={clearFilters}
                >
                  Clear Filters
                </Button>
                <Button onClick={() => setFilterDialogOpen(false)}>
                  Apply
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
