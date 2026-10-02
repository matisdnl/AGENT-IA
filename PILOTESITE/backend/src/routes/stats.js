const express = require('express')
const router  = express.Router()
const notion  = require('../services/notion')

// GET /api/stats?chantier=acacias
// Calcule les compteurs depuis Notion
router.get('/', async (req, res, next) => {
  try {
    const [taches, mails] = await Promise.all([
      notion.getTaches(req.query.chantier),
      notion.getMails(req.query.chantier),
    ])

    const tachesAFaire  = taches.results.filter(
      t => t.properties?.Statut?.select?.name === 'À faire'
    ).length

    const tachesUrgentes = taches.results.filter(
      t => t.properties?.Priorité?.select?.name === 'URGENTE'
    ).length

    const mailsValider = mails.results.filter(
      m => m.properties?.Statut?.select?.name === 'Brouillon prêt'
    ).length

    const docsAttente = taches.results.filter(
      t => t.properties?.Catégorie?.select?.name === 'DOCUMENT'
        && t.properties?.Statut?.select?.name === 'À faire'
    ).length

    res.json({ tachesAFaire, tachesUrgentes, mailsValider, docsAttente })
  } catch (e) { next(e) }
})

module.exports = router
