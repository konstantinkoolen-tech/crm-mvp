export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type DealStage =
  | "lead"
  | "qualified"
  | "proposal"
  | "negotiation"
  | "won"
  | "lost";

export type ProfileStatus = "active" | "inactive";

export type CompanyStatus = "active" | "inactive" | "archived";

export type ContactStatus = "active" | "inactive" | "archived";

export type DealStatus = "open" | "won" | "lost" | "archived";

export type ActivityType =
  | "note"
  | "linkedin_message"
  | "call"
  | "email"
  | "meeting"
  | "task_update";

export type ActivityStatus = "planned" | "completed" | "canceled";

export type TaskStatus = "open" | "in_progress" | "done" | "canceled";
