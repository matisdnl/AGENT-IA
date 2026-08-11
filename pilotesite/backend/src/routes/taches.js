const express = require('express')
const router  = express.Router()
const notion  = require('../services/notion')

// GET /api/taches?chantier=acacias
router.get('/', async (req, res, next) => {
  try {
    const data = await notion.getTaches(req.query.chantier)
    res.json(data)
  } catch (e) { next(e) }
})

// PATCH /api/taches/:id  { statut }
router.patch('/:id', async (req, res, next) => {
  try {
    const data = await notion.updateTacheStatut(req.params.id, req.body.statut)
    res.json(data)
  } catch (e) { next(e) }
})

// POST /api/taches  { titre, priorite, categorie, chantierId, deadline, notes }
router.post('/', async (req, res, next) => {
  try {
    const data = await notion.createTache(req.body)
    res.json(data)
  } catch (e) { next(e) }
})

module.exports = router
