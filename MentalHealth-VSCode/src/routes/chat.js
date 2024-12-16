import express from 'express';
import { Conversation } from '../models/conversation.js';

const router = express.Router();

// Create new conversation
router.post('/conversations', async (req, res) => {
    try {
        const conversation = new Conversation({
            title: req.body.title || 'New Conversation',
            messages: []
        });
        await conversation.save();
        res.json(conversation);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all conversations
router.get('/conversations', async (req, res) => {
    try {
        const conversations = await Conversation.find().sort({ updatedAt: -1 });
        res.json(conversations);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get single conversation
router.get('/conversations/:id', async (req, res) => {
    try {
        const conversation = await Conversation.findById(req.params.id);
        if (!conversation) {
            return res.status(404).json({ error: 'Conversation not found' });
        }
        res.json(conversation);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add message to conversation
router.post('/conversations/:id/messages', async (req, res) => {
    try {
        const { role, content } = req.body;
        const conversation = await Conversation.findById(req.params.id);
        if (!conversation) {
            return res.status(404).json({ error: 'Conversation not found' });
        }

        conversation.messages.push({ role, content });
        conversation.updatedAt = Date.now();
        await conversation.save();
        res.json(conversation);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
