const express = require("express");
const formData = require("express-form-data");
const fs = require('fs')
const os = require("os");
const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config();
const config = require("./config");
const controllers = require("./controllers");
const { configureCloudinary, testCloudinaryConnection } = require("./config/cloudinary");
const app = express();
const cors = require("cors");
const http = require("http");
// const socketIo = require("socket.io");
// const event = require("./services/emitter");
const cron = require("./crons/index");
const Place = require("./models/places");
const Shortly = require("./models/shortly");
const { get } = require("lodash");


// const serveIndex = require('serve-index');

///////////////////////
// const swaggerSpec = require("./swagger/swagger");

// const swaggerJsdoc = require("swagger-jsdoc");
// const swaggerUi = require("swagger-ui-express");
//////////
const server = http.createServer(app); // Create an HTTP server instance
// const io = socketIo(server, { cors: { origin: "*" } });

const options = {
  uploadDir: os.tmpdir(),
  autoClean: true,
};

// parse data with connect-multiparty.
app.use(formData.parse(options));
// delete from the request all empty files (size == 0)
app.use(formData.format());
// change the file objects to fs.ReadStream
app.use(formData.stream());
// union the body and the files
app.use(formData.union());
// middleware to parse data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({ origin: "*" }));
// app.use('/.well-known', express.static('.well-known'), serveIndex('.well-known'));
// serve up static assets
// app.use(express.static(path.join(__dirname, "./build")))
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "./build")))
} else {
  app.use(express.static(path.join(__dirname, "./build_staging")));
}

// connect to Mongo DB

mongoose
  .connect(config.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(async () => {
    console.log(`Mongo DB Succesfully Connected`);
    
    // Initialize Cloudinary
    if (process.env.CLOUDINARY_CLOUD_NAME) {
      configureCloudinary();
      await testCloudinaryConnection();
    } else {
      console.error("❌ Cloudinary not configured!");
      console.error("   Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET");
      console.error("   AWS S3 fallback is disabled");
      process.exit(1); // Exit if Cloudinary is not configured
    }
  })
  .catch((err) => console.log(err));

app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

// use routes
app.use(controllers);
////////////////////////
// const specs = swaggerJsdoc(swaggerSpec);
// app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
/////////////////

app.get("/welcome", function (request, response) {
  const filePath = process.env.NODE_ENV === 'production' ? path.resolve(__dirname, "./build", "onboarding-new.html") : path.resolve(__dirname, "./build_staging", "onboarding-new.html");
  response.sendFile(filePath);
});



app.get("*", function (request, response) {
  const filePath = process.env.NODE_ENV === 'production' ? path.resolve(__dirname, "./build", "index.html") : path.resolve(__dirname, "./build_staging", "index.html");
  if (request.path === "/receipt" || request.path === "/" || request.path === "/sub-invoice") {
    fs.readFile(filePath, 'utf8', function (err, data) {
      if (err) {
        response.sendFile(filePath);
      }
      data = data.replace("66b25234a3e8060009c61d7c", "");
      data = data.replace("botcopy-embedder-d7lcfheammjct", "");
      response.send(data);
    });
  } else {
    response.sendFile(filePath);
  }
});

// io.on("connection", (socket) => {
//   console.log("A user connected");

//   event.on("notification", (data) => {
//     io.sockets.emit("notification", data);
//   });
//   event.on("get_notification", (data) => {
//     io.sockets.emit("get_notification");
//   });

//   socket.on("disconnect", () => {
//     console.log("User disconnected");
//   });
// });


// Emitter.on("notification", (data) => {
//   io.sockets.emit("notification_sent", data);
// });


// const connectedSockets = new Set();

/* io.on("connection", (socket) => {
  console.log("A user connected");

  // Store the socket in the set of connected sockets
  connectedSockets.add(socket);

  const notificationHandler = (data) => {
    socket.emit("notification", data);
  };

  const getNotificationHandler = (data) => {
    socket.emit("get_notification");
  };

  event.on("notification", notificationHandler);
  event.on("get_notification", getNotificationHandler);

  socket.on("disconnect", () => {
    console.log("User disconnected");

    connectedSockets.delete(socket);
    event.removeListener("notification", notificationHandler);
    event.removeListener("get_notification", getNotificationHandler);
  });
}); */


cron();
// check for "production" enviroment and set port
const PORT = process.env.PORT || 3000;

// start server
server.listen(PORT, () => {
  console.log(`App listening on port: ${PORT}`);
});
