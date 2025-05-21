import { LucideIcon, Binary, Hash, Link, Braces, Waypoints, Regex, Hammer, Bookmark, Code, Home, Heart, KeyRound, Fingerprint, Barcode, Lock } from "lucide-react";
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
    title: "Bcrypt",
    description: "Hash and compare strings using bcrypt",
    icon: KeyRound,
    url: "/tools/bcrypt",
    type: "tool"
  },
  {
    title: "Steganography",
    description: "Hide messages within images",
    icon: Lock,
    url: "/tools/steganography",
    type: "tool"
  },
  {
    title: "Vigenère Cipher",
    description: "Encrypt and decrypt text using Vigenère cipher",
    icon: Lock,
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
  },
  {
    title: "Token Generator",
    description: "Generate random strings with customizable characters",
    icon: Code,
    url: "/tools/token-generator",
    type: "tool"
  },
  {
    title: "UUID Generator",
    description: "Generate UUIDs of different versions",
    icon: Fingerprint,
    url: "/tools/uuid-generator",
    type: "tool"
  },
  {
    title: "ULID Generator",
    description: "Generate sortable unique identifiers",
    icon: Barcode,
    url: "/tools/ulid-generator",
    type: "tool"
  }
];

// For sidebar navigation
export const sidebarItems = {
  general: [
    { title: "Dashboard", url: "/dashboard", icon: Home },
    { title: "Favorites", url: "/favorites", icon: Heart },
    { title: "Bookmarks", url: "/bookmarks", icon: Bookmark },
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
  "/tools/hash": { name: "Hash", type: "tool", icon: "Hash" },
  "/tools/base64": { name: "Base64", type: "tool", icon: "Binary" },
  "/tools/bcrypt": { name: "Bcrypt", type: "tool", icon: "KeyRound" },
  "/tools/regex": { name: "Regex", type: "tool", icon: "Regex" },
  "/tools/proxy": { name: "Proxy", type: "tool", icon: "Hammer" },
  "/tools/url-shortener": { name: "URL Shortener", type: "tool", icon: "Link" },
  "/tools/json-formatter": { name: "JSON Formatter", type: "tool", icon: "Code" },
  "/tools/steganography": { name: "Steganography", type: "tool", icon: "Lock" },
  "/tools/vigenere": { name: "Vigenère Cipher", type: "tool", icon: "Lock" },
  "/tools/token-generator": { name: "Token Generator", type: "tool", icon: "Code" },
  "/tools/uuid-generator": { name: "UUID Generator", type: "tool", icon: "Fingerprint" },
  "/tools/ulid-generator": { name: "ULID Generator", type: "tool", icon: "Barcode" },
  // Bookmarks and Favorites removed
}; 