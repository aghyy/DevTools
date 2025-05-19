"use client";

import React, { useState, useEffect, useCallback } from "react";
import { TopSpacing } from "@/components/top-spacing";
import { useToast } from "@/hooks/use-toast";

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

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  Filter, 
  TagIcon, 
  Code2, 
  Languages, 
  User,
  Globe,
  X,
  RefreshCw
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

import { getUserDetails } from "@/services/auth";

export default function CodeSnippets() {
  const { toast } = useToast();

  // State for managing code snippets
  const [codeSnippets, setCodeSnippets] = useState<CodeSnippet[]>([]);
  const [filteredSnippets, setFilteredSnippets] = useState<CodeSnippet[]>([]);
  const [publicSnippets, setPublicSnippets] = useState<PublicCodeSnippets[]>([]);
  const [languages, setLanguages] = useState<CodeSnippetLanguage[]>([]);
  const [tags, setTags] = useState<CodeSnippetTag[]>([]);
  
  // State for UI components
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("my-snippets");
  
  // State for editing
  const [editingSnippet, setEditingSnippet] = useState<CodeSnippet | undefined>(undefined);
  const [snippetToDelete, setSnippetToDelete] = useState<CodeSnippet | null>(null);
  
  // State for filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Filter code snippets based on search query and selected filters
  const applyFilters = useCallback(() => {
    let filtered;
    
    // Use different source data depending on the active tab
    if (activeTab === "my-snippets") {
      filtered = [...codeSnippets];
    } else {
      // For public snippets, use the flattened list
      let allSnippets: CodeSnippet[] = [];
      publicSnippets.forEach(userSnippets => {
        allSnippets = allSnippets.concat(userSnippets.codeSnippets);
      });
      filtered = allSnippets;
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
  }, [codeSnippets, publicSnippets, searchQuery, selectedLanguage, selectedTag, activeTab]);

  // Fetch functions
  const fetchUserData = useCallback(async () => {
    try {
      await getUserDetails();
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  }, []);

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
    fetchUserData();
    
    if (activeTab === "my-snippets") {
      fetchPersonalSnippets();
      fetchLanguages();
      fetchTags();
    } else {
      fetchPublicSnippets();
    }
  }, [activeTab, fetchUserData, fetchPersonalSnippets, fetchPublicSnippets, fetchLanguages, fetchTags]);

  // Apply filters when they change
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

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

  // Filter toggle
  const toggleFilters = () => {
    setFiltersOpen(!filtersOpen);
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

      <div className="mx-10 mt-8 mb-24">
        {/* Tabs */}
        <div className="flex justify-between items-center pb-4">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList>
              <TabsTrigger value="my-snippets" className="flex gap-2">
                <Code2 size={16} />
                My Snippets
              </TabsTrigger>
              <TabsTrigger value="public-snippets" className="flex gap-2">
                <Globe size={16} />
                Public Snippets
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          {activeTab === "my-snippets" && (
            <Button onClick={() => handleOpenForm()} className="gap-1">
              <Plus size={16} />
              Add Snippet
            </Button>
          )}
        </div>

        {/* Search and Filter Bar */}
        <div className="flex gap-2 mb-6">
          <div className="relative flex-grow">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search code snippets..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Button
            variant="outline"
            size="icon"
            onClick={toggleFilters}
            className={filtersOpen ? "bg-accent" : ""}
          >
            <Filter size={18} />
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            onClick={activeTab === "my-snippets" ? fetchPersonalSnippets : fetchPublicSnippets}
          >
            <RefreshCw size={16} />
          </Button>
        </div>

        {/* Active Filters */}
        {(selectedLanguage || selectedTag) && (
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {selectedLanguage && (
              <Badge 
                variant="secondary" 
                className="flex gap-1 items-center"
                onClick={() => setSelectedLanguage(null)}
              >
                <Languages size={12} />
                {selectedLanguage}
                <X size={12} className="cursor-pointer" />
              </Badge>
            )}
            {selectedTag && (
              <Badge 
                variant="secondary" 
                className="flex gap-1 items-center"
                onClick={() => setSelectedTag(null)}
              >
                <TagIcon size={12} />
                {selectedTag}
                <X size={12} className="cursor-pointer" />
              </Badge>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearFilters} 
              className="h-7 text-xs"
            >
              Clear all
            </Button>
          </div>
        )}

        {/* Filters Dialog */}
        <Dialog open={filtersOpen} onOpenChange={setFiltersOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Filter Code Snippets</DialogTitle>
              <DialogDescription>
                Filter snippets by language or tags
              </DialogDescription>
            </DialogHeader>

            {/* Languages Filter Section */}
            <div className="py-4 space-y-4">
              <div>
                <h3 className="font-medium mb-2 flex items-center">
                  <Languages className="mr-2 h-4 w-4" />
                  Languages
                </h3>
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
              </div>

              {/* Tags Filter Section */}
              <div>
                <h3 className="font-medium mb-2 flex items-center">
                  <TagIcon className="mr-2 h-4 w-4" />
                  Tags
                </h3>
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
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Code Snippets Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="text-center">
              <RefreshCw className="animate-spin h-8 w-8 mx-auto mb-2 text-primary" />
              <p>Loading code snippets...</p>
            </div>
          </div>
        ) : (
          <>
            {filteredSnippets.length === 0 ? (
              <div className="text-center p-10 border rounded-lg">
                <Code2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No code snippets found</h3>
                <p className="text-muted-foreground mb-4">
                  {activeTab === "my-snippets"
                    ? "You haven't created any code snippets yet. Add one now!"
                    : "No public code snippets are available."}
                </p>
                {activeTab === "my-snippets" && (
                  <Button onClick={() => handleOpenForm()}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Your First Snippet
                  </Button>
                )}
              </div>
            ) : (
              <div className={`grid grid-cols-1 sm:grid-cols-2 ${activeTab === "my-snippets" ? "lg:grid-cols-3" : ""} gap-4`}>
                {activeTab === "public-snippets" && (
                  // Group snippets by user
                  publicSnippets.map((userSnippets) => {
                    // Filter to only show matching snippets
                    const matchingSnippets = userSnippets.codeSnippets.filter(snippet => 
                      filteredSnippets.some(fs => fs.id === snippet.id)
                    );
                    
                    // Skip users with no matching snippets
                    if (matchingSnippets.length === 0) return null;
                    
                    return (
                      <Card key={userSnippets.username} className="mb-4">
                        <CardHeader className="pb-2">
                          <CardTitle className="flex items-center">
                            <Avatar className="h-6 w-6 mr-2">
                              <AvatarFallback className="text-[10px]">
                                {userSnippets.firstName.charAt(0)}
                                {userSnippets.lastName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="flex items-center gap-1">
                              <User size={14} />
                              {userSnippets.firstName} {userSnippets.lastName}
                            </span>
                            <Badge variant="outline" className="ml-2 text-xs">
                              @{userSnippets.username}
                            </Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 gap-4 pt-2">
                            {matchingSnippets.map((snippet) => (
                              <CodeSnippetCard
                                key={snippet.id}
                                snippet={snippet}
                                isPublicView={true}
                              />
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
                
                {activeTab === "my-snippets" &&
                  filteredSnippets.map((snippet) => (
                    <CodeSnippetCard
                      key={snippet.id}
                      snippet={snippet}
                      onEdit={handleOpenForm}
                      onDelete={openDeleteDialog}
                    />
                  ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Code Snippet Form Sheet */}
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

      {/* Delete Confirmation Dialog */}
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
    </div>
  );
}
