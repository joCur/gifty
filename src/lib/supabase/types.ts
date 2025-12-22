export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type WishlistPrivacy = "public" | "friends" | "private";
export type FriendshipStatus = "pending" | "accepted" | "declined";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          avatar_url: string | null;
          birthday: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          avatar_url?: string | null;
          birthday?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          birthday?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      wishlists: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          privacy: WishlistPrivacy;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          privacy?: WishlistPrivacy;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          privacy?: WishlistPrivacy;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "wishlists_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      wishlist_items: {
        Row: {
          id: string;
          wishlist_id: string;
          url: string;
          title: string;
          description: string | null;
          image_url: string | null;
          price: string | null;
          currency: string | null;
          is_purchased: boolean;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          wishlist_id: string;
          url: string;
          title: string;
          description?: string | null;
          image_url?: string | null;
          price?: string | null;
          currency?: string | null;
          is_purchased?: boolean;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          wishlist_id?: string;
          url?: string;
          title?: string;
          description?: string | null;
          image_url?: string | null;
          price?: string | null;
          currency?: string | null;
          is_purchased?: boolean;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "wishlist_items_wishlist_id_fkey";
            columns: ["wishlist_id"];
            isOneToOne: false;
            referencedRelation: "wishlists";
            referencedColumns: ["id"];
          }
        ];
      };
      friendships: {
        Row: {
          id: string;
          requester_id: string;
          addressee_id: string;
          status: FriendshipStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          requester_id: string;
          addressee_id: string;
          status?: FriendshipStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          requester_id?: string;
          addressee_id?: string;
          status?: FriendshipStatus;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "friendships_requester_id_fkey";
            columns: ["requester_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "friendships_addressee_id_fkey";
            columns: ["addressee_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      item_claims: {
        Row: {
          id: string;
          item_id: string;
          claimed_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          item_id: string;
          claimed_by: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          item_id?: string;
          claimed_by?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "item_claims_item_id_fkey";
            columns: ["item_id"];
            isOneToOne: false;
            referencedRelation: "wishlist_items";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "item_claims_claimed_by_fkey";
            columns: ["claimed_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      wishlist_privacy: WishlistPrivacy;
      friendship_status: FriendshipStatus;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

// Helper types for easier usage
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Wishlist = Database["public"]["Tables"]["wishlists"]["Row"];
export type WishlistItem = Database["public"]["Tables"]["wishlist_items"]["Row"];
export type Friendship = Database["public"]["Tables"]["friendships"]["Row"];
export type ItemClaim = Database["public"]["Tables"]["item_claims"]["Row"];

// Extended types with relations
export type WishlistWithItems = Wishlist & {
  items: WishlistItem[];
};

export type WishlistWithOwner = Wishlist & {
  owner: Profile;
};

export type FriendshipWithProfiles = Friendship & {
  requester: Profile;
  addressee: Profile;
};

export type WishlistItemWithClaim = WishlistItem & {
  claim?: ItemClaim | null;
};
