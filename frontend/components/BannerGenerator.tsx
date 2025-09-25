import { Download, Image as ImageIcon, RefreshCw, Share2 } from "lucide-react";
import React, { useState } from "react";
import { generateEventPosters } from "../services/contentGenerationApi";
import { Banner, BannerConfig, LegacyEventData } from "../types";
import { ActionButton, Button, Card } from "./ui";

interface BannerGeneratorProps {
  eventData: LegacyEventData;
  generatedBanners: Banner[];
  isGeneratingBanner: boolean;
  onGenerateBanners: (config?: BannerConfig) => void;
  onRefreshBanner?: (bannerId: number, config?: BannerConfig) => void;
}

export const BannerGenerator: React.FC<BannerGeneratorProps> = ({
  eventData,
  generatedBanners,
  isGeneratingBanner,
  onGenerateBanners,
  onRefreshBanner,
}) => {
  const [config, setConfig] = useState<BannerConfig>({
    // Legacy options (for backward compatibility)
    size: "medium",
    type: "social",
    // Enhanced options
    style: "modern",
    colorScheme: "corporate",
    layout: "centered",
    imagery: "icons",
  });
  const [refreshingBanner, setRefreshingBanner] = useState<number | null>(null);
  const [isLoadingPoster, setIsLoadingPoster] = useState(false);
  const [posterError, setPosterError] = useState<string | null>(null);
  const [apiPosters, setApiPosters] = useState<any>(null);

  const loadPosters = async () => {
    setIsLoadingPoster(true);
    setPosterError(null);

    try {
      const posters = await generateEventPosters({
        eventName: eventData.name,
        dateTime: eventData.datetime,
        location: eventData.location,
        eventType: eventData.eventType,
        description: eventData.description,
      });

      setApiPosters(posters);
    } catch (error) {
      console.error("Failed to load AI posters:", error);
      setPosterError("Failed to generate AI posters. Please try again.");
    } finally {
      setIsLoadingPoster(false);
    }
  };

  const handleGenerateBanners = () => {
    if (apiPosters) {
      // If we have API posters, use them instead of generating new ones
      onGenerateBanners(config);
    } else {
      // Fallback to local generation
      onGenerateBanners(config);
    }
  };

  const handleRefreshBanner = async (bannerId: number) => {
    if (onRefreshBanner) {
      setRefreshingBanner(bannerId);
      await onRefreshBanner(bannerId, config);
      setRefreshingBanner(null);
    }
  };

  const handleRefreshPosters = async () => {
    await loadPosters();
  };

  const handleConfigChange = (field: keyof BannerConfig, value: string) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Card title="AI Banner Generation" icon={<ImageIcon className="h-6 w-6" />}>
      {/* Loading State */}
      {isLoadingPoster && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mx-auto mb-4"></div>
            <p className="text-white/80">Generating AI posters...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {posterError && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300">
          <p>{posterError}</p>
          <button
            onClick={handleRefreshPosters}
            className="mt-2 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
          >
            Try Again
          </button>
        </div>
      )}

      {/* AI-Generated Posters Section */}
      {apiPosters && !isLoadingPoster && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">
              AI-Generated Posters
            </h3>
            <button
              onClick={handleRefreshPosters}
              className="flex items-center gap-1 px-3 py-1 text-gray-400 hover:text-white transition-colors text-sm"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>
          <div className="bg-gray-950/40 rounded-xl p-4 border border-white/20">
            <div className="prose prose-invert max-w-none">
              <pre className="text-sm text-gray-300 whitespace-pre-wrap">
                {JSON.stringify(apiPosters, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Configuration Panel */}
      <div className="mb-6">
        <div className="bg-gray-950/40 rounded-xl p-6 border border-white/20 mb-6">
          <div className="text-center">
            <p className="text-white/80 text-lg mb-8 font-light">
              Generate professional banners with comprehensive AI-powered design
              options:
              <br />
              <span className="text-sm text-white/70">
                Size • Type • Style • Colors • Layout • Imagery
              </span>
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Legacy Options */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Banner Size
              </label>
              <select
                value={config.size}
                onChange={(e) => handleConfigChange("size", e.target.value)}
                className="w-full px-4 py-3 bg-gray-950/60 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-white/50 focus:border-transparent outline-none"
              >
                <option value="small">Small (800x400)</option>
                <option value="medium">Medium (1200x600)</option>
                <option value="large">Large (1920x1080)</option>
                <option value="custom">Custom Size</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Banner Type
              </label>
              <select
                value={config.type}
                onChange={(e) => handleConfigChange("type", e.target.value)}
                className="w-full px-4 py-3 bg-gray-950/60 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-white/50 focus:border-transparent outline-none"
              >
                <option value="social">Social Media</option>
                <option value="web">Web Banner</option>
                <option value="print">Print Ready</option>
                <option value="email">Email Header</option>
              </select>
            </div>

            {/* Enhanced Options */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Design Style
              </label>
              <select
                value={config.style}
                onChange={(e) => handleConfigChange("style", e.target.value)}
                className="w-full px-4 py-3 bg-gray-950/60 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-white/50 focus:border-transparent outline-none"
              >
                <option value="minimal">Minimal</option>
                <option value="modern">Modern</option>
                <option value="classic">Classic</option>
                <option value="professional">Professional</option>
                <option value="creative">Creative</option>
                <option value="elegant">Elegant</option>
                <option value="bold">Bold</option>
                <option value="playful">Playful</option>
                <option value="luxury">Luxury</option>
                <option value="tech">Tech/Digital</option>
                <option value="retro">Retro</option>
                <option value="islamic">Islamic</option>
                <option value="abstract">Abstract</option>
                <option value="geometric">Geometric</option>
                <option value="organic">Organic</option>
                <option value="industrial">Industrial</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Color Scheme
              </label>
              <select
                value={config.colorScheme}
                onChange={(e) =>
                  handleConfigChange("colorScheme", e.target.value)
                }
                className="w-full px-4 py-3 bg-gray-950/60 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-white/50 focus:border-transparent outline-none"
              >
                <option value="warm">Warm Tones</option>
                <option value="cool">Cool Tones</option>
                <option value="vibrant">Vibrant</option>
                <option value="neon">Neon</option>
                <option value="pastel">Pastel</option>
                <option value="monochrome">Monochrome</option>
                <option value="earth">Earth Tones</option>
                <option value="ocean">Ocean Blues</option>
                <option value="sunset">Sunset Colors</option>
                <option value="corporate">Corporate</option>
                <option value="brand">Brand Colors</option>
                <option value="high-contrast">High Contrast</option>
                <option value="muted">Muted</option>
                <option value="gradient">Gradient</option>
                <option value="complementary">Complementary</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Layout Style
              </label>
              <select
                value={config.layout}
                onChange={(e) => handleConfigChange("layout", e.target.value)}
                className="w-full px-4 py-3 bg-gray-950/60 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-white/50 focus:border-transparent outline-none"
              >
                <option value="centered">Centered</option>
                <option value="left-aligned">Left Aligned</option>
                <option value="split-screen">Split Screen</option>
                <option value="header-focus">Header Focus</option>
                <option value="bottom-heavy">Bottom Heavy</option>
                <option value="sidebar">Sidebar</option>
                <option value="grid">Grid Layout</option>
                <option value="asymmetric">Asymmetric</option>
                <option value="magazine">Magazine Style</option>
                <option value="poster">Poster Layout</option>
                <option value="card">Card Design</option>
                <option value="billboard">Billboard</option>
                <option value="social-story">Social Story</option>
                <option value="banner">Banner Format</option>
                <option value="flyer">Flyer Layout</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Imagery/Graphics
              </label>
              <select
                value={config.imagery}
                onChange={(e) => handleConfigChange("imagery", e.target.value)}
                className="w-full px-4 py-3 bg-gray-950/60 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-white/50 focus:border-transparent outline-none"
              >
                <option value="photography">Photography</option>
                <option value="illustrations">Illustrations</option>
                <option value="icons">Icons</option>
                <option value="geometric">Geometric Shapes</option>
                <option value="abstract">Abstract Art</option>
                <option value="patterns">Patterns</option>
                <option value="islamic-motifs">Islamic Motifs</option>
                <option value="tech-elements">Tech Elements</option>
                <option value="nature">Nature</option>
                <option value="cityscape">Cityscape</option>
                <option value="minimalist">Minimalist</option>
                <option value="decorative">Decorative</option>
                <option value="symbols">Symbols</option>
                <option value="data-viz">Data Visualization</option>
                <option value="artistic">Artistic</option>
              </select>
            </div>
          </div>
          {generatedBanners.length === 0 && (
            <div className="flex justify-center pt-10 pb-4">
              <Button
                onClick={handleGenerateBanners}
                loading={isGeneratingBanner}
                label="Generate Banners"
                variant="outline"
              />
            </div>
          )}
        </div>
      </div>

      {generatedBanners.length != 0 && (
        <div className="grid gap-8">
          {generatedBanners.map((banner) => (
            <div
              key={banner.id}
              className="bg-gray-950/40 rounded-2xl p-6 border border-white/20 backdrop-blur-sm hover:border-white/40 transition-all duration-300 group"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h4 className="text-xl font-bold text-white group-hover:text-cyan-200 transition-colors">
                    {banner.style}
                  </h4>
                  <p className="text-sm text-gray-400 font-light mt-1">
                    {banner.description}
                  </p>
                  {(banner.size ||
                    banner.type ||
                    banner.purpose ||
                    banner.styleType ||
                    banner.layout) && (
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {banner.size && (
                        <span className="text-xs bg-blue-900/50 text-blue-200 px-2 py-1 rounded-full">
                          {banner.size}
                        </span>
                      )}
                      {banner.type && (
                        <span className="text-xs bg-green-900/50 text-green-200 px-2 py-1 rounded-full">
                          {banner.type}
                        </span>
                      )}
                      {banner.purpose && (
                        <span className="text-xs bg-cyan-900/50 text-cyan-200 px-2 py-1 rounded-full">
                          {banner.purpose}
                        </span>
                      )}
                      {banner.styleType && (
                        <span className="text-xs bg-purple-900/50 text-purple-200 px-2 py-1 rounded-full">
                          {banner.styleType}
                        </span>
                      )}
                      {banner.layout && (
                        <span className="text-xs bg-orange-900/50 text-orange-200 px-2 py-1 rounded-full">
                          {banner.layout}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex space-x-3">
                  {refreshingBanner === banner.id ? (
                    <button className="p-3 bg-white/10 rounded-xl border border-white/10">
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    </button>
                  ) : (
                    <ActionButton
                      icon={<RefreshCw />}
                      onClick={() => handleRefreshBanner(banner.id)}
                    />
                  )}
                  <ActionButton icon={<Download />} />
                  <ActionButton icon={<Share2 />} />
                </div>
              </div>
              <div className="bg-gradient-to-r from-white/10 to-cyan-500/20 rounded-2xl p-8 text-center border border-white/10">
                <h3 className="text-2xl font-bold text-white mb-3">
                  {eventData.name}
                </h3>
                <p className="text-cyan-200 text-base font-mono mb-4">
                  {new Date(eventData.datetime).toLocaleDateString()} •{" "}
                  {eventData.location}
                </p>
                <div className="mt-4 bg-white/90 text-black px-6 py-2 rounded-full text-base font-bold inline-block shadow-lg">
                  Join Now
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
