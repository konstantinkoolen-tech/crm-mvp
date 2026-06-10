# Technische Umsetzungsliste

## 1. Projektbasis

- Next.js App Router mit TypeScript und Tailwind CSS nutzen.
- shadcn/ui als lokale Komponentenbasis initialisieren und nur benötigte Komponenten hinzufügen.
- Supabase Browser- und Server-Clients unter `src/lib/supabase` kapseln.
- Umgebungsvariablen aus `.env.example` in `.env.local` pflegen.

## 2. Auth

- Login-Seite unter `src/app/(auth)/login`.
- Supabase Auth mit E-Mail/Magic-Link oder E-Mail/Passwort starten.
- Geschützte CRM-Routen über Middleware oder Server-Layout prüfen.
- Nach Login auf `/dashboard` weiterleiten.

## 3. CRM-Module

- Unternehmen: Liste, Detailansicht, Erstellen, Bearbeiten, Löschen.
- Ansprechpartner: innerhalb der Unternehmensdetailseite verwalten.
- Deals: Pipeline-Liste nach `stage`, Erstellen/Bearbeiten, Stage-Wechsel.
- Aktivitäten: einfache Timeline für Unternehmen und Deals.
- Follow-up-Tasks: Liste offener Aufgaben, Fälligkeitsdatum, Erledigen.

## 4. Dashboard

- Offene und überfällige Tasks anzeigen.
- Pipeline-Übersicht nach Deal-Stufe und Wert aggregieren.
- Kurze Einstiegspunkte zu Unternehmen, Deals und Tasks.

## 5. Datenzugriff

- Server Components für lesende Seiten bevorzugen.
- Server Actions für Mutationen verwenden.
- Validierung pro Formular ergänzen, bevor Daten an Supabase gehen.
- Datenbank-Typen nach Supabase-Setup generieren und `src/types/database.ts` ersetzen.

## 6. Verifikation

- SQL-Migration gegen ein Supabase-Projekt oder lokale Supabase-Instanz ausführen.
- RLS mit zwei Testnutzern prüfen.
- Typecheck und Linting vor jeder fachlichen Erweiterung laufen lassen.
