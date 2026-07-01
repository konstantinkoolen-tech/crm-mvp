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

export type CompanyStatus =
  | "new"
  | "contacted"
  | "in_exchange"
  | "active_customer"
  | "lost_customer"
  | "churn";

export type CompanyEmployeeCount = "1-5" | "6-10" | "11-20" | "21-50" | "50+";

export type ContactStatus = "active" | "inactive" | "archived";

export type DealStatus = "open" | "won" | "lost" | "churn";

export type DealValuePeriod = "mrr" | "arr";

export type ActivityType =
  | "note"
  | "linkedin_message"
  | "call"
  | "email"
  | "meeting"
  | "task_update";

export type ActivityStatus = "planned" | "completed" | "canceled";

export type ActivityDirection = "outbound" | "inbound";

export type TaskStatus = "open" | "in_progress" | "done" | "canceled";

export type OutreachKind = "snowflake" | "fire" | "fire_plus";

export type OutreachOutcome =
  | "no_response"
  | "wrong_number"
  | "gatekeeper"
  | "no_time"
  | "not_interested"
  | "interested"
  | "follow_up_booked";

export type PainStatement =
  | "no_statement"
  | "pain_not_identified"
  | "pain_identified";
