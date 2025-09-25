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
      const response = await generateEventPosters({
        eventName: eventData.name,
        dateTime: eventData.datetime,
        location: eventData.location,
        eventType: eventData.eventType,
        description: eventData.description,
      });
      
      console.log("API Response:", response);
      console.log("API Posters:", response.result.Output);
      // Handle the SmythOS agent response format
      
        setApiPosters(response.result.Output);
        console.log("API Posters:", apiPosters);
      
    } catch (error) {
      console.error("Failed to load AI posters:", error);
      setPosterError("Failed to generate AI posters. Please try again.");
    } finally {
      setIsLoadingPoster(false);
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

  const downloadImage = async (imageUrl: string, filename: string) => {
    try {
      const response = await fetch(`/api/proxy?url=${encodeURIComponent(imageUrl)}`);
      console.log("Response:", response); 
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download image:', error);
    }
  };

  const shareImage = async (imageUrl: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${eventData.name} Poster`,
          url: `${window.location.origin}/api/proxy?url=${encodeURIComponent(imageUrl)}`,
        });
      } catch (error) {
        console.error('Failed to share:', error);
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(apiPosters.poster1.url);
        alert('Image URL copied to clipboard!');
      } catch (error) {
        console.error('Failed to copy to clipboard:', error);
      }
    }
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

      {/* Generate Posters Button */}
      {!apiPosters && !isLoadingPoster && (
        <div className="mb-6 text-center">
          <Button
            onClick={loadPosters}
            loading={isLoadingPoster}
            label="Generate AI Posters"
            variant="outline"
          />
        </div>
      )}

      {/* AI-Generated Posters Display */}
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {apiPosters.poster1 && (
              <div className="bg-gray-950/40 rounded-xl p-4 border border-white/20">
                <div className="aspect-square mb-4 rounded-lg overflow-hidden bg-gray-800">
                  <img 
                    src={`/api/proxy?url=${encodeURIComponent(apiPosters.poster1.url)}`} 
                    alt="AI Generated Poster 1" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjNDc0NzQ3Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5Qb3N0ZXIgMTwvdGV4dD48L3N2Zz4=';
                    }}
                  />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-300">Professional Style</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => downloadImage(apiPosters.poster1.url, `${eventData.name}-poster-1.jpg`)}
                      className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                    >
                      <Download className="h-4 w-4 text-white" />
                    </button>
                    <button
                      onClick={() => shareImage(apiPosters.poster1.url)}
                      className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                    >
                      <Share2 className="h-4 w-4 text-white" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {apiPosters.poster2 && (
              <div className="bg-gray-950/40 rounded-xl p-4 border border-white/20">
                <div className="aspect-square mb-4 rounded-lg overflow-hidden bg-gray-800">
                  <img 
                    src={`/api/proxy?url=${encodeURIComponent(apiPosters.poster2.url)}`} 
                    alt="AI Generated Poster 2" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjNDc0NzQ3Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5Qb3N0ZXIgMjwvdGV4dD48L3N2Zz4=';
                    }}
                  />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-300">Modern Style</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => downloadImage(apiPosters.poster2.url, `${eventData.name}-poster-2.jpg`)}
                      className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                    >
                      <Download className="h-4 w-4 text-white" />
                    </button>
                    <button
                      onClick={() => shareImage(apiPosters.poster2.url)}
                      className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                    >
                      <Share2 className="h-4 w-4 text-white" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {apiPosters.poster3 && (
              <div className="bg-gray-950/40 rounded-xl p-4 border border-white/20">
                <div className="aspect-square mb-4 rounded-lg overflow-hidden bg-gray-800">
                <img 
  src={`/api/proxy?url=${encodeURIComponent(apiPosters.poster3.url)}`} 
  alt="Generated Poster" 

                  
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjNDc0NzQ3Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5Qb3N0ZXIgMzwvdGV4dD48L3N2Zz4=';
                    }}
                  />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-300">Creative Style</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => downloadImage(apiPosters.poster3.url, `${eventData.name}-poster-3.jpg`)}
                      className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                    >
                      <Download className="h-4 w-4 text-white" />
                    </button>
                    <button
                      onClick={() => shareImage(apiPosters.poster3.url)}
                      className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                    >
                      <Share2 className="h-4 w-4 text-white" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Configuration Panel - Only show if no AI posters or for local generation */}
      {!apiPosters && (
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
              {/* Configuration options remain the same */}
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

              {/* Add other configuration options as needed */}
            </div>
            
            {generatedBanners.length === 0 && (
              <div className="flex justify-center pt-10 pb-4">
                <Button
                  onClick={loadPosters}
                  loading={isGeneratingBanner}
                  label="Generate Local Banners"
                  variant="outline"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Local Generated Banners */}
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