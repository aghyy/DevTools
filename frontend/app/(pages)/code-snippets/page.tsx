"use client";

import React, { useState, useEffect, useCallback } from "react";
import { TopSpacing } from "@/components/top-spacing";
import { useToast } from "@/hooks/use-toast";
import { useAtom } from "jotai";
import { isGuestAtom, userDataAtom } from "@/atoms/auth";
import { trackActivity } from "@/services/activity";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

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

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CodeSnippetForm } from "@/components/code-snippet-form";
import { CodeSnippetCard } from "@/components/code-snippet-card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import {
  Plus,
  Search,
  TagIcon,
  Code2,
  Languages,
  Globe,
  User
} from "lucide-react";

import {
  CodeSnippet,
  CodeSnippetFormData,
  CodeSnippetLanguage,
  CodeSnippetTag,
  PublicCodeSnippets
} from "@/types/codeSnippets";

import {
  getUserCodeSnippets,
  createCodeSnippet,
  updateCodeSnippet,
  deleteCodeSnippet,
  getUserLanguages,
  getUserTags,
  getAllPublicCodeSnippets
} from "@/services/codeSnippetService";

export default function CodeSnippets() {
  const { toast } = useToast();
  const [isGuest] = useAtom(isGuestAtom);
  const [userData] = useAtom(userDataAtom);

  // State for managing code snippets
  const [codeSnippets, setCodeSnippets] = useState<CodeSnippet[]>([]);
  const [filteredSnippets, setFilteredSnippets] = useState<CodeSnippet[]>([]);
  const [publicSnippets, setPublicSnippets] = useState<PublicCodeSnippets[]>([]);
  const [languages, setLanguages] = useState<CodeSnippetLanguage[]>([]);
  const [tags, setTags] = useState<CodeSnippetTag[]>([]);
  
  // State for detailed snippet view
  const [detailSnippet, setDetailSnippet] = useState<CodeSnippet | null>(null);
  const [detailUserInfo, setDetailUserInfo] = useState<{
    firstName: string;
    lastName: string;
    username: string;
  } | null>(null);

  // State for UI components
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(isGuest ? "public" : "personal");

  // State for editing
  const [editingSnippet, setEditingSnippet] = useState<CodeSnippet | undefined>(undefined);
  const [snippetToDelete, setSnippetToDelete] = useState<CodeSnippet | null>(null);

  // State for filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  // Track page visit when component mounts
  useEffect(() => {
    trackActivity({
      type: "codeSnippet",
      name: "Code Snippets Page",
      path: "/code-snippets",
      icon: "Code2",
    }).catch(err => console.error("Failed to track page visit:", err));
  }, []);

  // Filter code snippets based on search query and selected filters
  const applyFilters = useCallback(() => {
    let filtered;

    // Use different source data depending on the active tab
    if (activeTab === "personal") {
      filtered = [...codeSnippets];
    } else {
      // For public snippets, use the flattened list
      let allSnippets: CodeSnippet[] = [];
      publicSnippets.forEach(userSnippets => {
        allSnippets = allSnippets.concat(userSnippets.codeSnippets);
      });
      filtered = allSnippets;

      // Apply user filter
      if (selectedUser) {
        const userSnippets = publicSnippets.find(us => us.username === selectedUser);
        if (userSnippets) {
          filtered = userSnippets.codeSnippets;
        }
      }
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (snippet) =>
          snippet.title.toLowerCase().includes(query) ||
          snippet.description?.toLowerCase().includes(query) ||
          snippet.code.toLowerCase().includes(query)
      );
    }

    if (selectedLanguage) {
      filtered = filtered.filter(
        (snippet) => snippet.language === selectedLanguage
      );
    }

    if (selectedTag) {
      filtered = filtered.filter(
        (snippet) => snippet.tags.includes(selectedTag)
      );
    }

    setFilteredSnippets(filtered);
  }, [codeSnippets, publicSnippets, searchQuery, selectedLanguage, selectedTag, selectedUser, activeTab]);

  // Fetch functions
  const fetchPersonalSnippets = useCallback(async () => {
    setIsLoading(true);
    try {
      const snippets = await getUserCodeSnippets();
      setCodeSnippets(snippets);
      setFilteredSnippets(snippets);
    } catch {
      toast({
        title: "Error",
        description: "Failed to load code snippets",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const fetchPublicSnippets = useCallback(async () => {
    setIsLoading(true);
    try {
      const allPublicSnippets = await getAllPublicCodeSnippets();
      setPublicSnippets(allPublicSnippets);

      // Get all unique languages from public snippets
      const languageMap = new Map<string, number>();
      const tagMap = new Map<string, number>();

      allPublicSnippets.forEach(userSnippets => {
        userSnippets.codeSnippets.forEach(snippet => {
          // Count languages
          const lang = snippet.language;
          languageMap.set(lang, (languageMap.get(lang) || 0) + 1);

          // Count tags
          snippet.tags.forEach(tag => {
            tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
          });
        });
      });

      // Convert to expected format
      const publicLanguages: CodeSnippetLanguage[] = Array.from(languageMap.entries())
        .map(([language, count]) => ({ language, count }))
        .sort((a, b) => b.count - a.count);

      const publicTags: CodeSnippetTag[] = Array.from(tagMap.entries())
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count);

      // Update filters with public snippet data
      setLanguages(publicLanguages);
      setTags(publicTags);

      // The filters will automatically be applied via the useEffect hook
      // that depends on publicSnippets
    } catch (error) {
      console.error("Error fetching public code snippets:", error);
      toast({
        title: "Error",
        description: "Failed to load public code snippets",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const fetchLanguages = useCallback(async () => {
    try {
      const data = await getUserLanguages();
      setLanguages(data);
    } catch {
      console.error("Error fetching languages");
    }
  }, []);

  const fetchTags = useCallback(async () => {
    try {
      const data = await getUserTags();
      setTags(data);
    } catch {
      console.error("Error fetching tags");
    }
  }, []);

  // Initialize data
  useEffect(() => {
    if (activeTab === "personal" && !isGuest) {
      fetchPersonalSnippets();
      fetchLanguages();
      fetchTags();
    } else {
      fetchPublicSnippets();
    }
  }, [activeTab, fetchPersonalSnippets, fetchPublicSnippets, fetchLanguages, fetchTags, isGuest]);

  // Apply filters when they change
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Handle guest state changes
  useEffect(() => {
    if (isGuest) {
      setActiveTab("public");
      clearFilters();
    }
  }, [isGuest]);

  // Form handling
  const handleOpenForm = (snippet?: CodeSnippet) => {
    setEditingSnippet(snippet);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingSnippet(undefined);
  };

  const handleFormSubmit = async (data: CodeSnippetFormData) => {
    setIsProcessing(true);
    try {
      if (editingSnippet) {
        // Update existing snippet
        await updateCodeSnippet(editingSnippet.id, data);
        toast({
          title: "Success",
          description: "Code snippet updated successfully",
        });
      } else {
        // Create new snippet
        await createCodeSnippet(data);
        toast({
          title: "Success",
          description: "Code snippet created successfully",
        });
      }

      // Refresh snippets
      fetchPersonalSnippets();
      fetchLanguages();
      fetchTags();

      // Close form
      handleCloseForm();
    } catch (error) {
      console.error("Error saving code snippet:", error);
      toast({
        title: "Error",
        description: "Failed to save code snippet",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Delete handling
  const openDeleteDialog = (snippet: CodeSnippet) => {
    setSnippetToDelete(snippet);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!snippetToDelete) return;

    try {
      await deleteCodeSnippet(snippetToDelete.id);

      toast({
        title: "Success",
        description: "Code snippet deleted successfully",
      });

      // Refresh snippets
      fetchPersonalSnippets();
      fetchLanguages();
      fetchTags();
    } catch (error) {
      console.error("Error deleting code snippet:", error);
      toast({
        title: "Error",
        description: "Failed to delete code snippet",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setSnippetToDelete(null);
    }
  };

  // Tab change
  const handleTabChange = (value: string) => {
    clearFilters();
    setActiveTab(value);
  };

  // Filter selections
  const handleLanguageSelect = (language: string) => {
    setSelectedLanguage(selectedLanguage === language ? null : language);
  };

  const handleTagSelect = (tag: string) => {
    setSelectedTag(selectedTag === tag ? null : tag);
  };

  // Clear all applied filters
  const clearFilters = () => {
    setSearchQuery("");
    setSelectedLanguage(null);
    setSelectedTag(null);
    setSelectedUser(null);
  };

  // Handle opening a snippet in detail view
  const handleViewSnippet = (snippet: CodeSnippet) => {
    setDetailSnippet(snippet);
    
    // Find user info for public snippets
    if (activeTab === "public") {
      const userSnippets = publicSnippets.find(us => 
        us.codeSnippets.some(s => s.id === snippet.id)
      );
      
      if (userSnippets) {
        setDetailUserInfo({
          firstName: userSnippets.firstName,
          lastName: userSnippets.lastName,
          username: userSnippets.username
        });
      } else {
        setDetailUserInfo(null);
      }
    } else {
      setDetailUserInfo(null);
    }
    
    setIsDetailOpen(true);
  };

  // Close detail view
  const closeDetailView = () => {
    setIsDetailOpen(false);
    setDetailSnippet(null);
    setDetailUserInfo(null);
  };

  return (
    <div className="h-full w-full">
      <div className="relative size-0">
        <Breadcrumb className="absolute z-50 left-20 top-[22px] w-max">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Code Snippets</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <TopSpacing />

      <div className="w-full px-8 pt-8 pb-24 mx-auto">
        <div className="flex flex-col mb-8">
          <h1 className="text-3xl font-bold mb-2">Code Snippets</h1>
          <p className="text-muted-foreground">
            {activeTab === "personal" && userData ? (
              `${userData.firstName}'s code snippets`
            ) : (
              "Public code snippets shared by the community"
            )}
          </p>
        </div>

        {/* Tabs - Only show for logged in users */}
        {!isGuest && (
          <div className="flex justify-between items-center mb-4">
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <TabsList>
                <TabsTrigger value="personal" className="flex gap-2">
                  <Code2 size={16} />
                  Personal
                </TabsTrigger>
                <TabsTrigger value="public" className="flex gap-2">
                  <Globe size={16} />
                  Public
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {activeTab === "personal" && (
              <Button onClick={() => handleOpenForm()} className="gap-1">
                <Plus size={16} />
                Add Snippet
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
            ) : filteredSnippets.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeTab === "public" ? (
                  // Display public snippets in a grid without user grouping
                  filteredSnippets.map((snippet) => {
                    // Find the user who owns this snippet
                    const userSnippets = publicSnippets.find(us => 
                      us.codeSnippets.some(s => s.id === snippet.id)
                    );
                    
                    return (
                      <CodeSnippetCard
                        key={snippet.id}
                        snippet={snippet}
                        isPublicView={true}
                        onView={handleViewSnippet}
                        userInfo={userSnippets ? {
                          firstName: userSnippets.firstName,
                          lastName: userSnippets.lastName,
                          username: userSnippets.username
                        } : undefined}
                      />
                    );
                  })
                ) : (
                  // Personal snippets view remains unchanged
                  filteredSnippets.map((snippet) => (
                    <CodeSnippetCard
                      key={snippet.id}
                      snippet={snippet}
                      onEdit={handleOpenForm}
                      onDelete={openDeleteDialog}
                      onView={handleViewSnippet}
                    />
                  ))
                )}
              </div>
            ) : (
              <div className="text-center p-10 border rounded-lg">
                <Code2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No code snippets found</h3>
                <p className="text-muted-foreground mb-4">
                  {activeTab === "personal"
                    ? "You haven't created any code snippets yet. Add one now!"
                    : "No public code snippets are available."}
                </p>
                {activeTab === "personal" && (
                  <Button onClick={() => handleOpenForm()}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Your First Snippet
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="md:w-64 space-y-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search code snippets..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Users list - Only show for public snippets */}
            {(activeTab === "public" || isGuest) && publicSnippets.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Users
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1.5">
                  {publicSnippets.map((userSnippets) => (
                    <div
                      key={userSnippets.username}
                      className={`flex items-center p-2 rounded-md hover:bg-muted cursor-pointer ${selectedUser === userSnippets.username ? 'bg-muted' : ''}`}
                      onClick={() => setSelectedUser(selectedUser === userSnippets.username ? null : userSnippets.username)}
                    >
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarFallback className="text-xs">
                          {userSnippets.firstName.charAt(0)}
                          {userSnippets.lastName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-sm font-medium">{userSnippets.firstName} {userSnippets.lastName}</div>
                        <div className="text-xs text-muted-foreground">
                          {userSnippets.codeSnippets.length} snippets
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Tags Filter Section */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center">
                  <TagIcon className="h-4 w-4 mr-2" />
                  Tags
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {tags.length > 0 ? (
                    tags.map((tag) => (
                      <Badge
                        key={tag.tag}
                        variant={selectedTag === tag.tag ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => handleTagSelect(tag.tag)}
                      >
                        {tag.tag} ({tag.count})
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No tags available</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Languages Filter Section */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Languages className="h-4 w-4 mr-2" />
                  Languages
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {languages.length > 0 ? (
                    languages.map((lang) => (
                      <Badge
                        key={lang.language}
                        variant={selectedLanguage === lang.language ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => handleLanguageSelect(lang.language)}
                      >
                        {lang.language} ({lang.count})
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No languages available</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Code Snippet Form Sheet - Only show for logged in users */}
      {!isGuest && (
        <Sheet open={isFormOpen} onOpenChange={setIsFormOpen}>
          <SheetContent className="sm:max-w-xl overflow-y-auto">
            <SheetHeader>
              <SheetTitle>{editingSnippet ? 'Edit' : 'Add'} Code Snippet</SheetTitle>
              <SheetDescription>
                {editingSnippet
                  ? 'Update the details of your code snippet'
                  : 'Add a new code snippet to your collection'}
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6">
              <CodeSnippetForm
                initialData={editingSnippet}
                onSubmit={handleFormSubmit}
                onCancel={handleCloseForm}
                isProcessing={isProcessing}
              />
            </div>
          </SheetContent>
        </Sheet>
      )}

      {/* Delete Confirmation Dialog - Only show for logged in users */}
      {!isGuest && (
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Code Snippet</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this code snippet? This action cannot be undone.
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

      {/* Detail View Sheet - Only show for logged in users */}
      {!isGuest && (
        <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <SheetContent className="sm:max-w-xl overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Code Snippet Details</SheetTitle>
              <SheetDescription>
                {detailSnippet && (
                  <>
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold mb-2">{detailSnippet.title}</h3>
                      <p className="text-muted-foreground">{detailSnippet.description}</p>
                    </div>
                    <div className="mb-4">
                      <strong>Language:</strong> {detailSnippet.language}
                    </div>
                    <div className="mb-4">
                      <strong>Tags:</strong> {detailSnippet.tags.join(', ')}
                    </div>
                    <div className="mb-4">
                      <strong>Code:</strong>
                      <pre className="mt-2 p-2 bg-muted rounded-md">
                        {detailSnippet.code}
                      </pre>
                    </div>
                    <div className="mt-4">
                      <strong>Created by:</strong>
                      {detailUserInfo ? (
                        <span>{detailUserInfo.firstName} {detailUserInfo.lastName} ({detailUserInfo.username})</span>
                      ) : (
                        <span>Unknown</span>
                      )}
                    </div>
                  </>
                )}
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6">
              <Button onClick={closeDetailView} className="w-full">
                Close
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}
