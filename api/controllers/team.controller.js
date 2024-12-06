import { Event } from "../models/Event.models.js";
import { TeamDetail } from "../models/Team.models.js";
import { asyncHandler, ApiError, ApiResponse, uploadOnCloudinary } from "../utils/utils.js";

export const fetchAllTeam = asyncHandler(async (req, res) => {
    try {
        const allTeams = await TeamDetail.find();

        return res.status(200).json(new ApiResponse(200, allTeams, "All Teams fetched Successfully"))

    } catch (error) {
        return res.status(500).json(new ApiError(500, "Unable to Fetch Team due to Sever Error", error))
    }
})

export const postTeamData = asyncHandler(async (req, res) => {
    const { name, title, department, position, email, facebook, instagram, twitter, linkedin } = req.body;
    if (!name || !title) {
        return res.status(400).json({ message: "Name and title are required fields." });
    }
    try {
        const imgLocalPath = req.files?.img[0]?.path; //path in local server not on cloudinary
        if (!imgLocalPath) throw new ApiError(400, "Img file is required");

        const avatar = await uploadOnCloudinary(imgLocalPath);
        if (!avatar) throw new ApiError(400, "Img not found");

        // Create the team member data
        const teamMemberData = {
            img: avatar?.secure_url || "",
            fullName: name,
            designation: title,
            department: department || "",
            position: position || "core",
            social_links: [
                facebook || "",
                instagram || "",
                email || "",
                twitter || "",
                linkedin || "",
            ].filter((link) => link !== ""),
        };

        // Save team data in the database
        const newTeamMember = new TeamDetail(teamMemberData);
        await newTeamMember.save();

        res.status(201).json({ message: "Team member saved successfully!" });
    } catch (error) {
        console.error("Error saving team data:", error);
        res.status(500).json({ message: "Failed to save team member data.", error });
    }
});

export const saveBulkTeamData = async (req, res) => {
    const { data } = req.body;

    if (!Array.isArray(data)) {
        return res.status(400).json({ message: "Invalid data format. Must be an array." });
    }

    try {
        const bulkDataPromises = data.map(async (item) => {
            let cloudinaryImgUrl = null;

            // Upload image to Cloudinary if a file path is provided
            if (item.img) {
                const uploadedImg = await uploadOnCloudinary(item.img);
                if (uploadedImg) {
                    cloudinaryImgUrl = uploadedImg.secure_url; // URL from Cloudinary
                }
            }

            return {
                img: cloudinaryImgUrl,
                fullName: item.name,
                designation: item.title || "",
                department: item.department || "",
                position: item.position || "core",
                social_links: [
                    item.facebook || "",
                    item.instagram || "",
                    item.twitter || "",
                    item.linkedin || "",
                ].filter((link) => link !== ""),
            };
        });

        // Wait for all promises to resolve
        const bulkData = await Promise.all(bulkDataPromises);

        await TeamDetail.insertMany(bulkData);

        res.status(201).json({ message: "Team details saved successfully!" });
    } catch (error) {
        console.error("Error saving bulk team data:", error);
        res.status(500).json({ message: "Failed to save team details.", error });
    }
};