export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          display_name: string | null
          avatar_url: string | null
          role: string
          created_at: string
          updated_at: string
          razorpay_customer_id: string | null
          razorpay_subscription_id: string | null
          subscription_status: string
          subscription_tier: string
          bio: string | null
          last_notification_read_at: string | null
        }
        Insert: {
          id: string
          display_name?: string | null
          avatar_url?: string | null
          role?: string
          created_at?: string
          updated_at?: string
          razorpay_customer_id?: string | null
          razorpay_subscription_id?: string | null
          subscription_status?: string
          subscription_tier?: string
          bio?: string | null
          last_notification_read_at?: string | null
        }
        Update: {
          id?: string
          display_name?: string | null
          avatar_url?: string | null
          role?: string
          created_at?: string
          updated_at?: string
          razorpay_customer_id?: string | null
          razorpay_subscription_id?: string | null
          subscription_status?: string
          subscription_tier?: string
          bio?: string | null
          last_notification_read_at?: string | null
        }
      }
      prompts: {
        Row: {
          id: string
          title: string
          slug: string
          prompt: string
          image_url: string
          thumbnail_url: string | null
          category_id: string | null
          model: string | null
          aspect_ratio: string | null
          style: string | null
          source_name: string | null
          source_url: string | null
          status: string
          is_featured: boolean
          view_count: number
          copy_count: number
          save_count: number
          created_by: string | null
          published_at: string | null
          created_at: string
          updated_at: string
          like_count: number | null
          is_premium: boolean | null
          has_variants: boolean
          variants: Json | null
        }
        Insert: {
          id?: string
          title: string
          slug: string
          prompt: string
          image_url: string
          thumbnail_url?: string | null
          category_id?: string | null
          model?: string | null
          aspect_ratio?: string | null
          style?: string | null
          source_name?: string | null
          source_url?: string | null
          status?: string
          is_featured?: boolean
          view_count?: number
          copy_count?: number
          save_count?: number
          created_by?: string | null
          published_at?: string | null
          created_at?: string
          updated_at?: string
          like_count?: number | null
          is_premium?: boolean | null
          has_variants?: boolean
          variants?: Json | null
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          prompt?: string
          image_url?: string
          thumbnail_url?: string | null
          category_id?: string | null
          model?: string | null
          aspect_ratio?: string | null
          style?: string | null
          source_name?: string | null
          source_url?: string | null
          status?: string
          is_featured?: boolean
          view_count?: number
          copy_count?: number
          save_count?: number
          created_by?: string | null
          published_at?: string | null
          created_at?: string
          updated_at?: string
          like_count?: number | null
          is_premium?: boolean | null
          has_variants?: boolean
          variants?: Json | null
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          plan_id: string
          provider: string
          provider_customer_id: string | null
          provider_subscription_id: string | null
          status: string
          current_period_start: string | null
          current_period_end: string | null
          cancel_at_period_end: boolean
          cancelled_at: string | null
          ended_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan_id: string
          provider?: string
          provider_customer_id?: string | null
          provider_subscription_id?: string | null
          status?: string
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean
          cancelled_at?: string | null
          ended_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan_id?: string
          provider?: string
          provider_customer_id?: string | null
          provider_subscription_id?: string | null
          status?: string
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean
          cancelled_at?: string | null
          ended_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      subscription_events: {
        Row: {
          id: string
          subscription_id: string
          event_type: string
          provider_event_id: string | null
          payload: Json
          created_at: string
        }
        Insert: {
          id?: string
          subscription_id: string
          event_type: string
          provider_event_id?: string | null
          payload?: Json
          created_at?: string
        }
        Update: {
          id?: string
          subscription_id?: string
          event_type?: string
          provider_event_id?: string | null
          payload?: Json
          created_at?: string
        }
      }
      payment_transactions: {
        Row: {
          id: string
          user_id: string
          subscription_id: string | null
          plan_id: string | null
          amount: number
          currency: string
          provider: string
          provider_payment_id: string | null
          provider_order_id: string | null
          status: string
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          subscription_id?: string | null
          plan_id?: string | null
          amount: number
          currency?: string
          provider?: string
          provider_payment_id?: string | null
          provider_order_id?: string | null
          status?: string
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          subscription_id?: string | null
          plan_id?: string | null
          amount?: number
          currency?: string
          provider?: string
          provider_payment_id?: string | null
          provider_order_id?: string | null
          status?: string
          metadata?: Json
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
