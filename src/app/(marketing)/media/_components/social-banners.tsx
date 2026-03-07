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
function VaultScene({ className, compact, hideChrome }: { className?: string; compact?: boolean; hideChrome?: boolean }) {
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
        {!hideChrome && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-zinc-100 bg-zinc-50">
            <div className="w-1.5 h-1.5 rounded-full bg-red-400/70" />
            <div className="w-1.5 h-1.5 rounded-full bg-yellow-400/70" />
            <div className="w-1.5 h-1.5 rounded-full bg-green-400/70" />
            <div className="ml-2 flex-1 h-3.5 rounded bg-zinc-100 flex items-center px-2">
              <span className="text-[5px] text-zinc-400 font-medium">app.teamprompt.app</span>
            </div>
          </div>
        )}
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
              {["Social Security number — blocked", "Credit card number — blocked", "Patient record — blocked"].map((v, i) => (
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
function AnalyticsScene({ className, compact, hideChrome }: { className?: string; compact?: boolean; hideChrome?: boolean }) {
  const bars = [20, 35, 25, 40, 55, 30, 45, 60, 40, 50, 35, 65, 45, 55, 70, 50, 60, 75, 55, 65, 45, 70, 80, 60, 70, 50, 75, 85, 65, 80];
  return (
    <div className={cn("relative", className)}>
      <div className="rounded-lg bg-white border border-zinc-200 overflow-hidden shadow-2xl">
        {/* Browser chrome */}
        {!hideChrome && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-zinc-100 bg-zinc-50">
            <div className="w-1.5 h-1.5 rounded-full bg-red-400/70" />
            <div className="w-1.5 h-1.5 rounded-full bg-yellow-400/70" />
            <div className="w-1.5 h-1.5 rounded-full bg-green-400/70" />
            <div className="ml-2 flex-1 h-3.5 rounded bg-zinc-100 flex items-center px-2">
              <span className="text-[5px] text-zinc-400 font-medium">app.teamprompt.app/analytics</span>
            </div>
          </div>
        )}
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

/**
 * HTML-based logo wordmark for banners — html2canvas can't render SVG elements
 * inside <img> tags, so we inline the icon as React SVG + use HTML <span> for text.
 */
function BannerWordmark({ size = "lg", dark }: { size?: "xs" | "sm" | "md" | "lg"; dark?: boolean }) {
  const fill = dark ? "#0f1d2d" : "#FFFFFF";
  const sizes = {
    xs: { h: "h-4 sm:h-5", text: "text-[9px] sm:text-[11px]", icon: "h-3 sm:h-3.5" },
    sm: { h: "h-5 sm:h-6", text: "text-[11px] sm:text-[13px]", icon: "h-3.5 sm:h-4" },
    md: { h: "h-5 sm:h-7", text: "text-[11px] sm:text-[15px]", icon: "h-3.5 sm:h-5" },
    lg: { h: "h-6 sm:h-8", text: "text-[13px] sm:text-lg", icon: "h-4 sm:h-5" },
  };
  const s = sizes[size];
  return (
    <div className={cn("flex items-center gap-1 sm:gap-1.5", s.h)}>
      <svg viewBox="0 0 432 320.9" fill="none" className={cn(s.icon, "w-auto shrink-0")}>
        <circle cx="157.7" cy="167.7" r="23.2" fill={fill} />
        <circle cx="279.7" cy="167.7" r="23.2" fill={fill} />
        <path fill={fill} d="M351.4,68.2c-21.3-10.5-52.4-13.8-77.1-23.6-33-13-46.9-25.1-55.8-25.1s-16.8,8.2-49.1,21.6c-25.9,10.8-49.8,16.2-68,21.1C51.1,72.3,13.2,116.6,13.2,169.8v17.8c0,60.6,49.1,109.7,109.7,109.7h221.8s-12.9-51.6-56.3-51.6h-150c-38.5,0-69.8-31.8-69.8-71.1v-.5c0-39.3,31.2-71.1,69.8-71.1h150.2c38.5,0,69.8,31.8,69.8,71.1v.5c0,1.5,0,2.9-.1,4.3-.9,16-1.4,84.7-1.5,107.8,37.2-17.6,62.9-55.3,62.9-99.1v-17.8c0-46-28.3-85.4-68.5-101.7Z" />
      </svg>
      <span className={cn("font-bold leading-none whitespace-nowrap", s.text, dark ? "text-zinc-900" : "text-white")}>
        TeamPrompt
      </span>
    </div>
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
          <BannerWordmark size="md" />
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
          <BannerWordmark size="md" dark />
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
          <BannerWordmark size="sm" />
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
          <BannerWordmark size="sm" dark />
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
          <BannerWordmark size="xs" />
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
          <BannerWordmark size="xs" dark />
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
        <BannerWordmark size="lg" />
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
          <BannerWordmark size="md" />
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
          <BannerWordmark size="md" dark />
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
          <BannerWordmark size="md" />
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
          <BannerWordmark size="sm" />
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
          <BannerWordmark size="xs" />
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
        <BannerWordmark size="lg" />
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
          <BannerWordmark size="md" />
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
      <div className="absolute -inset-3 rounded-3xl bg-gradient-to-br from-blue-500/15 via-purple-500/8 to-transparent blur-2xl opacity-40" />
      <div className="relative rounded-xl overflow-hidden shadow-xl shadow-black/30 ring-1 ring-white/[0.06]">
        <Image
          src={src}
          alt={alt}
          width={800}
          height={534}
          className="w-full h-full object-cover"
          unoptimized
        />
        {/* Multi-layer dark edge overlay for blending */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0E1A]/60 via-[#0A0E1A]/10 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A0E1A]/40 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(10,14,26,0.20)_100%)]" />
      </div>
    </div>
  );
}

/** Frosted glass floating badge — matches HeroImage industry page style */
function FrostedBadge({
  icon: Icon,
  headline,
  subtitle,
  color = "blue",
  className,
}: {
  icon: React.ComponentType<{ className?: string }>;
  headline: string;
  subtitle: string;
  color?: "blue" | "red" | "emerald" | "amber";
  className?: string;
}) {
  const gradientMap = {
    blue: "from-blue-500 to-blue-600 shadow-blue-500/25",
    red: "from-red-500 to-red-600 shadow-red-500/25",
    emerald: "from-emerald-500 to-emerald-600 shadow-emerald-500/25",
    amber: "from-amber-500 to-amber-600 shadow-amber-500/25",
  };
  return (
    <div
      className={cn(
        "absolute z-20 rounded-lg bg-white/90 backdrop-blur-xl shadow-lg shadow-black/10 border border-white/60 px-2 sm:px-3 py-1 sm:py-1.5 flex items-center gap-1.5 whitespace-nowrap min-w-[80px] sm:min-w-[100px]",
        className
      )}
    >
      <div className={cn("flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-md bg-gradient-to-br text-white shadow-sm shrink-0", gradientMap[color])}>
        <Icon className="h-2 w-2 sm:h-2.5 sm:w-2.5" />
      </div>
      <div>
        <p className="text-[5px] sm:text-[7px] font-bold text-zinc-900 leading-none">{headline}</p>
        <p className="text-[3.5px] sm:text-[4.5px] text-zinc-500 mt-0.5">{subtitle}</p>
      </div>
    </div>
  );
}

/* ── Unsplash photo URLs (free license) — people working at computers ── */
const lifestylePhotos = {
  twitter: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80&auto=format&fit=crop",   // team collaborating at laptops
  linkedin: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&q=80&auto=format&fit=crop",  // diverse team working at computers
  facebook: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80&auto=format&fit=crop",  // coworkers at laptops together
  youtube: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80&auto=format&fit=crop",   // multiple people at laptop screens
  og: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80&auto=format&fit=crop",        // person typing on laptop close-up
  // Lifestyle 2 set — professional team/work environments
  team2: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&q=80&auto=format&fit=crop",        // business team in meeting room with laptops
  solo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80&auto=format&fit=crop",      // professional woman working at computer
  office: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&q=80&auto=format&fit=crop",       // team collaborating around table with laptops
};

/* ── Twitter Lifestyle (1500 x 500) ── */

export function TwitterBannerLifestyle() {
  return (
    <LifestyleBannerShell aspectRatio="1500/500">
      <div className="flex items-center h-full gap-4 sm:gap-6">
        <div className="flex-1 space-y-2 sm:space-y-2.5 shrink-0 max-w-[40%]">
          <BannerWordmark size="md" />
          <p className="text-white text-[10px] sm:text-sm font-bold leading-snug">
            Your team&apos;s AI prompt library — with built-in data protection
          </p>
          <FeaturePills />
          <CompatibilityLine />
        </div>
        <div className="hidden sm:flex w-[55%] items-center relative">
          <LifestylePhoto
            src={lifestylePhotos.twitter}
            alt="Team collaborating at laptops"
            className="w-[60%] aspect-[4/3]"
          />
          <div className="w-[50%] -ml-10 relative z-10">
            <VaultScene compact />
          </div>
          {/* Badge overlaps bottom-right of photo */}
          <FrostedBadge icon={Shield} headline="DLP Active" subtitle="3 threats blocked" color="red" className="bottom-0 left-[38%]" />
          {/* Badge overlaps top of mockup */}
          <FrostedBadge icon={Users} headline="8 teams sharing" subtitle="Prompts in sync" color="blue" className="-top-2 right-[5%]" />
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
          <BannerWordmark size="sm" />
          <p className="text-white text-[10px] sm:text-xs font-bold leading-snug">
            AI prompt management for teams that need data protection
          </p>
          <FeaturePills />
          <CompatibilityLine />
        </div>
        <div className="hidden sm:flex w-[55%] items-center relative">
          <LifestylePhoto
            src={lifestylePhotos.linkedin}
            alt="Diverse team working at computers"
            className="w-[55%] aspect-[4/3]"
          />
          <div className="w-[50%] -ml-10 relative z-10">
            <DLPBlockScene compact />
          </div>
          {/* Badge overlaps bottom edge between photo and mockup */}
          <FrostedBadge icon={Shield} headline="PII detected" subtitle="Auto-blocked in real time" color="red" className="bottom-0 left-[35%]" />
          {/* Badge overlaps top of mockup */}
          <FrostedBadge icon={BarChart3} headline="+23% adoption" subtitle="This month" color="blue" className="-top-2 right-[5%]" />
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
          <BannerWordmark size="xs" />
          <p className="text-white text-[9px] sm:text-xs font-bold leading-snug">
            Shared prompts · Data protection · Usage analytics
          </p>
          <FeaturePills />
        </div>
        <div className="hidden sm:flex w-[55%] items-center relative">
          <LifestylePhoto
            src={lifestylePhotos.facebook}
            alt="Coworkers at laptops together"
            className="w-[55%] aspect-[4/3]"
          />
          <div className="w-[50%] -ml-10 relative z-10">
            <InsertScene />
          </div>
          {/* Badge overlaps bottom edge between photo and mockup */}
          <FrostedBadge icon={Zap} headline="One-click insert" subtitle="Paste into any AI tool" color="emerald" className="bottom-0 left-[35%]" />
          {/* Badge overlaps top of mockup */}
          <FrostedBadge icon={Users} headline="5 AI tools" subtitle="Connected" color="blue" className="-top-2 right-[5%]" />
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
        <BannerWordmark size="lg" />
        <p className="text-white text-xs sm:text-base font-bold max-w-md">
          Your team&apos;s AI prompt library — with built-in data protection
        </p>
        <FeaturePills />
        <div className="w-full max-w-lg mt-1 relative">
          <div className="flex items-start">
            <LifestylePhoto
              src={lifestylePhotos.youtube}
              alt="Multiple people at laptop screens"
              className="w-[50%] aspect-[4/3]"
            />
            <div className="w-[55%] space-y-2 -ml-8 relative z-10">
              <VaultScene compact />
              <DLPBlockScene compact />
            </div>
          </div>
          {/* Badge overlaps boundary between photo and mockup */}
          <FrostedBadge icon={Shield} headline="DLP Active" subtitle="Real-time scanning" color="red" className="top-[40%] left-[32%]" />
          {/* Badge overlaps bottom of photo */}
          <FrostedBadge icon={Zap} headline="142 prompts" subtitle="Used this month" color="emerald" className="-bottom-3 left-[5%]" />
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
          <BannerWordmark size="md" />
          <p className="text-white text-xs sm:text-base font-bold leading-snug">
            AI Prompt Management
            <br />
            for Teams
          </p>
          <FeaturePills />
          <CompatibilityLine />
        </div>
        <div className="w-[55%] relative">
          <div className="flex items-start">
            <LifestylePhoto
              src={lifestylePhotos.og}
              alt="Person typing on laptop close-up"
              className="w-[50%] aspect-[4/3]"
            />
            <div className="w-[55%] space-y-2 -ml-8 relative z-10">
              <VaultScene compact />
              <DLPBlockScene compact />
            </div>
          </div>
          {/* Badge overlaps boundary between photo and mockup */}
          <FrostedBadge icon={Shield} headline="Data protected" subtitle="Real-time scanning" color="red" className="top-[35%] left-[32%]" />
          {/* Badge overlaps bottom of photo */}
          <FrostedBadge icon={Users} headline="Team library" subtitle="Shared prompts" color="blue" className="-bottom-3 left-[5%]" />
        </div>
      </div>
    </LifestyleBannerShell>
  );
}

/* ══════════════════════════════════════════════════
   LIFESTYLE 2 — alternate photo + scene combos
   ══════════════════════════════════════════════════ */

/* ── Twitter Lifestyle 2 (1500 x 500) ── */

export function TwitterBannerLifestyle2() {
  return (
    <LifestyleBannerShell aspectRatio="1500/500">
      <div className="flex items-center h-full gap-4 sm:gap-6">
        <div className="flex-1 space-y-2 sm:space-y-2.5 shrink-0 max-w-[40%]">
          <BannerWordmark size="md" />
          <p className="text-white text-[10px] sm:text-sm font-bold leading-snug">
            Shared prompts &middot; DLP scanning &middot; Usage analytics
          </p>
          <FeaturePills />
          <CompatibilityLine />
        </div>
        <div className="hidden sm:flex w-[55%] items-center relative">
          <LifestylePhoto
            src={lifestylePhotos.team2}
            alt="Team brainstorming at whiteboard"
            className="w-[60%] aspect-[4/3]"
          />
          <div className="w-[50%] -ml-10 relative z-10">
            <AnalyticsScene compact />
          </div>
          <FrostedBadge icon={BarChart3} headline="Usage +34%" subtitle="vs last month" color="blue" className="bottom-0 left-[38%]" />
          <FrostedBadge icon={Zap} headline="142 inserts" subtitle="This week" color="emerald" className="-top-2 right-[5%]" />
        </div>
      </div>
    </LifestyleBannerShell>
  );
}

/* ── LinkedIn Lifestyle 2 (1584 x 396) ── */

export function LinkedInBannerLifestyle2() {
  return (
    <LifestyleBannerShell aspectRatio="1584/396">
      <div className="flex items-center h-full gap-4 sm:gap-6">
        <div className="flex-1 space-y-2 sm:space-y-2.5 max-w-[38%]">
          <BannerWordmark size="sm" />
          <p className="text-white text-[10px] sm:text-xs font-bold leading-snug">
            One prompt library for your entire team &mdash; across every AI tool
          </p>
          <FeaturePills />
          <CompatibilityLine />
        </div>
        <div className="hidden sm:flex w-[55%] items-center relative">
          <LifestylePhoto
            src={lifestylePhotos.office}
            alt="Modern open-plan office"
            className="w-[55%] aspect-[4/3]"
          />
          <div className="w-[50%] -ml-10 relative z-10">
            <VaultScene compact />
          </div>
          <FrostedBadge icon={Users} headline="12 teams" subtitle="Sharing prompts" color="blue" className="bottom-0 left-[35%]" />
          <FrostedBadge icon={Zap} headline="One-click insert" subtitle="Into any AI tool" color="emerald" className="-top-2 right-[5%]" />
        </div>
      </div>
    </LifestyleBannerShell>
  );
}

/* ── LinkedIn Personal Cover (1128 x 191) ── */

export function LinkedInPersonalCover() {
  return (
    <LifestyleBannerShell aspectRatio="1128/191">
      <div className="flex items-center h-full gap-3 sm:gap-5">
        <div className="flex-1 space-y-1 sm:space-y-1.5 max-w-[42%]">
          <BannerWordmark size="xs" />
          <p className="text-white text-[8px] sm:text-[10px] font-bold leading-snug">
            AI prompt management &middot; Data protection &middot; Team analytics
          </p>
          <CompatibilityLine />
        </div>
        <div className="hidden sm:flex w-[52%] items-center relative">
          <LifestylePhoto
            src={lifestylePhotos.solo}
            alt="Code on screen"
            className="w-[55%] aspect-[4/3]"
          />
          <div className="w-[50%] -ml-8 relative z-10">
            <VaultScene compact />
          </div>
          <FrostedBadge icon={Shield} headline="DLP Active" subtitle="Data protected" color="red" className="bottom-0 left-[36%]" />
        </div>
      </div>
    </LifestyleBannerShell>
  );
}

/* ── Facebook Lifestyle 2 (851 x 315) ── */

export function FacebookCoverLifestyle2() {
  return (
    <LifestyleBannerShell aspectRatio="851/315">
      <div className="flex items-center h-full gap-3 sm:gap-4">
        <div className="flex-1 space-y-1.5 sm:space-y-2 max-w-[38%]">
          <BannerWordmark size="xs" />
          <p className="text-white text-[9px] sm:text-xs font-bold leading-snug">
            Your team&apos;s AI prompt library &mdash; with built-in data protection
          </p>
          <FeaturePills />
        </div>
        <div className="hidden sm:flex w-[55%] items-center relative">
          <LifestylePhoto
            src={lifestylePhotos.team2}
            alt="Team brainstorming"
            className="w-[55%] aspect-[4/3]"
          />
          <div className="w-[50%] -ml-10 relative z-10">
            <AnalyticsScene compact />
          </div>
          <FrostedBadge icon={BarChart3} headline="Usage insights" subtitle="Real-time data" color="blue" className="bottom-0 left-[35%]" />
          <FrostedBadge icon={Shield} headline="DLP Active" subtitle="3 threats blocked" color="red" className="-top-2 right-[5%]" />
        </div>
      </div>
    </LifestyleBannerShell>
  );
}

/* ── OG Lifestyle 2 (1200 x 630) ── */

export function OGBannerLifestyle2() {
  return (
    <LifestyleBannerShell aspectRatio="1200/630">
      <div className="flex items-center h-full gap-4 sm:gap-6">
        <div className="flex-1 space-y-2.5 sm:space-y-3 max-w-[38%]">
          <BannerWordmark size="md" />
          <p className="text-white text-xs sm:text-base font-bold leading-snug">
            One Prompt Library
            <br />
            for Every AI Tool
          </p>
          <FeaturePills />
          <CompatibilityLine />
        </div>
        <div className="w-[55%] relative">
          <div className="flex items-start">
            <LifestylePhoto
              src={lifestylePhotos.office}
              alt="Modern office workspace"
              className="w-[50%] aspect-[4/3]"
            />
            <div className="w-[55%] space-y-2 -ml-8 relative z-10">
              <AnalyticsScene compact />
              <InsertScene />
            </div>
          </div>
          <FrostedBadge icon={BarChart3} headline="+34% adoption" subtitle="This quarter" color="blue" className="top-[35%] left-[32%]" />
          <FrostedBadge icon={Zap} headline="One-click insert" subtitle="Works everywhere" color="emerald" className="-bottom-3 left-[5%]" />
        </div>
      </div>
    </LifestyleBannerShell>
  );
}

/* ══════════════════════════════════════════════════
   EXTENSION STORE BANNERS — Chrome / Edge / Firefox promotional assets
   ══════════════════════════════════════════════════ */

/* ── Extension Marquee Lifestyle 1 — Team + Vault (1400 x 560) ── */

export function ExtensionMarqueeLifestyle1() {
  return (
    <LifestyleBannerShell aspectRatio="1400/560">
      <div className="flex items-center h-full gap-4 sm:gap-8">
        <div className="flex-1 space-y-2 sm:space-y-3 max-w-[38%]">
          <BannerWordmark size="md" />
          <p className="text-white text-xs sm:text-base font-bold leading-snug">
            Your team&apos;s AI prompt library — with built-in data protection
          </p>
          <FeaturePills />
          <CompatibilityLine />
        </div>
        <div className="hidden sm:flex w-[55%] items-center relative">
          <LifestylePhoto
            src={lifestylePhotos.twitter}
            alt="Team collaborating at laptops"
            className="w-[55%] aspect-[4/3]"
          />
          <div className="w-[50%] -ml-10 relative z-10">
            <VaultScene compact />
          </div>
          <FrostedBadge icon={Shield} headline="DLP Active" subtitle="Real-time scanning" color="red" className="bottom-2 left-[35%]" />
          <FrostedBadge icon={Users} headline="Team library" subtitle="Shared prompts" color="blue" className="-top-1 right-[5%]" />
        </div>
      </div>
    </LifestyleBannerShell>
  );
}

/* ── Extension Marquee Lifestyle 2 — DLP focused (1400 x 560) ── */

export function ExtensionMarqueeLifestyle2() {
  return (
    <LifestyleBannerShell aspectRatio="1400/560">
      <div className="flex items-center h-full gap-4 sm:gap-8">
        <div className="flex-1 space-y-2 sm:space-y-3 max-w-[38%]">
          <BannerWordmark size="md" />
          <p className="text-white text-xs sm:text-base font-bold leading-snug">
            Stop sensitive data from reaching AI tools
          </p>
          <FeaturePills />
          <CompatibilityLine />
        </div>
        <div className="hidden sm:flex w-[55%] items-center relative">
          <LifestylePhoto
            src={lifestylePhotos.linkedin}
            alt="Diverse team working at computers"
            className="w-[55%] aspect-[4/3]"
          />
          <div className="w-[50%] -ml-10 relative z-10">
            <DLPBlockScene compact />
          </div>
          <FrostedBadge icon={Shield} headline="PII detected" subtitle="Auto-blocked" color="red" className="bottom-2 left-[35%]" />
          <FrostedBadge icon={BarChart3} headline="15 DLP rules" subtitle="Active" color="emerald" className="-top-1 right-[5%]" />
        </div>
      </div>
    </LifestyleBannerShell>
  );
}

/* ── Extension Marquee Lifestyle 3 — Insert focused (1400 x 560) ── */

export function ExtensionMarqueeLifestyle3() {
  return (
    <LifestyleBannerShell aspectRatio="1400/560">
      <div className="flex items-center h-full gap-4 sm:gap-8">
        <div className="flex-1 space-y-2 sm:space-y-3 max-w-[38%]">
          <BannerWordmark size="md" />
          <p className="text-white text-xs sm:text-base font-bold leading-snug">
            One click to insert team prompts into any AI tool
          </p>
          <FeaturePills />
          <CompatibilityLine />
        </div>
        <div className="hidden sm:flex w-[55%] items-center relative">
          <LifestylePhoto
            src={lifestylePhotos.facebook}
            alt="Coworkers at laptops together"
            className="w-[55%] aspect-[4/3]"
          />
          <div className="w-[50%] -ml-10 relative z-10">
            <InsertScene />
          </div>
          <FrostedBadge icon={Zap} headline="One-click insert" subtitle="Into any AI tool" color="emerald" className="bottom-2 left-[35%]" />
          <FrostedBadge icon={Users} headline="5 AI tools" subtitle="Connected" color="blue" className="-top-1 right-[5%]" />
        </div>
      </div>
    </LifestyleBannerShell>
  );
}

/* ── Extension Screenshot Lifestyle 1 — Vault hero (1280 x 800) ── */

export function ExtensionScreenshotLifestyle1() {
  return (
    <LifestyleBannerShell aspectRatio="1280/800">
      <div className="flex items-center h-full gap-4 sm:gap-8">
        <div className="flex-1 space-y-2 sm:space-y-2.5 max-w-[38%]">
          <BannerWordmark size="md" />
          <p className="text-white text-xs sm:text-base font-bold leading-snug">
            Your team&apos;s AI prompt library — with built-in data protection
          </p>
          <FeaturePills />
          <CompatibilityLine />
        </div>
        <div className="w-[55%] flex items-center relative">
          <LifestylePhoto
            src={lifestylePhotos.twitter}
            alt="Team collaborating at laptops"
            className="w-[55%] aspect-[4/3]"
          />
          <div className="w-[50%] -ml-10 relative z-10">
            <VaultScene compact />
          </div>
          <FrostedBadge icon={Shield} headline="DLP Active" subtitle="Real-time scanning" color="red" className="bottom-2 left-[35%]" />
          <FrostedBadge icon={Users} headline="Team library" subtitle="Shared prompts" color="blue" className="-top-1 right-[5%]" />
        </div>
      </div>
    </LifestyleBannerShell>
  );
}

/* ── Extension Screenshot Lifestyle 2 — DLP focus (1280 x 800) ── */

export function ExtensionScreenshotLifestyle2() {
  return (
    <LifestyleBannerShell aspectRatio="1280/800">
      <div className="flex items-center h-full gap-4 sm:gap-8">
        <div className="flex-1 space-y-2 sm:space-y-2.5 max-w-[38%]">
          <BannerWordmark size="md" />
          <p className="text-white text-xs sm:text-base font-bold leading-snug">
            Stop sensitive data from reaching AI tools
          </p>
          <FeaturePills />
          <CompatibilityLine />
        </div>
        <div className="w-[55%] flex items-center relative">
          <LifestylePhoto
            src={lifestylePhotos.linkedin}
            alt="Diverse team working at computers"
            className="w-[55%] aspect-[4/3]"
          />
          <div className="w-[50%] -ml-10 relative z-10">
            <DLPBlockScene compact />
          </div>
          <FrostedBadge icon={Shield} headline="PII detected" subtitle="Auto-blocked" color="red" className="bottom-2 left-[35%]" />
          <FrostedBadge icon={BarChart3} headline="15 DLP rules" subtitle="Active" color="emerald" className="-top-1 right-[5%]" />
        </div>
      </div>
    </LifestyleBannerShell>
  );
}

/* ── Extension Screenshot Lifestyle 3 — Insert focus (1280 x 800) ── */

export function ExtensionScreenshotLifestyle3() {
  return (
    <LifestyleBannerShell aspectRatio="1280/800">
      <div className="flex items-center h-full gap-4 sm:gap-8">
        <div className="flex-1 space-y-2 sm:space-y-2.5 max-w-[38%]">
          <BannerWordmark size="md" />
          <p className="text-white text-xs sm:text-base font-bold leading-snug">
            One click to insert team prompts into any AI tool
          </p>
          <FeaturePills />
          <CompatibilityLine />
        </div>
        <div className="w-[55%] flex items-center relative">
          <LifestylePhoto
            src={lifestylePhotos.facebook}
            alt="Coworkers at laptops together"
            className="w-[55%] aspect-[4/3]"
          />
          <div className="w-[50%] -ml-10 relative z-10">
            <InsertScene />
          </div>
          <FrostedBadge icon={Zap} headline="One-click insert" subtitle="Into any AI tool" color="emerald" className="bottom-2 left-[35%]" />
          <FrostedBadge icon={Users} headline="5 AI tools" subtitle="Connected" color="blue" className="-top-1 right-[5%]" />
        </div>
      </div>
    </LifestyleBannerShell>
  );
}

/* ── Extension Screenshot Dark (1280 x 800) — app screenshots on dark bg ── */

export function ExtensionScreenshotDark() {
  return (
    <DarkBannerShell aspectRatio="1280/800">
      <div className="flex flex-col justify-center h-full gap-3 sm:gap-5">
        <div className="space-y-2 sm:space-y-2.5">
          <BannerWordmark size="md" />
          <p className="text-white/90 text-xs sm:text-base font-semibold leading-snug max-w-[50%]">
            Your team&apos;s AI prompt library — with built-in data protection
          </p>
          <FeatureIconRow />
          <CompatibilityLine />
        </div>
        <div className="flex gap-3 items-start mt-1">
          <VaultScene className="flex-1" compact />
          <DLPBlockScene className="flex-1" compact />
          <InsertScene className="flex-1" />
        </div>
      </div>
    </DarkBannerShell>
  );
}

/* ── Extension Screenshot White (1280 x 800) — clean white bg ── */

export function ExtensionScreenshotWhite() {
  return (
    <WhiteBannerShell aspectRatio="1280/800">
      <div className="flex flex-col justify-center h-full gap-3 sm:gap-5">
        <div className="space-y-2 sm:space-y-2.5">
          <BannerWordmark size="md" dark />
          <p className="text-zinc-900 text-xs sm:text-base font-semibold leading-snug max-w-[50%]">
            Your team&apos;s AI prompt library — with built-in data protection
          </p>
          <FeatureIconRowDark />
          <CompatibilityLine dark />
        </div>
        <div className="flex gap-3 items-start mt-1">
          <VaultScene className="flex-1" compact />
          <DLPBlockScene className="flex-1" compact />
          <InsertScene className="flex-1" />
        </div>
      </div>
    </WhiteBannerShell>
  );
}

/* ── Extension Screenshot Gradient (1280 x 800) — staggered real screenshots ── */

export function ExtensionScreenshotGradient() {
  return (
    <MockupBannerShell aspectRatio="1280/800">
      <div className="flex flex-col justify-center h-full gap-3 sm:gap-5">
        <div className="space-y-2 sm:space-y-2.5">
          <BannerWordmark size="md" />
          <p className="text-white text-xs sm:text-base font-bold leading-snug max-w-[50%]">
            Shared prompts · Data protection · Usage analytics
          </p>
          <FeaturePills />
          <CompatibilityLine />
        </div>
        <div className="flex gap-4 items-start mt-1">
          <StaggeredMockup
            className="w-[55%]"
            screenshots={[
              { src: "/store-assets/screenshot-light-1-prompts.png", alt: "Prompt library" },
              { src: "/store-assets/screenshot-light-3-dlp-block.png", alt: "DLP block" },
            ]}
          />
          <StaggeredMockup
            className="w-[45%] mt-4"
            screenshots={[
              { src: "/store-assets/screenshot-light-4-popup.png", alt: "Extension popup" },
            ]}
          />
        </div>
      </div>
    </MockupBannerShell>
  );
}

/* ── Extension Screenshot Lifestyle 4 — Analytics (1280 x 800) ── */

export function ExtensionScreenshotLifestyle4() {
  return (
    <LifestyleBannerShell aspectRatio="1280/800">
      <div className="flex items-center h-full gap-4 sm:gap-8">
        <div className="flex-1 space-y-2 sm:space-y-2.5 max-w-[38%]">
          <BannerWordmark size="md" />
          <p className="text-white text-xs sm:text-base font-bold leading-snug">
            See how your team uses AI — usage analytics built in
          </p>
          <FeaturePills />
          <CompatibilityLine />
        </div>
        <div className="w-[55%] flex items-center relative">
          <LifestylePhoto
            src={lifestylePhotos.og}
            alt="Person typing on laptop"
            className="w-[55%] aspect-[4/3]"
          />
          <div className="w-[50%] -ml-10 relative z-10">
            <VaultScene compact />
          </div>
          <FrostedBadge icon={BarChart3} headline="142 prompts" subtitle="Used this month" color="blue" className="bottom-2 left-[35%]" />
          <FrostedBadge icon={Zap} headline="+23% adoption" subtitle="Team-wide" color="emerald" className="-top-1 right-[5%]" />
        </div>
      </div>
    </LifestyleBannerShell>
  );
}

/* ── Extension Screenshot Lifestyle 5 — Multi-AI (1280 x 800) ── */

export function ExtensionScreenshotLifestyle5() {
  return (
    <LifestyleBannerShell aspectRatio="1280/800">
      <div className="flex items-center h-full gap-4 sm:gap-8">
        <div className="flex-1 space-y-2 sm:space-y-2.5 max-w-[38%]">
          <BannerWordmark size="md" />
          <p className="text-white text-xs sm:text-base font-bold leading-snug">
            Works with ChatGPT, Claude, Gemini, Copilot & Perplexity
          </p>
          <FeaturePills />
          <CompatibilityLine />
        </div>
        <div className="w-[55%] flex items-center relative">
          <LifestylePhoto
            src={lifestylePhotos.youtube}
            alt="Multiple people at laptop screens"
            className="w-[55%] aspect-[4/3]"
          />
          <div className="w-[50%] -ml-10 relative z-10">
            <DLPBlockScene compact />
          </div>
          <FrostedBadge icon={Users} headline="5 AI tools" subtitle="One extension" color="blue" className="bottom-2 left-[35%]" />
          <FrostedBadge icon={Shield} headline="DLP active" subtitle="On every tool" color="red" className="-top-1 right-[5%]" />
        </div>
      </div>
    </LifestyleBannerShell>
  );
}

/* ── Extension Small Promo Lifestyle (440 x 280) ── */

export function ExtensionSmallPromoLifestyle() {
  return (
    <LifestyleBannerShell aspectRatio="440/280">
      <div className="flex flex-col justify-center h-full gap-2">
        <BannerWordmark size="xs" />
        <p className="text-white text-[8px] sm:text-[10px] font-bold leading-snug max-w-[70%]">
          Team prompt library with DLP protection for AI tools
        </p>
        <FeaturePills />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 w-[40%]">
          <LifestylePhoto
            src={lifestylePhotos.og}
            alt="Person typing on laptop"
            className="w-full aspect-[4/3]"
          />
          <FrostedBadge icon={Shield} headline="Protected" subtitle="DLP active" color="red" className="-bottom-1 -left-4" />
        </div>
      </div>
    </LifestyleBannerShell>
  );
}

/* ══════════════════════════════════════════════════
   LOOM-STYLE CHROME WEB STORE SCREENSHOTS
   Clean gradient BG + bold headline + large product mockup
   ══════════════════════════════════════════════════ */

type LoomGradient = "blue" | "indigo" | "emerald" | "violet" | "slate" | "rose" | "teal" | "amber" | "sky" | "cyan";

/** Loom-style shell — gradient background, centered content */
function LoomStyleShell({
  aspectRatio,
  children,
  gradient = "blue",
}: {
  aspectRatio: string;
  children: React.ReactNode;
  gradient?: LoomGradient;
}) {
  const gradientMap: Record<LoomGradient, string> = {
    blue: "radial-gradient(ellipse 120% 80% at 50% 40%, #1e40af 0%, #0f172a 80%)",
    indigo: "radial-gradient(ellipse 120% 80% at 50% 40%, #312e81 0%, #0f172a 80%)",
    emerald: "radial-gradient(ellipse 120% 80% at 50% 40%, #065f46 0%, #0f172a 80%)",
    violet: "radial-gradient(ellipse 120% 80% at 50% 40%, #4c1d95 0%, #0f172a 80%)",
    slate: "radial-gradient(ellipse 120% 80% at 50% 40%, #1e293b 0%, #0f172a 80%)",
    rose: "radial-gradient(ellipse 120% 80% at 50% 40%, #9f1239 0%, #0f172a 80%)",
    teal: "radial-gradient(ellipse 120% 80% at 50% 40%, #115e59 0%, #0f172a 80%)",
    amber: "radial-gradient(ellipse 120% 80% at 50% 40%, #92400e 0%, #0f172a 80%)",
    sky: "radial-gradient(ellipse 120% 80% at 50% 40%, #0369a1 0%, #0f172a 80%)",
    cyan: "radial-gradient(ellipse 120% 80% at 50% 40%, #155e75 0%, #0f172a 80%)",
  };

  return (
    <div
      className="w-full rounded-xl overflow-hidden relative"
      style={{ aspectRatio, background: gradientMap[gradient] }}
    >
      {/* Subtle noise texture overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }} />
      {/* Accent glow */}
      <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[60%] h-[30%] rounded-full bg-blue-500/10 blur-3xl" />
      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-center z-10 px-6 sm:px-10 pt-4 sm:pt-8 pb-0">
        {children}
      </div>
    </div>
  );
}

/** Large mockup wrapper — browser-like chrome with shadow, displayed large at bottom */
function LoomMockupFrame({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("w-full max-w-[85%]", className)}>
      {/* Browser chrome — rounded top with clipping */}
      <div className="rounded-t-xl overflow-hidden shadow-2xl shadow-black/40 border border-white/[0.08] border-b-0">
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1e1e2e] border-b border-white/[0.06]">
          <div className="w-2 h-2 rounded-full bg-[#ff5f56]" />
          <div className="w-2 h-2 rounded-full bg-[#ffbd2e]" />
          <div className="w-2 h-2 rounded-full bg-[#27c93f]" />
          <div className="ml-3 flex-1 h-4 rounded-md bg-white/[0.06] flex items-center px-2">
            <span className="text-[6px] text-white/40 font-medium">app.teamprompt.app</span>
          </div>
        </div>
      </div>
      {/* Content — no overflow-hidden so scene badges can float */}
      <div className="bg-white border-x border-white/[0.08] shadow-2xl shadow-black/40">{children}</div>
    </div>
  );
}

/** Loom-style screenshot 1 — Prompt Library */
export function ChromeScreenshot1({ gradient = "blue" }: { gradient?: LoomGradient }) {
  return (
    <LoomStyleShell aspectRatio="1280/800" gradient={gradient}>
      <BannerWordmark size="sm" />
      <h2 className="text-white text-sm sm:text-2xl font-bold text-center mt-2 sm:mt-4 leading-tight tracking-tight">
        Your team&apos;s AI prompt library
      </h2>
      <p className="text-white/50 text-[8px] sm:text-xs text-center mt-1 sm:mt-2 max-w-[70%] leading-relaxed">
        Browse, search, and share approved prompts across your entire organization
      </p>
      <div className="flex-1 flex items-end justify-center mt-3 sm:mt-5 w-full relative">
        <LoomMockupFrame>
          <VaultScene hideChrome />
        </LoomMockupFrame>
        <FrostedBadge icon={Users} headline="Shared with 8 teams" subtitle="Organization-wide" color="blue" className="top-0 sm:top-2 -left-1 sm:left-[2%]" />
        <FrostedBadge icon={BarChart3} headline="142 prompts" subtitle="Used this month" color="emerald" className="top-8 sm:top-14 -right-1 sm:right-[2%]" />
      </div>
    </LoomStyleShell>
  );
}

/** Loom-style screenshot 2 — DLP Protection */
export function ChromeScreenshot2({ gradient = "indigo" }: { gradient?: LoomGradient }) {
  return (
    <LoomStyleShell aspectRatio="1280/800" gradient={gradient}>
      <BannerWordmark size="sm" />
      <h2 className="text-white text-sm sm:text-2xl font-bold text-center mt-2 sm:mt-4 leading-tight tracking-tight">
        Protect sensitive information in AI chats
      </h2>
      <p className="text-white/50 text-[8px] sm:text-xs text-center mt-1 sm:mt-2 max-w-[70%] leading-relaxed">
        Automatically catch Social Security numbers, financial data, patient records,
        and more before they reach AI tools
      </p>
      <div className="flex-1 flex items-end justify-center mt-3 sm:mt-5 w-full relative">
        <LoomMockupFrame>
          <DLPBlockScene />
        </LoomMockupFrame>
        <FrostedBadge icon={Shield} headline="Always-on protection" subtitle="Real-time scanning" color="red" className="top-0 sm:top-2 -left-1 sm:left-[2%]" />
        <FrostedBadge icon={AlertTriangle} headline="15 risks caught" subtitle="This week" color="amber" className="top-8 sm:top-14 -right-1 sm:right-[2%]" />
      </div>
    </LoomStyleShell>
  );
}

/** Loom-style screenshot 3 — One-Click Insert */
export function ChromeScreenshot3({ gradient = "emerald" }: { gradient?: LoomGradient }) {
  return (
    <LoomStyleShell aspectRatio="1280/800" gradient={gradient}>
      <BannerWordmark size="sm" />
      <h2 className="text-white text-sm sm:text-2xl font-bold text-center mt-2 sm:mt-4 leading-tight tracking-tight">
        Insert prompts in one click
      </h2>
      <p className="text-white/50 text-[8px] sm:text-xs text-center mt-1 sm:mt-2 max-w-[70%] leading-relaxed">
        Works right inside ChatGPT, Claude, Gemini, Copilot, and Perplexity
      </p>
      <div className="flex-1 flex items-end justify-center mt-3 sm:mt-5 w-full relative">
        <LoomMockupFrame>
          <InsertScene />
        </LoomMockupFrame>
        <FrostedBadge icon={Zap} headline="One-click insert" subtitle="Into any AI tool" color="emerald" className="top-0 sm:top-2 -left-1 sm:left-[2%]" />
        <FrostedBadge icon={Users} headline="5 AI tools" subtitle="Connected" color="blue" className="top-8 sm:top-14 -right-1 sm:right-[2%]" />
      </div>
    </LoomStyleShell>
  );
}

/** Loom-style screenshot 4 — Analytics */
export function ChromeScreenshot4({ gradient = "violet" }: { gradient?: LoomGradient }) {
  return (
    <LoomStyleShell aspectRatio="1280/800" gradient={gradient}>
      <BannerWordmark size="sm" />
      <h2 className="text-white text-sm sm:text-2xl font-bold text-center mt-2 sm:mt-4 leading-tight tracking-tight">
        Track how your team uses AI
      </h2>
      <p className="text-white/50 text-[8px] sm:text-xs text-center mt-1 sm:mt-2 max-w-[70%] leading-relaxed">
        Usage analytics, prompt adoption, and team insights — all in one dashboard
      </p>
      <div className="flex-1 flex items-end justify-center mt-3 sm:mt-5 w-full relative">
        <LoomMockupFrame>
          <AnalyticsScene hideChrome />
        </LoomMockupFrame>
        <FrostedBadge icon={BarChart3} headline="+23% adoption" subtitle="Team-wide" color="emerald" className="top-0 sm:top-2 -left-1 sm:left-[2%]" />
        <FrostedBadge icon={Activity} headline="89 uses" subtitle="This month" color="blue" className="top-8 sm:top-14 -right-1 sm:right-[2%]" />
      </div>
    </LoomStyleShell>
  );
}

/** Loom-style screenshot 5 — Multi-AI Support */
export function ChromeScreenshot5({ gradient = "slate" }: { gradient?: LoomGradient }) {
  const aiTools = [
    { name: "ChatGPT", color: "#10A37F", letter: "G" },
    { name: "Claude", color: "#D97757", letter: "C" },
    { name: "Gemini", color: "#4285F4", letter: "G" },
    { name: "Copilot", color: "#7B61FF", letter: "C" },
    { name: "Perplexity", color: "#20808D", letter: "P" },
  ];

  return (
    <LoomStyleShell aspectRatio="1280/800" gradient={gradient}>
      <BannerWordmark size="sm" />
      <h2 className="text-white text-sm sm:text-2xl font-bold text-center mt-2 sm:mt-4 leading-tight tracking-tight">
        Works with every AI tool
      </h2>
      <p className="text-white/50 text-[8px] sm:text-xs text-center mt-1 sm:mt-2 max-w-[70%] leading-relaxed">
        One extension for ChatGPT, Claude, Gemini, Microsoft Copilot, and Perplexity
      </p>
      {/* AI tool icons row */}
      <div className="flex items-center justify-center gap-3 sm:gap-6 mt-4 sm:mt-8">
        {aiTools.map((tool) => (
          <div key={tool.name} className="flex flex-col items-center gap-1 sm:gap-2">
            <div
              className="w-8 h-8 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center text-white font-bold text-xs sm:text-xl shadow-lg"
              style={{ backgroundColor: tool.color }}
            >
              {tool.letter}
            </div>
            <span className="text-[6px] sm:text-[10px] text-white/60 font-medium">{tool.name}</span>
          </div>
        ))}
      </div>
      {/* Bottom mockup — smaller, showing the extension popup */}
      <div className="flex-1 flex items-end justify-center mt-3 sm:mt-5 w-full relative">
        <LoomMockupFrame className="max-w-[70%]">
          <InsertScene />
        </LoomMockupFrame>
        <FrostedBadge icon={Shield} headline="DLP active" subtitle="On every tool" color="red" className="top-0 sm:top-2 left-0 sm:left-[5%]" />
        <FrostedBadge icon={Users} headline="5 AI tools" subtitle="One extension" color="blue" className="top-8 sm:top-14 right-0 sm:right-[5%]" />
      </div>
    </LoomStyleShell>
  );
}

/* ══════════════════════════════════════════════════
   PROFESSIONAL / LIGHT-THEME CHROME WEB STORE SCREENSHOTS
   Clean white BG + subtle accent glow + dark text + floating mockup
   Inspired by Loom & Viitor Translate store listings
   ══════════════════════════════════════════════════ */

type ProAccent = "blue" | "violet" | "emerald" | "rose" | "teal";

/** Professional light-themed shell — white/light gray bg with subtle colored glow */
function ProShell({
  aspectRatio,
  children,
  accent = "blue",
}: {
  aspectRatio: string;
  children: React.ReactNode;
  accent?: ProAccent;
}) {
  const accents: Record<ProAccent, { bar: string; glow: string }> = {
    blue: { bar: "linear-gradient(90deg, #2563EB, #60A5FA, #2563EB)", glow: "rgba(37,99,235,0.07)" },
    violet: { bar: "linear-gradient(90deg, #7C3AED, #A78BFA, #7C3AED)", glow: "rgba(124,58,237,0.07)" },
    emerald: { bar: "linear-gradient(90deg, #059669, #34D399, #059669)", glow: "rgba(5,150,105,0.07)" },
    rose: { bar: "linear-gradient(90deg, #E11D48, #FB7185, #E11D48)", glow: "rgba(225,29,72,0.06)" },
    teal: { bar: "linear-gradient(90deg, #0D9488, #5EEAD4, #0D9488)", glow: "rgba(13,148,136,0.07)" },
  };
  const a = accents[accent];

  return (
    <div
      className="w-full rounded-xl overflow-hidden relative bg-[#FAFBFC]"
      style={{ aspectRatio }}
    >
      {/* Top accent gradient bar */}
      <div className="absolute top-0 left-0 right-0 h-1 z-20" style={{ background: a.bar }} />
      {/* Subtle dot pattern */}
      <div
        className="absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage: "radial-gradient(circle, #e4e4e7 0.5px, transparent 0.5px)",
          backgroundSize: "12px 12px",
        }}
      />
      {/* Ambient glow behind mockup area */}
      <div
        className="absolute bottom-[-5%] left-1/2 -translate-x-1/2 w-[70%] h-[55%] rounded-full"
        style={{ background: a.glow, filter: "blur(50px)" }}
      />
      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-center z-10 px-6 sm:px-10 pt-5 sm:pt-9 pb-0">
        {children}
      </div>
    </div>
  );
}

/** Light-theme mockup frame — lighter chrome, strong shadow for contrast on white */
function ProMockupFrame({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("w-full max-w-[85%]", className)}>
      <div className="rounded-t-xl overflow-hidden shadow-xl shadow-black/[0.08] border border-zinc-200 border-b-0">
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 border-b border-zinc-200">
          <div className="w-2 h-2 rounded-full bg-zinc-300" />
          <div className="w-2 h-2 rounded-full bg-zinc-300" />
          <div className="w-2 h-2 rounded-full bg-zinc-300" />
          <div className="ml-3 flex-1 h-4 rounded-md bg-white border border-zinc-200 flex items-center px-2">
            <span className="text-[6px] text-zinc-400 font-medium">app.teamprompt.app</span>
          </div>
        </div>
      </div>
      <div className="bg-white border-x border-zinc-200 shadow-xl shadow-black/[0.08]">{children}</div>
    </div>
  );
}

/** Pro screenshot 1 — Prompt Library */
export function ProScreenshot1({ accent = "blue" }: { accent?: ProAccent }) {
  return (
    <ProShell aspectRatio="1280/800" accent={accent}>
      <BannerWordmark size="sm" dark />
      <h2 className="text-zinc-900 text-sm sm:text-2xl font-bold text-center mt-2 sm:mt-4 leading-tight tracking-tight">
        Your team&apos;s AI prompt library
      </h2>
      <p className="text-zinc-400 text-[8px] sm:text-xs text-center mt-1 sm:mt-2 max-w-[70%] leading-relaxed">
        Browse, search, and share approved prompts across your entire organization
      </p>
      <div className="flex-1 flex items-end justify-center mt-3 sm:mt-5 w-full">
        <ProMockupFrame>
          <VaultScene hideChrome />
        </ProMockupFrame>
      </div>
    </ProShell>
  );
}

/** Pro screenshot 2 — DLP Protection */
export function ProScreenshot2({ accent = "rose" }: { accent?: ProAccent }) {
  return (
    <ProShell aspectRatio="1280/800" accent={accent}>
      <BannerWordmark size="sm" dark />
      <h2 className="text-zinc-900 text-sm sm:text-2xl font-bold text-center mt-2 sm:mt-4 leading-tight tracking-tight">
        Protect sensitive information in AI chats
      </h2>
      <p className="text-zinc-400 text-[8px] sm:text-xs text-center mt-1 sm:mt-2 max-w-[70%] leading-relaxed">
        Automatically catch Social Security numbers, financial data, patient records,
        and more before they reach AI tools
      </p>
      <div className="flex-1 flex items-end justify-center mt-3 sm:mt-5 w-full">
        <ProMockupFrame>
          <DLPBlockScene />
        </ProMockupFrame>
      </div>
    </ProShell>
  );
}

/** Pro screenshot 3 — One-Click Insert */
export function ProScreenshot3({ accent = "emerald" }: { accent?: ProAccent }) {
  return (
    <ProShell aspectRatio="1280/800" accent={accent}>
      <BannerWordmark size="sm" dark />
      <h2 className="text-zinc-900 text-sm sm:text-2xl font-bold text-center mt-2 sm:mt-4 leading-tight tracking-tight">
        Insert prompts in one click
      </h2>
      <p className="text-zinc-400 text-[8px] sm:text-xs text-center mt-1 sm:mt-2 max-w-[70%] leading-relaxed">
        Works right inside ChatGPT, Claude, Gemini, Copilot, and Perplexity
      </p>
      <div className="flex-1 flex items-end justify-center mt-3 sm:mt-5 w-full">
        <ProMockupFrame>
          <InsertScene />
        </ProMockupFrame>
      </div>
    </ProShell>
  );
}

/** Pro screenshot 4 — Analytics */
export function ProScreenshot4({ accent = "violet" }: { accent?: ProAccent }) {
  return (
    <ProShell aspectRatio="1280/800" accent={accent}>
      <BannerWordmark size="sm" dark />
      <h2 className="text-zinc-900 text-sm sm:text-2xl font-bold text-center mt-2 sm:mt-4 leading-tight tracking-tight">
        Track how your team uses AI
      </h2>
      <p className="text-zinc-400 text-[8px] sm:text-xs text-center mt-1 sm:mt-2 max-w-[70%] leading-relaxed">
        Usage analytics, prompt adoption, and team insights — all in one dashboard
      </p>
      <div className="flex-1 flex items-end justify-center mt-3 sm:mt-5 w-full">
        <ProMockupFrame>
          <AnalyticsScene hideChrome />
        </ProMockupFrame>
      </div>
    </ProShell>
  );
}

/** Pro screenshot 5 — Multi-AI Support */
export function ProScreenshot5({ accent = "teal" }: { accent?: ProAccent }) {
  const aiTools = [
    { name: "ChatGPT", color: "#10A37F", letter: "G" },
    { name: "Claude", color: "#D97757", letter: "C" },
    { name: "Gemini", color: "#4285F4", letter: "G" },
    { name: "Copilot", color: "#7B61FF", letter: "C" },
    { name: "Perplexity", color: "#20808D", letter: "P" },
  ];

  return (
    <ProShell aspectRatio="1280/800" accent={accent}>
      <BannerWordmark size="sm" dark />
      <h2 className="text-zinc-900 text-sm sm:text-2xl font-bold text-center mt-2 sm:mt-4 leading-tight tracking-tight">
        Works with every AI tool
      </h2>
      <p className="text-zinc-400 text-[8px] sm:text-xs text-center mt-1 sm:mt-2 max-w-[70%] leading-relaxed">
        One extension for ChatGPT, Claude, Gemini, Microsoft Copilot, and Perplexity
      </p>
      <div className="flex items-center justify-center gap-3 sm:gap-6 mt-4 sm:mt-6">
        {aiTools.map((tool) => (
          <div key={tool.name} className="flex flex-col items-center gap-1 sm:gap-2">
            <div
              className="w-8 h-8 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center text-white font-bold text-xs sm:text-lg shadow-md"
              style={{ backgroundColor: tool.color }}
            >
              {tool.letter}
            </div>
            <span className="text-[6px] sm:text-[10px] text-zinc-400 font-medium">{tool.name}</span>
          </div>
        ))}
      </div>
      <div className="flex-1 flex items-end justify-center mt-3 sm:mt-4 w-full">
        <ProMockupFrame className="max-w-[70%]">
          <InsertScene />
        </ProMockupFrame>
      </div>
    </ProShell>
  );
}

/* ── Professional Marquee Promos (1400 x 560) ──── */

/** Pro marquee 1 — Prompt Library hero */
export function ProMarquee1({ accent = "blue" }: { accent?: ProAccent }) {
  return (
    <ProShell aspectRatio="1400/560" accent={accent}>
      <div className="flex items-center h-full w-full gap-4 sm:gap-10">
        <div className="flex-1 space-y-2 sm:space-y-3 max-w-[40%]">
          <BannerWordmark size="md" dark />
          <h2 className="text-zinc-900 text-xs sm:text-xl font-bold leading-snug">
            Your team&apos;s AI prompt library — with built-in data protection
          </h2>
          <div className="flex flex-wrap gap-1">
            <FeaturePill label="Shared Prompt Library" dark />
            <FeaturePill label="Data Protection" dark />
            <FeaturePill label="Usage Analytics" dark />
          </div>
          <CompatibilityLine dark />
        </div>
        <div className="hidden sm:flex flex-1 items-center justify-center">
          <div className="w-[90%]">
            <div className="rounded-xl overflow-hidden shadow-lg shadow-black/[0.06] border border-zinc-200">
              <VaultScene compact hideChrome />
            </div>
          </div>
        </div>
      </div>
    </ProShell>
  );
}

/** Pro marquee 2 — DLP Protection hero */
export function ProMarquee2({ accent = "rose" }: { accent?: ProAccent }) {
  return (
    <ProShell aspectRatio="1400/560" accent={accent}>
      <div className="flex items-center h-full w-full gap-4 sm:gap-10">
        <div className="flex-1 space-y-2 sm:space-y-3 max-w-[40%]">
          <BannerWordmark size="md" dark />
          <h2 className="text-zinc-900 text-xs sm:text-xl font-bold leading-snug">
            Protect sensitive information before it reaches AI tools
          </h2>
          <div className="flex flex-wrap gap-1">
            <FeaturePill label="Social Security Numbers" dark />
            <FeaturePill label="Financial Data" dark />
            <FeaturePill label="Patient Records" dark />
          </div>
          <CompatibilityLine dark />
        </div>
        <div className="hidden sm:flex flex-1 items-center justify-center">
          <div className="w-[75%]">
            <div className="rounded-xl overflow-hidden shadow-lg shadow-black/[0.06] border border-zinc-200">
              <DLPBlockScene />
            </div>
          </div>
        </div>
      </div>
    </ProShell>
  );
}

/** Pro marquee 3 — One-Click Insert hero */
export function ProMarquee3({ accent = "emerald" }: { accent?: ProAccent }) {
  return (
    <ProShell aspectRatio="1400/560" accent={accent}>
      <div className="flex items-center h-full w-full gap-4 sm:gap-10">
        <div className="flex-1 space-y-2 sm:space-y-3 max-w-[40%]">
          <BannerWordmark size="md" dark />
          <h2 className="text-zinc-900 text-xs sm:text-xl font-bold leading-snug">
            One click to insert team prompts into any AI tool
          </h2>
          <div className="flex flex-wrap gap-1">
            <FeaturePill label="One-Click Insert" dark />
            <FeaturePill label="Template Variables" dark />
            <FeaturePill label="5 AI Tools" dark />
          </div>
          <CompatibilityLine dark />
        </div>
        <div className="hidden sm:flex flex-1 items-center justify-center">
          <div className="w-[65%]">
            <div className="rounded-xl overflow-hidden shadow-lg shadow-black/[0.06] border border-zinc-200">
              <InsertScene />
            </div>
          </div>
        </div>
      </div>
    </ProShell>
  );
}

/* ── Professional Small Promo Tile (440 x 280) ── */

/** Pro small promo — compact overview */
export function ProSmallPromo({ accent = "blue" }: { accent?: ProAccent }) {
  return (
    <ProShell aspectRatio="440/280" accent={accent}>
      <div className="flex flex-col justify-center items-center h-full gap-1.5 sm:gap-2 text-center">
        <BannerWordmark size="sm" dark />
        <p className="text-zinc-900 text-[8px] sm:text-xs font-bold leading-snug max-w-[80%]">
          AI prompt management &amp; data protection for teams
        </p>
        <div className="flex flex-wrap justify-center gap-1">
          <FeaturePill label="Shared Prompts" dark />
          <FeaturePill label="DLP Shield" dark />
          <FeaturePill label="Analytics" dark />
        </div>
        <CompatibilityLine dark className="mt-0.5" />
      </div>
    </ProShell>
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
  extScreenshotDark: { Component: ExtensionScreenshotDark, label: "Extension Screenshot — Dark", dims: "1280 x 800" },
  extScreenshotWhite: { Component: ExtensionScreenshotWhite, label: "Extension Screenshot — White", dims: "1280 x 800" },
  extScreenshotGradient: { Component: ExtensionScreenshotGradient, label: "Extension Screenshot — Gradient", dims: "1280 x 800" },
  extScreenshot1: { Component: ExtensionScreenshotLifestyle1, label: "Extension Screenshot — Lifestyle: Team + Vault", dims: "1280 x 800" },
  extScreenshot2: { Component: ExtensionScreenshotLifestyle2, label: "Extension Screenshot — Lifestyle: DLP Shield", dims: "1280 x 800" },
  extScreenshot3: { Component: ExtensionScreenshotLifestyle3, label: "Extension Screenshot — Lifestyle: Insert Flow", dims: "1280 x 800" },
  extScreenshot4: { Component: ExtensionScreenshotLifestyle4, label: "Extension Screenshot — Lifestyle: Analytics", dims: "1280 x 800" },
  extScreenshot5: { Component: ExtensionScreenshotLifestyle5, label: "Extension Screenshot — Lifestyle: Multi-AI", dims: "1280 x 800" },
  extMarquee1: { Component: ExtensionMarqueeLifestyle1, label: "Extension Marquee — Team + Vault", dims: "1400 x 560" },
  extMarquee2: { Component: ExtensionMarqueeLifestyle2, label: "Extension Marquee — DLP Shield", dims: "1400 x 560" },
  extMarquee3: { Component: ExtensionMarqueeLifestyle3, label: "Extension Marquee — Insert Flow", dims: "1400 x 560" },
  extSmallPromo: { Component: ExtensionSmallPromoLifestyle, label: "Extension Small Promo — Lifestyle", dims: "440 x 280" },
  chromeScreenshot1: { Component: ChromeScreenshot1, label: "Chrome Store — Prompt Library", dims: "1280 x 800" },
  chromeScreenshot2: { Component: ChromeScreenshot2, label: "Chrome Store — DLP Protection", dims: "1280 x 800" },
  chromeScreenshot3: { Component: ChromeScreenshot3, label: "Chrome Store — One-Click Insert", dims: "1280 x 800" },
  chromeScreenshot4: { Component: ChromeScreenshot4, label: "Chrome Store — Analytics", dims: "1280 x 800" },
  chromeScreenshot5: { Component: ChromeScreenshot5, label: "Chrome Store — Multi-AI Support", dims: "1280 x 800" },
  proScreenshot1: { Component: ProScreenshot1, label: "Chrome Store Pro — Prompt Library", dims: "1280 x 800" },
  proScreenshot2: { Component: ProScreenshot2, label: "Chrome Store Pro — Data Protection", dims: "1280 x 800" },
  proScreenshot3: { Component: ProScreenshot3, label: "Chrome Store Pro — One-Click Insert", dims: "1280 x 800" },
  proScreenshot4: { Component: ProScreenshot4, label: "Chrome Store Pro — Analytics", dims: "1280 x 800" },
  proScreenshot5: { Component: ProScreenshot5, label: "Chrome Store Pro — Multi-AI Support", dims: "1280 x 800" },
  proMarquee1: { Component: ProMarquee1, label: "Pro Marquee — Prompt Library", dims: "1400 x 560" },
  proMarquee2: { Component: ProMarquee2, label: "Pro Marquee — Data Protection", dims: "1400 x 560" },
  proMarquee3: { Component: ProMarquee3, label: "Pro Marquee — Insert Flow", dims: "1400 x 560" },
  proSmallPromo: { Component: ProSmallPromo, label: "Pro Small Promo Tile", dims: "440 x 280" },
} as const;
