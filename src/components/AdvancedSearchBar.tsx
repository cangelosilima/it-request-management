import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, X } from 'lucide-react';
import { SearchAttribute } from '@/types/request';

interface AdvancedSearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

const searchAttributes: SearchAttribute[] = [
  { key: 'id', label: 'Request ID', type: 'text' },
  { key: 'title', label: 'Title', type: 'text' },
  { key: 'assignee', label: 'Assignee', type: 'text' },
  { key: 'status', label: 'Status', type: 'select', options: ['pending', 'in_progress', 'completed', 'rejected'] },
  { key: 'priority', label: 'Priority', type: 'select', options: ['low', 'medium', 'high', 'urgent', 'emergency'] },
  { key: 'creator', label: 'Created By', type: 'text' },
  { key: 'system', label: 'System', type: 'text' },
  { key: 'date', label: 'Date', type: 'date' }
];

export function AdvancedSearchBar({ onSearch, placeholder = "Search requests..." }: AdvancedSearchBarProps) {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchAttribute[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (query) {
      const lastWord = query.split(' ').pop() || '';
      const filtered = searchAttributes.filter(attr =>
        attr.label.toLowerCase().includes(lastWord.toLowerCase()) ||
        attr.key.toLowerCase().includes(lastWord.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [query]);

  const handleSearch = () => {
    onSearch(query);
    setShowSuggestions(false);
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
    setShowSuggestions(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleAttributeClick = (attribute: SearchAttribute) => {
    const words = query.split(' ');
    words[words.length - 1] = `${attribute.key}=`;
    setQuery(words.join(' '));
    inputRef.current?.focus();
    setShowSuggestions(false);
  };

  return (
    <div className="w-full">
      <div className="flex gap-2 mb-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            onFocus={() => query && setShowSuggestions(true)}
            className="pl-10 pr-10 h-11 text-base"
          />
          {query && (
            <button
              onClick={handleClear}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
          )}
          
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-card border rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
              {suggestions.map((attr) => (
                <button
                  key={attr.key}
                  onClick={() => handleAttributeClick(attr)}
                  className="w-full text-left px-4 py-2 hover:bg-accent transition-colors"
                >
                  <div className="font-medium">{attr.label}</div>
                  <div className="text-xs text-muted-foreground">Use: {attr.key}=value</div>
                </button>
              ))}
            </div>
          )}
        </div>
        <Button onClick={handleSearch} size="lg">
          Search
        </Button>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {searchAttributes.map((attr) => (
          <Badge
            key={attr.key}
            variant="outline"
            className="cursor-pointer hover:bg-accent transition-colors"
            onClick={() => handleAttributeClick(attr)}
          >
            {attr.label}
          </Badge>
        ))}
      </div>
    </div>
  );
}
