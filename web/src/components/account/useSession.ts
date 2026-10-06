"use client";

import { useCallback, useEffect, useState } from "react";
import { api, apiSend } from "@/lib/http";

export type Profile = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address?: string;
  city?: string;
};

const TOKEN = "furniture-token";
const PROFILE = "furniture-profile";

export function authToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN);
}

function remember(token: string, profile: Profile) {
  localStorage.setItem(TOKEN, token);
  localStorage.setItem(PROFILE, JSON.stringify(profile));
}

export function useSession() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- restore the signed-in customer once on mount */
    const token = localStorage.getItem(TOKEN);
    if (!token) {
      setReady(true);
      return;
    }
    const cached = localStorage.getItem(PROFILE);
    if (cached) {
      try {
        setProfile(JSON.parse(cached) as Profile);
      } catch {
        localStorage.removeItem(PROFILE);
      }
    }
    api<Profile>("/customers/me", { headers: { Authorization: `Bearer ${token}` } })
      .then((next) => {
        localStorage.setItem(PROFILE, JSON.stringify(next));
        setProfile(next);
      })
      .catch(() => {
        localStorage.removeItem(TOKEN);
        localStorage.removeItem(PROFILE);
        setProfile(null);
      })
      .finally(() => setReady(true));
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const signIn = useCallback(async (phone: string, password: string) => {
    const result = await apiSend<{ token: string; customer: Profile }>("/customers/login", { phone, password });
    remember(result.token, result.customer);
    setProfile(result.customer);
  }, []);

  const register = useCallback(async (input: Profile & { password: string }) => {
    const result = await apiSend<{ token: string; customer: Profile }>("/customers/register", input);
    remember(result.token, result.customer);
    setProfile(result.customer);
  }, []);

  const save = useCallback(async (input: Profile & { password?: string }) => {
    const token = localStorage.getItem(TOKEN);
    const next = await apiSend<Profile>("/customers/me", input, token);
    if (token) localStorage.setItem(PROFILE, JSON.stringify(next));
    setProfile(next);
    return next;
  }, []);

  const exit = useCallback(() => {
    localStorage.removeItem(TOKEN);
    localStorage.removeItem(PROFILE);
    setProfile(null);
  }, []);

  return { profile, ready, signIn, register, save, exit };
}
