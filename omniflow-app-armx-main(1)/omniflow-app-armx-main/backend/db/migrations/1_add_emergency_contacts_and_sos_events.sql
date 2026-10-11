CREATE TABLE IF NOT EXISTS "emergency_contacts" (
    "id" TEXT PRIMARY KEY NOT NULL DEFAULT gen_random_uuid (),
    "user_id" TEXT NOT NULL REFERENCES "Users" ("id") ON DELETE CASCADE,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "relationship" TEXT NOT NULL DEFAULT '家人',
    "created_at" TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS "emergency_contacts_user_id_idx" ON "emergency_contacts" ("user_id");

CREATE TABLE IF NOT EXISTS "sos_events" (
    "id" TEXT PRIMARY KEY NOT NULL DEFAULT gen_random_uuid (),
    "user_id" TEXT NOT NULL REFERENCES "Users" ("id") ON DELETE CASCADE,
    "message" TEXT NOT NULL,
    "latitude" TEXT,
    "longitude" TEXT,
    "contact_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS "sos_events_user_id_idx" ON "sos_events" ("user_id");
