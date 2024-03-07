const express = require("express")
require("dotenv").config({ path: "./.env" })
const http = require("http")
const path = require("path")
const Filters = require("bad-words")
const socketio = require("socket.io")
const { addUser, getUser, getUsersFromRoom } = require("./utils/user.js")
const { generateMessage, generateLocationMessage } = require("./utils/message.js")


//this will create an express application
const app = express();

//Here, you're creating an HTTP server using Node.js's built-in http module's createServer method. This server is configured to handle requests using the Express application instance app. This is a common pattern when integrating Express with HTTP servers.
const server = http.createServer(app);

//This line initializes Socket.IO with the HTTP server you've created. It binds Socket.IO to the HTTP server instance, allowing Socket.IO to intercept and handle WebSocket connections alongside regular HTTP requests.
const io = socketio(server);


const port = process.env.port || 8080;
const publicDirPath = path.join(__dirname, "../public")

app.use(express.static(publicDirPath));

//io is refrence of socket.io, on which we are emitting event from server side
io.on("connection", socket => {
    console.log("New WebSocket connection");

    //client request on "join" event
    //this code snippet demonstrates how to handle user joining events in a Socket.IO-based chat application, including adding users to rooms and broadcasting messages to other users.
    socket.on("join", (options, callback) => {
        //import user info
        const { error, user } = addUser({ id: socket.id, ...options })

        if (error) {
            return callback(error)
        } else {
            //joins the current socket (user) to a room specified by user.room
            socket.join(user.room);


            //server responds on message event with generateMessage functions and confirms that user joined the room successfully
            socket.emit("message", generateMessage("Admin", "Welcome!!"))

            //This line broadcasts a "message" event to all sockets except the current one in the specified room (user.room). It notifies other users in the room that a new user (user.username`) has joined.
            socket.broadcast.to(user.room).emit("message", generateMessage("Admin", `${user.username} has joined!`))

            io.to(user.user.room).emit("roomData", {
                room: user.room,
                users: getUsersFromRoom(user.room)
            })

            callback();
        }
    })
    socket.on("sendMessage", (message, callback) => {
        const user = getUser(socket.id);
        const filter = new Filters()

        if (filter.isProfane(message)) {
            return callback("Profanity is not allowed!")
        } else {
            io.to(user.room).emit("message", generateMessage(user.username, message))
            callback();
        }
    });

    socket.on("sendLocation", (coords, callback) => {
        const user = getUser(socket.id);
        io.to(user.room).emit("locationMessage", generateLocationMessage(user.username, `https://www.google.com/maps?q=${coords.latitude},${coords.longitude}`));
        callback();
    });

    socket.io("disconnect", () => {

        const user = removeUser(socket.id);

        if (user) {
            io.to(user.room).emit("message", generateMessage("Admin", `${user.username} has left!`));
            io.to(user.room).emit("roomData", {
                room: user.room,
                users: getUsersFromRoom(user.room)
            });
        }
    })
})


app.listen(port, () => {
    console.log(`Server is listening on ${port}`)
})