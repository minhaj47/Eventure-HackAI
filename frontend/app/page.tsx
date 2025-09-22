"use client";
import {
  Bell,
  Calendar,
  Download,
  ExternalLink,
  Image,
  MapPin,
  Minus,
  Plus,
  Share2,
  Sparkles,
  Users,
  Wand2,
} from "lucide-react";
import { useState } from "react";

export default function AIEventManager() {
  const [eventData, setEventData] = useState({
    name: "",
    datetime: "",
    location: "",
    description: "",
  });

  const [showAIOutput, setShowAIOutput] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  type Banner = {
    id: number;
    style: string;
    preview: string;
    description: string;
  };
  const [generatedBanners, setGeneratedBanners] = useState<Banner[]>([]);
  const [isGeneratingBanner, setIsGeneratingBanner] = useState(false);

  const [registrationFields, setRegistrationFields] = useState([
    { id: 1, name: "Full Name", type: "text", required: true },
    { id: 2, name: "Email Address", type: "email", required: true },
    { id: 3, name: "Phone Number", type: "tel", required: false },
    { id: 4, name: "Organization", type: "text", required: false },
  ]);
  const [newFieldName, setNewFieldName] = useState("");

  const handleEventSubmit = () => {
    if (!eventData.name || !eventData.datetime || !eventData.location) return;
    setIsGenerating(true);
    setTimeout(() => {
      setShowAIOutput(true);
      setIsGenerating(false);
    }, 2000);
  };

  const handleInputChange = (field: keyof typeof eventData, value: string) => {
    setEventData((prev) => ({ ...prev, [field]: value }));
  };

  const generateBanners = () => {
    setIsGeneratingBanner(true);
    setTimeout(() => {
      const banners = [
        {
          id: 1,
          style: "Neon Cyber",
          preview: "neon-banner",
          description: "High-tech glow with futuristic typography",
        },
        {
          id: 2,
          style: "Minimalist Dark",
          preview: "dark-minimal",
          description: "Clean, elegant, and professional",
        },
        {
          id: 3,
          style: "Holographic Wave",
          preview: "hologram",
          description: "Dynamic 3D wave with motion illusion",
        },
      ];
      setGeneratedBanners(banners);
      setIsGeneratingBanner(false);
    }, 3000);
  };

  const addRegistrationField = () => {
    if (!newFieldName.trim()) return;
    setRegistrationFields([
      ...registrationFields,
      { id: Date.now(), name: newFieldName, type: "text", required: false },
    ]);
    setNewFieldName("");
  };

  const removeRegistrationField = (id: number) => {
    setRegistrationFields((fields) => fields.filter((f) => f.id !== id));
  };

  const toggleFieldRequired = (id: number) => {
    setRegistrationFields((fields) =>
      fields.map((f) => (f.id === id ? { ...f, required: !f.required } : f))
    );
  };

  return (
    <div className="min-h-screen bg-[#030303] text-white font-inter antialiased relative overflow-hidden">
      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-2 h-2 bg-orange-500/40 rounded-full animate-ping"></div>
        <div className="absolute top-1/3 right-20 w-3 h-3 bg-red-500/30 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 left-1/4 w-2 h-2 bg-orange-400/50 rounded-full animate-bounce"></div>
        <div className="absolute top-40 right-1/3 w-1 h-1 bg-white/20 rounded-full animate-[float_4s_ease-in-out_infinite]"></div>
        <div className="absolute bottom-40 right-1/4 w-1 h-1 bg-orange-400/30 rounded-full animate-[float_6s_ease-in-out_infinite]"></div>
      </div>

      {/* Animated Gradient Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#030303] via-[#0a0a0a] to-[#111]"></div>
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-orange-500/10 rounded-full blur-3xl animate-[pulse_8s_ease-in-out_infinite]"></div>
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-red-500/10 rounded-full blur-3xl animate-[pulse_10s_ease-in-out_infinite]"></div>
      </div>

      {/* Header */}
      <header className="relative backdrop-blur-md bg-black/20 border-b border-orange-500/10">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col items-center">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl blur-md"></div>
              <Sparkles className="h-10 w-10 text-white relative z-10" />
            </div>
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-400 via-red-400 to-orange-500 bg-clip-text text-transparent tracking-tight">
                AI Event Manager
              </h1>
              <p className="text-gray-300 mt-2 text-base md:text-lg font-medium max-w-lg mx-auto">
                Intelligent automation for seamless event creation, promotion &
                engagement
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left: Event Form */}
          <Card title="Create Event" icon={<Calendar className="h-6 w-6" />}>
            <div className="space-y-6">
              <Input
                label="Event Name"
                value={eventData.name}
                onChange={(v) => handleInputChange("name", v)}
                placeholder="e.g., AI Conference 2025"
              />

              <Input
                label="Date & Time"
                type="datetime-local"
                value={eventData.datetime}
                onChange={(v) => handleInputChange("datetime", v)}
              />

              <Input
                label="Location"
                icon={<MapPin className="h-5 w-5 text-orange-400" />}
                value={eventData.location}
                onChange={(v) => handleInputChange("location", v)}
                placeholder="Venue or virtual link"
              />

              <TextArea
                label="Description"
                value={eventData.description}
                onChange={(v) => handleInputChange("description", v)}
                placeholder="Describe your event, audience, and goals..."
                rows={5}
              />

              <Button
                onClick={handleEventSubmit}
                loading={isGenerating}
                icon={<Wand2 className="h-5 w-5" />}
                label="Generate with AI"
                variant="primary"
              />
            </div>
          </Card>

          {/* Right: AI Output & Banners */}
          <div className="space-y-12">
            {showAIOutput && (
              <>
                <Card
                  title="AI-Generated Content"
                  icon={<Sparkles className="h-6 w-6" />}
                >
                  {/* Poster Preview */}
                  <div className="mb-8">
                    <Label>Event Poster Preview</Label>
                    <div className="mt-4 bg-gradient-to-br from-orange-900/20 to-red-900/20 rounded-2xl p-6 border border-orange-500/20 backdrop-blur-sm shadow-lg">
                      <div className="bg-[#0a0a0a] rounded-xl p-6 border border-orange-400/10 shadow-inner">
                        <h3 className="text-2xl font-bold text-orange-300 mb-2">
                          {eventData.name}
                        </h3>
                        <p className="text-orange-200 text-sm font-mono">
                          📅 {new Date(eventData.datetime).toLocaleDateString()}{" "}
                          • {new Date(eventData.datetime).toLocaleTimeString()}
                        </p>
                        <p className="text-orange-200 text-sm font-mono mb-4">
                          📍 {eventData.location}
                        </p>
                        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2 rounded-full text-sm font-semibold inline-block shadow-lg">
                          Register Now
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Promotional Content */}
                  <div className="space-y-5">
                    <Label>Social Media Caption</Label>
                    <div className="bg-[#0a0a0a]/60 p-4 rounded-xl border border-orange-500/20 text-gray-300 text-sm font-mono">
                      🎉 Don't miss{" "}
                      <span className="text-orange-400">{eventData.name}</span>!
                      Join us at{" "}
                      <span className="text-orange-400">
                        {eventData.location}
                      </span>{" "}
                      for an unforgettable experience. Limited spots! ✨ #Event
                      #AI #Tech
                    </div>

                    <Label>Email Subject</Label>
                    <div className="bg-[#0a0a0a]/60 p-4 rounded-xl border border-orange-500/20 text-gray-300 text-sm font-mono">
                      🚀 You're Invited:{" "}
                      <span className="text-orange-400">{eventData.name}</span>{" "}
                      – Reserve Your Spot!
                    </div>
                  </div>
                </Card>

                {/* Banner Generator */}
                <Card
                  title="AI Banner Generation"
                  icon={<Image className="h-6 w-6" />}
                >
                  {generatedBanners.length === 0 ? (
                    <div className="text-center py-6">
                      <p className="text-gray-400 text-sm mb-6 font-mono">
                        Generate stunning, on-brand banners in seconds
                      </p>
                      <Button
                        onClick={generateBanners}
                        loading={isGeneratingBanner}
                        label="Generate Banners"
                        variant="secondary"
                      />
                    </div>
                  ) : (
                    <div className="grid gap-6">
                      {generatedBanners.map((banner) => (
                        <div
                          key={banner.id}
                          className="bg-[#0a0a0a]/40 rounded-xl p-5 border border-orange-500/20 backdrop-blur-sm hover:border-orange-500/40 transition-all duration-300 group"
                        >
                          <div className="flex justify-between items-center mb-4">
                            <div>
                              <h4 className="text-lg font-semibold text-orange-300 group-hover:text-orange-200 transition-colors">
                                {banner.style}
                              </h4>
                              <p className="text-xs text-gray-400 font-mono">
                                {banner.description}
                              </p>
                            </div>
                            <div className="flex space-x-2">
                              <ActionButton icon={<Download />} />
                              <ActionButton icon={<Share2 />} />
                            </div>
                          </div>
                          <div className="bg-gradient-to-r from-orange-900/40 to-red-900/40 rounded-lg p-6 text-center border border-orange-500/10">
                            <h3 className="text-xl font-bold text-white mb-2">
                              {eventData.name}
                            </h3>
                            <p className="text-orange-200 text-xs font-mono mb-1">
                              {new Date(
                                eventData.datetime
                              ).toLocaleDateString()}{" "}
                              • {eventData.location}
                            </p>
                            <div className="mt-3 bg-orange-500/80 text-white px-4 py-1.5 rounded-full text-xs font-semibold inline-block shadow-md">
                              Join Now
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </>
            )}

            {/* Registration Fields */}
            <Card
              title="Registration Fields"
              icon={<Users className="h-6 w-6" />}
            >
              <p className="text-gray-400 text-sm mb-6 font-mono">
                Customize attendee data collection
              </p>
              <div className="space-y-4">
                {registrationFields.map((field) => (
                  <div
                    key={field.id}
                    className="flex items-center justify-between bg-[#0a0a0a]/40 p-3 rounded-lg border border-orange-500/10 hover:border-orange-500/30 transition-all"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium text-white">
                        {field.name}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-mono ${
                          field.required
                            ? "bg-red-500/20 text-red-300"
                            : "bg-gray-500/20 text-gray-300"
                        }`}
                      >
                        {field.required ? "Required" : "Optional"}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleFieldRequired(field.id)}
                        className="text-orange-400 hover:text-orange-300 text-xs font-mono"
                      >
                        Toggle
                      </button>
                      <button
                        onClick={() => removeRegistrationField(field.id)}
                        className="text-red-400 hover:text-red-300 p-1"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex space-x-3">
                <input
                  type="text"
                  value={newFieldName}
                  onChange={(e) => setNewFieldName(e.target.value)}
                  placeholder="New field name..."
                  className="flex-1 px-4 py-2.5 bg-[#0a0a0a]/60 border border-orange-500/20 rounded-lg text-sm text-white placeholder-gray-500 focus:ring-1 focus:ring-orange-500 focus:border-transparent outline-none transition-all font-mono"
                />
                <Button
                  onClick={addRegistrationField}
                  icon={<Plus className="h-4 w-4" />}
                  label="Add"
                  variant="outline"
                />
              </div>

              <Button
                className="mt-6"
                label="Generate Registration Form"
                icon={<ExternalLink className="h-4 w-4" />}
                variant="primary"
              />

              <div className="mt-5 p-4 bg-orange-500/10 rounded-lg border border-orange-500/20 text-xs text-orange-200 font-mono">
                💡 Form auto-sends confirmations & reminders. No setup needed.
              </div>
            </Card>
          </div>
        </div>

        {/* Reminders Section */}
        <Card
          title="Automated Reminders"
          icon={<Bell className="h-6 w-6" />}
          fullWidth
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <ReminderCard
              title="Email Reminders"
              icon={<Bell />}
              color="orange"
              items={[
                "7 days before",
                "3 days before",
                "1 day before",
                "2 hours before",
              ]}
            />
            <ReminderCard
              title="SMS Alerts"
              icon={<Users />}
              color="red"
              items={[
                "1 day before",
                "1 hour before",
                "15 minutes before",
                "Event starting now",
              ]}
            />
            <ReminderCard
              title="AI Follow-ups"
              icon={<Sparkles />}
              color="gray"
              items={[
                "Thank you message",
                "Feedback collection",
                "Photo sharing request",
                "Next event suggestions",
              ]}
            />
          </div>
        </Card>
      </main>

      {/* Footer */}
      <footer className="relative backdrop-blur-md bg-black/20 border-t border-orange-500/10 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-8 text-center">
          <p className="text-gray-500 text-sm font-mono">
            © {new Date().getFullYear()} AI Event Manager • Powered by
            intelligent automation ✨
          </p>
        </div>
      </footer>
    </div>
  );
}

// === Reusable Components ===

const Card = ({
  title,
  icon,
  children,
  fullWidth = false,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  fullWidth?: boolean;
}) => (
  <div
    className={`backdrop-blur-md bg-[#0a0a0a]/40 rounded-2xl border border-orange-500/10 p-6 shadow-lg hover:shadow-orange-500/5 transition-all duration-300 ${
      fullWidth ? "lg:col-span-2" : ""
    }`}
  >
    <div className="flex items-center space-x-3 mb-6">
      <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg shadow-inner">
        {icon}
      </div>
      <h2 className="text-xl font-semibold text-white">{title}</h2>
    </div>
    {children}
  </div>
);

const Input = ({
  label,
  value,
  onChange,
  placeholder,
  icon,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  type?: string;
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-300 mb-2">
      {label}
    </label>
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2">{icon}</div>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full px-4 py-3 bg-[#0a0a0a]/60 border border-orange-500/20 rounded-lg text-white placeholder-gray-500 focus:ring-1 focus:ring-orange-500 focus:border-transparent outline-none transition-all font-mono ${
          icon ? "pl-10" : ""
        }`}
      />
    </div>
  </div>
);

const TextArea = ({
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-300 mb-2">
      {label}
    </label>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full px-4 py-3 bg-[#0a0a0a]/60 border border-orange-500/20 rounded-lg text-white placeholder-gray-500 focus:ring-1 focus:ring-orange-500 focus:border-transparent outline-none transition-all resize-none font-mono"
    />
  </div>
);

const Label = ({ children }: { children: React.ReactNode }) => (
  <h4 className="text-sm font-semibold text-orange-400 mb-2">{children}</h4>
);

const Button = ({
  onClick,
  loading,
  icon,
  label,
  variant = "primary",
  className = "",
}: {
  onClick?: () => void;
  loading?: boolean;
  icon?: React.ReactNode;
  label: string;
  variant?: "primary" | "secondary" | "outline";
  className?: string;
}) => {
  const base =
    "flex items-center justify-center space-x-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed";
  const variants = {
    primary:
      "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-orange-500/25",
    secondary:
      "bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white",
    outline:
      "border border-orange-500/30 hover:bg-orange-500/10 text-orange-300 hover:text-orange-200",
  };

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {loading ? (
        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
      ) : icon ? (
        icon
      ) : null}
      <span>{label}</span>
    </button>
  );
};

const ActionButton = ({ icon }: { icon: React.ReactNode }) => (
  <button className="p-1.5 bg-orange-500/10 rounded-lg hover:bg-orange-500/20 transition-colors">
    {icon}
  </button>
);

const ReminderCard = ({
  title,
  icon,
  color,
  items,
}: {
  title: string;
  icon: React.ReactNode;
  color: "orange" | "red" | "gray";
  items: string[];
}) => {
  const colorMap = {
    orange: {
      bg: "bg-orange-500/10",
      text: "text-orange-200",
      border: "border-orange-400/20",
      dot: "bg-orange-400",
    },
    red: {
      bg: "bg-red-500/10",
      text: "text-red-200",
      border: "border-red-400/20",
      dot: "bg-red-400",
    },
    gray: {
      bg: "bg-gray-500/10",
      text: "text-gray-200",
      border: "border-gray-400/20",
      dot: "bg-gray-400",
    },
  };

  const { bg, text, border, dot } = colorMap[color];

  return (
    <div className={`p-5 rounded-xl ${bg} border ${border} backdrop-blur-sm`}>
      <div className="flex items-center space-x-2 mb-4">
        <div
          className={`p-1.5 ${
            color === "orange"
              ? "bg-orange-500"
              : color === "red"
              ? "bg-red-500"
              : "bg-gray-600"
          } rounded-md`}
        >
          {icon}
        </div>
        <h3 className={`text-sm font-semibold ${text}`}>{title}</h3>
      </div>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-center space-x-2 text-xs">
            <div className={`w-1.5 h-1.5 ${dot} rounded-full`}></div>
            <span className={text}>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
