/**
 * Audio Converter Utility
 * Converts audio blobs/files to WAV format for backend compatibility
 */

/**
 * Convert an audio blob to WAV format
 * @param audioBlob - The source audio blob (webm, ogg, etc.)
 * @returns Promise<Blob> - WAV format blob
 */
export const convertToWav = async (audioBlob: Blob): Promise<Blob> => {
  // Create audio context
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  
  // Read the audio blob as array buffer
  const arrayBuffer = await audioBlob.arrayBuffer();
  
  // Decode audio data
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  
  // Convert to WAV
  const wavBlob = audioBufferToWav(audioBuffer);
  
  // Close audio context to free resources
  await audioContext.close();
  
  return wavBlob;
};

/**
 * Convert AudioBuffer to WAV Blob
 */
function audioBufferToWav(audioBuffer: AudioBuffer): Blob {
  const numberOfChannels = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;
  
  // Interleave channels
  const length = audioBuffer.length * numberOfChannels * 2;
  const buffer = new ArrayBuffer(44 + length);
  const view = new DataView(buffer);
  
  // Write WAV header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + length, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size
  view.setUint16(20, format, true); // AudioFormat
  view.setUint16(22, numberOfChannels, true); // NumChannels
  view.setUint32(24, sampleRate, true); // SampleRate
  view.setUint32(28, sampleRate * numberOfChannels * bitDepth / 8, true); // ByteRate
  view.setUint16(32, numberOfChannels * bitDepth / 8, true); // BlockAlign
  view.setUint16(34, bitDepth, true); // BitsPerSample
  writeString(view, 36, 'data');
  view.setUint32(40, length, true); // Subchunk2Size
  
  // Write audio data
  const channels: Float32Array[] = [];
  for (let i = 0; i < numberOfChannels; i++) {
    channels.push(audioBuffer.getChannelData(i));
  }
  
  let offset = 44;
  for (let i = 0; i < audioBuffer.length; i++) {
    for (let channel = 0; channel < numberOfChannels; channel++) {
      const sample = Math.max(-1, Math.min(1, channels[channel][i]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
      offset += 2;
    }
  }
  
  return new Blob([buffer], { type: 'audio/wav' });
}

/**
 * Write string to DataView
 */
function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

/**
 * Convert File to WAV File
 * @param file - Source audio file
 * @param originalFileName - Original file name (optional)
 * @returns Promise<File> - WAV format file
 */
export const convertFileToWav = async (file: File, originalFileName?: string): Promise<File> => {
  const wavBlob = await convertToWav(file);
  
  // Generate filename
  const baseName = originalFileName || file.name;
  const nameWithoutExt = baseName.replace(/\.[^/.]+$/, '');
  const fileName = `${nameWithoutExt}.wav`;
  
  return new File([wavBlob], fileName, { type: 'audio/wav' });
};

/**
 * Check if file is already WAV format
 */
export const isWavFile = (file: File | Blob): boolean => {
  return file.type === 'audio/wav' || file.type === 'audio/x-wav';
};

/**
 * Ensure file is in WAV format, convert if necessary
 */
export const ensureWavFormat = async (file: File): Promise<File> => {
  if (isWavFile(file)) {
    return file;
  }
  return convertFileToWav(file, file.name);
};
