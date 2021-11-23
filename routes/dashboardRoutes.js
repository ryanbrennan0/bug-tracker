const express = require('express');
const router = express.Router();

// for the business logic
const dashboardController = require('../controllers/dashboardController');

// get the dashboard page (shows 1st roadmap, or blank roadmap)
router.get('/dashboard', dashboardController.dashboard_get);

// add a bug/ticket to roadmap
router.post('/addTicket', dashboardController.dashboard_addTicket);

// get a specific roadmap
router.post('/getRoadmap', dashboardController.dashboard_getRoadmap);

// change status of bug/ticket
router.post('/changeStatus', dashboardController.dashboard_changeStatus);

// add member to the roadmap group
router.post('/addGroupMember', dashboardController.dashboard_addGroupMember);

// create new roadmap
router.post('/addRoadmap', dashboardController.dashboard_addRoadmap);

// remove a user from the roadmap
router.post('/dashboard/removeUser', dashboardController.dashboard_removeUser);

// delete bug/ticket from roadmap
router.post('/dashboard/deleteBug', dashboardController.dashboard_deleteBug);

module.exports = router;