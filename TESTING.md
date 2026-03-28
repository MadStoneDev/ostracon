# Ostracon — Comprehensive Testing Guide

Manual testing checklist for every feature and flow. Work through each section top to bottom before public release.

**Prerequisites:**
- App running locally (`npm run dev`)
- Supabase project configured with all migrations (003-008) applied
- `.env` populated with all keys from `.env.example`
- At least 2 test user accounts created
- Supabase Auth email provider configured (or custom SMTP)
- OAuth providers configured in Supabase dashboard (optional, for Phase 6 tests)

---

## 1. Authentication & Onboarding

### 1.1 Email Magic Link
- [ ] Navigate to `/auth`
- [ ] Enter a valid email address
- [ ] Click "Send Magic Code"
- [ ] Verify loading state shows on button
- [ ] Check email inbox — OTP code arrives
- [ ] Enter the OTP code
- [ ] Verify redirect to `/profile/setup` (first login) or `/explore` (returning user)

### 1.2 OAuth Sign-In
- [ ] On `/auth`, verify Google, GitHub, and Apple buttons are visible below "or continue with" divider
- [ ] Click Google — redirects to Google OAuth flow
- [ ] After consent, verify redirect to `/auth/callback` then to `/explore` or `/profile/setup`
- [ ] Repeat for GitHub (if configured)
- [ ] Repeat for Apple (if configured)
- [ ] Verify loading state on OAuth buttons while redirecting

### 1.3 Profile Setup (New Users)
- [ ] On first login, verify redirect to `/profile/setup`
- [ ] Enter a username — verify format validation (alphanumeric, 3-20 chars)
- [ ] Try a reserved username (e.g., "admin") — verify rejection
- [ ] Enter date of birth — verify age gate (must be 16+, 21+ for full access)
- [ ] Optionally enter bio — verify HTML is stripped
- [ ] Submit — verify redirect to `/explore`

### 1.4 Two-Factor Authentication
- [ ] Navigate to `/settings/security`
- [ ] Click "Enable 2FA"
- [ ] QR code displays — scan with authenticator app (Google Authenticator, Authy, etc.)
- [ ] Manual secret key displays with copy button — verify copy works
- [ ] Enter 6-digit code from authenticator
- [ ] Verify "Two-factor authentication enabled!" toast
- [ ] Sign out and sign back in
- [ ] Verify redirect to `/auth/mfa-verify` challenge page
- [ ] Enter valid TOTP code — verify redirect to `/explore`
- [ ] Enter invalid code — verify error message and code field clears
- [ ] "Sign out instead" link works
- [ ] Navigate back to `/settings/security` — verify "Enabled" status badge
- [ ] Click "Disable 2FA" — verify confirmation and status change

### 1.5 PIN Lock
- [ ] Navigate to settings — set a PIN
- [ ] Lock the account
- [ ] Verify redirect to `/locked`
- [ ] Enter wrong PIN 5 times — verify lockout message
- [ ] Wait 15 minutes or reset via Upstash — unlock with correct PIN
- [ ] Verify redirect to `/explore`

---

## 2. Posts (Fragments)

### 2.1 Creating a Post
- [ ] Click "New Post" from bottom nav or Cmd+K
- [ ] Enter title (optional) — verify 300 char limit
- [ ] Enter content in rich text editor — verify Lexical toolbar works
- [ ] Toggle NSFW flag
- [ ] Toggle comments open/closed
- [ ] Toggle reactions open/closed
- [ ] Select a community (or leave blank for personal)
- [ ] Select tags
- [ ] **Select a post theme** — verify theme picker shows (General, Vent, Creative, Discussion)
- [ ] Click theme → verify it highlights with theme colour
- [ ] Click again → verify deselection
- [ ] Publish — verify redirect and post appears in feed
- [ ] Verify the post's theme is saved (check themed reactions display)

### 2.2 Draft Posts
- [ ] Create a post and select "Draft" instead of a community
- [ ] Verify it does NOT appear in the feed
- [ ] Navigate to profile → Drafts tab
- [ ] Verify draft appears
- [ ] Edit and publish — verify it now appears in feed

### 2.3 Editing a Post
- [ ] Navigate to your own post
- [ ] Click edit — verify form pre-fills with existing data (including theme)
- [ ] Change content
- [ ] Save — verify changes appear

### 2.4 Deleting a Post
- [ ] Navigate to your own post
- [ ] Click delete — verify confirmation dialog (not browser confirm)
- [ ] Confirm — verify post removed from feed

### 2.5 Text Moderation
- [ ] Create a post with NSFW keywords (e.g., "nsfw content test")
- [ ] Verify post is auto-marked as NSFW (is_nsfw = true) even if you didn't toggle it
- [ ] Create a post with harmful keywords (e.g., threats)
- [ ] Verify it's still published but flagged in moderation queue (check `posts_moderation` table)

### 2.6 Post Content Limits
- [ ] Try posting with empty content — verify error
- [ ] Try posting with content > 50,000 chars — verify error
- [ ] Try a title > 300 chars — verify error

---

## 3. Feed & Discovery

### 3.1 Explore Feed
- [ ] Navigate to `/explore`
- [ ] Verify "For You" and "Trending" tabs are visible
- [ ] Verify posts load with correct content, author, timestamp
- [ ] Scroll down — verify pagination loads more posts
- [ ] Pull down on mobile (or trigger pull-to-refresh) — verify feed refreshes

### 3.2 New Posts Banner (Realtime)
- [ ] Open `/explore` in Tab A
- [ ] In Tab B, create a new post from a different user
- [ ] In Tab A, verify "X new posts available" banner appears
- [ ] Click the banner — verify feed refreshes with new post

### 3.3 Trending
- [ ] Click "Trending" tab on explore page
- [ ] Verify posts are sorted by engagement score (not chronological)
- [ ] Verify "For You" link navigates back to main feed

### 3.4 Search
- [ ] Navigate to `/search`
- [ ] Search for a known username — verify user results
- [ ] Search for a known post keyword — verify post results
- [ ] Search for a community name — verify community results
- [ ] Search for a tag — verify tag results
- [ ] Search for nonsense — verify "No results" empty state per tab

---

## 4. Reactions & Engagement

### 4.1 Default Like Reaction
- [ ] On a post without a theme (or "General" theme), click the heart/like button
- [ ] Verify like count increments
- [ ] Click again — verify unlike and count decrements
- [ ] Verify the like count in the right-side stats

### 4.2 Themed Reactions
- [ ] Find/create a post with "Vent" theme
- [ ] Verify 4 themed reaction buttons display (Hug, Feel you, Stay strong, Love)
- [ ] Click each reaction — verify count increments and button highlights
- [ ] Click again — verify toggle off
- [ ] Repeat for "Creative" theme (Fire, Clap, Love, Inspire)
- [ ] Repeat for "Discussion" theme (Agree, Disagree, Thinking, Insightful)

### 4.3 Reposts
- [ ] On another user's post, click the repost button (loop icon)
- [ ] Verify button turns green and repost count appears
- [ ] Click again — verify undo repost
- [ ] Try reposting your own post — verify it's not allowed (button shouldn't appear)

### 4.4 Saving/Bookmarking Posts
- [ ] Click save/bookmark on a post
- [ ] Navigate to profile → Saved tab
- [ ] Verify saved post appears
- [ ] Unsave — verify it disappears from Saved tab

---

## 5. Comments

### 5.1 Adding Comments
- [ ] Navigate to a post with comments enabled
- [ ] Enter a comment (< 5000 chars)
- [ ] Submit — verify comment appears
- [ ] Try submitting empty — verify error
- [ ] Try submitting > 5000 chars — verify error

### 5.2 Editing Comments
- [ ] Click edit on your own comment
- [ ] Change content — save
- [ ] Verify "(edited)" indicator appears
- [ ] Check `comment_edit_history` table has the old content

### 5.3 Deleting Comments
- [ ] Click delete on your own comment
- [ ] Verify confirmation dialog appears (not instant delete)
- [ ] Confirm — verify comment removed

### 5.4 Comment Reactions
- [ ] React to a comment — verify count updates
- [ ] Toggle off — verify count decrements

### 5.5 Comment Text Moderation
- [ ] Post a comment with harmful keywords
- [ ] Verify it's still posted but flagged in moderation queue

---

## 6. Direct Messaging

### 6.1 Starting a Conversation
- [ ] Navigate to `/messages`
- [ ] Click "New Message"
- [ ] Search for a user — select them
- [ ] Send a message — verify redirect to conversation

### 6.2 Sending Messages
- [ ] Type a message and click send
- [ ] Verify send button shows loading spinner during send
- [ ] Verify message appears in thread
- [ ] Verify timestamp displays

### 6.3 Real-Time Messages
- [ ] Open the same conversation in two browser tabs (different users)
- [ ] Send a message from Tab A
- [ ] **Verify it appears instantly in Tab B** (no refresh needed)
- [ ] Delete a message from Tab A — verify it disappears in Tab B
- [ ] Edit a message — verify the update appears in Tab B

### 6.4 GIF Messages
- [ ] In message input, click the GIF button
- [ ] Verify GIF picker opens with featured GIFs
- [ ] Search for a GIF (e.g., "happy")
- [ ] Verify search results update
- [ ] Click a GIF — verify it appears as preview
- [ ] Send — verify GIF renders in conversation

### 6.5 Message Reactions
- [ ] Hover/long-press a message — react with an emoji
- [ ] Verify emoji validation (only actual emoji accepted)
- [ ] Verify reaction displays on the message

### 6.6 Conversation Muting
- [ ] Mute a conversation — verify bell icon changes
- [ ] Verify muted conversations don't trigger notification badges
- [ ] Unmute — verify normal behaviour resumes

### 6.7 Conversations List (Realtime)
- [ ] With conversations list open, receive a new message
- [ ] Verify the conversation moves to the top of the list
- [ ] Verify preview text updates

---

## 7. Notifications

### 7.1 Notification Types
Test each by performing the triggering action from a second account:

- [ ] **Like:** Like someone's post → notification appears
- [ ] **Comment:** Comment on someone's post → notification appears
- [ ] **Follow:** Follow someone → notification appears
- [ ] **Repost:** Repost someone's post → notification appears
- [ ] **Mention:** Mention someone (@username) → notification appears
- [ ] **Appeal approved/rejected:** Process an appeal → notification appears
- [ ] **Community join approved/rejected:** Approve/reject join request → notification appears
- [ ] **Moderation action:** Take mod action → notification appears
- [ ] **Comment reaction:** React to someone's comment → notification appears

### 7.2 Real-Time Notifications
- [ ] Open app in two tabs
- [ ] Trigger a notification from Tab B
- [ ] **Verify notification appears in Tab A without refresh**
- [ ] **Verify badge count on bell icon increments in real-time**

### 7.3 Badge Counts
- [ ] Verify bottom nav shows red badge on bell icon with unread count
- [ ] Verify bottom nav shows red badge on messages icon with unread count
- [ ] Mark all notifications as read — verify badge disappears
- [ ] Read a conversation — verify message badge updates

### 7.4 Notification Actions
- [ ] Click a notification — verify it navigates to the right page
- [ ] "Mark all as read" — verify all unread notifications marked
- [ ] Delete a notification — verify removed from list

---

## 8. Communities

### 8.1 Creating a Community
- [ ] Navigate to `/connect`
- [ ] Click "Create Community"
- [ ] Enter name (URL slug format) — verify validation
- [ ] Enter display name, description
- [ ] Set join type (public/private)
- [ ] Submit — verify community page loads

### 8.2 Community Feed
- [ ] Navigate to a community page
- [ ] Verify "Recent Posts" section shows posts from that community
- [ ] Create a post in the community — verify it appears
- [ ] Verify pagination works ("Load more")
- [ ] Verify loading skeleton on initial load

### 8.3 Joining/Leaving
- [ ] Join a public community — verify member count increments (via trigger)
- [ ] Leave — verify member count decrements
- [ ] Request to join a private community — verify pending state
- [ ] As community admin, approve/reject request

### 8.4 Community Settings (Admin)
- [ ] As community admin, click "Settings" link
- [ ] Edit community details — save
- [ ] Manage members — change roles
- [ ] Ban a user — verify they appear in banned list
- [ ] Unban — verify removal

### 8.5 Community Analytics (Admin)
- [ ] As community admin, click "Analytics" link on community page
- [ ] Verify stats cards: members, posts, reactions, comments, engagement rate
- [ ] Verify "Top Contributors" section
- [ ] Verify "+X this month" member growth stat

---

## 9. Profile

### 9.1 Viewing Profiles
- [ ] Navigate to your own profile — verify "(You)" indicator
- [ ] Verify "View your analytics" link appears on own profile
- [ ] Navigate to another user's profile — verify follow/block/mute buttons
- [ ] Verify online presence green dot (if user is online in another tab)
- [ ] Verify verification badge (if user is verified in DB)

### 9.2 Profile Tabs
- [ ] Posts tab — verify user's published posts load
- [ ] Liked tab — verify liked posts load
- [ ] Saved tab — verify bookmarked posts
- [ ] Drafts tab (own profile only) — verify draft posts
- [ ] Listeners tab — verify follower/following lists

### 9.3 Editing Profile
- [ ] Navigate to `/profile/edit`
- [ ] Change avatar — verify upload and display
- [ ] **Verify image moderation on avatar** (upload a normal image — should pass; nude image — should be blocked)
- [ ] Change cover photo — verify same moderation
- [ ] Change bio — verify HTML is stripped
- [ ] Save — verify changes reflect immediately

### 9.4 User Analytics
- [ ] Navigate to `/profile/analytics` (via link on profile or Cmd+K)
- [ ] Verify stat cards: posts, reactions received, comments received, followers, engagement rate
- [ ] Verify "Best Posting Times" section with heatmap
- [ ] If no posts yet — verify "Start posting to see your analytics!" message

### 9.5 Social Actions
- [ ] Follow a user — verify follower count updates
- [ ] Unfollow — verify count decrements
- [ ] Block a user — verify **confirmation dialog** (not browser confirm)
- [ ] Confirm block — verify user's content hidden
- [ ] Mute a user (with duration) — verify toast confirmation

---

## 10. Moderation

### 10.1 Reporting Content
- [ ] Flag a post — verify flag form appears
- [ ] Submit report with reason — verify confirmation

### 10.2 Reporting Users
- [ ] Report a user from their profile
- [ ] Submit with details — verify confirmation

### 10.3 Moderation Dashboard
- [ ] Log in as a moderator/admin
- [ ] Navigate to moderation dashboard
- [ ] Verify tabs: Posts, Profiles, Images, Users, Appeals
- [ ] Verify auto-flagged items appear (from text/image moderation)
- [ ] Assign a moderation item to a moderator — verify **dropdown shows all moderators** (not just "Assign to me")
- [ ] Approve/reject an item
- [ ] Verify moderation history log

### 10.4 Appeals
- [ ] As a regular user whose content was flagged, submit an appeal
- [ ] Verify minimum 20 character reason requirement
- [ ] As moderator, review the appeal in dashboard
- [ ] Approve/reject — verify notification sent to user

### 10.5 Image Moderation
- [ ] Upload a profile photo via photo carousel
- [ ] Verify "Checking image content..." message appears
- [ ] Normal image — verify it's allowed
- [ ] Nudity — verify "Image rejected" error
- [ ] Suggestive (bikini/underwear) — verify flagged for review but allowed OR warning shown

---

## 11. Image Moderation Specific Tests

### 11.1 Profile Avatar/Cover
- [ ] Update avatar with normal image — passes
- [ ] Update avatar with explicit image — verify "Image rejected: Explicit sexual content"
- [ ] Update cover with normal image — passes
- [ ] Update cover with explicit image — verify blocked

### 11.2 Photo Carousel
- [ ] Upload photo via carousel — verify moderation runs
- [ ] Check `images_moderation` table for any flagged entries
- [ ] Verify blocked images are deleted from storage

---

## 12. Subscriptions & Payments

### 12.1 Navigation
- [ ] Verify "Subscription" link in Settings page quick links
- [ ] Verify "Subscription" in Cmd+K command palette
- [ ] Navigate to `/settings/subscription`

### 12.2 Plan Display
- [ ] Verify subscription plans load from `subscription_packages` table
- [ ] If no plans configured — verify "No subscription plans available yet" message
- [ ] If plans exist — verify plan cards with name, price, features

### 12.3 Checkout Flow (requires Stripe test mode)
- [ ] Click "Subscribe" on a plan
- [ ] Verify redirect to Stripe Checkout
- [ ] Complete with test card (4242 4242 4242 4242)
- [ ] Verify redirect back to `/settings/subscription?success=true`
- [ ] Verify success banner displays
- [ ] Verify current plan info shows with status and renewal date

### 12.4 Customer Portal
- [ ] With active subscription, click "Manage Billing"
- [ ] Verify redirect to Stripe Customer Portal
- [ ] Verify return to subscription page

### 12.5 Webhook Processing (requires Stripe CLI)
- [ ] Run `stripe listen --forward-to localhost:3080/api/stripe/webhook`
- [ ] Complete a checkout — verify `subscriptions` table entry created
- [ ] Cancel subscription in Stripe — verify status updates to "cancelled"

---

## 13. Email Notifications

### 13.1 Settings
- [ ] Navigate to Settings
- [ ] Verify "Email Notifications" section with digest frequency dropdown
- [ ] Set to "Daily" — verify setting saves
- [ ] Set to "Weekly" — verify setting saves
- [ ] Set to "Never" — verify setting saves

### 13.2 Digest Delivery (requires Resend API key)
- [ ] Set digest to "Daily"
- [ ] Have unread notifications
- [ ] Call `/api/cron/email-digest` with correct `Authorization: Bearer CRON_SECRET`
- [ ] Verify email received with notification summary
- [ ] Verify "View Notifications" button links to site
- [ ] With no unread notifications — verify no email sent

---

## 14. Push Notifications

### 14.1 Settings
- [ ] Navigate to Settings
- [ ] Verify "Push Notifications" section with Enable/Disable button
- [ ] Click "Enable" — verify browser permission prompt
- [ ] Grant permission — verify token saved to `push_tokens` table
- [ ] Button text changes to "Disable"

### 14.2 Receiving Push (requires VAPID keys)
- [ ] With push enabled, trigger a notification from another account
- [ ] Verify browser push notification appears (when tab is not focused)
- [ ] Click notification — verify app opens to correct page

---

## 15. PWA & Offline

### 15.1 Installability
- [ ] Open in Chrome/Edge — verify install prompt or "Install" option in browser menu
- [ ] Install — verify standalone app opens with correct theme colour

### 15.2 Service Worker
- [ ] Open DevTools → Application → Service Workers
- [ ] Verify `sw.js` is registered and active
- [ ] Verify "ostracon-v1" cache exists with pre-cached assets

### 15.3 Offline Behaviour
- [ ] Disconnect from internet (DevTools → Network → Offline)
- [ ] Navigate to any page — verify offline page displays ("You're offline")
- [ ] Click "Retry" — verify page reload attempt
- [ ] Reconnect — verify app recovers

---

## 16. Navigation & Command Palette

### 16.1 Command Palette (Cmd+K)
- [ ] Press Cmd+K (or Ctrl+K) — verify palette opens
- [ ] Verify entries: Home, Explore, Search, Communities, Notifications, Messages, Profile, **Trending, Your Analytics, Settings, Security & 2FA, Subscription**
- [ ] Search for "trending" — verify filtered result
- [ ] Select an item — verify navigation

### 16.2 Bottom Navigation
- [ ] Verify all bottom nav icons are tappable
- [ ] Verify active state highlights on current page
- [ ] Verify notification badge (red circle with count)
- [ ] Verify message badge (red circle with count)
- [ ] Verify badges update in real-time

### 16.3 Settings Navigation
- [ ] Navigate to `/settings`
- [ ] Verify quick links: "Security & 2FA", "Subscription", "Your Analytics"
- [ ] Click each — verify navigation to correct page

---

## 17. Security

### 17.1 Rate Limiting
- [ ] Rapidly submit posts (> 20 in 60s) — verify "Too many requests" error
- [ ] Rapidly attempt PIN unlock (> 5 in 60s) — verify rate limit
- [ ] Rapidly join communities (> 10 in 60s) — verify rate limit

### 17.2 Content Security Policy
- [ ] Open DevTools → Console
- [ ] Verify no CSP violation errors on normal browsing
- [ ] Navigate to Stripe checkout — verify no CSP blocks
- [ ] Verify images from Supabase storage load correctly

### 17.3 Input Validation
- [ ] Try XSS in bio: `<script>alert('xss')</script>` — verify stripped to plain text
- [ ] Try XSS in comments — verify stripped
- [ ] Try invalid emoji reaction (plain text) — verify "Invalid emoji" error
- [ ] Try community name with special chars — verify validation error

### 17.4 Auth Guards
- [ ] While logged out, navigate to `/explore` — verify redirect to `/auth`
- [ ] While logged out, try API route directly — verify 401
- [ ] With deactivated account — verify redirect to error page

---

## 18. Real-Time Features Summary

Run these with 2 browser tabs (different users):

- [ ] **Messages:** Send message in Tab A → appears in Tab B instantly
- [ ] **Message edits/deletes:** Edit/delete in A → updates in B
- [ ] **Notifications:** Trigger action in Tab B → notification appears in Tab A
- [ ] **Notification badges:** Badge count updates in real-time on bottom nav
- [ ] **New posts banner:** Post in Tab B → "New posts available" in Tab A
- [ ] **Conversations list:** New message reorders conversation list in real-time
- [ ] **Online presence:** Open Tab B → green dot appears on user's avatar in Tab A

---

## 19. Confirmation Dialogs

Verify these use styled modals (NOT browser `confirm()`/`alert()`):

- [ ] Delete post — styled confirmation dialog
- [ ] Delete comment — styled confirmation dialog
- [ ] Block user (from post header) — styled confirmation dialog
- [ ] Block user (from profile) — styled confirmation dialog
- [ ] Error messages — toast notifications (not `alert()`)

---

## 20. Edge Cases & Error States

- [ ] Navigate to non-existent profile (`/profile/doesnotexist`) — verify 404 or graceful error
- [ ] Navigate to non-existent community (`/connect/doesnotexist`) — verify 404
- [ ] Navigate to non-existent post (`/post/00000000-0000-0000-0000-000000000000`) — verify error state
- [ ] Empty explore feed (new user, no follows) — verify helpful empty state message
- [ ] Empty notifications — verify empty state
- [ ] Empty messages — verify empty state
- [ ] Empty search results — verify per-tab empty messages
- [ ] Community with no posts — verify "No posts in this community yet" message
- [ ] User analytics with no posts — verify "Start posting to see your analytics!" message

---

## Test Environment Checklist

Before testing, verify these environment variables are configured:

```
NEXT_PUBLIC_SUPABASE_URL=            ✅ Required
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY= ✅ Required
NEXT_PUBLIC_SITE_URL=                 ✅ Required (for OAuth redirect)
UPSTASH_REDIS_REST_URL=              ✅ Required (rate limiting + PIN)
UPSTASH_REDIS_REST_TOKEN=            ✅ Required
SIGHTENGINE_API_USER=                ⚠️  Optional (image moderation disabled without)
SIGHTENGINE_API_SECRET=              ⚠️  Optional
STRIPE_SECRET_KEY=                   ⚠️  Optional (subscriptions disabled without)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=  ⚠️  Optional
STRIPE_WEBHOOK_SECRET=               ⚠️  Optional
RESEND_API_KEY=                      ⚠️  Optional (email digests disabled without)
CRON_SECRET=                         ⚠️  Optional (protects cron endpoints)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=        ⚠️  Optional (push notifications)
VAPID_PRIVATE_KEY=                   ⚠️  Optional
VAPID_EMAIL=                         ⚠️  Optional
NEXT_PUBLIC_TENOR_API_KEY=           ⚠️  Optional (GIF picker uses default key)
```

### Supabase Dashboard Configuration:
- [ ] Auth → Email provider enabled
- [ ] Auth → Email templates configured (or using default)
- [ ] Auth → Site URL set to match `NEXT_PUBLIC_SITE_URL`
- [ ] Auth → Redirect URLs includes callback URL
- [ ] Auth → Providers → Google/GitHub/Apple configured (for OAuth tests)
- [ ] Storage buckets created: `user.photos`, `avatars`, `covers`, `community.assets`
- [ ] All migrations (003-008) applied via Supabase dashboard or CLI
