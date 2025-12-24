import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"

export const { handlers, signIn, signOut, auth } = NextAuth({
  debug: true,
  secret: process.env.AUTH_SECRET,
  providers: [
    GitHub({
        authorization: { params: { scope: "repo" } },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) {
        token.accessToken = account.access_token
      }
      if (profile && 'login' in profile) {
        token.username = profile.login
      }
      return token
    },
    async session({ session, token }) {
        if (token.accessToken) {
            (session as any).accessToken = token.accessToken;
        }
        if (token.username) {
            (session as any).username = token.username;
        }
        return session
    },
  },
})
