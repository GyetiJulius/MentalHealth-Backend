import Conversation from '../models/Conversation.js';
import { getLLMResponse } from '../utils/llm.js';

// Get all conversations
const getConversations = async (req, res) => {
    try {
        const conversations = await Conversation.find({ user: req.user._id });
        res.json(conversations);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get single conversation
const getConversation = async (req, res) => {
    try {
        const conversation = await Conversation.findOne({
            _id: req.params.id,
            user: req.user._id
        });
        
        if (!conversation) {
            return res.status(404).json({ error: 'Conversation not found' });
        }
        
        res.json(conversation);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create conversation
const createConversation = async (req, res) => {
    try {
        const { title, question } = req.body;
        
        if (!question) {
            return res.status(400).json({ error: 'Question is required' });
        }

        const conversation = new Conversation({
            title,
            question,
            user: req.user._id,
            messages: []
        });

        await conversation.save();
        res.status(201).json(conversation);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const deleteConversation = async (req, res) => {
    try {
        const conversation = await Conversation.findOneAndDelete({
            _id: req.params.id,
            user: req.user._id
        });

        if (!conversation) {
            return res.status(404).json({ error: 'Conversation not found' });
        }

        res.json({ message: 'Conversation deleted successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Send message
const sendMessage = async (req, res) => {
    try {
        const { content } = req.body;
        console.log('Incoming user message:', content);

        const conversation = await Conversation.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!conversation) {
            return res.status(404).json({ error: 'Conversation not found' });
        }

        // Add user message
        const userMessage = {
            sender: req.user._id,
            content,
            timestamp: new Date()
        };
        conversation.messages.push(userMessage);

        // Get LLM response
        try {
            console.log('Getting LLM response...');
            const llmResponse = await getLLMResponse(content, conversation.messages);
            console.log('LLM response received:', llmResponse);

            // Add LLM response to conversation
            const assistantMessage = {
                sender: 'assistant',
                content: llmResponse,
                timestamp: new Date()
            };
            conversation.messages.push(assistantMessage);

            await conversation.save();

            // Return both messages
            res.json({
                messages: [userMessage, assistantMessage]
            });
        } catch (llmError) {
            console.error('LLM Error:', llmError);
            
            // Save just the user message if LLM fails
            await conversation.save();
            
            res.status(500).json({ 
                error: 'Failed to get AI response',
                userMessage: userMessage
            });
        }
    } catch (error) {
        console.error('Error in sendMessage:', error);
        res.status(400).json({ error: error.message });
    }
};

export {
    getConversations,
    getConversation,
    createConversation,
    sendMessage,
    deleteConversation
};