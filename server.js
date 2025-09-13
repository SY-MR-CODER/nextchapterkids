const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const OpenAI = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const stripe = process.env.STRIPE_SECRET_KEY ? require('stripe')(process.env.STRIPE_SECRET_KEY) : null;
const supabase = require('./supabase');
const bcrypt = require('bcrypt');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Production environment check
const isProduction = process.env.NODE_ENV === 'production';

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Initialize Google Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Database functions using Supabase

// Subscription plans
const subscriptionPlans = {
    free: {
        id: 'free',
        name: 'Free',
        price: 0,
        storiesPerMonth: 3,
        features: ['3 stories per month', 'Basic story themes', 'Standard length stories']
    },
    basic: {
        id: 'basic',
        name: 'Basic',
        price: 9.99,
        storiesPerMonth: 25,
        features: ['25 stories per month', 'All story themes', 'Longer stories', 'Save favorite stories']
    },
    premium: {
        id: 'premium',
        name: 'Premium',
        price: 19.99,
        storiesPerMonth: -1, // Unlimited
        features: ['Unlimited stories', 'All themes + exclusive ones', 'Extra long stories', 'Multiple children profiles', 'Story illustrations', 'PDF downloads']
    }
};

// Fallback in-memory storage for when Supabase isn't set up
const fallbackUsers = new Map();
const fallbackStories = new Map();

// Add test users to fallback storage
fallbackUsers.set('test@example.com', {
    id: 'test123',
    parent_name: 'Test Parent',
    email: 'test@example.com',
    password_hash: 'test123', // In production, this should be hashed
    subscription_plan: 'free',
    subscription_status: 'active',
    stories_this_month: 1,
    subscription_reset_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    children: [
        {
            id: 'child1',
            name: 'Emma',
            age: 7,
            favorite_books: ['Harry Potter', 'The Cat in the Hat'],
            interests: 'unicorns, rainbows, and magical adventures',
            reading_level: 'intermediate',
            stories_generated: 3
        }
    ]
});

// Database helper functions with fallback
async function createUser(parentName, email, password) {
    try {
        const passwordHash = await bcrypt.hash(password, 10);
        
        const { data, error } = await supabase
            .from('users')
            .insert([{
                parent_name: parentName,
                email: email,
                password_hash: passwordHash,
                subscription_plan: 'free',
                subscription_status: 'active',
                stories_this_month: 0
            }])
            .select()
            .single();
        
        if (error) throw error;
        return data;
    } catch (error) {
        console.log('Supabase not available, using fallback storage');
        // Fallback to in-memory storage
        const userId = Date.now().toString();
        const user = {
            id: userId,
            parent_name: parentName,
            email: email,
            password_hash: await bcrypt.hash(password, 10),
            subscription_plan: 'free',
            subscription_status: 'active',
            stories_this_month: 0,
            children: []
        };
        fallbackUsers.set(email, user);
        return user;
    }
}

async function getUserByEmail(email) {
    try {
        const { data, error } = await supabase
            .from('users')
            .select(`
                *,
                children (*)
            `)
            .eq('email', email)
            .single();
        
        if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
        return data;
    } catch (error) {
        console.log('Supabase not available, using fallback storage');
        // Fallback to in-memory storage
        return fallbackUsers.get(email) || null;
    }
}

async function verifyPassword(plainPassword, hashedPassword) {
    // For fallback users, do simple comparison (not secure, just for demo)
    if (hashedPassword === plainPassword) return true;
    return await bcrypt.compare(plainPassword, hashedPassword);
}

async function addChild(userId, childData) {
    try {
        const { data, error } = await supabase
            .from('children')
            .insert([{
                user_id: userId,
                name: childData.name,
                age: childData.age,
                reading_level: childData.readingLevel,
                favorite_books: childData.favoriteBooks,
                interests: childData.interests
            }])
            .select()
            .single();
        
        if (error) throw error;
        return data;
    } catch (error) {
        console.log('Supabase not available, using fallback storage');
        // Fallback to in-memory storage
        const childId = Date.now().toString();
        const child = {
            id: childId,
            user_id: userId,
            name: childData.name,
            age: childData.age,
            reading_level: childData.readingLevel,
            favorite_books: childData.favoriteBooks,
            interests: childData.interests,
            stories_generated: 0
        };
        
        // Find user and add child
        let userFound = false;
        for (let user of fallbackUsers.values()) {
            if (user.id === userId) {
                if (!user.children) user.children = [];
                user.children.push(child);
                console.log('Added child to fallback storage:', child);
                userFound = true;
                break;
            }
        }
        
        // If not found by ID, try to find by matching user data
        if (!userFound) {
            console.log('User not found by ID, searching all users...');
            for (let [email, user] of fallbackUsers.entries()) {
                console.log('Checking user:', email, user.id);
                if (user.id === userId) {
                    if (!user.children) user.children = [];
                    user.children.push(child);
                    console.log('Added child to fallback storage by search:', child);
                    break;
                }
            }
        }
        
        return child;
    }
}

async function saveStory(userId, childId, storyData) {
    try {
        const { data, error } = await supabase
            .from('stories')
            .insert([{
                user_id: userId,
                child_id: childId,
                child_name: storyData.childName,
                story_content: storyData.story,
                favorite_books: storyData.favoriteBooks,
                imagination_prompt: storyData.imagination,
                age: storyData.age,
                reading_level: storyData.readingLevel,
                subscription_plan: storyData.subscriptionPlan
            }])
            .select()
            .single();
        
        if (error) throw error;
        return data;
    } catch (error) {
        console.log('Supabase not available, using fallback storage');
        // Fallback to in-memory storage
        const storyId = Date.now().toString();
        const story = {
            id: storyId,
            user_id: userId,
            child_id: childId,
            ...storyData,
            created_at: new Date()
        };
        fallbackStories.set(storyId, story);
        return story;
    }
}

async function updateUserSubscription(userId, subscriptionData) {
    const { data, error } = await supabase
        .from('users')
        .update({
            subscription_plan: subscriptionData.plan,
            subscription_status: subscriptionData.status,
            stories_this_month: subscriptionData.storiesThisMonth,
            subscription_reset_date: subscriptionData.resetDate,
            stripe_customer_id: subscriptionData.stripeCustomerId
        })
        .eq('id', userId)
        .select()
        .single();
    
    if (error) throw error;
    return data;
}

async function incrementUserStoryCount(userId) {
    try {
        const { data, error } = await supabase
            .from('users')
            .update({
                stories_this_month: supabase.raw('stories_this_month + 1')
            })
            .eq('id', userId)
            .select()
            .single();
        
        if (error) throw error;
        return data;
    } catch (error) {
        console.log('Supabase not available, using fallback storage');
        // Fallback to in-memory storage
        for (let user of fallbackUsers.values()) {
            if (user.id === userId) {
                user.stories_this_month = (user.stories_this_month || 0) + 1;
                return user;
            }
        }
        return null;
    }
}

async function incrementChildStoryCount(childId) {
    try {
        const { data, error } = await supabase
            .from('children')
            .update({
                stories_generated: supabase.raw('stories_generated + 1')
            })
            .eq('id', childId)
            .select()
            .single();
        
        if (error) throw error;
        return data;
    } catch (error) {
        console.log('Supabase not available, using fallback storage');
        // Fallback to in-memory storage
        for (let user of fallbackUsers.values()) {
            if (user.children) {
                const child = user.children.find(c => c.id === childId);
                if (child) {
                    child.stories_generated = (child.stories_generated || 0) + 1;
                    return child;
                }
            }
        }
        return null;
    }
}

// Check subscription limits
function checkSubscriptionLimits(user) {
    if (!user) return false;
    
    const planName = user.subscription_plan || 'free';
    const plan = subscriptionPlans[planName] || subscriptionPlans.free;
    
    // Reset monthly count if needed
    const now = new Date();
    const resetDate = new Date(user.subscription_reset_date || now);
    if (now > resetDate) {
        // This should be handled by a cron job in production
        // For now, we'll just check it here
        return true; // Allow story generation and reset will happen in the update
    }
    
    // Check limits
    if (plan.storiesPerMonth === -1) return true; // Unlimited
    const storiesThisMonth = user.stories_this_month || 0;
    return storiesThisMonth < plan.storiesPerMonth;
}

// Enhanced image generation function using Gemini for specific story moments
async function generateStoryImages(story, childName, customization, favoriteBooks) {
    console.log('Starting Gemini-powered story moment image generation...');
    
    if (!process.env.GEMINI_API_KEY) {
        console.log('Gemini API key not found, using placeholder images');
        return generatePlaceholderImages(childName, customization);
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        // Analyze story for key moments
        const storyMoments = await extractStoryMoments(story, childName, customization, model);
        
        // Determine art style
        const artStyles = {
            cartoon: 'cartoon style with bright colors, simple shapes, and bold outlines',
            watercolor: 'watercolor style with soft, flowing colors and gentle brushstrokes',
            digital: 'digital art style with vibrant colors, clean lines, and modern look',
            storybook: 'classic children\'s book illustration style with whimsical details'
        };
        
        const artStyle = artStyles[customization.artStyle] || artStyles.cartoon;
        
        // Generate SVG illustrations for story moments
        const images = [];
        
        for (let i = 0; i < Math.min(storyMoments.length, 3); i++) {
            try {
                console.log(`Generating image for moment: ${storyMoments[i].description}`);
                
                const prompt = `Create a detailed SVG illustration for a children's book showing: ${storyMoments[i].description}. 
                
                Style: ${artStyle}
                Character: A child named ${childName} should be the main focus
                Mood: ${storyMoments[i].mood}
                Setting: ${storyMoments[i].setting}
                Action: ${storyMoments[i].action}
                
                Requirements:
                - Size: 400x300 pixels
                - Child-friendly and colorful
                - Show ${childName} as brave and heroic
                - Include magical or adventure elements
                - Safe and appropriate for children
                - Use bright, engaging colors
                
                Return only the complete SVG code without any explanation or markdown formatting.`;
                
                const result = await model.generateContent(prompt);
                const response = await result.response;
                let svgCode = response.text();
                
                // Clean up the SVG code
                svgCode = svgCode.replace(/```svg\n?/g, '').replace(/```\n?/g, '').replace(/```/g, '').trim();
                
                // Ensure it's valid SVG
                if (svgCode.includes('<svg') && svgCode.includes('</svg>')) {
                    // Convert SVG to data URL
                    const svgDataUrl = `data:image/svg+xml;base64,${Buffer.from(svgCode).toString('base64')}`;
                    images.push(svgDataUrl);
                    console.log(`Successfully generated image ${i + 1} for: ${storyMoments[i].description}`);
                } else {
                    console.log(`Invalid SVG generated for moment ${i + 1}, using themed placeholder`);
                    const placeholder = generateThemedPlaceholder(childName, storyMoments[i], customization);
                    images.push(placeholder);
                }
            } catch (imageError) {
                console.error(`Failed to generate image ${i + 1}:`, imageError.message);
                // Add themed placeholder for failed image
                const placeholder = generateThemedPlaceholder(childName, storyMoments[i], customization);
                images.push(placeholder);
            }
        }
        
        console.log(`Story moment image generation completed. Generated ${images.length} images.`);
        return images;
    } catch (error) {
        console.error('Gemini image generation error:', error);
        return generatePlaceholderImages(childName, customization);
    }
}

// Extract key story moments for image generation
async function extractStoryMoments(story, childName, customization, model) {
    try {
        const prompt = `Analyze this children's story and identify 2-3 key visual moments that would make great illustrations. For each moment, provide a description, mood, setting, and action.

Story: "${story}"

Return a JSON array with objects containing:
- description: Brief description of the scene
- mood: The emotional tone (exciting, magical, peaceful, etc.)
- setting: Where the scene takes place
- action: What ${childName} is doing in the scene

Focus on moments where ${childName} is actively doing something interesting or exciting. Make sure all moments are child-appropriate and positive.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let jsonText = response.text();
        
        // Clean up JSON response
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        
        try {
            const moments = JSON.parse(jsonText);
            if (Array.isArray(moments) && moments.length > 0) {
                return moments.slice(0, 3); // Max 3 moments
            }
        } catch (parseError) {
            console.log('Failed to parse story moments JSON, using default moments');
        }
    } catch (error) {
        console.log('Failed to extract story moments, using default moments');
    }
    
    // Fallback to default moments based on adventure type
    return getDefaultStoryMoments(childName, customization);
}

// Generate default story moments based on adventure type
function getDefaultStoryMoments(childName, customization) {
    const adventureMoments = {
        fantasy: [
            {
                description: `${childName} meeting a friendly dragon in a magical castle`,
                mood: 'exciting and magical',
                setting: 'a colorful fantasy castle with towers and flags',
                action: 'reaching out to touch a friendly dragon'
            },
            {
                description: `${childName} casting a magic spell with a wand`,
                mood: 'powerful and magical',
                setting: 'a magical forest with glowing trees',
                action: 'holding a magic wand with sparkles around'
            }
        ],
        space: [
            {
                description: `${childName} piloting a colorful spaceship through the stars`,
                mood: 'adventurous and exciting',
                setting: 'outer space with colorful planets and stars',
                action: 'steering a spaceship with a big smile'
            },
            {
                description: `${childName} meeting friendly aliens on a new planet`,
                mood: 'curious and friendly',
                setting: 'an alien planet with strange but beautiful plants',
                action: 'waving hello to colorful friendly aliens'
            }
        ],
        underwater: [
            {
                description: `${childName} swimming with dolphins and colorful fish`,
                mood: 'joyful and peaceful',
                setting: 'underwater coral reef with bright colors',
                action: 'swimming alongside dolphins and tropical fish'
            },
            {
                description: `${childName} discovering a treasure chest on the ocean floor`,
                mood: 'exciting and adventurous',
                setting: 'deep ocean floor with coral and sea plants',
                action: 'opening a glowing treasure chest'
            }
        ],
        forest: [
            {
                description: `${childName} talking to wise forest animals`,
                mood: 'peaceful and magical',
                setting: 'enchanted forest with tall trees and flowers',
                action: 'sitting in a circle with talking animals'
            },
            {
                description: `${childName} climbing a magical tree to reach the clouds`,
                mood: 'adventurous and brave',
                setting: 'giant magical tree reaching into the sky',
                action: 'climbing up a tree trunk with determination'
            }
        ],
        dinosaur: [
            {
                description: `${childName} riding on the back of a friendly dinosaur`,
                mood: 'exciting and fun',
                setting: 'prehistoric landscape with volcanoes and plants',
                action: 'riding on a colorful dinosaur with arms raised in joy'
            },
            {
                description: `${childName} helping baby dinosaurs find their family`,
                mood: 'caring and heroic',
                setting: 'dinosaur nesting ground with eggs and plants',
                action: 'leading baby dinosaurs to their parents'
            }
        ],
        superhero: [
            {
                description: `${childName} flying through the sky with a colorful cape`,
                mood: 'powerful and heroic',
                setting: 'city skyline with tall buildings and clouds',
                action: 'flying with cape flowing and fist forward'
            },
            {
                description: `${childName} using superpowers to help people`,
                mood: 'heroic and kind',
                setting: 'city street with grateful people watching',
                action: 'using superpowers to lift something heavy or stop danger'
            }
        ]
    };
    
    const moments = adventureMoments[customization?.adventureType] || [
        {
            description: `${childName} on a magical adventure`,
            mood: 'exciting and magical',
            setting: 'a colorful magical world',
            action: 'exploring with wonder and excitement'
        }
    ];
    
    return moments;
}

// Generate themed placeholder for specific story moments
function generateThemedPlaceholder(childName, moment, customization) {
    const width = 400;
    const height = 300;
    
    const colors = {
        fantasy: '#a55eea',
        space: '#3742fa',
        underwater: '#00d2d3',
        forest: '#2ed573',
        dinosaur: '#feca57',
        superhero: '#ff6b9d'
    };
    
    const emojis = {
        fantasy: '🏰🐉✨',
        space: '🚀🌟👽',
        underwater: '🌊🐠🐙',
        forest: '🌲🦋🐿️',
        dinosaur: '🦕🌋🥚',
        superhero: '🦸‍♂️💥🏙️'
    };
    
    const color = colors[customization?.adventureType] || '#ff6b9d';
    const emoji = emojis[customization?.adventureType] || '✨🌟⭐';
    
    const svg = `
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <radialGradient id="momentGrad" cx="50%" cy="50%" r="60%">
                    <stop offset="0%" style="stop-color:${color};stop-opacity:0.8" />
                    <stop offset="100%" style="stop-color:${color};stop-opacity:0.3" />
                </radialGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#momentGrad)"/>
            <text x="200" y="80" text-anchor="middle" font-size="24">${emoji}</text>
            <text x="200" y="140" text-anchor="middle" fill="white" font-family="Arial" font-size="16" font-weight="bold">${childName}'s Adventure</text>
            <text x="200" y="170" text-anchor="middle" fill="white" font-family="Arial" font-size="12">${moment?.description || 'Magical Moment'}</text>
            <text x="200" y="220" text-anchor="middle" fill="white" font-family="Arial" font-size="10" opacity="0.8">🎨 Illustration Loading...</text>
            <circle cx="100" cy="50" r="2" fill="white" opacity="0.6"/>
            <circle cx="300" cy="70" r="3" fill="white" opacity="0.7"/>
            <circle cx="80" cy="250" r="2" fill="white" opacity="0.5"/>
            <circle cx="320" cy="230" r="2" fill="white" opacity="0.6"/>
        </svg>
    `;
    
    return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

// Generate enhanced placeholder images for demo/fallback
function generatePlaceholderImages(childName, customization) {
    const placeholderImages = [];
    
    // Create simple SVG placeholders with story themes
    const width = 400;
    const height = 300;
    
    // Cover image SVG
    const coverSvg = `
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="coverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#ff6b9d;stop-opacity:1" />
                    <stop offset="50%" style="stop-color:#feca57;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#2ed573;stop-opacity:1" />
                </linearGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#coverGrad)"/>
            <circle cx="200" cy="100" r="40" fill="white" opacity="0.8"/>
            <text x="200" y="110" text-anchor="middle" fill="#333" font-family="Arial" font-size="16" font-weight="bold">${childName}</text>
            <text x="200" y="200" text-anchor="middle" fill="white" font-family="Arial" font-size="20" font-weight="bold">📚 Story Adventure</text>
            <circle cx="100" cy="50" r="3" fill="white" opacity="0.6"/>
            <circle cx="300" cy="80" r="4" fill="white" opacity="0.7"/>
            <circle cx="150" cy="250" r="2" fill="white" opacity="0.5"/>
            <circle cx="320" cy="220" r="3" fill="white" opacity="0.6"/>
        </svg>
    `;
    
    placeholderImages.push(`data:image/svg+xml;base64,${Buffer.from(coverSvg).toString('base64')}`);
    
    // Adventure-specific placeholder
    const adventureThemes = {
        fantasy: { emoji: '🏰', color: '#a55eea', title: 'Fantasy Kingdom' },
        space: { emoji: '🚀', color: '#3742fa', title: 'Space Adventure' },
        underwater: { emoji: '🌊', color: '#00d2d3', title: 'Ocean World' },
        forest: { emoji: '🌲', color: '#2ed573', title: 'Magic Forest' },
        dinosaur: { emoji: '🦕', color: '#feca57', title: 'Dino Land' },
        superhero: { emoji: '🦸', color: '#ff6b9d', title: 'Hero Mission' }
    };
    
    const theme = adventureThemes[customization?.adventureType] || { emoji: '✨', color: '#ff6b9d', title: 'Magic Adventure' };
    
    const adventureSvg = `
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <radialGradient id="adventureGrad" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" style="stop-color:${theme.color};stop-opacity:0.8" />
                    <stop offset="100%" style="stop-color:${theme.color};stop-opacity:0.3" />
                </radialGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#adventureGrad)"/>
            <text x="200" y="150" text-anchor="middle" font-size="60">${theme.emoji}</text>
            <text x="200" y="200" text-anchor="middle" fill="white" font-family="Arial" font-size="18" font-weight="bold">${theme.title}</text>
            <text x="200" y="230" text-anchor="middle" fill="white" font-family="Arial" font-size="14">Featuring ${childName}</text>
            <circle cx="80" cy="80" r="2" fill="white" opacity="0.8"/>
            <circle cx="320" cy="60" r="3" fill="white" opacity="0.6"/>
            <circle cx="60" cy="220" r="2" fill="white" opacity="0.7"/>
            <circle cx="340" cy="240" r="2" fill="white" opacity="0.5"/>
        </svg>
    `;
    
    placeholderImages.push(`data:image/svg+xml;base64,${Buffer.from(adventureSvg).toString('base64')}`);
    
    return placeholderImages;
}

console.log('Supabase database functions initialized');

// Story templates and elements
const storyElements = {
    characters: {
        'Harry Potter': ['wizards', 'magic spells', 'flying broomsticks', 'magical creatures'],
        'The Cat in the Hat': ['talking animals', 'silly adventures', 'colorful chaos', 'fun games'],
        'Where the Wild Things Are': ['monsters', 'wild adventures', 'imagination journeys', 'brave exploration'],
        'Charlotte\'s Web': ['farm animals', 'friendship', 'talking spiders', 'barnyard adventures'],
        'The Very Hungry Caterpillar': ['transformation', 'colorful foods', 'growing up', 'nature adventures']
    },
    settings: [
        'a magical forest', 'a colorful playground', 'a mysterious castle', 'a friendly neighborhood',
        'an underwater kingdom', 'a cloud city', 'a candy land', 'a dinosaur park', 'outer space',
        'a pirate ship', 'a fairy garden', 'a robot city'
    ],
    adventures: [
        'discovers a hidden treasure', 'makes friends with a talking animal', 'solves a mystery',
        'goes on a magical quest', 'learns a new superpower', 'helps save the day',
        'finds a secret door', 'meets a friendly dragon', 'explores a new world'
    ]
};

// User registration endpoint
app.post('/api/register', async (req, res) => {
    try {
        console.log('Registration request received:', req.body);
        const { parentName, email, password } = req.body;

        if (!parentName || !email || !password) {
            console.log('Missing fields in registration');
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Check if user already exists
        const existingUser = await getUserByEmail(email);
        if (existingUser) {
            console.log('Email already exists:', email);
            return res.status(400).json({ error: 'Email already registered' });
        }

        // Create new user
        const newUser = await createUser(parentName, email, password);
        console.log('User registered successfully:', email);

        res.json({ 
            success: true, 
            userId: newUser.id, 
            parentName: newUser.parent_name 
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// User login endpoint
app.post('/api/login', async (req, res) => {
    try {
        console.log('Login request received:', req.body);
        const { email, password } = req.body;

        if (!email || !password) {
            console.log('Missing email or password');
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const user = await getUserByEmail(email);
        console.log('User found:', user ? 'Yes' : 'No');

        if (!user) {
            console.log('User not found:', email);
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const isValidPassword = await verifyPassword(password, user.password_hash);
        if (!isValidPassword) {
            console.log('Invalid password for:', email);
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        console.log('Login successful for:', email);
        res.json({ 
            success: true, 
            userId: user.id, 
            parentName: user.parent_name 
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Add child profile endpoint
app.post('/api/add-child', async (req, res) => {
    try {
        console.log('Add child request:', req.body);
        const { parentEmail, childName, age, favoriteBooks, interests, readingLevel } = req.body;

        if (!childName || !age) {
            return res.status(400).json({ error: 'Child name and age are required' });
        }

        const user = await getUserByEmail(parentEmail);
        if (!user) {
            return res.status(404).json({ error: 'Parent not found' });
        }

        const childData = {
            name: childName,
            age: parseInt(age),
            favoriteBooks: favoriteBooks || [],
            interests: interests || '',
            readingLevel: readingLevel || 'intermediate'
        };

        console.log('Processed child data:', childData);

        console.log('Creating child with data:', childData);
        const child = await addChild(user.id, childData);
        res.json({ success: true, child });
    } catch (error) {
        console.error('Add child error:', error);
        res.status(500).json({ error: 'Failed to add child' });
    }
});

// Get user data endpoint
app.get('/api/user/:email', async (req, res) => {
    try {
        const user = await getUserByEmail(req.params.email);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Transform data to match frontend expectations
        const userData = {
            id: user.id,
            parentName: user.parent_name,
            email: user.email,
            subscription: {
                plan: user.subscription_plan,
                status: user.subscription_status,
                storiesThisMonth: user.stories_this_month,
                resetDate: user.subscription_reset_date
            },
            children: user.children || [],
            createdAt: user.created_at
        };

        res.json(userData);
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Failed to get user data' });
    }
});

// Story generation endpoint
app.post('/api/generate-story', async (req, res) => {
    try {
        const { childName, favoriteBooks, imagination, age, readingLevel, parentEmail, customization } = req.body;

        if (!childName) {
            return res.status(400).json({ error: 'Child name is required' });
        }

        // Provide fallback for favorite books if none selected
        const validFavoriteBooks = favoriteBooks && favoriteBooks.length > 0
            ? favoriteBooks
            : ['General Adventure Stories'];

        // Get user for saving story
        let user = null;
        if (parentEmail) {
            user = await getUserByEmail(parentEmail);
        }

        const story = await generatePersonalizedStoryWithAI(childName, validFavoriteBooks, imagination, age, readingLevel, customization);
        
        // No images needed since we removed them
        let images = [];

        // Save story to database
        if (parentEmail && user) {
            // Find the child
            const child = user.children.find(c => c.name === childName);
            const childId = child ? child.id : null;

            // Save story
            await saveStory(user.id, childId, {
                childName,
                story,
                favoriteBooks: validFavoriteBooks,
                imagination,
                age: parseInt(age),
                readingLevel
            });

            // Update story counts
            await incrementUserStoryCount(user.id);
            if (childId) {
                await incrementChildStoryCount(childId);
            }
        }

        res.json({ 
            story,
            images: images,
            customization: customization 
        });
    } catch (error) {
        console.error('Error generating story:', error);
        res.status(500).json({ error: 'Failed to generate story. Please try again!' });
    }
});

async function generatePersonalizedStoryWithAI(childName, favoriteBooks, imagination, age, readingLevel, customization = {}) {
    const ageNum = parseInt(age) || 8;
    const isYounger = ageNum < 8;

    // Adjust complexity based on reading level
    let complexityLevel = 'intermediate';
    if (readingLevel === 'beginner' || isYounger) {
        complexityLevel = 'simple';
    } else if (readingLevel === 'advanced') {
        complexityLevel = 'advanced';
    }

    // Set long story word count for everyone
    let wordCount = '1500-2500 words';
    let specialFeatures = 'Include detailed character development, rich descriptions, and add a meaningful life lesson. Make it extra magical and engaging.';
    
    // Adjust for story length customization
    if (customization.length === 'short') {
        wordCount = '1000-1500 words';
    } else if (customization.length === 'long') {
        wordCount = '2000-3000 words';
    }
    
    // Add mood and adventure type to special features
    const moodDescriptions = {
        adventurous: 'Make it exciting and full of adventure with thrilling moments.',
        calm: 'Keep it peaceful and soothing with gentle, calming scenes.',
        funny: 'Make it humorous and silly with lots of laughs and funny situations.',
        educational: 'Include educational elements and learning opportunities naturally woven into the story.',
        magical: 'Emphasize magical and mysterious elements with wonder and enchantment.'
    };
    
    const adventureDescriptions = {
        fantasy: 'Set in a magical fantasy kingdom with castles, wizards, and mythical creatures.',
        space: 'Take place in outer space with planets, spaceships, and alien friends.',
        underwater: 'Happen in an underwater world with sea creatures and ocean adventures.',
        forest: 'Occur in a magical forest with talking animals and nature spirits.',
        dinosaur: 'Feature dinosaurs and prehistoric adventures in ancient times.',
        superhero: 'Include superhero elements with special powers and heroic missions.',
        pirate: 'Feature pirate adventures on the high seas with treasure hunts and ship battles.',
        ninja: 'Include ninja training, stealth missions, and martial arts adventures.',
        wizard: 'Take place in a magical wizard school with spells, potions, and magical creatures.',
        princess: 'Set in a royal castle with princess adventures, balls, and kingdom quests.',
        robot: 'Feature a futuristic world with helpful robots, technology, and sci-fi adventures.',
        alien: 'Take place on alien planets with friendly extraterrestrial beings and space exploration.',
        jungle: 'Occur in dense jungles with wild animals, ancient ruins, and nature adventures.',
        arctic: 'Set in the frozen Arctic with polar bears, penguins, and icy adventures.',
        desert: 'Take place in vast deserts with camels, oases, and ancient mysteries.',
        mountain: 'Feature mountain climbing, cave exploration, and high-altitude adventures.',
        circus: 'Include circus performances, acrobats, clowns, and carnival magic.',
        farm: 'Set on a working farm with friendly animals, crops, and rural adventures.',
        city: 'Take place in a bustling city with skyscrapers, urban exploration, and city life.',
        beach: 'Feature beach adventures with sand castles, surfing, and ocean fun.',
        carnival: 'Include carnival rides, games, cotton candy, and festive celebrations.',
        museum: 'Set in museums with ancient artifacts, historical mysteries, and educational adventures.',
        library: 'Take place in magical libraries with enchanted books and literary adventures.',
        bakery: 'Feature baking adventures with delicious treats, recipes, and culinary magic.',
        garden: 'Set in beautiful gardens with flowers, butterflies, and nature discoveries.',
        treehouse: 'Include treehouse adventures with forest friends and elevated hideouts.',
        playground: 'Feature playground fun with swings, slides, and childhood games.',
        school: 'Take place at school with classroom adventures, friends, and learning experiences.',
        hospital: 'Include medical adventures helping doctors, nurses, and patients.',
        fire: 'Feature firefighter adventures with rescue missions and emergency responses.',
        police: 'Include police work with crime solving, community help, and detective work.',
        vet: 'Set in veterinary clinics helping sick animals and pet care adventures.',
        chef: 'Feature cooking adventures in restaurant kitchens with delicious recipes.',
        artist: 'Include art creation, painting, sculpting, and creative expression adventures.',
        musician: 'Feature musical adventures with instruments, concerts, and song creation.',
        dancer: 'Include dance performances, choreography, and rhythmic adventures.',
        inventor: 'Set in invention labs with scientific experiments and creative innovations.',
        detective: 'Feature mystery solving, clue finding, and investigative adventures.',
        time: 'Include time travel adventures to different historical periods and future worlds.',
        fairy: 'Set in fairy realms with magical beings, pixie dust, and enchanted adventures.',
        dragon: 'Feature friendly dragons, dragon riding, and mythical creature adventures.',
        unicorn: 'Include unicorn magic, rainbow adventures, and mythical forest quests.',
        mermaid: 'Set in underwater mermaid kingdoms with ocean magic and sea adventures.',
        ghost: 'Feature friendly ghosts, haunted houses, and supernatural mystery adventures.',
        monster: 'Include silly monsters, monster friends, and fun creature adventures.',
        toy: 'Set in toy worlds where toys come to life for magical play adventures.',
        candy: 'Take place in candy lands with sweet treats and sugary adventures.',
        ice: 'Feature ice palaces, snow adventures, and frozen magical kingdoms.',
        volcano: 'Include volcano exploration, lava adventures, and geological discoveries.',
        cloud: 'Set in cloud kingdoms floating in the sky with aerial adventures.',
        rainbow: 'Feature rainbow bridges, color magic, and prismatic adventures.'
    };
    
    if (customization.mood) {
        specialFeatures += ` ${moodDescriptions[customization.mood] || ''}`;
    }
    
    if (customization.adventureType) {
        specialFeatures += ` ${adventureDescriptions[customization.adventureType] || ''}`;
    }

    // Create a detailed prompt for ChatGPT
    const prompt = `Create a magical, personalized children's story with the following details:

MAIN CHARACTER: ${childName} (age ${age || 'around 8'})

FAVORITE BOOKS/THEMES: ${favoriteBooks.join(', ')}
- ${favoriteBooks.includes('General Adventure Stories') || favoriteBooks.includes('General Adventure')
            ? 'Create a general adventure story with magical elements, friendship, and courage themes'
            : 'Incorporate themes, characters, or magical elements from these books - Make references that feel natural and exciting'}

CHILD'S INTERESTS: ${imagination || 'magical adventures and friendship'}
- Weave these elements throughout the story
- Make them central to the plot

READING LEVEL: ${readingLevel || 'intermediate'}
STORY REQUIREMENTS:
- ${complexityLevel === 'simple' ? 'Very simple vocabulary, short sentences, basic concepts' :
            complexityLevel === 'advanced' ? 'Rich vocabulary, complex sentences, deeper themes' :
                'Age-appropriate vocabulary with engaging descriptions'}
- ${wordCount} - MAKE IT A LONG, DETAILED STORY with multiple chapters or scenes
- ${specialFeatures}
- ${childName} should be the brave hero of the story
- Include positive themes: courage, friendship, kindness, imagination
- Make it magical and exciting but age-appropriate
- Create multiple scenes and adventures within the story
- Develop the plot with detailed descriptions and dialogue
- Include character development and emotional moments
- End with a positive, inspiring message
- Use emojis sparingly (1-2 at the end)
- IMPORTANT: Write a comprehensive, lengthy story that fills multiple pages

TONE: Warm, magical, inspiring, and fun - like the best children's books

Create a complete story that will make ${childName} feel like the hero of their own magical adventure!`;

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: "You are a master children's story writer who creates magical, personalized stories that inspire and delight young readers. Your stories are always positive, age-appropriate, and make the child feel special and brave."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            max_tokens: isYounger ? 1200 : 2000,
            temperature: 0.8,
        });

        return completion.choices[0].message.content.trim();
    } catch (error) {
        console.error('OpenAI API Error:', error);
        // Fallback to original story generation if API fails
        return generateFallbackStory(childName, favoriteBooks, imagination, age);
    }
}

function generateFallbackStory(childName, favoriteBooks, imagination, age) {
    // Fallback story generation (simplified version of original)
    const selectedBook = favoriteBooks[0];
    const imaginationElement = imagination ? ` involving ${imagination}` : '';

    // Handle general adventure case
    const storyStart = selectedBook.includes('General Adventure')
        ? `Once upon a time, there was a brave child named ${childName} who loved magical adventures.`
        : `Once upon a time, there was a brave child named ${childName} who loved reading ${selectedBook}.`;

    const adventureText = selectedBook.includes('General Adventure')
        ? `One magical day, ${childName} discovered a secret door that led to an enchanted world!`
        : `One magical day, ${childName} discovered they could step right into their favorite story!`;

    return `${storyStart}

${adventureText} ${imaginationElement ? `Their adventure included ${imagination}, making it even more special.` : ''}

${childName} went on an incredible journey, made new friends, and learned that with courage and kindness, any adventure is possible.

When ${childName} returned home, they knew that the best stories are the ones where you believe in yourself.

The End! 🌟`;
}

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve the story reader page
app.get('/story-reader.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'story-reader.html'));
});

// Handle favicon.ico requests
app.get('/favicon.ico', (req, res) => {
    res.status(204).end();
});

// Get subscription plans
app.get('/api/subscription-plans', (req, res) => {
    res.json(subscriptionPlans);
});

// Simulate subscription upgrade (no real payment)
app.post('/api/upgrade-subscription', async (req, res) => {
    try {
        const { planId, userEmail } = req.body;

        const plan = Object.values(subscriptionPlans).find(p => p.id === planId);
        if (!plan || plan.id === 'free') {
            return res.status(400).json({ error: 'Invalid plan' });
        }

        const user = users.get(userEmail);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Simulate successful upgrade
        user.subscription = {
            plan: plan.name.toLowerCase(),
            status: 'active',
            storiesThisMonth: 0,
            resetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        };

        console.log(`User ${userEmail} upgraded to ${plan.name} plan (simulated)`);
        res.json({ success: true, plan: plan.name });
    } catch (error) {
        console.error('Subscription upgrade error:', error);
        res.status(500).json({ error: 'Failed to upgrade subscription' });
    }
});

// Simulate downgrade to free plan
app.post('/api/downgrade-subscription', async (req, res) => {
    try {
        const { userEmail } = req.body;

        const user = users.get(userEmail);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Downgrade to free plan
        user.subscription = {
            plan: 'free',
            status: 'active',
            storiesThisMonth: 0,
            resetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        };

        console.log(`User ${userEmail} downgraded to free plan (simulated)`);
        res.json({ success: true, plan: 'free' });
    } catch (error) {
        console.error('Subscription downgrade error:', error);
        res.status(500).json({ error: 'Failed to downgrade subscription' });
    }
});

// Check subscription limits
function checkSubscriptionLimits(user) {
    if (!user) return false;
    
    const planName = user.subscription_plan || 'free';
    const plan = subscriptionPlans[planName] || subscriptionPlans.free;
    
    // Reset monthly count if needed
    const now = new Date();
    const resetDate = new Date(user.subscription_reset_date || now);
    if (now > resetDate) {
        // This should be handled by a cron job in production
        // For now, we'll just allow the story and reset will happen in the update
        return true;
    }
    
    // Check limits
    if (plan.storiesPerMonth === -1) return true; // Unlimited
    const storiesThisMonth = user.stories_this_month || 0;
    return storiesThisMonth < plan.storiesPerMonth;
}

// Get stories for a user (optional endpoint for future features)
app.get('/api/stories/:email', (req, res) => {
    try {
        const userStories = Array.from(stories.values())
            .filter(story => story.parentEmail === req.params.email)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.json(userStories);
    } catch (error) {
        console.error('Get stories error:', error);
        res.status(500).json({ error: 'Failed to get stories' });
    }
});

app.listen(PORT, () => {
    if (isProduction) {
        console.log(`🌟 NextChapterKids is running in production on port ${PORT}`);
    } else {
        console.log(`🌟 StoryMagic server running on port ${PORT}`);
        console.log(`📖 Visit http://localhost:${PORT} to start creating magical stories!`);
    }
});