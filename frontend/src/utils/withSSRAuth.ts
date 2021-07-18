import {
  GetServerSideProps,
  GetServerSidePropsContext,
  GetServerSidePropsResult
} from "next";
import { destroyCookie, parseCookies } from "nookies";
import decode from "jwt-decode";

import { AuthTokenError } from "../services/errors/AuthTokenError";
import { validateUserPermissions } from "./validateUserPermissions";
import { UserProps } from "../contexts/AuthContext";

interface WithSSROptions {
  permissions?: string[];
  roles?: string[];
}

export function withSSRAuth<P>(
  fn: GetServerSideProps<P>,
  options?: WithSSROptions
) {
  return async (
    ctx: GetServerSidePropsContext
  ): Promise<GetServerSidePropsResult<P>> => {
    const cookies = parseCookies(ctx);
    const token = cookies["@app.token"];

    if (!token) {
      return {
        redirect: {
          destination: "/",
          permanent: false
        }
      };
    }

    if (options) {
      const user = decode<UserProps>(token);
      const { permissions, roles } = options;

      const userHasValidPermissions = validateUserPermissions({
        user,
        permissions,
        roles
      });

      if (!userHasValidPermissions) {
        return {
          redirect: { destination: "/dashboard", permanent: false }
        };
      }
    }

    try {
      return await fn(ctx);
    } catch (error) {
      if (error instanceof AuthTokenError) {
        destroyCookie(ctx, "@app.token");
        destroyCookie(ctx, "@app.refreshToken");

        return {
          redirect: {
            destination: "/",
            permanent: false
          }
        };
      }

      throw error;
    }
  };
}
