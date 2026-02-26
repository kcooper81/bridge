"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function OrgDetailRedirect() {
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    router.replace(`/admin/organizations?org=${params.id}`);
  }, [params.id, router]);

  return null;
}
