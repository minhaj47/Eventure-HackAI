export interface EventData {
  eventName: string;
  dateTime: string;
  location: string;
  description: string;
  eventType: PurposeType;
  registrationFormUrl?: string;
  registrationFormEditUrl?: string;
  autoCreateForm?: boolean;
  className?: string;
  classroomcode?: string;
  classroomlink?: string;
}

// Legacy interface for compatibility
export interface LegacyEventData {
  name: string;
  datetime: string;
  location: string;
  description: string;
  eventType: PurposeType;
}

export interface Banner {
  id: number;
  style: string;
  preview: string;
  description: string;
  // Legacy properties (kept for compatibility)
  size?: BannerSize;
  type?: BannerType;
  // Enhanced properties
  purpose?: PurposeType;
  styleType?: StyleType;
  colorScheme?: ColorSchemeType;
  layout?: LayoutType;
  imagery?: ImageryType;
}

export interface BannerConfig {
  // Legacy properties (kept for compatibility)
  size?: BannerSize;
  type?: BannerType;
  // Enhanced properties
  style: StyleType;
  colorScheme: ColorSchemeType;
  layout: LayoutType;
  imagery: ImageryType;
}

// Legacy types (kept for compatibility)
export type BannerSize = "small" | "medium" | "large" | "custom";
export type BannerType = "social" | "web" | "print" | "email";

// Purpose/Type - defines the context
export type PurposeType =
  | "conference"
  | "workshop"
  | "seminar"
  | "festival"
  | "concert"
  | "webinar"
  | "networking"
  | "exhibition"
  | "launch"
  | "charity"
  | "sports"
  | "cultural"
  | "educational"
  | "corporate"
  | "startup";

// Style - sets the overall design feel
export type StyleType =
  | "minimal"
  | "modern"
  | "classic"
  | "professional"
  | "creative"
  | "elegant"
  | "bold"
  | "playful"
  | "luxury"
  | "tech"
  | "retro"
  | "islamic"
  | "abstract"
  | "geometric"
  | "organic"
  | "industrial";

// Color Scheme - controls mood and harmony
export type ColorSchemeType =
  | "warm"
  | "cool"
  | "vibrant"
  | "neon"
  | "pastel"
  | "monochrome"
  | "earth"
  | "ocean"
  | "sunset"
  | "corporate"
  | "brand"
  | "high-contrast"
  | "muted"
  | "gradient"
  | "complementary"
  | "custom";

// Layout/Text Placement - ensures proper space distribution
export type LayoutType =
  | "centered"
  | "left-aligned"
  | "split-screen"
  | "header-focus"
  | "bottom-heavy"
  | "sidebar"
  | "grid"
  | "asymmetric"
  | "magazine"
  | "poster"
  | "card"
  | "billboard"
  | "social-story"
  | "banner"
  | "flyer";

// Imagery/Graphics - adds relevant visual elements
export type ImageryType =
  | "photography"
  | "illustrations"
  | "icons"
  | "geometric"
  | "abstract"
  | "patterns"
  | "islamic-motifs"
  | "tech-elements"
  | "nature"
  | "cityscape"
  | "minimalist"
  | "decorative"
  | "symbols"
  | "data-viz"
  | "artistic";

export interface RegistrationField {
  id: number;
  name: string;
  type: string;
  required: boolean;
}

export type ButtonVariant = "primary" | "secondary" | "outline";
export type ReminderColor = "white" | "cyan" | "gray";
