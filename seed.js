// seed.js
// =============================================================================
//  Seed the database with realistic test data.
//  Run with: npm run seed
//
//  Required minimum:
//    - 2 users
//    - 4 projects (split across the users)
//    - 5 tasks (with embedded subtasks and tags arrays)
//    - 5 notes (some attached to projects, some standalone)
//
//  Use the bcrypt module to hash passwords before inserting users.
//  Use ObjectId references for relationships (projectId, ownerId).
// =============================================================================

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { ObjectId } = require('mongodb');
const { connect } = require('./db/connection');

(async () => {
  const db = await connect();

  // Clear existing data so re-seeding is clean
  console.log('Clearing existing collections...');
  await db.collection('users').deleteMany({});
  await db.collection('projects').deleteMany({});
  await db.collection('tasks').deleteMany({});
  await db.collection('notes').deleteMany({});

  console.log('Seeding database...');

  // =============================================================================
  //  INSERT 2 USERS (Custom emails)
  // =============================================================================
  
  // Hash passwords
  const passwordHash1 = await bcrypt.hash('password123', 10);
  const passwordHash2 = await bcrypt.hash('password456', 10);
  
  const users = await db.collection('users').insertMany([
    {
      email: 'zohha@mail.com',
      passwordHash: passwordHash1,
      name: 'Zohha',
      createdAt: new Date(),
      preferences: { theme: 'dark', notifications: true }  // Schema flexibility
    },
    {
      email: 'maira@mail.com',
      passwordHash: passwordHash2,
      name: 'Maira',
      createdAt: new Date(),
      preferences: { theme: 'light', notifications: false }  // Schema flexibility
    }
  ]);
  
  console.log(`✓ Inserted ${users.insertedCount} users`);
  
  const zohhaId = users.insertedIds[0];
  const mairaId = users.insertedIds[1];

  // =============================================================================
  //  INSERT 4 PROJECTS (3 for Zohha, 1 for Maira)
  // =============================================================================
  
  const projects = await db.collection('projects').insertMany([
    {
      ownerId: zohhaId,
      name: 'E-commerce Website',
      description: 'Build a full-stack e-commerce platform',
      archived: false,
      createdAt: new Date(),
      color: 'blue'  // Schema flexibility - optional field
    },
    {
      ownerId: zohhaId,
      name: 'Mobile Fitness App',
      description: 'React Native workout tracker',
      archived: false,
      createdAt: new Date(),
      color: 'green'
    },
    {
      ownerId: zohhaId,
      name: 'Data Analysis Pipeline',
      description: 'Sales data analytics',
      archived: true,  // Archived project
      createdAt: new Date(),
      color: 'red'
    },
    {
      ownerId: mairaId,
      name: 'API Development',
      description: 'REST API for client project',
      archived: false,
      createdAt: new Date(),
      color: 'purple'
    }
  ]);
  
  console.log(`✓ Inserted ${projects.insertedCount} projects`);
  
  const ecommerceId = projects.insertedIds[0];
  const fitnessId = projects.insertedIds[1];
  const dataAnalysisId = projects.insertedIds[2];
  const apiId = projects.insertedIds[3];

  // =============================================================================
  //  INSERT 5 TASKS (with embedded subtasks and tags)
  // =============================================================================
  
  const tasks = await db.collection('tasks').insertMany([
    {
      ownerId: zohhaId,
      projectId: ecommerceId,
      title: 'Design database schema',
      status: 'done',
      priority: 1,
      tags: ['design', 'database', 'mongodb'],
      subtasks: [
        { title: 'Create ER diagram', done: true },
        { title: 'Set up MongoDB', done: true },
        { title: 'Create indexes', done: false }
      ],
      dueDate: new Date('2024-01-15'),  // Schema flexibility - optional field
      createdAt: new Date()
    },
    {
      ownerId: zohhaId,
      projectId: ecommerceId,
      title: 'Implement authentication',
      status: 'in-progress',
      priority: 2,
      tags: ['backend', 'security', 'jwt'],
      subtasks: [
        { title: 'JWT setup', done: true },
        { title: 'OAuth integration', done: false },
        { title: 'Password reset', done: false }
      ],
      dueDate: new Date('2024-02-01'),
      createdAt: new Date()
    },
    {
      ownerId: zohhaId,
      projectId: ecommerceId,
      title: 'Build frontend components',
      status: 'todo',
      priority: 3,
      tags: ['frontend', 'react', 'css'],
      subtasks: [
        { title: 'Header component', done: false },
        { title: 'Product listing', done: false },
        { title: 'Shopping cart', done: false }
      ],
      createdAt: new Date()  // No dueDate - schema flexibility
    },
    {
      ownerId: zohhaId,
      projectId: fitnessId,
      title: 'Setup React Native environment',
      status: 'done',
      priority: 1,
      tags: ['mobile', 'setup', 'react-native'],
      subtasks: [
        { title: 'Install dependencies', done: true },
        { title: 'Configure Metro', done: true },
        { title: 'Setup emulator', done: false }
      ],
      dueDate: new Date('2024-01-10'),
      createdAt: new Date()
    },
    {
      ownerId: mairaId,
      projectId: apiId,
      title: 'Create API endpoints',
      status: 'in-progress',
      priority: 1,
      tags: ['api', 'nodejs', 'express'],
      subtasks: [
        { title: 'GET endpoints', done: true },
        { title: 'POST endpoints', done: false },
        { title: 'DELETE endpoints', done: false },
        { title: 'Add rate limiting', done: false }
      ],
      dueDate: new Date('2024-01-25'),
      createdAt: new Date()
    }
  ]);
  
  console.log(`✓ Inserted ${tasks.insertedCount} tasks`);

  // =============================================================================
  //  INSERT 5 NOTES (some attached to projects, some standalone)
  // =============================================================================
  
  const notes = await db.collection('notes').insertMany([
    {
      ownerId: zohhaId,
      projectId: ecommerceId,
      title: 'API endpoint ideas',
      content: 'Consider using /api/v1/products, /api/v1/orders, /api/v1/users',
      tags: ['api', 'planning', 'ecommerce'],
      createdAt: new Date(),
      color: 'yellow'  // Schema flexibility - optional field
    },
    {
      ownerId: zohhaId,
      projectId: null,  // Standalone note (not attached to any project)
      title: 'Meeting notes - Sprint planning',
      content: 'Complete auth by Friday, start frontend next week',
      tags: ['meeting', 'sprint', 'planning'],
      createdAt: new Date()
    },
    {
      ownerId: zohhaId,
      projectId: fitnessId,
      title: 'UI inspiration',
      content: 'Check out Strava and Nike Run Club for design ideas',
      tags: ['design', 'inspiration', 'ui'],
      createdAt: new Date(),
      color: 'pink'
    },
    {
      ownerId: mairaId,
      projectId: apiId,
      title: 'Rate limiting strategy',
      content: 'Implement 100 requests per minute per IP address',
      tags: ['api', 'security', 'performance'],
      createdAt: new Date()
    },
    {
      ownerId: mairaId,
      projectId: null,  // Standalone note
      title: 'Learning GraphQL',
      content: 'Study GraphQL and Apollo for future projects',
      tags: ['learning', 'graphql', 'future'],
      createdAt: new Date()
    }
  ]);
  
  console.log(`Inserted ${notes.insertedCount} notes`);

  // =============================================================================
  //  SUMMARY
  // =============================================================================
  
  console.log('\n====================================');
  console.log(' DATABASE SEEDED SUCCESSFULLY!');
  console.log('====================================');
  console.log(` Summary:`);
  console.log(`   - Users: ${users.insertedCount}`);
  console.log(`   - Projects: ${projects.insertedCount}`);
  console.log(`   - Tasks: ${tasks.insertedCount}`);
  console.log(`   - Notes: ${notes.insertedCount}`);
  console.log('\n Test Login Credentials:');
  console.log(`   1. Email: zohha@mail.com | Password: password123`);
  console.log(`   2. Email: maira@mail.com | Password: password456`);
  console.log('====================================\n');
  
  process.exit(0);
})();