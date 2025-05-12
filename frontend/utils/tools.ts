import { Binary, Hash, Link, Braces, Waypoints, Regex, Hammer, Book, Code, Home } from "lucide-react";
import { IoLockClosedOutline } from "react-icons/io5";
import { LucideIcon } from "lucide-react";
import { ComponentType, SVGProps } from "react";

// Type definitions for the tools
export type ToolType = 'tool' | 'bookmark';

export interface Tool {
  title: string;
  description: string;
  icon: LucideIcon | ComponentType<SVGProps<SVGSVGElement>>;
  url: string;
  type: ToolType;
}

// Centralized tool definitions
export const tools: Tool[] = [
  {
    title: "Base64",
    description: "Encode and decode Base64 strings",
    icon: Binary,
    url: "/tools/base64",
    type: "tool"
  },
  {
    title: "Hash",
    description: "Generate hash values for strings",
    icon: Hash,
    url: "/tools/hash",
    type: "tool"
  },
  {
    title: "Steganography",
    description: "Hide messages within images",
    icon: IoLockClosedOutline,
    url: "/tools/steganography",
    type: "tool"
  },
  {
    title: "Vigenère Cipher",
    description: "Encrypt and decrypt text using Vigenère cipher",
    icon: IoLockClosedOutline,
    url: "/tools/vigenere",
    type: "tool"
  },
  {
    title: "URL Shortener",
    description: "Create short URLs for long links",
    icon: Link,
    url: "/tools/url-shortener",
    type: "tool"
  },
  {
    title: "JSON Formatter",
    description: "Format and validate JSON data",
    icon: Braces,
    url: "/tools/json-formatter",
    type: "tool"
  },
  {
    title: "Proxy",
    description: "Route requests through a proxy server",
    icon: Waypoints,
    url: "/tools/proxy",
    type: "tool"
  },
  {
    title: "Regex",
    description: "Test and validate regular expressions",
    icon: Regex,
    url: "/tools/regex",
    type: "tool"
  }
];

// For sidebar navigation
export const sidebarItems = {
  general: [
    { title: "Dashboard", url: "/dashboard", icon: Home },
    { title: "Bookmarks", url: "/bookmarks", icon: Book },
    { title: "Code Snippets", url: "/code-snippets", icon: Code },
  ],
  tools: {
    title: "Tools", 
    icon: Hammer, 
    items: tools.map(tool => ({
      title: tool.title,
      url: tool.url,
      icon: tool.icon
    }))
  },
};

// For activity tracking - creating a map of route paths to activity metadata
// Static mapping for consistency and to avoid icon name property issues
export const routeToActivityMap: Record<string, { name: string; type: ToolType; icon: string }> = {
  // Tools
  "/tools/hash": { name: "Hash Generator", type: "tool", icon: "Hash" },
  "/tools/base64": { name: "Base64 Converter", type: "tool", icon: "Binary" },
  "/tools/regex": { name: "Regex Tester", type: "tool", icon: "Regex" },
  "/tools/proxy": { name: "Proxy Settings", type: "tool", icon: "Hammer" },
  "/tools/url-shortener": { name: "URL Shortener", type: "tool", icon: "Link" },
  "/tools/json-formatter": { name: "JSON Formatter", type: "tool", icon: "Code" },
  "/tools/steganography": { name: "Steganography", type: "tool", icon: "Lock" },
  "/tools/vigenere": { name: "Vigenère Cipher", type: "tool", icon: "Lock" },
  // Bookmarks
  "/bookmarks": { name: "Bookmarks", type: "bookmark", icon: "Book" },
}; 