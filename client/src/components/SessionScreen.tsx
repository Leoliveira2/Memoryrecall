import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Brain, ChevronRight, Zap, Eye, RotateCcw } from "lucide-react";
import { toast } from "sonner";

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
}

interface SessionScreenProps {
  items: MemoryItem[];
  setItems: (items: MemoryItem[]) => void;
  dueItems: MemoryItem[];
  onComplete: (score: number) => void;
  onCancel: () => void;
  challengeIndex?: number;
}

const WORKING_MEMORY_CHALLENGES = [
  { type: "sequence", prompt: "Remember this sequence:", items: ["🔵", "🔴", "🟡", "🟢", "🟣"], delay: 3000 },
  { type: "numbers", prompt: "Memorize the numbers:", items: ["4", "7", "2", "9", "1", "5"], delay: 3000 },
  { type: "words", prompt: "Hold these words in mind:", items: ["CLOUD", "RIVER", "STONE", "FLAME"], delay: 4000 },
  { type: "sequence", prompt: "Remember this pattern:", items: ["🔺", "⬛", "🔵", "🔺", "🔵", "⬛"], delay: 3500 },
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

export default function SessionScreen({
  items,
  setItems,
  dueItems,
  onComplete,
  onCancel,
  challengeIndex = 0,
}: SessionScreenProps) {
  const phases = ["checkin", "learn", "recall", "working_memory", "review", "summary"];
  const [phase, setPhase] = useState(0);
  const [learnIdx, setLearnIdx] = useState(0);
  const [recallState, setRecallState] = useState({ shown: false, answer: "" });
  const [wmChallenge] = useState(WORKING_MEMORY_CHALLENGES[challengeIndex % WORKING_MEMORY_CHALLENGES.length]);
  const [wmPhase, setWmPhase] = useState("show");
  const [wmInput, setWmInput] = useState<string[]>([]);
  const [wmShuffled, setWmShuffled] = useState<string[]>([]);
  const [reviewIdx, setReviewIdx] = useState(0);
  const [scores, setScores] = useState<number[]>([]);
  const [reviewItems, setReviewItems] = useState(dueItems.slice(0, 5));
  const [reviewShown, setReviewShown] = useState(false);

  // Shuffle items when entering recall phase
  useEffect(() => {
    if (wmPhase === "recall" && wmShuffled.length === 0) {
      const shuffled = [...wmChallenge.items].sort(() => Math.random() - 0.5);
      setWmShuffled(shuffled);
    }
  }, [wmPhase, wmChallenge.items, wmShuffled.length]);

  const learnItems = items.slice(-3);
  const currentPhase = phases[phase];
  const score = scores.length ? Math.round(scores.filter(s => s >= 3).length / scores.length * 100) : 0;
  const wmIsCorrect = wmInput.length === wmChallenge.items.length && wmInput.every((item, i) => item === wmChallenge.items[i]);

  useEffect(() => {
    if (currentPhase === "working_memory" && wmPhase === "show") {
      const t = setTimeout(() => setWmPhase("delay"), wmChallenge.delay);
      return () => clearTimeout(t);
    }
    if (currentPhase === "working_memory" && wmPhase === "delay") {
      const t = setTimeout(() => setWmPhase("recall"), 2000);
      return () => clearTimeout(t);
    }
  }, [currentPhase, wmPhase, wmChallenge.delay]);

  const rateRecall = (itemId: string, quality: number) => {
    const item = reviewItems[reviewIdx];
    if (item) {
      const update = sm2(item, quality);
      setItems(
        items.map(i =>
          i.id === item.id
            ? { ...i, ...update, history: [...i.history, { date: Date.now(), quality }] }
            : i
        )
      );
      setScores(s => [...s, quality]);
    }
    if (reviewIdx < reviewItems.length - 1) {
      setReviewIdx(r => r + 1);
      setReviewShown(false);
    } else {
      setPhase(p => p + 1);
    }
  };

  // ─── Checkin Phase ────────────────────────────────────────────────────────
  if (currentPhase === "checkin") {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <Card className="bg-slate-800 border-slate-700 w-full max-w-md p-6">
          <div className="text-center">
            <Brain className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Ready to Train?</h2>
            <p className="text-gray-400 mb-6">
              This session takes about 7 minutes. You'll learn new items, test recall, do a working memory drill, and review due cards.
            </p>
            <div className="flex gap-2 mb-6 flex-wrap justify-center">
              {["📖 Learn", "🎯 Recall", "⚡ WM Drill", "🔁 Review"].map((s, i) => (
                <div key={i} className="bg-slate-700/50 border border-slate-600 rounded-full px-3 py-1 text-sm text-gray-300">
                  {s}
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setPhase(1)} className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600">
                Begin Session
              </Button>
              <Button onClick={onCancel} variant="outline" className="flex-1 border-slate-600 text-white hover:bg-slate-700">
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // ─── Learn Phase ──────────────────────────────────────────────────────────
  if (currentPhase === "learn") {
    const item = learnItems[learnIdx];
    if (!item) {
      setPhase(2);
      return null;
    }
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <Card className="bg-slate-800 border-slate-700 w-full max-w-md p-6">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-400">Learn · {learnIdx + 1} of {learnItems.length}</span>
              <Progress value={((phase + learnIdx / learnItems.length) / phases.length) * 100} className="w-32" />
            </div>
            <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4 mb-4">
              <div className="text-sm text-cyan-400 font-semibold mb-2">📚 {item.category}</div>
              <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
              <p className="text-gray-300 text-sm leading-relaxed">{item.content}</p>
            </div>
            <p className="text-xs text-gray-500 text-center mb-4">Study this carefully. You'll be tested in a moment.</p>
            <Button
              onClick={() => {
                if (learnIdx < learnItems.length - 1) {
                  setLearnIdx(i => i + 1);
                } else {
                  setPhase(2);
                  setLearnIdx(0);
                }
              }}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
            >
              {learnIdx < learnItems.length - 1 ? "Next Item" : "Start Recall Test"} <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // ─── Recall Phase ─────────────────────────────────────────────────────────
  if (currentPhase === "recall") {
    const item = learnItems[learnIdx];
    if (!item) {
      setPhase(3);
      return null;
    }
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <Card className="bg-slate-800 border-slate-700 w-full max-w-md p-6">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-400">Recall Test</span>
              <Progress value={((phase + learnIdx / learnItems.length) / phases.length) * 100} className="w-32" />
            </div>
            <div className="mb-4">
              <p className="text-gray-400 text-sm mb-2">Without looking — what do you know about:</p>
              <h3 className="text-xl font-bold text-white mb-4">{item.title}</h3>
              {!recallState.shown ? (
                <>
                  <Textarea
                    placeholder="Write what you remember…"
                    value={recallState.answer}
                    onChange={(e) => setRecallState(s => ({ ...s, answer: e.target.value }))}
                    className="bg-slate-700 border-slate-600 text-white mb-4 min-h-24"
                  />
                  <Button
                    onClick={() => setRecallState(s => ({ ...s, shown: true }))}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                  >
                    Reveal Answer
                  </Button>
                </>
              ) : (
                <>
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 mb-4">
                    <div className="text-xs text-green-400 font-semibold mb-2">✓ Correct answer:</div>
                    <p className="text-gray-300 text-sm">{item.content}</p>
                  </div>
                  <p className="text-xs text-gray-400 text-center mb-3">How did you do?</p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { q: 1, label: "❌ Forgot", color: "bg-red-500/20 border-red-500/50 text-red-400" },
                      { q: 3, label: "≈ Partly", color: "bg-yellow-500/20 border-yellow-500/50 text-yellow-400" },
                      { q: 5, label: "✓ Got it", color: "bg-green-500/20 border-green-500/50 text-green-400" },
                    ].map(btn => (
                      <Button
                        key={btn.q}
                        onClick={() => {
                          setScores(s => [...s, btn.q]);
                          setRecallState({ shown: false, answer: "" });
                          if (learnIdx < learnItems.length - 1) {
                            setLearnIdx(i => i + 1);
                          } else {
                            setPhase(3);
                          }
                        }}
                        className={`border ${btn.color}`}
                        variant="outline"
                        size="sm"
                      >
                        {btn.label}
                      </Button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // ─── Working Memory Phase ─────────────────────────────────────────────────
  if (currentPhase === "working_memory") {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <Card className="bg-slate-800 border-slate-700 w-full max-w-md p-6">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-400 flex items-center gap-1"><Zap className="w-4 h-4" /> Working Memory Drill</span>
              <Progress value={((phase) / phases.length) * 100} className="w-24" />
            </div>

            {wmPhase === "show" && (
              <div className="text-center">
                <p className="text-gray-400 text-sm mb-6">{wmChallenge.prompt}</p>
                <div className="flex gap-3 justify-center flex-wrap mb-6">
                  {wmChallenge.items.map((item, i) => (
                    <div
                      key={i}
                      className="w-14 h-14 bg-slate-700/50 border border-slate-600 rounded-lg flex items-center justify-center text-2xl animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    >
                      {item}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500">Memorizing… ({Math.round(wmChallenge.delay / 1000)}s)</p>
                <p className="text-xs text-gray-400 mt-3">Challenge {challengeIndex + 1} of {WORKING_MEMORY_CHALLENGES.length}</p>
              </div>
            )}

            {wmPhase === "delay" && (
              <div className="text-center py-8">
                <div className="text-5xl mb-4">👁️</div>
                <p className="text-gray-400">Hold it in mind…</p>
              </div>
            )}

            {wmPhase === "recall" && (
              <>
                <p className="text-gray-400 text-sm mb-4">Click the items in the order you saw them:</p>
                <div className="flex gap-2 flex-wrap mb-4 justify-center">
                  {wmShuffled.map((item, i) => {
                    const clickedIndex = wmInput.indexOf(item);
                    const isClicked = clickedIndex !== -1;
                    return (
                      <Button
                        key={i}
                        onClick={() => {
                          if (!isClicked) {
                            setWmInput(w => [...w, item]);
                          }
                        }}
                        className={`w-14 h-14 text-lg font-bold ${
                          isClicked
                            ? "bg-green-500/20 border-green-500/50 text-green-400"
                            : "bg-slate-700/50 border-slate-600 text-white hover:bg-slate-600"
                        }`}
                        variant="outline"
                        disabled={isClicked}
                      >
                        {isClicked ? clickedIndex + 1 : item}
                      </Button>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-500 mb-4">Sequence: {wmInput.join(" → ") || "—"}</p>
                {wmInput.length === wmChallenge.items.length && (
                  <div className={`mb-4 p-3 rounded-lg text-sm ${
                    wmIsCorrect
                      ? "bg-green-500/10 border border-green-500/30 text-green-400"
                      : "bg-red-500/10 border border-red-500/30 text-red-400"
                  }`}>
                    {wmIsCorrect ? "✓ Perfect! You got the sequence right!" : "✗ Sequence incorrect. Try again next time!"}
                  </div>
                )}
                <Button
                  onClick={() => {
                    setScores(s => [...s, wmIsCorrect ? 5 : wmInput.length === wmChallenge.items.length ? 2 : 1]);
                    setPhase(4);
                  }}
                  disabled={wmInput.length !== wmChallenge.items.length}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50"
                >
                  Continue <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </>
            )}
          </div>
        </Card>
      </div>
    );
  }

  // ─── Review Phase ─────────────────────────────────────────────────────────
  if (currentPhase === "review") {
    if (reviewItems.length === 0) {
      return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="bg-slate-800 border-slate-700 w-full max-w-md p-6 text-center">
            <div className="text-4xl mb-3">✅</div>
            <p className="text-gray-400 mb-6">No items due for review!</p>
            <Button
              onClick={() => setPhase(5)}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
            >
              Continue to Summary
            </Button>
          </Card>
        </div>
      );
    }

    const item = reviewItems[reviewIdx];
    if (!item) {
      setPhase(5);
      return null;
    }

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <Card className="bg-slate-800 border-slate-700 w-full max-w-md p-6">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-400">Review · {reviewIdx + 1} of {reviewItems.length}</span>
              <Progress value={((phase + reviewIdx / reviewItems.length) / phases.length) * 100} className="w-24" />
            </div>
            <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4 mb-4">
              <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
              {!reviewShown ? (
                <Button
                  onClick={() => setReviewShown(true)}
                  className="w-full bg-slate-600 hover:bg-slate-500 text-white"
                  variant="outline"
                >
                  <Eye className="w-4 h-4 mr-2" /> Show Answer
                </Button>
              ) : (
                <>
                  <p className="text-gray-300 text-sm mb-4">{item.content}</p>
                  <p className="text-xs text-gray-400 text-center mb-3">How well did you remember?</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { q: 1, label: "Forgot", color: "bg-red-500/20 border-red-500/50 text-red-400" },
                      { q: 3, label: "Hard", color: "bg-yellow-500/20 border-yellow-500/50 text-yellow-400" },
                      { q: 4, label: "Good", color: "bg-blue-500/20 border-blue-500/50 text-blue-400" },
                      { q: 5, label: "Easy", color: "bg-green-500/20 border-green-500/50 text-green-400" },
                    ].map(btn => (
                      <Button
                        key={btn.q}
                        onClick={() => rateRecall(item.id, btn.q)}
                        className={`border ${btn.color}`}
                        variant="outline"
                        size="sm"
                      >
                        {btn.label}
                      </Button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // ─── Summary Phase ────────────────────────────────────────────────────────
  if (currentPhase === "summary") {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <Card className="bg-slate-800 border-slate-700 w-full max-w-md p-6 text-center">
          <div className="text-5xl mb-4">🏆</div>
          <h2 className="text-2xl font-bold text-white mb-2">Session Complete!</h2>
          <p className="text-gray-400 mb-6">You trained your memory today.</p>
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-3">
              <div className="text-2xl font-bold text-cyan-400">{score}%</div>
              <div className="text-xs text-gray-400">Recall Score</div>
            </div>
            <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-3">
              <div className="text-2xl font-bold text-blue-400">{reviewItems.length}</div>
              <div className="text-xs text-gray-400">Reviewed</div>
            </div>
            <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-3">
              <div className="text-2xl font-bold text-purple-400">{learnItems.length}</div>
              <div className="text-xs text-gray-400">Learned</div>
            </div>
          </div>
          <Button
            onClick={() => onComplete(score)}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
          >
            Done
          </Button>
        </Card>
      </div>
    );
  }

  return null;
}
