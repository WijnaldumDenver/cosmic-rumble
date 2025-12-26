"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authOptions = void 0;
const credentials_1 = __importDefault(require("next-auth/providers/credentials"));
const prisma_1 = require("./prisma");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
exports.authOptions = {
    providers: [
        (0, credentials_1.default)({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Invalid credentials");
                }
                const user = await prisma_1.prisma.user.findUnique({
                    where: { email: credentials.email }
                });
                if (!user) {
                    throw new Error("Invalid credentials");
                }
                const isPasswordValid = await bcryptjs_1.default.compare(credentials.password, user.password);
                if (!isPasswordValid) {
                    throw new Error("Invalid credentials");
                }
                return {
                    id: user.id,
                    email: user.email,
                    username: user.username,
                    role: user.role,
                };
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                const u = user;
                token.id = u.id;
                token.username = u.username;
                token.role = u.role;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                const s = session;
                s.user.id = token.id;
                s.user.username = token.username;
                s.user.role = token.role;
            }
            return session;
        }
    },
    pages: {
        signIn: "/auth/signin",
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
};
