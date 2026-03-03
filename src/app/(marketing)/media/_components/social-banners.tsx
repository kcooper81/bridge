import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  Check,
  Shield,
  Zap,
  BarChart3,
  Users,
  Send,
  AlertTriangle,
  Heart,
  Star,
  Search,
  MoreHorizontal,
  StickyNote,
  Share2,
  BookOpen,
  Activity,
} from "lucide-react";

/* ══════════════════════════════════════════════════
   SCENE MOCKUPS — contextual, feature-rich previews
   ══════════════════════════════════════════════════ */

/**
 * Scene 1: Prompt Vault — matches features page VaultMockup style
 * Stats, tabs, search, table with icons (Heart, Star, Template badges)
 */
function VaultScene({ className, compact }: { className?: string; compact?: boolean }) {
  const prompts = [
    { title: "Customer Onboarding Email", desc: "marketing, email, outreach", uses: 142, rating: 4.8, fav: true, template: false, updated: "2d ago" },
    { title: "Code Review Feedback", desc: "Review code and provide constructive fe...", uses: 89, rating: 4.0, fav: false, template: true, updated: "5d ago" },
    { title: "Weekly Status Update", desc: "Summarize progress this week in a clear...", uses: 67, rating: 0, fav: true, template: true, updated: "1w ago" },
    { title: "Sales Outreach Drafter", desc: "sales, outreach", uses: 34, rating: 3.0, fav: false, template: false, updated: "2w ago" },
  ];

  return (
    <div className={cn("relative", className)}>
      <div className="rounded-lg bg-white border border-zinc-200 overflow-hidden shadow-2xl">
        {/* Browser chrome */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-zinc-100 bg-zinc-50">
          <div className="w-1.5 h-1.5 rounded-full bg-red-400/70" />
          <div className="w-1.5 h-1.5 rounded-full bg-yellow-400/70" />
          <div className="w-1.5 h-1.5 rounded-full bg-green-400/70" />
          <div className="ml-2 flex-1 h-3.5 rounded bg-zinc-100 flex items-center px-2">
            <span className="text-[5px] text-zinc-400 font-medium">app.teamprompt.app</span>
          </div>
        </div>
        <div className="flex">
          {/* Sidebar */}
          {!compact && (
            <div className="w-14 border-r border-zinc-100 p-1.5 bg-white">
              <div className="flex items-center gap-1 mb-2 px-0.5">
                <div className="w-2.5 h-2.5 rounded bg-blue-500" />
                <span className="text-[4px] font-bold text-zinc-700">TeamPrompt</span>
              </div>
              <p className="text-[3px] font-bold uppercase text-zinc-300 px-0.5 mb-0.5">Workspace</p>
              {["Prompts", "Templates", "Guidelines", "Team"].map((n, i) => (
                <div key={n} className={cn("h-3 rounded px-1 flex items-center mb-0.5", i === 0 ? "bg-blue-50 border-l border-blue-500" : "")}>
                  <span className={cn("text-[4px] font-medium", i === 0 ? "text-blue-600" : "text-zinc-400")}>{n}</span>
                </div>
              ))}
              <p className="text-[3px] font-bold uppercase text-zinc-300 px-0.5 mt-1 mb-0.5">Intelligence</p>
              {["Analytics", "Security"].map((n) => (
                <div key={n} className="h-3 rounded px-1 flex items-center mb-0.5">
                  <span className="text-[4px] font-medium text-zinc-400">{n}</span>
                </div>
              ))}
            </div>
          )}
          {/* Content */}
          <div className="flex-1 p-1.5">
            {/* Stats row — icon + value + label like features page StatCard */}
            <div className="flex gap-1 mb-1">
              {[
                { icon: StickyNote, v: "8", l: "Prompts" },
                { icon: BarChart3, v: "142", l: "Uses" },
                { icon: Share2, v: "7", l: "Shared" },
                { icon: BookOpen, v: "1", l: "Guidelines" },
              ].map((s) => (
                <div key={s.l} className="flex-1 rounded border border-zinc-100 p-0.5 flex items-center gap-0.5">
                  <div className="w-3 h-3 rounded bg-blue-50 flex items-center justify-center shrink-0">
                    <s.icon className="w-1.5 h-1.5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-[5px] font-bold text-zinc-800 leading-none">{s.v}</p>
                    <p className="text-[3px] text-zinc-400">{s.l}</p>
                  </div>
                </div>
              ))}
            </div>
            {/* Tabs */}
            {!compact && (
              <div className="flex items-center gap-1.5 mb-1 border-b border-zinc-100 pb-0.5">
                {["All", "Draft", "Pending", "Approved", "Archived"].map((t, i) => (
                  <span key={t} className={cn("text-[4px] font-medium", i === 0 ? "text-blue-600 border-b border-blue-600 pb-0.5" : "text-zinc-400")}>{t}</span>
                ))}
              </div>
            )}
            {/* Search + filters */}
            {!compact && (
              <div className="flex items-center gap-1 mb-1">
                <div className="flex-1 h-3 rounded border border-zinc-100 bg-white px-1 flex items-center gap-0.5">
                  <Search className="h-1.5 w-1.5 text-zinc-300" />
                  <span className="text-[4px] text-zinc-400">Search prompts...</span>
                </div>
                <span className="text-[4px] text-zinc-400">All Categories</span>
              </div>
            )}
            {/* Table header */}
            <div className="flex items-center gap-0.5 py-0.5 text-[3px] font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-100 mb-0.5">
              <span className="w-2" />
              <span className="flex-1">Prompt</span>
              <span className="w-5 text-center">Uses</span>
              <span className="w-8 text-center">Rating</span>
              {!compact && <span className="w-6 text-right">Updated</span>}
              <span className="w-2" />
            </div>
            {/* Rows */}
            {(compact ? prompts.slice(0, 3) : prompts).map((p, i) => (
              <div key={i} className="flex items-center gap-0.5 py-0.5 border-b border-zinc-50 last:border-0">
                <Heart className={cn("w-1.5 h-1.5 shrink-0", p.fav ? "text-red-500 fill-red-500" : "text-zinc-200")} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-0.5">
                    <p className="text-[5px] text-zinc-700 font-medium truncate">{p.title}</p>
                    {p.template && <span className="text-[3px] bg-blue-50 text-blue-600 px-0.5 rounded font-bold">{"{}"} Template</span>}
                  </div>
                  {!compact && <p className="text-[3px] text-zinc-400 truncate">{p.desc}</p>}
                </div>
                <span className="w-5 text-center text-[4px] text-zinc-400 tabular-nums shrink-0">{p.uses}</span>
                <div className="w-8 flex items-center justify-center gap-[1px] shrink-0">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className={cn("w-1.5 h-1.5", s <= Math.floor(p.rating) ? "text-amber-400 fill-amber-400" : "text-zinc-200")} />
                  ))}
                </div>
                {!compact && <span className="w-6 text-right text-[3px] text-zinc-400 shrink-0">{p.updated}</span>}
                <MoreHorizontal className="w-1.5 h-1.5 text-zinc-300 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating badges */}
      <div className="absolute -top-2 -right-1 sm:-right-2 bg-blue-500 text-white rounded-full px-1.5 sm:px-2 py-0.5 shadow-lg shadow-blue-500/30 flex items-center gap-1">
        <Users className="h-2 w-2 sm:h-2.5 sm:w-2.5" />
        <span className="text-[5px] sm:text-[6px] font-bold whitespace-nowrap">Shared with 8 teams</span>
      </div>
      {!compact && (
        <div className="absolute -bottom-2 -left-1 sm:-left-2 bg-emerald-500 text-white rounded-full px-1.5 sm:px-2 py-0.5 shadow-lg shadow-emerald-500/30 flex items-center gap-1">
          <BarChart3 className="h-2 w-2 sm:h-2.5 sm:w-2.5" />
          <span className="text-[5px] sm:text-[6px] font-bold whitespace-nowrap">2,847 inserts this month</span>
        </div>
      )}
    </div>
  );
}

/**
 * Scene 2: DLP Block in action
 * Shows a sensitive data warning being caught in real time
 */
function DLPBlockScene({ className, compact }: { className?: string; compact?: boolean }) {
  return (
    <div className={cn("relative", className)}>
      {/* Extension popup — light theme */}
      <div className="rounded-lg bg-white border border-zinc-200 overflow-hidden shadow-2xl">
        {/* Extension header */}
        <div className="flex items-center justify-between px-2 py-1 border-b border-zinc-100">
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded bg-blue-500" />
            <span className="text-[5px] font-bold text-zinc-900">TeamPrompt</span>
          </div>
        </div>
        <div className="p-2 space-y-1.5">
          {/* Protected status */}
          <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200/50 rounded p-1.5">
            <Shield className="h-2.5 w-2.5 text-emerald-600" />
            <div>
              <p className="text-[5px] text-zinc-900 font-bold">Protected</p>
              <p className="text-[4px] text-zinc-500">17 active rules monitoring</p>
            </div>
          </div>
          {/* Stats */}
          <div className="flex gap-1">
            <div className="flex-1 rounded bg-zinc-50 border border-zinc-100 p-1 text-center">
              <p className="text-[7px] font-bold text-red-600">15</p>
              <p className="text-[3px] uppercase text-zinc-400 font-bold">Blocked</p>
            </div>
            <div className="flex-1 rounded bg-zinc-50 border border-zinc-100 p-1 text-center">
              <p className="text-[7px] font-bold text-amber-600">0</p>
              <p className="text-[3px] uppercase text-zinc-400 font-bold">Warned</p>
            </div>
            <div className="flex-1 rounded bg-zinc-50 border border-zinc-100 p-1 text-center">
              <p className="text-[7px] font-bold text-blue-600">15</p>
              <p className="text-[3px] uppercase text-zinc-400 font-bold">This Week</p>
            </div>
          </div>
          {/* Recent violations */}
          {!compact && (
            <>
              <p className="text-[4px] font-bold uppercase text-zinc-400 tracking-wider">Recent Activity</p>
              {["SSN detected — blocked", "API key found — blocked", "Patient name — blocked"].map((v, i) => (
                <div key={i} className="flex items-center justify-between py-0.5 border-b border-zinc-100 last:border-0">
                  <span className="text-[4px] text-zinc-600 truncate">{v}</span>
                  <span className="text-[4px] text-red-600 font-bold shrink-0">Blocked</span>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Floating: Shield badge */}
      <div className="absolute -top-2 -right-1 sm:-right-2 bg-red-500 text-white rounded-full px-1.5 sm:px-2 py-0.5 shadow-lg shadow-red-500/30 flex items-center gap-1">
        <Shield className="h-2 w-2 sm:h-2.5 sm:w-2.5" />
        <span className="text-[5px] sm:text-[6px] font-bold whitespace-nowrap">DLP Active</span>
      </div>
      {!compact && (
        <div className="absolute -bottom-2 -left-1 sm:-left-2 bg-amber-500 text-white rounded-full px-1.5 sm:px-2 py-0.5 shadow-lg shadow-amber-500/30 flex items-center gap-1">
          <AlertTriangle className="h-2 w-2 sm:h-2.5 sm:w-2.5" />
          <span className="text-[5px] sm:text-[6px] font-bold whitespace-nowrap">100% block rate</span>
        </div>
      )}
    </div>
  );
}

/**
 * Scene 3: Extension popup — matches features page ExtensionMockup style
 * Dark theme with search, tabs, filters, prompt cards with Hearts & Template labels
 */
function InsertScene({ className }: { className?: string }) {
  const prompts = [
    { title: "Code Review Feedback", desc: "Get thorough, constructive code review feedback f...", tags: ["development", "code-review"], template: true, inserting: true },
    { title: "Weekly Status Update", desc: "A template for writing weekly status updates...", tags: ["productivity", "template"], template: true, inserting: false },
  ];

  return (
    <div className={cn("relative", className)}>
      {/* Extension popup — light theme */}
      <div className="rounded-lg bg-white border border-zinc-200 overflow-hidden shadow-2xl">
        {/* Extension header */}
        <div className="flex items-center justify-between px-2 py-1 border-b border-zinc-100">
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded bg-blue-500" />
            <span className="text-[5px] font-bold text-zinc-900">TeamPrompt</span>
          </div>
          <div className="flex items-center gap-1">
            <Share2 className="w-1.5 h-1.5 text-zinc-400" />
          </div>
        </div>
        <div className="p-1.5 space-y-1">
          {/* Search */}
          <div className="bg-zinc-50 border border-zinc-100 rounded-md px-1.5 py-0.5 flex items-center gap-1">
            <Search className="h-1.5 w-1.5 text-zinc-400" />
            <span className="text-[4px] text-zinc-400">Search prompts...</span>
          </div>
          {/* Tabs */}
          <div className="flex gap-1.5 px-0.5">
            {["Faves", "Recent", "Prompts", "Security"].map((t, i) => (
              <span key={t} className={cn("text-[4px] font-medium pb-0.5", i === 0 ? "text-blue-600" : "text-zinc-400")}>{t}</span>
            ))}
          </div>
          {/* Filter row */}
          <div className="flex items-center gap-1">
            <span className="text-[3px] text-zinc-500 bg-zinc-50 border border-zinc-100 px-1 py-0.5 rounded">All categories</span>
            <span className="text-[3px] text-zinc-500 bg-zinc-50 border border-zinc-100 px-1 py-0.5 rounded">All tags</span>
          </div>
          {/* Prompt cards */}
          {prompts.map((p, i) => (
            <div key={i} className={cn(
              "rounded-md p-1 border",
              p.inserting ? "bg-emerald-50 border-emerald-200/60" : "bg-zinc-50 border-zinc-100"
            )}>
              <div className="flex items-center justify-between mb-0.5">
                <p className="text-[5px] text-zinc-900 font-medium truncate">{p.title}</p>
                <Heart className="w-1.5 h-1.5 text-zinc-300 shrink-0" />
              </div>
              {p.template && <span className="text-[3px] font-bold text-rose-500 mb-0.5 inline-block">Template</span>}
              <p className="text-[3px] text-zinc-500 leading-relaxed mb-0.5 truncate">{p.desc}</p>
              <div className="flex items-center gap-0.5">
                {p.tags.map((tag) => (
                  <span key={tag} className="text-[3px] bg-zinc-100 text-zinc-500 px-0.5 py-[1px] rounded">{tag}</span>
                ))}
                {p.inserting && (
                  <span className="text-[3px] text-emerald-600 font-bold ml-auto flex items-center gap-0.5">
                    <Send className="h-1.5 w-1.5" /> Inserted!
                  </span>
                )}
              </div>
            </div>
          ))}
          {/* Status bar */}
          <div className="flex items-center justify-between pt-0.5 border-t border-zinc-100">
            <div className="flex items-center gap-0.5">
              <Shield className="h-1.5 w-1.5 text-emerald-600" />
              <span className="text-[3px] text-emerald-600 font-medium">Security</span>
            </div>
            <span className="text-[3px] text-zinc-400">2 prompts</span>
          </div>
        </div>
      </div>

      {/* Floating: Insert success */}
      <div className="absolute -top-2 -right-1 sm:-right-2 bg-emerald-500 text-white rounded-full px-1.5 sm:px-2 py-0.5 shadow-lg shadow-emerald-500/30 flex items-center gap-1">
        <Send className="h-2 w-2 sm:h-2.5 sm:w-2.5" />
        <span className="text-[5px] sm:text-[6px] font-bold whitespace-nowrap">One-click insert</span>
      </div>

      {/* Floating: template variables */}
      <div className="absolute -bottom-2 -left-1 sm:-left-2 bg-purple-500 text-white rounded-full px-1.5 sm:px-2 py-0.5 shadow-lg shadow-purple-500/30 flex items-center gap-1">
        <Zap className="h-2 w-2 sm:h-2.5 sm:w-2.5" />
        <span className="text-[5px] sm:text-[6px] font-bold whitespace-nowrap">Variables auto-filled</span>
      </div>
    </div>
  );
}

/**
 * Scene 4: Analytics dashboard — matches features page AnalyticsMockup style
 * Icon stat cards, secondary stats, chart with date labels, dual panels
 */
function AnalyticsScene({ className, compact }: { className?: string; compact?: boolean }) {
  const bars = [20, 35, 25, 40, 55, 30, 45, 60, 40, 50, 35, 65, 45, 55, 70, 50, 60, 75, 55, 65, 45, 70, 80, 60, 70, 50, 75, 85, 65, 80];
  return (
    <div className={cn("relative", className)}>
      <div className="rounded-lg bg-white border border-zinc-200 overflow-hidden shadow-2xl">
        {/* Browser chrome */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-zinc-100 bg-zinc-50">
          <div className="w-1.5 h-1.5 rounded-full bg-red-400/70" />
          <div className="w-1.5 h-1.5 rounded-full bg-yellow-400/70" />
          <div className="w-1.5 h-1.5 rounded-full bg-green-400/70" />
          <div className="ml-2 flex-1 h-3.5 rounded bg-zinc-100 flex items-center px-2">
            <span className="text-[5px] text-zinc-400 font-medium">app.teamprompt.app/analytics</span>
          </div>
        </div>
        <div className="flex">
          {/* Sidebar */}
          {!compact && (
            <div className="w-14 border-r border-zinc-100 p-1.5 bg-white">
              <div className="flex items-center gap-1 mb-2 px-0.5">
                <div className="w-2.5 h-2.5 rounded bg-blue-500" />
                <span className="text-[4px] font-bold text-zinc-700">TeamPrompt</span>
              </div>
              <p className="text-[3px] font-bold uppercase text-zinc-300 px-0.5 mb-0.5">Workspace</p>
              {["Prompts", "Templates", "Team"].map((n) => (
                <div key={n} className="h-3 rounded px-1 flex items-center mb-0.5">
                  <span className="text-[4px] font-medium text-zinc-400">{n}</span>
                </div>
              ))}
              <p className="text-[3px] font-bold uppercase text-zinc-300 px-0.5 mt-1 mb-0.5">Intelligence</p>
              {["Analytics", "Activity Log", "Security"].map((n, i) => (
                <div key={n} className={cn("h-3 rounded px-1 flex items-center mb-0.5", i === 0 ? "bg-blue-50 border-l border-blue-500" : "")}>
                  <span className={cn("text-[4px] font-medium", i === 0 ? "text-blue-600" : "text-zinc-400")}>{n}</span>
                </div>
              ))}
            </div>
          )}
          {/* Content */}
          <div className="flex-1 p-1.5">
            {/* Primary stats — icon + value + label like features page StatCard */}
            <div className="flex gap-1 mb-1">
              {[
                { icon: StickyNote, v: "142", l: "Total Prompts" },
                { icon: BarChart3, v: "89", l: "Total Uses" },
                { icon: Star, v: "4.2", l: "Avg Rating" },
                { icon: Activity, v: "12", l: "This Week" },
              ].map((s) => (
                <div key={s.l} className="flex-1 rounded border border-zinc-100 p-0.5 flex items-center gap-0.5">
                  <div className="w-3 h-3 rounded bg-blue-50 flex items-center justify-center shrink-0">
                    <s.icon className="w-1.5 h-1.5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-[5px] font-bold text-zinc-800 leading-none">{s.v}</p>
                    <p className="text-[3px] text-zinc-400">{s.l}</p>
                  </div>
                </div>
              ))}
            </div>
            {/* Secondary stats */}
            {!compact && (
              <div className="flex gap-1 mb-1">
                {[
                  { l: "Week Trend", v: "+8%", icon: "↗" },
                  { l: "Members", v: "5", icon: "👥" },
                  { l: "Templates", v: "6", icon: "{}" },
                  { l: "Blocks", v: "15", icon: "🛡" },
                ].map((s) => (
                  <div key={s.l} className="flex-1 rounded border border-zinc-100 p-0.5">
                    <div className="flex items-center justify-between">
                      <p className="text-[3px] text-zinc-400">{s.l}</p>
                      <span className="text-[3px]">{s.icon}</span>
                    </div>
                    <p className="text-[5px] font-bold text-zinc-800">{s.v}</p>
                  </div>
                ))}
              </div>
            )}
            {/* Bar chart */}
            <div className="rounded border border-zinc-100 p-1 mb-1">
              <p className="text-[4px] text-zinc-500 mb-0.5 font-medium">Daily Usage — Last 30 Days</p>
              <div className="flex items-end gap-[1px] h-6">
                {(compact ? bars.slice(0, 12) : bars).map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t bg-blue-500/40"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
              <div className="flex justify-between mt-0.5">
                <span className="text-[3px] text-zinc-400">Jan 29</span>
                <span className="text-[3px] text-zinc-400">Feb 28</span>
              </div>
            </div>
            {/* Dual panels — Top Prompts + Usage by Member */}
            {!compact && (
              <div className="flex gap-1">
                <div className="flex-1 rounded border border-zinc-100 p-1">
                  <p className="text-[4px] text-zinc-700 font-semibold mb-0.5">Top Prompts</p>
                  {["Customer Email Reply", "Meeting Summary", "Code Review"].map((p, i) => (
                    <div key={i} className="flex items-center justify-between py-0.5 text-[4px]">
                      <span className="text-zinc-500">{i + 1}. {p}</span>
                      <span className="font-medium text-zinc-700 tabular-nums">{[42, 31, 18][i]}</span>
                    </div>
                  ))}
                </div>
                <div className="flex-1 rounded border border-zinc-100 p-1">
                  <p className="text-[4px] text-zinc-700 font-semibold mb-0.5">Usage by Member</p>
                  {["Alex J.", "Kate P.", "Sam R."].map((p, i) => (
                    <div key={i} className="flex items-center justify-between py-0.5 text-[4px]">
                      <span className="text-zinc-500">{p}</span>
                      <span className="font-medium text-zinc-700 tabular-nums">{[34, 28, 15][i]}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating: growth badge */}
      <div className="absolute -top-2 -right-1 sm:-right-2 bg-blue-500 text-white rounded-full px-1.5 sm:px-2 py-0.5 shadow-lg shadow-blue-500/30 flex items-center gap-1">
        <BarChart3 className="h-2 w-2 sm:h-2.5 sm:w-2.5" />
        <span className="text-[5px] sm:text-[6px] font-bold whitespace-nowrap">+23% this month</span>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   SHARED COMPONENTS
   ══════════════════════════════════════════════════ */

function FeaturePill({ label, dark }: { label: string; dark?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-medium whitespace-nowrap",
        dark
          ? "bg-zinc-100 text-zinc-700 border border-zinc-200"
          : "bg-white/10 text-white/90"
      )}
    >
      <Check className={cn("h-2.5 w-2.5", dark ? "text-blue-600" : "text-blue-400")} />
      {label}
    </span>
  );
}

function FeaturePills({ dark }: { dark?: boolean }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      <FeaturePill label="Shared Prompt Library" dark={dark} />
      <FeaturePill label="Data Protection" dark={dark} />
      <FeaturePill label="Usage Analytics" dark={dark} />
      <FeaturePill label="One-Click Insert" dark={dark} />
    </div>
  );
}

function CompatibilityLine({ dark, className }: { dark?: boolean; className?: string }) {
  const tools = ["ChatGPT", "Claude", "Gemini", "Copilot", "Perplexity"];
  return (
    <p
      className={cn(
        "text-[7px] sm:text-[8px] font-medium",
        dark ? "text-zinc-400" : "text-white/40",
        className
      )}
    >
      Works with {tools.join(" · ")}
    </p>
  );
}

function FeatureIconRow({ className }: { className?: string }) {
  const features = [
    { icon: Users, label: "Team Library" },
    { icon: Shield, label: "DLP Shield" },
    { icon: BarChart3, label: "Analytics" },
    { icon: Zap, label: "One-Click" },
  ];
  return (
    <div className={cn("flex items-center gap-3", className)}>
      {features.map((f) => (
        <div key={f.label} className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-md bg-blue-500/15 flex items-center justify-center">
            <f.icon className="h-3 w-3 text-blue-400" />
          </div>
          <span className="text-[8px] sm:text-[9px] font-medium text-white/70">{f.label}</span>
        </div>
      ))}
    </div>
  );
}

function FeatureIconRowDark({ className }: { className?: string }) {
  const features = [
    { icon: Users, label: "Team Library" },
    { icon: Shield, label: "DLP Shield" },
    { icon: BarChart3, label: "Analytics" },
    { icon: Zap, label: "One-Click" },
  ];
  return (
    <div className={cn("flex items-center gap-3", className)}>
      {features.map((f) => (
        <div key={f.label} className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-md bg-blue-500/10 flex items-center justify-center">
            <f.icon className="h-3 w-3 text-blue-600" />
          </div>
          <span className="text-[8px] sm:text-[9px] font-medium text-zinc-500">{f.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════
   BANNER SHELLS
   ══════════════════════════════════════════════════ */

function DarkBannerShell({
  aspectRatio,
  children,
  className,
}: {
  aspectRatio: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn("w-full rounded-xl overflow-hidden bg-[#0F1117]", className)}
      style={{ aspectRatio }}
    >
      <div className="w-full h-full relative p-4 sm:p-6 flex flex-col justify-between overflow-hidden">
        {/* Soft ambient glow behind mockup area */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 40% 50% at 72% 50%, rgba(37,99,235,0.06) 0%, transparent 70%)",
          }}
        />
        <div className="relative z-10 flex flex-col h-full">{children}</div>
      </div>
    </div>
  );
}

function WhiteBannerShell({
  aspectRatio,
  children,
  className,
}: {
  aspectRatio: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn("w-full rounded-xl overflow-hidden bg-white border border-zinc-200", className)}
      style={{ aspectRatio }}
    >
      <div className="w-full h-full relative p-4 sm:p-6 flex flex-col justify-between overflow-hidden">
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{
            background: "linear-gradient(90deg, #2563EB 0%, #60A5FA 50%, #2563EB 100%)",
          }}
        />
        <div className="relative z-10 flex flex-col h-full">{children}</div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   BANNERS — each uses a different scene
   ══════════════════════════════════════════════════ */

/* ── Twitter (1500 x 500) — Vault + DLP side by side ── */

export function TwitterBanner() {
  return (
    <DarkBannerShell aspectRatio="1500/500">
      <div className="flex items-center h-full gap-4 sm:gap-6">
        <div className="flex-1 space-y-2.5 sm:space-y-3 shrink-0">
          <Image src="/brand/logo-wordmark-white.svg" alt="TeamPrompt" width={160} height={32} className="h-5 sm:h-7 w-auto" />
          <p className="text-white/90 text-[10px] sm:text-sm font-semibold leading-snug max-w-[220px] sm:max-w-[260px]">
            Your team&apos;s AI prompt library — with built-in data protection
          </p>
          <FeatureIconRow />
          <CompatibilityLine />
        </div>
        <div className="hidden sm:flex w-[50%] gap-3 items-start">
          <VaultScene className="flex-1" compact />
          <DLPBlockScene className="flex-1" compact />
        </div>
      </div>
    </DarkBannerShell>
  );
}

export function TwitterBannerWhite() {
  return (
    <WhiteBannerShell aspectRatio="1500/500">
      <div className="flex items-center h-full gap-4 sm:gap-6">
        <div className="flex-1 space-y-2.5 sm:space-y-3 shrink-0">
          <Image src="/brand/logo-wordmark.svg" alt="TeamPrompt" width={160} height={32} className="h-5 sm:h-7 w-auto" />
          <p className="text-zinc-900 text-[10px] sm:text-sm font-semibold leading-snug max-w-[220px] sm:max-w-[260px]">
            Your team&apos;s AI prompt library — with built-in data protection
          </p>
          <FeatureIconRowDark />
          <CompatibilityLine dark />
        </div>
        <div className="hidden sm:flex w-[50%] gap-3 items-start">
          <VaultScene className="flex-1" compact />
          <DLPBlockScene className="flex-1" compact />
        </div>
      </div>
    </WhiteBannerShell>
  );
}

/* ── LinkedIn (1584 x 396) — Vault scene ───────────── */

export function LinkedInBanner() {
  return (
    <DarkBannerShell aspectRatio="1584/396">
      <div className="flex items-center h-full gap-4 sm:gap-6">
        <div className="flex-1 space-y-2 sm:space-y-2.5">
          <Image src="/brand/logo-wordmark-white.svg" alt="TeamPrompt" width={150} height={30} className="h-5 sm:h-6 w-auto" />
          <p className="text-white/90 text-[10px] sm:text-xs font-semibold leading-snug">
            AI prompt management for teams that need data protection
          </p>
          <FeatureIconRow />
          <CompatibilityLine />
        </div>
        <div className="hidden sm:block w-[38%]">
          <VaultScene />
        </div>
      </div>
    </DarkBannerShell>
  );
}

export function LinkedInBannerWhite() {
  return (
    <WhiteBannerShell aspectRatio="1584/396">
      <div className="flex items-center h-full gap-4 sm:gap-6">
        <div className="flex-1 space-y-2 sm:space-y-2.5">
          <Image src="/brand/logo-wordmark.svg" alt="TeamPrompt" width={150} height={30} className="h-5 sm:h-6 w-auto" />
          <p className="text-zinc-900 text-[10px] sm:text-xs font-semibold leading-snug">
            AI prompt management for teams that need data protection
          </p>
          <FeatureIconRowDark />
          <CompatibilityLine dark />
        </div>
        <div className="hidden sm:block w-[38%]">
          <VaultScene />
        </div>
      </div>
    </WhiteBannerShell>
  );
}

/* ── Facebook (851 x 315) — Insert scene ───────────── */

export function FacebookCover() {
  return (
    <DarkBannerShell aspectRatio="851/315">
      <div className="flex items-center h-full gap-3 sm:gap-4">
        <div className="flex-1 space-y-2">
          <Image src="/brand/logo-wordmark-white.svg" alt="TeamPrompt" width={130} height={26} className="h-4 sm:h-5 w-auto" />
          <p className="text-white/90 text-[9px] sm:text-xs font-semibold leading-snug">
            Shared prompts · Data protection · Usage analytics
          </p>
          <CompatibilityLine />
        </div>
        <div className="hidden sm:block w-[30%]">
          <InsertScene />
        </div>
      </div>
    </DarkBannerShell>
  );
}

export function FacebookCoverWhite() {
  return (
    <WhiteBannerShell aspectRatio="851/315">
      <div className="flex items-center h-full gap-3 sm:gap-4">
        <div className="flex-1 space-y-2">
          <Image src="/brand/logo-wordmark.svg" alt="TeamPrompt" width={130} height={26} className="h-4 sm:h-5 w-auto" />
          <p className="text-zinc-900 text-[9px] sm:text-xs font-semibold leading-snug">
            Shared prompts · Data protection · Usage analytics
          </p>
          <CompatibilityLine dark />
        </div>
        <div className="hidden sm:block w-[30%]">
          <InsertScene />
        </div>
      </div>
    </WhiteBannerShell>
  );
}

/* ── YouTube (2560 x 1440) — All 4 scenes ──────────── */

export function YouTubeBanner() {
  return (
    <DarkBannerShell aspectRatio="2560/1440">
      <div className="flex flex-col items-center justify-center h-full text-center gap-3 sm:gap-4">
        <Image src="/brand/logo-wordmark-white.svg" alt="TeamPrompt" width={200} height={40} className="h-6 sm:h-8 w-auto" />
        <p className="text-white/90 text-xs sm:text-base font-semibold max-w-md">
          Your team&apos;s AI prompt library — with built-in data protection
        </p>
        <FeaturePills />
        <div className="grid grid-cols-2 gap-3 w-full max-w-md">
          <VaultScene compact />
          <DLPBlockScene compact />
          <InsertScene />
          <AnalyticsScene />
        </div>
        <CompatibilityLine />
      </div>
    </DarkBannerShell>
  );
}

/* ── OG (1200 x 630) — Vault + DLP layered ─────────── */

export function OGBanner() {
  return (
    <DarkBannerShell aspectRatio="1200/630">
      <div className="flex items-center h-full gap-4 sm:gap-6">
        <div className="flex-1 space-y-2.5 sm:space-y-3">
          <Image src="/brand/logo-wordmark-white.svg" alt="TeamPrompt" width={180} height={36} className="h-5 sm:h-7 w-auto" />
          <p className="text-white/90 text-xs sm:text-base font-bold leading-snug">
            AI Prompt Management
            <br />
            for Teams
          </p>
          <FeatureIconRow />
          <CompatibilityLine />
        </div>
        <div className="w-[45%] space-y-2">
          <VaultScene compact />
          <DLPBlockScene compact />
        </div>
      </div>
    </DarkBannerShell>
  );
}

export function OGBannerWhite() {
  return (
    <WhiteBannerShell aspectRatio="1200/630">
      <div className="flex items-center h-full gap-4 sm:gap-6">
        <div className="flex-1 space-y-2.5 sm:space-y-3">
          <Image src="/brand/logo-wordmark.svg" alt="TeamPrompt" width={180} height={36} className="h-5 sm:h-7 w-auto" />
          <p className="text-zinc-900 text-xs sm:text-base font-bold leading-snug">
            AI Prompt Management
            <br />
            for Teams
          </p>
          <FeatureIconRowDark />
          <CompatibilityLine dark />
        </div>
        <div className="w-[45%] space-y-2">
          <VaultScene compact />
          <DLPBlockScene compact />
        </div>
      </div>
    </WhiteBannerShell>
  );
}

/* ══════════════════════════════════════════════════
   MOCKUP VARIANTS — decorative shapes + staggered app screenshots
   Rounded rectangle "lifestyle" shapes with overlapping product mockups
   ══════════════════════════════════════════════════ */

/**
 * Decorative rounded squares — abstract background shapes that give a
 * lifestyle feel without using stock photography.
 */
function DecoShapes({ variant = "default" }: { variant?: "default" | "alt" | "center" }) {
  if (variant === "center") {
    return (
      <>
        <div className="absolute top-[5%] left-[50%] w-[30%] h-[60%] rounded-3xl bg-blue-500/[0.06] -rotate-6" />
        <div className="absolute bottom-[8%] right-[15%] w-[25%] h-[50%] rounded-3xl bg-purple-500/[0.05] rotate-3" />
        <div className="absolute top-[15%] left-[20%] w-[20%] h-[40%] rounded-3xl bg-blue-400/[0.04] rotate-12" />
        <div className="absolute bottom-[5%] left-[40%] w-[18%] h-[35%] rounded-2xl bg-indigo-500/[0.04] -rotate-3" />
      </>
    );
  }
  if (variant === "alt") {
    return (
      <>
        <div className="absolute top-[8%] right-[5%] w-[28%] h-[55%] rounded-3xl bg-blue-500/[0.06] rotate-6" />
        <div className="absolute bottom-[5%] right-[20%] w-[22%] h-[45%] rounded-3xl bg-purple-500/[0.05] -rotate-3" />
        <div className="absolute top-[20%] right-[30%] w-[15%] h-[35%] rounded-2xl bg-indigo-400/[0.04] rotate-12" />
      </>
    );
  }
  return (
    <>
      <div className="absolute top-[5%] right-[3%] w-[30%] h-[65%] rounded-3xl bg-blue-500/[0.06] -rotate-3" />
      <div className="absolute bottom-[3%] right-[15%] w-[25%] h-[50%] rounded-3xl bg-purple-500/[0.05] rotate-6" />
      <div className="absolute top-[15%] right-[25%] w-[18%] h-[40%] rounded-2xl bg-blue-400/[0.04] rotate-12" />
      <div className="absolute bottom-[10%] right-[40%] w-[12%] h-[30%] rounded-2xl bg-indigo-500/[0.03] -rotate-6" />
    </>
  );
}

/** Mockup banner shell — gradient background with decorative shapes */
function MockupBannerShell({
  aspectRatio,
  children,
  className,
  shapeVariant = "default",
}: {
  aspectRatio: string;
  children: React.ReactNode;
  className?: string;
  shapeVariant?: "default" | "alt" | "center";
}) {
  return (
    <div
      className={cn("w-full rounded-xl overflow-hidden relative bg-[#0A0E1A]", className)}
      style={{ aspectRatio }}
    >
      {/* Subtle radial gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: [
            "radial-gradient(ellipse 60% 50% at 70% 40%, rgba(37,99,235,0.08) 0%, transparent 70%)",
            "radial-gradient(ellipse 40% 40% at 30% 70%, rgba(139,92,246,0.05) 0%, transparent 60%)",
          ].join(", "),
        }}
      />
      {/* Decorative rounded shapes */}
      <DecoShapes variant={shapeVariant} />
      {/* Blue accent edge */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1 z-20"
        style={{ background: "linear-gradient(90deg, #2563EB 0%, #60A5FA 50%, #2563EB 100%)" }}
      />
      {/* Content */}
      <div className="absolute inset-0 p-4 sm:p-6 flex flex-col justify-between z-10">
        {children}
      </div>
    </div>
  );
}

/** Staggered screenshot mockup — overlapping, slightly offset with shadow */
function StaggeredMockup({
  screenshots,
  className,
}: {
  screenshots: { src: string; alt: string }[];
  className?: string;
}) {
  if (screenshots.length === 1) {
    return (
      <div className={cn("relative", className)}>
        <div className="rounded-xl overflow-hidden shadow-2xl shadow-black/50 border border-white/10">
          <Image src={screenshots[0].src} alt={screenshots[0].alt} width={1280} height={800} className="w-full h-auto" />
        </div>
      </div>
    );
  }

  if (screenshots.length === 2) {
    return (
      <div className={cn("relative", className)}>
        {/* Back card — offset up-left */}
        <div className="absolute top-0 left-0 w-[85%] rounded-xl overflow-hidden shadow-xl shadow-black/30 border border-white/[0.08]">
          <Image src={screenshots[1].src} alt={screenshots[1].alt} width={1280} height={800} className="w-full h-auto" />
        </div>
        {/* Front card — offset down-right, on top */}
        <div className="relative ml-[15%] mt-[10%] w-[85%] rounded-xl overflow-hidden shadow-2xl shadow-black/50 border border-white/10">
          <Image src={screenshots[0].src} alt={screenshots[0].alt} width={1280} height={800} className="w-full h-auto" />
        </div>
      </div>
    );
  }

  // 3+ screenshots — staggered stack
  return (
    <div className={cn("relative", className)}>
      {screenshots.slice(0, 3).map((ss, i) => {
        const offsets = [
          "top-0 left-0 w-[75%]",
          "absolute top-[8%] left-[12%] w-[78%]",
          "absolute top-[16%] left-[24%] w-[76%]",
        ];
        const zIndex = (i + 1) * 10;
        return (
          <div
            key={ss.src}
            className={cn(
              i > 0 ? offsets[i] : offsets[0],
              "rounded-xl overflow-hidden border border-white/10",
              i === screenshots.length - 1 || i === 2
                ? "shadow-2xl shadow-black/50"
                : "shadow-lg shadow-black/30"
            )}
            style={{ zIndex, position: i === 0 ? "relative" : "absolute" }}
          >
            <Image src={ss.src} alt={ss.alt} width={1280} height={800} className="w-full h-auto" />
          </div>
        );
      })}
    </div>
  );
}

/* ── Twitter Gradient (1500 x 500) — prompts + extension staggered ── */

export function TwitterBannerGradient() {
  return (
    <MockupBannerShell aspectRatio="1500/500">
      <div className="flex items-center h-full gap-4 sm:gap-6">
        <div className="flex-1 space-y-2 sm:space-y-2.5 shrink-0 max-w-[45%]">
          <Image src="/brand/logo-wordmark-white.svg" alt="TeamPrompt" width={160} height={32} className="h-5 sm:h-7 w-auto" />
          <p className="text-white text-[10px] sm:text-sm font-bold leading-snug">
            Your team&apos;s AI prompt library — with built-in data protection
          </p>
          <FeaturePills />
          <CompatibilityLine />
        </div>
        <div className="hidden sm:block w-[50%]">
          <StaggeredMockup
            screenshots={[
              { src: "/store-assets/screenshot-light-1-prompts.png", alt: "Prompt library" },
              { src: "/store-assets/screenshot-light-4-popup.png", alt: "Extension popup" },
            ]}
          />
        </div>
      </div>
    </MockupBannerShell>
  );
}

/* ── LinkedIn Gradient (1584 x 396) — guardrails + prompts staggered ── */

export function LinkedInBannerGradient() {
  return (
    <MockupBannerShell aspectRatio="1584/396" shapeVariant="alt">
      <div className="flex items-center h-full gap-4 sm:gap-6">
        <div className="flex-1 space-y-2 sm:space-y-2.5 max-w-[40%]">
          <Image src="/brand/logo-wordmark-white.svg" alt="TeamPrompt" width={150} height={30} className="h-5 sm:h-6 w-auto" />
          <p className="text-white text-[10px] sm:text-xs font-bold leading-snug">
            AI prompt management for teams that need data protection
          </p>
          <FeaturePills />
          <CompatibilityLine />
        </div>
        <div className="hidden sm:block w-[50%]">
          <StaggeredMockup
            screenshots={[
              { src: "/store-assets/screenshot-light-3-dlp-block.png", alt: "Data protection" },
              { src: "/store-assets/screenshot-light-1-prompts.png", alt: "Prompt library" },
            ]}
          />
        </div>
      </div>
    </MockupBannerShell>
  );
}

/* ── Facebook Gradient (851 x 315) — extension insert ── */

export function FacebookCoverGradient() {
  return (
    <MockupBannerShell aspectRatio="851/315" shapeVariant="alt">
      <div className="flex items-center h-full gap-3 sm:gap-4">
        <div className="flex-1 space-y-1.5 sm:space-y-2 max-w-[40%]">
          <Image src="/brand/logo-wordmark-white.svg" alt="TeamPrompt" width={130} height={26} className="h-4 sm:h-5 w-auto" />
          <p className="text-white text-[9px] sm:text-xs font-bold leading-snug">
            Shared prompts · Data protection · Usage analytics
          </p>
          <FeaturePills />
        </div>
        <div className="hidden sm:block w-[50%]">
          <StaggeredMockup
            screenshots={[
              { src: "/store-assets/screenshot-light-6-insert.png", alt: "Insert prompt" },
              { src: "/store-assets/screenshot-light-5-template.png", alt: "Template variables" },
            ]}
          />
        </div>
      </div>
    </MockupBannerShell>
  );
}

/* ── YouTube Gradient (2560 x 1440) — 3 staggered product views ── */

export function YouTubeBannerGradient() {
  return (
    <MockupBannerShell aspectRatio="2560/1440" shapeVariant="center">
      <div className="flex flex-col items-center justify-center h-full text-center gap-3 sm:gap-4">
        <Image src="/brand/logo-wordmark-white.svg" alt="TeamPrompt" width={200} height={40} className="h-6 sm:h-8 w-auto" />
        <p className="text-white text-xs sm:text-base font-bold max-w-md">
          Your team&apos;s AI prompt library — with built-in data protection
        </p>
        <FeaturePills />
        <div className="w-full max-w-lg mt-1">
          <StaggeredMockup
            screenshots={[
              { src: "/store-assets/screenshot-light-1-prompts.png", alt: "Prompt library" },
              { src: "/store-assets/screenshot-light-3-dlp-block.png", alt: "Data protection" },
              { src: "/store-assets/screenshot-light-6-insert.png", alt: "Insert prompt" },
            ]}
          />
        </div>
        <CompatibilityLine className="mt-2" />
      </div>
    </MockupBannerShell>
  );
}

/* ── OG Gradient (1200 x 630) — prompts + guardrails staggered ── */

export function OGBannerGradient() {
  return (
    <MockupBannerShell aspectRatio="1200/630">
      <div className="flex items-center h-full gap-4 sm:gap-6">
        <div className="flex-1 space-y-2.5 sm:space-y-3 max-w-[40%]">
          <Image src="/brand/logo-wordmark-white.svg" alt="TeamPrompt" width={180} height={36} className="h-5 sm:h-7 w-auto" />
          <p className="text-white text-xs sm:text-base font-bold leading-snug">
            AI Prompt Management
            <br />
            for Teams
          </p>
          <FeaturePills />
          <CompatibilityLine />
        </div>
        <div className="w-[55%]">
          <StaggeredMockup
            screenshots={[
              { src: "/store-assets/screenshot-light-1-prompts.png", alt: "Prompt library" },
              { src: "/store-assets/screenshot-light-3-dlp-block.png", alt: "Data protection" },
            ]}
          />
        </div>
      </div>
    </MockupBannerShell>
  );
}

/* ══════════════════════════════════════════════════
   LIFESTYLE VARIANTS — contained stock photo + app mockup + snippet chips
   QuickBooks-style: photo as a design element, not a background
   ══════════════════════════════════════════════════ */

/** Lifestyle banner shell — dark bg with radial glow and blue accent */
function LifestyleBannerShell({
  aspectRatio,
  children,
  className,
}: {
  aspectRatio: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn("w-full rounded-xl overflow-hidden relative bg-[#0A0E1A]", className)}
      style={{ aspectRatio }}
    >
      {/* Radial glow */}
      <div
        className="absolute inset-0"
        style={{
          background: [
            "radial-gradient(ellipse 50% 60% at 65% 50%, rgba(37,99,235,0.10) 0%, transparent 70%)",
            "radial-gradient(ellipse 30% 40% at 35% 60%, rgba(139,92,246,0.05) 0%, transparent 60%)",
          ].join(", "),
        }}
      />
      {/* Blue accent bottom edge */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1 z-20"
        style={{ background: "linear-gradient(90deg, #2563EB 0%, #60A5FA 50%, #2563EB 100%)" }}
      />
      {/* Content */}
      <div className="absolute inset-0 p-4 sm:p-6 flex flex-col justify-between z-10">
        {children}
      </div>
    </div>
  );
}

/** Contained lifestyle photo — rounded, shadowed, with ambient glow + edge overlays */
function LifestylePhoto({
  src,
  alt,
  className,
  rotate = 0,
}: {
  src: string;
  alt: string;
  className?: string;
  rotate?: number;
}) {
  return (
    <div
      className={cn("relative", className)}
      style={{ transform: rotate ? `rotate(${rotate}deg)` : undefined }}
    >
      {/* Ambient glow behind the photo */}
      <div className="absolute -inset-2 rounded-3xl bg-gradient-to-br from-blue-500/20 via-purple-500/10 to-transparent blur-xl opacity-50" />
      <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-black/40 ring-1 ring-white/10">
        <Image
          src={src}
          alt={alt}
          width={800}
          height={534}
          className="w-full h-full object-cover"
          unoptimized
        />
        {/* Multi-layer dark edge overlay for blending */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0E1A]/50 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A0E1A]/35 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,transparent_50%,rgba(10,14,26,0.25)_100%)]" />
      </div>
    </div>
  );
}

/** Floating snippet chip — pill badge with icon + text */
function SnippetChip({
  icon: Icon,
  label,
  color,
  className,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  color: "red" | "blue" | "amber" | "emerald";
  className?: string;
}) {
  const colorMap = {
    red: "bg-red-500 shadow-red-500/30",
    blue: "bg-blue-500 shadow-blue-500/30",
    amber: "bg-amber-500 shadow-amber-500/30",
    emerald: "bg-emerald-500 shadow-emerald-500/30",
  };
  return (
    <div
      className={cn(
        "absolute text-white rounded-full px-1.5 sm:px-2 py-0.5 shadow-lg flex items-center gap-1 whitespace-nowrap",
        colorMap[color],
        className
      )}
    >
      <Icon className="h-2 w-2 sm:h-2.5 sm:w-2.5" />
      <span className="text-[5px] sm:text-[6px] font-bold">{label}</span>
    </div>
  );
}

/* ── Unsplash photo URLs (free license) — vibrant, energetic lifestyle shots ── */
const lifestylePhotos = {
  twitter: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&q=80&auto=format&fit=crop",   // diverse team animated brainstorm
  linkedin: "https://images.unsplash.com/photo-1521737852567-6949f3f9f2b5?w=800&q=80&auto=format&fit=crop",  // team high-fiving, energetic
  facebook: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80&auto=format&fit=crop",   // group laughing at laptop, casual
  youtube: "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&q=80&auto=format&fit=crop",       // young professionals colorful setting
  og: "https://images.unsplash.com/photo-1552581234-26160f608093?w=800&q=80&auto=format&fit=crop",            // person at laptop, warm light
};

/* ── Twitter Lifestyle (1500 x 500) ── */

export function TwitterBannerLifestyle() {
  return (
    <LifestyleBannerShell aspectRatio="1500/500">
      <div className="flex items-center h-full gap-4 sm:gap-6">
        <div className="flex-1 space-y-2 sm:space-y-2.5 shrink-0 max-w-[40%]">
          <Image src="/brand/logo-wordmark-white.svg" alt="TeamPrompt" width={160} height={32} className="h-5 sm:h-7 w-auto" />
          <p className="text-white text-[10px] sm:text-sm font-bold leading-snug">
            Your team&apos;s AI prompt library — with built-in data protection
          </p>
          <FeaturePills />
          <CompatibilityLine />
        </div>
        <div className="hidden sm:flex w-[55%] items-center gap-3 relative">
          <LifestylePhoto
            src={lifestylePhotos.twitter}
            alt="Diverse team in animated brainstorm session"
            className="w-[55%] aspect-[4/3]"
            rotate={-1}
          />
          <div className="w-[50%] -ml-4">
            <VaultScene compact />
          </div>
          <SnippetChip icon={Shield} label="3 blocked" color="red" className="-top-2 right-[30%]" />
          <SnippetChip icon={Users} label="Shared with team" color="blue" className="bottom-0 left-[10%]" />
          <SnippetChip icon={Zap} label="142 prompts used" color="emerald" className="-bottom-2 right-[5%]" />
        </div>
      </div>
    </LifestyleBannerShell>
  );
}

/* ── LinkedIn Lifestyle (1584 x 396) ── */

export function LinkedInBannerLifestyle() {
  return (
    <LifestyleBannerShell aspectRatio="1584/396">
      <div className="flex items-center h-full gap-4 sm:gap-6">
        <div className="flex-1 space-y-2 sm:space-y-2.5 max-w-[38%]">
          <Image src="/brand/logo-wordmark-white.svg" alt="TeamPrompt" width={150} height={30} className="h-5 sm:h-6 w-auto" />
          <p className="text-white text-[10px] sm:text-xs font-bold leading-snug">
            AI prompt management for teams that need data protection
          </p>
          <FeaturePills />
          <CompatibilityLine />
        </div>
        <div className="hidden sm:flex w-[55%] items-center gap-3 relative">
          <LifestylePhoto
            src={lifestylePhotos.linkedin}
            alt="Energetic team celebrating a win"
            className="w-[50%] aspect-[4/3]"
            rotate={1}
          />
          <div className="w-[50%] -ml-3">
            <DLPBlockScene compact />
          </div>
          <SnippetChip icon={AlertTriangle} label="Warning: PII detected" color="amber" className="-top-2 right-[25%]" />
          <SnippetChip icon={Shield} label="DLP Active" color="red" className="bottom-0 left-[5%]" />
          <SnippetChip icon={Zap} label="142 prompts used" color="emerald" className="-bottom-2 right-[10%]" />
        </div>
      </div>
    </LifestyleBannerShell>
  );
}

/* ── Facebook Lifestyle (851 x 315) ── */

export function FacebookCoverLifestyle() {
  return (
    <LifestyleBannerShell aspectRatio="851/315">
      <div className="flex items-center h-full gap-3 sm:gap-4">
        <div className="flex-1 space-y-1.5 sm:space-y-2 max-w-[38%]">
          <Image src="/brand/logo-wordmark-white.svg" alt="TeamPrompt" width={130} height={26} className="h-4 sm:h-5 w-auto" />
          <p className="text-white text-[9px] sm:text-xs font-bold leading-snug">
            Shared prompts · Data protection · Usage analytics
          </p>
          <FeaturePills />
        </div>
        <div className="hidden sm:flex w-[55%] items-center gap-2 relative">
          <LifestylePhoto
            src={lifestylePhotos.facebook}
            alt="Group of colleagues laughing at laptop"
            className="w-[50%] aspect-[4/3]"
            rotate={-1}
          />
          <div className="w-[50%] -ml-3">
            <InsertScene />
          </div>
          <SnippetChip icon={Shield} label="3 blocked" color="red" className="-top-2 right-[20%]" />
          <SnippetChip icon={Users} label="Shared with team" color="blue" className="-bottom-1 left-[8%]" />
          <SnippetChip icon={Zap} label="142 prompts used" color="emerald" className="-bottom-2 right-[5%]" />
        </div>
      </div>
    </LifestyleBannerShell>
  );
}

/* ── YouTube Lifestyle (2560 x 1440) ── */

export function YouTubeBannerLifestyle() {
  return (
    <LifestyleBannerShell aspectRatio="2560/1440">
      <div className="flex flex-col items-center justify-center h-full text-center gap-3 sm:gap-4">
        <Image src="/brand/logo-wordmark-white.svg" alt="TeamPrompt" width={200} height={40} className="h-6 sm:h-8 w-auto" />
        <p className="text-white text-xs sm:text-base font-bold max-w-md">
          Your team&apos;s AI prompt library — with built-in data protection
        </p>
        <FeaturePills />
        <div className="w-full max-w-lg mt-1 relative">
          <div className="flex items-start gap-3">
            <LifestylePhoto
              src={lifestylePhotos.youtube}
              alt="Young professionals in a colorful workspace"
              className="w-[45%] aspect-[4/3]"
              rotate={-2}
            />
            <div className="w-[55%] space-y-2">
              <VaultScene compact />
              <DLPBlockScene compact />
            </div>
          </div>
          <SnippetChip icon={Shield} label="3 blocked" color="red" className="-top-2 right-[15%]" />
          <SnippetChip icon={Users} label="Shared with team" color="blue" className="top-[40%] -left-3" />
          <SnippetChip icon={AlertTriangle} label="Warning: PII detected" color="amber" className="bottom-[30%] -right-2" />
          <SnippetChip icon={Zap} label="142 prompts used" color="emerald" className="-bottom-2 left-[30%]" />
        </div>
        <CompatibilityLine className="mt-2" />
      </div>
    </LifestyleBannerShell>
  );
}

/* ── OG Lifestyle (1200 x 630) ── */

export function OGBannerLifestyle() {
  return (
    <LifestyleBannerShell aspectRatio="1200/630">
      <div className="flex items-center h-full gap-4 sm:gap-6">
        <div className="flex-1 space-y-2.5 sm:space-y-3 max-w-[38%]">
          <Image src="/brand/logo-wordmark-white.svg" alt="TeamPrompt" width={180} height={36} className="h-5 sm:h-7 w-auto" />
          <p className="text-white text-xs sm:text-base font-bold leading-snug">
            AI Prompt Management
            <br />
            for Teams
          </p>
          <FeaturePills />
          <CompatibilityLine />
        </div>
        <div className="w-[55%] relative">
          <div className="flex items-start gap-3">
            <LifestylePhoto
              src={lifestylePhotos.og}
              alt="Person working at laptop in warm light"
              className="w-[50%] aspect-[4/3]"
              rotate={1}
            />
            <div className="w-[50%] space-y-2 -ml-2">
              <VaultScene compact />
              <DLPBlockScene compact />
            </div>
          </div>
          <SnippetChip icon={Shield} label="DLP Active" color="red" className="-top-2 right-[20%]" />
          <SnippetChip icon={Users} label="Shared with team" color="blue" className="top-[35%] -left-2" />
          <SnippetChip icon={AlertTriangle} label="Warning: PII detected" color="amber" className="-bottom-1 right-[10%]" />
          <SnippetChip icon={Zap} label="142 prompts used" color="emerald" className="-bottom-2 left-[25%]" />
        </div>
      </div>
    </LifestyleBannerShell>
  );
}

/* ── Export map ──────────────────────────────────── */

export const socialBannerComponents = {
  twitter: { Component: TwitterBanner, label: "X (Twitter) Header — Dark", dims: "1500 x 500" },
  twitterWhite: { Component: TwitterBannerWhite, label: "X (Twitter) Header — White", dims: "1500 x 500" },
  twitterGradient: { Component: TwitterBannerGradient, label: "X (Twitter) Header — Gradient", dims: "1500 x 500" },
  twitterLifestyle: { Component: TwitterBannerLifestyle, label: "X (Twitter) Header — Lifestyle", dims: "1500 x 500" },
  linkedin: { Component: LinkedInBanner, label: "LinkedIn Cover — Dark", dims: "1584 x 396" },
  linkedinWhite: { Component: LinkedInBannerWhite, label: "LinkedIn Cover — White", dims: "1584 x 396" },
  linkedinGradient: { Component: LinkedInBannerGradient, label: "LinkedIn Cover — Gradient", dims: "1584 x 396" },
  linkedinLifestyle: { Component: LinkedInBannerLifestyle, label: "LinkedIn Cover — Lifestyle", dims: "1584 x 396" },
  facebook: { Component: FacebookCover, label: "Facebook Cover — Dark", dims: "851 x 315" },
  facebookWhite: { Component: FacebookCoverWhite, label: "Facebook Cover — White", dims: "851 x 315" },
  facebookGradient: { Component: FacebookCoverGradient, label: "Facebook Cover — Gradient", dims: "851 x 315" },
  facebookLifestyle: { Component: FacebookCoverLifestyle, label: "Facebook Cover — Lifestyle", dims: "851 x 315" },
  youtube: { Component: YouTubeBanner, label: "YouTube Channel Art — Dark", dims: "2560 x 1440" },
  youtubeGradient: { Component: YouTubeBannerGradient, label: "YouTube Channel Art — Gradient", dims: "2560 x 1440" },
  youtubeLifestyle: { Component: YouTubeBannerLifestyle, label: "YouTube Channel Art — Lifestyle", dims: "2560 x 1440" },
  og: { Component: OGBanner, label: "OG / Social Share Card — Dark", dims: "1200 x 630" },
  ogWhite: { Component: OGBannerWhite, label: "OG / Social Share Card — White", dims: "1200 x 630" },
  ogGradient: { Component: OGBannerGradient, label: "OG / Social Share Card — Gradient", dims: "1200 x 630" },
  ogLifestyle: { Component: OGBannerLifestyle, label: "OG / Social Share Card — Lifestyle", dims: "1200 x 630" },
} as const;
