const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('🧪 Starting Full System Integration Tests...\n');

  try {
    // 1. Health check
    console.log('1. Checking Health Endpoint...');
    const healthRes = await fetch(`${BASE_URL}/health`);
    const healthData = await healthRes.json();
    console.log('   Health response:', healthData);
    if (!healthRes.ok) throw new Error('Health check failed');

    // 2. Register User 1 (Rahul Sharma)
    console.log('\n2. Testing User 1 Registration (Rahul Sharma)...');
    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Rahul Sharma',
        email: 'rahul.sharma@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      }),
    });
    const regData = await regRes.json();
    console.log('   Register response status:', regRes.status);
    console.log('   Register response user:', regData.user);
    if (!regData.success || !regData.token || regData.user.name !== 'Rahul Sharma') {
      throw new Error('Registration failed or user name incorrect');
    }
    const token1 = regData.token;

    // 3. User 1 Login
    console.log('\n3. Testing User 1 Login...');
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'rahul.sharma@example.com',
        password: 'password123',
      }),
    });
    const loginData = await loginRes.json();
    console.log('   Login status:', loginRes.status, 'User:', loginData.user?.name);
    if (!loginData.success || !loginData.token) throw new Error('Login failed');

    // 4. Test Profile Endpoint
    console.log('\n4. Testing Profile Endpoint...');
    const profileRes = await fetch(`${BASE_URL}/profile`, {
      headers: { Authorization: `Bearer ${token1}` },
    });
    const profileData = await profileRes.json();
    console.log('   Profile data:', profileData.profile);
    if (profileData.profile.name !== 'Rahul Sharma') throw new Error('Dynamic profile name mismatch');

    // 5. Test Resume Upload
    console.log('\n5. Testing Resume Upload...');
    const dummyResumePath = path.join(__dirname, 'test_rahul_resume.pdf');
    fs.writeFileSync(dummyResumePath, '%PDF-1.4 Mock resume content for Rahul Sharma with React, Node, and MongoDB skills.');

    const formData = new FormData();
    const fileBlob = new Blob([fs.readFileSync(dummyResumePath)], { type: 'application/pdf' });
    formData.append('resume', fileBlob, 'test_rahul_resume.pdf');

    const uploadRes = await fetch(`${BASE_URL}/resume/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token1}` },
      body: formData,
    });
    const uploadData = await uploadRes.json();
    console.log('   Resume upload status:', uploadRes.status, 'Response:', uploadData);
    if (!uploadData.success || !uploadData.resume) throw new Error('Resume upload failed');

    // Clean up temporary dummy file
    if (fs.existsSync(dummyResumePath)) fs.unlinkSync(dummyResumePath);

    // 6. Test GET Resume
    console.log('\n6. Testing GET Resume...');
    const getResumeRes = await fetch(`${BASE_URL}/resume`, {
      headers: { Authorization: `Bearer ${token1}` },
    });
    const getResumeData = await getResumeRes.json();
    console.log('   Active resume:', getResumeData.resume?.originalName);
    if (!getResumeData.hasResume) throw new Error('Resume not found after upload');

    // 7. Test Start Interview
    console.log('\n7. Testing Start Interview (Technical, Beginner, 5 Questions)...');
    const startRes = await fetch(`${BASE_URL}/interview/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token1}`,
      },
      body: JSON.stringify({
        type: 'Technical',
        difficulty: 'Beginner',
        totalQuestions: 5,
        targetRole: 'Full Stack Developer',
        useResume: true,
      }),
    });
    const startData = await startRes.json();
    console.log('   Start Interview status:', startRes.status);
    console.log('   Generated Questions count:', startData.interview?.questions?.length);
    console.log('   Question 1:', startData.interview?.questions[0]);
    if (!startData.success || startData.interview.questions.length !== 5) {
      throw new Error('Interview question generation failed');
    }
    const interviewId = startData.interview.id;

    // 8. Test Submit Answer
    console.log('\n8. Testing Submit Answer to Question 1...');
    const answerRes = await fetch(`${BASE_URL}/interview/answer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token1}`,
      },
      body: JSON.stringify({
        interviewId,
        questionIndex: 0,
        questionId: 1,
        answer: 'let has block scope and can be reassigned. const also has block scope but cannot be reassigned. var is function-scoped and gets hoisted to the top of its scope.',
      }),
    });
    const answerData = await answerRes.json();
    console.log('   Submit Answer status:', answerRes.status);
    console.log('   AI Answer Evaluation:', answerData.evaluation);
    if (!answerData.success || typeof answerData.evaluation.score !== 'number') {
      throw new Error('Answer evaluation failed');
    }

    // Submit answer to question 2
    console.log('\n   Submitting answer to Question 2...');
    await fetch(`${BASE_URL}/interview/answer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token1}`,
      },
      body: JSON.stringify({
        interviewId,
        questionIndex: 1,
        questionId: 2,
        answer: 'Responsive web design adapts layout to multiple screen sizes using fluid grid percentages and CSS media query breakpoints.',
      }),
    });

    // 9. Test Complete Interview
    console.log('\n9. Testing Complete Interview...');
    const completeRes = await fetch(`${BASE_URL}/interview/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token1}`,
      },
      body: JSON.stringify({ interviewId }),
    });
    const completeData = await completeRes.json();
    console.log('   Complete status:', completeRes.status);
    console.log('   Final Summary:', {
      score: completeData.summary?.averageScore,
      questionsAnswered: completeData.summary?.questionsAnswered,
      strengths: completeData.summary?.strengths?.length,
      weaknesses: completeData.summary?.weaknesses?.length,
      weakTopics: completeData.summary?.weakTopics,
    });
    if (!completeData.success || !completeData.summary) throw new Error('Interview completion failed');

    // 10. Test Performance Analytics Endpoint
    console.log('\n10. Testing Performance Analytics Endpoint...');
    const perfRes = await fetch(`${BASE_URL}/performance`, {
      headers: { Authorization: `Bearer ${token1}` },
    });
    const perfData = await perfRes.json();
    console.log('    Analytics:', {
      totalInterviews: perfData.analytics?.totalInterviews,
      averageScore: perfData.analytics?.averageScore,
      weakTopics: perfData.analytics?.weakTopics,
      recentHistory: perfData.analytics?.recentHistory?.length,
    });
    if (perfData.analytics.totalInterviews !== 1) throw new Error('Performance aggregation failed');

    // 11. Test Feedback Endpoint
    console.log('\n11. Testing Feedback Endpoint...');
    const fbRes = await fetch(`${BASE_URL}/feedback`, {
      headers: { Authorization: `Bearer ${token1}` },
    });
    const fbData = await fbRes.json();
    console.log('    Feedback count:', fbData.count);
    if (fbData.count < 1) throw new Error('Feedback not stored');

    // 12. Test User 2 (Priya Verma) and verify Dynamic Name & Isolation
    console.log('\n12. Testing User 2 (Priya Verma) Dynamic Separation...');
    const regRes2 = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Priya Verma',
        email: 'priya.verma@example.com',
        password: 'password456',
        confirmPassword: 'password456',
      }),
    });
    const regData2 = await regRes2.json();
    console.log('    User 2 Registered:', regData2.user?.name);
    if (regData2.user.name !== 'Priya Verma') throw new Error('User 2 name incorrect');

    const profileRes2 = await fetch(`${BASE_URL}/profile`, {
      headers: { Authorization: `Bearer ${regData2.token}` },
    });
    const profileData2 = await profileRes2.json();
    console.log('    User 2 Profile Name:', profileData2.profile.name);
    console.log('    User 2 Completed Interviews (Should be 0):', profileData2.profile.totalInterviewsCompleted);
    if (profileData2.profile.name !== 'Priya Verma' || profileData2.profile.totalInterviewsCompleted !== 0) {
      throw new Error('Data isolation failed between users');
    }

    console.log('\n🎉 ALL 12 INTEGRATION TESTS PASSED PERFECTLY! 100% SUCCESS!\n');
  } catch (error) {
    console.error('\n❌ Test Failed with Error:', error);
    process.exit(1);
  }
}

runTests();
