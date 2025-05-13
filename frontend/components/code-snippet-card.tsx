"use client";

import React, { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Copy, Edit, Trash, Eye, EyeOff, Code } from "lucide-react";
import { CodeSnippet } from "@/types/codeSnippets";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CodeHighlighter } from "./code-highlighter";
import { Badge } from "@/components/ui/badge";
import { handleCopy } from "@/utils/clipboard";
import { useToast } from "@/hooks/use-toast";

interface CodeSnippetCardProps {
  snippet: CodeSnippet;
  onEdit?: (snippet: CodeSnippet) => void;
  onDelete?: (snippet: CodeSnippet) => void;
  isPublicView?: boolean;
}

export const CodeSnippetCard: React.FC<CodeSnippetCardProps> = ({
  snippet,
  onEdit,
  onDelete,
  isPublicView = false,
}) => {
  const { toast } = useToast();
  const [expanded, setExpanded] = useState(false);
  
  const toggleExpand = () => {
    setExpanded(!expanded);
  };
  
  const copyCode = () => {
    handleCopy(snippet.code);
    toast({
      title: "Code copied to clipboard",
      duration: 2000,
    });
  };
  
  const handleEdit = () => {
    if (onEdit) {
      onEdit(snippet);
    }
  };
  
  const handleDelete = () => {
    if (onDelete) {
      onDelete(snippet);
    }
  };

  // Format date
  const formattedDate = formatDistanceToNow(new Date(snippet.createdAt), {
    addSuffix: true,
  });
  
  return (
    <Card className="w-full overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center">
              <Code className="mr-2 h-5 w-5" />
              {snippet.title}
            </CardTitle>
            {snippet.description && (
              <p className="text-sm text-muted-foreground">{snippet.description}</p>
            )}
          </div>
          <Badge variant="outline">{snippet.language}</Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pb-2">
        <div className={`overflow-hidden transition-all ${expanded ? 'max-h-[800px]' : 'max-h-[200px]'}`}>
          <CodeHighlighter 
            code={snippet.code} 
            language={snippet.language} 
            className="w-full"
          />
        </div>
        
        {snippet.tags && snippet.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-4">
            {snippet.tags.map((tag, i) => (
              <Badge key={i} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between pt-2">
        <div className="text-xs text-muted-foreground flex items-center">
          {formattedDate}
          {!isPublicView && (
            <Badge 
              variant={snippet.isPublic ? "default" : "outline"} 
              className="ml-2 text-[10px] px-1 py-0 h-4"
            >
              {snippet.isPublic ? "Public" : "Private"}
            </Badge>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0" 
            onClick={toggleExpand}
          >
            {expanded ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0" 
            onClick={copyCode}
          >
            <Copy className="h-4 w-4" />
          </Button>
          
          {!isPublicView && (
            <>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0" 
                onClick={handleEdit}
              >
                <Edit className="h-4 w-4" />
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 hover:text-destructive" 
                onClick={handleDelete}
              >
                <Trash className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}; 