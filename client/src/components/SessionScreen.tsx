import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Brain, ChevronRight, Eye, Zap } from "lucide-react";

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
  memoryPalace?: {
    palaceId?: string;
    palaceName?: string;
    locus?: string;
  };
}

interface SessionPlan {
  mode: "recovery" | "balanced" | "stretch";
  label: string;
  newItemsTarget: number;
  reviewLimit: number;
  wmIntensity: "light" | "standard" | "stretch";
  note: string;
}

interface SessionScreenProps {
  items: MemoryItem[];
  setItems: (items: MemoryItem[]) => void;
  dueItems: MemoryItem[];
  onComplete: (score: number) => void;
  onCancel: () => void;
  challengeIndex?: number;
  dayNumber?: number;
  sessionPlan: SessionPlan;
}

const BASE_CHALLENGES = [
  { type: "sequence", prompt: "Remember this sequence:", items: ["🔵", "🔴", "🟡", "🟢", "🟣"], delay: 3200 },
  { type: "numbers", prompt: "Memorize the numbers:", items: ["4", "7", "2", "9", "1", "5"], delay: 3200 },
  { type: "words", prompt: "Hold these words in mind:", items: ["CLOUD", "RIVER", "STONE", "FLAME"], delay: 3800 },
  { type: "pattern", prompt: "Remember this pattern:", items: ["🔺", "⬛", "🔵", "🔺", "🔵", "⬛"], delay: 3400 },
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

function getLearnItems(items: MemoryItem[], target: number) {
  const now = Date.now();
  const sorted = [...items].sort((a, b) => {
    const aNewness = a.history.length === 0 ? 1 : 0;
    const bNewness = b.history.length === 0 ? 1 : 0;
    if (aNewness !== bNewness) return bNewness - aNewness;
    if (a.history.length !== b.history.length) return a.history.length - b.history.length;
    return b.created - a.created;
  });
  const preferred = sorted.filter((item) => item.nextReview > now || item.history.length === 0);
  return (preferred.length ? preferred : sorted).slice(0, target);
}

function adaptChallenge(base: (typeof BASE_CHALLENGES)[number], intensity: SessionPlan["wmIntensity"]) {
  if (intensity === "light") {
    return {
      ...base,
      items: base.items.slice(0, Math.max(3, base.items.length - 1)),
      delay: base.delay + 900,
    };
  }
  if (intensity === "stretch") {
    return {
      ...base,
      delay: Math.max(2200, base.delay - 600),
    };
  }
  return base;
}

export default function SessionScreen({
  items,
  setItems,
  dueItems,
  onComplete,
  onCancel,
  challengeIndex = 0,
  dayNumber = 1,
  sessionPlan,
}: SessionScreenProps) {
  const phases = ["checkin", "learn", "recall", "working_memory", "review", "summary"] as const;
  const [phase, setPhase] = useState(0);
  const [learnIdx, setLearnIdx] = useState(0);
  const [recallState, setRecallState] = useState({ shown: false, answer: "" });
  const [wmPhase, setWmPhase] = useState<"show" | "delay" | "recall">("show");
  const [wmInput, setWmInput] = useState<string[]>([]);
  const [wmShuffled, setWmShuffled] = useState<string[]>([]);
  const [reviewIdx, setReviewIdx] = useState(0);
  const [reviewShown, setReviewShown] = useState(false);
  const [scores, setScores] = useState<number[]>([]);

  const learnItems = useMemo(() => getLearnItems(items, sessionPlan.newItemsTarget), [items, sessionPlan.newItemsTarget]);
  const reviewItems = useMemo(() => dueItems.slice(0, sessionPlan.reviewLimit), [dueItems, sessionPlan.reviewLimit]);
  const baseChallenge = BASE_CHALLENGES[challengeIndex % BASE_CHALLENGES.length];
  const wmChallenge = useMemo(() => adaptChallenge(baseChallenge, sessionPlan.wmIntensity), [baseChallenge, sessionPlan.wmIntensity]);
  const currentPhase = phases[phase];
  const score = scores.length ? Math.round((scores.filter((s) => s >= 3).length / scores.length) * 100) : 0;
  const wmIsCorrect = wmInput.length === wmChallenge.items.length && wmInput.every((item, index) => item === wmChallenge.items[index]);

  useEffect(() => {
    if (currentPhase === "working_memory" && wmPhase === "show") {
      const timer = setTimeout(() => setWmPhase("delay"), wmChallenge.delay);
      return () => clearTimeout(timer);
    }
    if (currentPhase === "working_memory" && wmPhase === "delay") {
      const timer = setTimeout(() => setWmPhase("recall"), 1800);
      return () => clearTimeout(timer);
    }
  }, [currentPhase, wmPhase, wmChallenge.delay]);

  useEffect(() => {
    if (wmPhase === "recall" && wmShuffled.length === 0) {
      setWmShuffled([...wmChallenge.items].sort(() => Math.random() - 0.5));
    }
  }, [wmChallenge.items, wmPhase, wmShuffled.length]);

  const rateRecall = (itemId: string, quality: number) => {
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
    setScores((current) => [...current, quality]);
    if (reviewIdx < reviewItems.length - 1) {
      setReviewIdx(reviewIdx + 1);
      setReviewShown(false);
      return;
    }
    setPhase(5);
  };

  if (currentPhase === "checkin") {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <Card className="bg-slate-800 border-slate-700 w-full max-w-lg p-6">
          <div className="text-center">
            <Brain className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">{sessionPlan.label}</h2>
            <p className="text-gray-400 mb-6">{sessionPlan.note}</p>
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-slate-700/40 border border-slate-600 rounded-lg p-3">
                <div className="text-2xl font-bold text-emerald-400">{learnItems.length}</div>
                <div className="text-xs text-gray-400">Learn</div>
              </div>
              <div className="bg-slate-700/40 border border-slate-600 rounded-lg p-3">
                <div className="text-2xl font-bold text-blue-400">{reviewItems.length}</div>
                <div className="text-xs text-gray-400">Review</div>
              </div>
              <div className="bg-slate-700/40 border border-slate-600 rounded-lg p-3">
                <div className="text-2xl font-bold text-pink-400 capitalize">{sessionPlan.wmIntensity}</div>
                <div className="text-xs text-gray-400">WM</div>
              </div>
            </div>
            <div className="flex gap-2 mb-6 flex-wrap justify-center">
              {["📖 Learn", "🎯 Recall", "⚡ WM Drill", "🔁 Review"].map((step) => (
                <div key={step} className="bg-slate-700/50 border border-slate-600 rounded-full px-3 py-1 text-sm text-gray-300">
                  {step}
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setPhase(1)} className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600">
                Begin session
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

  if (currentPhase === "learn") {
    const item = learnItems[learnIdx];
    if (!item) {
      setPhase(2);
      setLearnIdx(0);
      return null;
    }

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <Card className="bg-slate-800 border-slate-700 w-full max-w-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-400">Learn · {learnIdx + 1} of {learnItems.length}</span>
            <Progress value={((phase + learnIdx / Math.max(1, learnItems.length)) / phases.length) * 100} className="w-32" />
          </div>
          <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4 mb-4">
            <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
            <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{item.content}</p>
            {(item.encoding?.association || item.encoding?.keyPoint || item.memoryPalace?.palaceName) && (
              <div className="mt-4 space-y-2 text-sm">
                {item.encoding?.association && <p className="text-pink-300">Association: {item.encoding.association}</p>}
                {item.encoding?.keyPoint && <p className="text-cyan-300">Key point: {item.encoding.keyPoint}</p>}
                {item.memoryPalace?.palaceName && (
                  <p className="text-fuchsia-300">Palace cue: {item.memoryPalace.palaceName}{item.memoryPalace.locus ? ` → ${item.memoryPalace.locus}` : ""}</p>
                )}
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500 text-center mb-4">Study this carefully. The next phase forces recall before revealing.</p>
          <Button
            onClick={() => {
              if (learnIdx < learnItems.length - 1) {
                setLearnIdx(learnIdx + 1);
              } else {
                setPhase(2);
                setLearnIdx(0);
              }
            }}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
          >
            {learnIdx < learnItems.length - 1 ? "Next item" : "Start recall"} <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </Card>
      </div>
    );
  }

  if (currentPhase === "recall") {
    const item = learnItems[learnIdx];
    if (!item) {
      setPhase(3);
      return null;
    }

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <Card className="bg-slate-800 border-slate-700 w-full max-w-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-400">Recall · {learnIdx + 1} of {learnItems.length}</span>
            <Progress value={((phase + learnIdx / Math.max(1, learnItems.length)) / phases.length) * 100} className="w-32" />
          </div>
          <p className="text-gray-400 text-sm mb-2">Without looking, write what you remember about:</p>
          <h3 className="text-xl font-bold text-white mb-4">{item.title}</h3>
          {!recallState.shown ? (
            <>
              <Textarea
                placeholder="Write what you remember..."
                value={recallState.answer}
                onChange={(e) => setRecallState((state) => ({ ...state, answer: e.target.value }))}
                className="bg-slate-700 border-slate-600 text-white mb-4 min-h-24"
              />
              <Button onClick={() => setRecallState((state) => ({ ...state, shown: true }))} className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600">
                Reveal answer
              </Button>
            </>
          ) : (
            <>
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 mb-4">
                <div className="text-xs text-green-400 font-semibold mb-2">Correct answer</div>
                <p className="text-gray-300 text-sm whitespace-pre-wrap">{item.content}</p>
                {item.encoding?.vividCue && <p className="text-pink-300 text-sm mt-2">Vivid cue: {item.encoding.vividCue}</p>}
              </div>
              <p className="text-xs text-gray-400 text-center mb-3">How well did you retrieve it?</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { q: 1, label: "Forgot" },
                  { q: 3, label: "Partial" },
                  { q: 5, label: "Strong" },
                ].map((button) => (
                  <Button
                    key={button.q}
                    variant="outline"
                    className="border-slate-600 text-white hover:bg-slate-700"
                    onClick={() => {
                      setScores((current) => [...current, button.q]);
                      setRecallState({ shown: false, answer: "" });
                      if (learnIdx < learnItems.length - 1) {
                        setLearnIdx(learnIdx + 1);
                      } else {
                        setPhase(3);
                      }
                    }}
                  >
                    {button.label}
                  </Button>
                ))}
              </div>
            </>
          )}
        </Card>
      </div>
    );
  }

  if (currentPhase === "working_memory") {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <Card className="bg-slate-800 border-slate-700 w-full max-w-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-400 flex items-center gap-1"><Zap className="w-4 h-4" /> Working memory drill</span>
            <Progress value={(phase / phases.length) * 100} className="w-24" />
          </div>

          {wmPhase === "show" && (
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-6">{wmChallenge.prompt}</p>
              <div className="flex gap-3 justify-center flex-wrap mb-6">
                {wmChallenge.items.map((item, index) => (
                  <div key={`${item}-${index}`} className="w-14 h-14 bg-slate-700/50 border border-slate-600 rounded-lg flex items-center justify-center text-2xl">
                    {item}
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500">Day {dayNumber} · {sessionPlan.wmIntensity} intensity</p>
            </div>
          )}

          {wmPhase === "delay" && (
            <div className="text-center py-8">
              <div className="text-5xl mb-4">👁️</div>
              <p className="text-gray-400">Hold it in mind...</p>
            </div>
          )}

          {wmPhase === "recall" && (
            <>
              <p className="text-gray-400 text-sm mb-4">Select the items in the original order.</p>
              <div className="flex gap-2 flex-wrap mb-4 justify-center">
                {wmShuffled.map((item, shuffledIdx) => {
                  const countInSequence = wmChallenge.items.filter((candidate) => candidate === item).length;
                  const countInInput = wmInput.filter((candidate) => candidate === item).length;
                  const canClick = countInInput < countInSequence;
                  return (
                    <Button
                      key={`${item}-${shuffledIdx}`}
                      onClick={() => {
                        if (canClick) setWmInput((current) => [...current, item]);
                      }}
                      className={`w-14 h-14 text-lg font-bold relative ${
                        countInInput >= countInSequence
                          ? "bg-green-500/20 border-green-500/50 text-green-400"
                          : "bg-slate-700/50 border-slate-600 text-white hover:bg-slate-600"
                      }`}
                      variant="outline"
                      disabled={!canClick}
                    >
                      {item}
                    </Button>
                  );
                })}
              </div>
              <p className="text-xs text-gray-500 mb-4">Sequence: {wmInput.join(" → ") || "—"}</p>
              {wmInput.length === wmChallenge.items.length && (
                <div className={`mb-4 p-3 rounded-lg text-sm ${wmIsCorrect ? "bg-green-500/10 border border-green-500/30 text-green-400" : "bg-red-500/10 border border-red-500/30 text-red-400"}`}>
                  {wmIsCorrect ? "Perfect sequence." : "Sequence was not exact. The app will keep the WM score modest today."}
                </div>
              )}
              <Button
                onClick={() => {
                  const wmScore = wmIsCorrect ? 5 : wmInput.length === wmChallenge.items.length ? 2 : 1;
                  setScores((current) => [...current, wmScore]);
                  setPhase(4);
                }}
                disabled={wmInput.length !== wmChallenge.items.length}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50"
              >
                Continue <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </>
          )}
        </Card>
      </div>
    );
  }

  if (currentPhase === "review") {
    if (reviewItems.length === 0) {
      setPhase(5);
      return null;
    }

    const item = reviewItems[reviewIdx];
    if (!item) {
      setPhase(5);
      return null;
    }

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <Card className="bg-slate-800 border-slate-700 w-full max-w-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-400">Review · {reviewIdx + 1} of {reviewItems.length}</span>
            <Progress value={((phase + reviewIdx / Math.max(1, reviewItems.length)) / phases.length) * 100} className="w-24" />
          </div>
          <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4">
            <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
            {!reviewShown ? (
              <>
                <p className="text-sm text-gray-400 mb-4">Retrieve first. Then reveal.</p>
                <Button onClick={() => setReviewShown(true)} className="w-full bg-slate-600 hover:bg-slate-500 text-white" variant="outline">
                  <Eye className="w-4 h-4 mr-2" /> Show answer
                </Button>
              </>
            ) : (
              <>
                <p className="text-gray-300 text-sm mb-3 whitespace-pre-wrap">{item.content}</p>
                {item.encoding?.association && <p className="text-pink-300 text-sm mb-2">Association cue: {item.encoding.association}</p>}
                {item.memoryPalace?.palaceName && (
                  <p className="text-fuchsia-300 text-sm mb-3">Palace cue: {item.memoryPalace.palaceName}{item.memoryPalace.locus ? ` → ${item.memoryPalace.locus}` : ""}</p>
                )}
                <p className="text-xs text-gray-400 text-center mb-3">How well did you remember?</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { q: 1, label: "Forgot", style: "bg-red-500/20 border-red-500/50 text-red-400" },
                    { q: 3, label: "Hard", style: "bg-yellow-500/20 border-yellow-500/50 text-yellow-400" },
                    { q: 4, label: "Good", style: "bg-blue-500/20 border-blue-500/50 text-blue-400" },
                    { q: 5, label: "Easy", style: "bg-green-500/20 border-green-500/50 text-green-400" },
                  ].map((button) => (
                    <Button key={button.q} onClick={() => rateRecall(item.id, button.q)} className={`border ${button.style}`} variant="outline" size="sm">
                      {button.label}
                    </Button>
                  ))}
                </div>
              </>
            )}
          </div>
        </Card>
      </div>
    );
  }

  if (currentPhase === "summary") {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <Card className="bg-slate-800 border-slate-700 w-full max-w-lg p-6 text-center">
          <div className="text-5xl mb-4">🏆</div>
          <h2 className="text-2xl font-bold text-white mb-2">Session complete</h2>
          <p className="text-gray-400 mb-6">You trained retrieval, working memory, and spaced review with {sessionPlan.label.toLowerCase()}.</p>
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-3">
              <div className="text-2xl font-bold text-cyan-400">{score}%</div>
              <div className="text-xs text-gray-400">Score</div>
            </div>
            <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-3">
              <div className="text-2xl font-bold text-blue-400">{reviewItems.length}</div>
              <div className="text-xs text-gray-400">Reviewed</div>
            </div>
            <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-3">
              <div className="text-2xl font-bold text-emerald-400">{learnItems.length}</div>
              <div className="text-xs text-gray-400">Learned</div>
            </div>
          </div>
          <Button onClick={() => onComplete(score)} className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600">
            Done
          </Button>
        </Card>
      </div>
    );
  }

  return null;
}
