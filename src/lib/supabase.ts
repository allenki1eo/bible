import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string;
          avatar_url: string | null;
          language: "en" | "sw";
          created_at: string;
        };
        Insert: {
          id: string;
          display_name: string;
          avatar_url?: string | null;
          language?: "en" | "sw";
          created_at?: string;
        };
        Update: {
          display_name?: string;
          avatar_url?: string | null;
          language?: "en" | "sw";
        };
      };
      testimonies: {
        Row: {
          id: string;
          user_id: string;
          content: string;
          is_anonymous: boolean;
          amen_count: number;
          praying_count: number;
          moderation_status: "approved" | "flagged" | "pending";
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          content: string;
          is_anonymous?: boolean;
          amen_count?: number;
          praying_count?: number;
          moderation_status?: "approved" | "flagged" | "pending";
          created_at?: string;
        };
        Update: {
          content?: string;
          is_anonymous?: boolean;
          amen_count?: number;
          praying_count?: number;
          moderation_status?: "approved" | "flagged" | "pending";
        };
      };
      reactions: {
        Row: {
          id: string;
          testimony_id: string;
          user_id: string;
          type: "amen" | "praying";
          created_at: string;
        };
        Insert: {
          id?: string;
          testimony_id: string;
          user_id: string;
          type: "amen" | "praying";
          created_at?: string;
        };
      };
      stories: {
        Row: {
          id: string;
          user_id: string;
          hero: string;
          lesson: string;
          language: "en" | "sw";
          title: string;
          content: string;
          image_url: string | null;
          audio_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          hero: string;
          lesson: string;
          language: "en" | "sw";
          title: string;
          content: string;
          image_url?: string | null;
          audio_url?: string | null;
          created_at?: string;
        };
      };
      devotions: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          mood: string;
          content: string;
          scripture_ref: string;
          completed: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          mood: string;
          content: string;
          scripture_ref: string;
          completed?: boolean;
          created_at?: string;
        };
      };
      streaks: {
        Row: {
          id: string;
          user_id: string;
          current_streak: number;
          longest_streak: number;
          last_check_in: string | null;
          grace_days_used: number;
        };
        Insert: {
          id?: string;
          user_id: string;
          current_streak?: number;
          longest_streak?: number;
          last_check_in?: string | null;
          grace_days_used?: number;
        };
        Update: {
          current_streak?: number;
          longest_streak?: number;
          last_check_in?: string | null;
          grace_days_used?: number;
        };
      };
      prayers: {
        Row: {
          id: string;
          user_id: string;
          encrypted_content: string;
          status: "active" | "answered";
          created_at: string;
          answered_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          encrypted_content: string;
          status?: "active" | "answered";
          created_at?: string;
          answered_at?: string | null;
        };
      };
      inbox_messages: {
        Row: {
          id: string;
          to_user_id: string;
          from_user_id: string;
          message_type: "hug" | "verse";
          content: string;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          to_user_id: string;
          from_user_id: string;
          message_type: "hug" | "verse";
          content: string;
          is_read?: boolean;
          created_at?: string;
        };
      };
      user_achievements: {
        Row: {
          id: string;
          user_id: string;
          hero_id: string;
          unlocked_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          hero_id: string;
          unlocked_at?: string;
        };
      };
      push_subscriptions: {
        Row: {
          id: string;
          user_id: string;
          endpoint: string;
          p256dh: string;
          auth: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          endpoint: string;
          p256dh: string;
          auth: string;
          created_at?: string;
        };
      };
    };
  };
};
