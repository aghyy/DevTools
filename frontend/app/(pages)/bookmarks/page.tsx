"use client";

import React, { useState, useEffect } from "react";
import { TopSpacing } from "@/components/top-spacing";
import { useToast } from "@/hooks/use-toast";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage
} from "@/components/ui/breadcrumb";
import { BookmarkCard } from "@/components/bookmark-card";
import { BookmarkForm } from "@/components/bookmark-form";
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
  DialogFooter,
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
import { Plus, Search, ExternalLink, Filter, TagIcon, FolderIcon } from "lucide-react";
import { Bookmark, BookmarkFormData } from "@/types/bookmarks";
import {
  getUserBookmarks,
  createBookmark,
  updateBookmark,
  deleteBookmark,
  getUserCategories,
  getUserTags
} from "@/services/bookmarkService";

export default function Bookmarks() {
  const { toast } = useToast();

  // State
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [filteredBookmarks, setFilteredBookmarks] = useState<Bookmark[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [tags, setTags] = useState<{ tag: string; count: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Form and dialog state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | undefined>(undefined);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bookmarkToDelete, setBookmarkToDelete] = useState<Bookmark | null>(null);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);

  // Fetch data on component mount
  useEffect(() => {
    fetchBookmarks();
    fetchCategories();
    fetchTags();
  }, []);

  // Apply filters and search
  useEffect(() => {
    let results = [...bookmarks];

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
  }, [bookmarks, searchTerm, selectedCategory, selectedTag]);

  // Fetch functions
  const fetchBookmarks = async () => {
    setIsLoading(true);
    try {
      const bookmarks = await getUserBookmarks();
      setBookmarks(bookmarks);
      setFilteredBookmarks(bookmarks);
    } catch {
      toast({
        title: "Error",
        description: "Failed to load bookmarks",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await getUserCategories();
      setCategories(data);
    } catch {
      console.error("Error fetching categories");
    }
  };

  const fetchTags = async () => {
    try {
      const data = await getUserTags();
      setTags(data);
    } catch {
      console.error("Error fetching tags");
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
        toast({
          title: "Success",
          description: "Bookmark updated successfully",
        });
      } else {
        // Create new bookmark
        const created = await createBookmark(data);
        setBookmarks([created, ...bookmarks]);
        toast({
          title: "Success",
          description: "Bookmark added successfully",
        });
      }
      handleCloseForm();
      // Refresh data
      fetchCategories();
      fetchTags();
    } catch {
      toast({
        title: "Error",
        description: editingBookmark
          ? "Failed to update bookmark"
          : "Failed to add bookmark",
        variant: "destructive",
      });
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
      toast({
        title: "Success",
        description: "Bookmark deleted successfully",
      });
      // Refresh data
      fetchCategories();
      fetchTags();
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete bookmark",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setBookmarkToDelete(null);
    }
  };

  // Filter handling
  const clearFilters = () => {
    setSelectedCategory(null);
    setSelectedTag(null);
    setSearchTerm("");
    setFilterDialogOpen(false);
  };

  // Rendering
  const renderNoResults = () => (
    <div className="text-center py-16">
      <div className="flex justify-center mb-4">
        <ExternalLink className="h-16 w-16 text-muted-foreground/50" />
      </div>
      <h3 className="text-xl font-medium mb-2">No bookmarks found</h3>
      <p className="text-muted-foreground mb-6">
        {bookmarks.length > 0
          ? "Try adjusting your filters or search term"
          : "Add your first bookmark to get started"}
      </p>
      <Button onClick={() => handleOpenForm()}>
        <Plus className="h-4 w-4 mr-2" />
        Add Bookmark
      </Button>
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Bookmarks</h1>
            <p className="text-muted-foreground">
              Save and organize links to your favorite resources
            </p>
          </div>
          <Button onClick={() => handleOpenForm()}>
            <Plus className="h-4 w-4 mr-2" />
            Add Bookmark
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
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
                    {bookmarks.length}
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
                      {bookmarks.filter(bookmark => bookmark.category === category).length}
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
                {filteredBookmarks.map((bookmark) => (
                  <BookmarkCard
                    key={bookmark.id}
                    bookmark={bookmark}
                    onEdit={handleOpenForm}
                    onDelete={handleDeleteClick}
                  />
                ))}
              </div>
            ) : (
              renderNoResults()
            )}
          </div>
        </div>
      </div>

      {/* Form Sheet */}
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              bookmark &quot;{bookmarkToDelete?.title}&quot;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Mobile Filters Dialog */}
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
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
            <Button onClick={() => setFilterDialogOpen(false)}>
              Apply Filters
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
