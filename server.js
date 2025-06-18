const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { RtcTokenBuilder, RtcRole } = require('agora-access-token');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.post('/agora-token', (req, res) => {
  const { channelName, uid } = req.body;

  console.log('🟡 Received request for token generation');
  console.log('📺 channelName:', channelName);
  console.log('👤 uid:', uid);

  if (!channelName || !uid) {
    console.error('❌ Missing channelName or uid');
    return res.status(400).json({ error: 'channelName and uid are required' });
  }

  const appID = "44e503de9b3346378fe7badfdb920726";
  const appCertificate = "d091d2025d544f96b500fc7313a89777";

  console.log('🔐 AGORA_APP_ID:', appID);
  console.log('🔐 AGORA_APP_CERTIFICATE:', appCertificate ? '[SET]' : '[MISSING]');

  if (!appID || !appCertificate) {
    console.error('❌ AGORA credentials are not set properly in the .env file');
    return res.status(500).json({ error: 'AGORA credentials missing' });
  }

  const expirationTimeInSeconds = 3600;
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

  try {
    const token = RtcTokenBuilder.buildTokenWithUid(
      appID,
      appCertificate,
      channelName,
      uid,
      RtcRole.PUBLISHER,
      privilegeExpiredTs
    );

    console.log('✅ Token generated:', token);
    return res.json({ token });
  } catch (error) {
    console.error('🔥 Error generating token:', error);
    return res.status(500).json({ error: 'Failed to generate token' });
  }
});

const PORT =3001;
app.listen(PORT, () => {
  console.log(`✅ Agora backend running on http://localhost:${PORT}`);
});
