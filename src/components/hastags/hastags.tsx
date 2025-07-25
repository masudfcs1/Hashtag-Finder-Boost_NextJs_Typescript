"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { Copy, Hash, Youtube, Facebook, Instagram, Sparkles, X, RefreshCw, Search, Tag } from "lucide-react"
import toast, { Toaster } from "react-hot-toast"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type Platform = "youtube" | "facebook" | "instagram"

interface PlatformHashtags {
  youtube: string[]
  facebook: string[]
  instagram: string[]
}

interface ExtractedData {
  keywords: string[]
  searchTerms: string[]
  relatedTopics: string[]
}

const HashtagGenerator: React.FC = () => {
  const [title, setTitle] = useState<string>("")
  const [extractedData, setExtractedData] = useState<ExtractedData>({
    keywords: [],
    searchTerms: [],
    relatedTopics: [],
  })
  const [platformHashtags, setPlatformHashtags] = useState<PlatformHashtags>({
    youtube: [],
    facebook: [],
    instagram: [],
  })
  const [isGenerating, setIsGenerating] = useState<boolean>(false)

  const stopWords = new Set([
    "the",
    "a",
    "an",
    "and",
    "or",
    "but",
    "in",
    "on",
    "at",
    "to",
    "for",
    "of",
    "with",
    "by",
    "from",
    "up",
    "about",
    "into",
    "through",
    "during",
    "before",
    "after",
    "above",
    "below",
    "between",
    "among",
    "is",
    "are",
    "was",
    "were",
    "be",
    "been",
    "being",
    "have",
    "has",
    "had",
    "do",
    "does",
    "did",
    "will",
    "would",
    "could",
    "should",
    "may",
    "might",
    "must",
    "can",
    "this",
    "that",
    "these",
    "those",
    "i",
    "you",
    "he",
    "she",
    "it",
    "we",
    "they",
    "me",
    "him",
    "her",
    "us",
    "them",
    "my",
    "your",
    "his",
    "her",
    "its",
    "our",
    "their",
    "very",
    "just",
    "now",
    "then",
    "here",
    "there",
    "when",
    "where",
    "why",
    "how",
    "all",
    "any",
    "both",
    "each",
    "few",
    "more",
    "most",
    "other",
    "some",
    "such",
    "no",
    "nor",
    "not",
    "only",
    "own",
    "same",
    "so",
    "than",
    "too",
    "don",
    "should",
    "now",
    "get",
    "make",
    "go",
    "know",
    "take",
    "see",
    "come",
    "think",
    "look",
    "want",
    "give",
    "use",
    "find",
    "tell",
    "ask",
    "work",
    "seem",
    "feel",
    "try",
    "leave",
    "call",
  ])

  // Enhanced keyword database with semantic relationships
  const keywordDatabase: Record<
    string,
    {
      synonyms: string[]
      related: string[]
      searchTerms: string[]
      trending: string[]
    }
  > = {
    // Technology & AI
    ai: {
      synonyms: ["artificial intelligence", "machine learning", "automation", "robot", "smart", "intelligent"],
      related: ["tech", "future", "innovation", "digital", "algorithm", "data", "coding", "programming"],
      searchTerms: ["ai tutorial", "artificial intelligence explained", "machine learning basics", "ai tools"],
      trending: ["chatgpt", "openai", "aitools", "machinelearning", "artificialintelligence", "automation"],
    },
    technology: {
      synonyms: ["tech", "digital", "innovation", "software", "hardware", "gadget"],
      related: ["ai", "coding", "programming", "app", "website", "computer", "mobile", "internet"],
      searchTerms: ["tech review", "latest technology", "tech news", "gadget unboxing"],
      trending: ["tech2024", "innovation", "digitaltransformation", "techreview", "gadgets", "software"],
    },

    // Business & Entrepreneurship
    business: {
      synonyms: ["entrepreneur", "startup", "company", "corporate", "enterprise", "commerce"],
      related: ["marketing", "sales", "money", "finance", "leadership", "strategy", "growth", "success"],
      searchTerms: ["business tips", "startup advice", "entrepreneurship", "business growth"],
      trending: ["entrepreneur", "startup", "businesstips", "success", "leadership", "marketing"],
    },
    marketing: {
      synonyms: ["advertising", "promotion", "branding", "campaign", "digital marketing"],
      related: ["business", "sales", "social media", "content", "strategy", "growth"],
      searchTerms: ["marketing strategy", "digital marketing", "social media marketing", "content marketing"],
      trending: ["digitalmarketing", "socialmediamarketing", "contentmarketing", "branding", "advertising"],
    },

    // Health & Fitness
    fitness: {
      synonyms: ["workout", "exercise", "training", "gym", "health", "wellness"],
      related: ["nutrition", "diet", "strength", "cardio", "yoga", "running", "muscle", "weight"],
      searchTerms: ["workout routine", "fitness tips", "exercise tutorial", "gym workout"],
      trending: ["fitness", "workout", "gym", "health", "wellness", "fitnessmotivation", "exercise"],
    },
    workout: {
      synonyms: ["exercise", "training", "fitness", "gym", "routine"],
      related: ["health", "strength", "cardio", "muscle", "weight", "nutrition", "wellness"],
      searchTerms: ["home workout", "gym workout", "workout routine", "exercise tutorial"],
      trending: ["homeworkout", "gymworkout", "workoutmotivation", "fitness", "exercise", "training"],
    },

    // Food & Cooking
    food: {
      synonyms: ["cooking", "recipe", "cuisine", "meal", "dish", "kitchen"],
      related: ["chef", "ingredients", "healthy", "delicious", "restaurant", "baking", "nutrition"],
      searchTerms: ["easy recipes", "cooking tutorial", "food review", "healthy meals"],
      trending: ["foodie", "recipe", "cooking", "healthyfood", "delicious", "homecooking", "chef"],
    },
    recipe: {
      synonyms: ["cooking", "food", "dish", "meal", "cuisine"],
      related: ["ingredients", "kitchen", "chef", "healthy", "easy", "quick", "delicious"],
      searchTerms: ["easy recipe", "quick recipe", "healthy recipe", "cooking tutorial"],
      trending: ["easyrecipe", "quickrecipe", "healthyrecipe", "homecooking", "foodprep", "cooking"],
    },

    // Travel & Adventure
    travel: {
      synonyms: ["adventure", "journey", "trip", "vacation", "explore", "wanderlust"],
      related: ["destination", "culture", "photography", "nature", "city", "country", "experience"],
      searchTerms: ["travel guide", "travel tips", "travel vlog", "destination guide"],
      trending: ["travel", "adventure", "explore", "wanderlust", "vacation", "travelgram", "destination"],
    },

    // Entertainment & Gaming
    gaming: {
      synonyms: ["game", "gamer", "play", "video game", "esports"],
      related: ["streaming", "twitch", "youtube", "console", "pc", "mobile", "tournament"],
      searchTerms: ["gaming tutorial", "game review", "gaming tips", "gameplay"],
      trending: ["gaming", "gamer", "gameplay", "gamereview", "esports", "streaming", "videogames"],
    },

    // Education & Learning
    tutorial: {
      synonyms: ["guide", "howto", "lesson", "course", "training", "education"],
      related: ["learning", "tips", "beginner", "step by step", "easy", "quick"],
      searchTerms: ["tutorial", "how to", "beginner guide", "step by step"],
      trending: ["tutorial", "howto", "guide", "tips", "learn", "education", "beginner"],
    },

    // Lifestyle & Personal
    lifestyle: {
      synonyms: ["life", "daily", "routine", "personal", "living"],
      related: ["home", "family", "wellness", "productivity", "habits", "mindset"],
      searchTerms: ["lifestyle tips", "daily routine", "life advice", "personal development"],
      trending: ["lifestyle", "dailyroutine", "selfcare", "productivity", "mindset", "wellness"],
    },

    // Creative & Art
    art: {
      synonyms: ["creative", "design", "artistic", "drawing", "painting"],
      related: ["creativity", "inspiration", "visual", "color", "sketch", "digital art"],
      searchTerms: ["art tutorial", "drawing tips", "creative process", "art techniques"],
      trending: ["art", "artist", "creative", "drawing", "painting", "digitalart", "artwork"],
    },

    // Fashion & Beauty
    fashion: {
      synonyms: ["style", "outfit", "clothing", "trendy", "chic"],
      related: ["beauty", "makeup", "accessories", "designer", "trend", "look"],
      searchTerms: ["fashion tips", "style guide", "outfit ideas", "fashion trends"],
      trending: ["fashion", "style", "outfit", "ootd", "fashionista", "trendy", "stylish"],
    },

    // Music & Audio
    music: {
      synonyms: ["song", "audio", "sound", "melody", "rhythm"],
      related: ["artist", "musician", "instrument", "concert", "album", "playlist"],
      searchTerms: ["music tutorial", "song cover", "music review", "how to play"],
      trending: ["music", "song", "musician", "cover", "playlist", "newmusic", "artist"],
    },
  }

  // Content type detection patterns
  const contentTypePatterns = {
    tutorial: ["how to", "tutorial", "guide", "step by step", "learn", "beginner"],
    review: ["review", "unboxing", "test", "comparison", "vs", "honest"],
    tips: ["tips", "tricks", "hacks", "secrets", "advice", "best"],
    vlog: ["vlog", "day in life", "daily", "routine", "behind scenes"],
    challenge: ["challenge", "try", "attempt", "experiment", "test"],
    reaction: ["reaction", "react", "responds", "watching", "first time"],
    news: ["news", "update", "announcement", "breaking", "latest"],
    entertainment: ["funny", "comedy", "entertainment", "fun", "hilarious"],
  }

  const platformStrategies = {
    youtube: {
      maxHashtags: 15,
      trending: ["#shorts", "#viral", "#trending", "#youtube", "#subscribe", "#2024", "#new"],
      contentTypes: ["#tutorial", "#howto", "#review", "#unboxing", "#tips", "#guide", "#vlog"],
    },
    facebook: {
      maxHashtags: 8,
      trending: ["#facebook", "#social", "#community", "#share", "#connect", "#local"],
      contentTypes: ["#news", "#update", "#community", "#family", "#friends", "#local"],
    },
    instagram: {
      maxHashtags: 30,
      trending: [
        "#instagram",
        "#insta",
        "#instagood",
        "#photooftheday",
        "#love",
        "#beautiful",
        "#happy",
        "#follow",
        "#like4like",
        "#instadaily",
      ],
      contentTypes: ["#photo", "#pic", "#selfie", "#ootd", "#mood", "#vibes", "#aesthetic", "#art"],
    },
  }

  const extractKeywordsFromTitle = (text: string): ExtractedData => {
    const cleanText = text.toLowerCase().trim()

    // Extract base keywords
    const words = cleanText
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter((word) => word.length > 2 && !stopWords.has(word))

    const keywords = [...new Set(words)]
    const searchTerms: string[] = []
    const relatedTopics: string[] = []

    // Expand keywords using database
    keywords.forEach((keyword) => {
      Object.entries(keywordDatabase).forEach(([key, data]) => {
        if (keyword.includes(key) || key.includes(keyword) || data.synonyms.some((syn) => syn.includes(keyword))) {
          searchTerms.push(...data.searchTerms)
          relatedTopics.push(...data.related)
        }
      })
    })

    // Detect content type and add relevant terms
    Object.entries(contentTypePatterns).forEach(([type, patterns]) => {
      if (patterns.some((pattern) => cleanText.includes(pattern))) {
        relatedTopics.push(type)
        if (type === "tutorial") {
          searchTerms.push("how to", "tutorial", "guide", "beginner")
        } else if (type === "review") {
          searchTerms.push("review", "honest opinion", "worth it", "pros and cons")
        }
      }
    })

    // Add title-based search terms
    searchTerms.push(cleanText)
    if (cleanText.length > 20) {
      // Extract key phrases for longer titles
      const phrases = cleanText
        .split(/[,\-|:]/)
        .map((p) => p.trim())
        .filter((p) => p.length > 3)
      searchTerms.push(...phrases)
    }

    return {
      keywords: [...new Set(keywords)].slice(0, 10),
      searchTerms: [...new Set(searchTerms)].slice(0, 8),
      relatedTopics: [...new Set(relatedTopics)].slice(0, 12),
    }
  }

  const generatePlatformHashtags = (data: ExtractedData, platform: Platform): string[] => {
    const strategy = platformStrategies[platform]
    const hashtags: string[] = []

    // Add keyword-based hashtags
    hashtags.push(...data.keywords.map((k) => `#${k.replace(/\s+/g, "")}`))

    // Add related topic hashtags
    hashtags.push(...data.relatedTopics.slice(0, 6).map((t) => `#${t.replace(/\s+/g, "")}`))

    // Add trending hashtags from database
    data.keywords.forEach((keyword) => {
      Object.entries(keywordDatabase).forEach(([key, dbData]) => {
        if (keyword.includes(key) || key.includes(keyword)) {
          hashtags.push(...dbData.trending.slice(0, 3).map((t) => `#${t}`))
        }
      })
    })

    // Add platform-specific trending hashtags
    hashtags.push(...strategy.trending.slice(0, 4))

    // Add content type hashtags
    const titleLower = title.toLowerCase()
    Object.entries(contentTypePatterns).forEach(([type, patterns]) => {
      if (patterns.some((pattern) => titleLower.includes(pattern))) {
        const relevantContentTypes = strategy.contentTypes.filter(
          (ct) => ct.includes(type) || type.includes(ct.replace("#", "")),
        )
        hashtags.push(...relevantContentTypes.slice(0, 2))
      }
    })

    // Platform-specific customizations
    if (platform === "instagram") {
      hashtags.push("#instamood", "#photooftheday", "#instagood")
    } else if (platform === "youtube") {
      hashtags.push("#youtube", "#subscribe")
    } else if (platform === "facebook") {
      hashtags.push("#share", "#community")
    }

    // Remove duplicates and clean hashtags
    const uniqueHashtags = [...new Set(hashtags)]
      .map((tag) => tag.replace(/[^a-zA-Z0-9#]/g, ""))
      .filter((tag) => tag.length > 2)

    return uniqueHashtags.slice(0, strategy.maxHashtags)
  }

  const generateHashtags = useCallback(() => {
    if (!title.trim()) {
      toast.error("Please enter a title to generate hashtags")
      return
    }

    setIsGenerating(true)
    const loadingToast = toast.loading("Analyzing title and generating hashtags...")

    setTimeout(() => {
      const extracted = extractKeywordsFromTitle(title)
      setExtractedData(extracted)

      const newPlatformHashtags: PlatformHashtags = {
        youtube: generatePlatformHashtags(extracted, "youtube"),
        facebook: generatePlatformHashtags(extracted, "facebook"),
        instagram: generatePlatformHashtags(extracted, "instagram"),
      }

      setPlatformHashtags(newPlatformHashtags)
      setIsGenerating(false)

      toast.dismiss(loadingToast)
      toast.success(`Generated ${extracted.keywords.length} keywords and platform-specific hashtags!`)
    }, 1200)
  }, [title])

  const copyHashtags = useCallback(
    (platform: Platform) => {
      const hashtagText = platformHashtags[platform].join(" ")
      navigator.clipboard.writeText(hashtagText)
      toast.success(`${platform.charAt(0).toUpperCase() + platform.slice(1)} hashtags copied to clipboard!`, {
        icon: "📋",
      })
    },
    [platformHashtags],
  )

  const copySearchTerms = useCallback(() => {
    const searchText = extractedData.searchTerms.join(", ")
    navigator.clipboard.writeText(searchText)
    toast.success("Search terms copied to clipboard!", {
      icon: "🔍",
    })
  }, [extractedData.searchTerms])

  const removeHashtag = useCallback((platform: Platform, indexToRemove: number) => {
    setPlatformHashtags((prev) => ({
      ...prev,
      [platform]: prev[platform].filter((_, index) => index !== indexToRemove),
    }))
    toast("Hashtag removed", {
      icon: "❌",
      duration: 2000,
    })
  }, [])

  const regenerateHashtags = useCallback(
    (platform: Platform) => {
      if (!title.trim()) return

      const loadingToast = toast.loading(`Regenerating ${platform} hashtags...`)

      setTimeout(() => {
        const newHashtags = generatePlatformHashtags(extractedData, platform)
        setPlatformHashtags((prev) => ({
          ...prev,
          [platform]: newHashtags,
        }))

        toast.dismiss(loadingToast)
        toast.success(`New ${platform} hashtags generated!`, {
          icon: "🔄",
        })
      }, 600)
    },
    [title, extractedData],
  )

  const clearAll = useCallback(() => {
    setTitle("")
    setExtractedData({ keywords: [], searchTerms: [], relatedTopics: [] })
    setPlatformHashtags({ youtube: [], facebook: [], instagram: [] })
    toast("All cleared!", {
      icon: "🧹",
      duration: 2000,
    })
  }, [])

  const PlatformCard = ({
    platform,
    icon: Icon,
    color,
    hashtags,
  }: {
    platform: Platform
    icon: React.ElementType
    color: string
    hashtags: string[]
  }) => (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Icon className={`h-5 w-5 ${color}`} />
            {platform.charAt(0).toUpperCase() + platform.slice(1)} ({hashtags.length}/
            {platformStrategies[platform].maxHashtags})
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => regenerateHashtags(platform)} disabled={!title.trim()}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => copyHashtags(platform)} disabled={hashtags.length === 0}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {hashtags.length > 0 ? (
          <>
            <div className="flex flex-wrap gap-2 mb-4">
              {hashtags.map((hashtag, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className={`text-sm py-2 px-3 hover:bg-opacity-80 cursor-pointer group relative ${
                    platform === "youtube"
                      ? "bg-red-100 text-red-800 hover:bg-red-200"
                      : platform === "facebook"
                        ? "bg-blue-100 text-blue-800 hover:bg-blue-200"
                        : "bg-pink-100 text-pink-800 hover:bg-pink-200"
                  }`}
                >
                  {hashtag}
                  <button
                    onClick={() => removeHashtag(platform, index)}
                    className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="bg-gray-50 p-3 rounded-md border">
              <code className="text-sm text-gray-800 break-all">{hashtags.join(" ")}</code>
            </div>
          </>
        ) : (
          <p className="text-gray-500 text-center py-8">Generate hashtags to see {platform} suggestions</p>
        )}
      </CardContent>
    </Card>
  )

  const hasAnyHashtags =
    platformHashtags.youtube.length > 0 || platformHashtags.facebook.length > 0 || platformHashtags.instagram.length > 0

  const hasExtractedData = extractedData.keywords.length > 0 || extractedData.searchTerms.length > 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 p-4">
      {/* React Hot Toast container */}
      <Toaster
        position="top-center"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          duration: 3000,
          style: {
            background: "#fff",
            color: "#363636",
            border: "1px solid #e2e8f0",
            padding: "16px",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
          },
          success: {
            iconTheme: {
              primary: "#6366f1",
              secondary: "#fff",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
          },
        }}
      />

      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Hash className="h-8 w-8 text-indigo-600" />
            <h1 className="text-4xl font-bold text-gray-900">Hashtag Finder — Boost Your Reach to Hashtag Generator</h1>
          </div>
          <p className="text-gray-600 text-lg">
            Enter your title and get smart keywords, search terms & platform hashtags
          </p>
        </div>

        {/* Input Section */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-600" />
              Content Title
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Enter your content title... (e.g., 'How to Build a React App in 10 Minutes - Complete Beginner Tutorial')"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="min-h-[80px] resize-none text-lg"
              maxLength={200}
            />
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">{title.length}/200 characters</span>
              <div className="flex gap-2">
                <Button variant="outline" onClick={clearAll} disabled={!title && !hasAnyHashtags && !hasExtractedData}>
                  Clear All
                </Button>
                <Button
                  onClick={generateHashtags}
                  disabled={isGenerating || !title.trim()}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Analyzing Title...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Analyze & Generate
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Extracted Data Section */}
        {hasExtractedData && (
          <div className="grid md:grid-cols-3 gap-4">
            {/* Keywords */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <Tag className="h-5 w-5" />
                  Keywords ({extractedData.keywords.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {extractedData.keywords.map((keyword, index) => (
                    <Badge key={index} className="bg-green-100 text-green-800">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Search Terms */}
            <Card className="shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-blue-700">
                    <Search className="h-5 w-5" />
                    Search Terms ({extractedData.searchTerms.length})
                  </CardTitle>
                  <Button variant="outline" size="sm" onClick={copySearchTerms}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {extractedData.searchTerms.slice(0, 6).map((term, index) => (
                    <div key={index} className="text-sm bg-blue-50 p-2 rounded border">
                      "{term}"
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Related Topics */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-700">
                  <Hash className="h-5 w-5" />
                  Related Topics ({extractedData.relatedTopics.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {extractedData.relatedTopics.slice(0, 8).map((topic, index) => (
                    <Badge key={index} variant="outline" className="text-purple-700 border-purple-300">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Platform Hashtags Section */}
        {hasAnyHashtags && (
          <div className="space-y-6">
            <Tabs defaultValue="youtube" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="youtube" className="flex items-center gap-2">
                  <Youtube className="h-4 w-4" />
                  YouTube
                </TabsTrigger>
                <TabsTrigger value="facebook" className="flex items-center gap-2">
                  <Facebook className="h-4 w-4" />
                  Facebook
                </TabsTrigger>
                <TabsTrigger value="instagram" className="flex items-center gap-2">
                  <Instagram className="h-4 w-4" />
                  Instagram
                </TabsTrigger>
              </TabsList>

              <TabsContent value="youtube" className="mt-6">
                <PlatformCard
                  platform="youtube"
                  icon={Youtube}
                  color="text-red-600"
                  hashtags={platformHashtags.youtube}
                />
              </TabsContent>

              <TabsContent value="facebook" className="mt-6">
                <PlatformCard
                  platform="facebook"
                  icon={Facebook}
                  color="text-blue-600"
                  hashtags={platformHashtags.facebook}
                />
              </TabsContent>

              <TabsContent value="instagram" className="mt-6">
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

        {/* Tips Section */}
        <Card className="shadow-lg bg-gradient-to-r from-indigo-50 to-purple-50">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-gray-900 mb-4">💡 Title Analysis Features:</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <h4 className="font-medium text-indigo-700">Smart Extraction:</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Extracts key concepts from your title</li>
                  <li>• Identifies content type (tutorial, review, etc.)</li>
                  <li>• Generates related search terms</li>
                  <li>• Finds semantic connections</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-purple-700">Platform Optimization:</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• YouTube: Focus on searchability & trends</li>
                  <li>• Facebook: Community & engagement focused</li>
                  <li>• Instagram: Aesthetic & discovery optimized</li>
                  <li>• Each platform gets unique hashtag sets</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default HashtagGenerator
