
import { Event } from "../models/Event.models.js";
import { TeamDetail } from "../models/Team.models.js";
import { asyncHandler,ApiError,ApiResponse, uploadOnCloudinary } from "../utils/utils.js";

export const fetchAllEvent=asyncHandler(async(req,res)=>{
    try {
        const allEvents=await Event.find();
        if(!allEvents) throw new ApiError(404,"Events now found")

        return res.status(200).json(new ApiResponse(200,allEvents,"Fetched All Events"))
    } catch (error) {
        throw new ApiError(500,"Unable to Fetch Team due to Sever Error",error)
    }
})

export const postEventDetails=asyncHandler(async(req,res)=>{
    try {
        const {title,description,tagline,date,poster,session,winners,rules,instagram_post}=req.body;

        if (!(title&&description&&tagline&&session&&winners&&rules&&instagram_post)) throw new ApiError(404,"Mention all requried details");

        const newEventDetail=await Event.create({
            title,
            slug,
            description,
            tagline,
            poster:poster??"",
            session,
            winners,
            rules,
            date:date||"",
            instagram_post
        })

        if(!newEventDetail) throw new ApiError(301,"Event Detail isn't created")
        return new ApiResponse(200,{},"Event Detail Post")
    } catch (error) {
        return new ApiError(500,"Unable to Post Event Details")
    }
});


export const updateEventPoster = async (req, res) => {
  const { slug } = req.params; // Slug to identify the event
  const { img } = req.body; // Path to the image file

  if (!slug || !img) {
    return res.status(400).json({ message: "Slug and image file path are required." });
  }

  try {
    // Upload image to Cloudinary
    const uploadedImg = await uploadOnCloudinary(img);
    if (!uploadedImg) {
      return res.status(500).json({ message: "Image upload failed." });
    }

    // Update event's poster field
    const updatedEvent = await Event.findOneAndUpdate(
      { slug },
      { poster: uploadedImg.secure_url },
      { new: true }
    );

    if (!updatedEvent) {
      return res.status(404).json({ message: `Event with slug '${slug}' not found.` });
    }

    res.status(200).json({
      message: "Event poster updated successfully!",
      data: updatedEvent,
    });
  } catch (error) {
    console.error("Error updating event poster:", error);
    res.status(500).json({ message: "Failed to update event poster.", error });
  }
};

export const editEventDetails = async (req, res) => {
  const updates = req.body; // Extract updates from the request body
  console.log(updates)
  try {
    if (!updates.slug) {
      return res.status(400).json({ message: "Event slug is required." });
    }

    // Handle poster upload if provided
    let poster_obj;
    if (req.files?.img?.[0]?.path) {
      const imgLocalPath = req.files.img[0].path;
      poster_obj = await uploadOnCloudinary(imgLocalPath);
      if (!poster_obj) throw new ApiError(400, "Failed to upload poster.");
    }
    let poster=poster_obj.secure_url

    // Define allowed fields for updates
    const allowedFields = [
      "title", "description", "info", "tagline", "TS", "date", "session",
      "winners", "rules", "instagram_post"
    ];

    // Filter updates to include only allowed fields
    const filteredUpdates = Object.keys(updates).reduce((acc, key) => {
      if (allowedFields.includes(key)) {
        acc[key] = updates[key];
      }
      return acc;
    }, {});

    // Add poster if updated
    if (poster) {
      filteredUpdates.poster = poster;
    }

    if (Object.keys(filteredUpdates).length === 0) {
      return res.status(400).json({ message: "No valid fields to update." });
    }

    // Update the event
    const updatedEvent = await Event.findOneAndUpdate(
      { slug: updates.slug }, // Find event by slug
      { $set: filteredUpdates }, // Apply updates
      { new: true} // Return the updated document
    );

    if (!updatedEvent) {
      return res.status(404).json({ message: "Event not found." });
    }

    res.status(200).json({ message: "Event updated successfully.", data: updatedEvent });

  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).json({ 
      message: "An error occurred while updating the event.", 
      error: error.message 
    });
  }
};

export const postBulkEvents = async (req, res) => {
    const events = req.body; // Expecting an array of event objects
    console.log(events)
    try {
      if (!Array.isArray(events) || events.length === 0) {
        return res.status(400).json({ message: "No events data provided." });
      }
  
      const formattedEvents = events.map((event) => ({
        title: event.heading,
        slug: event.slugs.toLowerCase().trim(),
        description: event.intro,
        info: event.info,
        tagline: event.tagline,
        poster: "", // Placeholder for poster image
        session: event.tags,
        TS:event.TS,
        winners: event.winners || [],
        rules: event.rules || [],
        instagram_post: [],
        date:event.date||""
      }));
  
      const savedEvents = await Event.insertMany(formattedEvents);
  
      res.status(201).json({
        message: `${savedEvents.length} events added successfully!`,
        data: savedEvents,
      });
    } catch (error) {
      console.error("Error posting bulk events:", error);
      res.status(500).json({ message: "Failed to post bulk events.", error });
    }
  };