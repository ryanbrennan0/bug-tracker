const dbAPI = require('../database');
const dashboardHelper = require('../dashboardHelper');
const webtoken = require('../webtoken');

// render the dashboard page w/ all the user's info - roadmaps, bug info, etc.
const dashboard_get = (req, res) => {
    var con = req.app.get('con');
    // get userID from JWT payload
    var user_id;
    webtoken.getPayload(req, (id) => {
        user_id = id;
    })
    dbAPI.getRoadmaps(con, req, (values) => {
        var roadmaps = [];
        for (var i = 0; i < values.length; i++) {
            roadmaps.push(values[i].roadmap_name);
        }
        // if specific request (navbar clicked), should have req.query.name, otherwise its undefined
        if (req.query.name != undefined) {
            // user clicked nav button, request specific roadmap
            data = dashboardHelper.getPage(roadmaps, res, req.query.name, con, user_id);
        } else {
            // load first roadmap - user just logged in
            data = dashboardHelper.getPage(roadmaps, res, roadmaps[0], con, user_id);
        }
    });
};

// add a new bug/ticket to the roadmap
const dashboard_addTicket = (req, res) => {
    var con = req.app.get('con');

    // ticket/bug fields
    var type = req.query.type;
    var title = req.body.title;
    var priority = req.body.priority;
    var deadline = req.body.deadline;

    // roadmap name from user's cookies
    var roadmapName = req.cookies.roadmap;
    console.log(roadmapName);

    var user_id;
    webtoken.getPayload(req, (id) => {
        user_id = id;
    });

    dbAPI.getUsername(user_id, con, (username) => {
        dbAPI.getGroupId(roadmapName, con, user_id, (groupId) => {
            dbAPI.addBug(groupId, title, priority, deadline, username, type, con);
            // redirect to refresh page, shows new changes
            res.redirect('/dashboard');
        });
    })
}

// render the requested roadmap, invokes dashboard_get w/ supplies roadmap name
const dashboard_getRoadmap = (req, res) => {
    var roadmapName = req.body.value;
    var string = encodeURIComponent(roadmapName);

    // redirect to dashboard_get function, supplied with req.query.name
    res.redirect('/dashboard?name=' + string);
}

// change status of a bug/ticket
const dashboard_changeStatus = (req, res) => {
    var con = req.app.get('con');
    data = req.body.value;
    webtoken.getPayload(req, (user_id) => {
        dbAPI.getGroupId(req.cookies.roadmap, con, user_id, (group_id) => {
            dbAPI.changeStatus(data.state, data.title, con, group_id);
        })
    })
}

// add a member to the roadmap group -> they can access & modify bugs/tickets
const dashboard_addGroupMember = (req, res) => {
    var con = req.app.get('con');
    var name = req.body.value;
    var roadmap = req.cookies.roadmap;

    webtoken.getPayload(req, (user_id) => {
        dbAPI.getGroupId(roadmap, con, user_id, (group_id) => {
            dbAPI.getUserId(name, con, (user_id) => {
                dbAPI.addGroupMember(user_id, group_id, con);
            })
        })
    })

    // return new member's name
    var redir = { name: name };
    return res.json(redir);
}

// add new roadmap to user's profile
const dashboard_addRoadmap = (req, res) => {
    var con = req.app.get('con');
    var roadmapName = req.body.value;
    dbAPI.addRoadmap(roadmapName, con, req);

    // return new roadmap's name
    var redir = { name: roadmapName };
    return res.json(redir);
}

// remove user from the roadmap group
const dashboard_removeUser = (req, res) => {
    var user = req.body.value;
    var con = req.app.get('con');

    webtoken.getPayload(req, (user_id) => {
        dbAPI.getGroupId(req.cookies.roadmap, con, user_id, (group_id) => {
            dbAPI.getUserId(user, con, (user_id) => {
                dbAPI.removeUser(user_id, group_id, con);
            })
        })
    })
    var redir = { name: 0 };
    return res.json(redir);
}

// remove a bug/ticket from the roadmap
const dashboard_deleteBug = (req, res) => {
    var title = req.body.value;
    var roadmapName = req.cookies.roadmap;
    var con = req.app.get('con');
    
    webtoken.getPayload(req, (user_id) => {
        dbAPI.getGroupId(roadmapName, con, user_id, (group_id) => {
            dbAPI.deleteBug(group_id, title, con);
            res.redirect('/dashboard')
        })
    })
}

// export these functions
module.exports = {
    dashboard_get,
    dashboard_addTicket,
    dashboard_addGroupMember,
    dashboard_changeStatus,
    dashboard_addRoadmap,
    dashboard_removeUser,
    dashboard_getRoadmap,
    dashboard_deleteBug
}