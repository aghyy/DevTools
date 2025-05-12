import { Sun, Moon } from "lucide-react";
import { MdOutlineAutoAwesome } from "react-icons/md";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeIcon() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true); // Ensure the component is mounted before rendering
  }, []);

  if (!mounted) {
    return null; // Avoid rendering until mounted
  }

  return (
    <>
      {theme === "light" ? (
        <Sun
          className={`${theme === "light" ? "scale-100 rotate-0" : "scale-0 rotate-90"} size-full shrink-0 transition-transform`}
        />
      ) : theme === "dark" ? (
        <Moon
          className={`${theme === "dark" ? "scale-100 rotate-0" : "scale-0 rotate-90"} size-10 transition-transform`}
        />
      ) : (
        <MdOutlineAutoAwesome
          className={`h-[1.2rem] w-[1.2rem] ${theme === "system" ? "scale-100 rotate-0" : "scale-0 rotate-90"} transition-transform`}
        />
      )}
    </>
  );
}