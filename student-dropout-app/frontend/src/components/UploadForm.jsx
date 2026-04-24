import { useState, useRef, useCallback } from 'react'
import api from '../api/axiosClient'

/**
 * UploadForm — drag-and-drop CSV uploader with preview table and upload status.
 * Props: onSuccess {function} — called after successful upload with response data
 */
export default function UploadForm({ onSuccess }) {
  const [file,      setFile]      = useState(null)
  const [preview,   setPreview]   = useState([])   // first 5 rows of CSV
  const [headers,   setHeaders]   = useState([])
  const [dragging,  setDragging]  = useState(false)
  const [status,    setStatus]    = useState(null)  // 'uploading'|'success'|'error'
  const [result,    setResult]    = useState(null)
  const [errorMsg,  setErrorMsg]  = useState('')
  const inputRef = useRef(null)

  const parsePreview = (csvFile) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const lines = e.target.result.split('\n').filter(Boolean)
      if (!lines.length) return
      const cols = lines[0].split(',').map((c) => c.trim())
      setHeaders(cols)
      const rows = lines.slice(1, 6).map((line) => {
        const vals = line.split(',').map((v) => v.trim())
        return Object.fromEntries(cols.map((c, i) => [c, vals[i] ?? '']))
      })
      setPreview(rows)
    }
    reader.readAsText(csvFile)
  }

  const handleFile = (csvFile) => {
    if (!csvFile?.name.endsWith('.csv')) {
      setErrorMsg('Please upload a valid .csv file.')
      return
    }
    setFile(csvFile)
    setStatus(null)
    setErrorMsg('')
    parsePreview(csvFile)
  }

  const onDrop = useCallback((e) => {
    e.preventDefault()
    setDragging(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) handleFile(dropped)
  }, [])

  const onDragOver  = (e) => { e.preventDefault(); setDragging(true) }
  const onDragLeave = ()  => setDragging(false)

  const handleUpload = async () => {
    if (!file) return
    setStatus('uploading')
    const form = new FormData()
    form.append('file', file)
    try {
      const res = await api.post('/upload-csv', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setStatus('success')
      setResult(res.data)
      onSuccess?.(res.data)
    } catch (err) {
      setStatus('error')
      setErrorMsg(err.response?.data?.detail || 'Upload failed. Please try again.')
    }
  }

  const reset = () => {
    setFile(null); setPreview([]); setHeaders([])
    setStatus(null); setResult(null); setErrorMsg('')
  }

  return (
    <div className="space-y-5">
      {/* Drop Zone */}
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer
                    transition-all duration-200 select-none
                    ${dragging
                      ? 'border-indigo-500 bg-indigo-500/10 scale-[1.01]'
                      : 'border-gray-700 hover:border-indigo-500/60 hover:bg-indigo-500/5'
                    }`}
      >
        <input
          ref={inputRef}
          id="csv-file-input"
          type="file"
          accept=".csv"
          className="hidden"
          onChange={(e) => handleFile(e.target.files[0])}
        />
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20
                          flex items-center justify-center text-3xl">
            {file ? '📄' : '📤'}
          </div>
          {file ? (
            <>
              <p className="font-semibold text-gray-100">{file.name}</p>
              <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
            </>
          ) : (
            <>
              <p className="font-semibold text-gray-200">Drop your CSV here</p>
              <p className="text-sm text-gray-500">or click to browse files</p>
              <p className="text-xs text-gray-600 mt-1">
                Required columns: student_id, name, attendance_rate, exam_score, dropped_out…
              </p>
            </>
          )}
        </div>
      </div>

      {/* Preview Table */}
      {preview.length > 0 && (
        <div className="card overflow-hidden p-0 animate-fade-in">
          <p className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider
                        border-b border-gray-800 bg-gray-900/60">
            Preview — first {preview.length} rows
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-800">
                  {headers.map((h) => (
                    <th key={h} className="px-4 py-2.5 text-left text-gray-500 font-semibold whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.map((row, i) => (
                  <tr key={i} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                    {headers.map((h) => (
                      <td key={h} className="px-4 py-2.5 text-gray-300 whitespace-nowrap">
                        {row[h]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Error */}
      {errorMsg && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm animate-fade-in">
          ❌ {errorMsg}
        </div>
      )}

      {/* Success */}
      {status === 'success' && result && (
        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 animate-fade-in space-y-1">
          <p className="text-green-400 font-semibold">✅ {result.message}</p>
          <p className="text-sm text-gray-400">
            {result.inserted} records inserted · {result.skipped} duplicates skipped
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          id="upload-csv-btn"
          onClick={handleUpload}
          disabled={!file || status === 'uploading' || status === 'success'}
          className="btn-primary flex-1 flex items-center justify-center gap-2"
        >
          {status === 'uploading' ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              Uploading…
            </>
          ) : '⬆️  Upload to Database'}
        </button>
        {file && (
          <button onClick={reset} className="btn-secondary">
            ✖ Clear
          </button>
        )}
      </div>
    </div>
  )
}
