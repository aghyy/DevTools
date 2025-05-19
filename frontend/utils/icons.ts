import { Hammer, Book, Code, Binary, Hash, Link, Regex, Activity, Heart, Waypoints, Braces, Barcode, Fingerprint, KeyRound, Lock } from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  'Hammer': Hammer,
  'Book': Book,
  'Code': Code,
  'Binary': Binary,
  'Hash': Hash,
  'Link': Link,
  'Regex': Regex,
  'Activity': Activity,
  'Heart': Heart,
  'Braces': Braces,
  'Waypoints': Waypoints,
  'Lock': Lock,
  'Barcode': Barcode,
  'Fingerprint': Fingerprint,
  'KeyRound': KeyRound,
};

export const getIconComponent = (iconName: string): React.ElementType => {
  return iconMap[iconName] || Activity;
};