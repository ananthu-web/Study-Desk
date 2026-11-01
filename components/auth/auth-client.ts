"use client";

import { createAuthClient } from "better-auth/react";

// Same-origin requests work on either local hostname and the eventual production domain.
export const authClient = createAuthClient();
