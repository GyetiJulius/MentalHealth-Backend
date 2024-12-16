import express from 'express';
import { auth } from '../middleware/auth.js';
import { 
    createConversation,
    getConversations,
    getConversation,
    sendMessage,
    deleteConversation
} from '../controllers/chatController.js';

const router = express.Router();

// Get all conversations
router.get('/', auth, getConversations);

// Get single conversation
router.get('/:id', auth, getConversation);

// Create new conversation
router.post('/', auth, createConversation);

// Send message in conversation
router.post('/:id/message', auth, sendMessage);

// Delete conversation
router.delete('/:id', auth, deleteConversation);

export default router; 