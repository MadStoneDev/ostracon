export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      blocked_users: {
        Row: {
          blocked_id: string
          blocker_id: string
          created_at: string | null
        }
        Insert: {
          blocked_id: string
          blocker_id: string
          created_at?: string | null
        }
        Update: {
          blocked_id?: string
          blocker_id?: string
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blocked_users_blocked_id_fkey"
            columns: ["blocked_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blocked_users_blocker_id_fkey"
            columns: ["blocker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      comment_edit_history: {
        Row: {
          comment_id: string
          edited_at: string | null
          id: string
          previous_content: string
        }
        Insert: {
          comment_id: string
          edited_at?: string | null
          id?: string
          previous_content: string
        }
        Update: {
          comment_id?: string
          edited_at?: string | null
          id?: string
          previous_content?: string
        }
        Relationships: [
          {
            foreignKeyName: "comment_edit_history_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "fragment_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      comment_reactions: {
        Row: {
          comment_id: string
          created_at: string | null
          id: string
          type: string
          user_id: string
        }
        Insert: {
          comment_id: string
          created_at?: string | null
          id?: string
          type: string
          user_id: string
        }
        Update: {
          comment_id?: string
          created_at?: string | null
          id?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comment_reactions_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "fragment_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comment_reactions_type_fkey"
            columns: ["type"]
            isOneToOne: false
            referencedRelation: "fragment_reaction_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comment_reactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      communities: {
        Row: {
          avatar_url: string | null
          cover_position: Json | null
          cover_url: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          display_name: string
          id: string
          is_nsfw: boolean | null
          join_fee: number | null
          join_type: string | null
          member_count: number | null
          name: string
          rules: Json | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          cover_position?: Json | null
          cover_url?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          display_name: string
          id?: string
          is_nsfw?: boolean | null
          join_fee?: number | null
          join_type?: string | null
          member_count?: number | null
          name: string
          rules?: Json | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          cover_position?: Json | null
          cover_url?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          display_name?: string
          id?: string
          is_nsfw?: boolean | null
          join_fee?: number | null
          join_type?: string | null
          member_count?: number | null
          name?: string
          rules?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "communities_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      community_members: {
        Row: {
          community_id: string
          joined_at: string | null
          role: string | null
          show_in_feed: boolean | null
          user_id: string
        }
        Insert: {
          community_id: string
          joined_at?: string | null
          role?: string | null
          show_in_feed?: boolean | null
          user_id: string
        }
        Update: {
          community_id?: string
          joined_at?: string | null
          role?: string | null
          show_in_feed?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_members_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_participants: {
        Row: {
          conversation_id: string
          joined_at: string | null
          last_read_at: string | null
          user_id: string
        }
        Insert: {
          conversation_id: string
          joined_at?: string | null
          last_read_at?: string | null
          user_id: string
        }
        Update: {
          conversation_id?: string
          joined_at?: string | null
          last_read_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string | null
          id: string
          is_group: boolean | null
          last_message_at: string | null
          last_message_preview: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_group?: boolean | null
          last_message_at?: string | null
          last_message_preview?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_group?: boolean | null
          last_message_at?: string | null
          last_message_preview?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      flag_appeals: {
        Row: {
          appealed_by: string
          created_at: string | null
          id: string
          reason: string
          resolution_id: string
          review_notes: Json | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
        }
        Insert: {
          appealed_by: string
          created_at?: string | null
          id?: string
          reason: string
          resolution_id: string
          review_notes?: Json | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
        }
        Update: {
          appealed_by?: string
          created_at?: string | null
          id?: string
          reason?: string
          resolution_id?: string
          review_notes?: Json | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "flag_appeals_appealed_by_fkey"
            columns: ["appealed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flag_appeals_resolution_id_fkey"
            columns: ["resolution_id"]
            isOneToOne: false
            referencedRelation: "fragment_flag_resolutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flag_appeals_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      follows: {
        Row: {
          created_at: string | null
          follower_id: string
          following_id: string
        }
        Insert: {
          created_at?: string | null
          follower_id: string
          following_id: string
        }
        Update: {
          created_at?: string | null
          follower_id?: string
          following_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follows_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      fragment_comments: {
        Row: {
          content: string
          created_at: string | null
          deleted_at: string | null
          fragment_id: string
          id: string
          is_edited: boolean | null
          parent_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          deleted_at?: string | null
          fragment_id: string
          id?: string
          is_edited?: boolean | null
          parent_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          deleted_at?: string | null
          fragment_id?: string
          id?: string
          is_edited?: boolean | null
          parent_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fragment_comments_fragment_id_fkey"
            columns: ["fragment_id"]
            isOneToOne: false
            referencedRelation: "fragments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fragment_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "fragment_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fragment_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      fragment_flag_resolutions: {
        Row: {
          action_taken: string | null
          created_at: string | null
          flag_count: number | null
          fragment_id: string
          id: string
          priority: string | null
          resolution_notes: Json | null
          resolved_at: string | null
          resolved_by: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          action_taken?: string | null
          created_at?: string | null
          flag_count?: number | null
          fragment_id: string
          id?: string
          priority?: string | null
          resolution_notes?: Json | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          action_taken?: string | null
          created_at?: string | null
          flag_count?: number | null
          fragment_id?: string
          id?: string
          priority?: string | null
          resolution_notes?: Json | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fragment_flag_resolutions_fragment_id_fkey"
            columns: ["fragment_id"]
            isOneToOne: true
            referencedRelation: "fragments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fragment_flag_resolutions_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      fragment_flags: {
        Row: {
          created_at: string | null
          details: string | null
          fragment_id: string
          id: string
          reason: string
          reporter_id: string
        }
        Insert: {
          created_at?: string | null
          details?: string | null
          fragment_id: string
          id?: string
          reason: string
          reporter_id: string
        }
        Update: {
          created_at?: string | null
          details?: string | null
          fragment_id?: string
          id?: string
          reason?: string
          reporter_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fragment_flags_fragment_id_fkey"
            columns: ["fragment_id"]
            isOneToOne: false
            referencedRelation: "fragments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fragment_flags_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      fragment_reaction_types: {
        Row: {
          display_order: number | null
          emoji: string | null
          id: string
          is_active: boolean | null
          type: string
        }
        Insert: {
          display_order?: number | null
          emoji?: string | null
          id?: string
          is_active?: boolean | null
          type: string
        }
        Update: {
          display_order?: number | null
          emoji?: string | null
          id?: string
          is_active?: boolean | null
          type?: string
        }
        Relationships: []
      }
      fragment_reactions: {
        Row: {
          created_at: string | null
          fragment_id: string
          id: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          fragment_id: string
          id?: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          fragment_id?: string
          id?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fragment_reactions_fragment_id_fkey"
            columns: ["fragment_id"]
            isOneToOne: false
            referencedRelation: "fragments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fragment_reactions_type_fkey"
            columns: ["type"]
            isOneToOne: false
            referencedRelation: "fragment_reaction_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fragment_reactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      fragments: {
        Row: {
          comments_open: boolean | null
          community_id: string | null
          content: string
          created_at: string | null
          deleted_at: string | null
          id: string
          is_draft: boolean | null
          is_nsfw: boolean | null
          published_at: string | null
          reactions_open: boolean | null
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          comments_open?: boolean | null
          community_id?: string | null
          content: string
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          is_draft?: boolean | null
          is_nsfw?: boolean | null
          published_at?: string | null
          reactions_open?: boolean | null
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          comments_open?: boolean | null
          community_id?: string | null
          content?: string
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          is_draft?: boolean | null
          is_nsfw?: boolean | null
          published_at?: string | null
          reactions_open?: boolean | null
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fragments_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fragments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      fragments_tags: {
        Row: {
          fragment_id: string
          tag_id: string
        }
        Insert: {
          fragment_id: string
          tag_id: string
        }
        Update: {
          fragment_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fragments_tags_fragment_id_fkey"
            columns: ["fragment_id"]
            isOneToOne: false
            referencedRelation: "fragments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fragments_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tag_count_discrepancies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fragments_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      message_reactions: {
        Row: {
          created_at: string | null
          emojis: Json | null
          message_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          emojis?: Json | null
          message_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          emojis?: Json | null
          message_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_reactions_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_reactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string | null
          conversation_id: string
          created_at: string | null
          id: string
          is_deleted: boolean | null
          message_type: string | null
          sender_id: string | null
          updated_at: string | null
        }
        Insert: {
          content?: string | null
          conversation_id: string
          created_at?: string | null
          id?: string
          is_deleted?: boolean | null
          message_type?: string | null
          sender_id?: string | null
          updated_at?: string | null
        }
        Update: {
          content?: string | null
          conversation_id?: string
          created_at?: string | null
          id?: string
          is_deleted?: boolean | null
          message_type?: string | null
          sender_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      moderation_history: {
        Row: {
          action_details: Json
          action_type: string
          appeal_id: string | null
          created_at: string | null
          flag_id: string | null
          fragment_id: string | null
          id: string
          moderator_id: string
          report_id: string | null
          resolution_id: string | null
          user_id: string | null
        }
        Insert: {
          action_details: Json
          action_type: string
          appeal_id?: string | null
          created_at?: string | null
          flag_id?: string | null
          fragment_id?: string | null
          id?: string
          moderator_id: string
          report_id?: string | null
          resolution_id?: string | null
          user_id?: string | null
        }
        Update: {
          action_details?: Json
          action_type?: string
          appeal_id?: string | null
          created_at?: string | null
          flag_id?: string | null
          fragment_id?: string | null
          id?: string
          moderator_id?: string
          report_id?: string | null
          resolution_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "moderation_history_flag_id_fkey"
            columns: ["flag_id"]
            isOneToOne: false
            referencedRelation: "fragment_flags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moderation_history_fragment_id_fkey"
            columns: ["fragment_id"]
            isOneToOne: false
            referencedRelation: "fragments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moderation_history_moderator_id_fkey"
            columns: ["moderator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moderation_history_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "user_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moderation_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      muted_conversations: {
        Row: {
          conversation_id: string
          created_at: string | null
          muted_until: string | null
          user_id: string
        }
        Insert: {
          conversation_id: string
          created_at?: string | null
          muted_until?: string | null
          user_id: string
        }
        Update: {
          conversation_id?: string
          created_at?: string | null
          muted_until?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "muted_conversations_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "muted_conversations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      muted_users: {
        Row: {
          created_at: string | null
          muted_id: string
          muted_until: string | null
          muter_id: string
        }
        Insert: {
          created_at?: string | null
          muted_id: string
          muted_until?: string | null
          muter_id: string
        }
        Update: {
          created_at?: string | null
          muted_id?: string
          muted_until?: string | null
          muter_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "muted_users_muted_id_fkey"
            columns: ["muted_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "muted_users_muter_id_fkey"
            columns: ["muter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          actor_id: string | null
          comment_id: string | null
          conversation_id: string | null
          created_at: string | null
          expires_at: string | null
          fragment_id: string | null
          id: string
          read: boolean | null
          type: string
          user_id: string
        }
        Insert: {
          actor_id?: string | null
          comment_id?: string | null
          conversation_id?: string | null
          created_at?: string | null
          expires_at?: string | null
          fragment_id?: string | null
          id?: string
          read?: boolean | null
          type: string
          user_id: string
        }
        Update: {
          actor_id?: string | null
          comment_id?: string | null
          conversation_id?: string | null
          created_at?: string | null
          expires_at?: string | null
          fragment_id?: string | null
          id?: string
          read?: boolean | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "fragment_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_fragment_id_fkey"
            columns: ["fragment_id"]
            isOneToOne: false
            referencedRelation: "fragments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_photos: {
        Row: {
          created_at: string | null
          display_order: number | null
          id: string
          photo_url: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          photo_url: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          photo_url?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_photos_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          account_status: string | null
          avatar_url: string | null
          bio: string | null
          cover_position: Json | null
          cover_url: string | null
          created_at: string | null
          date_of_birth: string | null
          id: string
          is_moderator: boolean | null
          is_private: boolean | null
          paddle_customer_id: string | null
          settings: Json | null
          updated_at: string | null
          username: string
        }
        Insert: {
          account_status?: string | null
          avatar_url?: string | null
          bio?: string | null
          cover_position?: Json | null
          cover_url?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          id: string
          is_moderator?: boolean | null
          is_private?: boolean | null
          paddle_customer_id?: string | null
          settings?: Json | null
          updated_at?: string | null
          username: string
        }
        Update: {
          account_status?: string | null
          avatar_url?: string | null
          bio?: string | null
          cover_position?: Json | null
          cover_url?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          id?: string
          is_moderator?: boolean | null
          is_private?: boolean | null
          paddle_customer_id?: string | null
          settings?: Json | null
          updated_at?: string | null
          username?: string
        }
        Relationships: []
      }
      report_appeals: {
        Row: {
          appealed_by: string
          created_at: string | null
          id: string
          reason: string
          resolution_id: string
          review_notes: Json | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
        }
        Insert: {
          appealed_by: string
          created_at?: string | null
          id?: string
          reason: string
          resolution_id: string
          review_notes?: Json | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
        }
        Update: {
          appealed_by?: string
          created_at?: string | null
          id?: string
          reason?: string
          resolution_id?: string
          review_notes?: Json | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "report_appeals_appealed_by_fkey"
            columns: ["appealed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_appeals_resolution_id_fkey"
            columns: ["resolution_id"]
            isOneToOne: false
            referencedRelation: "user_report_resolutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_appeals_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_fragments: {
        Row: {
          created_at: string | null
          fragment_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          fragment_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          fragment_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_fragments_fragment_id_fkey"
            columns: ["fragment_id"]
            isOneToOne: false
            referencedRelation: "fragments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_fragments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_packages: {
        Row: {
          created_at: string | null
          description: string | null
          display_name: string
          display_order: number | null
          features: Json | null
          id: string
          is_active: boolean | null
          max_photos: number | null
          name: string
          paddle_price_id: string | null
          price_aud_cents: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_name: string
          display_order?: number | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          max_photos?: number | null
          name: string
          paddle_price_id?: string | null
          price_aud_cents?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_name?: string
          display_order?: number | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          max_photos?: number | null
          name?: string
          paddle_price_id?: string | null
          price_aud_cents?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at: string | null
          cancelled_at: string | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          package_id: string
          paddle_checkout_id: string | null
          paddle_subscription_id: string | null
          profile_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          cancel_at?: string | null
          cancelled_at?: string | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          package_id: string
          paddle_checkout_id?: string | null
          paddle_subscription_id?: string | null
          profile_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          cancel_at?: string | null
          cancelled_at?: string | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          package_id?: string
          paddle_checkout_id?: string | null
          paddle_subscription_id?: string | null
          profile_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "subscription_packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          created_at: string | null
          id: string
          tag: string
          usage_count: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          tag: string
          usage_count?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          tag?: string
          usage_count?: number | null
        }
        Relationships: []
      }
      user_report_resolutions: {
        Row: {
          action_taken: string | null
          created_at: string | null
          id: string
          priority: string | null
          report_count: number | null
          reported_user_id: string
          resolution_notes: Json | null
          resolved_at: string | null
          resolved_by: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          action_taken?: string | null
          created_at?: string | null
          id?: string
          priority?: string | null
          report_count?: number | null
          reported_user_id: string
          resolution_notes?: Json | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          action_taken?: string | null
          created_at?: string | null
          id?: string
          priority?: string | null
          report_count?: number | null
          reported_user_id?: string
          resolution_notes?: Json | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_report_resolutions_reported_user_id_fkey"
            columns: ["reported_user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_report_resolutions_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_reports: {
        Row: {
          created_at: string | null
          details: string | null
          id: string
          reason: string
          reported_user_id: string
          reporter_id: string
        }
        Insert: {
          created_at?: string | null
          details?: string | null
          id?: string
          reason: string
          reported_user_id: string
          reporter_id: string
        }
        Update: {
          created_at?: string | null
          details?: string | null
          id?: string
          reason?: string
          reported_user_id?: string
          reporter_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_reports_reported_user_id_fkey"
            columns: ["reported_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      tag_count_discrepancies: {
        Row: {
          actual_count: number | null
          difference: number | null
          id: string | null
          stored_count: number | null
          tag: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
