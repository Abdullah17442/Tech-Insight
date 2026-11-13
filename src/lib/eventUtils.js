export function validateEventInput(event) {
  if (!event?.title?.trim()) {
    return { valid: false, message: "Event title is required." };
  }

  const parsedEventDate = new Date(`${event?.event_date}T12:00:00`);
  if (
    !event?.event_date ||
    Number.isNaN(parsedEventDate.getTime()) ||
    parsedEventDate.toISOString().slice(0, 10) !== event.event_date
  ) {
    return { valid: false, message: "Choose a valid event date." };
  }

  if (event.status === "published" && event.event_date < getLocalDateString()) {
    return {
      valid: false,
      message: "Published events must have a date today or later.",
    };
  }

  if (!event?.type?.trim() || !event?.company_name?.trim()) {
    return {
      valid: false,
      message: "Event type and company name are required.",
    };
  }

  if (!event?.description?.trim()) {
    return { valid: false, message: "Event description is required." };
  }

  if (!["draft", "published"].includes(event.status)) {
    return { valid: false, message: "Choose a valid event status." };
  }

  return { valid: true, message: "" };
}

export function buildEventPayload(event) {
  return {
    title: event.title.trim(),
    type: event.type.trim(),
    event_date: event.event_date,
    company_name: event.company_name.trim(),
    description: event.description.trim(),
    status: event.status,
  };
}

export function formatEventDate(eventDate) {
  const date = new Date(`${eventDate}T12:00:00`);
  return {
    month: new Intl.DateTimeFormat("en", { month: "short" })
      .format(date)
      .toUpperCase(),
    day: new Intl.DateTimeFormat("en", { day: "2-digit" }).format(date),
    full: new Intl.DateTimeFormat("en", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date),
  };
}

export function getLocalDateString(date = new Date()) {
  const localDate = new Date(
    date.getTime() - date.getTimezoneOffset() * 60_000
  );
  return localDate.toISOString().slice(0, 10);
}
