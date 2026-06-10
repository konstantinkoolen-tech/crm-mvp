# Relationales Datenmodell

Supabase Auth bleibt die Identitaetsquelle ueber `auth.users`. Die CRM-Anwendung bekommt dazu eine oeffentliche Tabelle `profiles`, die pro Auth-Nutzer genau einen Datensatz haelt. Alle fachlichen Tabellen besitzen eine `owner_id`, damit Row Level Security einfach und stabil auf den zustaendigen Nutzer eingeschraenkt werden kann.

## Tabellenuebersicht

### `profiles`

Oeffentliche Nutzerprofile fuer CRM-Zuordnung und Anzeige.

| Feld | Typ | Zweck |
| --- | --- | --- |
| `id` | `uuid` | Primaerschluessel, zugleich FK auf `auth.users(id)` |
| `email` | `text` | E-Mail aus Auth/Profil |
| `full_name` | `text` | Anzeigename |
| `avatar_url` | `text` | Optionales Profilbild |
| `role` | `text` | Einfache interne Rolle, noch ohne Berechtigungslogik |
| `status` | `profile_status` | `active`, `inactive` |
| `created_at`, `updated_at` | `timestamptz` | Audit-Felder |

### `companies`

Unternehmen im CRM.

| Feld | Typ | Zweck |
| --- | --- | --- |
| `id` | `uuid` | Primaerschluessel |
| `owner_id` | `uuid` | Zustaendiger Nutzer, FK auf `profiles(id)` |
| `name` | `text` | Unternehmensname |
| `website` | `text` | Website |
| `industry` | `text` | Branche |
| `employee_count` | `integer` | Unternehmensgroesse |
| `status` | `company_status` | `active`, `inactive`, `archived` |
| `notes` | `text` | Freitext |
| `created_at`, `updated_at` | `timestamptz` | Audit-Felder |

### `contacts`

Ansprechpartner. Jeder Kontakt gehoert zu genau einem Unternehmen.

| Feld | Typ | Zweck |
| --- | --- | --- |
| `id` | `uuid` | Primaerschluessel |
| `owner_id` | `uuid` | Zustaendiger Nutzer |
| `company_id` | `uuid` | FK auf `companies(id)` |
| `first_name`, `last_name` | `text` | Name |
| `email`, `phone` | `text` | Kontaktdaten |
| `job_title` | `text` | Rolle beim Unternehmen |
| `linkedin_url` | `text` | LinkedIn-Profil |
| `status` | `contact_status` | `active`, `inactive`, `archived` |
| `notes` | `text` | Freitext |
| `created_at`, `updated_at` | `timestamptz` | Audit-Felder |

### `deals`

Pipeline-Objekte fuer Sales-/Recruiting-Chancen.

| Feld | Typ | Zweck |
| --- | --- | --- |
| `id` | `uuid` | Primaerschluessel |
| `owner_id` | `uuid` | Zustaendiger Nutzer |
| `company_id` | `uuid` | FK auf `companies(id)` |
| `primary_contact_id` | `uuid` | Optionaler Hauptkontakt |
| `title` | `text` | Deal-Titel |
| `stage` | `deal_stage` | Pipeline-Stufe |
| `status` | `deal_status` | `open`, `won`, `lost`, `archived` |
| `value_amount` | `numeric(12,2)` | Deal-Wert |
| `value_currency` | `char(3)` | Waehrung, Standard `EUR` |
| `probability` | `integer` | Abschlusswahrscheinlichkeit 0-100 |
| `expected_close_date` | `date` | Erwartetes Abschlussdatum |
| `closed_at` | `timestamptz` | Abschlusszeitpunkt |
| `description` | `text` | Beschreibung |
| `created_at`, `updated_at` | `timestamptz` | Audit-Felder |

Pipeline-Stufen: `lead`, `qualified`, `proposal`, `negotiation`, `won`, `lost`.

### `activities`

Aktivitaeten und Notizen zu Unternehmen, Kontakten oder Deals.

| Feld | Typ | Zweck |
| --- | --- | --- |
| `id` | `uuid` | Primaerschluessel |
| `owner_id` | `uuid` | Zustaendiger Nutzer |
| `company_id` | `uuid` | Optionaler Unternehmenskontext |
| `contact_id` | `uuid` | Optionaler Kontaktkontext |
| `deal_id` | `uuid` | Optionaler Deal-Kontext |
| `type` | `activity_type` | `note`, `call`, `email`, `meeting`, `task_update` |
| `status` | `activity_status` | `planned`, `completed`, `canceled` |
| `title` | `text` | Kurztitel |
| `body` | `text` | Inhalt |
| `occurred_at` | `timestamptz` | Zeitpunkt der Aktivitaet |
| `created_at`, `updated_at` | `timestamptz` | Audit-Felder |

Mindestens einer der Kontext-FKs (`company_id`, `contact_id`, `deal_id`) muss gesetzt sein.

### `tasks`

Follow-up-Aufgaben.

| Feld | Typ | Zweck |
| --- | --- | --- |
| `id` | `uuid` | Primaerschluessel |
| `owner_id` | `uuid` | Zustaendiger Nutzer |
| `company_id` | `uuid` | Optionaler Unternehmenskontext |
| `contact_id` | `uuid` | Optionaler Kontaktkontext |
| `deal_id` | `uuid` | Optionaler Deal-Kontext |
| `title` | `text` | Aufgabe |
| `description` | `text` | Details |
| `status` | `task_status` | `open`, `in_progress`, `done`, `canceled` |
| `due_date` | `date` | Faelligkeit |
| `completed_at` | `timestamptz` | Erledigungszeitpunkt |
| `created_at`, `updated_at` | `timestamptz` | Audit-Felder |

## Beziehungen

- `profiles.id` referenziert `auth.users.id`.
- `companies.owner_id`, `contacts.owner_id`, `deals.owner_id`, `activities.owner_id` und `tasks.owner_id` referenzieren `profiles.id`.
- `contacts.company_id` referenziert `companies.id`.
- `deals.company_id` referenziert `companies.id`.
- `deals.primary_contact_id` referenziert `contacts.id`.
- `activities` und `tasks` koennen jeweils Unternehmen, Kontakte und Deals referenzieren.

## RLS-Vorbereitung

Alle Tabellen aktivieren Row Level Security. Die Policies sind fuer ein MVP bewusst owner-basiert:

- Nutzer lesen/aendern nur ihr eigenes `profiles`-Objekt.
- Fachliche Tabellen sind ueber `owner_id = auth.uid()` eingeschraenkt.
- Insert-/Update-Policies pruefen zusaetzlich, dass referenzierte Unternehmen, Kontakte und Deals ebenfalls dem angemeldeten Nutzer gehoeren.
