import { Calendar, MapPin, Wand2 } from "lucide-react";
import React from "react";
import { EventData } from "../types";
import { Button, Card, Input, TextArea } from "./ui";

interface EventCreationFormProps {
  eventData: EventData;
  onInputChange: (field: keyof EventData, value: string) => void;
  onSubmit: () => void;
  isGenerating: boolean;
}

export const EventCreationForm: React.FC<EventCreationFormProps> = ({
  eventData,
  onInputChange,
  onSubmit,
  isGenerating,
}) => (
  <Card title="Create Event" icon={<Calendar className="h-6 w-6" />}>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <Input
        label="Event Name"
        value={eventData.name}
        onChange={(v) => onInputChange("name", v)}
        placeholder="e.g., AI Conference 2025"
      />

      <Input
        label="Date & Time"
        type="datetime-local"
        value={eventData.datetime}
        onChange={(v) => onInputChange("datetime", v)}
      />

      <Input
        label="Location"
        icon={<MapPin className="h-5 w-5 text-white/80" />}
        value={eventData.location}
        onChange={(v) => onInputChange("location", v)}
        placeholder="Venue or virtual link"
      />

      <div>
        <label className="block text-base font-medium text-gray-300 mb-3">
          Event Type
        </label>
        <select
          value={eventData.eventType}
          onChange={(e) => onInputChange("eventType", e.target.value)}
          className="w-full px-4 py-4 bg-gray-950/60 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-white/50 focus:border-transparent outline-none transition-all text-base"
        >
          <option value="conference">Conference</option>
          <option value="workshop">Workshop</option>
          <option value="seminar">Seminar</option>
          <option value="festival">Festival</option>
          <option value="concert">Concert</option>
          <option value="webinar">Webinar</option>
          <option value="networking">Networking</option>
          <option value="exhibition">Exhibition</option>
          <option value="launch">Product Launch</option>
          <option value="charity">Charity Event</option>
          <option value="sports">Sports Event</option>
          <option value="cultural">Cultural Event</option>
          <option value="educational">Educational</option>
          <option value="corporate">Corporate</option>
          <option value="startup">Startup Event</option>
        </select>
      </div>

      <div className="md:col-span-2">
        <TextArea
          label="Description"
          value={eventData.description}
          onChange={(v) => onInputChange("description", v)}
          placeholder="Describe your event, audience, and goals..."
          rows={4}
        />
      </div>
    </div>

    <div className="mt-8 flex justify-center">
      <Button
        onClick={onSubmit}
        loading={isGenerating}
        icon={<Wand2 className="h-5 w-5" />}
        label="Generate with AI"
        variant="outline"
      />
    </div>
  </Card>
);
