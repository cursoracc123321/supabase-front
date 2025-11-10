import type { AuthTokenResponsePassword, Session, User } from "@supabase/supabase-js";
import { getSupabaseClient } from "../lib/supabaseClient";

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials extends SignInCredentials {
  metadata?: Record<string, unknown>;
}

const supabase = () => getSupabaseClient();

export const signInWithPassword = async (
  credentials: SignInCredentials,
): Promise<AuthTokenResponsePassword> => {
  return supabase().auth.signInWithPassword({
    email: credentials.email,
    password: credentials.password,
  });
};

export const signUpWithPassword = async ({
  email,
  password,
  metadata,
}: SignUpCredentials): Promise<AuthTokenResponsePassword> => {
  return supabase().auth.signUp({
    email,
    password,
    options: {
      data: metadata,
    },
  });
};

export const signOut = async (): Promise<void> => {
  await supabase().auth.signOut();
};

export const getCurrentSession = async (): Promise<Session | null> => {
  const {
    data: { session },
  } = await supabase().auth.getSession();
  return session;
};

export const getCurrentUser = async (): Promise<User | null> => {
  const {
    data: { user },
  } = await supabase().auth.getUser();
  return user;
};

