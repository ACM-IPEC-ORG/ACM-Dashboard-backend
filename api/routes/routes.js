import { Router } from "express";
import { upload, verifyJWT} from "../middlewares/middleware.js";
import { fetchAllTeam, postTeamData, saveBulkTeamData } from "../controllers/team.controller.js";
import googleAuth from "../controllers/googleauth.controller.js";
import { fetchAllEvent, postBulkEvents, updateEventPoster } from "../controllers/event.controller.js";
import multer from "multer";


const router=Router()

router.get("/auth/google", googleAuth);

// event routes
router.get("/events/allEvent",fetchAllEvent)
router.post("/events/bulk", postBulkEvents);

// Route to update poster for a specific event using its slug
router.put("/events/:slug/poster",upload.fields([
    {
        name:"img",
        maxCount:1
    },
]), updateEventPoster);

// teams routes
router.get("/teams/allTeam",fetchAllTeam)
router.post("/teams/postTeam",
    upload.fields([
        {
            name:"img",
            maxCount:1
        },
    ]),postTeamData)
router.post("/teams/bulk", saveBulkTeamData);

// gallery routes

// contact routes

export default router