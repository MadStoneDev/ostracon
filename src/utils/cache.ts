import { redis } from "@/utils/upstash";

const CACHE_TTL = {
  FEED: 5 * 60, // 5 Minutes
  POST: 60 * 60, // 1 Hour
  PROFILE: 30 * 60, // 30 Minutes
  LIKES: 5 * 60, // 5 Minutes
  FOLLOWERS: 5 * 60, // 5 Minutes
};

export const CacheKeys = {
  post: (id: string) => `post:${id}`,
  feed: (userId: string) => `feed:${userId}`,
  profile: (userId: string) => `profile:${userId}`,
  likes: (postId: string) => `likes:${postId}`,
  followers: (userId: string) => `followers:${userId}`,
  userLikes: (userId: string) => `userLikes:${userId}`,
  userFollowers: (userId: string) => `userFollowers:${userId}`,
};

export const CacheManager = {
  async cachePost(post) {
    await redis.set(CacheKeys.post(post.id), JSON.stringify(post), {
      ex: CACHE_TTL.POST,
    });
  },

  async getPost(postId: string): Promise<any> {
    const cached = await redis.get(CacheKeys.post(postId));
    return cached ? JSON.parse(cached) : null;
  },

  async cacheFeed(feed) {
    await redis.set(CacheKeys.feed(feed.user_id), JSON.stringify(feed), {
      ex: CACHE_TTL.FEED,
    });
  },

  async getFeed(userId: string): Promise<any> {
    const cached = await redis.get(CacheKeys.feed(userId));
    return cached ? JSON.parse(cached) : null;
  },

  async cacheProfile(profile) {
    await redis.set(CacheKeys.profile(profile.id), JSON.stringify(profile), {
      ex: CACHE_TTL.PROFILE,
    });
  },

  async getProfile(userId: string): Promise<any> {
    const cached = await redis.get(CacheKeys.profile(userId));
    return cached ? JSON.parse(cached) : null;
  },

  async cacheLikes(likes) {
    await redis.set(CacheKeys.likes(likes.post_id), JSON.stringify(likes), {
      ex: CACHE_TTL.LIKES,
    });
  },

  async removeLike(userId: string, postId: string) {
    await redis.srem(CacheKeys.userLikes(userId), postId);
    await redis.decr(CacheKeys.likes(postId));
  },

  async getLikes(postId: string): Promise<any> {
    const cached = await redis.get(CacheKeys.likes(postId));
    return cached ? JSON.parse(cached) : null;
  },

  async cacheFollow(follow) {
    await redis.sadd(
      CacheKeys.userFollowers(follow.followerId),
      follow.followingId,
    );
    await redis.set(
      CacheKeys.followers(followers.user_id),
      JSON.stringify(followers),
      { ex: CACHE_TTL.FOLLOWERS },
    );
  },

  async removeFollower(followingId: string, followerId: string) {
    await redis.srem(CacheKeys.userFollowers(followerId), followingId);
    await redis.decr(CacheKeys.followers(followingId));
    await this.invalidateProfile(followingId);
    await this.invalidateFeed(followerId);
  },

  async invalidatePost(postId: string) {
    await redis.del(CacheKeys.post(postId));
  },

  async invalidateFeed(userId: string) {
    await redis.del(CacheKeys.feed(userId));
  },

  async invalidateProfile(userId: string) {
    await redis.del(CacheKeys.profile(userId));
  },
};
