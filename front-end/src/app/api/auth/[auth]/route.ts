// import { NextRequest, NextResponse } from "next/server";

// export async function GET(request: NextRequest) {
//   const { pathname } = new URL(request.url);
  
//   if (pathname.includes('/login')) {
//     const loginUrl = `${process.env.AUTH0_BASE_URL}/api/auth/login`;
//     return NextResponse.redirect(loginUrl);
//   }
  
//   if (pathname.includes('/logout')) {
//     const logoutUrl = `${process.env.AUTH0_BASE_URL}/api/auth/logout`;
//     return NextResponse.redirect(logoutUrl);
//   }
  
//   if (pathname.includes('/callback')) {
//     const callbackUrl = `${process.env.AUTH0_BASE_URL}/api/auth/callback`;
//     return NextResponse.redirect(callbackUrl);
//   }
  
//   return NextResponse.redirect(new URL('/api/auth/login', request.url));
// }

// export async function POST(request: NextRequest) {
//   return GET(request);
// }