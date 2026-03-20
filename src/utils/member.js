export const normalizeEntityId = (value) =>
  value === null || value === undefined ? "" : String(value);

export const getMemberUserId = (member = {}) =>
  normalizeEntityId(member?.userId ?? member?.id);

export const hasManagerMemberRole = (member = {}) =>
  ["admin", "manager"].includes(String(member?.role || "").toLowerCase());
