/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/no-unescaped-entities */

'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { contentTypePatterns } from '@/lib/contentTypePatterns';
import { keywordDatabase } from '@/lib/keywordDatabase';
import { platformStrategies } from '@/lib/platformStrategies';
import { stopWords } from '@/lib/stopWords';
import {
  BarChart3,
  Copy,
  Download,
  Eye,
  EyeOff,
  Facebook,
  Hash,
  History,
  Instagram,
  Moon,
  Plus,
  Save,
  Search,
  Sparkles,
  Star,
  StarOff,
  Sun,
  Tag,
  Trash2,
  Upload,
  X,
  Youtube,
} from 'lucide-react';
import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';

type Platform = 'youtube' | 'facebook' | 'instagram';

interface PlatformHashtags {
  youtube: string[];
  facebook: string[];
  instagram: string[];
}

interface ExtractedData {
  keywords: string[];
  searchTerms: string[];
  relatedTopics: string[];
}

interface SavedTemplate {
  id: string;
  name: string;
  hashtags: PlatformHashtags;
  createdAt: Date;
  category: string;
}

interface HashtagHistory {
  id: string;
  title: string;
  hashtags: PlatformHashtags;
  extractedData: ExtractedData;
  createdAt: Date;
  isFavorite: boolean;
}

interface BulkTitle {
  id: string;
  title: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  hashtags?: PlatformHashtags;
}

const HashtagGenerator: React.FC = () => {
  const [title, setTitle] = useState<string>('');
  const [extractedData, setExtractedData] = useState<ExtractedData>({
    keywords: [],
    searchTerms: [],
    relatedTopics: [],
  });
  const [platformHashtags, setPlatformHashtags] = useState<PlatformHashtags>({
    youtube: [],
    facebook: [],
    instagram: [],
  });
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [showAnalytics, setShowAnalytics] = useState<boolean>(false);

  // New feature states
  const [savedTemplates, setSavedTemplates] = useState<SavedTemplate[]>([]);
  const [hashtagHistory, setHashtagHistory] = useState<HashtagHistory[]>([]);
  const [bulkTitles, setBulkTitles] = useState<BulkTitle[]>([]);
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState<boolean>(false);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('hashtag-generator-data');
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        setSavedTemplates(data.templates || []);
        setHashtagHistory(data.history || []);
        setDarkMode(data.darkMode || false);
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    }
  }, []);

  // Save data to localStorage
  const saveToLocalStorage = useCallback(() => {
    const data = {
      templates: savedTemplates,
      history: hashtagHistory,
      darkMode,
    };
    localStorage.setItem('hashtag-generator-data', JSON.stringify(data));
  }, [savedTemplates, hashtagHistory, darkMode]);

  useEffect(() => {
    saveToLocalStorage();
  }, [saveToLocalStorage]);

  // Apply dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Enhanced keyword database with analytics
  // Enhanced keyword database with analytics - Expanded Version

  const categories = [
    'all',
    'technology',
    'business',
    'fitness',
    'food',
    'travel',
    'gaming',
    'education',
    'lifestyle',
    'art',
    'fashion',
    'music',
  ];

  // Get hashtag analytics
  const getHashtagAnalytics = (hashtag: string) => {
    const cleanHashtag = hashtag.replace('#', '').toLowerCase();

    // Find matching keyword data
    const keywordData = Object.entries(keywordDatabase).find(
      ([key, data]) =>
        cleanHashtag.includes(key) ||
        data.synonyms.some((syn) =>
          cleanHashtag.includes(syn.replace(/\s+/g, ''))
        ) ||
        data.trending.some((trend) => trend === cleanHashtag)
    );

    if (keywordData) {
      return {
        popularity: keywordData[1].popularity,
        engagement: keywordData[1].engagement,
        difficulty:
          keywordData[1].popularity > 85
            ? 'High'
            : keywordData[1].popularity > 70
            ? 'Medium'
            : 'Low',
      };
    }

    // Default analytics for unknown hashtags
    return {
      popularity: Math.floor(Math.random() * 40) + 30,
      engagement: Math.floor(Math.random() * 30) + 20,
      difficulty: 'Medium',
    };
  };

  const extractKeywordsFromTitle = (text: string): ExtractedData => {
    const cleanText = text.toLowerCase().trim();
    const words = cleanText
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter((word) => word.length > 2 && !stopWords.has(word));

    const keywords = [...new Set(words)];
    const searchTerms: string[] = [];
    const relatedTopics: string[] = [];

    keywords.forEach((keyword) => {
      Object.entries(keywordDatabase).forEach(([key, data]) => {
        if (
          keyword.includes(key) ||
          key.includes(keyword) ||
          data.synonyms.some((syn) => syn.includes(keyword))
        ) {
          searchTerms.push(...data.searchTerms);
          relatedTopics.push(...data.related);
        }
      });
    });

    Object.entries(contentTypePatterns).forEach(([type, patterns]) => {
      if (patterns.some((pattern) => cleanText.includes(pattern))) {
        relatedTopics.push(type);
        if (type === 'tutorial') {
          searchTerms.push('how to', 'tutorial', 'guide', 'beginner');
        } else if (type === 'review') {
          searchTerms.push(
            'review',
            'honest opinion',
            'worth it',
            'pros and cons'
          );
        }
      }
    });

    searchTerms.push(cleanText);
    if (cleanText.length > 20) {
      const phrases = cleanText
        .split(/[,\-|:]/)
        .map((p) => p.trim())
        .filter((p) => p.length > 3);
      searchTerms.push(...phrases);
    }

    return {
      keywords: [...new Set(keywords)].slice(0, 10),
      searchTerms: [...new Set(searchTerms)].slice(0, 8),
      relatedTopics: [...new Set(relatedTopics)].slice(0, 12),
    };
  };

  const generatePlatformHashtags = (
    data: ExtractedData,
    platform: Platform
  ): string[] => {
    const strategy = platformStrategies[platform];
    const hashtags: string[] = [];

    hashtags.push(...data.keywords.map((k) => `#${k.replace(/\s+/g, '')}`));
    hashtags.push(
      ...data.relatedTopics.slice(0, 6).map((t) => `#${t.replace(/\s+/g, '')}`)
    );

    data.keywords.forEach((keyword) => {
      Object.entries(keywordDatabase).forEach(([key, dbData]) => {
        if (keyword.includes(key) || key.includes(keyword)) {
          hashtags.push(...dbData.trending.slice(0, 3).map((t) => `#${t}`));
        }
      });
    });

    hashtags.push(...strategy.trending.slice(0, 4));

    const titleLower = title.toLowerCase();
    Object.entries(contentTypePatterns).forEach(([type, patterns]) => {
      if (patterns.some((pattern) => titleLower.includes(pattern))) {
        const relevantContentTypes = strategy.contentTypes.filter(
          (ct) => ct.includes(type) || type.includes(ct.replace('#', ''))
        );
        hashtags.push(...relevantContentTypes.slice(0, 2));
      }
    });

    if (platform === 'instagram') {
      hashtags.push('#instamood', '#photooftheday', '#instagood');
    } else if (platform === 'youtube') {
      hashtags.push('#youtube', '#subscribe');
    } else if (platform === 'facebook') {
      hashtags.push('#share', '#community');
    }

    const uniqueHashtags = [...new Set(hashtags)]
      .map((tag) => tag.replace(/[^a-zA-Z0-9#]/g, ''))
      .filter((tag) => tag.length > 2);

    return uniqueHashtags.slice(0, strategy.maxHashtags);
  };

  const generateHashtags = useCallback(() => {
    if (!title.trim()) {
      toast.error('Please enter a title to generate hashtags');
      return;
    }

    setIsGenerating(true);
    const loadingToast = toast.loading(
      'Analyzing title and generating hashtags...'
    );

    setTimeout(() => {
      const extracted = extractKeywordsFromTitle(title);
      setExtractedData(extracted);

      const newPlatformHashtags: PlatformHashtags = {
        youtube: generatePlatformHashtags(extracted, 'youtube'),
        facebook: generatePlatformHashtags(extracted, 'facebook'),
        instagram: generatePlatformHashtags(extracted, 'instagram'),
      };

      setPlatformHashtags(newPlatformHashtags);

      // Add to history
      const historyItem: HashtagHistory = {
        id: Date.now().toString(),
        title,
        hashtags: newPlatformHashtags,
        extractedData: extracted,
        createdAt: new Date(),
        isFavorite: false,
      };
      setHashtagHistory((prev) => [historyItem, ...prev.slice(0, 49)]); // Keep last 50

      setIsGenerating(false);
      toast.dismiss(loadingToast);
      toast.success(
        `Generated ${extracted.keywords.length} keywords and platform-specific hashtags!`
      );
    }, 1200);
  }, [title]);

  // Bulk processing
  const processBulkTitles = useCallback(async () => {
    if (bulkTitles.length === 0) {
      toast.error('Please add titles to process');
      return;
    }

    const loadingToast = toast.loading('Processing bulk titles...');

    for (let i = 0; i < bulkTitles.length; i++) {
      const bulkTitle = bulkTitles[i];
      if (bulkTitle.status === 'pending') {
        setBulkTitles((prev) =>
          prev.map((item) =>
            item.id === bulkTitle.id ? { ...item, status: 'processing' } : item
          )
        );

        await new Promise((resolve) => setTimeout(resolve, 800)); // Simulate processing

        try {
          const extracted = extractKeywordsFromTitle(bulkTitle.title);
          const hashtags: PlatformHashtags = {
            youtube: generatePlatformHashtags(extracted, 'youtube'),
            facebook: generatePlatformHashtags(extracted, 'facebook'),
            instagram: generatePlatformHashtags(extracted, 'instagram'),
          };

          setBulkTitles((prev) =>
            prev.map((item) =>
              item.id === bulkTitle.id
                ? { ...item, status: 'completed', hashtags }
                : item
            )
          );
        } catch (error) {
          setBulkTitles((prev) =>
            prev.map((item) =>
              item.id === bulkTitle.id ? { ...item, status: 'error' } : item
            )
          );
        }
      }
    }

    toast.dismiss(loadingToast);
    toast.success('Bulk processing completed!');
  }, [bulkTitles]);

  // Save template
  const saveTemplate = useCallback(
    (name: string, category: string) => {
      if (!name.trim()) {
        toast.error('Please enter a template name');
        return;
      }

      const template: SavedTemplate = {
        id: Date.now().toString(),
        name: name.trim(),
        hashtags: platformHashtags,
        createdAt: new Date(),
        category,
      };

      setSavedTemplates((prev) => [template, ...prev]);
      toast.success('Template saved successfully!');
    },
    [platformHashtags]
  );

  // Load template
  const loadTemplate = useCallback((template: SavedTemplate) => {
    setPlatformHashtags(template.hashtags);
    toast.success(`Template "${template.name}" loaded!`);
  }, []);

  // Export functions
  const exportHashtags = useCallback(
    (format: 'csv' | 'json' | 'txt') => {
      const data = {
        title,
        generated: new Date().toISOString(),
        platforms: platformHashtags,
        analytics: showAnalytics,
      };

      let content = '';
      let filename = '';
      let mimeType = '';

      switch (format) {
        case 'csv':
          content = `Platform,Hashtags,Count\n`;
          Object.entries(platformHashtags).forEach(([platform, hashtags]) => {
            content += `${platform},"${hashtags.join(' ')}",${
              hashtags.length
            }\n`;
          });
          filename = `hashtags-${Date.now()}.csv`;
          mimeType = 'text/csv';
          break;

        case 'json':
          content = JSON.stringify(data, null, 2);
          filename = `hashtags-${Date.now()}.json`;
          mimeType = 'application/json';
          break;

        case 'txt':
          content = `Title: ${title}\n\n`;
          Object.entries(platformHashtags).forEach(([platform, hashtags]) => {
            content += `${platform.toUpperCase()}:\n${hashtags.join(' ')}\n\n`;
          });
          filename = `hashtags-${Date.now()}.txt`;
          mimeType = 'text/plain';
          break;
      }

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);

      toast.success(`Hashtags exported as ${format.toUpperCase()}!`);
    },
    [title, platformHashtags, showAnalytics]
  );

  const copyHashtags = useCallback(
    (platform: Platform) => {
      const hashtagText = platformHashtags[platform].join(' ');
      navigator.clipboard.writeText(hashtagText);
      toast.success(
        `${
          platform.charAt(0).toUpperCase() + platform.slice(1)
        } hashtags copied!`,
        {
          icon: '📋',
        }
      );
    },
    [platformHashtags]
  );

  const copyIndividualHashtag = useCallback((hashtag: string) => {
    navigator.clipboard.writeText(hashtag);
    toast.success(`${hashtag} copied!`, { icon: '📋', duration: 1500 });
  }, []);

  const removeHashtag = useCallback(
    (platform: Platform, indexToRemove: number) => {
      setPlatformHashtags((prev) => ({
        ...prev,
        [platform]: prev[platform].filter(
          (_, index) => index !== indexToRemove
        ),
      }));
      toast('Hashtag removed', { icon: '❌', duration: 2000 });
    },
    []
  );

  const toggleFavorite = useCallback((id: string) => {
    setHashtagHistory((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
      )
    );
  }, []);

  const clearHistory = useCallback(() => {
    setHashtagHistory([]);
    toast.success('History cleared!');
  }, []);

  const addBulkTitle = useCallback((newTitle: string) => {
    if (!newTitle.trim()) return;

    const bulkTitle: BulkTitle = {
      id: Date.now().toString(),
      title: newTitle.trim(),
      status: 'pending',
    };
    setBulkTitles((prev) => [...prev, bulkTitle]);
  }, []);

  const removeBulkTitle = useCallback((id: string) => {
    setBulkTitles((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setTitle('');
    setExtractedData({ keywords: [], searchTerms: [], relatedTopics: [] });
    setPlatformHashtags({ youtube: [], facebook: [], instagram: [] });
    toast('All cleared!', { icon: '🧹', duration: 2000 });
  }, []);

  // Filter history
  const filteredHistory = hashtagHistory.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      item.hashtags.youtube.some((h) =>
        h.toLowerCase().includes(searchFilter.toLowerCase())
      ) ||
      item.hashtags.facebook.some((h) =>
        h.toLowerCase().includes(searchFilter.toLowerCase())
      ) ||
      item.hashtags.instagram.some((h) =>
        h.toLowerCase().includes(searchFilter.toLowerCase())
      );

    const matchesCategory =
      selectedCategory === 'all' ||
      item.extractedData.keywords.some((k) => k.includes(selectedCategory)) ||
      item.extractedData.relatedTopics.some((t) =>
        t.includes(selectedCategory)
      );

    const matchesFavorites = !showFavoritesOnly || item.isFavorite;

    return matchesSearch && matchesCategory && matchesFavorites;
  });

  const PlatformCard = ({
    platform,
    icon: Icon,
    color,
    hashtags,
  }: {
    platform: Platform;
    icon: React.ElementType;
    color: string;
    hashtags: string[];
  }) => {
    const characterCount = hashtags.join(' ').length;
    const characterLimit = platformStrategies[platform].characterLimit;
    const isOverLimit = characterCount > characterLimit;

    return (
      <Card className="shadow-lg dark:bg-gray-800 dark:border-gray-700">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg dark:text-white">
              <Icon
                className={`h-4 w-4 sm:h-5 sm:w-5 ${color} flex-shrink-0`}
              />
              <span className="truncate">
                {platform.charAt(0).toUpperCase() + platform.slice(1)} (
                {hashtags.length}/{platformStrategies[platform].maxHashtags})
              </span>
            </CardTitle>
            <div className="flex gap-2 flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyHashtags(platform)}
                disabled={hashtags.length === 0}
                className="h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-3 dark:border-gray-600 dark:text-gray-300">
                <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline ml-1">Copy</span>
              </Button>
            </div>
          </div>

          {/* Character count */}
          <div
            className={`text-xs ${
              isOverLimit ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'
            }`}>
            {characterCount}/{characterLimit} characters{' '}
            {isOverLimit && '(Over limit!)'}
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {hashtags.length > 0 ? (
            <>
              <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4">
                {hashtags.map((hashtag, index) => {
                  const analytics = showAnalytics
                    ? getHashtagAnalytics(hashtag)
                    : null;

                  return (
                    <div key={index} className="group relative">
                      <Badge
                        variant="secondary"
                        className={`text-xs sm:text-sm py-1.5 px-2 sm:py-2 sm:px-3 hover:bg-opacity-80 cursor-pointer ${
                          platform === 'youtube'
                            ? 'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-200'
                            : platform === 'facebook'
                            ? 'bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200'
                            : 'bg-pink-100 text-pink-800 hover:bg-pink-200 dark:bg-pink-900 dark:text-pink-200'
                        }`}
                        onClick={() => copyIndividualHashtag(hashtag)}>
                        <span className="break-all">{hashtag}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeHashtag(platform, index);
                          }}
                          className="ml-1 sm:ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <X className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                        </button>
                      </Badge>

                      {/* Analytics tooltip */}
                      {showAnalytics && analytics && (
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                          Popularity: {analytics.popularity}% | Engagement:{' '}
                          {analytics.engagement}% | {analytics.difficulty}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 p-2 sm:p-3 rounded-md border dark:border-gray-600">
                <code className="text-xs sm:text-sm text-gray-800 dark:text-gray-200 break-all leading-relaxed">
                  {hashtags.join(' ')}
                </code>
              </div>
            </>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-6 sm:py-8 text-sm sm:text-base">
              Generate hashtags to see {platform} suggestions
            </p>
          )}
        </CardContent>
      </Card>
    );
  };

  const hasAnyHashtags =
    platformHashtags.youtube.length > 0 ||
    platformHashtags.facebook.length > 0 ||
    platformHashtags.instagram.length > 0;
  const hasExtractedData =
    extractedData.keywords.length > 0 || extractedData.searchTerms.length > 0;

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        darkMode ? 'dark bg-gray-900' : 'bg-gradient-to-br from-indigo-50 to'
      } purple-100'} p-2 sm:p-4 lg:p-6`}>
      {/* React Hot Toast container */}
      <Toaster
        position="top-center"
        reverseOrder={false}
        gutter={8}
        containerStyle={{ top: 20 }}
        toastOptions={{
          duration: 3000,
          style: {
            background: darkMode ? '#374151' : '#fff',
            color: darkMode ? '#f3f4f6' : '#363636',
            border: `1px solid ${darkMode ? '#4b5563' : '#e2e8f0'}`,
            padding: '12px 16px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
            fontSize: '14px',
            maxWidth: '90vw',
          },
          success: {
            iconTheme: {
              primary: '#6366f1',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />

      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header with controls */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 px-2">
          <div className="text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
              <Hash className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-600 flex-shrink-0" />
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white leading-tight">
                Smart Hashtag Generator
              </h1>
            </div>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-300 mt-2">
              AI-powered hashtags with analytics & bulk processing
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDarkMode(!darkMode)}
              className="dark:border-gray-600 dark:text-gray-300">
              {darkMode ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAnalytics(!showAnalytics)}
              className="dark:border-gray-600 dark:text-gray-300">
              {showAnalytics ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
              <span className="hidden sm:inline ml-1">Analytics</span>
            </Button>

            {/* Export dropdown */}
            {hasAnyHashtags && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="dark:border-gray-600 dark:text-gray-300 bg-transparent">
                    <Download className="h-4 w-4" />
                    <span className="hidden sm:inline ml-1">Export</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="dark:bg-gray-800 dark:border-gray-700">
                  <DialogHeader>
                    <DialogTitle className="dark:text-white">
                      Export Hashtags
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Button
                      onClick={() => exportHashtags('csv')}
                      className="w-full">
                      Export as CSV
                    </Button>
                    <Button
                      onClick={() => exportHashtags('json')}
                      className="w-full">
                      Export as JSON
                    </Button>
                    <Button
                      onClick={() => exportHashtags('txt')}
                      className="w-full">
                      Export as Text
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {/* Main tabs */}
        <Tabs defaultValue="generator" className="w-full">
          <TabsList className="grid w-full grid-cols-4 h-auto p-1 dark:bg-gray-800">
            <TabsTrigger
              value="generator"
              className="text-xs sm:text-sm dark:text-gray-300">
              <Hash className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              Generator
            </TabsTrigger>
            <TabsTrigger
              value="bulk"
              className="text-xs sm:text-sm dark:text-gray-300">
              <Upload className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              Bulk
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="text-xs sm:text-sm dark:text-gray-300">
              <History className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              History
            </TabsTrigger>
            <TabsTrigger
              value="templates"
              className="text-xs sm:text-sm dark:text-gray-300">
              <Save className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              Templates
            </TabsTrigger>
          </TabsList>

          {/* Generator Tab */}
          <TabsContent value="generator" className="space-y-4 sm:space-y-6">
            {/* Input Section */}
            <Card className="shadow-lg mx-1 sm:mx-0 dark:bg-gray-800 dark:border-gray-700">
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl dark:text-white">
                  <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600 flex-shrink-0" />
                  <span>Content Title</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <Textarea
                  placeholder="Enter your content title... (e.g., 'How to Build a React App in 10 Minutes - Complete Beginner Tutorial')"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="min-h-[80px] sm:min-h-[100px] resize-none text-sm sm:text-base lg:text-lg leading-relaxed dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  maxLength={200}
                />
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 order-2 sm:order-1">
                    {title.length}/200 characters
                  </span>
                  <div className="flex gap-2 order-1 sm:order-2">
                    <Button
                      variant="outline"
                      onClick={clearAll}
                      disabled={!title && !hasAnyHashtags && !hasExtractedData}
                      className="flex-1 sm:flex-none text-sm dark:border-gray-600 dark:text-gray-300 bg-transparent">
                      Clear All
                    </Button>
                    <Button
                      onClick={generateHashtags}
                      disabled={isGenerating || !title.trim()}
                      className="bg-indigo-600 hover:bg-indigo-700 flex-1 sm:flex-none text-sm">
                      {isGenerating ? (
                        <>
                          <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white mr-2" />
                          <span className="hidden sm:inline">Analyzing...</span>
                          <span className="sm:hidden">Analyzing</span>
                        </>
                      ) : (
                        <>
                          <Search className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                          <span className="hidden sm:inline">
                            Analyze & Generate
                          </span>
                          <span className="sm:hidden">Generate</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Save Template Dialog */}
            {hasAnyHashtags && (
              <div className="flex justify-center">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="dark:border-gray-600 dark:text-gray-300 bg-transparent">
                      <Save className="h-4 w-4 mr-2" />
                      Save as Template
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="dark:bg-gray-800 dark:border-gray-700">
                    <DialogHeader>
                      <DialogTitle className="dark:text-white">
                        Save Template
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label
                          htmlFor="template-name"
                          className="dark:text-gray-300">
                          Template Name
                        </Label>
                        <Input
                          id="template-name"
                          placeholder="Enter template name..."
                          className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              const input = e.target as HTMLInputElement;
                              const select = document.getElementById(
                                'template-category'
                              ) as HTMLSelectElement;
                              saveTemplate(
                                input.value,
                                select?.value || 'general'
                              );
                              input.value = '';
                            }
                          }}
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor="template-category"
                          className="dark:text-gray-300">
                          Category
                        </Label>
                        <Select defaultValue="general">
                          <SelectTrigger
                            id="template-category"
                            className="dark:bg-gray-700 dark:border-gray-600">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                            {categories
                              .filter((c) => c !== 'all')
                              .map((category) => (
                                <SelectItem
                                  key={category}
                                  value={category}
                                  className="dark:text-gray-300">
                                  {category.charAt(0).toUpperCase() +
                                    category.slice(1)}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        onClick={() => {
                          const nameInput = document.getElementById(
                            'template-name'
                          ) as HTMLInputElement;
                          const categorySelect = document.getElementById(
                            'template-category'
                          ) as HTMLSelectElement;
                          saveTemplate(nameInput.value, categorySelect.value);
                          nameInput.value = '';
                        }}
                        className="w-full">
                        Save Template
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            )}

            {/* Extracted Data Section */}
            {hasExtractedData && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 mx-1 sm:mx-0">
                <Card className="shadow-lg dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400 text-base sm:text-lg">
                      <Tag className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                      <span>Keywords ({extractedData.keywords.length})</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {extractedData.keywords.map((keyword, index) => (
                        <Badge
                          key={index}
                          className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs sm:text-sm py-1 px-2 sm:py-1.5 sm:px-2.5">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-lg dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-400 text-base sm:text-lg">
                        <Search className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                        <span>
                          Search Terms ({extractedData.searchTerms.length})
                        </span>
                      </CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const searchText =
                            extractedData.searchTerms.join(', ');
                          navigator.clipboard.writeText(searchText);
                          toast.success('Search terms copied!', { icon: '🔍' });
                        }}
                        className="h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-3 self-start sm:self-auto dark:border-gray-600 dark:text-gray-300">
                        <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline ml-1">Copy</span>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      {extractedData.searchTerms
                        .slice(0, 6)
                        .map((term, index) => (
                          <div
                            key={index}
                            className="text-xs sm:text-sm bg-blue-50 dark:bg-blue-900/20 p-2 rounded border dark:border-gray-600 break-words">
                            "{term}"
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-lg lg:col-span-1 dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-400 text-base sm:text-lg">
                      <Hash className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                      <span>
                        Related Topics ({extractedData.relatedTopics.length})
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {extractedData.relatedTopics
                        .slice(0, 8)
                        .map((topic, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-purple-700 dark:text-purple-400 border-purple-300 dark:border-purple-600 text-xs sm:text-sm py-1 px-2 sm:py-1.5 sm:px-2.5">
                            {topic}
                          </Badge>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Platform Hashtags */}
            {hasAnyHashtags && (
              <div className="space-y-4 sm:space-y-6 mx-1 sm:mx-0">
                <Tabs defaultValue="youtube" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 h-auto p-1 dark:bg-gray-800">
                    <TabsTrigger
                      value="youtube"
                      className="flex items-center gap-1 sm:gap-2 py-2 px-2 sm:px-4 text-xs sm:text-sm dark:text-gray-300">
                      <Youtube className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                      <span className="truncate">YouTube</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="facebook"
                      className="flex items-center gap-1 sm:gap-2 py-2 px-2 sm:px-4 text-xs sm:text-sm dark:text-gray-300">
                      <Facebook className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                      <span className="truncate">Facebook</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="instagram"
                      className="flex items-center gap-1 sm:gap-2 py-2 px-2 sm:px-4 text-xs sm:text-sm dark:text-gray-300">
                      <Instagram className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                      <span className="truncate">Instagram</span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="youtube" className="mt-4 sm:mt-6">
                    <PlatformCard
                      platform="youtube"
                      icon={Youtube}
                      color="text-red-600"
                      hashtags={platformHashtags.youtube}
                    />
                  </TabsContent>

                  <TabsContent value="facebook" className="mt-4 sm:mt-6">
                    <PlatformCard
                      platform="facebook"
                      icon={Facebook}
                      color="text-blue-600"
                      hashtags={platformHashtags.facebook}
                    />
                  </TabsContent>

                  <TabsContent value="instagram" className="mt-4 sm:mt-6">
                    <PlatformCard
                      platform="instagram"
                      icon={Instagram}
                      color="text-pink-600"
                      hashtags={platformHashtags.instagram}
                    />
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </TabsContent>

          {/* Bulk Processing Tab */}
          <TabsContent value="bulk" className="space-y-4">
            <Card className="shadow-lg dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="dark:text-white">
                  Bulk Title Processing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter title and press Enter..."
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const input = e.target as HTMLInputElement;
                        addBulkTitle(input.value);
                        input.value = '';
                      }
                    }}
                  />
                  <Button
                    onClick={() => {
                      const input = document.querySelector(
                        'input[placeholder="Enter title and press Enter..."]'
                      ) as HTMLInputElement;
                      addBulkTitle(input.value);
                      input.value = '';
                    }}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {bulkTitles.length > 0 && (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {bulkTitles.length} titles added
                      </span>
                      <div className="flex gap-2">
                        <Button
                          onClick={processBulkTitles}
                          disabled={bulkTitles.every(
                            (t) => t.status !== 'pending'
                          )}>
                          Process All
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setBulkTitles([])}>
                          Clear All
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {bulkTitles.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-3 border rounded dark:border-gray-600">
                          <div className="flex-1">
                            <div className="font-medium dark:text-white">
                              {item.title}
                            </div>
                            <div
                              className={`text-sm ${
                                item.status === 'completed'
                                  ? 'text-green-600'
                                  : item.status === 'processing'
                                  ? 'text-blue-600'
                                  : item.status === 'error'
                                  ? 'text-red-600'
                                  : 'text-gray-500'
                              }`}>
                              {item.status === 'completed' && item.hashtags
                                ? `✓ Generated ${
                                    Object.values(item.hashtags).flat().length
                                  } hashtags`
                                : item.status.charAt(0).toUpperCase() +
                                  item.status.slice(1)}
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeBulkTitle(item.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-4">
            <Card className="shadow-lg dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <CardTitle className="dark:text-white">
                    Hashtag History
                  </CardTitle>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearHistory}
                      className="dark:border-gray-600 dark:text-gray-300 bg-transparent">
                      <Trash2 className="h-4 w-4" />
                      Clear
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Search history..."
                      value={searchFilter}
                      onChange={(e) => setSearchFilter(e.target.value)}
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <Select
                    value={selectedCategory}
                    onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-full sm:w-48 dark:bg-gray-700 dark:border-gray-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                      {categories.map((category) => (
                        <SelectItem
                          key={category}
                          value={category}
                          className="dark:text-gray-300">
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="favorites-only"
                      checked={showFavoritesOnly}
                      onCheckedChange={setShowFavoritesOnly}
                    />
                    <Label
                      htmlFor="favorites-only"
                      className="dark:text-gray-300">
                      Favorites only
                    </Label>
                  </div>
                </div>

                {/* History items */}
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredHistory.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 border rounded dark:border-gray-600">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h4 className="font-medium dark:text-white">
                            {item.title}
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleFavorite(item.id)}
                            className="dark:border-gray-600">
                            {item.isFavorite ? (
                              <StarOff className="h-4 w-4 text-yellow-500" />
                            ) : (
                              <Star className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setTitle(item.title);
                              setPlatformHashtags(item.hashtags);
                              setExtractedData(item.extractedData);
                              toast.success('History item loaded!');
                            }}
                            className="dark:border-gray-600 dark:text-gray-300">
                            Load
                          </Button>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        YouTube: {item.hashtags.youtube.length} | Facebook:{' '}
                        {item.hashtags.facebook.length} | Instagram:{' '}
                        {item.hashtags.instagram.length}
                      </div>
                    </div>
                  ))}

                  {filteredHistory.length === 0 && (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                      No history items found
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-4">
            <Card className="shadow-lg dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="dark:text-white">
                  Saved Templates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {savedTemplates.map((template) => (
                    <div
                      key={template.id}
                      className="p-4 border rounded dark:border-gray-600">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h4 className="font-medium dark:text-white">
                            {template.name}
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {template.category} •{' '}
                            {new Date(template.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => loadTemplate(template)}
                            className="dark:border-gray-600 dark:text-gray-300">
                            Load
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSavedTemplates((prev) =>
                                prev.filter((t) => t.id !== template.id)
                              );
                              toast.success('Template deleted!');
                            }}
                            className="dark:border-gray-600 dark:text-gray-300">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        YouTube: {template.hashtags.youtube.length} | Facebook:{' '}
                        {template.hashtags.facebook.length} | Instagram:{' '}
                        {template.hashtags.instagram.length}
                      </div>
                    </div>
                  ))}

                  {savedTemplates.length === 0 && (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                      No saved templates yet
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Tips Section */}
        <Card className="shadow-lg bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 mx-1 sm:mx-0 dark:border-gray-700">
          <CardContent className="pt-4 sm:pt-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 text-base sm:text-lg">
              🚀 New Features:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs sm:text-sm">
              <div className="space-y-2">
                <h4 className="font-medium text-indigo-700 dark:text-indigo-400 text-sm sm:text-base flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Analytics & Insights
                </h4>
                <ul className="space-y-1 text-gray-600 dark:text-gray-300 leading-relaxed">
                  <li>• Hashtag popularity scores</li>
                  <li>• Engagement rate predictions</li>
                  <li>• Competition difficulty levels</li>
                  <li>• Character count per platform</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-purple-700 dark:text-purple-400 text-sm sm:text-base flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Bulk Processing
                </h4>
                <ul className="space-y-1 text-gray-600 dark:text-gray-300 leading-relaxed">
                  <li>• Process multiple titles at once</li>
                  <li>• Batch hashtag generation</li>
                  <li>• Export bulk results</li>
                  <li>• Progress tracking</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-green-700 dark:text-green-400 text-sm sm:text-base flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Templates & History
                </h4>
                <ul className="space-y-1 text-gray-600 dark:text-gray-300 leading-relaxed">
                  <li>• Save hashtag templates</li>
                  <li>• Browse generation history</li>
                  <li>• Favorite important sets</li>
                  <li>• Quick template loading</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HashtagGenerator;
