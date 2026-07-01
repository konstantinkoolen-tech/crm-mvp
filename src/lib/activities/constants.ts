import type {
  ActivityDirection,
  ActivityType,
  OutreachKind,
  OutreachOutcome,
  PainStatement,
} from "@/types/database";

export const activityTypeLabels: Record<ActivityType, string> = {
  note: "Notiz",
  linkedin_message: "LinkedIn Message",
  call: "Call",
  email: "E-Mail",
  meeting: "Meeting",
  task_update: "Task-Update",
};

export const activityDirectionLabels: Record<ActivityDirection, string> = {
  outbound: "Ausgehend",
  inbound: "Eingehend",
};

export const outreachKindLabels: Record<OutreachKind, string> = {
  snowflake: "Snowflake",
  fire: "Fire",
  fire_plus: "Fire+",
};

export const outreachOutcomeLabels: Record<OutreachOutcome, string> = {
  no_response: "No response",
  wrong_number: "Falsche Nummer",
  gatekeeper: "Gatekeeper",
  no_time: "Keine Zeit",
  not_interested: "Kein Interesse",
  interested: "Interesse",
  follow_up_booked: "Follow-up gebucht",
};

export const painStatementLabels: Record<PainStatement, string> = {
  no_statement: "Keine Aussage",
  pain_not_identified: "Pain nicht erkannt",
  pain_identified: "Pain erkannt",
};
