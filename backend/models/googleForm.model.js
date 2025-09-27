import mongoose from "mongoose";

const formSubmissionSchema = new mongoose.Schema({
  formId: {
    type: String,
    required: true
  },
  submissionId: {
    type: String,
    required: true,
    unique: true
  },
  submissionData: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  submitterInfo: {
    name: String,
    email: String,
    phone: String
  },
  submissionDate: {
    type: Date,
    default: Date.now
  },
  ipAddress: String,
  userAgent: String,
  source: {
    type: String,
    default: 'web'
  }
}, { timestamps: true });

const googleFormSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  formId: {
    type: String,
    required: true,
    unique: true
  },
  formTitle: {
    type: String,
    required: true
  },
  formDescription: {
    type: String
  },
  formUrl: {
    type: String,
    required: true
  },
  editFormUrl: {
    type: String,
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  organizerEmail: {
    type: String
  },
  formStatus: {
    type: String,
    enum: ['active', 'inactive', 'archived'],
    default: 'active'
  },
  formType: {
    type: String,
    enum: ['registration', 'feedback', 'survey', 'custom'],
    default: 'registration'
  },
  formSettings: {
    allowMultipleSubmissions: {
      type: Boolean,
      default: false
    },
    requireSignIn: {
      type: Boolean,
      default: false
    },
    collectEmailAddresses: {
      type: Boolean,
      default: true
    },
    sendConfirmationEmail: {
      type: Boolean,
      default: true
    },
    limitOneResponsePerUser: {
      type: Boolean,
      default: true
    }
  },
  formFields: [{
    fieldName: {
      type: String,
      required: true
    },
    fieldType: {
      type: String,
      enum: ['text', 'email', 'phone', 'number', 'date', 'time', 'textarea', 'select', 'checkbox', 'radio'],
      required: true
    },
    required: {
      type: Boolean,
      default: false
    },
    options: [String], // For select, checkbox, radio fields
    validation: {
      minLength: Number,
      maxLength: Number,
      pattern: String
    }
  }],
  submissionCount: {
    type: Number,
    default: 0
  },
  analytics: {
    totalViews: {
      type: Number,
      default: 0
    },
    totalSubmissions: {
      type: Number,
      default: 0
    },
    conversionRate: {
      type: Number,
      default: 0
    },
    lastSubmission: Date,
    peakSubmissionDate: Date
  },
  integrations: {
    googleSheets: {
      sheetId: String,
      sheetUrl: String,
      linkedAt: Date
    },
    emailNotifications: {
      enabled: {
        type: Boolean,
        default: true
      },
      recipients: [String],
      template: String
    }
  }
}, { timestamps: true });

// Indexes for better query performance
googleFormSchema.index({ eventId: 1 });
googleFormSchema.index({ formId: 1 });
googleFormSchema.index({ createdBy: 1 });
googleFormSchema.index({ formStatus: 1 });
googleFormSchema.index({ 'analytics.lastSubmission': -1 });

formSubmissionSchema.index({ formId: 1 });
formSubmissionSchema.index({ submissionDate: -1 });
formSubmissionSchema.index({ 'submitterInfo.email': 1 });

// Virtual for calculating conversion rate
googleFormSchema.virtual('calculatedConversionRate').get(function() {
  return this.analytics.totalViews > 0 
    ? (this.analytics.totalSubmissions / this.analytics.totalViews * 100).toFixed(2)
    : 0;
});

// Middleware to update submission count
googleFormSchema.pre('save', function(next) {
  if (this.analytics.totalSubmissions !== undefined && this.analytics.totalViews > 0) {
    this.analytics.conversionRate = (this.analytics.totalSubmissions / this.analytics.totalViews * 100);
  }
  next();
});

const GoogleForm = mongoose.model("GoogleForm", googleFormSchema);
const FormSubmission = mongoose.model("FormSubmission", formSubmissionSchema);

export { GoogleForm, FormSubmission };
export default GoogleForm;