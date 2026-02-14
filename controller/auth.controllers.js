import { generateToken } from "../config/jwt.js";
import User from "../models/User.js";
import bcrypt from 'bcrypt';


export const signupRequest = async (req, res) => {
    
    try {
        const {name,email,password} = req.body;

        const exist = await User.findOne({email});

        if(exist) return res.status(400).json({message: "User Already Exists"});

        const hashedPassword = await bcrypt.hash(password,10);

        const user = await User.create({
            name,email,password:hashedPassword
        });

        const token = generateToken(user._id);
        res.status(201).json({token});
    }
    catch (err) {
        res.status(500).json({message: "Signup failed"});
    }
};

export const loginRequest = async (req, res) => {
    try { 
        const {email, password} = req.body;
        const user = await User.findOne({email});
        if (!user) {
            return res.status(400).json({message: "User doesn't exists"});
        }

        const matched = bcrypt.compare(password,user.password);
        if(!matched) {
            return res.status(400).json({messge: "Password is incorrect"});
        }

        const token = generateToken(user._id);

        res.json({ token});
    } catch (err) {
        res.status(500).json({ message: "Login failed"});
    }

};