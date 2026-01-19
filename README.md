# Gifty – The Smarter Way to Gift

Never wonder what to gift again. Share wishlists with friends and family, see what they actually want, and coordinate gifts without spoiling the surprise.

**Gifty** is a modern web app that transforms gift-giving by eliminating guesswork, preventing duplicate gifts, and keeping surprises secret. Built with Next.js and Supabase, it's designed to make gift coordination effortless for everyone.

---

## 🎁 Key Features

### ✨ Create & Share Wishlists
- Easily create personalized wishlists by pasting product links
- Automatic metadata extraction—product images, names, and prices are fetched for you
- Share wishlists with specific people or make them publicly discoverable
- Organize items by occasion, interest, or category

### 👥 Connect with Friends & Family
- Build your network of friends and family members
- Browse their wishlists instantly
- Know exactly what they want for birthdays, holidays, and special occasions
- Discover gift ideas without asking directly

### 🎀 Coordinate Gifts Secretly
- Claim items you plan to buy to avoid duplicate gifts
- Others see what's already claimed, but the recipient never finds out
- Split gift costs with friends—multiple people can contribute to one item
- Gift claims remain confidential until the gift is given

### 🔒 Privacy & Security
- Fine-grained privacy controls—keep wishlists private, share with friends, or make them public
- Wishlist owners can't see who claimed their items (gifts stay secret!)
- Secure friend requests with accept/decline options
- Built on Supabase with Row Level Security (RLS) for data protection

### 📲 Built for All Devices
- Fully responsive design—works seamlessly on mobile, tablet, and desktop
- Progressive Web App (PWA) support for app-like experience
- Fast, snappy performance with optimized images and lazy loading
- Works offline with intelligent caching

---

## 💡 Why Gifty?

**The Problem:** Gift-giving is stressful. You guess what people want, end up buying duplicates, and lose the element of surprise when you ask them directly.

**Our Solution:** Gifty brings transparency and coordination to gift-giving while preserving the joy of giving gifts your friends actually want. It's the bridge between "What do you want?" and delightfully surprising someone with the perfect gift.

**For Gift Givers:**
- No more duplicate gifts at the same party
- Confidence that your gift is wanted
- Ability to split expensive gifts with others
- Peace of mind knowing what to buy

**For Wishlist Owners:**
- Get exactly what you want without spoiling the surprise
- Share different wishlists for different occasions
- See who's buying what (kind of)—they know, you don't
- Receive gifts you truly love

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ and npm/yarn/pnpm
- **Supabase** account (free tier available at [supabase.com](https://supabase.com))
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/gifty.git
   cd gifty
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory. Use `.env.example` as a template:
   ```bash
   cp .env.example .env.local
   ```
   Then edit `.env.local` and add your actual values:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
   See [Environment Variables](#environment-variables) section below for details on obtaining these values.

4. **Start the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) with your browser to see the app.

### Development Commands
```bash
npm run dev      # Start development server (localhost:3000)
npm run build    # Create production build
npm run lint     # Run ESLint
npm run start    # Start production server
```

---

## 🗄️ Local Database Setup (Supabase)

Gifty uses Supabase for authentication and data storage. For local development:

### Install Supabase CLI

**macOS (Homebrew):**
```bash
brew install supabase/tap/supabase
```

**Windows (Scoop):**
```bash
scoop install supabase
```

**Linux/Other platforms:**
Visit [Supabase CLI documentation](https://supabase.com/docs/guides/cli/getting-started) for installation instructions.

### Start Local Development

Once installed, run these commands to set up your local database:

```bash
# Start local Supabase instance (first time only)
supabase start

# Reset database with migrations
supabase db reset

# Generate TypeScript types from your schema
supabase gen types typescript --local > src/lib/supabase/types.ts

# Run edge functions locally (in another terminal)
supabase functions serve
```

After running `supabase start`, local Supabase will be available at:
- **API URL:** http://localhost:54321
- **Studio URL:** http://localhost:54323
- **Credentials:** Check terminal output for anon key and other details

**Note:** Update your `.env.local` to use the local Supabase URLs when developing locally.

---

## ⚙️ Environment Variables

### Setup
Copy the `.env.example` file to `.env.local` and fill in your actual values:
```bash
cp .env.example .env.local
```

### Required Variables

| Variable | Description | Where to Get |
|----------|-------------|--------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | 1. Go to [Supabase Console](https://app.supabase.com) 2. Select your project 3. Click "Settings" 4. Click "API" 5. Copy "Project URL" |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous (public) key | 1. Go to [Supabase Console](https://app.supabase.com) 2. Select your project 3. Click "Settings" 4. Click "API" 5. Copy the "anon public" key under "Project API keys" |

**Note:** These variables are marked with `NEXT_PUBLIC_` prefix, which means they're safe to expose in the browser. They only provide read/write access according to your Supabase Row Level Security (RLS) policies.

### Optional Variables (Edge Functions)

| Variable | Description | Where to Get | Purpose |
|----------|-------------|--------------|---------|
| `LINKPREVIEW_API_KEY` | API key for link preview service | Get from your link preview provider (e.g., [microlink.io](https://microlink.io), [linkpreview.net](https://www.linkpreview.net)) | Used in Supabase edge functions for fetching product metadata from URLs when users add items to their wishlists |

**Note:** If you don't provide `LINKPREVIEW_API_KEY`, the app will still work, but link previews may not load or may have reduced functionality.

### Example `.env.local`
```bash
# Required
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Optional
LINKPREVIEW_API_KEY=your-api-key-here
```

### Local Development with Supabase
When using a local Supabase instance (via `supabase start`), update your `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<local-anon-key-from-supabase-output>
```

For more architecture details, see [CLAUDE.md](./CLAUDE.md).

---

## 🏗️ Tech Stack

Gifty is built with modern, production-proven technologies:

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Frontend** | Next.js 16 (App Router) | React-based framework with SSR and SSG |
| **Database** | Supabase (PostgreSQL) | Open-source Firebase alternative with RLS |
| **Authentication** | Supabase Auth | Built-in auth with email/OAuth |
| **Styling** | Tailwind CSS 4 | Utility-first CSS framework |
| **UI Components** | shadcn/ui | Accessible component library |
| **Forms** | React Hook Form + Zod | Type-safe form validation |
| **State Management** | TanStack Query | Server state management & caching |
| **Progressive Web App** | next-pwa | PWA capabilities |

### Architecture Highlights
- **React Server Components** for optimal performance
- **Row Level Security (RLS)** for fine-grained data access control
- **Edge Functions** for serverless operations (link preview fetching)
- **Soft deletes** for claim history audit trails
- **Claim splitting** for cost-sharing gifts

For detailed architecture information, see [CLAUDE.md](./CLAUDE.md).

---

## 📚 Project Structure

```
gifty/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── (auth)/         # Public auth pages (login, signup)
│   │   ├── (app)/          # Protected app pages (dashboard, wishlists, friends)
│   │   ├── globals.css     # Global styles and CSS variables
│   │   └── layout.tsx      # Root layout
│   ├── components/          # React components
│   │   ├── ui/             # shadcn/ui components
│   │   ├── wishlists/      # Wishlist-specific components
│   │   ├── friends/        # Friend management components
│   │   └── navigation/     # Nav components
│   ├── lib/                 # Utilities and helpers
│   │   ├── actions/        # Server actions (mutations)
│   │   ├── queries/        # TanStack Query hooks
│   │   ├── supabase/       # Supabase client configuration
│   │   └── utils.ts        # Utility functions
│   └── middleware.ts        # Auth middleware
├── supabase/
│   ├── migrations/          # Database schema migrations
│   └── functions/           # Edge functions
└── public/                  # Static assets
```

For more details, see [CLAUDE.md](./CLAUDE.md).

---

## 🎨 Design System

Gifty features a warm, playful aesthetic with:
- **Warm cream backgrounds** with coral accents
- **Soft shadows** for depth
- **Smooth animations** for delightful interactions
- **Accessible components** following WCAG guidelines

See [STYLE_GUIDE.md](./STYLE_GUIDE.md) for comprehensive design documentation.

---

## 🤝 Contributing

We'd love your contributions! Whether it's bug fixes, features, or documentation, see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines on how to get started.

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

---

## 🎬 Demo & Screenshots

Coming soon! Check back for demo videos and screenshots showcasing Gifty's features.

---

## 💬 Support & Feedback

- **Issues & Bug Reports:** [GitHub Issues](https://github.com/yourusername/gifty/issues)
- **Feature Requests:** [GitHub Discussions](https://github.com/yourusername/gifty/discussions)
- **Email Support:** [email protected]

---

**Made with ❤️ for gift-givers everywhere.**
