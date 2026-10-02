const express = require('express')
const router  = express.Router()
const notion  = require('../services/notion')
const axios   = require('axios')

// GET /api/mails?chantier=acacias          → brouillons prêts seulement
// GET /api/mails?chantier=acacias&tous=1   → tous les mails du chantier
router.get('/', async (req, res, next) => {
  try {
    const data = req.query.tous
      ? await notion.getAllMails(req.query.chantier)
      : await notion.getMails(req.query.chantier)
    res.json(data)
  } catch (e) { next(e) }
})

// POST /api/mails/:id/envoyer — valide et envoie via n8n
router.post('/:id/envoyer', async (req, res, next) => {
  try {
    // Passe le relais à n8n pour l'envoi Outlook réel
    if (process.env.N8N_WEBHOOK_URL) {
      await axios.post(process.env.N8N_WEBHOOK_URL, {
        action: 'envoyer_mail',
        pageId: req.params.id,
      })
    }
    // Met à jour le statut dans Notion
    const data = await notion.updateMailStatut(req.params.id, 'Envoyé')
    res.json(data)
  } catch (e) { next(e) }
})

// POST /api/mails/:id/modifier — envoie instruction de modif à n8n
router.post('/:id/modifier', async (req, res, next) => {
  try {
    if (process.env.N8N_WEBHOOK_URL) {
      await axios.post(process.env.N8N_WEBHOOK_URL, {
        action: 'modifier_mail',
        pageId: req.params.id,
        instruction: req.body.instruction,
      })
    }
    res.json({ success: true, message: 'Modification transmise à l\'agent' })
  } catch (e) { next(e) }
})

// PATCH /api/mails/:id  { statut }
router.patch('/:id', async (req, res, next) => {
  try {
    const data = await notion.updateMailStatut(req.params.id, req.body.statut)
    res.json(data)
  } catch (e) { next(e) }
})

module.exports = router
