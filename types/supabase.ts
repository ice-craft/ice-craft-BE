export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      account_table: {
        Row: {
          email: string;
          mafia_score: number;
          music_score: number;
          nickname: string | null;
          total_score: number;
          user_id: string;
        };
        Insert: {
          email: string;
          mafia_score?: number;
          music_score?: number;
          nickname?: string | null;
          total_score?: number;
          user_id?: string;
        };
        Update: {
          email?: string;
          mafia_score?: number;
          music_score?: number;
          nickname?: string | null;
          total_score?: number;
          user_id?: string;
        };
        Relationships: [];
      };
      room_table: {
        Row: {
          chief: string | null;
          created_at: string | null;
          current_user_count: number;
          game_category: string | null;
          is_playing: boolean;
          room_id: string;
          title: string | null;
          total_user_count: number;
        };
        Insert: {
          chief?: string | null;
          created_at?: string | null;
          current_user_count?: number;
          game_category?: string | null;
          is_playing?: boolean;
          room_id?: string;
          title?: string | null;
          total_user_count?: number;
        };
        Update: {
          chief?: string | null;
          created_at?: string | null;
          current_user_count?: number;
          game_category?: string | null;
          is_playing?: boolean;
          room_id?: string;
          title?: string | null;
          total_user_count?: number;
        };
        Relationships: [];
      };
      room_user_match_table: {
        Row: {
          is_lived: boolean;
          is_ready: boolean;
          is_selected: boolean;
          join_time: string | null;
          match_id: string;
          role: string | null;
          room_id: string | null;
          user_id: string | null;
          user_nickname: string | null;
          vote_time: string | null;
          vote_yes_or_no: boolean | null;
          voted_count: number;
        };
        Insert: {
          is_lived?: boolean;
          is_ready?: boolean;
          is_selected?: boolean;
          join_time?: string | null;
          match_id?: string;
          role?: string | null;
          room_id?: string | null;
          user_id?: string | null;
          user_nickname?: string | null;
          vote_time?: string | null;
          vote_yes_or_no?: boolean | null;
          voted_count?: number;
        };
        Update: {
          is_lived?: boolean;
          is_ready?: boolean;
          is_selected?: boolean;
          join_time?: string | null;
          match_id?: string;
          role?: string | null;
          room_id?: string | null;
          user_id?: string | null;
          user_nickname?: string | null;
          vote_time?: string | null;
          vote_yes_or_no?: boolean | null;
          voted_count?: number;
        };
        Relationships: [
          {
            foreignKeyName: "public_room_user_match_table_room_id_fkey";
            columns: ["room_id"];
            isOneToOne: false;
            referencedRelation: "room_table";
            referencedColumns: ["room_id"];
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
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type PublicSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
      PublicSchema["Views"])
  ? (PublicSchema["Tables"] &
      PublicSchema["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
  ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
  ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
  ? PublicSchema["Enums"][PublicEnumNameOrOptions]
  : never;
