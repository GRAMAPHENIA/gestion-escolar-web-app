'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Clock, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { Separator } from '@/components/ui/separator';
import { useInstitutionSearchSuggestions, useInstitutionSearchHistory } from '../hooks/use-institution-search';
import { cn } from '@/lib/utils';

interface InstitutionSearchProps {
  value: string;
  onChange: (value: string) => void;
  onSearch?: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  isSearching?: boolean;
}

export function InstitutionSearch({
  value,
  onChange,
  onSearch,
  placeholder = "Buscar instituciones...",
  className,
  disabled = false,
  isSearching = false,
}: InstitutionSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { suggestions, loading: suggestionsLoading } = useInstitutionSearchSuggestions(value);
  const { 
    searchHistory, 
    addToHistory, 
    clearHistory, 
    removeFromHistory 
  } = useInstitutionSearchHistory();

  // Handle search submission
  const handleSearch = (searchTerm: string) => {
    if (searchTerm.trim()) {
      addToHistory(searchTerm.trim());
      onSearch?.(searchTerm.trim());
    }
    setIsOpen(false);
    inputRef.current?.blur();
  };

  // Handle input change
  const handleInputChange = (newValue: string) => {
    onChange(newValue);
    if (newValue.trim() && !isOpen) {
      setIsOpen(true);
    }
  };

  // Handle clear search
  const handleClear = () => {
    onChange('');
    onSearch?.('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  // Handle key events
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch(value);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  // Handle suggestion/history item selection
  const handleItemSelect = (item: string) => {
    onChange(item);
    handleSearch(item);
  };

  // Show dropdown when there are suggestions, history, or when focused with empty input
  const shouldShowDropdown = isOpen && (
    suggestions.length > 0 || 
    (value.trim() === '' && searchHistory.length > 0) ||
    suggestionsLoading
  );

  return (
    <div className={cn("relative", className)}>
      <Popover open={shouldShowDropdown} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              ref={inputRef}
              type="text"
              placeholder={placeholder}
              value={value}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                setInputFocused(true);
                if (value.trim() || searchHistory.length > 0) {
                  setIsOpen(true);
                }
              }}
              onBlur={() => setInputFocused(false)}
              disabled={disabled}
              className="pl-10 pr-10"
            />
            {(value || isSearching) && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {isSearching && (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
                )}
                {value && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={handleClear}
                  >
                    <X className="h-3 w-3" />
                    <span className="sr-only">Limpiar búsqueda</span>
                  </Button>
                )}
              </div>
            )}
          </div>
        </PopoverTrigger>
        
        <PopoverContent 
          className="w-[--radix-popover-trigger-width] p-0" 
          align="start"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <Command>
            <CommandList>
              {suggestionsLoading && (
                <div className="flex items-center justify-center py-6">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
                  <span className="ml-2 text-sm text-muted-foreground">Buscando...</span>
                </div>
              )}

              {/* Search Suggestions */}
              {suggestions.length > 0 && (
                <CommandGroup heading="Sugerencias">
                  {suggestions.map((suggestion, index) => (
                    <CommandItem
                      key={`suggestion-${index}`}
                      value={suggestion}
                      onSelect={() => handleItemSelect(suggestion)}
                      className="flex items-center gap-2"
                    >
                      <Search className="h-4 w-4 text-muted-foreground" />
                      <span>{suggestion}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {/* Search History */}
              {value.trim() === '' && searchHistory.length > 0 && (
                <>
                  {suggestions.length > 0 && <Separator />}
                  <CommandGroup 
                    heading={
                      <div className="flex items-center justify-between">
                        <span>Búsquedas recientes</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-1 text-xs hover:bg-transparent"
                          onClick={clearHistory}
                        >
                          <Trash2 className="h-3 w-3" />
                          <span className="sr-only">Limpiar historial</span>
                        </Button>
                      </div>
                    }
                  >
                    {searchHistory.map((historyItem, index) => (
                      <CommandItem
                        key={`history-${index}`}
                        value={historyItem}
                        onSelect={() => handleItemSelect(historyItem)}
                        className="flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{historyItem}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-1 opacity-0 group-hover:opacity-100 hover:bg-transparent"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFromHistory(historyItem);
                          }}
                        >
                          <X className="h-3 w-3" />
                          <span className="sr-only">Eliminar del historial</span>
                        </Button>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </>
              )}

              {/* Empty state */}
              {!suggestionsLoading && suggestions.length === 0 && value.trim() !== '' && (
                <CommandEmpty>
                  <div className="flex flex-col items-center gap-2 py-6">
                    <Search className="h-8 w-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      No se encontraron sugerencias para "{value}"
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSearch(value)}
                    >
                      Buscar de todas formas
                    </Button>
                  </div>
                </CommandEmpty>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Search shortcut hint */}
      {inputFocused && !value && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <Badge variant="secondary" className="text-xs">
            Enter para buscar
          </Badge>
        </div>
      )}
    </div>
  );
}

// Compact version for use in toolbars or smaller spaces
export function InstitutionSearchCompact({
  value,
  onChange,
  onSearch,
  className,
  disabled = false,
  isSearching = false,
}: Omit<InstitutionSearchProps, 'placeholder'>) {
  return (
    <InstitutionSearch
      value={value}
      onChange={onChange}
      onSearch={onSearch}
      placeholder="Buscar..."
      className={cn("w-64", className)}
      disabled={disabled}
      isSearching={isSearching}
    />
  );
}