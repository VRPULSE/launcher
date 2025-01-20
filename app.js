require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();

// 미들웨어 설정
app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB 연결
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.error('MongoDB Connection Error:', err));

// 유저 스키마 정의
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

// 유저 모델 생성 (컬렉션 이름: 'user')
const User = mongoose.model('User', userSchema, 'user');

// 테스트 유저 생성 및 비밀번호 재설정
(async function createOrUpdateTestUser() {
  const testUsername = 'testuser';
  const testPassword = '123456';

  try {
    const existingUser = await User.findOne({ username: testUsername });
    if (existingUser) {
      const hashedPassword = await bcrypt.hash(testPassword, 10); // 비밀번호 암호화
      await User.updateOne(
        { username: testUsername },
        { $set: { password: hashedPassword } }
      );
      console.log('Test user password updated:', existingUser);
    } else {
      const hashedPassword = await bcrypt.hash(testPassword, 10); // 비밀번호 암호화
      const newUser = new User({ username: testUsername, password: hashedPassword });
      await newUser.save();
      console.log('Test user created:', newUser);
    }
  } catch (error) {
    console.error('Error creating or updating test user:', error);
  }
})();

// 기본 라우트
app.get('/', (req, res) => {
  res.send('Hello, World! MongoDB is connected!');
});

// 로그인 엔드포인트
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // 사용자 찾기
    const user = await User.findOne({ username });
    if (!user) {
      console.log('Database contents:', await User.find()); // 디버깅용
      return res.status(404).json({ message: 'User not found' });
    }

    // 비밀번호 확인
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.error('Password mismatch');
      console.error('Input password:', password);
      console.error('Stored password:', user.password);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // JWT 토큰 생성
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// 포트 설정 및 서버 실행
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
