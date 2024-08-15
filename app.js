const express = require("express");
const expressSession = require("express-session");
const passport = require("passport");
const bcryptjs = require("bcryptjs");
const LocalStrategy = require("passport-local").Strategy;
const { ExtractJwt, Strategy: JwtStrategy } = require("passport-jwt");
const jwt = require("jsonwebtoken");
const { PrismaSessionStore } = require("@quixo3/prisma-session-store");
const prisma = require("./db/prisma");
const app = express();
// SESSION CONFIGURATION
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  expressSession({
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000, // ms
    },
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    store: new PrismaSessionStore(prisma, {
      checkPeriod: 2 * 60 * 1000, //ms
      dbRecordIdIsSessionId: true,
      dbRecordIdFunction: undefined,
    }),
  })
);

passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Extract JWT from the Authorization header as a Bearer token
      secretOrKey: process.env.JWT_SECRET, // The secret key to decode the JWT
    },
    async (jwtPayload, done) => {
      try {
        const user = await prisma.user.findUnique({
          where: { id: jwtPayload.userId },
        });
        if (user) {
          return done(null, user);
        } else {
          return done(null, false);
        }
      } catch (err) {
        return done(err, false);
      }
    }
  )
);

// passport.use(
//   new LocalStrategy(async (username, password, done) => {
//     try {
//       user = await prisma.user.findUnique({
//         where: { username: username },
//       });
//       if (!user) {
//         return done(null, false, { message: "Incorrect username" });
//       }
//       const match = await bcryptjs.compare(password, user.password);
//       if (!match) {
//         return done(null, false, { message: "Incorrect password" });
//       }
//       return done(null, user);
//     } catch (err) {
//       return done(err);
//     }
//   })
// );

// passport.serializeUser((user, done) => {
//   done(null, user.id);
// });

// passport.deserializeUser(async (id, done) => {
//   try {
//     const user = await prisma.user.findUnique({
//       where: { id: id },
//     });

//     done(null, user);
//   } catch (err) {
//     done(err);
//   }
// });

app.use(passport.initialize());
app.use(passport.session());

// ROUTES BEGIN
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});
app.get("/", async (req, res) => {
  console.log(req.user);
  res.json({ message: "Hi" });
});
// app.post(
//   "/log-in",
//   passport.authenticate("local", {
//     successRedirect: "/",
//     failureRedirect: "/fail",
//   })
// );
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await prisma.user.findUnique({ where: { username } });

  if (!user || !(await bcryptjs.compare(password, user.password))) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  // Generate JWT
  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
    expiresIn: "5h",
  });

  // Send the token to the client
  res.json({ token });
});

app.get(
  "/protected",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.json({ message: "This is a protected route", user: req.user });
  }
);

app.get("/log-out", (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/"); // Redirect to the homepage or login page after logout
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
