const dbAPI = require('./database');

// load the requested dashboard page w/ it all the user's data
const getPage = (roadmaps, res, value, con, user_id) => {

    var notStarted;
    dbAPI.getBugs(0, value, con, user_id, (results) => { // get not started bugs
        notStarted = createJSON(results);
    })
    var inProgress;
    dbAPI.getBugs(1, value, con, user_id, (results) => { // get in progress bugs
        inProgress = createJSON(results);
    })
    var completed;
    dbAPI.getBugs(2, value, con, user_id, (results) => { // get completed bugs
        completed = createJSON(results);
    })

    dbAPI.getGroupId(value, con, user_id, (group_id) => {

        // get list of all users in this group (have access to roadmap)
        dbAPI.getGroupMembers(group_id, con, (members) => {

            // add usernames to array
            team = [];
            for (var i = 0; i < members.length; i++) {
                team.push(members[i].username);
            }

            // data packet to send to client
            data = {
                page : value, // roadmap name
                roadmaps : roadmaps, // list of all the user's roadmaps
                notStarted : notStarted, // bugs
                inProgress : inProgress,
                completed : completed,
                groupMembers : team // list of group member's usernames
            };

            console.log(value);

            // add roadmap name to cookies - easily read current roadmap w/o db lookup
            res.cookie("roadmap", value);
            res.render('index', {data : data});
        })
    })
};

// create the JSON data object used in creating the dashboard page
// used to create objects defining bug attributes
const createJSON = (results) => {
    if (results === undefined) {
        return [];
    }
    arr = [];
    for (var i = 0; i < results.length; i++) {
        var obj = {
            "title" : results[i].title,
            "priority" : results[i].priority,
            "deadline" : results[i].deadline,
            "author" : results[i].author
        }
        arr.push(obj);
    }
    return arr;
}

module.exports.getPage = getPage;








    // dbAPI.getBugs(0, value, con, user_id, (results) => { // get not started bugs
    //     notStarted = createJSON(results);
    //     dbAPI.getBugs(1, value, con, user_id, (results) => { // get in progress bugs
    //         inProgress = createJSON(results);
    //         dbAPI.getBugs(2, value, con, user_id, (results) => { // get completed bugs
    //             completed = createJSON(results);

    //             dbAPI.getGroupId(value, con, user_id, (group_id) => {
    //                 dbAPI.getGroupMembers(group_id, con, (members) => {
    //                     team = [];
    //                     for (var i = 0; i < members.length; i++) {
    //                         team.push(members[i].username);
    //                     }

    //                     // data packet to send to client
    //                     data = {
    //                         page : value,
    //                         roadmaps : roadmaps,
    //                         notStarted : notStarted,
    //                         inProgress : inProgress,
    //                         completed : completed,
    //                         groupMembers : team
    //                     };

    //                     console.log(value);

    //                     // add roadmap name to cookies - easily read current roadmap w/o db lookup
    //                     res.cookie("roadmap", value);
    //                     res.render('index', {data : data});
    //                 })
    //             })
    //         });
    //     });
    // });