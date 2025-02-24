const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const blogSchema = new Schema({
    userId: { 
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    heading: { 
        type: String, 
        required: true 
    },
    text: { 
        type: String, 
        required: true 
    },
    dateTime: { 
        type: Date,
        default: null
    },
    isScheduled: {
        type: Boolean,
        default: false
    },
    scheduledFor: {
        type: Date,
        default: null
    },
    status: {
        type: String,
        enum: ['draft', 'published', 'scheduled'],
        default: 'published'
    },
    metrics: {
        views: { type: Number, default: 0 },
        shares: { type: Number, default: 0 },
        searchRank: { type: Number, default: 0 },
        lastUpdated: { type: Date, default: Date.now }
    }
});

// Update pre-save middleware
blogSchema.pre('save', async function(next) {
    if (this.isScheduled && this.scheduledFor) {
        const scheduledTime = new Date(this.scheduledFor);
        const now = new Date();
        
        if (scheduledTime > now) {
            // Keep as scheduled
            this.status = 'scheduled';
            this.dateTime = scheduledTime; // Set dateTime to match scheduledFor
            this.scheduledFor = scheduledTime;
        } else {
            // Publish immediately if scheduled time has passed
            this.isScheduled = false;
            this.status = 'published';
            this.dateTime = now;
            this.scheduledFor = null;
        }
    } else if (!this.isScheduled) {
        // Regular publish
        this.status = 'published';
        this.scheduledFor = null;
        this.dateTime = new Date();
    }
    next();
});

// Add method to update metrics
blogSchema.methods.updateMetrics = async function(type) {
    if (type === 'view') this.metrics.views += 1;
    if (type === 'share') this.metrics.shares += 1;
    this.metrics.lastUpdated = new Date();
    await this.save();
    
    // Update rankings after metrics change
    await this.constructor.updateRankings();
    return this;
};

// Add this before the model export
blogSchema.statics.updateRankings = async function() {
    const blogs = await this.find({}).sort({ 'metrics.views': -1 });
    const updates = blogs.map((blog, index) => ({
        updateOne: {
            filter: { _id: blog._id },
            update: { 'metrics.searchRank': index + 1 }
        }
    }));
    
    if (updates.length > 0) {
        await this.bulkWrite(updates);
    }
};

const Blog = mongoose.models.Blog || mongoose.model('Blog', blogSchema);
module.exports = Blog;
