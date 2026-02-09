import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe } from "lucide-react";

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    // Dispatch event for other components (like Chatbot) to listen if needed
    window.dispatchEvent(new CustomEvent("chat:set-language", { detail: lng === "hi" ? "hi-IN" : lng === "or" ? "or-IN" : "en-IN" }));
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" title="Change Language">
          <Globe className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => changeLanguage("en")}>
          🇺🇸 English
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => changeLanguage("hi")}>
          🇮🇳 हिंदी (Hindi)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => changeLanguage("or")}>
          🇮🇳 ଓଡ଼ିଆ (Odia)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
