require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const passport = require("passport");
const githubStrategy = require("passport-github2").Strategy;
const googleStrategy = require("passport-google-oauth20").Strategy;
const redis = require("redis");
const jwt = require("jsonwebtoken");
const { createAppAuth } = require('@octokit/auth-app');
const { Octokit } = require('@octokit/core');
const expressSession = require("express-session");
const userModel = require("./models/user.model");
const userRoutes = require("./routes/user.routes");
const fs = require("fs");

// vars for jwt
const jwtSecret = process.env.JWT_SECRET;

// vars for mongo data
const mongo_user = process.env.MONGO_USER;
const mongo_pass = process.env.MONGO_PASSWORD;
const dbUrl = `mongodb+srv://${mongo_user}:${mongo_pass}@cluster0.use2n4m.mongodb.net`;

// redis client
const redisClient = redis.createClient({
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
});

(async function () {
  redisClient.on("connect", (err) => {
    console.log("Client connected to Redis...");
  });
  redisClient.on("ready", (err) => {
    console.log("Redis ready to use");
  });
  redisClient.on("error", (err) => {
    console.error("Redis Client", err);
  });
  redisClient.on("end", () => {
    console.log("Redis disconnected successfully");
  });
  await redisClient.connect();
  return redisClient;
})();

// passport config
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

passport.use(
  new githubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: "/auth/github/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      const email = profile._json.email
        ? profile._json.email
        : profile.username;
      const user = await userModel.findOne({ email: email });
      if (!user) {
        const newUser = new userModel({
          firstName: profile.displayName.split(" ")[0],
          lastName: profile.username,
          email: email,
          password: profile.username
        });

        const savedUser = await newUser.save();

        return done(null, savedUser);
      }
      else{
          return done(null, user);
      }
    }
  )
);

passport.use(
  new googleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      const email = profile.emails[0].value;
      const user = await userModel.findOne({ email: email });
      if (!user) {
        const newUser = new userModel({
          firstName: profile.name.givenName,
          lastName: profile.name.familyName,
          email: email,
          password: profile.displayName
        });

        const savedUser = await newUser.save();

        return done(null, savedUser);
      }
      else{
        return done(null, user);
      }
    }
  )
);

// init express backend
const app = express();
app.use(express.json());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(
  expressSession({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

const PORT = process.env.PORT || 5000;

// connect to mongoDB
mongoose.connect(dbUrl, {
  useNewUrlParser: true,
});

// main route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to the xerocodee API." });
});

// github auth
app.get(
  "/auth/github",
  passport.authenticate("github", { scope: ["user:email"] })
);

// github auth callback
app.get(
  "/auth/github/callback",
  passport.authenticate("github", { failureRedirect: "/login" }),
  async (req, res) => {
    // set cookie
    // create jwt token
    const token = jwt.sign(
      {
        id: req.user._id,
        email: req.user.email,
      },
      jwtSecret,
      { expiresIn: "1h" }
    );

    // save token to redis
    await redisClient.set(req.user._id.toString(), token);

    // send token to client as cookie
    res.cookie("token", token, {
      httpOnly: true,
    });
    res.redirect(process.env.CLIENT_URL);
  }
);

// google auth
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// google auth callback
app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  async (req, res) => {
    // set cookie
    // create jwt token
    const token = jwt.sign(
      {
        id: req.user._id,
        email: req.user.email,
      },
      jwtSecret,
      { expiresIn: "1h" }
    );

    // save token to redis
    await redisClient.set(req.user._id.toString(), token);

    // send token to client as cookie
    res.cookie("token", token, {
      httpOnly: true,
    });
    res.redirect(process.env.CLIENT_URL);
  }
);

async function createJWT(installationId) {
  const appOctokit = await new Octokit({
    authStrategy: createAppAuth,
    auth: {
      appId: process.env.GITHUB_APP_ID,
      privateKey: process.env.PRIVATE_KEY,
    },
  });

  try{
    const { token } = await appOctokit.auth({
      type: "installation",
      installationId: installationId,
    });

    return token;
  }
  catch(err){
    return err;
  }
}

async function githubRequest(url, installationId, userName) {
  const token = await createJWT(installationId);

  const octokit = await new Octokit({
    auth: token,
  });

  try{
    const res = await octokit.request(url, {
      username: userName,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });

    return res;
  }
  catch(err){
    return err;
  }

}

async function getPackageJSON(userName, installationId) {
  const pkg = await githubRequest('GET /users/{username}/repos', installationId, userName)
  return pkg;
}

app.post('/get_github_data', async function(req, res) {
    const installationId = req.body.installation_id;
    const data = await getPackageJSON(req.body.userName, installationId);
    res.status(200).json({ data: data });
});

// user routes
app.use("/api/user", userRoutes);

// Run backend
app.listen(PORT, () => {
  console.log("server started on port " + PORT);
});
