const mongoose = require('mongoose');
const User = require('./models/User');

async function makeAdmin() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/orders');
        
        // Get username from command line arguments
        const username = process.argv[2];
        if (!username) {
            console.log('Usage: node make-admin.js <username>');
            process.exit(1);
        }
        
        // Find user and update role
        const user = await User.findOneAndUpdate(
            { username: username },
            { role: 'admin' },
            { new: true }
        );
        
        if (user) {
            console.log(`✅ User ${username} has been promoted to admin`);
            console.log(`User details: ${user.firstName} ${user.lastName} (${user.email})`);
        } else {
            console.log(`❌ User ${username} not found`);
        }
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

makeAdmin();