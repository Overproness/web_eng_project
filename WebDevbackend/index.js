require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

const usersRouter = require("./routes/users");
app.use("/users", usersRouter);

const authRouter = require("./routes/auth");
app.use("/auth", authRouter);

const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI;

async function start(){
    try{
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to MongoDB");

        app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
        });
   

    }catch(error){
        console.error("Error starting the server:", error);
    }
}
start();

