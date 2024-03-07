const users = [];

const addUser = ({ id, username, room }) => {

    //clean data
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();



    //Validata user data
    if (!(username || room)) {
        return {
            error: "Username and room are required !!!"
        }
    }



    //check for existing user
    const existingUser = users.find(user => {
        return user.username === username && user.room === room
    });

    if (existingUser) return {
        error: "Usernae me is in use"
    };



    //create user in users array
    const user = { id, username, room }
    users.push(user)


    return { user };
}

const removeUser = id => {
    const index = users.findIndex(user => users.id === id)

    if (index !== -1) {
        return users.splice(index, 1)[0]
    }
}

const getUser = id => {
    return users.find(user => user.id === id)
}

const getUsersFromRoom = room => {
    room = room.trim().toLowerCase();
    return users.filter(user => user.room === room);
}


module.exports = {
    addUser,
    getUser,
    getUsersFromRoom
}