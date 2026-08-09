"use client";

import { createContext, useContext } from "react";
import type { CurrentUser } from "@/lib/api/authenticated-fetch";

const AuthContext = createContext<CurrentUser | null>(null);
export const AuthProvider = AuthContext.Provider;
export function useCurrentUser() { return useContext(AuthContext); }
