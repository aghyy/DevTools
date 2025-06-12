"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TopSpacing } from "@/components/top-spacing";
import { useAtom } from "jotai";
import { userDataAtom } from "@/atoms/auth";

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
import { CodeSnippetForm } from "@/components/code-snippets/code-snippet-form";
import { CodeSnippetCard } from "@/components/code-snippets/code-snippet-card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import {
  Plus,
  Search,
  TagIcon,
  Code2,
  Languages,
  Globe,
  User,
  Copy
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

import { CodeHighlighter } from "@/components/code-snippets/code-highlighter";
import { toast } from "sonner";
import { ActiveTab } from "@/types/user";
import { motion } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const item = (index: number) => ({
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      delay: index * 0.1,
      duration: 0.3,
      ease: "easeOut"
    }
  }
});

export default function CodeSnippets() {
  // Next.js router and search params
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Atoms
  const [userData] = useAtom(userDataAtom);

  // State
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>("personal");
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
  const [isProcessing, setIsProcessing] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // State for editing
  const [editingSnippet, setEditingSnippet] = useState<CodeSnippet | undefined>(undefined);
  const [snippetToDelete, setSnippetToDelete] = useState<CodeSnippet | null>(null);

  // State for filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  // Filter code snippets based on search query and selected filters
  const applyFilters = useCallback(() => {
    let filtered;

    if (activeTab === "personal" && userData) {
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
  }, [codeSnippets, publicSnippets, searchQuery, selectedLanguage, selectedTag, selectedUser, activeTab, userData]);

  // Fetch functions
  const fetchPersonalSnippets = useCallback(async () => {
    setIsLoading(true);
    try {
      const snippets = await getUserCodeSnippets();
      setCodeSnippets(snippets);
      setFilteredSnippets(snippets);
    } catch {
      toast.error("Failed to load code snippets");
    } finally {
      setIsLoading(false);
    }
  }, []);

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
    } catch {
      toast.error("Failed to load public code snippets");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchLanguages = useCallback(async () => {
    try {
      const data = await getUserLanguages();
      setLanguages(data);
    } catch {
      toast.error("Failed to load languages");
    }
  }, []);

  const fetchTags = useCallback(async () => {
    try {
      const data = await getUserTags();
      setTags(data);
    } catch {
      toast.error("Failed to load tags");
    }
  }, []);

  // Initialize data
  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true);
      try {
        // Always fetch public snippets first
        await fetchPublicSnippets();

        // If user is logged in, fetch their personal data
        if (userData) {
          setActiveTab("personal");
          await Promise.all([
            fetchPersonalSnippets(),
            fetchLanguages(),
            fetchTags()
          ]);
        } else {
          setActiveTab("public");
        }
      } catch (err) {
        console.error('Failed to initialize code snippets:', err);
        toast.error("Failed to load code snippets");
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();
  }, [userData]);

  // Handle tab changes
  useEffect(() => {
    const loadTabData = async () => {
      if (isLoading) return;

      setIsLoading(true);
      try {
        if (activeTab === "public") {
          await fetchPublicSnippets();
        } else if (userData) {
          await Promise.all([
            fetchPersonalSnippets(),
            fetchLanguages(),
            fetchTags()
          ]);
        }
      } catch (err) {
        console.error('Failed to load tab data:', err);
        toast.error("Failed to load code snippets");
      } finally {
        setIsLoading(false);
      }
    };

    loadTabData();
  }, [activeTab, userData]);

  // Apply filters when they change
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Handle URL parameter for snippet detail view
  useEffect(() => {
    const snippetId = searchParams.get('id');
    
    if (snippetId && !isNaN(parseInt(snippetId))) {
      const numericId = parseInt(snippetId);
      let foundSnippet: CodeSnippet | null = null;
      let foundUserInfo: { firstName: string; lastName: string; username: string } | null = null;

      // First try to find in user's personal snippets
      if (userData && codeSnippets.length > 0) {
        foundSnippet = codeSnippets.find(s => s.id === numericId) || null;
      }

      // If not found in personal snippets, search in public snippets
      if (!foundSnippet && publicSnippets.length > 0) {
        for (const userSnippets of publicSnippets) {
          const snippet = userSnippets.codeSnippets.find(s => s.id === numericId);
          if (snippet) {
            foundSnippet = snippet;
            foundUserInfo = {
              firstName: userSnippets.firstName,
              lastName: userSnippets.lastName,
              username: userSnippets.username
            };
            break;
          }
        }
      }

      if (foundSnippet) {
        setDetailSnippet(foundSnippet);
        setDetailUserInfo(foundUserInfo);
        setIsDetailOpen(true);
      } else if (codeSnippets.length > 0 || publicSnippets.length > 0) {
        // Only show error if data is loaded but snippet not found
        toast.error("Code snippet not found");
        closeDetailView();
      }
    } else {
      // No ID parameter, close detail view
      setIsDetailOpen(false);
      setDetailSnippet(null);
      setDetailUserInfo(null);
    }
  }, [searchParams, codeSnippets, publicSnippets, userData]);

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
        toast.success("Code snippet updated successfully");
      } else {
        // Create new snippet
        await createCodeSnippet(data);
        toast.success("Code snippet created successfully");
      }

      // Refresh snippets
      fetchPersonalSnippets();
      fetchLanguages();
      fetchTags();

      // Close form
      handleCloseForm();
    } catch {
      toast.error("Failed to save code snippet");
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

      toast.success("Code snippet deleted successfully");

      // Refresh snippets
      fetchPersonalSnippets();
      fetchLanguages();
      fetchTags();
    } catch {
      toast.error("Failed to delete code snippet");
    } finally {
      setDeleteDialogOpen(false);
      setSnippetToDelete(null);
    }
  };

  // Handle tab change - only called for logged-in users
  const handleTabChange = (value: string) => {
    // Only allow switching to personal if logged in
    if (value === "personal" && !userData) {
      return;
    }
    setActiveTab(value as ActiveTab);
    clearFilters();
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
    // Update URL with search parameter while keeping the page in background
    const url = new URL(window.location.href);
    url.searchParams.set('id', snippet.id.toString());
    router.push(url.pathname + url.search, { scroll: false });
  };

  // Close detail view
  const closeDetailView = () => {
    setIsDetailOpen(false);
    setDetailSnippet(null);
    setDetailUserInfo(null);
    
    // Remove the ID parameter from URL
    const url = new URL(window.location.href);
    url.searchParams.delete('id');
    router.push(url.pathname + url.search, { scroll: false });
  };

  // Handle copying code to clipboard
  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Code copied to clipboard");
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

      {!isLoading && (
        <div className="w-full px-8 pt-8 pb-24 mx-auto">
          <div className="flex flex-col mb-8">
            <h1 className="text-3xl font-bold mb-2">Code Snippets</h1>
            <div className="text-muted-foreground">
              {userData && activeTab === "personal" && `${userData.firstName}'s code snippets`}
              {activeTab === "public" && "Public code snippets shared by the community"}
            </div>
          </div>

          {/* Tabs - Show for everyone but disable personal if not logged in */}
          {userData && (
            <div className="flex justify-between items-center mb-4">
              <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <TabsList>
                  <TabsTrigger
                    value="personal"
                    className="flex gap-2"
                    disabled={!userData}
                  >
                    <User className="h-4 w-4" />
                    Personal
                  </TabsTrigger>
                  <TabsTrigger value="public" className="flex gap-2">
                    <Globe className="h-4 w-4" />
                    Public
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {userData && activeTab === "personal" && (
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
              {filteredSnippets.length > 0 ? (
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                  variants={container}
                  initial="hidden"
                  animate="show"
                >
                  {activeTab === "public" ? (
                    // Display public snippets in a grid without user grouping
                    filteredSnippets.map((snippet, index) => {
                      // Find the user who owns this snippet
                      const userSnippets = publicSnippets.find(us =>
                        us.codeSnippets.some(s => s.id === snippet.id)
                      );

                      return (
                        <motion.div
                          key={snippet.id}
                          custom={index}
                          variants={item(index)}
                        >
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
                        </motion.div>
                      );
                    })
                  ) : (
                    // Personal snippets view remains unchanged
                    filteredSnippets.map((snippet, index) => (
                      <motion.div
                        key={snippet.id}
                        custom={index}
                        variants={item(index)}
                      >
                        <CodeSnippetCard
                          key={snippet.id}
                          snippet={snippet}
                          onEdit={handleOpenForm}
                          onDelete={openDeleteDialog}
                          onView={handleViewSnippet}
                        />
                      </motion.div>
                    ))
                  )}
                </motion.div>
              ) : (
                <motion.div
                  className="text-center p-10 border rounded-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Code2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No code snippets found</h3>
                  <p className="text-muted-foreground mb-4">
                    {userData ? (
                      "You haven't created any code snippets yet. Add one now!"
                    ) : (
                      "No public code snippets are available."
                    )}
                  </p>
                  {userData && (
                    <Button onClick={() => handleOpenForm()}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Your First Snippet
                    </Button>
                  )}
                </motion.div>
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
              {activeTab === "public" && publicSnippets.length > 0 && (
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
                          variant={selectedTag === tag.tag ? "default" : "secondary"}
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
                          variant={selectedLanguage === lang.language ? "default" : "secondary"}
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
      )}

      {/* Code Snippet Form Sheet - Only show for logged in users */}
      {userData && (
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
      {userData && (
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

      {/* Detail View Sheet */}
      <Sheet open={isDetailOpen} onOpenChange={(open) => {
        if (!open) {
          closeDetailView();
        }
      }}>
        <SheetContent className="sm:max-w-xl md:max-w-2xl lg:max-w-3xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-xl">{detailSnippet?.title}</SheetTitle>
            <SheetDescription>
              {detailSnippet?.description}
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6">
            {detailSnippet && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Badge>{detailSnippet.language}</Badge>
                    <span className="text-muted-foreground text-sm">
                      Created {new Date(detailSnippet.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {detailUserInfo && (
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-[10px]">
                          {detailUserInfo.firstName.charAt(0)}
                          {detailUserInfo.lastName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{detailUserInfo.firstName} {detailUserInfo.lastName}</span>
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  {detailSnippet.tags && detailSnippet.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {detailSnippet.tags.map((tag, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="rounded-md border mb-6 overflow-hidden">
                  <CodeHighlighter
                    code={detailSnippet.code}
                    language={detailSnippet.language}
                    className="w-full"
                  />
                </div>

                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => handleCopy(detailSnippet.code)}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Code
                  </Button>

                  <Button onClick={closeDetailView}>
                    Close
                  </Button>
                </div>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>

    </div>
  );
}
