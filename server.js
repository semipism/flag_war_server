// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// ✅ MongoDB 모델 정의
const Country = mongoose.model('Country', {
  name: String,
  code: String,
  score: Number
});

// ✅ 점수 전체 조회
app.get('/scores', async (req, res) => {
  try {
    const countries = await Country.find();
    res.json(countries);
  } catch (err) {
    res.status(500).json({ success: false, message: 'DB 조회 오류', error: err.message });
  }
});

// ✅ 점수 클릭 (양수/음수)
app.post('/click', async (req, res) => {
  const { code, change } = req.body;
  try {
    const country = await Country.findOne({ code });
    if (country) {
      country.score += change;
      await country.save();
      res.json({ success: true });
    } else {
      res.status(404).json({ success: false, message: 'Country not found' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'DB 업데이트 오류', error: err.message });
  }
});

// ✅ MongoDB 연결 및 서버 시작
(async () => {
  const mongoURI = process.env.MONGO_URL; // Railway에서는 자동 주입됨
  const port = process.env.PORT || 3000;

  console.log('⏳ MongoDB 연결 시도 중...');

  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000
    });

    console.log('✅ MongoDB 연결 성공');
    app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
    });

  } catch (err) {
    console.error('❌ MongoDB 연결 실패:', err.message);
    process.exit(1);
  }
})();
