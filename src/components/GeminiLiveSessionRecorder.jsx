import { motion, AnimatePresence } from 'framer-motion'

export function GeminiLiveSessionRecorder({ session, className = '', showTranscript = true, compact = false }) {
  const {
    isConnected,
    isRecording,
    isSessionActive,
    transcript,
    recording,
    error,
    startSession,
    stopSession,
    startRecording,
    stopRecording,
    saveTranscript,
    saveRecording,
    clearSession,
    retryConnection
  } = session

  const formatDuration = (ms) => {
    const totalSeconds = Math.floor(ms / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const formatTime = (iso) => {
    return new Date(iso).toLocaleTimeString('en-US', { 
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false 
    })
  }

  const hasTranscript = transcript.length > 0
  const hasRecording = recording && recording.blob

  const statusText = isConnected 
    ? 'CONNECTED' 
    : isSessionActive 
      ? 'INITIALIZING' 
      : error 
        ? 'CONNECTION BERMASALAH' 
        : 'READY'

  return (
    <div className={`w-full max-w-4xl mx-auto bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden ${className}`}>
      <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900">
        <div className="flex items-center gap-3">
          <div className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-emerald-500' : isSessionActive ? 'bg-amber-500' : error ? 'bg-red-500' : 'bg-zinc-400'}`} />
          <div>
            <div className="font-semibold text-zinc-900 dark:text-white text-lg tracking-tight">Gemini Live Session</div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
              {statusText} {isRecording && '• RECORDING'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isSessionActive ? (
            <button
              onClick={startSession}
              disabled={!!error && !error.recoverable}
              className="inline-flex items-center justify-center px-5 py-2 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-100 active:scale-[0.985] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Mulai Sesi
            </button>
          ) : (
            <button
              onClick={stopSession}
              className="inline-flex items-center justify-center px-5 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 active:scale-[0.985] transition-all"
            >
              Akhiri Sesi
            </button>
          )}

          {isSessionActive && (
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-medium transition-all active:scale-[0.985] ${isRecording 
                ? 'bg-red-600 text-white hover:bg-red-700' 
                : 'border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
            >
              {isRecording ? 'Stop Recording' : 'Mulai Recording'}
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-6 py-4 bg-red-50 dark:bg-red-950/50 border-b border-red-200 dark:border-red-900 flex items-start gap-3"
          >
            <div className="flex-1 text-sm text-red-700 dark:text-red-400">
              <div className="font-medium">{error.message}</div>
              {error.details && <div className="text-xs mt-1 opacity-70 font-mono">{String(error.details)}</div>}
            </div>
            {error.recoverable && (
              <button 
                onClick={retryConnection}
                className="shrink-0 px-4 py-1.5 text-xs font-medium rounded-lg border border-red-300 dark:border-red-800 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50"
              >
                Coba Lagi
              </button>
            )}
            <button onClick={clearSession} className="shrink-0 text-red-500 hover:text-red-600 p-1">×</button>
          </motion.div>
        )}
      </AnimatePresence>

      {showTranscript && (
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Live Transcript</div>
            {hasTranscript && (
              <div className="flex gap-2">
                <button onClick={() => saveTranscript('txt')} className="text-xs px-3 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400">Download TXT</button>
                <button onClick={() => saveTranscript('json')} className="text-xs px-3 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400">Download JSON</button>
              </div>
            )}
          </div>

          <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl h-[320px] overflow-y-auto p-4 font-mono text-sm space-y-4">
            {!hasTranscript && (
              <div className="h-full flex items-center justify-center text-zinc-400 text-sm">
                {isSessionActive 
                  ? 'Transcript akan muncul saat percakapan berlangsung...' 
                  : 'Mulai sesi untuk mulai merekam transcript'}
              </div>
            )}
            {transcript.map((entry) => (
              <div key={entry.id} className="flex gap-3">
                <div className={`shrink-0 w-16 text-[10px] pt-0.5 tabular-nums ${entry.role === 'user' ? 'text-blue-600 dark:text-blue-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  {formatTime(entry.timestamp)}
                </div>
                <div className="flex-1">
                  <div className={`font-medium text-xs tracking-widest mb-px ${entry.role === 'user' ? 'text-blue-600 dark:text-blue-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    {entry.role === 'user' ? 'YOU' : 'GEMINI'}
                  </div>
                  <div className="text-zinc-800 dark:text-zinc-200 leading-relaxed whitespace-pre-wrap break-words">
                    {entry.text}
                    {!entry.isFinal && <span className="inline-block w-1.5 h-3 bg-current animate-pulse ml-0.5 align-middle" />}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {(hasRecording || hasTranscript) && !isSessionActive && (
        <div className="px-6 py-5 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex flex-wrap gap-3 items-center justify-between">
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            Sesi selesai • {transcript.length} pesan
            {recording && ` • ${(recording.size / (1024 * 1024)).toFixed(1)} MB recording`}
          </div>
          <div className="flex flex-wrap gap-2">
            {hasTranscript && (
              <>
                <button onClick={() => saveTranscript('txt')} className="px-4 py-2 text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-white dark:hover:bg-zinc-950">TXT Transcript</button>
                <button onClick={() => saveTranscript('json')} className="px-4 py-2 text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-white dark:hover:bg-zinc-950">JSON Transcript</button>
              </>
            )}
            {hasRecording && (
              <button onClick={saveRecording} className="px-5 py-2 text-sm rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-medium hover:bg-black dark:hover:bg-zinc-200">
                Download Recording ({formatDuration(recording.durationMs)})
              </button>
            )}
            <button onClick={clearSession} className="px-4 py-2 text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-white dark:hover:bg-zinc-950">Clear</button>
          </div>
        </div>
      )}

      {compact && isRecording && (
        <div className="px-6 py-2 text-xs text-red-600 dark:text-red-400 flex items-center gap-2 border-t border-zinc-100 dark:border-zinc-800">
          <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" /> Recording aktif — {transcript.length} turns
        </div>
      )}
    </div>
  )
}