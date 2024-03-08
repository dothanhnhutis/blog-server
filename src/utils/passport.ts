// import { PassportStatic } from "passport";
// import { Strategy as LocalStrategy } from "passport-local";
// import prisma from "./db";
// import { compareData } from "./index";
// import { signCSRF } from "./csrf";

// export const passportConfig = (passport: PassportStatic) => {
//   passport.use(
//     new LocalStrategy(
//       { usernameField: "email" },
//       async (email, password, done) => {
//         const user = await prisma.user.findUnique({
//           where: { email },
//         });
//         if (
//           !user ||
//           !user.isActive ||
//           !user.password ||
//           !(await compareData(user.password, password))
//         ) {
//           return done(null, false, {
//             message: "Incorrect username or password.",
//           });
//         }

//         return done(null, {
//           id: user.id,
//           csrf: signCSRF(),
//           email: user.email,
//           username: user.username,
//           isActive: user.isActive,
//           role: user.role,
//           avatarUrl: user.avatarUrl,
//         });
//       }
//     )
//   );

//   passport.serializeUser<{
//     id: string;
//     csrf: string;
//   }>((user, done) => {
//     return done(null, user);
//   });

//   passport.deserializeUser<{
//     id: string;
//     csrf: string;
//   }>(async (user, done) => {
//     const userExist = await prisma.user.findUnique({
//       where: { id: user.id },
//     });
//     if (!userExist) return done(null, false);
//     return done(null, {
//       ...user,
//       email: userExist.email,
//       username: userExist.username,
//       isActive: userExist.isActive,
//       role: userExist.role,
//       avatarUrl: userExist.avatarUrl,
//     });
//   });
// };
