"use client";

import {
  ArrowRight,
  Calendar,
  Clock,
  MapPin,
  Plus,
  RefreshCw,
  Sparkles,
  Star,
  Trash,
  Users,
} from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { BackendEvent, useEvents } from "../hooks/useEvents";
import { Background } from "./Background";
import { Footer } from "./Footer";
import { Header } from "./Header";

interface Event {
  id: string;
  name: string;
  eventType: string;
  datetime: string;
  location: string;
  description: string;
  attendeeCount: number;
  status: "upcoming" | "ongoing" | "completed";
  createdAt: string;
}

interface LandingPageProps {
  onCreateEvent: () => void;
  onSelectEvent: (event: Event) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onCreateEvent,
  onSelectEvent,
}) => {
  const { data: session, status } = useSession();
  const { syncGoogleAuthWithBackend } = useAuth();
  const { events: backendEvents, isLoading, error, fetchEvents } = useEvents();
  const [refreshing, setRefreshing] = useState(false);
  const [authSynced, setAuthSynced] = useState(false);

  // Convert backend events to the format expected by the landing page
  const userEvents: Event[] = backendEvents.map((event: BackendEvent) => ({
    id: event._id,
    name: event.eventName,
    eventType: event.eventType,
    datetime: event.dateTime,
    location: event.location,
    description: event.description || "",
    attendeeCount: Math.floor(Math.random() * 200) + 1, // Random for now since backend doesn't track this yet
    status: new Date(event.dateTime) > new Date() ? "upcoming" : "completed",
    createdAt: event.createdAt,
  }));

  // Sync authentication and fetch events when user is authenticated
  useEffect(() => {
    const syncAndLoadEvents = async () => {
      if (session?.user && !authSynced) {
        try {
          await syncGoogleAuthWithBackend();
          setAuthSynced(true);
          await loadEvents();
        } catch (error) {
          console.error("Failed to sync authentication:", error);
        }
      } else if (session?.user && authSynced) {
        await loadEvents();
      }
    };

    syncAndLoadEvents();
  }, [session, authSynced]);

  const loadEvents = async () => {
    if (!session?.user) {
      return;
    }

    setRefreshing(true);
    try {
      // Ensure backend auth is synced before fetching events
      if (!authSynced) {
        await syncGoogleAuthWithBackend();
        setAuthSynced(true);
      }
      await fetchEvents();
    } catch (error) {
      console.error("Failed to load events:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatEventTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (status === "loading") {
    return (
      <div
        className="min-h-screen text-white flex items-center justify-center"
        style={{
          backgroundImage: "linear-gradient(to top, #30cfd0 0%, #330867 100%)",
        }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-white/80">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div
        className="min-h-screen text-white font-sans antialiased relative overflow-hidden"
        style={{
          backgroundImage:
            "linear-gradient(to top, #30a5a5ff 0%, #330867 100%)",
        }}
      >
        <Background />
        <Header />

        <main className="relative z-10 flex items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            {/* CTA Section */}
            <div className="bg-gradient-to-r from-cyan-900/20 to-blue-900/20 rounded-2xl border border-cyan-500/20 p-8">
              <h2 className="text-2xl font-bold text-white mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-white/90 mb-6">
                Sign in with Google to access your event dashboard and start
                creating amazing events.
              </p>
              <button
                onClick={() => signIn("google")}
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            {/* Hero Section */}
            <div className="mt-12">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-white via-cyan-200 to-blue-400 bg-clip-text text-transparent mb-6">
                AI Event Manager
              </h1>
              <p className="text-xl sm:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
                Create, manage, and promote your events with the power of
                artificial intelligence. Generate content, design banners, and
                engage your audience like never before.
              </p>
              {/* Features Preview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="p-6 bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-2xl border border-purple-500/20">
                  <Calendar className="h-8 w-8 text-purple-400 mb-4 mx-auto" />
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Smart Event Creation
                  </h3>
                  <p className="text-white/80 text-sm">
                    AI-powered event planning with automated content generation
                    and scheduling optimization.
                  </p>
                </div>
                <div className="p-6 bg-gradient-to-br from-blue-900/20 to-cyan-900/20 rounded-2xl border border-blue-500/20">
                  <Sparkles className="h-8 w-8 text-blue-400 mb-4 mx-auto" />
                  <h3 className="text-lg font-semibold text-white mb-2">
                    AI Content Generation
                  </h3>
                  <p className="text-white/80 text-sm">
                    Generate social media posts, email campaigns, and
                    promotional materials instantly.
                  </p>
                </div>
                <div className="p-6 bg-gradient-to-br from-green-900/20 to-teal-900/20 rounded-2xl border border-green-500/20">
                  <Users className="h-8 w-8 text-green-400 mb-4 mx-auto" />
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Audience Engagement
                  </h3>
                  <p className="text-white/80 text-sm">
                    Advanced analytics, automated reminders, and classroom
                    management tools.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  // User is signed in - show dashboard
  return (
    <div
      className="min-h-screen text-white font-sans antialiased relative overflow-hidden"
      style={{
        backgroundImage: "linear-gradient(to top, #30cfd0 0%, #330867 100%)",
      }}
    >
      <Background />
      <Header onCreateEvent={onCreateEvent} />

      {/* Welcome Message */}
      <div className="relative z-10 border-b border-white/10 bg-black/50 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-12">
            <div className="text-sm text-white/90">
              Welcome back, {session.user?.name}
            </div>
          </div>
        </div>
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="p-6 bg-gradient-to-br from-blue-900/20 to-cyan-900/20 rounded-2xl border border-blue-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-400 text-sm font-medium">
                  Total Events
                </p>
                <p className="text-2xl font-bold text-white">
                  {userEvents.length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-blue-400" />
            </div>
          </div>

          <div className="p-6 bg-gradient-to-br from-green-900/20 to-teal-900/20 rounded-2xl border border-green-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-400 text-sm font-medium">
                  Total Attendees
                </p>
                <p className="text-2xl font-bold text-white">
                  {userEvents.reduce(
                    (sum, event) => sum + event.attendeeCount,
                    0
                  )}
                </p>
              </div>
              <Users className="h-8 w-8 text-green-400" />
            </div>
          </div>

          <div className="p-6 bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-2xl border border-purple-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-400 text-sm font-medium">Upcoming</p>
                <p className="text-2xl font-bold text-white">
                  {userEvents.filter((e) => e.status === "upcoming").length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-purple-400" />
            </div>
          </div>

          <div className="p-6 bg-gradient-to-br from-amber-900/20 to-orange-900/20 rounded-2xl border border-amber-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-400 text-sm font-medium">Completed</p>
                <p className="text-2xl font-bold text-white">
                  {userEvents.filter((e) => e.status === "completed").length}
                </p>
              </div>
              <Star className="h-8 w-8 text-amber-400" />
            </div>
          </div>
        </div>
        {/* Events List */}
        <div className="bg-gradient-to-br from-gray-900/50 to-black/50 rounded-2xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Your Events</h2>
            <div className="flex items-center gap-3">
              <button
                onClick={loadEvents}
                disabled={refreshing || isLoading}
                className="inline-flex items-center gap-1 px-3 py-2 text-white/70 hover:text-white transition-colors disabled:opacity-50"
              >
                <RefreshCw
                  className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
                />
                Refresh
              </button>
              <button
                onClick={onCreateEvent}
                className="text-cyan-400 hover:text-cyan-300 text-sm font-medium flex items-center gap-1"
              >
                <Plus className="h-4 w-4" />
                Create New Event
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300">
              {error}
            </div>
          )}

          {isLoading && userEvents.length === 0 ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mx-auto mb-4"></div>
              <p className="text-white/80">Loading your events...</p>
            </div>
          ) : userEvents.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white/90 mb-2">
                No events yet
              </h3>
              <p className="text-white/70 mb-6">
                Create your first event to get started
              </p>
              <button
                onClick={onCreateEvent}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium rounded-lg hover:shadow-lg transition-all duration-200"
              >
                <Plus className="h-4 w-4" />
                Create Event
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {userEvents.map((event) => (
                <div
                  key={event.id}
                  className="p-6 bg-gray-900/30 border border-gray-600/20 rounded-xl hover:border-gray-500/40 transition-all duration-200 cursor-pointer group"
                  onClick={() => onSelectEvent(event)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-white font-semibold group-hover:text-cyan-300 transition-colors">
                          {event.name}
                        </h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            event.status === "upcoming"
                              ? "bg-blue-900/30 text-blue-300 border border-blue-500/30"
                              : event.status === "ongoing"
                              ? "bg-green-900/30 text-green-300 border border-green-500/30"
                              : "bg-gray-900/30 text-gray-300 border border-gray-500/30"
                          }`}
                        >
                          {event.status}
                        </span>
                        <span className="px-2 py-1 bg-purple-900/30 text-purple-300 border border-purple-500/30 rounded-full text-xs font-medium">
                          {event.eventType.charAt(0).toUpperCase() +
                            event.eventType.slice(1)}
                        </span>
                      </div>
                      <p className="text-white/80 text-sm mb-3 line-clamp-2">
                        {event.description ||
                          `${
                            event.eventType.charAt(0).toUpperCase() +
                            event.eventType.slice(1)
                          } event at ${event.location}`}
                      </p>
                      <div className="flex items-center gap-6 text-xs text-white/70">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatEventDate(event.datetime)} at{" "}
                          {formatEventTime(event.datetime)}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {event.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {event.attendeeCount} attendees
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button className="p-2 text-white/60 hover:text-red-400 transition-colors">
                        <Trash className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
