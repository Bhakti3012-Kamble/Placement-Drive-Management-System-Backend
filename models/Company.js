const mongoose = require('mongoose');

const CompanySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a company name'],
        trim: true,
        unique: true
    },
    email: {
        type: String,
        required: [true, 'Please add a company email'],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    website: {
        type: String,
        trim: true,
        match: [
            /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
            'Please add a valid URL'
        ]
    },
    description: {
        type: String,
        required: [true, 'Please add a company description'],
        maxlength: [2000, 'Description cannot be more than 2000 characters']
    },
    industry: {
        type: String,
        required: [true, 'Please add an industry'],
        enum: [
            'IT/Software',
            'Finance',
            'Healthcare',
            'Manufacturing',
            'Retail',
            'Education',
            'Consulting',
            'Telecommunications',
            'Automotive',
            'E-commerce',
            'Other'
        ]
    },
    location: {
        address: {
            type: String,
            required: [true, 'Please add an address']
        },
        city: {
            type: String,
            required: [true, 'Please add a city']
        },
        state: {
            type: String,
            required: [true, 'Please add a state']
        },
        country: {
            type: String,
            required: [true, 'Please add a country'],
            default: 'India'
        },
        pincode: {
            type: String,
            match: [/^\d{6}$/, 'Please add a valid 6-digit pincode']
        }
    },
    contactPerson: {
        name: {
            type: String,
            required: [true, 'Please add contact person name']
        },
        designation: {
            type: String,
            required: [true, 'Please add contact person designation']
        },
        phone: {
            type: String,
            required: [true, 'Please add contact person phone'],
            match: [/^\d{10}$/, 'Please add a valid 10-digit phone number']
        },
        email: {
            type: String,
            required: [true, 'Please add contact person email'],
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                'Please add a valid email'
            ]
        }
    },
    companySize: {
        type: String,
        enum: ['1-50', '51-200', '201-500', '501-1000', '1000+'],
        required: [true, 'Please add company size']
    },
    foundedYear: {
        type: Number,
        min: [1800, 'Year must be after 1800'],
        max: [new Date().getFullYear(), 'Year cannot be in the future']
    },
    logo: {
        type: String,
        default: 'default-company-logo.png'
    },
    linkedUser: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verifiedAt: {
        type: Date
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'suspended'],
        default: 'active'
    },
    socialLinks: {
        linkedin: {
            type: String,
            trim: true
        },
        twitter: {
            type: String,
            trim: true
        },
        facebook: {
            type: String,
            trim: true
        }
    },
    benefits: {
        type: [String],
        default: []
    },
    tags: {
        type: [String],
        default: []
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt field before saving
CompanySchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

// Create index for faster searches
CompanySchema.index({ name: 1, industry: 1 });
CompanySchema.index({ 'location.city': 1 });

module.exports = mongoose.model('Company', CompanySchema);
