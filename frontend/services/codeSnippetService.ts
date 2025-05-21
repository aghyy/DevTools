import api from "@/utils/axios";
import { trackActivity } from "@/services/activity";
import { 
  CodeSnippet, 
  CodeSnippetFormData, 
  CodeSnippetLanguage, 
  CodeSnippetTag, 
  PublicCodeSnippets 
} from "@/types/codeSnippets";

// Get all code snippets for current user
export const getUserCodeSnippets = async (
  language?: string,
  tag?: string,
  search?: string
): Promise<CodeSnippet[]> => {
  try {
    let url = "/api/code-snippets";
    const params = new URLSearchParams();
    
    if (language) params.append("language", language);
    if (tag) params.append("tag", tag);
    if (search) params.append("search", search);
    
    const queryString = params.toString();
    if (queryString) url += `?${queryString}`;
    
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching code snippets:", error);
    throw error;
  }
};

// Get a specific code snippet by ID
export const getCodeSnippetById = async (id: number): Promise<CodeSnippet> => {
  try {
    const response = await api.get(`/api/code-snippets/${id}`);
    
    // Track viewing this code snippet as an activity
    await trackActivity({
      type: "codeSnippet",
      name: response.data.title,
      path: `/code-snippets/${id}`,
      icon: "Code",
    });
    
    return response.data;
  } catch (error) {
    console.error(`Error fetching code snippet with ID ${id}:`, error);
    throw error;
  }
};

// Create a new code snippet
export const createCodeSnippet = async (data: CodeSnippetFormData): Promise<CodeSnippet> => {
  try {
    const response = await api.post("/api/code-snippets", data);
    
    // Track creating this code snippet as an activity
    await trackActivity({
      type: "codeSnippet",
      name: data.title,
      path: `/code-snippets/${response.data.codeSnippet.id}`,
      icon: "CodeSquare",
    });
    
    return response.data.codeSnippet;
  } catch (error) {
    console.error("Error creating code snippet:", error);
    throw error;
  }
};

// Update an existing code snippet
export const updateCodeSnippet = async (
  id: number,
  data: CodeSnippetFormData
): Promise<CodeSnippet> => {
  try {
    const response = await api.put(`/api/code-snippets/${id}`, data);
    
    // Track updating this code snippet as an activity
    await trackActivity({
      type: "codeSnippet",
      name: `Updated: ${data.title}`,
      path: `/code-snippets/${id}`,
      icon: "CodeSquare",
    });
    
    return response.data.codeSnippet;
  } catch (error) {
    console.error(`Error updating code snippet with ID ${id}:`, error);
    throw error;
  }
};

// Delete a code snippet
export const deleteCodeSnippet = async (id: number): Promise<void> => {
  try {
    // Get the snippet info before deleting (to track activity)
    const snippet = await getCodeSnippetById(id);
    
    await api.delete(`/api/code-snippets/${id}`);
    
    // Track deleting this code snippet as an activity
    await trackActivity({
      type: "codeSnippet",
      name: `Deleted: ${snippet.title}`,
      path: `/code-snippets`,
      icon: "Trash",
    });
  } catch (error) {
    console.error(`Error deleting code snippet with ID ${id}:`, error);
    throw error;
  }
};

// Get all languages used by current user
export const getUserLanguages = async (): Promise<CodeSnippetLanguage[]> => {
  try {
    const response = await api.get("/api/code-snippets/languages");
    return response.data;
  } catch (error) {
    console.error("Error fetching languages:", error);
    throw error;
  }
};

// Get all tags used by current user
export const getUserTags = async (): Promise<CodeSnippetTag[]> => {
  try {
    const response = await api.get("/api/code-snippets/tags");
    return response.data;
  } catch (error) {
    console.error("Error fetching tags:", error);
    throw error;
  }
};

// Get public code snippets by username
export const getPublicCodeSnippets = async (
  username: string
): Promise<PublicCodeSnippets> => {
  try {
    const response = await api.get(`/api/code-snippets/public/${username}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching public code snippets:", error);
    throw error;
  }
};

// Get all public code snippets
export const getAllPublicCodeSnippets = async (): Promise<PublicCodeSnippets[]> => {
  try {
    const response = await api.get("/api/code-snippets/public");
    return response.data;
  } catch (error) {
    console.error("Error fetching all public code snippets:", error);
    throw error;
  }
}; 