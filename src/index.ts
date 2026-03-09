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

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors({
  origin: 'http://localhost:9000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
}));
app.use(express.json());

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

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
