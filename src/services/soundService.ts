export const soundService = {
  async recordVoice(): Promise<{ uri: string; duration: number }> {
    return new Promise(async (resolve, reject) => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        const chunks: Blob[] = [];

        mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'audio/webm' });
          const uri = URL.createObjectURL(blob);
          resolve({ uri, duration: 0 }); // basic impl
          stream.getTracks().forEach(track => track.stop());
        };

        // For MVP, we record for 5 seconds or until manually stopped
        // In the UI we'll have more control. This is the low-level logic.
        mediaRecorder.start();
        setTimeout(() => {
          if (mediaRecorder.state === 'recording') mediaRecorder.stop();
        }, 5000);
      } catch (err) {
        reject(err);
      }
    });
  },

  async pickAudioFile(): Promise<{ uri: string; name: string }> {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'audio/mp3,audio/wav,audio/m4a';
      input.onchange = (e: any) => {
        const file = e.target.files[0];
        if (file) {
          const uri = URL.createObjectURL(file);
          resolve({ uri, name: file.name });
        }
      };
      input.click();
    });
  }
};
