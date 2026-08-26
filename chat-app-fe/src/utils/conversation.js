export function getOtherParticipant(conversation, currentUserId) {
  if (!conversation?.participants) return null;
  return (
    conversation.participants.find((p) => (p._id || p) !== currentUserId) ||
    conversation.participants[0]
  );
}
