require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
const logger = require("./utils/logger");

const app = express();

app.use(cors());
app.use(express.json());

app.use(
  morgan("combined", {
    stream: {
      write: (message) => logger.http(message.trim()),
    },
  })
);

const usersRouter = require("./routes/users");
app.use("/users", usersRouter);

const authRouter = require("./routes/auth");
app.use("/auth", authRouter);

const codegenRouter = require("./routes/codegen");
app.use("/codegen", codegenRouter);

const MONGODB_URI = process.env.MONGODB_URI;

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("MongoDB connection error:", error));

// Only listen on a port for local dev / traditional hosts (e.g. Render).
// On Vercel this file is the service entrypoint; the exported app is invoked per-request instead.
if (require.main === module) {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
