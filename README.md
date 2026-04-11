# 🧠 Memory Lab - Train Your Memory with Science

A modern, science-backed memory training application built with React and TypeScript. Memory Lab combines **Spaced Repetition**, **Active Recall**, and **Working Memory Drills** to help you improve your short-term, medium-term, and long-term memory.

## 🚀 Live Demo

**Try Memory Lab now:** https://3000-io1htz5efwsdt44y7go9n-49b24959.us2.manus.computer

## ✨ Features

### Core Memory Training
- **📚 Spaced Repetition (SM-2)** - Scientifically-proven algorithm to optimize review intervals
- **🎯 Active Recall** - Test yourself on learned material without looking at the source
- **⚡ Working Memory Drills** - Dynamic challenges with sequences, numbers, and patterns
- **🔁 Intelligent Review Queue** - Only review items that are due, based on your performance

### Memory Item Management
- ✅ Add, edit, and delete memory items
- 🏷️ Organize by categories (Study, Work, Names, Language, Health, Procedures)
- 📊 Track difficulty levels (Easy, Medium, Hard)
- 🔖 Tag items for better organization
- 📈 View retention rate per category

### Daily Wellness Tracking
- 🌙 Sleep quality monitoring
- ⚡ Stress level tracking
- 💪 Exercise logging
- 📊 Correlate wellness with memory performance

### Progress & Insights
- 🔥 Streak counter for daily consistency
- 📈 Retention rate dashboard
- 📊 Category-wise performance breakdown
- 🏆 Session scores and history

## 🛠️ Tech Stack

- **Frontend:** React 19 + TypeScript
- **Styling:** Tailwind CSS 4 + shadcn/ui
- **Storage:** LocalStorage (client-side persistence)
- **Build:** Vite
- **Package Manager:** pnpm

## 📋 How It Works

### The Training Session (7 minutes)
1. **Learn Phase** - Study your last 3 added items carefully
2. **Recall Phase** - Test yourself on what you remember
3. **Working Memory Drill** - Quick challenge to train working memory
4. **Review Phase** - Review items due for spaced repetition
5. **Summary** - See your session score and progress

### The SM-2 Algorithm
Memory Lab uses the **SM-2 (Spaced Repetition) Algorithm** to optimize when you should review each item:
- Items you struggle with appear sooner
- Items you master appear less frequently
- The system adapts based on your performance
- Intervals increase exponentially for mastered items

## 🚀 Getting Started

### Option 1: Run Locally

```bash
# Clone the repository
git clone https://github.com/Leoliveira2/Memoryrecall.git
cd Memoryrecall

# Install dependencies
pnpm install

# Start development server
pnpm dev

# Open http://localhost:3000 in your browser
```

### Option 2: Build for Production

```bash
# Build the project
pnpm build

# Preview production build
pnpm preview
```

## 📁 Project Structure

```
client/
├── src/
│   ├── pages/
│   │   └── Home.tsx          # Main application page
│   ├── components/
│   │   └── SessionScreen.tsx # Training session component
│   ├── App.tsx               # App router and layout
│   ├── main.tsx              # React entry point
│   └── index.css             # Global styles and theme
├── public/                   # Static assets
└── index.html               # HTML template

server/
└── index.ts                 # Express server (production)
```

## 🎯 Usage Guide

### Adding a Memory Item
1. Go to the **Items** tab
2. Click **Add Item**
3. Fill in:
   - **Title** - What you want to remember
   - **Content** - Full description or definition
   - **Category** - Choose from 6 categories
   - **Difficulty** - Easy, Medium, or Hard
   - **Tags** - Comma-separated keywords
4. Click **Add Item**

### Starting a Training Session
1. Click **Start Training Session** on the Home tab
2. Go through each phase:
   - Learn the items
   - Test your recall
   - Complete the working memory drill
   - Review due items
3. Rate your performance (Forgot, Hard, Good, Easy)
4. Get your session score

### Tracking Wellness
1. Complete the **Daily Check-In**
2. Log your sleep quality, stress level, and exercise
3. Memory Lab will correlate this with your memory performance

### Viewing Insights
1. Go to the **Insights** tab
2. See retention rates by category
3. Check wellness correlations
4. Identify items that need more practice

## 📊 Key Metrics

- **Retention Rate** - Percentage of items you remember correctly
- **Due Today** - Number of items ready for review
- **Total Items** - All items in your memory database
- **Sessions** - Number of training sessions completed
- **Streak** - Consecutive days of training

## 🧠 Memory Science Behind Memory Lab

Memory Lab is built on evidence-based memory techniques:

### Spaced Repetition
Reviewing information at increasing intervals moves it from short-term to long-term memory. The SM-2 algorithm optimizes these intervals based on your performance.

### Active Recall
Testing yourself is far more effective than re-reading. Memory Lab forces you to retrieve information from memory without looking at the source.

### Working Memory Training
Working memory (short-term memory capacity) can be improved through targeted exercises. Memory Lab includes dynamic challenges to strengthen this cognitive ability.

### Wellness Integration
Sleep, stress, and exercise significantly impact memory consolidation. Memory Lab tracks these factors to help you understand how your lifestyle affects your learning.

## 🔧 Configuration

### Customize Categories
Edit the `CATEGORIES` object in `client/src/pages/Home.tsx`:

```typescript
const CATEGORIES = {
  study: { label: "Study", color: "#6EE7B7", icon: "📚" },
  // Add more categories...
};
```

### Adjust SM-2 Parameters
Modify the `sm2()` function in `client/src/components/SessionScreen.tsx` to change:
- Initial ease factor
- Interval multipliers
- Minimum ease factor

## 🌙 Dark Theme

Memory Lab uses a sophisticated dark theme optimized for focus and reduced eye strain:
- Deep slate backgrounds
- Cyan and blue accent colors
- High contrast text for readability
- Smooth transitions and animations

## 📱 Responsive Design

Memory Lab works on:
- ✅ Desktop browsers
- ✅ Tablets
- ✅ Mobile phones

## 💾 Data Storage

All data is stored locally in your browser using **LocalStorage**:
- ✅ No data sent to external servers
- ✅ Works completely offline
- ✅ Data persists between sessions
- ⚠️ Clearing browser cache will delete data

**Recommendation:** Regularly export your data as backup (feature coming soon)

## 🚀 Future Features

- 📊 Advanced analytics and charts
- 🎤 Voice recording for active recall
- 🤖 AI-powered quiz generation
- 📱 Mobile app (React Native)
- ☁️ Cloud sync across devices
- 🔔 Smart notifications
- 🎨 Customizable themes
- 📚 Shared learning decks

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests
- Share feedback

## 📄 License

MIT License - Feel free to use this project for personal or commercial purposes.

## 👨‍💻 Author

Created with ❤️ by **Manus AI** for **Leo Oliveira**

## 📞 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check the documentation above
- Review the code comments for technical details

---

**Start training your memory today!** 🧠✨

Remember: Consistency is key. Train for just 7 minutes daily to see remarkable improvements in your memory over weeks and months.
