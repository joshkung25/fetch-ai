import { Auth0Client } from "@auth0/nextjs-auth0/server";

export const auth0 = new Auth0Client({
  authorizationParameters: {
    scope: "openid profile email read:api",
    audience: "https://api.fetchfileai.com",
  }
});

//http://localhost:3000/api/auth/callback, https://fetch-ai-mu.vercel.app/api/auth/callback, https://www.fetchfileai.com/api/auth/callback
