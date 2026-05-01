import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Brain, Flame, Plus, BookOpen, BarChart3, Zap, Eye, Moon, Sun, Inbox } from "lucide-react";
import { toast } from "sonner";
import SessionScreen from "@/components/SessionScreen";
import HelpGuide from "@/components/HelpGuide";
import CloudSyncPanel from "@/components/CloudSyncPanel";
import { CURRICULUM_30_DAYS } from "@/lib/curriculum30days";

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
    vividCue?: string;
  };
  context?: {
    definition?: string;
    example?: string;
    importance?: string;
  };
  memoryPalace?: {
    palaceId?: string;
    palaceName?: string;
    locus?: string;
  };
  dayNumber?: number;
  sourceType?: "manual" | "capture" | "curriculum";
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

interface QuickCapture {
  id: string;
  title: string;
  note: string;
  created: number;
}

interface JournalEntry {
  id: string;
  date: string;
  hardest: string;
  easiest: string;
  strategy: string;
  note?: string;
}

interface MemoryPalace {
  id: string;
  name: string;
  loci: string[];
  created: number;
}

interface SessionPlan {
  mode: "recovery" | "balanced" | "stretch";
  label: string;
  newItemsTarget: number;
  reviewLimit: number;
  wmIntensity: "light" | "standard" | "stretch";
  note: string;
}

const CATEGORIES = {
  study: { label: "Study", color: "#6EE7B7", icon: "📚" },
  work: { label: "Work", color: "#93C5FD", icon: "💼" },
  names: { label: "Names", color: "#FCA5A5", icon: "👤" },
  language: { label: "Language", color: "#FCD34D", icon: "🌐" },
  health: { label: "Health", color: "#D8B4FE", icon: "🩺" },
  procedures: { label: "Procedures", color: "#FB923C", icon: "⚙️" },
};

const DEFAULT_LOCI = [
  "Front Door",
  "Entrance Hall",
  "Living Room",
  "Sofa",
  "Kitchen",
  "Dining Table",
  "Bedroom",
  "Desk",
  "Bathroom",
  "Balcony",
];

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

function computeStreak(sessions: SessionRecord[]) {
  const uniqueDates = Array.from(new Set(sessions.map((s) => s.date)));
  const today = new Date();
  let streak = 0;
  for (let offset = 0; offset < 365; offset += 1) {
    const probe = new Date(today.getTime());
    probe.setDate(today.getDate() - offset);
    const label = probe.toDateString();
    if (uniqueDates.includes(label)) {
      streak += 1;
    } else {
      break;
    }
  }
  return streak;
}

function getAdaptivePlan(wellness?: WellnessData): SessionPlan {
  if (!wellness) {
    return {
      mode: "balanced",
      label: "Balanced mode",
      newItemsTarget: 2,
      reviewLimit: 5,
      wmIntensity: "standard",
      note: "Complete the wellness check-in to personalize session load.",
    };
  }

  if (wellness.sleep === "poor" || wellness.stress === "high") {
    return {
      mode: "recovery",
      label: "Recovery mode",
      newItemsTarget: 1,
      reviewLimit: 4,
      wmIntensity: "light",
      note: "Lower cognitive load today: fewer new items, shorter review queue, lighter working-memory demand.",
    };
  }

  if (wellness.sleep === "good" && wellness.stress === "low" && wellness.exercise) {
    return {
      mode: "stretch",
      label: "Stretch mode",
      newItemsTarget: 3,
      reviewLimit: 6,
      wmIntensity: "stretch",
      note: "Strong physiology today: expand learning load and use a harder working-memory drill.",
    };
  }

  return {
    mode: "balanced",
    label: "Balanced mode",
    newItemsTarget: 2,
    reviewLimit: 5,
    wmIntensity: "standard",
    note: "Steady load: keep new learning and review in a sustainable range.",
  };
}

function getLearnCandidates(items: MemoryItem[], target: number) {
  const now = Date.now();
  const sorted = [...items].sort((a, b) => {
    const aNewness = a.history.length === 0 ? 1 : 0;
    const bNewness = b.history.length === 0 ? 1 : 0;
    if (aNewness !== bNewness) return bNewness - aNewness;
    if (a.history.length !== b.history.length) return a.history.length - b.history.length;
    return b.created - a.created;
  });

  const notDue = sorted.filter((item) => item.nextReview > now || item.history.length === 0);
  return (notDue.length ? notDue : sorted).slice(0, target);
}

function getSuggestedLessonIndex(completedSessionDays: number) {
  return Math.min(completedSessionDays, CURRICULUM_30_DAYS.length - 1);
}

export default function Home() {
  const [items, setItems] = useLocalStorage<MemoryItem[]>("mem_items", []);
  const [sessions, setSessions] = useLocalStorage<SessionRecord[]>("mem_sessions", []);
  const [wellness, setWellness] = useLocalStorage<WellnessData[]>("mem_wellness", []);
  const [captures, setCaptures] = useLocalStorage<QuickCapture[]>("mem_capture_inbox", []);
  const [journalEntries, setJournalEntries] = useLocalStorage<JournalEntry[]>("mem_journal", []);
  const [palaces, setPalaces] = useLocalStorage<MemoryPalace[]>("mem_palaces", []);

  const [activeTab, setActiveTab] = useState("home");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showSession, setShowSession] = useState(false);
  const [showWellnessDialog, setShowWellnessDialog] = useState(false);
  const [showCaptureDialog, setShowCaptureDialog] = useState(false);
  const [showJournalDialog, setShowJournalDialog] = useState(false);
  const [showPalaceDialog, setShowPalaceDialog] = useState(false);
  const [showCloudSyncPanel, setShowCloudSyncPanel] = useState(false);
  const [editingItem, setEditingItem] = useState<MemoryItem | null>(null);
  const [revealedReviewId, setRevealedReviewId] = useState<string | null>(null);
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "study",
    difficulty: "medium" as "easy" | "medium" | "hard",
    tags: "",
    ownWords: "",
    association: "",
    keyPoint: "",
    vividCue: "",
    definition: "",
    example: "",
    importance: "",
    palaceId: "__none__",
    locus: "",
  });

  const [wellnessData, setWellnessData] = useState<WellnessData>({
    date: new Date().toDateString(),
    sleep: "ok",
    stress: "medium",
    exercise: false,
  });

  const [captureForm, setCaptureForm] = useState({ title: "", note: "" });
  const [journalForm, setJournalForm] = useState({ hardest: "", easiest: "", strategy: "", note: "" });
  const [palaceForm, setPalaceForm] = useState({ name: "", loci: DEFAULT_LOCI.join(", ") });

  const today = new Date().toDateString();
  const todayWellness = wellness.find((w) => w.date === today);
  const todaySessions = sessions.filter((s) => s.date === today);
  const dueItems = useMemo(() => [...items].filter((i) => i.nextReview <= Date.now()).sort((a, b) => a.nextReview - b.nextReview), [items]);
  const retentionRate = useMemo(() => {
    const allHistory = items.flatMap((i) => i.history);
    return allHistory.length ? Math.round((allHistory.filter((h) => h.quality >= 3).length / allHistory.length) * 100) : 0;
  }, [items]);
  const streak = useMemo(() => computeStreak(sessions), [sessions]);
  const adaptivePlan = useMemo(() => getAdaptivePlan(todayWellness), [todayWellness]);
  const learnCandidates = useMemo(() => getLearnCandidates(items, adaptivePlan.newItemsTarget), [items, adaptivePlan.newItemsTarget]);
  const uniqueSessionDays = useMemo(() => Array.from(new Set(sessions.map((s) => s.date))).length, [sessions]);
  const suggestedLesson = CURRICULUM_30_DAYS[getSuggestedLessonIndex(uniqueSessionDays)];
  const nextChallengeIndex = todaySessions.length % 4;
  const recentJournalEntries = [...journalEntries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 4);
  const reviewLimitLabel = `${Math.min(dueItems.length, adaptivePlan.reviewLimit)} due cards`;

  const resetItemForm = () => {
    setFormData({
      title: "",
      content: "",
      category: "study",
      difficulty: "medium",
      tags: "",
      ownWords: "",
      association: "",
      keyPoint: "",
      vividCue: "",
      definition: "",
      example: "",
      importance: "",
      palaceId: "__none__",
      locus: "",
    });
    setEditingItem(null);
  };

  const handleAddOrUpdateItem = () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error("Please fill in title and content");
      return;
    }

    const selectedPalace = palaces.find((p) => p.id === formData.palaceId);

    if (editingItem) {
      const updatedItem: MemoryItem = {
        ...editingItem,
        title: formData.title.trim(),
        content: formData.content.trim(),
        category: formData.category,
        difficulty: formData.difficulty,
        tags: formData.tags.split(",").map((t) => t.trim()).filter(Boolean),
        encoding: {
          ownWords: formData.ownWords || undefined,
          association: formData.association || undefined,
          keyPoint: formData.keyPoint || undefined,
          vividCue: formData.vividCue || undefined,
        },
        context: {
          definition: formData.definition || undefined,
          example: formData.example || undefined,
          importance: formData.importance || undefined,
        },
        memoryPalace: selectedPalace
          ? { palaceId: selectedPalace.id, palaceName: selectedPalace.name, locus: formData.locus || undefined }
          : undefined,
      };
      setItems(items.map((item) => (item.id === editingItem.id ? updatedItem : item)));
      toast.success("Item updated without resetting review history");
    } else {
      const newItem: MemoryItem = {
        id: Date.now().toString(),
        title: formData.title.trim(),
        content: formData.content.trim(),
        category: formData.category,
        difficulty: formData.difficulty,
        tags: formData.tags.split(",").map((t) => t.trim()).filter(Boolean),
        nextReview: Date.now(),
        interval: 1,
        easeFactor: 2.5,
        history: [],
        created: Date.now(),
        encoding: {
          ownWords: formData.ownWords || undefined,
          association: formData.association || undefined,
          keyPoint: formData.keyPoint || undefined,
          vividCue: formData.vividCue || undefined,
        },
        context: {
          definition: formData.definition || undefined,
          example: formData.example || undefined,
          importance: formData.importance || undefined,
        },
        memoryPalace: selectedPalace
          ? { palaceId: selectedPalace.id, palaceName: selectedPalace.name, locus: formData.locus || undefined }
          : undefined,
        sourceType: "manual",
      };
      setItems([newItem, ...items]);
      toast.success("Item added with deeper encoding and optional palace mapping");
    }

    resetItemForm();
    setShowAddDialog(false);
  };

  const handleEditItem = (item: MemoryItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      content: item.content,
      category: item.category,
      difficulty: item.difficulty,
      tags: item.tags.join(", "),
      ownWords: item.encoding?.ownWords || "",
      association: item.encoding?.association || "",
      keyPoint: item.encoding?.keyPoint || "",
      vividCue: item.encoding?.vividCue || "",
      definition: item.context?.definition || "",
      example: item.context?.example || "",
      importance: item.context?.importance || "",
      palaceId: item.memoryPalace?.palaceId || "__none__",
      locus: item.memoryPalace?.locus || "",
    });
    setShowAddDialog(true);
  };

  const handleDeleteItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
    toast.success("Item deleted");
  };

  const handleRateRecall = (itemId: string, quality: number) => {
    setItems(
      items.map((item) => {
        if (item.id !== itemId) return item;
        const update = sm2(item, quality);
        return {
          ...item,
          ...update,
          history: [...item.history, { date: Date.now(), quality }],
        };
      })
    );
    setRevealedReviewId(null);
  };

  const handleSaveWellness = () => {
    const payload = { ...wellnessData, date: today };
    setWellness([...wellness.filter((w) => w.date !== today), payload]);
    toast.success("Wellness check-in saved. Session load updated.");
    setShowWellnessDialog(false);
  };

  const handleSaveCapture = () => {
    if (!captureForm.note.trim()) {
      toast.error("Write at least one quick thought or task");
      return;
    }
    const newCapture: QuickCapture = {
      id: Date.now().toString(),
      title: captureForm.title.trim() || "Quick capture",
      note: captureForm.note.trim(),
      created: Date.now(),
    };
    setCaptures([newCapture, ...captures]);
    setCaptureForm({ title: "", note: "" });
    setShowCaptureDialog(false);
    toast.success("Captured. Your working memory is free again.");
  };

  const handlePromoteCapture = (capture: QuickCapture) => {
    setFormData({
      title: capture.title === "Quick capture" ? "" : capture.title,
      content: capture.note,
      category: "work",
      difficulty: "medium",
      tags: "capture, inbox",
      ownWords: "",
      association: "",
      keyPoint: "",
      vividCue: "",
      definition: "",
      example: "",
      importance: "",
      palaceId: "__none__",
      locus: "",
    });
    setShowCaptureDialog(false);
    setShowAddDialog(true);
  };

  const handleArchiveCapture = (captureId: string) => {
    setCaptures(captures.filter((capture) => capture.id !== captureId));
  };

  const handleSaveJournal = () => {
    if (!journalForm.hardest.trim() || !journalForm.strategy.trim()) {
      toast.error("Record at least what was hardest and what strategy you will use next");
      return;
    }
    const entry: JournalEntry = {
      id: Date.now().toString(),
      date: today,
      hardest: journalForm.hardest.trim(),
      easiest: journalForm.easiest.trim(),
      strategy: journalForm.strategy.trim(),
      note: journalForm.note.trim() || undefined,
    };
    setJournalEntries([entry, ...journalEntries.filter((j) => j.date !== today)]);
    setJournalForm({ hardest: "", easiest: "", strategy: "", note: "" });
    setShowJournalDialog(false);
    toast.success("Learning journal saved");
  };

  const handleSavePalace = () => {
    if (!palaceForm.name.trim()) {
      toast.error("Name the memory palace");
      return;
    }
    const loci = palaceForm.loci
      .split(",")
      .map((l) => l.trim())
      .filter(Boolean);
    if (loci.length < 4) {
      toast.error("Use at least 4 loci for a useful palace");
      return;
    }
    const palace: MemoryPalace = {
      id: Date.now().toString(),
      name: palaceForm.name.trim(),
      loci,
      created: Date.now(),
    };
    setPalaces([palace, ...palaces]);
    setPalaceForm({ name: "", loci: DEFAULT_LOCI.join(", ") });
    setShowPalaceDialog(false);
    toast.success("Memory palace created");
  };

  const handleImportSuggestedLesson = () => {
    if (items.some((item) => item.dayNumber === suggestedLesson.day)) {
      toast.info("This guided lesson is already in your app");
      return;
    }
    const importedItem: MemoryItem = {
      id: `lesson-${suggestedLesson.day}-${Date.now()}`,
      title: suggestedLesson.title,
      content: suggestedLesson.context.definition,
      category: suggestedLesson.category,
      difficulty: suggestedLesson.difficulty as "easy" | "medium" | "hard",
      tags: ["curriculum", `day-${suggestedLesson.day}`],
      nextReview: Date.now(),
      interval: 1,
      easeFactor: 2.5,
      history: [],
      created: Date.now(),
      context: suggestedLesson.context,
      dayNumber: suggestedLesson.day,
      sourceType: "curriculum",
      encoding: {
        keyPoint: suggestedLesson.context.importance,
      },
    };
    setItems([importedItem, ...items]);
    toast.success(`Guided lesson Day ${suggestedLesson.day} added`);
  };

  const palaceAssignments = useMemo(() => {
    return palaces.map((palace) => ({
      ...palace,
      items: items.filter((item) => item.memoryPalace?.palaceId === palace.id),
    }));
  }, [palaces, items]);

  return (
    <>
    <HelpGuide />
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-2">
              <Brain className="w-10 h-10 text-cyan-400" />
              Memory Lab
            </h1>
            <p className="text-gray-400">Adaptive memory system: retrieval, deep encoding, capture, reflection, and palace mapping.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={() => setShowCloudSyncPanel(true)} variant="outline" className="border-slate-600 text-white hover:bg-slate-700">
              Cloud Sync
            </Button>
            <div className="bg-orange-500/20 border border-orange-500/50 rounded-lg px-4 py-2 flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-400" />
              <span className="text-white font-bold">{streak} day streak</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card className="bg-slate-800/50 border-slate-700 p-4">
            <div className="text-gray-400 text-sm mb-1">Retention Rate</div>
            <div className="text-3xl font-bold text-cyan-400">{retentionRate}%</div>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700 p-4">
            <div className="text-gray-400 text-sm mb-1">Due Today</div>
            <div className="text-3xl font-bold text-blue-400">{dueItems.length}</div>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700 p-4">
            <div className="text-gray-400 text-sm mb-1">Learn Queue</div>
            <div className="text-3xl font-bold text-emerald-400">{learnCandidates.length}</div>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700 p-4">
            <div className="text-gray-400 text-sm mb-1">Capture Inbox</div>
            <div className="text-3xl font-bold text-violet-400">{captures.length}</div>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700 p-4">
            <div className="text-gray-400 text-sm mb-1">Memory Palaces</div>
            <div className="text-3xl font-bold text-pink-400">{palaces.length}</div>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-slate-800/50 border border-slate-700 mb-6 flex flex-wrap h-auto">
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
            <TabsTrigger value="palaces" className="flex items-center gap-2">
              🏛️ Palaces
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Insights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="home" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700 p-6">
              <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
                <div>
                  <h2 className="text-xl font-bold text-white mb-2">Adaptive session plan</h2>
                  <p className="text-cyan-300 font-semibold">{adaptivePlan.label}</p>
                  <p className="text-gray-400 mt-2 max-w-2xl">{adaptivePlan.note}</p>
                </div>
                {!todayWellness ? (
                  <Button onClick={() => setShowWellnessDialog(true)} variant="outline" className="border-slate-600 text-white hover:bg-slate-700">
                    <Sun className="w-4 h-4 mr-2" />
                    Wellness check-in
                  </Button>
                ) : (
                  <div className="text-sm text-gray-400 space-y-1">
                    <p><Moon className="w-4 h-4 inline mr-1" /> Sleep: <span className="text-white capitalize">{todayWellness.sleep}</span></p>
                    <p>⚡ Stress: <span className="text-white capitalize">{todayWellness.stress}</span></p>
                    <p>💪 Exercise: <span className="text-white">{todayWellness.exercise ? "Yes" : "No"}</span></p>
                  </div>
                )}
              </div>
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="bg-slate-700/40 border border-slate-600 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-1">New items this session</div>
                  <div className="text-2xl font-bold text-emerald-400">{adaptivePlan.newItemsTarget}</div>
                </div>
                <div className="bg-slate-700/40 border border-slate-600 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-1">Review load</div>
                  <div className="text-2xl font-bold text-blue-400">{reviewLimitLabel}</div>
                </div>
                <div className="bg-slate-700/40 border border-slate-600 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-1">Working memory intensity</div>
                  <div className="text-2xl font-bold text-pink-400 capitalize">{adaptivePlan.wmIntensity}</div>
                </div>
              </div>
              <Button
                onClick={() => {
                  setCurrentChallengeIndex(nextChallengeIndex);
                  setShowSession(true);
                }}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
              >
                <Zap className="w-4 h-4 mr-2" />
                Start adaptive session
              </Button>
            </Card>

            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="bg-slate-800/50 border-slate-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-white">Quick capture inbox</h2>
                    <p className="text-gray-400 text-sm mt-1">Offload tasks, ideas, names, and facts before they crowd working memory.</p>
                  </div>
                  <Button onClick={() => setShowCaptureDialog(true)} className="bg-violet-600 hover:bg-violet-700 text-white">
                    <Inbox className="w-4 h-4 mr-2" />
                    Capture
                  </Button>
                </div>
                {captures.length === 0 ? (
                  <p className="text-gray-500 text-sm">No open captures. Use this for fast externalization.</p>
                ) : (
                  <div className="space-y-3">
                    {captures.slice(0, 4).map((capture) => (
                      <div key={capture.id} className="bg-slate-700/40 border border-slate-600 rounded-lg p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-white font-semibold">{capture.title}</p>
                            <p className="text-gray-400 text-sm mt-1 whitespace-pre-wrap">{capture.note}</p>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <Button size="sm" variant="outline" className="border-slate-600 text-white hover:bg-slate-700" onClick={() => handlePromoteCapture(capture)}>
                              Convert
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleArchiveCapture(capture.id)}>
                              Clear
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              <Card className="bg-slate-800/50 border-slate-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-white">Guided daily lesson</h2>
                    <p className="text-gray-400 text-sm mt-1">Activates the dormant 30-day curriculum already inside the project.</p>
                  </div>
                  <Badge variant="outline" className="text-cyan-300 border-cyan-500/40">Day {suggestedLesson.day}</Badge>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{suggestedLesson.title}</h3>
                <p className="text-gray-400 text-sm mb-4">{suggestedLesson.context.definition}</p>
                <p className="text-xs text-gray-500 mb-4">Why it matters: {suggestedLesson.context.importance}</p>
                <Button onClick={handleImportSuggestedLesson} variant="outline" className="border-slate-600 text-white hover:bg-slate-700">
                  Add guided lesson to items
                </Button>
              </Card>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="bg-slate-800/50 border-slate-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-white">Learning journal</h2>
                    <p className="text-gray-400 text-sm mt-1">Metacognition: record what failed, what worked, and how to adjust.</p>
                  </div>
                  <Button onClick={() => setShowJournalDialog(true)} variant="outline" className="border-slate-600 text-white hover:bg-slate-700">
                    Write reflection
                  </Button>
                </div>
                {recentJournalEntries.length === 0 ? (
                  <p className="text-gray-500 text-sm">No reflections yet. Add one after each training day.</p>
                ) : (
                  <div className="space-y-3">
                    {recentJournalEntries.map((entry) => (
                      <div key={entry.id} className="bg-slate-700/40 border border-slate-600 rounded-lg p-4">
                        <div className="text-xs text-gray-500 mb-2">{entry.date}</div>
                        <p className="text-white text-sm"><span className="text-gray-400">Hardest:</span> {entry.hardest}</p>
                        {entry.easiest && <p className="text-white text-sm mt-1"><span className="text-gray-400">Easiest:</span> {entry.easiest}</p>}
                        <p className="text-cyan-300 text-sm mt-1"><span className="text-gray-400">Next strategy:</span> {entry.strategy}</p>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              <Card className="bg-slate-800/50 border-slate-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-white">Memory palace builder</h2>
                    <p className="text-gray-400 text-sm mt-1">Spatial indexing for medium-term retention and structured recall.</p>
                  </div>
                  <Button onClick={() => setShowPalaceDialog(true)} variant="outline" className="border-slate-600 text-white hover:bg-slate-700">
                    Create palace
                  </Button>
                </div>
                {palaceAssignments.length === 0 ? (
                  <p className="text-gray-500 text-sm">No palaces yet. Create one and assign items to loci in the add/edit dialog.</p>
                ) : (
                  <div className="space-y-3">
                    {palaceAssignments.slice(0, 3).map((palace) => (
                      <div key={palace.id} className="bg-slate-700/40 border border-slate-600 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-white font-semibold">{palace.name}</p>
                          <Badge variant="outline">{palace.items.length} mapped</Badge>
                        </div>
                        <p className="text-gray-400 text-sm">{palace.loci.slice(0, 4).join(" → ")}{palace.loci.length > 4 ? " ..." : ""}</p>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="items" className="space-y-4">
            <div className="flex justify-between items-center mb-6 gap-3 flex-wrap">
              <div>
                <h2 className="text-xl font-bold text-white">Memory items</h2>
                <p className="text-gray-400 text-sm mt-1">Deep encoding, association prompts, and optional palace mapping.</p>
              </div>
              <Button
                onClick={() => {
                  resetItemForm();
                  setShowAddDialog(true);
                }}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add item
              </Button>
            </div>

            {learnCandidates.length > 0 && (
              <Card className="bg-slate-800/50 border-slate-700 p-4">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <h3 className="text-white font-semibold">Suggested learn queue</h3>
                    <p className="text-gray-400 text-sm">These items are the best candidates for your next adaptive session.</p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {learnCandidates.map((item) => (
                      <Badge key={item.id} variant="secondary">{item.title}</Badge>
                    ))}
                  </div>
                </div>
              </Card>
            )}

            {items.length === 0 ? (
              <Card className="bg-slate-800/50 border-slate-700 p-12 text-center">
                <Brain className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No items yet. Start by adding your first memory item or importing the guided lesson.</p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {items.map((item) => (
                  <Card key={item.id} className="bg-slate-800/50 border-slate-700 p-4 hover:border-slate-600 transition">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="text-2xl">{CATEGORIES[item.category as keyof typeof CATEGORIES]?.icon}</span>
                          <h3 className="text-lg font-bold text-white">{item.title}</h3>
                          <Badge variant="outline" className="text-xs">{item.difficulty}</Badge>
                          {item.dayNumber && <Badge variant="outline">Day {item.dayNumber}</Badge>}
                          {item.memoryPalace?.palaceName && <Badge variant="outline">🏛️ {item.memoryPalace.palaceName}{item.memoryPalace.locus ? ` · ${item.memoryPalace.locus}` : ""}</Badge>}
                        </div>
                        <p className="text-gray-300 text-sm mb-3 whitespace-pre-wrap">{item.content}</p>
                        {item.encoding && (item.encoding.association || item.encoding.keyPoint || item.encoding.vividCue || item.encoding.ownWords) && (
                          <div className="bg-slate-700/30 border border-slate-600 rounded-lg p-3 mb-3 text-sm">
                            {item.encoding.ownWords && <p className="text-gray-300"><span className="text-gray-400">Own words:</span> {item.encoding.ownWords}</p>}
                            {item.encoding.association && <p className="text-gray-300 mt-1"><span className="text-gray-400">Association:</span> {item.encoding.association}</p>}
                            {item.encoding.vividCue && <p className="text-pink-300 mt-1"><span className="text-gray-400">Vivid cue:</span> {item.encoding.vividCue}</p>}
                            {item.encoding.keyPoint && <p className="text-cyan-300 mt-1"><span className="text-gray-400">Key point:</span> {item.encoding.keyPoint}</p>}
                          </div>
                        )}
                        <div className="flex items-center gap-2 flex-wrap">
                          {item.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Button size="sm" variant="outline" onClick={() => handleEditItem(item)} className="border-slate-600 text-white hover:bg-slate-700">
                          Edit
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteItem(item.id)}>
                          Delete
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="review" className="space-y-4">
            <h2 className="text-xl font-bold text-white mb-2">Items due for review</h2>
            <p className="text-gray-400 text-sm mb-4">Answers stay hidden until you choose to reveal them. This keeps free recall primary.</p>

            {dueItems.length === 0 ? (
              <Card className="bg-slate-800/50 border-slate-700 p-12 text-center">
                <Brain className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <p className="text-gray-400">All caught up. No items due for review today.</p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {dueItems.map((item) => (
                  <Card key={item.id} className="bg-slate-800/50 border-slate-700 p-4">
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h3 className="text-lg font-bold text-white">{item.title}</h3>
                        {item.memoryPalace?.palaceName && <Badge variant="outline">🏛️ {item.memoryPalace.palaceName}</Badge>}
                      </div>
                      {revealedReviewId !== item.id ? (
                        <>
                          <p className="text-gray-400 text-sm mb-4">Pause and retrieve before revealing the answer.</p>
                          <Button variant="outline" className="border-slate-600 text-white hover:bg-slate-700" onClick={() => setRevealedReviewId(item.id)}>
                            Reveal answer
                          </Button>
                        </>
                      ) : (
                        <>
                          <p className="text-gray-300 text-sm mb-3 whitespace-pre-wrap">{item.content}</p>
                          {item.encoding?.association && (
                            <p className="text-pink-300 text-sm mb-2">Association cue: {item.encoding.association}</p>
                          )}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {[
                              { q: 1, label: "Forgot", color: "bg-red-500/20 border-red-500/50 text-red-400" },
                              { q: 3, label: "Hard", color: "bg-yellow-500/20 border-yellow-500/50 text-yellow-400" },
                              { q: 4, label: "Good", color: "bg-blue-500/20 border-blue-500/50 text-blue-400" },
                              { q: 5, label: "Easy", color: "bg-green-500/20 border-green-500/50 text-green-400" },
                            ].map((btn) => (
                              <Button key={btn.q} onClick={() => handleRateRecall(item.id, btn.q)} className={`border ${btn.color}`} variant="outline">
                                {btn.label}
                              </Button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="palaces" className="space-y-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h2 className="text-xl font-bold text-white">Memory palaces</h2>
                <p className="text-gray-400 text-sm mt-1">Use spatial memory to structure medium-term recall.</p>
              </div>
              <Button onClick={() => setShowPalaceDialog(true)} className="bg-gradient-to-r from-fuchsia-500 to-pink-500 hover:from-fuchsia-600 hover:to-pink-600">
                Create palace
              </Button>
            </div>

            {palaceAssignments.length === 0 ? (
              <Card className="bg-slate-800/50 border-slate-700 p-12 text-center">
                <p className="text-gray-400">No memory palaces yet. Create one and assign loci to your items.</p>
              </Card>
            ) : (
              palaceAssignments.map((palace) => (
                <Card key={palace.id} className="bg-slate-800/50 border-slate-700 p-6">
                  <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
                    <div>
                      <h3 className="text-white text-lg font-bold">🏛️ {palace.name}</h3>
                      <p className="text-gray-400 text-sm">{palace.loci.length} loci · {palace.items.length} assigned items</p>
                    </div>
                    <Badge variant="outline">Guided walk</Badge>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    {palace.loci.map((locus) => {
                      const locusItems = palace.items.filter((item) => item.memoryPalace?.locus === locus);
                      return (
                        <div key={locus} className="bg-slate-700/40 border border-slate-600 rounded-lg p-3">
                          <p className="text-white font-medium mb-2">{locus}</p>
                          {locusItems.length === 0 ? (
                            <p className="text-gray-500 text-sm">No item assigned yet.</p>
                          ) : (
                            <div className="space-y-1">
                              {locusItems.map((item) => (
                                <p key={item.id} className="text-cyan-300 text-sm">• {item.title}</p>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-slate-800/50 border-slate-700 p-6">
                <h3 className="text-white font-bold mb-4">Retention by category</h3>
                <div className="space-y-4">
                  {Object.entries(CATEGORIES).map(([key, category]) => {
                    const categoryItems = items.filter((item) => item.category === key);
                    const history = categoryItems.flatMap((item) => item.history);
                    const rate = history.length ? Math.round((history.filter((h) => h.quality >= 3).length / history.length) * 100) : 0;
                    return (
                      <div key={key}>
                        <div className="flex justify-between mb-1">
                          <span className="text-gray-400 text-sm">{category.icon} {category.label}</span>
                          <span className="text-white font-bold">{rate}%</span>
                        </div>
                        <Progress value={rate} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700 p-6">
                <h3 className="text-white font-bold mb-4">System insights</h3>
                <div className="space-y-3 text-sm text-gray-300">
                  <p>• Review scheduler is active with spaced repetition.</p>
                  <p>• Deep encoding fields are now part of item creation and editing.</p>
                  <p>• Capture inbox reduces short-term memory overload before study starts.</p>
                  <p>• Learning journal adds metacognitive feedback after sessions.</p>
                  <p>• Memory palace mapping adds a spatial retrieval layer for medium-term recall.</p>
                </div>
              </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-slate-800/50 border-slate-700 p-6">
                <h3 className="text-white font-bold mb-4">Wellness today</h3>
                {todayWellness ? (
                  <div className="space-y-2 text-sm text-gray-300">
                    <p>🌙 Sleep: <span className="text-white font-semibold capitalize">{todayWellness.sleep}</span></p>
                    <p>⚡ Stress: <span className="text-white font-semibold capitalize">{todayWellness.stress}</span></p>
                    <p>💪 Exercise: <span className="text-white font-semibold">{todayWellness.exercise ? "Yes" : "No"}</span></p>
                    <p className="text-cyan-300 pt-2">Adaptive plan selected: {adaptivePlan.label}</p>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">Complete today’s check-in to personalize study load.</p>
                )}
              </Card>

              <Card className="bg-slate-800/50 border-slate-700 p-6">
                <h3 className="text-white font-bold mb-4">Recent learning reflections</h3>
                {recentJournalEntries.length === 0 ? (
                  <p className="text-gray-500 text-sm">No journal entries yet.</p>
                ) : (
                  <div className="space-y-3">
                    {recentJournalEntries.map((entry) => (
                      <div key={entry.id} className="border border-slate-700 rounded-lg p-3">
                        <p className="text-gray-500 text-xs mb-1">{entry.date}</p>
                        <p className="text-white text-sm">{entry.strategy}</p>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">{editingItem ? "Edit memory item" : "Add new memory item"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-gray-400 text-sm mb-1 block">Title</label>
                <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="bg-slate-700 border-slate-600 text-white" placeholder="What do you want to remember?" />
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-1 block">Category</label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    {Object.entries(CATEGORIES).map(([key, category]) => (
                      <SelectItem key={key} value={key} className="text-white">{category.icon} {category.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Core content</label>
              <Textarea value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} className="bg-slate-700 border-slate-600 text-white min-h-24" placeholder="Definition, explanation, procedure, or concept..." />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-gray-400 text-sm mb-1 block">Difficulty</label>
                <Select value={formData.difficulty} onValueChange={(value) => setFormData({ ...formData, difficulty: value as "easy" | "medium" | "hard" })}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value="easy" className="text-white">Easy</SelectItem>
                    <SelectItem value="medium" className="text-white">Medium</SelectItem>
                    <SelectItem value="hard" className="text-white">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-1 block">Tags</label>
                <Input value={formData.tags} onChange={(e) => setFormData({ ...formData, tags: e.target.value })} className="bg-slate-700 border-slate-600 text-white" placeholder="study, names, review" />
              </div>
            </div>

            <div className="border-t border-slate-700 pt-4">
              <p className="text-cyan-300 text-xs font-semibold mb-3">DEEP ENCODING + ASSOCIATION COACH</p>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 text-sm mb-1 block">Own words</label>
                  <Textarea value={formData.ownWords} onChange={(e) => setFormData({ ...formData, ownWords: e.target.value })} className="bg-slate-700 border-slate-600 text-white min-h-20" placeholder="Explain it as if teaching someone else" />
                </div>
                <div>
                  <label className="text-gray-400 text-sm mb-1 block">Association</label>
                  <Textarea value={formData.association} onChange={(e) => setFormData({ ...formData, association: e.target.value })} className="bg-slate-700 border-slate-600 text-white min-h-20" placeholder="Link it to something already familiar" />
                </div>
                <div>
                  <label className="text-gray-400 text-sm mb-1 block">Key point</label>
                  <Textarea value={formData.keyPoint} onChange={(e) => setFormData({ ...formData, keyPoint: e.target.value })} className="bg-slate-700 border-slate-600 text-white min-h-20" placeholder="What must remain if everything else is forgotten?" />
                </div>
                <div>
                  <label className="text-gray-400 text-sm mb-1 block">Vivid cue</label>
                  <Textarea value={formData.vividCue} onChange={(e) => setFormData({ ...formData, vividCue: e.target.value })} className="bg-slate-700 border-slate-600 text-white min-h-20" placeholder="Create an exaggerated sensory image" />
                </div>
              </div>
            </div>

            <div className="border-t border-slate-700 pt-4">
              <p className="text-pink-300 text-xs font-semibold mb-3">OPTIONAL MEMORY PALACE MAPPING</p>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 text-sm mb-1 block">Palace</label>
                  <Select value={formData.palaceId} onValueChange={(value) => setFormData({ ...formData, palaceId: value })}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      <SelectItem value="__none__" className="text-white">No palace</SelectItem>
                      {palaces.map((palace) => (
                        <SelectItem key={palace.id} value={palace.id} className="text-white">{palace.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-gray-400 text-sm mb-1 block">Locus</label>
                  <Input value={formData.locus} onChange={(e) => setFormData({ ...formData, locus: e.target.value })} className="bg-slate-700 border-slate-600 text-white" placeholder="Front Door, Sofa, Desk..." />
                </div>
              </div>
            </div>

            <div className="border-t border-slate-700 pt-4">
              <p className="text-gray-400 text-xs font-semibold mb-3">OPTIONAL STRUCTURE</p>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="text-gray-400 text-sm mb-1 block">Definition</label>
                  <Textarea value={formData.definition} onChange={(e) => setFormData({ ...formData, definition: e.target.value })} className="bg-slate-700 border-slate-600 text-white min-h-20" />
                </div>
                <div>
                  <label className="text-gray-400 text-sm mb-1 block">Example</label>
                  <Textarea value={formData.example} onChange={(e) => setFormData({ ...formData, example: e.target.value })} className="bg-slate-700 border-slate-600 text-white min-h-20" />
                </div>
                <div>
                  <label className="text-gray-400 text-sm mb-1 block">Importance</label>
                  <Textarea value={formData.importance} onChange={(e) => setFormData({ ...formData, importance: e.target.value })} className="bg-slate-700 border-slate-600 text-white min-h-20" />
                </div>
              </div>
            </div>

            <Button onClick={handleAddOrUpdateItem} className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600">
              {editingItem ? "Update item" : "Add item"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showWellnessDialog} onOpenChange={setShowWellnessDialog}>
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Daily wellness check-in</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-gray-400 text-sm mb-2 block">🌙 Sleep quality</label>
              <div className="flex gap-2">
                {(["poor", "ok", "good"] as const).map((value) => (
                  <Button key={value} variant={wellnessData.sleep === value ? "default" : "outline"} onClick={() => setWellnessData({ ...wellnessData, sleep: value })} className="flex-1">
                    {value}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-gray-400 text-sm mb-2 block">⚡ Stress level</label>
              <div className="flex gap-2">
                {(["low", "medium", "high"] as const).map((value) => (
                  <Button key={value} variant={wellnessData.stress === value ? "default" : "outline"} onClick={() => setWellnessData({ ...wellnessData, stress: value })} className="flex-1">
                    {value}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-gray-400 text-sm mb-2 block">💪 Exercise today?</label>
              <div className="flex gap-2">
                {[true, false].map((value) => (
                  <Button key={String(value)} variant={wellnessData.exercise === value ? "default" : "outline"} onClick={() => setWellnessData({ ...wellnessData, exercise: value })} className="flex-1">
                    {value ? "Yes" : "No"}
                  </Button>
                ))}
              </div>
            </div>
            <Button onClick={handleSaveWellness} className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600">Save check-in</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showCaptureDialog} onOpenChange={setShowCaptureDialog}>
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Quick capture</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input value={captureForm.title} onChange={(e) => setCaptureForm({ ...captureForm, title: e.target.value })} className="bg-slate-700 border-slate-600 text-white" placeholder="Optional title" />
            <Textarea value={captureForm.note} onChange={(e) => setCaptureForm({ ...captureForm, note: e.target.value })} className="bg-slate-700 border-slate-600 text-white min-h-28" placeholder="Task, name, idea, fact, or reminder to offload now..." />
            <Button onClick={handleSaveCapture} className="w-full bg-violet-600 hover:bg-violet-700">Save to inbox</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showJournalDialog} onOpenChange={setShowJournalDialog}>
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Learning journal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea value={journalForm.hardest} onChange={(e) => setJournalForm({ ...journalForm, hardest: e.target.value })} className="bg-slate-700 border-slate-600 text-white min-h-20" placeholder="What was hardest to retrieve today?" />
            <Textarea value={journalForm.easiest} onChange={(e) => setJournalForm({ ...journalForm, easiest: e.target.value })} className="bg-slate-700 border-slate-600 text-white min-h-20" placeholder="What came easily?" />
            <Textarea value={journalForm.strategy} onChange={(e) => setJournalForm({ ...journalForm, strategy: e.target.value })} className="bg-slate-700 border-slate-600 text-white min-h-20" placeholder="What will you do differently next session?" />
            <Textarea value={journalForm.note} onChange={(e) => setJournalForm({ ...journalForm, note: e.target.value })} className="bg-slate-700 border-slate-600 text-white min-h-20" placeholder="Any extra reflection" />
            <Button onClick={handleSaveJournal} className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600">Save reflection</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showPalaceDialog} onOpenChange={setShowPalaceDialog}>
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Create memory palace</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input value={palaceForm.name} onChange={(e) => setPalaceForm({ ...palaceForm, name: e.target.value })} className="bg-slate-700 border-slate-600 text-white" placeholder="Home, office, route to work..." />
            <Textarea value={palaceForm.loci} onChange={(e) => setPalaceForm({ ...palaceForm, loci: e.target.value })} className="bg-slate-700 border-slate-600 text-white min-h-28" placeholder="Comma-separated loci: Front Door, Hall, Sofa, Kitchen..." />
            <Button onClick={handleSavePalace} className="w-full bg-gradient-to-r from-fuchsia-500 to-pink-500 hover:from-fuchsia-600 hover:to-pink-600">Save palace</Button>
          </div>
        </DialogContent>
      </Dialog>

      {showSession && (
        <SessionScreen
          items={items}
          setItems={setItems}
          dueItems={dueItems}
          onComplete={(sessionScore) => {
            const newSession: SessionRecord = {
              id: Date.now().toString(),
              date: today,
              score: sessionScore,
              completed: true,
              challengeIndex: currentChallengeIndex,
            };
            setSessions([...sessions, newSession]);
            toast.success(`Session complete. Score: ${sessionScore}%`);
            setShowSession(false);
            setShowJournalDialog(true);
          }}
          onCancel={() => setShowSession(false)}
          challengeIndex={currentChallengeIndex}
          dayNumber={uniqueSessionDays + 1}
          sessionPlan={adaptivePlan}
        />
      )}
    </div>
    <CloudSyncPanel isOpen={showCloudSyncPanel} onClose={() => setShowCloudSyncPanel(false)} onSync={() => window.location.reload()} />
    </>
  );
}
