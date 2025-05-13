export interface CodeSnippet {
  id: number;
  userId: number;
  title: string;
  description: string | null;
  code: string;
  language: string;
  tags: string[];
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CodeSnippetFormData {
  title: string;
  code: string;
  language: string;
  description?: string;
  tags?: string[];
  isPublic?: boolean;
}

export interface CodeSnippetLanguage {
  language: string;
  count: number;
}

export interface CodeSnippetTag {
  tag: string;
  count: number;
}

export interface PublicCodeSnippets {
  username: string;
  firstName: string;
  lastName: string;
  codeSnippets: CodeSnippet[];
} 