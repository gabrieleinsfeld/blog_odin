const express = require("express");
const expressSession = require("express-session");
const passport = require("passport");
const bcryptjs = require("bcryptjs");
const { ExtractJwt, Strategy: JwtStrategy } = require("passport-jwt");
const jwt = require("jsonwebtoken");
const { PrismaSessionStore } = require("@quixo3/prisma-session-store");
const prisma = require("./db/prisma");
const db = require("./db/queries");
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
          include: {
            author: {
              include: {
                posts: true,
              },
            },
            normal: true,
            likes: true,
            comments: true,
          },
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

app.use(passport.initialize());
app.use(passport.session());

// ROUTES BEGIN
const commentRouter = require("./routes/commentsRouter");
const likeRouter = require("./routes/likeRouter");
const postRouter = require("./routes/postRouter");
const userRouter = require("./routes/userRouter");

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});
app.get("/", async (req, res) => {
  res.json({ message: "Hi" });
});

app.post("/log-in", async (req, res) => {
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

app.get("/log-out", (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/"); // Redirect to the homepage or login page after logout
  });
});
app.use(
  "/comment",
  passport.authenticate("jwt", { session: false }),
  commentRouter
);

app.use("/like", likeRouter);
app.use("/post", passport.authenticate("jwt", { session: false }), postRouter);
app.use("/user", passport.authenticate("jwt", { session: false }), userRouter);
app.post("/sign-up", async (req, res) => {
  const { firstName, lastName, username, password } = req.body;
  await db.createUser(firstName, lastName, username, password);

  const user = await prisma.user.findUnique({ where: { username } });
  await prisma.normal.create({
    data: {
      userId: user.id,
    },
  });
  res.json({ user: user });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
