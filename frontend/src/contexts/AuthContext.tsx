import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState
} from "react";
import Router from "next/router";
import { setCookie, parseCookies, destroyCookie } from "nookies";

import { api } from "../services/apiClient";

interface SignInCredentials {
  email: string;
  password: string;
}

export type UserProps = {
  email: string;
  permissions: string[];
  roles: string[];
} | null;

interface AuthContextProps {
  signIn(credentials: SignInCredentials): Promise<void>;
  signOut(): void;
  user: UserProps;
  isAuthenticated: boolean;
}

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthContext = createContext({} as AuthContextProps);

let authChannel: BroadcastChannel;

export const useAuth = () => useContext(AuthContext);

export function signOut() {
  destroyCookie(undefined, "@app.token");
  destroyCookie(undefined, "@app.refreshToken");

  authChannel.postMessage("signOut");

  Router.push("/");
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserProps>(null);
  const isAuthenticated = !!user;

  async function signIn(credentials: SignInCredentials) {
    try {
      const response = await api.post("sessions", credentials);

      const { token, refreshToken, permissions, roles } = response.data;
      const { email } = credentials;

      // sessionStorage -> Dura por uma sessão de navegador (se fechar, ele exclui os dados).
      // localStorage -> Dura para sempre, porém estamos utilizando NextJS e precisamos fazer uma verificação SSR.
      // Cookies -> A melhor opção pois os cookies conseguem armazenar informações e podem ser acessadas via SSR.

      setCookie(undefined, "@app.token", token, {
        maxAge: 60 * 60 * 24 * 30, // 30 dias
        path: "/"
      });
      setCookie(undefined, "@app.refreshToken", refreshToken, {
        maxAge: 60 * 60 * 24 * 30, // 30 dias
        path: "/"
      });

      setUser({
        email,
        permissions,
        roles
      });

      api.defaults.headers["Authorization"] = `Bearer ${token}`;

      Router.push("/dashboard");

      authChannel.postMessage("signIn");
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    const { "@app.token": token } = parseCookies();

    if (token) {
      api
        .get("/me")
        .then(response => {
          const { email, permissions, roles } = response.data;

          setUser({ email, permissions, roles });
        })
        .catch(() => {
          Router.push("/");
        });
    }
  }, []);

  useEffect(() => {
    authChannel = new BroadcastChannel("auth");

    authChannel.onmessage = message => {
      switch (message.data) {
        case "signOut":
          signOut();
          break;        
        default:
          break;
      }
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        signIn,
        signOut,
        isAuthenticated
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
