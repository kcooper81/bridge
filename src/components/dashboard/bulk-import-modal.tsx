"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import { bulkInvite } from "@/lib/vault-api";
import { toast } from "sonner";
import type { BulkImportRow, BulkImportResult, Invite, UserRole, Team, Member } from "@/lib/types";

interface BulkImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teams: Team[];
  members: Member[];
  pendingInvites: Invite[];
  onComplete: () => void;
  /** When provided, skip the input step and go straight to preview */
  initialRows?: BulkImportRow[];
}

type Step = "input" | "preview" | "sending" | "results";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_ROLES: UserRole[] = ["admin", "manager", "member"];

function parseCSV(text: string): BulkImportRow[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length === 0) return [];

  // Detect header row
  const firstLine = lines[0].toLowerCase();
  const hasHeader =
    firstLine.includes("email") ||
    firstLine.includes("name") ||
    firstLine.includes("role");
  const dataLines = hasHeader ? lines.slice(1) : lines;

  return dataLines.map((line) => {
    // Simple CSV parse handling quoted fields
    const fields: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        fields.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    fields.push(current.trim());

    const [email = "", name = "", role = "", teamStr = ""] = fields;
    const teams = teamStr
      ? teamStr.split(",").map((t) => t.trim()).filter(Boolean)
      : [];

    const normalizedRole = role.toLowerCase() as UserRole;

    return {
      email: email.trim(),
      name: name.trim() || undefined,
      role: VALID_ROLES.includes(normalizedRole) ? normalizedRole : "member",
      teams,
      status: "valid" as const,
    };
  });
}

function validateRows(
  rows: BulkImportRow[],
  existingEmails: Set<string>,
  existingTeamNames: Set<string>
): BulkImportRow[] {
  const seen = new Set<string>();

  return rows.map((row) => {
    const email = row.email.toLowerCase();

    if (!email || !EMAIL_REGEX.test(email)) {
      return { ...row, status: "error" as const, statusMessage: "Invalid email format" };
    }

    if (seen.has(email)) {
      return { ...row, status: "error" as const, statusMessage: "Duplicate in import" };
    }
    seen.add(email);

    if (existingEmails.has(email)) {
      return { ...row, status: "error" as const, statusMessage: "Already a member or invited" };
    }

    // Check for new teams
    const newTeams = row.teams.filter(
      (t) => !existingTeamNames.has(t.toLowerCase())
    );
    if (newTeams.length > 0) {
      return {
        ...row,
        status: "warning" as const,
        statusMessage: `New team(s) will be created: ${newTeams.join(", ")}`,
      };
    }

    return { ...row, status: "valid" as const };
  });
}

export function BulkImportModal({
  open,
  onOpenChange,
  teams,
  members,
  pendingInvites,
  onComplete,
  initialRows,
}: BulkImportModalProps) {
  const [step, setStep] = useState<Step>(initialRows ? "preview" : "input");
  const [csvText, setCsvText] = useState("");
  const [parsedRows, setParsedRows] = useState<BulkImportRow[]>([]);
  const [sendingProgress, setSendingProgress] = useState(0);
  const [result, setResult] = useState<BulkImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const existingEmails = new Set([
    ...members.map((m) => m.email.toLowerCase()),
    ...pendingInvites.filter((i) => i.status === "pending").map((i) => i.email.toLowerCase()),
  ]);
  const existingTeamNames = new Set(teams.map((t) => t.name.toLowerCase()));

  const resetState = useCallback(() => {
    setStep(initialRows ? "preview" : "input");
    setCsvText("");
    setParsedRows(initialRows ? validateRows(initialRows, existingEmails, existingTeamNames) : []);
    setSendingProgress(0);
    setResult(null);
  }, [initialRows]); // eslint-disable-line react-hooks/exhaustive-deps

  // When initialRows change, jump to preview
  useEffect(() => {
    if (initialRows && initialRows.length > 0 && open) {
      const validated = validateRows(initialRows, existingEmails, existingTeamNames);
      setParsedRows(validated);
      setStep("preview");
    }
  }, [initialRows, open]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleClose(isOpen: boolean) {
    if (step === "sending") return; // Prevent closing while processing
    if (!isOpen) resetState();
    onOpenChange(isOpen);
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setCsvText(text);
    };
    reader.readAsText(file);

    // Reset input so same file can be re-selected
    e.target.value = "";
  }

  function handlePreview() {
    if (!csvText.trim()) {
      toast.error("Please enter or upload CSV data");
      return;
    }

    const raw = parseCSV(csvText);
    if (raw.length === 0) {
      toast.error("No valid rows found in CSV data");
      return;
    }

    const validated = validateRows(raw, existingEmails, existingTeamNames);
    setParsedRows(validated);
    setStep("preview");
  }

  async function handleSendInvites() {
    const validRows = parsedRows.filter((r) => r.status !== "error");
    if (validRows.length === 0) {
      toast.error("No valid rows to import");
      return;
    }

    setStep("sending");
    setSendingProgress(30);

    try {
      setSendingProgress(60);
      const res = await bulkInvite(validRows);
      setSendingProgress(100);
      setResult(res);
      setStep("results");

      if (res.invited.length > 0) {
        toast.success(`${res.invited.length} invite(s) sent`);
        onComplete();
      }
    } catch {
      toast.error("Bulk import failed");
      setStep("preview");
    }
  }

  function handleDownloadTemplate() {
    const csv = "email,name,role,team\nalice@company.com,Alice Smith,member,Engineering\nbob@company.com,Bob Jones,manager,\"Engineering,Design\"\ncarol@company.com,Carol Wu,admin,";
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "teamprompt-import-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  const validCount = parsedRows.filter((r) => r.status === "valid").length;
  const warningCount = parsedRows.filter((r) => r.status === "warning").length;
  const errorCount = parsedRows.filter((r) => r.status === "error").length;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            {step === "input" && "Import Members"}
            {step === "preview" && "Preview Import"}
            {step === "sending" && "Sending Invites..."}
            {step === "results" && "Import Complete"}
          </DialogTitle>
        </DialogHeader>

        {/* Step 1: Input */}
        {step === "input" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Upload a CSV file or paste CSV data below. Expected columns:{" "}
              <code className="text-xs bg-muted px-1 py-0.5 rounded">
                email, name, role, team
              </code>
            </p>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload CSV
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDownloadTemplate}
              >
                <Download className="mr-2 h-4 w-4" />
                Download Template
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>

            <Textarea
              placeholder={`email,name,role,team\nalice@company.com,Alice Smith,member,Engineering\nbob@company.com,Bob Jones,manager,"Engineering,Design"`}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              className="min-h-[200px] font-mono text-xs"
            />

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => handleClose(false)}>
                Cancel
              </Button>
              <Button onClick={handlePreview} disabled={!csvText.trim()}>
                Preview
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Preview */}
        {step === "preview" && (
          <div className="space-y-4 flex-1 min-h-0 flex flex-col">
            {/* Summary badges */}
            <div className="flex gap-2 flex-wrap">
              {(validCount + warningCount) > 0 && (
                <Badge
                  variant="outline"
                  className="text-green-600 border-green-200 bg-green-50 dark:text-green-400 dark:border-green-800 dark:bg-green-950/30"
                >
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  {validCount + warningCount} will be invited
                </Badge>
              )}
              {warningCount > 0 && (
                <Badge
                  variant="outline"
                  className="text-yellow-600 border-yellow-200 bg-yellow-50 dark:text-yellow-400 dark:border-yellow-800 dark:bg-yellow-950/30"
                >
                  <AlertTriangle className="mr-1 h-3 w-3" />
                  {warningCount} with new teams
                </Badge>
              )}
              {errorCount > 0 && (
                <Badge
                  variant="outline"
                  className="text-red-600 border-red-200 bg-red-50 dark:text-red-400 dark:border-red-800 dark:bg-red-950/30"
                >
                  <AlertCircle className="mr-1 h-3 w-3" />
                  {errorCount} will be skipped
                </Badge>
              )}
            </div>

            {/* Scrollable preview table */}
            <div className="border rounded-lg overflow-auto flex-1 min-h-0">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-muted/80 backdrop-blur-sm">
                  <tr className="border-b">
                    <th className="text-left p-2 font-medium w-8"></th>
                    <th className="text-left p-2 font-medium">Email</th>
                    <th className="text-left p-2 font-medium">Name</th>
                    <th className="text-left p-2 font-medium">Role</th>
                    <th className="text-left p-2 font-medium">Team(s)</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedRows.map((row, i) => (
                    <tr
                      key={i}
                      className={cn(
                        "border-b",
                        row.status === "error" && "bg-red-50/50 dark:bg-red-950/20",
                        row.status === "warning" && "bg-yellow-50/50 dark:bg-yellow-950/20"
                      )}
                    >
                      <td className="p-2">
                        {row.status === "valid" && (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        )}
                        {row.status === "warning" && (
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        )}
                        {row.status === "error" && (
                          <X className="h-4 w-4 text-red-500" />
                        )}
                      </td>
                      <td className="p-2 font-mono text-xs">
                        {row.email}
                        {row.statusMessage && (
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {row.statusMessage}
                          </p>
                        )}
                      </td>
                      <td className="p-2">{row.name || "-"}</td>
                      <td className="p-2">
                        <Badge variant="outline" className="text-xs capitalize">
                          {row.role}
                        </Badge>
                      </td>
                      <td className="p-2">
                        {row.teams.length > 0 ? (
                          <div className="flex gap-1 flex-wrap">
                            {row.teams.map((t) => (
                              <Badge
                                key={t}
                                variant="outline"
                                className={cn(
                                  "text-[10px]",
                                  !existingTeamNames.has(t.toLowerCase()) &&
                                    "border-yellow-300 text-yellow-700 dark:border-yellow-700 dark:text-yellow-400"
                                )}
                              >
                                {t}
                                {!existingTeamNames.has(t.toLowerCase()) && " (new)"}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep("input")}>
                Back
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => handleClose(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSendInvites}
                  disabled={validCount + warningCount === 0}
                >
                  Send {validCount + warningCount} Invite
                  {validCount + warningCount !== 1 ? "s" : ""}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Sending */}
        {step === "sending" && (
          <div className="space-y-4 py-8">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Processing invites...
              </p>
              <div className="w-full max-w-xs h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${sendingProgress}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Results */}
        {step === "results" && result && (
          <div className="space-y-4">
            {/* Results summary */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg border bg-green-50 dark:bg-green-950/30 p-3 text-center">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {result.invited.length}
                </p>
                <p className="text-xs text-muted-foreground">Invited</p>
              </div>
              <div className="rounded-lg border bg-yellow-50 dark:bg-yellow-950/30 p-3 text-center">
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {result.skipped.length}
                </p>
                <p className="text-xs text-muted-foreground">Skipped</p>
              </div>
              <div className="rounded-lg border bg-red-50 dark:bg-red-950/30 p-3 text-center">
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {result.errors.length}
                </p>
                <p className="text-xs text-muted-foreground">Errors</p>
              </div>
            </div>

            {result.teamsCreated.length > 0 && (
              <div className="rounded-lg border p-3">
                <p className="text-sm font-medium mb-1">Teams Created</p>
                <div className="flex gap-1 flex-wrap">
                  {result.teamsCreated.map((t) => (
                    <Badge key={t} variant="outline" className="text-xs">
                      {t}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Detailed results */}
            {(result.skipped.length > 0 || result.errors.length > 0) && (
              <div className="border rounded-lg overflow-auto max-h-[200px]">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-muted/80">
                    <tr className="border-b">
                      <th className="text-left p-2 font-medium">Email</th>
                      <th className="text-left p-2 font-medium">Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.skipped.map((s, i) => (
                      <tr key={`s-${i}`} className="border-b">
                        <td className="p-2 font-mono">{s.email}</td>
                        <td className="p-2 text-muted-foreground">
                          {s.reason}
                        </td>
                      </tr>
                    ))}
                    {result.errors.map((e, i) => (
                      <tr
                        key={`e-${i}`}
                        className="border-b bg-red-50/50 dark:bg-red-950/20"
                      >
                        <td className="p-2 font-mono">{e.email}</td>
                        <td className="p-2 text-red-600 dark:text-red-400">
                          {e.reason}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex justify-end">
              <Button onClick={() => handleClose(false)}>Done</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
