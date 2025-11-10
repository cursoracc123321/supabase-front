import { useEffect } from "react";
import { getSupabaseClient } from "../../lib/supabaseClient";
import { useAuthStore } from "../../state/authStore";
import { Loader } from "../common/Loader";

const supabase = getSupabaseClient();

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const { setSession, setUser, setLoading, loading } = useAuthStore();

  useEffect(() => {
    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    void init();

    return () => {
      subscription.unsubscribe();
    };
  }, [setSession, setUser, setLoading]);

  if (loading) {
    return <Loader />;
  }

  return <>{children}</>;
};

