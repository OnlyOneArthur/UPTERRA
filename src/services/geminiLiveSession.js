import { useState, useRef, useCallback, useEffect } from 'react'

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function createError(code, message, details, recoverable = true) {
  return { code, message, details, recoverable }
}

export function useGeminiLiveSession(config) {
  const [state, setState] = useState({
    isConnected: false,
    isRecording: false,
    isSessionActive: false,
    transcript: [],
    recording: null,
    error: null,
    connectionQuality: 'good'
  })

  const mediaRecorderRef = useRef(null)
  const recordedChunksRef = useRef([])
  const streamRef = useRef(null)
  const sessionStartTimeRef = useRef(null)
  const transcriptRef = useRef([])

  const updateState = useCallback((partial) => {
    setState(prev => {
      const next = { ...prev, ...partial }
      if (partial.transcript) transcriptRef.current = partial.transcript
      return next
    })
  }, [])

  const handleError = useCallback((error) => {
    updateState({ error })
    if (config.onError) config.onError(error)
    console.error('[GeminiLiveSession]', error.code, error.message, error.details)
  }, [config.onError, updateState])

  const addTranscriptEntry = useCallback((role, text, isFinal = true) => {
    if (!text || !text.trim()) return
    const entry = {
      id: generateId(),
      timestamp: new Date().toISOString(),
      role,
      text: text.trim(),
      isFinal
    }
    const newTranscript = [...transcriptRef.current, entry]
    transcriptRef.current = newTranscript
    updateState({ transcript: newTranscript })
    if (config.onTranscriptUpdate) config.onTranscriptUpdate(newTranscript)
  }, [config.onTranscriptUpdate, updateState])

  const addUserTranscript = useCallback((text, isFinal = true) => {
    addTranscriptEntry('user', text, isFinal)
  }, [addTranscriptEntry])

  const addModelTranscript = useCallback((text, isFinal = true) => {
    addTranscriptEntry('model', text, isFinal)
  }, [addTranscriptEntry])

  const startRecording = useCallback(async () => {
    if (state.isRecording) return
    try {
      let stream
      if (config.externalStreamRef && config.externalStreamRef.current) {
        stream = config.externalStreamRef.current
      } else {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: { echoCancellation: true, noiseSuppression: true, sampleRate: 48000 }
        })
        streamRef.current = stream
      }

      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
        ? 'video/webm;codecs=vp9,opus'
        : MediaRecorder.isTypeSupported('video/webm') ? 'video/webm' : 'video/mp4'

      const recorder = new MediaRecorder(stream, { mimeType })
      mediaRecorderRef.current = recorder
      recordedChunksRef.current = []

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) recordedChunksRef.current.push(event.data)
      }

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: mimeType })
        const recording = {
          id: generateId(),
          startTime: sessionStartTimeRef.current || new Date().toISOString(),
          endTime: new Date().toISOString(),
          durationMs: sessionStartTimeRef.current ? Date.now() - new Date(sessionStartTimeRef.current).getTime() : 0,
          blob,
          mimeType,
          size: blob.size
        }
        updateState({ recording, isRecording: false })
        recordedChunksRef.current = []
        if (config.onRecordingComplete) config.onRecordingComplete(recording)
        if (!config.externalStreamRef && streamRef.current) {
          streamRef.current.getTracks().forEach(t => t.stop())
          streamRef.current = null
        }
      }

      recorder.onerror = (event) => {
        handleError(createError('RECORDING_FAILED', 'Media recorder error', event))
        updateState({ isRecording: false })
      }

      recorder.start(1000)
      updateState({ isRecording: true, error: null })
    } catch (err) {
      const name = err.name || ''
      let geminiError
      if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
        geminiError = createError('PERMISSION_DENIED', 'Camera/mic permission denied. Allow in browser settings.', err)
      } else if (name === 'NotFoundError') {
        geminiError = createError('MEDIA_DEVICE_NOT_FOUND', 'No camera or microphone found.', err, false)
      } else {
        geminiError = createError('MEDIA_ACCESS_FAILED', 'Failed to access media devices.', err)
      }
      handleError(geminiError)
    }
  }, [state.isRecording, config, handleError, updateState])

  const stopRecording = useCallback(async () => {
    const recorder = mediaRecorderRef.current
    if (!recorder || recorder.state === 'inactive') {
      updateState({ isRecording: false })
      return
    }
    try {
      recorder.stop()
    } catch (err) {
      handleError(createError('RECORDING_STOP_FAILED', 'Failed to stop recording.', err))
    }
  }, [handleError, updateState])

  const startSession = useCallback(async () => {
    if (state.isSessionActive) return
    try {
      updateState({ error: null, isSessionActive: true, transcript: [], recording: null })
      transcriptRef.current = []
      sessionStartTimeRef.current = new Date().toISOString()
      if (config.enableRecording !== false) {
        await startRecording()
      }
      updateState({ isConnected: true })
    } catch (err) {
      handleError(createError('SESSION_START_FAILED', 'Failed to start Gemini Live session.', err))
      updateState({ isSessionActive: false })
    }
  }, [state.isSessionActive, config, startRecording, handleError, updateState])

  const stopSession = useCallback(async () => {
    if (!state.isSessionActive) return
    try {
      if (state.isRecording) await stopRecording()
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop())
        streamRef.current = null
      }
      mediaRecorderRef.current = null
      const endTime = new Date().toISOString()
      if (state.recording) {
        updateState({
          recording: {
            ...state.recording,
            endTime,
            durationMs: sessionStartTimeRef.current ? new Date(endTime).getTime() - new Date(sessionStartTimeRef.current).getTime() : 0
          }
        })
      }
      updateState({ isConnected: false, isSessionActive: false })
    } catch (err) {
      handleError(createError('SESSION_STOP_FAILED', 'Error ending session.', err))
    }
  }, [state.isSessionActive, state.isRecording, state.recording, stopRecording, handleError, updateState])

  const saveTranscript = useCallback((format) => {
    const entries = transcriptRef.current
    if (entries.length === 0) return
    let content, filename, mime
    if (format === 'json') {
      content = JSON.stringify({
        sessionId: generateId(),
        startTime: sessionStartTimeRef.current,
        endTime: new Date().toISOString(),
        entries
      }, null, 2)
      filename = `gemini-live-transcript-${new Date().toISOString().slice(0,19)}.json`
      mime = 'application/json'
    } else {
      const lines = entries.map(e => {
        const time = new Date(e.timestamp).toLocaleTimeString('en-US', { hour12: false })
        const speaker = e.role === 'user' ? 'You' : 'Gemini'
        return `[${time}] ${speaker}: ${e.text}`
      })
      content = `Gemini Live Session Transcript\nStarted: ${sessionStartTimeRef.current}\n\n${lines.join('\n\n')}`
      filename = `gemini-live-transcript-${new Date().toISOString().slice(0,19)}.txt`
      mime = 'text/plain'
    }
    const blob = new Blob([content], { type: mime })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [])

  const saveRecording = useCallback(() => {
    const rec = state.recording
    if (!rec || !rec.blob) return
    const url = URL.createObjectURL(rec.blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `gemini-live-session-${(rec.startTime || '').slice(0,19)}.webm`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [state.recording])

  const clearSession = useCallback(() => {
    if (state.isRecording) stopRecording()
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
    mediaRecorderRef.current = null
    transcriptRef.current = []
    sessionStartTimeRef.current = null
    updateState({
      isConnected: false,
      isRecording: false,
      isSessionActive: false,
      transcript: [],
      recording: null,
      error: null,
      connectionQuality: 'good'
    })
  }, [state.isRecording, stopRecording, updateState])

  const retryConnection = useCallback(async () => {
    updateState({ error: null })
    await startSession()
  }, [startSession, updateState])

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop()
      }
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
    }
  }, [])

  return {
    ...state,
    startSession,
    stopSession,
    addUserTranscript,
    addModelTranscript,
    startRecording,
    stopRecording,
    saveTranscript,
    saveRecording,
    clearSession,
    retryConnection
  }
}