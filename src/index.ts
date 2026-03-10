import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import experienceRoutes from './routes/experienceRoutes';
import academicRoutes from './routes/academicRoutes';
import documentRoutes from './routes/documentRoutes';
import schoolPostChoiceRoutes from './routes/schoolPostChoiceRoutes';
import statesRoutes from './routes/statesRoutes';
import schoolRoutes from './routes/schoolRoutes';
import designationPostRoutes from './routes/designationPostRoutes';
import professionalQualificationRoutes from './routes/professionalQualificationRoutes';
import applicationTrackerRoutes from './routes/applicationTrackerRoutes';
import submitApplicationRoutes from './routes/submitApplicationRoutes';
import invitationRoutes from './routes/invitationRoutes';

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors({
  origin: [
    'http://localhost:9000',
    'https://samvida-sathi.kvs.gov.in',
    'http://164.100.229.94'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
}));
app.use(express.json());

// Serve static files from contractual_upload directory
app.use('/contractual_upload', express.static('contractual_upload'));

// Auth routes
app.use('/api/auth', authRoutes);

// User routes
app.use('/api/user', userRoutes);

// Experience routes
app.use('/api/experience', experienceRoutes);

// Academic routes
app.use('/api/academic', academicRoutes);

// Document upload routes
app.use('/api', documentRoutes);

// School and post choice routes
app.use('/api/school-post-choice', schoolPostChoiceRoutes);

// States routes
app.use('/api/states', statesRoutes);

// School routes
app.use('/api/schools', schoolRoutes);

// Designation and subject routes
app.use('/api', designationPostRoutes);

// Professional qualification routes
app.use('/api/professional-qualification', professionalQualificationRoutes);

// Application tracker routes
app.use('/api/application-tracker', applicationTrackerRoutes);

// Submit application routes
app.use('/api/submit-application', submitApplicationRoutes);

// Invitation eligibility routes
app.use('/api/invitation', invitationRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
