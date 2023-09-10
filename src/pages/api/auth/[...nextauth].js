import axios from 'axios';
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

// import { verifyPassword } from '../../../utils/auth';

export default NextAuth({
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60
    },
    providers: [
        CredentialsProvider({
            async authorize(credentials) {
                console.log({ credentials })

                // const response = await axios.get('https://identity.arguserp.net/MA.asmx/getAC?_accountName=burger')
                const response = await axios.get('https://deploy.arguserp.net/SY.asmx/getUS2?_email=mustafa.abboud@softmachine.co')

                console.log({ resp: response })

                // https://identity.arguserp.net/MA.asmx/getAC?_accountName=burger
                // https://deploy.arguserp.net/SY.asmx/getUS2?_email=mustafa.abboud@softmachine.co
                const loggedUser = {
                    userId: user._id,
                    email: user.email,
                    role: user.role,
                    accessToken: accessToken
                }

                return loggedUser;
            },
        }),
    ],
    callbacks: {
        async jwt({ user, token }) {
            if (user) {
                token.user = user;
            }

            return token;
        },
        async session({ session, token }) {
            session.user = token.user;

            return session;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
});
