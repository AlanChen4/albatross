"use client";

import { useCallback } from "react";
import { createClient } from "~/lib/supabase/client";

/**
 * Returns a function that ensures a Supabase session exists.
 * Creates an anonymous session on first call if the user isn't logged in.
 */
export function useEnsureSession() {
  return useCallback(async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) return user;

    const { data, error } = await supabase.auth.signInAnonymously();
    if (error) {
      console.error("Failed to create anonymous session:", error);
      return null;
    }
    return data.user;
  }, []);
}
