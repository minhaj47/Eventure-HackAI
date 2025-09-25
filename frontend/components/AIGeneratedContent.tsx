import {
  Copy,
  Facebook,
  Linkedin,
  RefreshCw,
  Sparkles,
  Twitter,
} from "lucide-react";
import React, { useState } from "react";
import {
  EventPostsResponse,
  generateEventPosts,
} from "../services/contentGenerationApi";
import { LegacyEventData } from "../types";
import { Card } from "./ui";

interface AIGeneratedContentProps {
  eventData: LegacyEventData;
}

export const AIGeneratedContent: React.FC<AIGeneratedContentProps> = ({
  eventData,
}) => {
  const [selectedPlatform, setSelectedPlatform] = useState<
    "facebook" | "linkedin" | "twitter"
  >("facebook");
  const [contentLength, setContentLength] = useState<
    "short" | "medium" | "long"
  >("medium");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Changed to false since we're not auto-loading
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [apiContent, setApiContent] = useState<EventPostsResponse[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Advanced parameters
  const [tone, setTone] = useState<
    "casual" | "professional" | "enthusiastic" | "formal"
  >("enthusiastic");
  const [includeHashtags, setIncludeHashtags] = useState(true);
  const [includeEmojis, setIncludeEmojis] = useState(true);
  const [targetAudience, setTargetAudience] = useState<
    "general" | "professionals" | "students" | "entrepreneurs"
  >("general");
  const [callToAction, setCallToAction] = useState<
    "register" | "learn_more" | "join_us" | "save_date"
  >("register");

  const loadContent = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const content = await generateEventPosts({
        eventName: eventData.name,
        dateTime: eventData.datetime,
        location: eventData.location,
        eventType: eventData.eventType,
        description: eventData.description,
      });

      setApiContent(content);
    } catch (error) {
      console.error("Failed to load AI content:", error);
      setError("Failed to generate AI content. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadContent();
    setIsRefreshing(false);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(
        platformContent[selectedPlatform].caption
      );
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const getApiContent = (platform: string, length: string) => {
    // Find content from API response
    let content = "";

    for (const item of apiContent) {
      if (item.result?.Reply) {
        // Twitter content from Reply
        if (platform === "twitter") {
          if (length === "short" && item.result.Reply.twitterSmall) {
            content = item.result.Reply.twitterSmall;
            break;
          } else if (length === "medium" && item.result.Reply.twitterMedium) {
            content = item.result.Reply.twitterMedium;
            break;
          }
        }
      }

      if (item.result?.Output) {
        // Facebook content from Output
        if (platform === "facebook") {
          if (length === "short" && item.result.Output.facebookSmall) {
            content = item.result.Output.facebookSmall;
            break;
          } else if (length === "medium" && item.result.Output.facebookMedium) {
            content = item.result.Output.facebookMedium;
            break;
          }
        }

        // WhatsApp content (can be used for LinkedIn too)
        if (platform === "linkedin") {
          if (length === "short" && item.result.Output.whatsappSmall) {
            content = item.result.Output.whatsappSmall.replace(/🔗.*$/, ""); // Remove register link for LinkedIn
            break;
          } else if (length === "medium" && item.result.Output.whatsappMedium) {
            content = item.result.Output.whatsappMedium.replace(/🔗.*$/, ""); // Remove register link for LinkedIn
            break;
          }
        }
      }
    }

    // Replace template variables
    if (content) {
      content = content.replace(
        /\{\{dateTime\}\}/g,
        new Date(eventData.datetime).toLocaleDateString()
      );
      return content;
    }

    // Fallback to generated content if API data not available
    return generateContent(platform, length);
  };

  const generateContent = (platform: string, length: string) => {
    const baseContent = {
      facebook: {
        short: `${includeEmojis ? "🎉 " : ""}Join us for ${eventData.name}! ${
          eventData.location
        } - ${new Date(eventData.datetime).toLocaleDateString()}${
          includeHashtags
            ? ` #${eventData.name?.replace(/\s+/g, "")} #${eventData.eventType}`
            : ""
        }`,
        medium: `${includeEmojis ? "🎉 " : ""}Join us for ${eventData.name}! 

An incredible ${eventData.eventType || "event"} experience awaits you at ${
          eventData.location
        }. 

${
  eventData.description ||
  "Get ready for an amazing time with fellow enthusiasts!"
}

${includeEmojis ? "📅 " : ""}Save the date: ${new Date(
          eventData.datetime
        ).toLocaleDateString()}
${includeEmojis ? "🕒 " : ""}Time: ${new Date(
          eventData.datetime
        ).toLocaleTimeString()}
${includeEmojis ? "📍 " : ""}Location: ${eventData.location}

${getCallToActionText()}${
          includeHashtags
            ? ` #${eventData.name?.replace(/\s+/g, "")} #${
                eventData.eventType
              } #Networking`
            : ""
        }`,
        long: `${includeEmojis ? "🎉 " : ""}Join us for ${eventData.name}! 

An incredible ${eventData.eventType || "event"} experience awaits you at ${
          eventData.location
        }. 

${
  eventData.description ||
  "Get ready for an amazing time with fellow enthusiasts!"
}

${getAudienceSpecificContent()}

${includeEmojis ? "📅 " : ""}Save the date: ${new Date(
          eventData.datetime
        ).toLocaleDateString()}
${includeEmojis ? "🕒 " : ""}Time: ${new Date(
          eventData.datetime
        ).toLocaleTimeString()}
${includeEmojis ? "📍 " : ""}Location: ${eventData.location}

${getCallToActionText()} - Limited spots available!

${
  includeHashtags
    ? `#${eventData.name?.replace(/\s+/g, "")} #${
        eventData.eventType
      } #Networking #Innovation #Community`
    : ""
}`,
      },
      linkedin: {
        short: `Professional ${eventData.eventType || "event"}: ${
          eventData.name
        } - ${new Date(eventData.datetime).toLocaleDateString()} at ${
          eventData.location
        }${
          includeHashtags
            ? ` #ProfessionalDevelopment #${eventData.eventType}`
            : ""
        }`,
        medium: `I'm excited to share an upcoming professional ${
          eventData.eventType || "event"
        }: ${eventData.name}

This ${eventData.eventType || "event"} presents an excellent opportunity for:
• Professional networking
• Industry insights  
• Knowledge sharing
• Career development

${includeEmojis ? "📍 " : ""}Location: ${eventData.location}
${includeEmojis ? "📅 " : ""}Date: ${new Date(
          eventData.datetime
        ).toLocaleDateString()}

${getCallToActionText()}

${
  includeHashtags
    ? `#ProfessionalDevelopment #${
        eventData.eventType
      } #Networking #${eventData.name?.replace(/\s+/g, "")}`
    : ""
}`,
        long: `I'm excited to share an upcoming professional ${
          eventData.eventType || "event"
        }: ${eventData.name}

This ${eventData.eventType || "event"} presents an excellent opportunity for:
• Professional networking with industry leaders
• Cutting-edge industry insights and trends
• Knowledge sharing and collaborative learning
• Career development and growth opportunities

${getAudienceSpecificContent()}

${
  eventData.description ||
  "Join industry professionals and thought leaders for meaningful connections and valuable insights."
}

${includeEmojis ? "📍 " : ""}Location: ${eventData.location}
${includeEmojis ? "📅 " : ""}Date: ${new Date(
          eventData.datetime
        ).toLocaleDateString()}
${includeEmojis ? "🕒 " : ""}Time: ${new Date(
          eventData.datetime
        ).toLocaleTimeString()}

${getCallToActionText()} Looking forward to seeing you there!

${
  includeHashtags
    ? `#ProfessionalDevelopment #${
        eventData.eventType
      } #Networking #Innovation #CareerGrowth #${eventData.name?.replace(
        /\s+/g,
        ""
      )}`
    : ""
}`,
      },
      twitter: {
        short: `${includeEmojis ? "🚀 " : ""}${eventData.name} - ${new Date(
          eventData.datetime
        ).toLocaleDateString()} at ${eventData.location}${
          includeHashtags
            ? ` #${eventData.name?.replace(/\s+/g, "")} #${eventData.eventType}`
            : ""
        }`,
        medium: `${includeEmojis ? "🚀 " : ""}Excited for ${eventData.name}!

${includeEmojis ? "📅 " : ""}${new Date(
          eventData.datetime
        ).toLocaleDateString()}
${includeEmojis ? "📍 " : ""}${eventData.location}

${
  eventData.description?.slice(0, 80) ||
  `Join us for an amazing ${eventData.eventType || "event"}`
}...

${getCallToActionText()}${includeEmojis ? " 🎯" : ""}

${
  includeHashtags
    ? `#${eventData.name?.replace(/\s+/g, "")} #${
        eventData.eventType
      } #Innovation`
    : ""
}`,
        long: `${includeEmojis ? "🚀 " : ""}Excited for ${eventData.name}!

${getAudienceSpecificContent()}

${includeEmojis ? "📅 " : ""}${new Date(
          eventData.datetime
        ).toLocaleDateString()}
${includeEmojis ? "📍 " : ""}${eventData.location}

${
  eventData.description?.slice(0, 120) ||
  `Join us for an amazing ${eventData.eventType || "event"} experience`
}...

${getCallToActionText()}${includeEmojis ? " 🎯✨" : ""}

${
  includeHashtags
    ? `#${eventData.name?.replace(/\s+/g, "")} #${
        eventData.eventType
      } #Innovation #Community #Networking`
    : ""
}`,
      },
    };
    return baseContent[platform as keyof typeof baseContent][
      length as keyof typeof baseContent.facebook
    ];
  };

  const getCallToActionText = () => {
    const actions = {
      register: "Register now!",
      learn_more: "Learn more and join us!",
      join_us: "Join us for this experience!",
      save_date: "Save the date!",
    };
    return actions[callToAction];
  };

  const getAudienceSpecificContent = () => {
    const audienceContent = {
      general:
        "This event is perfect for anyone interested in learning and networking.",
      professionals:
        "Designed specifically for industry professionals looking to advance their careers.",
      students:
        "An excellent opportunity for students to learn from experts and build connections.",
      entrepreneurs:
        "Connect with fellow entrepreneurs and discover new opportunities for growth.",
    };
    return audienceContent[targetAudience];
  };

  const platformContent = {
    facebook: {
      icon: <Facebook className="h-5 w-5" />,
      color: "from-blue-600 to-blue-700",
      borderColor: "border-blue-500/30",
      textColor: "text-blue-300",
      bgColor: "bg-blue-900/20",
      caption:
        apiContent.length > 0
          ? getApiContent("facebook", contentLength)
          : generateContent("facebook", contentLength),
    },
    linkedin: {
      icon: <Linkedin className="h-5 w-5" />,
      color: "from-blue-800 to-blue-900",
      borderColor: "border-blue-500/30",
      textColor: "text-blue-300",
      bgColor: "bg-blue-900/20",
      caption:
        apiContent.length > 0
          ? getApiContent("linkedin", contentLength)
          : generateContent("linkedin", contentLength),
    },
    twitter: {
      icon: <Twitter className="h-5 w-5" />,
      color: "from-sky-600 to-sky-700",
      borderColor: "border-sky-500/30",
      textColor: "text-sky-300",
      bgColor: "bg-sky-900/20",
      caption:
        apiContent.length > 0
          ? getApiContent("twitter", contentLength)
          : generateContent("twitter", contentLength),
    },
  };

  return (
    <Card title="AI-Generated Content" icon={<Sparkles className="h-6 w-6" />}>
      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mx-auto mb-4"></div>
            <p className="text-white/80">Generating AI content...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300">
          <p>{error}</p>
          <button
            onClick={handleRefresh}
            className="mt-2 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Initial State - No content generated yet */}
      {!isLoading && !error && apiContent.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Sparkles className="h-12 w-12 text-cyan-500 mx-auto mb-4 opacity-50" />
            <p className="text-white/80 mb-6">
              Ready to generate AI-powered social media content for your event?
            </p>
            <button
              onClick={loadContent}
              disabled={
                !eventData.name || !eventData.datetime || !eventData.location
              }
              className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all duration-200 flex items-center gap-2 mx-auto"
            >
              <Sparkles className="h-5 w-5" />
              Generate Content
            </button>
            {(!eventData.name ||
              !eventData.datetime ||
              !eventData.location) && (
              <p className="text-yellow-400 text-sm mt-3">
                Please fill in event name, date/time, and location first
              </p>
            )}
          </div>
        </div>
      )}

      {/* Content - Only show when content is available */}
      {!isLoading && !error && apiContent.length > 0 && (
        <div>
          {/* Platform-Specific Content */}
          <div className="mb-2">
            <div className="flex items-center justify-between">
              {/* Platform Selection */}
              <div className="mb-8">
                <div className="flex gap-3 mt-3">
                  {Object.entries(platformContent).map(([key, platform]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedPlatform(key as any)}
                      className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all duration-300 ${
                        selectedPlatform === key
                          ? `bg-gradient-to-r ${platform.color} ${platform.borderColor} ${platform.textColor} shadow-lg scale-105`
                          : "border-white/20 text-gray-400 hover:border-white/40 hover:text-white bg-gray-950/40"
                      }`}
                    >
                      {platform.icon}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Content Length Selection - Minimalistic */}

                <p className="text-sm text-white/80">size</p>

                <div
                  className={`border-2 px-2 py-2 rounded-xl transition-all duration-300 ${platformContent[selectedPlatform].borderColor} ${platformContent[selectedPlatform].bgColor}`}
                >
                  <div className="flex gap-1">
                    {["short", "medium", "long"].map((length) => (
                      <button
                        key={length}
                        onClick={() => setContentLength(length as any)}
                        className={`px-3 py-1 rounded-md text-xs font-medium transition-all duration-200 ${
                          contentLength === length
                            ? "bg-purple-600/30 text-purple-200 border border-purple-500/30"
                            : "bg-gray-800/50 text-gray-400 border border-gray-600/30 hover:bg-gray-700/50 hover:text-gray-300"
                        }`}
                      >
                        {length.charAt(0).toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div
              className={`border-2 rounded-2xl transition-all duration-300 ${platformContent[selectedPlatform].borderColor} ${platformContent[selectedPlatform].bgColor} relative`}
            >
              <div className="bg-gray-950/60 rounded-2xl border border-white/20 text-white/90 font-mono leading-relaxed whitespace-pre-line p-6 pr-16">
                {platformContent[selectedPlatform].caption}
              </div>

              {/* Copy Button */}
              <button
                onClick={handleCopy}
                className="absolute top-4 right-4 p-2 bg-gray-800/80 hover:bg-gray-700/80 text-white/80 hover:text-white border border-gray-600/30 hover:border-gray-500/50 rounded-lg transition-all duration-200 group"
              >
                <Copy className="h-4 w-4" />
                <span className="absolute -top-8 right-0 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {isCopied ? "Copied!" : "Copy content"}
                </span>
              </button>

              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="absolute top-4 right-15 p-2 bg-purple-900/80 hover:bg-purple-700/80 text-white/80 hover:text-white border border-gray-600/30 hover:border-gray-500/50 rounded-lg transition-all duration-200 group"
              >
                {isRefreshing ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                <span className="absolute -top-8 right-0 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {isRefreshing
                    ? "Generating new content..."
                    : "Generate new content"}
                </span>
              </button>
            </div>
          </div>

          {/* Analytics Preview */}
          <div className="mt-10 p-6 bg-gradient-to-r from-green-900/20 to-blue-900/20 rounded-2xl border border-green-500/20">
            <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-green-400" />
              Content Performance Prediction
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">85%</div>
                <div className="text-sm text-white/80">Engagement Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">2.4K</div>
                <div className="text-sm text-white/80">Est. Reach</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">340</div>
                <div className="text-sm text-gray-400">
                  Expected Registrations
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};
