import { useCallback } from "react";

export interface ValidationRule {
  validate: (value: string) => string | undefined;
}

export const useProjectFormValidation = () => {
  const validatePath = useCallback((value: string, fieldName: string): string | undefined => {
    if (value.trim() === "") return `${fieldName} is required`;
    
    const trimmedValue = value.trim();
    if (!trimmedValue.startsWith("/") && !trimmedValue.startsWith("./") && !trimmedValue.startsWith("../")) {
      return `${fieldName} should be absolute or relative (starting with /, ./, or ../)`;
    }
    return undefined;
  }, []);

  const validateProjectName = useCallback((value: string): string | undefined => {
    if (value.trim() === "") return "Project name is required";
    
    const trimmedValue = value.trim();
    
    if (trimmedValue.length < 2) {
      return "Project name must be at least 2 characters long";
    }
    
    if (trimmedValue.length > 50) {
      return "Project name must be no more than 50 characters long";
    }
    
    const invalidChars = /[<>:"/\\|?*]/;
    if (invalidChars.test(trimmedValue)) {
      return "Project name cannot contain invalid characters: < > : \" / \\ | ? *";
    }
    
    for (let i = 0; i < trimmedValue.length; i++) {
      const charCode = trimmedValue.charCodeAt(i);
      if (charCode < 32) {
        return "Project name cannot contain control characters";
      }
    }
    
    const reservedNames = /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9]|\.|\.\.)$/i;
    if (reservedNames.test(trimmedValue)) {
      return "Project name cannot be a reserved system name";
    }
    
    if (trimmedValue.startsWith(" ") || trimmedValue.endsWith(" ") || 
        trimmedValue.startsWith(".") || trimmedValue.endsWith(".")) {
      return "Project name cannot start or end with spaces or dots";
    }
    
    if (/\s{2,}/.test(trimmedValue) || /\.{2,}/.test(trimmedValue)) {
      return "Project name cannot contain consecutive spaces or dots";
    }
    
    const validPattern = /^[a-zA-Z0-9_\-\s.]+$/;
    if (!validPattern.test(trimmedValue)) {
      return "Project name can only contain letters, numbers, spaces, hyphens, underscores, and dots";
    }
    
    return undefined;
  }, []);

  return {
    validatePath,
    validateProjectName
  };
};
