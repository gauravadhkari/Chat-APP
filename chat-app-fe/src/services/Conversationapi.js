/**
 * Conversation API client for Wire — matches conversation.controller.js exactly:
 *
 *   POST  <base>            body: { userId }        -> createConversation
 *   GET   <base>                                     -> getMyConversation
 *
 * TODO: set API_BASE to wherever conversation.routes.js is mounted in your
 * Express app, e.g. if you have `app.use("/api/conversations", conversationRoutes)`
 * then API_BASE = "/api/conversations" is correct. Adjust if it differs.
 */
const API_BASE = "/api/conversations";

function authHeaders() {
  const token = localStorage.getItem("wire_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/**
 * GET my conversations.
 * NOTE: your controller returns { success, conversation } where `conversation`
 * (singular name) actually holds the full ARRAY — handled here so callers
 * just get back a clean array.
 */
export async function getMyConversations() {
  const res = await fetch(API_BASE, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to load conversations");
  return data.conversation || [];
}

/**
 * POST create (or reuse) a conversation with `userId`.
 * NOTE: your controller responds with status 401 for the "already exists"
 * case too, and attaches the existing conversation to the response — so
 * that specific case is treated as a success here rather than an error.
 */
export async function createConversation(userId) {
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ userId }),
  });
  const data = await res.json();

  if (!res.ok) {
    if (data.message === "Conversation already exists..." && data.conversation) {
      return data.conversation;
    }
    throw new Error(data.message || "Failed to create conversation");
  }
  return data.conversation;
}

/** Pick the "other" person in a 1:1 conversation for display purposes. */
export function getOtherParticipant(conversation, currentUserId) {
  if (!conversation?.participants?.length) return null;
  return (
    conversation.participants.find((p) => p._id?.toString() !== currentUserId?.toString()) ||
    conversation.participants[0]
  );
}

const AVATAR_COLORS = ["#2fd1b5", "#ff6552", "#5b8cff", "#e2b23f", "#a970ff", "#7c86a8"];

/** Deterministic avatar color from a user id, so it stays stable across renders. */
export function colorForId(id = "") {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

/** Two-letter initials from a username, since the User model has no display name. */
export function initialsFor(username = "") {
  return username ? username.slice(0, 2).toUpperCase() : "??";
}