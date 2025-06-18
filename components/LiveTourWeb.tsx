// app/components/LiveTourWeb.tsx
import React from 'react';
import { WebView } from 'react-native-webview';

export default function LiveTourWeb({ token, channelName, uid }: any) {
  const agoraPage = `
    <!DOCTYPE html>
    <html>
      <head>
        <script src="https://download.agora.io/sdk/release/AgoraRTC_N-4.20.0.js"></script>
        <style> body { margin: 0; } #local-video { width: 100vw; height: 100vh; background: black; } </style>
      </head>
      <body>
        <div id="local-video"></div>
        <script>
          const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
          client.init("${process.env.EXPO_PUBLIC_AGORA_APP_ID}", () => {
            client.join("${token}", "${channelName}", ${uid}, (uid) => {
              const localStream = AgoraRTC.createStream({ audio: true, video: true });
              localStream.init(() => {
                localStream.play("local-video");
                client.publish(localStream);
              });
            });
          });
        </script>
      </body>
    </html>
  `;

  return (
    <WebView
      originWhitelist={['*']}
      source={{ html: agoraPage }}
      javaScriptEnabled
      allowsInlineMediaPlayback
      mediaPlaybackRequiresUserAction={false}
    />
  );
}
