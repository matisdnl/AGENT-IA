require('dotenv').config()
const express = require('express')
const cors    = require('cors')

const tachesRouter   = require('./routes/taches')
const mailsRouter    = require('./routes/mails')
const planningRouter = require('./routes/planning')
const statsRouter    = require('./routes/stats')
const chatRouter     = require('./routes/chat')

const app  = express()
const PORT = process.env.PORT || 3001

// ─── Middleware ────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
}))
app.use(express.json())

// Log chaque requête en dev
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`)
  next()
})

// ─── Routes ───────────────────────────────────
app.use('/api/taches',   tachesRouter)
app.use('/api/mails',    mailsRouter)
app.use('/api/planning', planningRouter)
app.use('/api/stats',    statsRouter)
app.use('/api/chat',     chatRouter)

// Health check (utilisé par Railway)
app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date() }))

// Gestion des erreurs globale
app.use((err, _req, res, _next) => {
  console.error('[Error]', err.message)
  res.status(500).json({ error: err.message })
})

app.listen(PORT, () => {
  console.log(`✅  PiloteSite backend démarré sur http://localhost:${PORT}`)
})
