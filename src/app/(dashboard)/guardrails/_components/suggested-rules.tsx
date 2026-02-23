"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Lightbulb,
  Check,
  X,
  TrendingUp,
  Eye,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { getSuggestedRules, reviewSuggestedRule } from "@/lib/sensitive-terms-api";
import { toast } from "sonner";
import type { SuggestedRule } from "@/lib/types";

interface SuggestedRulesProps {
  canEdit: boolean;
}

export function SuggestedRules({ canEdit }: SuggestedRulesProps) {
  const [rules, setRules] = useState<SuggestedRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRule, setSelectedRule] = useState<SuggestedRule | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);

  const fetchRules = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getSuggestedRules("pending");
      setRules(data);
    } catch (err) {
      console.error("Failed to load suggested rules:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  const handleReview = async (id: string, action: "approve" | "dismiss") => {
    setProcessing(id);
    try {
      await reviewSuggestedRule(id, action);
      toast.success(action === "approve" ? "Rule created from suggestion" : "Suggestion dismissed");
      fetchRules();
      setSelectedRule(null);
    } catch (err) {
      toast.error("Failed to process suggestion");
      console.error(err);
    } finally {
      setProcessing(null);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-tp-green";
    if (confidence >= 0.5) return "text-tp-yellow";
    return "text-muted-foreground";
  };

  const pendingCount = rules.length;

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Lightbulb className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <CardTitle>AI-Suggested Rules</CardTitle>
                <CardDescription>
                  Patterns detected by the system that you may want to add as rules
                </CardDescription>
              </div>
            </div>
            {pendingCount > 0 && (
              <Badge variant="secondary" className="text-sm">
                {pendingCount} pending
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 rounded-lg bg-muted animate-pulse" />
              ))}
            </div>
          ) : rules.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Lightbulb className="h-10 w-10 text-muted-foreground/50 mb-3" />
              <h3 className="text-sm font-medium">No suggestions yet</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                As your team uses AI tools, we&apos;ll analyze patterns and suggest rules for data you may want to protect.
              </p>
            </div>
          ) : (
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Suggested Rule</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Detections</TableHead>
                    <TableHead>Confidence</TableHead>
                    <TableHead className="w-[120px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rules.map((rule) => (
                    <TableRow key={rule.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{rule.name}</p>
                          {rule.description && (
                            <p className="text-xs text-muted-foreground truncate max-w-xs">
                              {rule.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs capitalize">
                          {rule.category.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-sm">{rule.detection_count}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`text-sm font-medium ${getConfidenceColor(rule.confidence)}`}>
                          {Math.round(rule.confidence * 100)}%
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => setSelectedRule(rule)}
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          {canEdit && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-tp-green hover:text-tp-green"
                                onClick={() => handleReview(rule.id, "approve")}
                                disabled={processing === rule.id}
                              >
                                <Check className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive hover:text-destructive"
                                onClick={() => handleReview(rule.id, "dismiss")}
                                disabled={processing === rule.id}
                              >
                                <X className="h-3.5 w-3.5" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <Dialog open={!!selectedRule} onOpenChange={() => setSelectedRule(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedRule?.name}</DialogTitle>
            <DialogDescription>{selectedRule?.description}</DialogDescription>
          </DialogHeader>
          {selectedRule && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Pattern Type</p>
                  <Badge variant="outline">{selectedRule.pattern_type}</Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Suggested Action</p>
                  <Badge variant={selectedRule.severity === "block" ? "destructive" : "default"}>
                    {selectedRule.severity === "block" ? "Block" : "Warn"}
                  </Badge>
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-1">Pattern</p>
                <code className="block p-2 rounded-lg bg-muted text-sm font-mono break-all">
                  {selectedRule.pattern}
                </code>
              </div>

              {selectedRule.sample_matches && selectedRule.sample_matches.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Sample Matches</p>
                  <div className="space-y-1">
                    {selectedRule.sample_matches.slice(0, 5).map((match, i) => (
                      <code key={i} className="block p-1.5 rounded bg-muted text-xs font-mono">
                        {match}
                      </code>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-muted-foreground">
                    <TrendingUp className="h-4 w-4 inline mr-1" />
                    {selectedRule.detection_count} detections
                  </span>
                  <span className={getConfidenceColor(selectedRule.confidence)}>
                    {Math.round(selectedRule.confidence * 100)}% confidence
                  </span>
                </div>
              </div>

              {canEdit && (
                <div className="flex justify-end gap-2 pt-2 border-t">
                  <Button
                    variant="outline"
                    onClick={() => handleReview(selectedRule.id, "dismiss")}
                    disabled={processing === selectedRule.id}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Dismiss
                  </Button>
                  <Button
                    onClick={() => handleReview(selectedRule.id, "approve")}
                    disabled={processing === selectedRule.id}
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Create Rule
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
