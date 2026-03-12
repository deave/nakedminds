# Naked Minds Circle — MVP Product Spec

## MVP Definition

Naked Minds Circle is a private, invite-only web app where a small group of people track personal growth together. Each month, every member sets their **ONE Thing** (the single goal they want to move forward), defines **Key Actions**, commits to a **First Step**, blocks **Time** for focused work, and sets a **Definition of Progress**. Everyone in the Circle can see everyone else's monthly focus, leave supportive comments, and send direct messages. The goal is radical transparency and gentle accountability — no gamification, no metrics dashboards, just honest humans helping each other grow.

**Stack decision:** Next.js 14 (App Router) + TypeScript + Tailwind CSS + Prisma + PostgreSQL + NextAuth.js. This gives us type safety end-to-end, excellent DX with Prisma, built-in API routes via Next.js, and a mature auth solution without vendor lock-in.

---

## 1. Product Spec

### Pages

| Page | Route | Purpose |
|------|-------|---------|
| Landing / Sign In | `/` | Auth gate — sign in or request access |
| Onboarding | `/onboarding` | First-time setup: display name, bio |
| Set Monthly Focus | `/monthly-setup` | Wizard: ONE Thing, Key Actions, First Step, Time Block, Definition of Progress |
| Circle Feed | `/feed` | All members' current month at a glance |
| Member Profile | `/members/[id]` | One member's current + history + comments |
| DM Inbox | `/messages` | List of conversations |
| DM Conversation | `/messages/[conversationId]` | Single thread |
| Settings | `/settings` | Edit profile, change password, notification prefs |

### User Stories

**Authentication & Membership**
- As a visitor, I can sign in with email + password
- As an admin, I can invite new members by email
- As an invited user, I receive an email with a sign-up link
- As a member, I can only access the app if I belong to the Circle

**Monthly Focus**
- As a member, I set my ONE Thing (single goal) for the month
- As a member, I define 2-3 Key Actions to move it forward
- As a member, I commit to a First Step for this week
- As a member, I block specific Time (day + time) for focused work
- As a member, I set a Definition of Progress to know if I succeeded
- As a member, I cannot change previous months' entries
- As a member, I can view my month-by-month history
- As a member, I can see everyone else's monthly focus
- As a member, I can leave a comment on any monthly focus
- As a member, I can DM someone about their focus

**Feed & Profiles**
- As a member, I see a feed of all members' current month data
- As a member, I can tap a member to see their full profile
- As a member, I see a timeline of someone's past months
- As a member, I see comments on each focus challenge

**Direct Messages**
- As a member, I can start a DM with any other member
- As a member, I see an inbox with conversations sorted by recency
- As a member, I see an unread indicator on new messages
- As a member, I can view a conversation thread

**Nudges**
- If I haven't set this month's focus, I see a banner on every page
- If someone comments on my focus, I get an in-app notification

### Edge Cases

- **Month rollover:** On the 1st of each month, users see a prompt to set new monthly data. Previous month data becomes read-only. We determine "current month" based on UTC.
- **Late joiners:** A user who joins mid-month still sets their monthly focus for the remaining days.
- **Empty states:** Feed with no members yet, profile with no history, inbox with no messages — all have friendly copy.
- **Self-comments:** Users can comment on their own focus challenges (self-reflection).
- **Comment deletion:** Users can delete their own comments. No editing in MVP.
- **DM with self:** Not allowed — DM button hidden on own profile.
- **Single Circle:** MVP supports exactly one Circle. No multi-tenancy.
- **Admin:** First user is admin. Admin can invite others. No admin panel in MVP — invites via settings page.

### Assumptions

- Small circle (≤30 members) — no pagination needed in MVP feed
- UTC timezone for month boundaries
- No file uploads or attachments anywhere
- No email notifications in MVP — in-app only
- No password reset flow in MVP (can be added quickly)

---

## 2. Data Model & Schema

### Entities

```
User
├── id (uuid)
├── email (unique)
├── passwordHash
├── displayName
├── bio (optional)
├── avatarUrl (optional)
├── role (MEMBER | ADMIN)
├── onboarded (boolean)
├── createdAt
└── updatedAt

MonthlyEntry
├── id (uuid)
├── userId (FK → User)
├── year (int)
├── month (int, 1-12)
├── oneThing (text)
├── keyActions (text)
├── firstStep (text)
├── timeBlockDay (text)
├── timeBlockTime (text)
├── definitionOfProgress (text)
├── createdAt
└── updatedAt
└── UNIQUE(userId, year, month)

Comment
├── id (uuid)
├── authorId (FK → User)
├── monthlyEntryId (FK → MonthlyEntry)
├── body (text)
├── createdAt
└── updatedAt

Conversation
├── id (uuid)
├── createdAt
└── updatedAt

ConversationParticipant
├── conversationId (FK → Conversation)
├── userId (FK → User)
└── PRIMARY KEY(conversationId, userId)

Message
├── id (uuid)
├── conversationId (FK → Conversation)
├── senderId (FK → User)
├── body (text)
├── createdAt
└── readAt (nullable datetime)

Notification
├── id (uuid)
├── userId (FK → User)
├── type (COMMENT | MESSAGE)
├── referenceId (uuid — points to Comment or Message)
├── read (boolean)
├── createdAt
```

---

## 3. API Routes

All routes are under `/api/`. Auth required unless noted.

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Register with invite token |
| POST | `/api/auth/login` | Email + password login |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Get current user |

### Users
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/users` | List all circle members |
| GET | `/api/users/[id]` | Get user profile |
| PATCH | `/api/users/me` | Update own profile |

### Monthly Entries
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/entries/current` | Get all members' current month entries |
| GET | `/api/entries/me` | Get my entry history |
| GET | `/api/entries/user/[id]` | Get a user's entry history |
| POST | `/api/entries` | Create this month's entry |
| PATCH | `/api/entries/[id]` | Update this month's entry (only current month) |

### Comments
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/entries/[entryId]/comments` | Get comments for an entry |
| POST | `/api/entries/[entryId]/comments` | Add comment |
| DELETE | `/api/comments/[id]` | Delete own comment |

### Messages
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/conversations` | List my conversations |
| POST | `/api/conversations` | Start or get conversation with user |
| GET | `/api/conversations/[id]/messages` | Get messages in conversation |
| POST | `/api/conversations/[id]/messages` | Send message |
| PATCH | `/api/conversations/[id]/read` | Mark conversation as read |

### Notifications
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/notifications` | Get my notifications |
| PATCH | `/api/notifications/read-all` | Mark all as read |

### Admin
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/admin/invite` | Invite user by email (admin only) |

---

## 4. Frontend Component Map & Routing

### Layout
```
RootLayout
├── AuthProvider (session context)
├── NotificationProvider (polling for updates)
├── NavBar (mobile bottom nav, desktop side nav)
│   ├── FeedLink
│   ├── MessagesLink (with unread badge)
│   ├── ProfileLink
│   └── SettingsLink
├── MonthlySetupBanner (if current month not set)
└── {children}
```

### Pages & Components

```
/ (Landing)
└── SignInForm
    ├── EmailInput
    ├── PasswordInput
    └── SignUpLink

/onboarding
└── OnboardingWizard
    ├── Step1_DisplayName
    ├── Step2_Bio
    └── Step3_Done

/monthly-setup
└── MonthlySetupWizard
    ├── Step1_OneThing
    ├── Step2_KeyActions
    ├── Step3_FirstStep
    ├── Step4_TimeBlock (Day + Time)
    ├── Step5_DefinitionOfProgress
    └── Step6_Review

/feed
└── CircleFeed
    ├── MonthSelector (current month display)
    └── MemberCardList
        └── MemberCard
            ├── Avatar + Name
            ├── OneThingHeadline
            ├── KeyActionsDetail
            ├── FirstStepDetail
            ├── TimeBlockDetail
            ├── DefinitionOfProgressDetail
            ├── CommentCount
            └── EncourageButton

/members/[id]
└── MemberProfile
    ├── ProfileHeader (avatar, name, bio, DM button)
    ├── CurrentMonthSection
    │   ├── OneThing
    │   ├── KeyActions
    │   ├── FirstStep
    │   ├── TimeBlock
    │   └── DefinitionOfProgress
    ├── CommentsSection
    │   ├── CommentList
    │   │   └── CommentItem (author, body, timestamp)
    │   └── CommentForm
    └── MonthTimeline
        └── TimelineEntry (month, ONE Thing, actions, progress)

/messages
└── InboxView
    └── ConversationList
        └── ConversationPreview
            ├── Avatar + Name
            ├── LastMessage preview
            └── UnreadDot

/messages/[conversationId]
└── ConversationView
    ├── ConversationHeader (other user info)
    ├── MessageList
    │   └── MessageBubble (sender, body, time)
    └── MessageInput

/settings
└── SettingsPage
    ├── ProfileEditForm
    ├── InviteSection (admin only)
    │   └── InviteForm (email input)
    └── LogoutButton
```

### Shared Components
```
Avatar — User avatar with fallback initials
Badge — Small colored label
Button — Primary, secondary, ghost variants
Card — Container with subtle shadow
EmptyState — Illustration + copy + CTA
LoadingSpinner — Centered spinner
Modal — Overlay dialog
TextArea — Multi-line input
Input — Single-line input
Toast — Success/error notifications
```

---

## 5. Milestone Plan

### Milestone 1 — Foundation
- Initialize Next.js + TypeScript + Tailwind + Prisma
- Database schema & migrations
- Auth (register, login, logout, session)
- Basic layout shell with nav

### Milestone 2 — Core Monthly Flow
- Monthly setup wizard (ONE Thing, Key Actions, First Step, Time Block, Definition of Progress)
- Month enforcement logic (one per month, read-only past)
- Monthly entry API routes
- "Set your monthly focus" banner

### Milestone 3 — Feed & Profiles
- Circle Feed page with all member cards
- Member Profile page with current month + history
- Comments on monthly focus entries
- In-app notifications for comments

### Milestone 4 — Direct Messages
- Conversation creation and listing
- Message sending and display
- Unread indicators
- DM button on profiles

### Milestone 5 — Polish & Admin
- Admin invite flow
- Onboarding wizard
- Empty states and loading states
- Mobile responsive polish
- Settings page
- Edge case handling (month rollover, etc.)
