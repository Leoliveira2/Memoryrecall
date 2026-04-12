import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Flame, Brain, Plus, BookOpen, BarChart3, Zap, Eye, Moon, Sun } from "lucide-react";
import { toast } from "sonner";
import SessionScreen from "@/components/SessionScreen";

// ─── Types ────────────────────────────────────────────────────────────────
interface MemoryItem {
  id: string;
  title: string;
  content: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  tags: string[];
  nextReview: number;
  interval: number;
  easeFactor: number;
  history: { date: number; quality: number }[];
  created: number;
  encoding?: {
    ownWords?: string;
    association?: string;
    keyPoint?: string;
  };
  context?: {
    definition?: string;
    example?: string;
    importance?: string;
  };
  dayNumber?: number;
}

interface WellnessData {
  date: string;
  sleep: "poor" | "ok" | "good";
  stress: "low" | "medium" | "high";
  exercise: boolean;
}

interface SessionRecord {
  id: string;
  date: string;
  score: number;
  completed: boolean;
  challengeIndex: number;
}

// ─── Constants ────────────────────────────────────────────────────────────
const CATEGORIES = {
  study: { label: "Study", color: "#6EE7B7", icon: "📚" },
  work: { label: "Work", color: "#93C5FD", icon: "💼" },
  names: { label: "Names", color: "#FCA5A5", icon: "👤" },
  language: { label: "Language", color: "#FCD34D", icon: "🌐" },
  health: { label: "Health", color: "#D8B4FE", icon: "🩺" },
  procedures: { label: "Procedures", color: "#FB923C", icon: "⚙️" },
};

// ─── SM-2 Algorithm (Spaced Repetition) ────────────────────────────────────
function sm2(item: MemoryItem, quality: number) {
  let { interval, easeFactor } = item;
  if (quality < 3) {
    interval = 1;
  } else {
    if (interval === 1) interval = 3;
    else if (interval === 3) interval = 7;
    else interval = Math.round(interval * easeFactor);
  }
  easeFactor = Math.max(1.3, easeFactor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  return { interval, easeFactor, nextReview: Date.now() + interval * 86400000 };
}

// ─── Local Storage Hook ────────────────────────────────────────────────────
function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  };

  return [storedValue, setValue];
}

// ─── Main Home Component ────────────────────────────────────────────────────
export default function Home() {
  const [items, setItems] = useLocalStorage<MemoryItem[]>("mem_items", []);
  const [sessions, setSessions] = useLocalStorage<SessionRecord[]>("mem_sessions", []);
  const [wellness, setWellness] = useLocalStorage<WellnessData[]>("mem_wellness", []);
  const [streak, setStreak] = useLocalStorage<number>("mem_streak", 0);
  
  const [activeTab, setActiveTab] = useState("home");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showSession, setShowSession] = useState(false);
  const [showWellnessDialog, setShowWellnessDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<MemoryItem | null>(null);
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);
  
  const [formData, setFormData] = useState<{
    title: string;
    content: string;
    category: string;
    difficulty: "easy" | "medium" | "hard";
    tags: string;
    definition?: string;
    example?: string;
    importance?: string;
  }>({
    title: "",
    content: "",
    category: "study",
    difficulty: "medium",
    tags: "",
    definition: "",
    example: "",
    importance: "",
  });
  
  const [wellnessData, setWellnessData] = useState<WellnessData>({
    date: new Date().toDateString(),
    sleep: "ok",
    stress: "medium",
    exercise: false,
  });

  const today = new Date().toDateString();
  const todayWellness = wellness.find(w => w.date === today);
  const todaySessions = sessions.filter(s => s.date === today);
  const nextChallengeIndex = todaySessions.length % 4; // Rotate through 4 challenges
  const dueItems = items.filter(i => i.nextReview <= Date.now());
  const retentionRate = items.length > 0 
    ? Math.round(items.flatMap(i => i.history).filter(h => h.quality >= 3).length / Math.max(1, items.flatMap(i => i.history).length) * 100)
    : 0;

  const handleAddItem = () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error("Please fill in title and content");
      return;
    }

    const newItem: MemoryItem = {
      id: Date.now().toString(),
      title: formData.title,
      content: formData.content,
      category: formData.category,
      difficulty: formData.difficulty,
      tags: formData.tags.split(",").map(t => t.trim()).filter(Boolean),
      nextReview: Date.now(),
      interval: 1,
      easeFactor: 2.5,
      history: [],
      created: Date.now(),
      context: {
        definition: formData.definition || undefined,
        example: formData.example || undefined,
        importance: formData.importance || undefined,
      },
    };

    if (editingItem) {
      setItems(items.map(i => i.id === editingItem.id ? newItem : i));
      toast.success("Item updated successfully");
      setEditingItem(null);
    } else {
      setItems([...items, newItem]);
      toast.success("Item added to memory");
    }

    setFormData({ title: "", content: "", category: "study", difficulty: "medium", tags: "" });
    setShowAddDialog(false);
  };

  const handleDeleteItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
    toast.success("Item deleted");
  };

  const handleEditItem = (item: MemoryItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      content: item.content,
      category: item.category,
      difficulty: item.difficulty,
      tags: item.tags.join(", "),
    });
    setShowAddDialog(true);
  };

  const handleRateRecall = (itemId: string, quality: number) => {
    setItems(items.map(i => {
      if (i.id === itemId) {
        const update = sm2(i, quality);
        return {
          ...i,
          ...update,
          history: [...i.history, { date: Date.now(), quality }],
        };
      }
      return i;
    }));
  };

  const handleSaveWellness = () => {
    setWellness([...wellness.filter(w => w.date !== today), wellnessData]);
    toast.success("Wellness data saved");
    setShowWellnessDialog(false);
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-2">
              <Brain className="w-10 h-10 text-cyan-400" />
              Memory Lab
            </h1>
            <p className="text-gray-400">Train your memory with science-backed techniques</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-orange-500/20 border border-orange-500/50 rounded-lg px-4 py-2 flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-400" />
              <span className="text-white font-bold">{streak} day streak</span>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-800/50 border-slate-700 p-4">
            <div className="text-gray-400 text-sm mb-1">Retention Rate</div>
            <div className="text-3xl font-bold text-cyan-400">{retentionRate}%</div>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700 p-4">
            <div className="text-gray-400 text-sm mb-1">Due Today</div>
            <div className="text-3xl font-bold text-blue-400">{dueItems.length}</div>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700 p-4">
            <div className="text-gray-400 text-sm mb-1">Total Items</div>
            <div className="text-3xl font-bold text-purple-400">{items.length}</div>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700 p-4">
            <div className="text-gray-400 text-sm mb-1">Today's Challenges</div>
            <div className="text-3xl font-bold text-pink-400">{todaySessions.length}/4</div>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-slate-800/50 border border-slate-700 mb-6">
            <TabsTrigger value="home" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Home
            </TabsTrigger>
            <TabsTrigger value="items" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Items ({items.length})
            </TabsTrigger>
            <TabsTrigger value="review" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Review ({dueItems.length})
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Insights
            </TabsTrigger>
          </TabsList>

          {/* Home Tab */}
          <TabsContent value="home" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700 p-6">
              <h2 className="text-xl font-bold text-white mb-4">Daily Training</h2>
              <p className="text-gray-400 mb-6">Complete a training session to practice your memory with spaced repetition, active recall, and working memory drills.</p>
              <Button 
                onClick={() => {
                  setCurrentChallengeIndex(nextChallengeIndex);
                  setShowSession(true);
                }}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
              >
                <Zap className="w-4 h-4 mr-2" />
                Start Training Session (~7 min) - Challenge {nextChallengeIndex + 1}/4
              </Button>
            </Card>

            {!todayWellness && (
              <Card className="bg-slate-800/50 border-slate-700 p-6">
                <h2 className="text-xl font-bold text-white mb-4">Daily Check-In</h2>
                <p className="text-gray-400 mb-4">Track your wellness to correlate with memory performance.</p>
                <Button 
                  onClick={() => setShowWellnessDialog(true)}
                  variant="outline"
                  className="border-slate-600 text-white hover:bg-slate-700"
                >
                  <Sun className="w-4 h-4 mr-2" />
                  Complete Check-In
                </Button>
              </Card>
            )}

            {todaySessions.length > 0 && (
              <Card className="bg-green-500/10 border-green-500/30 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-green-400 mb-1">✓ Sessions Completed Today</h3>
                    <p className="text-gray-400">{todaySessions.length} of 4 challenges done</p>
                    <p className="text-gray-500 text-sm mt-2">Avg Score: {Math.round(todaySessions.reduce((a, s) => a + s.score, 0) / todaySessions.length)}%</p>
                  </div>
                  <Brain className="w-12 h-12 text-green-400 opacity-50" />
                </div>
              </Card>
            )}
          </TabsContent>

          {/* Items Tab */}
          <TabsContent value="items" className="space-y-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Memory Items</h2>
              <Button 
                onClick={() => {
                  setEditingItem(null);
                  setFormData({ title: "", content: "", category: "study", difficulty: "medium", tags: "" });
                  setShowAddDialog(true);
                }}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </div>

            {items.length === 0 ? (
              <Card className="bg-slate-800/50 border-slate-700 p-12 text-center">
                <Brain className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No items yet. Start by adding your first memory item!</p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {items.map(item => (
                  <Card key={item.id} className="bg-slate-800/50 border-slate-700 p-4 hover:border-slate-600 transition">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">{CATEGORIES[item.category as keyof typeof CATEGORIES]?.icon}</span>
                          <h3 className="text-lg font-bold text-white">{item.title}</h3>
                          <Badge variant="outline" className="text-xs">
                            {item.difficulty}
                          </Badge>
                        </div>
                        <p className="text-gray-400 text-sm mb-3">{item.content}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          {item.tags.map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleEditItem(item)}
                          className="border-slate-600 text-white hover:bg-slate-700"
                        >
                          Edit
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleDeleteItem(item.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Review Tab */}
          <TabsContent value="review" className="space-y-4">
            <h2 className="text-xl font-bold text-white mb-6">Items Due for Review</h2>
            
            {dueItems.length === 0 ? (
              <Card className="bg-slate-800/50 border-slate-700 p-12 text-center">
                <Brain className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <p className="text-gray-400">All caught up! No items due for review today.</p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {dueItems.map(item => (
                  <Card key={item.id} className="bg-slate-800/50 border-slate-700 p-4">
                    <div className="mb-4">
                      <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                      <p className="text-gray-400 text-sm mb-4">{item.content}</p>
                    </div>
                    <div className="flex gap-2">
                      {[
                        { q: 1, label: "Forgot", color: "bg-red-500/20 border-red-500/50 text-red-400" },
                        { q: 3, label: "Hard", color: "bg-yellow-500/20 border-yellow-500/50 text-yellow-400" },
                        { q: 4, label: "Good", color: "bg-blue-500/20 border-blue-500/50 text-blue-400" },
                        { q: 5, label: "Easy", color: "bg-green-500/20 border-green-500/50 text-green-400" },
                      ].map(btn => (
                        <Button
                          key={btn.q}
                          onClick={() => handleRateRecall(item.id, btn.q)}
                          className={`flex-1 border ${btn.color}`}
                          variant="outline"
                        >
                          {btn.label}
                        </Button>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            <h2 className="text-xl font-bold text-white mb-6">Your Progress</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-slate-800/50 border-slate-700 p-6">
                <h3 className="text-white font-bold mb-4">Category Breakdown</h3>
                <div className="space-y-3">
                  {Object.entries(CATEGORIES).map(([key, cat]) => {
                    const catItems = items.filter(i => i.category === key);
                    if (catItems.length === 0) return null;
                    const rate = catItems.length > 0
                      ? Math.round(catItems.flatMap(i => i.history).filter(h => h.quality >= 3).length / Math.max(1, catItems.flatMap(i => i.history).length) * 100)
                      : 0;
                    return (
                      <div key={key}>
                        <div className="flex justify-between mb-1">
                          <span className="text-gray-400 text-sm">{cat.icon} {cat.label}</span>
                          <span className="text-white font-bold">{rate}%</span>
                        </div>
                        <Progress value={rate} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700 p-6">
                <h3 className="text-white font-bold mb-4">Wellness Correlation</h3>
                {todayWellness ? (
                  <div className="space-y-2 text-sm text-gray-400">
                    <p>🌙 Sleep: <span className="text-white font-semibold capitalize">{todayWellness.sleep}</span></p>
                    <p>⚡ Stress: <span className="text-white font-semibold capitalize">{todayWellness.stress}</span></p>
                    <p>💪 Exercise: <span className="text-white font-semibold">{todayWellness.exercise ? "Yes" : "No"}</span></p>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">Complete your daily check-in to see correlations</p>
                )}
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add/Edit Item Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingItem ? "Edit Memory Item" : "Add New Memory Item"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Title</label>
              <Input
                placeholder="What do you want to remember?"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Content</label>
              <Textarea
                placeholder="Full description, definition, or procedure..."
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="bg-slate-700 border-slate-600 text-white min-h-24"
              />
            </div>
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Category</label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  {Object.entries(CATEGORIES).map(([key, cat]) => (
                    <SelectItem key={key} value={key} className="text-white">
                      {cat.icon} {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Difficulty</label>
              <Select value={formData.difficulty} onValueChange={(value) => setFormData({ ...formData, difficulty: value as "easy" | "medium" | "hard" })}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="easy" className="text-white">Easy</SelectItem>
                  <SelectItem value="medium" className="text-white">Medium</SelectItem>
                  <SelectItem value="hard" className="text-white">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Tags (comma-separated)</label>
              <Input
                placeholder="e.g. technique, important, review"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            <div className="border-t border-slate-700 pt-4">
              <p className="text-gray-400 text-xs mb-3 font-semibold">📚 DEEP ENCODING (Optional but Recommended)</p>
            </div>
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Definition / What is it?</label>
              <Textarea
                placeholder="Clear, concise definition or explanation..."
                value={formData.definition || ""}
                onChange={(e) => setFormData({ ...formData, definition: e.target.value })}
                className="bg-slate-700 border-slate-600 text-white min-h-16"
              />
            </div>
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Example / How to use?</label>
              <Textarea
                placeholder="Practical example or use case..."
                value={formData.example || ""}
                onChange={(e) => setFormData({ ...formData, example: e.target.value })}
                className="bg-slate-700 border-slate-600 text-white min-h-16"
              />
            </div>
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Importance / Why does it matter?</label>
              <Textarea
                placeholder="Why is this important? What's the benefit or consequence?..."
                value={formData.importance || ""}
                onChange={(e) => setFormData({ ...formData, importance: e.target.value })}
                className="bg-slate-700 border-slate-600 text-white min-h-16"
              />
            </div>
            <Button 
              onClick={handleAddItem}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
            >
              {editingItem ? "Update Item" : "Add Item"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Wellness Dialog */}
      <Dialog open={showWellnessDialog} onOpenChange={setShowWellnessDialog}>
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Daily Wellness Check-In</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-gray-400 text-sm mb-2 block">🌙 Sleep Quality</label>
              <div className="flex gap-2">
                {["poor", "ok", "good"].map(value => (
                  <Button
                    key={value}
                    variant={wellnessData.sleep === value ? "default" : "outline"}
                    onClick={() => setWellnessData({ ...wellnessData, sleep: value as any })}
                    className="flex-1"
                  >
                    {value.charAt(0).toUpperCase() + value.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-gray-400 text-sm mb-2 block">⚡ Stress Level</label>
              <div className="flex gap-2">
                {["low", "medium", "high"].map(value => (
                  <Button
                    key={value}
                    variant={wellnessData.stress === value ? "default" : "outline"}
                    onClick={() => setWellnessData({ ...wellnessData, stress: value as any })}
                    className="flex-1"
                  >
                    {value.charAt(0).toUpperCase() + value.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-gray-400 text-sm mb-2 block">💪 Did You Exercise?</label>
              <div className="flex gap-2">
                {[true, false].map(value => (
                  <Button
                    key={String(value)}
                    variant={wellnessData.exercise === value ? "default" : "outline"}
                    onClick={() => setWellnessData({ ...wellnessData, exercise: value })}
                    className="flex-1"
                  >
                    {value ? "Yes" : "No"}
                  </Button>
                ))}
              </div>
            </div>
            <Button 
              onClick={handleSaveWellness}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
            >
              Save Check-In
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Session Screen */}
      {showSession && (
        <SessionScreen
          items={items}
          setItems={setItems}
          dueItems={dueItems}
          dayNumber={currentChallengeIndex + 1}
          challengeIndex={currentChallengeIndex}
          onComplete={(sessionScore) => {
            const today = new Date().toDateString();
            const newSession: SessionRecord = {
              id: Date.now().toString(),
              date: today,
              score: sessionScore,
              completed: true,
              challengeIndex: currentChallengeIndex,
            };
            setSessions([...sessions, newSession]);
            setStreak(streak + 1);
            toast.success(`Session complete! Score: ${sessionScore}%`);
            setShowSession(false);
          }}
          onCancel={() => setShowSession(false)}
        />
      )}
    </div>
  );
}
