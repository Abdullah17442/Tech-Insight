import test from "node:test";
import assert from "node:assert/strict";
import {
  buildEventPayload,
  formatEventDate,
  validateEventInput,
} from "../src/lib/eventUtils.js";

const validEvent = {
  title: "AI Infrastructure Summit",
  type: "Technology Event",
  event_date: "2027-05-04",
  company_name: "NVIDIA",
  description: "A summit about infrastructure.",
  status: "published",
};

test("requires complete event details and a valid publication status", () => {
  assert.deepEqual(validateEventInput({ ...validEvent, title: " " }), {
    valid: false,
    message: "Event title is required.",
  });
  assert.equal(
    validateEventInput({ ...validEvent, event_date: "not-a-date" }).valid,
    false
  );
  assert.equal(
    validateEventInput({ ...validEvent, event_date: "2027-02-31" }).valid,
    false
  );
  assert.equal(
    validateEventInput({ ...validEvent, status: "private" }).valid,
    false
  );
  assert.equal(
    validateEventInput({ ...validEvent, company_name: " " }).valid,
    false
  );
  assert.deepEqual(validateEventInput(validEvent), {
    valid: true,
    message: "",
  });
});

test("trims fields before saving an event", () => {
  assert.deepEqual(
    buildEventPayload({
      ...validEvent,
      title: " AI Infrastructure Summit ",
      company_name: " NVIDIA ",
    }),
    validEvent
  );
});

test("formats a date-only event value without changing its calendar day", () => {
  assert.deepEqual(formatEventDate("2027-05-04"), {
    month: "MAY",
    day: "04",
    full: "May 4, 2027",
  });
});
