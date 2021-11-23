const sql = require('mysql');
const hashingAPI = require('./hashing.js');
const webtoken = require('./webtoken');

// initialise the connection to the db
const initialise = () => {
    return sql.createConnection({
        host: "localhost",
        user: "newuser",
        password: "InsideOutsideUpDown123!",
        database: "BugTracker"
    });
};

// connect to the db
const connect = (con) => {
    con.connect(function(err) {
        if (err) {
            throw err;
        }
        console.log("Connected!");
    });
};

// verify user login
const login = (username, password, res, con) => {
    var command = "SELECT * FROM Users WHERE username = ?;";
    con.query(command, [username], (err, rows) => {
        if (err) throw err;
        if (rows.length == 1) {
            var db_pass = rows[0].password;
            // hash password w/ associated salt
            var user_pass = hashingAPI.hash(password, rows[0].salt);

            // check hash(inputted pass + salt) w/ hash(actual pass + salt)
            if (db_pass === user_pass) {
                // create JWT token
                console.log("User logged in: " + username);
                webtoken.create(rows[0].user_id, res);
                res.redirect('/dashboard');
            } else  {
                console.log("Invalid Password");
            }
        } else {
            console.log('error');
        }
    });
};

// register a new user
const registerUser = (username, password, res, con) => {
    var salt = hashingAPI.generateSalt(16);
    password = hashingAPI.hash(password, salt);

    var command = "INSERT INTO Users (username, password, salt) VALUES (?,?,?);";
    con.query(command, [username, password, salt], (err, result) => {
        if (err) throw err;
        console.log('user added');
        res.redirect('/');
    });
};

// add roadmap 
const addRoadmap = (roadmapName, con, req) => {
    // only add roadmap_name; unique group_id created when added
    var command = "INSERT INTO Teams (roadmap_name) VALUES (?);";
    con.query(command, [roadmapName], (err, result) => {
        if (err) throw err;
        console.log("roadmap added");

        // JWT to get user_id
        webtoken.getPayload(req, (user_id) => {
            // add creator to the group
            addMember(user_id, result.insertId, con);
        })
    });
};

// add member to roadmap 
const addMember = (user_id, group_id, con) => {
    var command = "INSERT INTO Membership VALUES (?,?);";
    con.query(command, [user_id, group_id], (err, result) => {
        if (err) throw err;
        console.log("membership added");
    });
};

// get user's roadmaps
const getRoadmaps = (con, req, callback) => {
    var command = "SELECT * FROM Membership WHERE user_id = ?;";
    webtoken.getPayload(req, (user_id) => {
        var ids = [];
        // get all of user's groups
        con.query(command, [user_id], async (err, result) => {
            if (err) throw err;
            for (var i = 0; i < result.length; i++) {
                ids.push(result[i].group_id);
            }
            var command = "SELECT * FROM Teams WHERE group_id IN (?);";
            await con.query(command, [ids], (err, rows) => {
                callback(rows);
            });
        });
    });
};

// add bug ticket
const addBug = (group_id, title, priority, deadline, author, status, con) => {
    var command = "INSERT INTO Bugs (group_id, title, priority, deadline, author, status) VALUES (?,?,?,?,?,?);";
    con.query(command, [group_id, title, priority, deadline, author, status], (err, result) => {
        if (err) throw err;
    });
};

// get user's username by id
const getUsername = (user_id, con, callback) => {
    var command = "SELECT * FROM Users WHERE user_id = ?;";
    con.query(command, [user_id], (err, result) => {
        callback(result[0].username);
    })
}


// get group id of roadmap
const getGroupId = (roadmapName, con, user_id, callback) => {
    var command = "SELECT * FROM Teams WHERE roadmap_name = ?;"; 
    con.query(command, [roadmapName], (err, result) => {
        if (err) throw err;
        var arr = [];
        for (let i = 0; i < result.length; i++) {
            arr.push(result[i].group_id);
        }
        var command = "SELECT * FROM Membership WHERE group_id IN (?) AND user_id = ?";
        con.query(command, [arr, user_id], (err, res) => {
            if (err) throw err;
            callback(res[0].group_id);
        })
    });
};

// 0 = not started, 1 = in progress, 2 = completed
const getBugs = (status, roadmapName, con, user_id, callback) => {
    getGroupId(roadmapName, con, user_id, (groupId) => {
        var command = "SELECT * FROM Bugs WHERE group_id = ? AND status = ?;";
        con.query(command, [groupId, status], (err, result) => {
            if (err) throw err;
            callback(result);
        });
    });
};

// change status of bug ticket
const changeStatus = (status, title, con, group_id) => {
    console.log(status);
    console.log(title);
    var command = "UPDATE Bugs SET status = ? WHERE title = ? AND group_id = ?;";
    con.query(command, [status, title, group_id], (err, result) => {
        if (err) throw err;
        console.log("status changed");
    });
};

// return the username from an array of userIds
const getUsernames = (names, con, callback) => {
    var command = "SELECT * FROM Users WHERE user_id IN (?);";
    con.query(command, [names], (err, result) => {
        callback(result);
    });
};

// return all the members that are in the group
const getGroupMembers = (group_id, con, callback) => {
    var command = "SELECT * FROM Membership WHERE group_id = ?;";
    con.query(command, [group_id], (err, result) => {
        ids = [];
        for (let i = 0; i < result.length; i++) {
            ids.push(result[i].user_id);
        }
        getUsernames(ids, con, (output) => {
            callback(output);
        });
    });
};

// add a member to the group
const addGroupMember = (user_id, group_id, con) => {
    var command = "INSERT INTO Membership VALUES (?,?);";
    con.query(command, [user_id, group_id], (err, result) => {
        if (err) throw err;
        console.log("group member added");
    })
};

// return the userId linked to the supplies username
const getUserId = (username, con, callback) => {
    var command = "SELECT * FROM Users WHERE username = ?;";
    con.query(command, [username], (err, result) => {
        if (err) throw err;
        callback(result[0].user_id);
    })
};

// remove the user from the group
const removeUser = (user_id, group_id, con) => {
    var command = "DELETE FROM Membership WHERE user_id = ? AND group_id = ?";
    con.query(command, [user_id, group_id], (err, res) => {
        if (err) throw err;
    })
};

// delete the bug/ticket in the group
const deleteBug = (group_id, title, con) => {
    var command = "DELETE FROM Bugs WHERE group_id = ? AND title = ?";
    con.query(command, [group_id, title], (err, result) => {
        if (err) throw err;
    })
};

// export the functions
module.exports = {
    initialise,
    connect,
    login,
    registerUser,
    addRoadmap,
    addMember,
    getRoadmaps,
    addBug,
    getUsername,
    getGroupId,
    getBugs,
    changeStatus,
    getGroupMembers,
    addGroupMember,
    getUserId,
    removeUser,
    deleteBug
}

// DATABASE SCHEMA

// USERS:
// user_id (pk) username password salt

// TEAMS:
// group_id (pk) roadmap_name

// MEMBERSHIP:
// [user_id group_id] (pk) -> user_id (fk) group_id (fk)

// BUGS:
// bug_id (pk) group_id (fk) title priority deadline author status(0,1,2)
