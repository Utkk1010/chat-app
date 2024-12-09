import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";

export const getUserForSidebar = async (req, res) => {
    try {

        const loggedInUserId = req.user._id;
        const filteredUsers = await User.find({ _id: {$ne: loggedInUserId}}).select("-password");

        res.status(201).json(filteredUsers);
        
    } catch (error) {
        console.log("Error in getUserSidebar", error);
        res.status(500).json({message: "Internal Server error"});
    }
}

export const getMessages = async(req, res) => {
    try {

        const { id: userToChatId } = req.params;
        const myId = req.user._id;

        const messages = await Message.find({
            $or: [
                { senderId: myId, recieverId: userToChatId},
                { senderId: userToChatId, recieverId: myId},
            ],
        });

        res.status(201).json(messages);

    } catch (error) {

        console.log("Error in getMessages", error);
        res.status(500).json({message: "Internal Server error"});
    }
}

export const sendMessage = async (req, res) => {
    try {

        const {text, image} = req.body;
        const {id: recieverId} = req.params;
        const senderId = req.user._id;
        
        let imageUrl;
        if(image){
            //upload on cloudinary
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        const newMessage = new Message({
            senderId,
            recieverId,
            text,
            image: imageUrl,
        });

        await newMessage.save();

        //real time functionality => socket.io

        res.status(201).json(newMessage);
        
    } catch (error) {
        console.log("Error in sendMessage controller", error);
        res.status(500).json({message: "Internal server error"});
    }
}