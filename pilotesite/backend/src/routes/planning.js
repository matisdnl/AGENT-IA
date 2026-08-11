const express = require('express')
const router  = express.Router()
const notion  = require('../services/notion')

// GET /api/planning?chantier=acacias
router.get('/', async (req, res, next) => {
  try {
    const data = await notion.getPlanning(req.query.chantier)
    res.json(data)
  } catch (e) { next(e) }
})

// POST /api/planning
router.post('/', async (req, res, next) => {
  try {
    const data = await notion.createEvenement(req.body)
    res.json(data)
  } catch (e) { next(e) }
})

module.exports = router
