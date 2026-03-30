"use client";

import { useEffect, useRef } from "react";
import { useUser } from "~/hooks/use-user";
import { createClient } from "~/lib/supabase/client";

const ANON_USER_ID_KEY = "anon_user_id";

/**
 * After OAuth sign-in, transfers game progress from the previous anonymous
 * session to the newly authenticated user via a database RPC call.
 */
export function useTransferProgress(onTransferred?: () => void) {
  const { user, isAnonymous, loading } = useUser();
  const attempted = useRef(false);

  useEffect(() => {
    if (loading || isAnonymous || !user || attempted.current) return;

    const anonUserId = localStorage.getItem(ANON_USER_ID_KEY);
    if (!anonUserId) return;

    attempted.current = true;

    async function transfer() {
      const supabase = createClient();
      await supabase.rpc("transfer_anonymous_progress", {
        old_user_id: anonUserId,
      });
      localStorage.removeItem(ANON_USER_ID_KEY);
      onTransferred?.();
    }
    transfer();
  }, [user, isAnonymous, loading, onTransferred]);
}
