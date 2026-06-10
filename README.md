# tagtig Internal CRM

Internes CRM-MVP für ein Recruiting-/SaaS-Unternehmen.

## Umfang

- Login mit Supabase Auth
- Geschuetzte App-Struktur mit Sidebar-Navigation
- Unternehmen verwalten
- Ansprechpartner Unternehmen zuordnen
- Deals mit Pipeline-Stufen verwalten
- Aktivitäten und Notizen speichern
- Follow-up-Tasks mit Fälligkeitsdatum erstellen
- Dashboard mit offenen Tasks und Pipeline-Übersicht

## Projektstruktur

```txt
src/
  app/
    (auth)/login/          Auth-Seiten
    (crm)/layout.tsx       Geschuetztes App-Layout
    (crm)/dashboard/       CRM-Dashboard
    (crm)/companies/       Unternehmen und Ansprechpartner
    (crm)/contacts/        Ansprechpartner
    (crm)/deals/           Deal-Pipeline
    (crm)/activities/      Aktivitaeten und Notizen
    (crm)/tasks/           Tasks
  components/
    crm/                   Fachliche CRM-Komponenten
    ui/                    shadcn/ui-Komponenten
  lib/
    db/                    Datenzugriff und Queries
    supabase/              Supabase Clients
    utils.ts               Shared Utilities
  types/                   TypeScript-Typen
supabase/
  migrations/              SQL-Migrationen
docs/
  data-model.md            Datenmodell
  implementation-plan.md   Technische Umsetzungsliste
```

## Nächste Schritte

1. Dependencies installieren.
2. `.env.example` nach `.env.local` übernehmen und Supabase-Werte setzen.
3. Migration `supabase/migrations/20260610124500_initial_crm_schema.sql` ausfuehren.
4. shadcn/ui-Komponenten bedarfsgerecht hinzufügen.
