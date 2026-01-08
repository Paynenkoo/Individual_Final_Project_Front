export function safeUser(userDoc) {
  if (!userDoc) return null;
  return {
    id: userDoc._id,
    username: userDoc.username,
    email: userDoc.email,
    avatarUrl: userDoc.avatarUrl || "",
    followersCount: userDoc.followersCount || 0,
    followingCount: userDoc.followingCount || 0,
    createdAt: userDoc.createdAt,
  };
}
