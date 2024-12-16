import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const auth = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const token = authHeader.replace('Bearer ', '');

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.userId);
            
            if (!user) {
                throw new Error('User not found');
            }

            req.user = user;
            req.token = token;
            next();
        } catch (error) {
            res.status(401).json({ error: 'Token is invalid' });
        }
    } catch (error) {
        res.status(401).json({ error: 'Authentication required' });
    }
};