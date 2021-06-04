import express from "express";
import server from "./server";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const { DB_USER, DB_PASSWORDS, DB_NAME, PORT } = process.env;

const createServer = async () => {
  try {
    await mongoose.connect(
      `mongodb+srv://${DB_USER}:${DB_PASSWORDS}@biolab-equipment-bookin.1bijf.mongodb.net/${DB_NAME}?retryWrites=true&w=majority`,
      { useNewUrlParser: true,
        useFindAndModify: false,
        useUnifiedTopology: true,
        useCreateIndex: true  
      }
    );

    const app = express();

    server.applyMiddleware({ app });

    app.listen({ port: PORT }, () => {
      console.log(
        `🚀  Server is started at http://localhost:${PORT}${server.graphqlPath}`
      );
    });
  } catch (err) {
    console.log('Server is error ---->', err);
  }
};

createServer();
