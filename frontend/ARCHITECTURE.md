# AI Event Manager - Modular Architecture

This project has been refactored to use a modular component architecture for better maintainability, reusability, and code organization.

## Project Structure

```
frontend/
├── app/
│   ├── page.tsx              # Main page component (now modular)
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── index.ts              # Component exports
│   ├── Background.tsx        # Animated background elements
│   ├── Header.tsx            # Application header
│   ├── Footer.tsx            # Application footer
│   ├── EventCreationForm.tsx # Event creation form component
│   ├── AIGeneratedContent.tsx# AI-generated content display
│   ├── BannerGenerator.tsx   # Banner generation component
│   ├── RegistrationFields.tsx# Registration form builder
│   ├── AutomatedReminders.tsx# Reminder system component
│   ├── ReminderCard.tsx      # Individual reminder card
│   └── ui/
│       ├── index.ts          # UI component exports
│       ├── Card.tsx          # Reusable card component
│       ├── Button.tsx        # Button component with variants
│       ├── Input.tsx         # Input field component
│       ├── TextArea.tsx      # Textarea component
│       ├── Label.tsx         # Label component
│       └── ActionButton.tsx  # Small action button
├── hooks/
│   └── useEventManager.ts    # Custom hook for event state management
└── types/
    └── index.ts              # TypeScript type definitions
```

## Key Benefits of Modular Architecture

### 1. **Separation of Concerns**

- Each component has a single responsibility
- Business logic separated from UI components
- Clear separation between data and presentation layers

### 2. **Reusability**

- UI components can be reused across different parts of the application
- Custom hooks can be shared between components
- Type definitions ensure consistency

### 3. **Maintainability**

- Easy to locate and modify specific functionality
- Changes to one component don't affect others
- Cleaner, more readable code structure

### 4. **Testability**

- Individual components can be tested in isolation
- Mock dependencies easily for unit testing
- Clear interfaces between components

### 5. **Scalability**

- Easy to add new features as separate components
- Can easily extract components to separate packages
- Team members can work on different components simultaneously

## Component Overview

### UI Components (`components/ui/`)

Reusable, generic UI components that don't contain business logic:

- **Card**: Container component with title and icon
- **Button**: Configurable button with loading states and variants
- **Input**: Form input with label and icon support
- **TextArea**: Multi-line text input
- **Label**: Styled text label
- **ActionButton**: Small icon-only button

### Feature Components (`components/`)

Business logic components that compose UI components:

- **EventCreationForm**: Handles event data input
- **AIGeneratedContent**: Displays AI-generated promotional content
- **BannerGenerator**: Manages banner creation workflow
- **RegistrationFields**: Dynamic form builder for event registration
- **AutomatedReminders**: Shows reminder configuration options
- **ReminderCard**: Individual reminder type display

### Layout Components

- **Background**: Animated background elements
- **Header**: Application header with branding
- **Footer**: Application footer

### Custom Hook (`hooks/useEventManager.ts`)

Centralized state management for:

- Event data (name, date, location, description)
- UI states (loading, generation states)
- Registration field management
- Banner generation logic

### Types (`types/index.ts`)

TypeScript interfaces for:

- EventData
- Banner
- RegistrationField
- ButtonVariant
- ReminderColor

## Usage Examples

### Importing Components

```tsx
// Import all feature components
import {
  EventCreationForm,
  AIGeneratedContent,
  BannerGenerator,
} from "../components";

// Import UI components
import { Card, Button, Input } from "../components/ui";

// Import types
import { EventData, Banner } from "../types";

// Import custom hook
import { useEventManager } from "../hooks/useEventManager";
```

### Using the Custom Hook

```tsx
const {
  eventData,
  showAIOutput,
  isGenerating,
  handleEventSubmit,
  handleInputChange,
  generateBanners,
} = useEventManager();
```

### Creating New Components

When adding new components, follow this pattern:

1. Create the component file in appropriate directory
2. Add proper TypeScript interfaces
3. Export from the relevant index.ts file
4. Import and use in parent components

## Development Guidelines

### Component Design Principles

1. **Single Responsibility**: Each component should have one clear purpose
2. **Props Interface**: Always define TypeScript interfaces for props
3. **Default Props**: Provide sensible defaults where appropriate
4. **Error Boundaries**: Handle error states gracefully
5. **Accessibility**: Include proper ARIA labels and keyboard navigation

### File Naming Conventions

- Components: PascalCase (e.g., `EventCreationForm.tsx`)
- Hooks: camelCase with 'use' prefix (e.g., `useEventManager.ts`)
- Types: camelCase (e.g., `index.ts`)
- Constants: UPPER_SNAKE_CASE

### State Management

- Use custom hooks for complex state logic
- Keep component state minimal and focused
- Pass data down through props, events up through callbacks

## Future Enhancements

The modular structure enables easy implementation of:

- Unit and integration testing
- Storybook component documentation
- Theme system and dark/light mode
- Internationalization (i18n)
- Performance optimizations with React.memo
- Component libraries and design systems

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Run development server:

   ```bash
   npm run dev
   ```

3. Start building with the modular components!

## Contributing

When contributing to this project:

1. Follow the established component structure
2. Add proper TypeScript types
3. Update this README if adding new architectural patterns
4. Ensure components are properly exported
5. Test components in isolation before integration
