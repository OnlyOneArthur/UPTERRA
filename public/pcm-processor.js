/**
 * pcm-processor.js
 * AudioWorkletProcessor: convert float32 samples → raw PCM16 (little-endian)
 * dan kirim ke main thread via MessagePort setiap process() call (~128 samples).
 *
 * Diload oleh useGeminiLive via:
 *   audioCtx.audioWorklet.addModule('/pcm-processor.js')
 */
class PcmProcessor extends AudioWorkletProcessor {
  process(inputs) {
    const input = inputs[0];
    if (!input || !input[0]) return true;

    const float32 = input[0];
    // Convert float32 [-1, 1] → int16 PCM
    const pcm16 = new Int16Array(float32.length);
    for (let i = 0; i < float32.length; i++) {
      const s = Math.max(-1, Math.min(1, float32[i]));
      pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }

    // Transfer buffer ke main thread (zero-copy)
    this.port.postMessage(pcm16.buffer, [pcm16.buffer]);
    return true;
  }
}

registerProcessor('pcm-processor', PcmProcessor);
