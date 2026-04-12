# 🧠 Memory Lab - Advanced Memory Training System

A comprehensive, science-backed memory training application built with React and TypeScript. Memory Lab combines **Spaced Repetition (SM-2)**, **Active Recall**, **Working Memory Training**, and **Wellness Integration** to help you improve your short-term, medium-term, and long-term memory.

🔗 **Live Demo:** https://3000-io1htz5efwsdt44y7go9n-49b24959.us2.manus.computer

---

## ✨ Core Features

### Memory Training Methods
- **📚 Spaced Repetition (SM-2)** — Scientifically-proven algorithm to optimize review intervals
- **🎯 Active Recall** — Test yourself without looking at the source material
- **⚡ Working Memory Drills** — Four progressive challenge types (Colors → Numbers → Words → Patterns)
- **🧠 Deep Encoding** — Add context (Definition, Example, Importance, Vivid Cues) for stronger retention

### Flexible Training Modes
- **Recovery Mode** — Lighter sessions (3 new items, 5 reviews, light intensity)
- **Balanced Mode** — Standard training (5 new items, 10 reviews, standard intensity) — **Recommended**
- **Stretch Mode** — Advanced sessions (8 new items, 15 reviews, high intensity)

### Memory Item Management
- ✅ Add, edit, and delete memory items
- 🏷️ Organize by 6 categories (Study, Work, Names, Language, Health, Procedures)
- 📊 Track difficulty levels (Easy, Medium, Hard)
- 🔖 Tag items for better organization
- 🎨 Memory Palace support (associate items with physical locations)
- 📝 Source tracking (Manual, Capture, Curriculum)

### 30-Day Curriculum
Pre-loaded curriculum covering memory techniques, neuroscience, and practical applications:
- **Days 1-10:** Memory Techniques (Spaced Repetition, Active Recall, Chunking, Memory Palace, etc.)
- **Days 11-20:** Neuroscience of Memory (Hippocampus, Synaptic Plasticity, LTP, Neurotransmitters, etc.)
- **Days 21-30:** Practical Applications (Languages, Names, Numbers, Skills, Stress Management, etc.)

### Daily Wellness Tracking
- 🌙 Sleep quality monitoring (Poor / OK / Good)
- ⚡ Stress level tracking (Low / Medium / High)
- 💪 Exercise logging (Yes / No)
- 📊 Correlate wellness with memory performance

### Progress & Analytics
- 🔥 Streak counter for daily consistency
- 📈 Retention rate dashboard
- 📊 Category-wise performance breakdown
- 🏆 Session scores and history
- 📉 Learning curves and weak areas

---

## 🛠️ Tech Stack

- **Frontend:** React 19 + TypeScript
- **UI Components:** shadcn/ui + Radix UI
- **Styling:** Tailwind CSS 4
- **State Management:** React Hooks
- **Routing:** Wouter
- **Notifications:** Sonner
- **Build Tool:** Vite
- **Package Manager:** pnpm

---

## 🚀 Getting Started

### Installation

```bash
# Clone the repository
git clone https://github.com/Leoliveira2/Memoryrecall.git
cd Memoryrecall

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

The app will be available at `http://localhost:3000`

### First Steps

1. **Daily Check-In** — Track your sleep, stress, and exercise
2. **Add Items** — Create memory items with deep encoding context
3. **Start Training** — Begin a session (choose Recovery/Balanced/Stretch mode)
4. **Review Progress** — Check your retention rate and insights

---

## 📚 How to Use

### Adding Memory Items

1. Click **"+ Add Item"** button
2. Fill in:
   - **Title** — What you want to remember
   - **Content** — Full description
   - **Category** — Study, Language, Procedures, Health, etc.
   - **Difficulty** — Easy / Medium / Hard
3. (Optional) Add **Deep Encoding** context:
   - Definition — What is it?
   - Example — How to use it?
   - Importance — Why does it matter?
   - Memory Palace — Associate with a location
   - Vivid Cue — Create a memorable association
4. Click **"Add Item"**

### Training Session Flow

Each session includes 6 phases:

1. **Check-in** — Confirm you're ready and select training mode
2. **Learn** — Study new/recent items carefully
3. **Recall** — Test your memory (active recall)
4. **Working Memory** — Challenge your working memory with:
   - 🎨 Colors (Days 1-10)
   - 🔢 Numbers (Days 11-20)
   - 📝 Words (Days 21-30)
   - 🎭 Patterns (Days 21-30)
5. **Review** — Revisit items scheduled for spaced repetition
6. **Summary** — See your session score and progress

### Session Modes

| Mode | New Items | Reviews | Intensity | Best For |
|------|-----------|---------|-----------|----------|
| **Recovery** | 3 | 5 | Light | Busy days, low energy |
| **Balanced** | 5 | 10 | Standard | Daily training (recommended) |
| **Stretch** | 8 | 15 | High | Intensive learning |

---

## 🧠 Memory Science Behind the App

### Spaced Repetition (SM-2)
Based on Hermann Ebbinghaus's "Forgetting Curve," the SM-2 algorithm schedules reviews at optimal intervals to maximize long-term retention. Items you struggle with appear sooner; mastered items appear less frequently.

### Active Recall
Testing yourself is far more effective than passive review. Each session forces you to retrieve information from memory, strengthening neural pathways.

### Working Memory Training
Working memory (short-term memory capacity) can be improved through targeted exercises. Memory Lab includes dynamic challenges to strengthen this cognitive ability.

### Deep Encoding
Connecting new information to existing knowledge through elaboration creates stronger, more retrievable memories. Adding context (definition, example, importance) significantly improves retention.

### Wellness Correlation
Sleep consolidates memories, stress impairs recall, and exercise improves cognitive function. Memory Lab tracks these relationships to help you optimize your learning environment.

---

## 📊 Dashboard

### Home Tab
- **Retention Rate** — Overall success percentage
- **Due Today** — Items scheduled for review
- **Total Items** — All items in your collection
- **Today's Challenges** — Progress on daily working memory challenges

### Items Tab
- View all memory items
- Edit or delete items
- Filter by category or difficulty
- See review history and learning curves

### Review Tab
- Items due for review
- Quick review interface
- Spaced repetition scheduling
- Performance tracking

### Insights Tab
- **Category Breakdown** — Performance by topic
- **Wellness Correlation** — Sleep/stress/exercise impact
- **Streak Tracking** — Consecutive training days
- **Learning Analytics** — Progress over time

---

## 🎮 Working Memory Challenges

### Challenge Types

**Colors (Sequence)**
- Remember a sequence of colored circles
- Recall by clicking in the correct order
- Difficulty: Easy (5 items)
- Days: 1-10

**Numbers**
- Memorize a sequence of digits
- Recall by clicking in the correct order
- Difficulty: Medium (6 items)
- Days: 11-20

**Words**
- Hold vocabulary words in mind
- Recall by clicking in the correct order
- Difficulty: Hard (4 items)
- Days: 21-30

**Patterns**
- Remember complex emoji patterns with repetitions
- Recall by clicking each item the correct number of times
- Difficulty: Hard (6 items with repetitions)
- Days: 21-30

---

## 📁 Project Structure

```
client/
├── src/
│   ├── pages/
│   │   └── Home.tsx              # Main application page
│   ├── components/
│   │   ├── SessionScreen.tsx     # Training session component
│   │   └── ui/                   # shadcn/ui components
│   ├── lib/
│   │   └── curriculum30days.ts   # 30-day curriculum data
│   ├── App.tsx                   # App router and layout
│   ├── main.tsx                  # React entry point
│   └── index.css                 # Global styles and theme
├── public/                       # Static assets
└── index.html                    # HTML template

server/
└── index.ts                      # Express server (production)
```

---

## 💾 Data Storage

All data is stored locally in your browser's `localStorage`:
- Memory items with full history
- Training sessions and scores
- Wellness data
- User preferences

**Features:**
- ✅ No data sent to external servers
- ✅ Works completely offline
- ✅ Data persists between sessions
- ⚠️ Clearing browser cache will delete data

**Recommendation:** Regularly backup your data (export feature coming soon)

---

## 🔧 Configuration

### Customize Categories
Edit the `CATEGORIES` object in `client/src/pages/Home.tsx`:

```typescript
const CATEGORIES = {
  study: { label: "Study", icon: "📚" },
  work: { label: "Work", icon: "💼" },
  names: { label: "Names & Faces", icon: "👤" },
  language: { label: "Language", icon: "🌍" },
  health: { label: "Health", icon: "🏥" },
  procedures: { label: "Procedures", icon: "⚙️" },
};
```

### Adjust SM-2 Parameters
Modify the `sm2()` function in `client/src/components/SessionScreen.tsx` to customize:
- Initial ease factor
- Interval multipliers
- Minimum ease factor

---

## 🌙 Theme & Design

Memory Lab features:
- **Dark Theme** — Optimized for focus and reduced eye strain
- **Deep Slate Backgrounds** — Calming and professional
- **Cyan & Blue Accents** — Modern and energetic
- **High Contrast Text** — Excellent readability
- **Smooth Animations** — Polished user experience

---

## 📱 Responsive Design

Memory Lab works seamlessly on:
- ✅ Desktop browsers (Chrome, Firefox, Safari, Edge)
- ✅ Tablets (iPad, Android tablets)
- ✅ Mobile phones (iOS, Android)

---

## 🚀 Future Enhancements

- [ ] Cloud sync across devices
- [ ] User authentication
- [ ] FSRS algorithm (advanced spaced repetition)
- [ ] AI-generated quiz questions
- [ ] Mobile app (React Native)
- [ ] Social features (share progress, compete)
- [ ] Advanced analytics and visualizations
- [ ] Customizable memory palace templates
- [ ] Audio/video content support
- [ ] Export/import functionality
- [ ] Dark/light theme toggle
- [ ] Multiple languages

---

## 🤝 Contributing

Contributions are welcome! Please feel free to:
- Report bugs
- Suggest features
- Submit pull requests
- Share feedback

---

## 📄 License

MIT License — Feel free to use this project for personal or commercial purposes.

---

## 👨‍💻 Author

Created with ❤️ by **Leo Oliveira** using **Manus AI**

---

## 📞 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check the documentation above
- Review code comments for technical details

---

**Start training your memory today!** 🧠✨

**Remember:** Consistency is key. Train for just 7 minutes daily to see remarkable improvements in your memory over weeks and months.
