const express = require("express");
const router = express.Router();
const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const redis = require("redis");

const saltRounds = parseInt(process.env.SALT_ROUNDS);
const jwtSecret = process.env.JWT_SECRET;

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

router.post("/signup", async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  // check if user exists
  const userExists = await userModel.findOne({ email: email });
  if (userExists) {
    return res.status(400).json({ message: "User already exists." });
  }

  // hash password
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // create new user
  const newUser = new userModel({
    firstName,
    lastName,
    email,
    password: hashedPassword,
  });

  // save user to db
  try {
    const savedUser = await newUser.save();

    // create jwt token
    const token = jwt.sign(
      {
        id: savedUser._id,
        email: savedUser.email,
      },
      jwtSecret,
      { expiresIn: "1h" }
    );

    // save token to redis
    await redisClient.set(savedUser._id.toString(), token);

    // send token to client as cookie
    res.cookie("token", token, {
      httpOnly: false,
    });

    // send response
    res.status(200).json({ message: "User created successfully." });
  } catch (err) {
    res.status(400).json({ message: err });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // check if user exists
  const user = await userModel.findOne({ email: email });
  if (!user) {
    return res.status(400).json({ message: "User does not exist." });
  }

  // check if password is correct
  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    return res.status(400).json({ message: "Invalid password." });
  }

  // create jwt token
  const token = jwt.sign(
    {
      id: user._id,
      email: user.email,
    },
    jwtSecret,
    { expiresIn: "1h" }
  );

  // save token to redis
  await redisClient.set(user._id.toString(), token);

  // send token to client as cookie
  res.cookie("token", token, {
    httpOnly: false,
  });

  // send response
  res.status(200).json({ message: "User logged in successfully." });
});

router.get("/logout", async (req, res) => {
  // get token from cookie
  const token = req.cookies.token;

  jwt.verify(token, jwtSecret, async (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    const user = await userModel.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    // delete token from redis
    await redisClient.del(user._id.toString());

    // delete cookie
    res.clearCookie("token");

    // send response
    res.status(200).json({ message: "User logged out successfully." });
  });
});

router.get("/verify", async (req, res) => {
  const token = req.cookies.token;

  jwt.verify(token, jwtSecret, async (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await userModel.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // check if token exists in redis
    const redisToken = await redisClient.get(user._id.toString());
    if (!redisToken) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    user.password = undefined;
    res.status(200).json({ message: "User verified.", user: user });
  });
});

router.post("/select_type", async (req, res) => {
  const { type, typeValue } = req.body;

  // get token from cookie
  const token = req.cookies.token;

  jwt.verify(token, jwtSecret, async (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    // check if token exists in redis
    const redisToken = await redisClient.get(decoded.id.toString());
    if (!redisToken) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await userModel.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    // update user type
    user.type = type;
    user.typeName = typeValue;
    await user.save();

    // send response
    res.status(200).json({ message: "User type updated successfully." });
  });
});

router.post("/select_hosting", async (req, res) => {
    const { type } = req.body;
    
    // get token from cookie
    const token = req.cookies.token;
    
    jwt.verify(token, jwtSecret, async (err, decoded) => {
        if (err) {
        return res.status(401).json({ message: "Unauthorized." });
        }
    
        // check if token exists in redis
        const redisToken = await redisClient.get(decoded.id.toString());
        if (!redisToken) {
        return res.status(401).json({ message: "Unauthorized" });
        }
    
        const user = await userModel.findById(decoded.id);
        if (!user) {
        return res.status(401).json({ message: "Unauthorized." });
        }
    
        // update user hosting
        user.hosting = type;
        await user.save();
    
        // send response
        res.status(200).json({ message: "User hosting updated successfully." });
    });
});

module.exports = router;
