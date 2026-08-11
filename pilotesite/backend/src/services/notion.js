const { Client } = require('@notionhq/client')

const notion = new Client({ auth: process.env.NOTION_API_KEY })

const DB = {
  TACHES:   process.env.NOTION_DB_TACHES_ID,
  PLANNING: process.env.NOTION_DB_PLANNING_ID,
  EMAILS:   process.env.NOTION_DB_EMAILS_ID,
}

// Labels exacts tels que configurés dans chaque base Notion
// À uniformiser dans Notion pour simplifier
const LABELS = {
  TACHES:   { acacias: 'Résidence Les Acacias', merignac: 'Extension Centre Commercial Mérignac' },
  PLANNING: { acacias: 'Résidence Les Acacias', merignac: 'Extension Centre Commercial Mérignac' },
  EMAILS:   { acacias: 'Résidence Les Acacias', merignac: 'Extension Centre Commercial Mérignac' },
}

// ─────────────────────────────────────────
// TÂCHES
// ─────────────────────────────────────────

/** Récupère toutes les tâches d'un chantier, triées par priorité */
async function getTaches(chantierId) {
  const chantierLabel = LABELS.TACHES[chantierId]

  const response = await notion.databases.query({
    database_id: DB.TACHES,
    filter: {
      property: 'Chantier',
      select: { equals: chantierLabel },
    },
    sorts: [
      { property: 'Priorité', direction: 'ascending' },
      { property: 'Deadline', direction: 'ascending' },
    ],
  })

  return response
}

/** Met à jour le statut d'une tâche */
async function updateTacheStatut(pageId, statut) {
  return notion.pages.update({
    page_id: pageId,
    properties: {
      Statut: { select: { name: statut } },
    },
  })
}

/** Crée une nouvelle tâche */
async function createTache({ titre, priorite, categorie, chantierId, deadline, notes }) {
  const chantierLabel = LABELS.TACHES[chantierId]

  const properties = {
    Titre:     { title: [{ text: { content: titre } }] },
    Priorité:  { select: { name: priorite || 'NORMALE' } },
    Catégorie: { select: { name: categorie || 'MEMO' } },
    Chantier:  { select: { name: chantierLabel } },
    Statut:    { select: { name: 'À faire' } },
  }

  if (deadline) {
    properties.Deadline = { date: { start: deadline } }
  }
  if (notes) {
    properties.Notes = { rich_text: [{ text: { content: notes } }] }
  }

  return notion.pages.create({ parent: { database_id: DB.TACHES }, properties })
}

// ─────────────────────────────────────────
// MAILS (base Suivi Emails)
// ─────────────────────────────────────────

/** Récupère les mails actifs du chantier (À faire, En cours, Brouillon prêt) */
async function getMails(chantierId) {
  const chantierLabel = LABELS.EMAILS[chantierId]
  return notion.databases.query({
    database_id: DB.EMAILS,
    filter: {
      and: [
        { property: 'Chantier', select: { equals: chantierLabel } },
        {
          or: [
            { property: 'Statut', select: { equals: 'À faire' } },
            { property: 'Statut', select: { equals: 'En cours' } },
            { property: 'Statut', select: { equals: 'Brouillon prêt' } },
          ],
        },
      ],
    },
    sorts: [{ timestamp: 'created_time', direction: 'descending' }],
  })
}

/** Récupère tous les mails du chantier (sans filtre statut) */
async function getAllMails(chantierId) {
  const chantierLabel = LABELS.EMAILS[chantierId]
  return notion.databases.query({
    database_id: DB.EMAILS,
    filter: { property: 'Chantier', select: { equals: chantierLabel } },
    sorts: [{ timestamp: 'created_time', direction: 'descending' }],
  })
}

/** Met à jour le statut d'un mail */
async function updateMailStatut(pageId, statut) {
  return notion.pages.update({
    page_id: pageId,
    properties: {
      Statut: { select: { name: statut } },
    },
  })
}

// ─────────────────────────────────────────
// PLANNING
// ─────────────────────────────────────────

/** Récupère les événements à venir pour un chantier */
async function getPlanning(chantierId) {
  const chantierLabel = LABELS.PLANNING[chantierId]

  const today = new Date().toISOString().slice(0, 10)

  return notion.databases.query({
    database_id: DB.PLANNING,
    filter: {
      and: [
        { property: 'Chantier', select: { equals: chantierLabel } },
        { property: 'Date', date: { on_or_after: today } },
      ],
    },
    sorts: [{ property: 'Date', direction: 'ascending' }],
  })
}

/** Crée un événement dans le planning */
async function createEvenement({ titre, date, heure, type, chantierId, intervenants, notes }) {
  const chantierLabel = LABELS.PLANNING[chantierId]

  const properties = {
    Nom:      { title: [{ text: { content: titre } }] },
    Date:     { date: { start: date } },
    Type:     { select: { name: type || 'INTERVENTION' } },
    Chantier: { select: { name: chantierLabel } },
    Statut:   { select: { name: 'Planifié' } },
  }

  if (heure)        properties.Heure        = { rich_text: [{ text: { content: heure } }] }
  if (intervenants) properties.Intervenants = { rich_text: [{ text: { content: intervenants } }] }
  if (notes)        properties.Notes        = { rich_text: [{ text: { content: notes } }] }

  return notion.pages.create({ parent: { database_id: DB.PLANNING }, properties })
}

module.exports = {
  getTaches, updateTacheStatut, createTache,
  getMails, getAllMails, updateMailStatut,
  getPlanning, createEvenement,
}
