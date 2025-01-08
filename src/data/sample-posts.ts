const samplePosts = [
  {
    id: "550e8400-e29b-41d4-a716-446655440000",
    user_id: "a1b2c3d4-e5f6-4321-8765-1a2b3c4d5e6f", // techie_sarah
    content:
      "Just deployed my first Next.js app! The learning curve was steep but totally worth it. #coding #webdev",
    comments_open: true,
    is_nsfw: false,
    created_at: "2025-01-08T02:22:20.648Z",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
    user_id: "b2c3d4e5-f6a7-5432-8765-2b3c4d5e6f7a", // adventure_max
    content:
      "Found this amazing coffee shop in downtown. Their cold brew is life-changing! ☕",
    comments_open: true,
    is_nsfw: false,
    created_at: "2025-01-05T05:22:20.648Z",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440002",
    user_id: "c3d4e5f6-a7b8-6543-8765-3c4d5e6f7a8b", // chef_olivia
    content:
      "Looking for recommendations on mechanical keyboards. Currently using Cherry MX Browns but want to try something new. #mechanicalkeyboards",
    comments_open: true,
    is_nsfw: false,
    created_at: "2024-01-05T18:44:12.887Z",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440003",
    user_id: "d4e5f6a7-b8c9-7654-8765-4d5e6f7a8b9c", // fitness_chris
    content:
      'Finally finished reading "Project Hail Mary" - absolutely mind-blowing sci-fi! No spoilers but wow... 📚',
    comments_open: true,
    is_nsfw: false,
    created_at: "2025-01-08T00:22:20.648Z",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440004",
    user_id: "e5f6a7b8-c9d0-8765-8765-5e6f7a8b9c0d", // artist_emma
    content:
      "PSA: Remember to touch grass today! Working from home is great but we all need some vitamin D 🌱",
    comments_open: true,
    is_nsfw: false,
    created_at: "2024-01-03T11:27:33.219Z",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440005",
    user_id: "f6a7b8c9-d0e1-9876-8765-6f7a8b9c0d1e", // gamer_alex
    content: "My sourdough starter is finally alive! Named it Dough Lipa 🍞",
    comments_open: true,
    is_nsfw: false,
    created_at: "2024-01-02T14:55:18.776Z",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440006",
    user_id: "a7b8c9d0-e1f2-0987-8765-7a8b9c0d1e2f", // eco_maya
    content:
      "Anyone else struggling with CSS Grid? Or is it just me? 😅 #webdev #css",
    comments_open: true,
    is_nsfw: false,
    created_at: "2024-01-01T16:21:44.332Z",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440007",
    user_id: "b8c9d0e1-f2a3-1098-8765-8b9c0d1e2f3a", // music_dave
    content:
      "Just adopted a cat from the local shelter! Meet Luna, my new debugging partner 🐱",
    comments_open: true,
    is_nsfw: false,
    created_at: "2023-12-31T13:48:29.998Z",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440008",
    user_id: "c9d0e1f2-a3b4-2109-8765-9c0d1e2f3a4b", // writer_nina
    content:
      "Hot take: Tabs > Spaces. Fight me in the comments. #coding #developers",
    comments_open: true,
    is_nsfw: false,
    created_at: "2025-01-06T05:22:20.648Z",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440009",
    user_id: "d0e1f2a3-b4c5-3210-8765-0d1e2f3a4b5c", // dev_marcus
    content:
      "Started learning Rust today. My brain hurts but in a good way! 🦀",
    comments_open: true,
    is_nsfw: false,
    created_at: "2023-12-29T22:09:51.112Z",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440010",
    user_id: "a1b2c3d4-e5f6-4321-8765-1a2b3c4d5e6f", // techie_sarah
    content:
      "Warning: Spicy food review ahead! This new Thai place literally brought tears to my eyes 🌶️",
    comments_open: false,
    is_nsfw: false,
    created_at: "2025-01-07T17:22:20.648Z",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440011",
    user_id: "b2c3d4e5-f6a7-5432-8765-2b3c4d5e6f7a", // adventure_max
    content: "Day 100 of learning Japanese! 頑張ります！#languagelearning",
    comments_open: true,
    is_nsfw: false,
    created_at: "2023-12-27T17:26:43.234Z",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440012",
    user_id: "c3d4e5f6-a7b8-6543-8765-3c4d5e6f7a8b", // chef_olivia
    content:
      "Just hiked Mount Rainier! Views were absolutely incredible. Remember to stay hydrated folks! 🏔️",
    comments_open: true,
    is_nsfw: false,
    created_at: "2024-11-08T05:22:20.648Z",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440013",
    user_id: "d4e5f6a7-b8c9-7654-8765-4d5e6f7a8b9c", // fitness_chris
    content:
      "My contribution to the workspace ergonomics discussion: get a good chair first, everything else second.",
    comments_open: true,
    is_nsfw: false,
    created_at: "2025-01-08T04:22:20.648Z",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440014",
    user_id: "e5f6a7b8-c9d0-8765-8765-5e6f7a8b9c0d", // artist_emma
    content: "TIL about the CSS :has() selector. Game changer! #webdev #css",
    comments_open: true,
    is_nsfw: false,
    created_at: "2025-01-07T05:22:20.648Z",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440015",
    user_id: "f6a7b8c9-d0e1-9876-8765-6f7a8b9c0d1e", // gamer_alex
    content:
      "Building my first mechanical keyboard. RIP wallet 💸 #mechanicalkeyboards",
    comments_open: true,
    is_nsfw: false,
    created_at: "2025-01-08T05:12:20.648Z",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440016",
    user_id: "a7b8c9d0-e1f2-0987-8765-7a8b9c0d1e2f", // eco_maya
    content:
      "Anyone else notice their productivity skyrocket after getting a second monitor?",
    comments_open: true,
    is_nsfw: false,
    created_at: "2023-12-22T23:47:33.456Z",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440017",
    user_id: "b8c9d0e1-f2a3-1098-8765-8b9c0d1e2f3a", // music_dave
    content:
      "Started a mini garden on my balcony. These cherry tomatoes better survive! 🍅",
    comments_open: true,
    is_nsfw: false,
    created_at: "2025-01-08T04:52:20.648Z",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440018",
    user_id: "c9d0e1f2-a3b4-2109-8765-9c0d1e2f3a4b", // writer_nina
    content:
      "Quick poll: What text editor do you use for quick edits? Notepad++, Sublime, or VSCode? #coding",
    comments_open: false,
    is_nsfw: true,
    created_at: "2025-01-08T05:20:20.648Z",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440019",
    user_id: "d0e1f2a3-b4c5-3210-8765-0d1e2f3a4b5c", // dev_marcus
    content:
      "Been experimenting with different coffee brewing methods. The Aeropress might be my new favorite! ☕",
    comments_open: true,
    is_nsfw: false,
    created_at: "2025-01-08T05:32:19.648Z",
  },
];

export default samplePosts;
