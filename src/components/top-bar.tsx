"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { LikeButton } from "~/components/like-button";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { useUser } from "~/hooks/use-user";
import { createClient } from "~/lib/supabase/client";
import { MenuDialog, type MenuTab } from "./menu-dialog";

const ANON_USER_ID_KEY = "anon_user_id";

async function signInWithGoogle(puzzleId: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Stash anonymous user ID so we can transfer progress after OAuth
  if (user?.is_anonymous) {
    localStorage.setItem(ANON_USER_ID_KEY, user.id);
  }

  await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback?puzzle_id=${puzzleId}`,
    },
  });
}

export function TopBar({ puzzleId }: { puzzleId: string }) {
  const { isAnonymous, loading } = useUser();
  const [signInOpen, setSignInOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuTab, setMenuTab] = useState<MenuTab>("browse");

  if (loading) return null;

  function openMenu(tab: MenuTab) {
    setMenuTab(tab);
    setMenuOpen(true);
  }

  if (!isAnonymous) {
    return (
      <>
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="absolute inset-x-0 top-0 z-10 flex flex-row items-center justify-between gap-0.5 px-4 py-3"
          initial={{ opacity: 0, y: "-100%" }}
          transition={{ duration: 0.3 }}
        >
          <Button
            onClick={() => openMenu("browse")}
            size="xs"
            sketchy
            variant="outline"
          >
            Menu
          </Button>
          <LikeButton puzzleId={puzzleId} />
        </motion.div>

        <MenuDialog
          initialTab={menuTab}
          onOpenChange={setMenuOpen}
          open={menuOpen}
        />
      </>
    );
  }

  return (
    <>
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="absolute inset-x-0 top-0 z-10 px-4 py-1"
        initial={{ opacity: 0, y: "-100%" }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex flex-row items-center justify-between gap-0.5">
          <p className="text-muted-foreground">
            <button
              className="cursor-pointer text-foreground underline underline-offset-4"
              onClick={() => setSignInOpen(true)}
              type="button"
            >
              Sign up / Login
            </button>{" "}
            — browse puzzles and more!
          </p>
        </div>
      </motion.div>

      <Dialog onOpenChange={setSignInOpen} open={signInOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign up / Login</DialogTitle>
            <DialogDescription className="sr-only">
              Sign in to your account
            </DialogDescription>
          </DialogHeader>
          <Button
            className="w-full gap-2"
            onClick={() => signInWithGoogle(puzzleId)}
            variant={"outline"}
          >
            <svg aria-hidden="true" className="size-3" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
