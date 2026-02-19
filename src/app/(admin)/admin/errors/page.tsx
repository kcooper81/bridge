"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  Loader2,
  Check,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";

interface ErrorRow {
  id: string;
  message: string;
  stack: string | null;
  url: string | null;
  user_email: string | null;
  org_name: string | null;
  resolved: boolean;
  created_at: string;
}

export default function ErrorsPage() {
  const [errors, setErrors] = useState<ErrorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showResolved, setShowResolved] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    loadErrors();
  }, [showResolved]);

  const loadErrors = async () => {
    setLoading(true);
    const supabase = createClient();

    let query = supabase
      .from("error_logs")
      .select("id, message, stack, url, user_id, org_id, resolved, created_at")
      .order("created_at", { ascending: false })
      .limit(100);

    if (!showResolved) {
      query = query.eq("resolved", false);
    }

    const { data: rawErrors } = await query;

    if (!rawErrors || rawErrors.length === 0) {
      setErrors([]);
      setLoading(false);
      return;
    }

    const userIds = Array.from(new Set(rawErrors.map((e: { user_id: string | null }) => e.user_id).filter(Boolean) as string[]));
    const orgIds = Array.from(new Set(rawErrors.map((e: { org_id: string | null }) => e.org_id).filter(Boolean) as string[]));

    const [usersRes, orgsRes] = await Promise.all([
      userIds.length > 0
        ? supabase.from("profiles").select("id, email").in("id", userIds)
        : { data: [] },
      orgIds.length > 0
        ? supabase.from("organizations").select("id, name").in("id", orgIds)
        : { data: [] },
    ]);

    const userMap = new Map(
      (usersRes.data || []).map((u: { id: string; email: string }) => [u.id, u.email])
    );
    const orgMap = new Map(
      (orgsRes.data || []).map((o: { id: string; name: string }) => [o.id, o.name])
    );

    setErrors(
      rawErrors.map((e: { id: string; message: string; stack: string | null; url: string | null; user_id: string | null; org_id: string | null; resolved: boolean; created_at: string }) => ({
        id: e.id,
        message: e.message,
        stack: e.stack,
        url: e.url,
        user_email: e.user_id ? userMap.get(e.user_id) || null : null,
        org_name: e.org_id ? orgMap.get(e.org_id) || null : null,
        resolved: e.resolved,
        created_at: e.created_at,
      }))
    );

    setLoading(false);
  };

  const resolveError = async (id: string) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("error_logs")
      .update({
        resolved: true,
        resolved_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      toast.error("Failed to resolve error");
    } else {
      toast.success("Error resolved");
      if (showResolved) {
        setErrors(errors.map((e) => (e.id === id ? { ...e, resolved: true } : e)));
      } else {
        setErrors(errors.filter((e) => e.id !== id));
      }
    }
  };

  const unresolvedCount = errors.filter((e) => !e.resolved).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Error Logs</h1>
          <p className="text-muted-foreground">
            {showResolved
              ? `${errors.length} errors total`
              : `${unresolvedCount} unresolved errors`}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowResolved(!showResolved)}
        >
          {showResolved ? "Hide Resolved" : "Show Resolved"}
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : errors.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertTriangle className="h-10 w-10 text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No errors found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {errors.map((err) => (
            <Card key={err.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {err.resolved ? (
                        <Badge
                          variant="outline"
                          className="text-xs text-green-600"
                        >
                          Resolved
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="text-xs">
                          Unresolved
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {new Date(err.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="font-medium text-sm">{err.message}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      {err.user_email && <span>{err.user_email}</span>}
                      {err.org_name && <span>&middot; {err.org_name}</span>}
                      {err.url && <span>&middot; {err.url}</span>}
                    </div>
                    {err.stack && (
                      <div className="mt-2">
                        <button
                          className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                          onClick={() =>
                            setExpandedId(
                              expandedId === err.id ? null : err.id
                            )
                          }
                        >
                          {expandedId === err.id ? (
                            <>
                              <ChevronUp className="h-3 w-3" /> Hide stack
                              trace
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-3 w-3" /> Show stack
                              trace
                            </>
                          )}
                        </button>
                        {expandedId === err.id && (
                          <pre className="mt-2 text-xs bg-muted p-3 rounded-lg overflow-x-auto max-h-48">
                            {err.stack}
                          </pre>
                        )}
                      </div>
                    )}
                  </div>
                  {!err.resolved && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => resolveError(err.id)}
                      className="flex-shrink-0"
                    >
                      <Check className="mr-1 h-3 w-3" />
                      Resolve
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
