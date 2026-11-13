import { getStoredEvents, upsertStoredEvent } from "./demoData";
import {
  buildEventPayload,
  getLocalDateString,
  validateEventInput,
} from "./eventUtils";
import { demoMode, supabase } from "./supabaseClient";

const EVENT_COLUMNS =
  "id, title, type, event_date, company_name, description, status, created_at, updated_at";

function throwEventDatabaseError(error) {
  if (
    error?.code === "42P01" ||
    error?.code === "PGRST205" ||
    /relation .*upcoming_events.* does not exist/i.test(error?.message || "")
  ) {
    throw new Error(
      "The Supabase upcoming_events table is missing. Apply the migration in supabase/migrations before managing events."
    );
  }

  if (
    error?.code === "42703" ||
    error?.code === "PGRST204" ||
    /company_name.*(does not exist|not find|schema cache)/i.test(
      error?.message || ""
    )
  ) {
    throw new Error(
      "The upcoming_events table is missing the company_name column. Apply the latest migration in supabase/migrations."
    );
  }

  throw error;
}

export async function listAdminEvents() {
  if (demoMode) {
    return getStoredEvents().sort((left, right) =>
      left.event_date.localeCompare(right.event_date)
    );
  }

  const { data, error } = await supabase
    .from("upcoming_events")
    .select(EVENT_COLUMNS)
    .order("event_date", { ascending: true });

  if (error) {
    throwEventDatabaseError(error);
  }

  return data || [];
}

export async function listPublishedEvents() {
  if (demoMode) {
    const today = getLocalDateString();
    return getStoredEvents()
      .filter(
        (event) => event.status === "published" && event.event_date >= today
      )
      .sort((left, right) => left.event_date.localeCompare(right.event_date));
  }

  const today = getLocalDateString();
  const { data, error } = await supabase
    .from("upcoming_events")
    .select(EVENT_COLUMNS)
    .eq("status", "published")
    .gte("event_date", today)
    .order("event_date", { ascending: true });

  if (error) {
    throwEventDatabaseError(error);
  }

  return data || [];
}

export async function saveEvent(event, existingEvent) {
  const validation = validateEventInput(event);
  if (!validation.valid) {
    throw new Error(validation.message);
  }

  const payload = buildEventPayload(event);

  if (demoMode) {
    return upsertStoredEvent({
      ...payload,
      id: existingEvent?.id ?? `demo-event-${Date.now()}`,
      created_at: existingEvent?.created_at ?? new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  const query = existingEvent
    ? supabase
        .from("upcoming_events")
        .update(payload)
        .eq("id", existingEvent.id)
    : supabase.from("upcoming_events").insert(payload);
  const { data, error } = await query.select(EVENT_COLUMNS).single();

  if (error) {
    throwEventDatabaseError(error);
  }

  return data;
}
