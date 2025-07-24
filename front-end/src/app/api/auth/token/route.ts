import { getAccessToken } from '@auth0/nextjs-auth0';

export async function GET(req: Request) {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    return new Response('Unauthorized', { status: 401 });
  }

  return Response.json({ accessToken });
}