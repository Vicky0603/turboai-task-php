# 📝 Notes App - Frontend

A beautiful and modern notes-taking application built with Next.js 15, React 19, TypeScript, and DaisyUI.

![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black)
![React](https://img.shields.io/badge/React-19.1.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.1.14-38bdf8)
![DaisyUI](https://img.shields.io/badge/DaisyUI-5.2.3-5a67d8)

## ✨ Features

- 🎨 **Beautiful UI** - Modern design with DaisyUI (Latte theme)
- 📱 **Fully Responsive** - Mobile-first design with hamburger menu sidebar
- 🎤 **Voice Recording** - Speech-to-text with Web Speech API
- 📝 **Markdown Support** - Create lists and format text
- 🏷️ **Categories** - Organize notes by color-coded categories
- 🔐 **Secure Authentication** - JWT-based user authentication
- 🎯 **Real-time Updates** - Auto-save and instant updates
- 🌈 **Color-coded Notes** - Visual organization by category

## 🚀 Tech Stack

- **Framework:** Next.js 15 (App Router, Turbopack)
- **UI Library:** React 19
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 + DaisyUI
- **Icons:** Lucide React
- **API Client:** Axios
- **Authentication:** JWT (json-decode)
- **Markdown:** React Markdown

## 📋 Prerequisites

- Node.js 18+ or pnpm 8+
- Backend API running (see `../backend/README.md`)

## 🛠️ Installation

1. **Install dependencies:**

   ```bash
   pnpm install
   ```

2. **Create environment file:**

   Create a `.env.local` file in the frontend directory:

   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000/api
   ```

## 🏃 Running the App

### Development Mode

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
pnpm build
pnpm start
```

### Running Tests

```bash
# Run all tests
pnpm test

# Watch mode (re-run on changes)
pnpm test:watch

# Coverage report
pnpm test:coverage
```

**Test Results:** ✅ 29 tests passing

See [TESTING.md](./TESTING.md) for detailed testing documentation.

## 📁 Project Structure

```
frontend/
├── app/                      # Next.js app router
│   ├── dashboard/           # Dashboard page
│   ├── login/               # Login page
│   ├── signup/              # Signup page
│   ├── note/[id]/           # Note editor page
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Home/redirect page
│   └── globals.css          # Global styles
├── components/              # Reusable components (empty for now)
├── contexts/                # React contexts
│   └── AuthContext.tsx      # Authentication context
├── lib/                     # Utilities
│   └── api.ts              # Axios instance with JWT
├── types/                   # TypeScript types
│   └── index.ts            # Global type definitions
├── public/                  # Static assets
│   ├── cat-signup.svg      # Signup illustration
│   └── signin_cactus.svg   # Login illustration
└── README.md               # This file
```

## 🎨 Key Features

### Authentication

- **Sign Up:** Email + Password (auto-generates username)
- **Sign In:** Email + Password with JWT tokens
- **Auto-redirect:** Logged-in users → Dashboard, logged-out → Signup
- **Token Refresh:** Automatic token renewal

### Notes Management

- **Create:** Click "+ New Note" button
- **Edit:** Click on any note card
- **Delete:** Delete button in note editor
- **Auto-save:** Shows "Last Edited" timestamp
- **Categories:** Filter by category or view all notes

### Voice Recording 🎤

- Click the phone icon in note editor
- Browser requests microphone permission
- Speak and see text appear in real-time
- Click red button to stop recording
- **Language:** English (US) by default
- **Requires:** Internet connection (Web Speech API)

### Markdown Support

Create lists in your notes:

**Bullet lists:**

```
- Item 1
- Item 2
- Item 3
```

**Numbered lists:**

```
1. First item
2. Second item
3. Third item
```

### Responsive Design 📱

The app is fully responsive and optimized for all screen sizes:

**Mobile (< 768px):**

- Sidebar hidden by default
- Hamburger menu (☰) button in top-left
- Slide-in sidebar with smooth animation
- Overlay backdrop when menu is open
- Compact header with "+ New" button
- Smaller illustrations and text
- Touch-friendly button sizes

**Tablet (768px - 1024px):**

- Persistent sidebar (always visible)
- 2-column note grid
- Optimized spacing

**Desktop (> 1024px):**

- Full sidebar with categories
- 3-4 column note grid
- Larger illustrations
- Full-size buttons and text

**Breakpoints:**

- `sm`: 640px
- `md`: 768px (sidebar visibility toggle)
- `lg`: 1024px
- `xl`: 1280px

## 🎨 Styling

### DaisyUI Theme

Using the **Latte** theme (light, warm colors):

- Peach (#ffc6a5)
- Yellow (#fff5cc)
- Mint (#b5e7e3)

### Customization

Edit `app/globals.css` to customize colors:

```css
@theme {
  --color-peach: #ffc6a5;
  --color-yellow: #fff5cc;
  --color-mint: #b5e7e3;
}
```

## 🔧 Configuration

### API URL

Update the backend URL in `.env.local`:

```env
NEXT_PUBLIC_API_URL=https://your-backend-url.com/api
```

### Speech Recognition Language

Edit `app/note/[id]/page.tsx`:

```typescript
recognitionInstance.lang = "en-US"; // Change to "pt-BR", "es-ES", etc.
```

## 📦 Dependencies

### Core

- `next` - React framework
- `react` & `react-dom` - UI library
- `typescript` - Type safety

### UI & Styling

- `tailwindcss` - Utility-first CSS
- `daisyui` - Component library
- `lucide-react` - Icon library

### Utilities

- `axios` - HTTP client
- `jwt-decode` - JWT token parsing
- `react-markdown` - Markdown rendering

## 🐛 Troubleshooting

### Voice Recording Not Working

1. **Check browser:** Use Chrome or Edge (Firefox not supported)
2. **Check permissions:** Allow microphone access
3. **Check internet:** Web Speech API requires connection
4. **Check HTTPS:** Production must use HTTPS

### API Connection Issues

1. **Backend running?** Check `http://localhost:8000/api/`
2. **CORS errors?** Backend must allow frontend origin
3. **Check .env.local:** Verify `NEXT_PUBLIC_API_URL`

### Build Errors

1. **Clear cache:**

   ```bash
   rm -rf .next
   pnpm install
   pnpm dev
   ```

2. **Check Node version:**
   ```bash
   node --version  # Should be 18+
   ```

## 🚀 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project on [Vercel](https://vercel.com)
3. Add environment variable:
   - `NEXT_PUBLIC_API_URL` = Your backend API URL
4. Deploy!

### Other Platforms

Build the production bundle:

```bash
pnpm build
```

Deploy the `.next` folder to your hosting provider.

## 📝 Environment Variables

| Variable              | Description     | Example                     |
| --------------------- | --------------- | --------------------------- |
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:8000/api` |

## 🎯 Page Titles

Each page has a custom browser tab title:

- **/** → "Notes App"
- **/signup** → "Sign Up | Notes App"
- **/login** → "Sign In | Notes App"
- **/dashboard** → "Dashboard | Notes App"
- **/note/new** → "New Note | Notes App"
- **/note/[id]** → "Edit Note | Notes App"

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [DaisyUI Components](https://daisyui.com/components/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 💡 Tips

1. **Use Turbopack:** Already enabled for faster development
2. **Enable Auto-save:** Notes auto-save when you click "Save"
3. **Keyboard Shortcuts:** Browser keyboard shortcuts work (Ctrl+F, etc.)
4. **Mobile Friendly:** Full responsive design
5. **Dark Mode:** Not implemented (using Latte theme only)

## 🆘 Support

If you encounter any issues:

1. Check console errors (F12)
2. Verify backend is running
3. Check network tab for API calls
4. Review error messages in browser

---

**Made with ❤️ using Next.js and React**
