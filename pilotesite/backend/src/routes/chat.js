const express = require('express')
const router  = express.Router()
const axios   = require('axios')

// ─────────────────────────────────────────
// Détection de demande de document
// ─────────────────────────────────────────

const DOC_KEYWORDS = ['avenant', 'avnant', 'avenants']

function detectDocumentRequest(message, stList) {
  if (!Array.isArray(stList) || stList.length === 0) return null
  const lower = message.toLowerCase()

  if (!DOC_KEYWORDS.some(kw => lower.includes(kw))) return null

  // Cherche le ST dont le nom (ou un mot significatif du nom) apparaît dans le message
  for (const st of stList) {
    const nomLower = st.nom.toLowerCase()
    if (lower.includes(nomLower)) return { st }

    // Correspondance par mots significatifs (>3 caractères)
    const words = nomLower.split(/\s+/).filter(w => w.length > 3)
    if (words.length > 0 && words.some(w => lower.includes(w))) return { st }
  }

  // Si un seul ST dans la liste et le message contient "avenant", on l'utilise
  if (stList.length === 1) return { st: stList[0] }

  return null
}

// ─────────────────────────────────────────
// Génération HTML de l'avenant
// ─────────────────────────────────────────

function generateAvenantHTML(st) {
  const today = new Date().toLocaleDateString('fr-FR')
  return `
<div style="font-family:Arial,sans-serif;max-width:700px;margin:0 auto;padding:40px;color:#1a1a1a;">
  <div style="text-align:center;border-bottom:2px solid #1a56db;padding-bottom:20px;margin-bottom:28px;">
    <h1 style="font-size:20px;font-weight:bold;color:#1a56db;margin:0;">AVENANT AU MARCHÉ DE TRAVAUX</h1>
    <p style="color:#666;margin:6px 0 0;">N°&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;/ ${new Date().getFullYear()}</p>
  </div>
  <div style="margin-bottom:22px;">
    <h2 style="font-size:12px;font-weight:bold;text-transform:uppercase;color:#1a56db;margin-bottom:10px;border-bottom:1px solid #e5e7eb;padding-bottom:5px;">1. Identification des parties</h2>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:12px;">
        <p style="font-size:10px;font-weight:bold;color:#94a3b8;text-transform:uppercase;margin:0 0 6px;">Maître d'ouvrage</p>
        <p style="font-size:13px;font-weight:bold;margin:0 0 3px;">PiloteSite — Matis Denoual</p>
        <p style="font-size:12px;color:#64748b;margin:0;">Conducteur de travaux</p>
      </div>
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:12px;">
        <p style="font-size:10px;font-weight:bold;color:#94a3b8;text-transform:uppercase;margin:0 0 6px;">Entreprise (ST)</p>
        <p style="font-size:13px;font-weight:bold;margin:0 0 3px;">${st.nom}</p>
        ${st.siret ? `<p style="font-size:11px;color:#64748b;margin:2px 0;">SIRET : ${st.siret}</p>` : ''}
        ${st.adresse ? `<p style="font-size:11px;color:#64748b;margin:2px 0;">${st.adresse}</p>` : ''}
        ${st.contact ? `<p style="font-size:11px;color:#64748b;margin:2px 0;">Contact : ${st.contact}</p>` : ''}
        ${st.telephone ? `<p style="font-size:11px;color:#64748b;margin:2px 0;">Tél. : ${st.telephone}</p>` : ''}
      </div>
    </div>
  </div>
  <div style="margin-bottom:22px;">
    <h2 style="font-size:12px;font-weight:bold;text-transform:uppercase;color:#1a56db;margin-bottom:10px;border-bottom:1px solid #e5e7eb;padding-bottom:5px;">2. Objet de l'avenant</h2>
    <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:6px;padding:9px 12px;margin-bottom:8px;">
      <p style="font-size:11px;color:#92400e;margin:0;font-style:italic;">⚠ À compléter avant signature</p>
    </div>
    <div style="border:1px dashed #cbd5e1;border-radius:6px;padding:14px;min-height:56px;">
      <p style="color:#94a3b8;font-style:italic;font-size:13px;margin:0;">[ Description des travaux supplémentaires — lot : ${st.lot || '___'} ]</p>
    </div>
  </div>
  <div style="margin-bottom:22px;">
    <h2 style="font-size:12px;font-weight:bold;text-transform:uppercase;color:#1a56db;margin-bottom:10px;border-bottom:1px solid #e5e7eb;padding-bottom:5px;">3. Incidence financière</h2>
    <table style="width:100%;border-collapse:collapse;font-size:12px;">
      <thead>
        <tr style="background:#1a56db;color:white;">
          <th style="padding:8px 12px;text-align:left;">Désignation</th>
          <th style="padding:8px 12px;text-align:right;">Montant HT</th>
          <th style="padding:8px 12px;text-align:right;">TVA 20%</th>
          <th style="padding:8px 12px;text-align:right;">Montant TTC</th>
        </tr>
      </thead>
      <tbody>
        <tr style="border-bottom:1px solid #e2e8f0;">
          <td style="padding:10px 12px;color:#94a3b8;font-style:italic;">[ Travaux — ${st.lot || 'à préciser'} ]</td>
          <td style="padding:10px 12px;text-align:right;color:#94a3b8;">___ €</td>
          <td style="padding:10px 12px;text-align:right;color:#94a3b8;">___ €</td>
          <td style="padding:10px 12px;text-align:right;color:#94a3b8;">___ €</td>
        </tr>
      </tbody>
      <tfoot>
        <tr style="background:#f8fafc;font-weight:bold;">
          <td style="padding:10px 12px;">Total avenant</td>
          <td style="padding:10px 12px;text-align:right;">___ € HT</td>
          <td style="padding:10px 12px;"></td>
          <td style="padding:10px 12px;text-align:right;">___ € TTC</td>
        </tr>
      </tfoot>
    </table>
  </div>
  <div style="margin-bottom:22px;">
    <h2 style="font-size:12px;font-weight:bold;text-transform:uppercase;color:#1a56db;margin-bottom:10px;border-bottom:1px solid #e5e7eb;padding-bottom:5px;">4. Délai d'exécution</h2>
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:12px;font-size:12px;">
      <p style="margin:0;">Durée supplémentaire : <span style="color:#94a3b8;font-style:italic;">___ jours ouvrés</span></p>
      <p style="margin:5px 0 0;">Nouvelle date de fin prévisionnelle : <span style="color:#94a3b8;font-style:italic;">___ / ___ / ___</span></p>
    </div>
  </div>
  <div>
    <h2 style="font-size:12px;font-weight:bold;text-transform:uppercase;color:#1a56db;margin-bottom:14px;border-bottom:1px solid #e5e7eb;padding-bottom:5px;">5. Signatures</h2>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:40px;">
      <div>
        <p style="font-size:12px;font-weight:bold;margin-bottom:5px;">Le Maître d'ouvrage</p>
        <p style="font-size:11px;color:#64748b;">Fait à __________, le ${today}</p>
        <div style="border-bottom:1px solid #cbd5e1;margin-top:60px;width:85%;"></div>
        <p style="font-size:11px;color:#64748b;margin-top:4px;">Matis Denoual — CDT</p>
      </div>
      <div>
        <p style="font-size:12px;font-weight:bold;margin-bottom:5px;">L'Entreprise</p>
        <p style="font-size:11px;color:#64748b;">Fait à __________, le ${today}</p>
        <div style="border-bottom:1px solid #cbd5e1;margin-top:60px;width:85%;"></div>
        <p style="font-size:11px;color:#64748b;margin-top:4px;">${st.contact || st.nom}</p>
      </div>
    </div>
  </div>
</div>`
}

// ─────────────────────────────────────────
// POST /api/chat
// ─────────────────────────────────────────

router.post('/', async (req, res) => {
  try {
    const { message, chantierId, stList, currentDoc } = req.body

    // 1. Détection avenant avant d'appeler n8n
    const docRequest = detectDocumentRequest(message || '', stList || [])
    if (docRequest) {
      const html = generateAvenantHTML(docRequest.st)
      return res.json({
        response: `J'ai généré l'avenant pour ${docRequest.st.nom}. Vérifiez les informations et cliquez sur "Valider & stocker" pour l'enregistrer dans son dossier.`,
        document: {
          type: 'avenant',
          title: `Avenant — ${docRequest.st.nom}`,
          html,
          stId: docRequest.st.id,
          stNom: docRequest.st.nom,
        },
      })
    }

    // 2. Modification de document ouvert → passe via n8n avec le contexte
    if (currentDoc && process.env.N8N_WEBHOOK_URL) {
      try {
        const n8nRes = await axios.post(process.env.N8N_WEBHOOK_URL, {
          action: 'modifier_document',
          message,
          chantierId,
          currentDoc,
        }, { timeout: 30000 })

        const docHtml = n8nRes.data?.html
        if (docHtml) {
          return res.json({
            response: 'Document mis à jour selon tes instructions.',
            document: {
              type: currentDoc.type || 'avenant',
              title: currentDoc.title || 'Document',
              html: docHtml,
              stId: currentDoc.stId,
              stNom: currentDoc.stNom,
            },
          })
        }
      } catch {
        // n8n indisponible → on continue avec message standard
      }
    }

    // 3. Appel n8n standard
    if (!process.env.N8N_WEBHOOK_URL) {
      return res.json({
        response: 'Chat IA non connecté à n8n. Pour générer un avenant ST, utilise le bouton "+ Avenant" directement sur la fiche du sous-traitant.',
      })
    }

    const n8nResponse = await axios.post(process.env.N8N_WEBHOOK_URL, {
      action: 'chat',
      message,
      chantierId,
    }, { timeout: 30000 })

    res.json({ response: n8nResponse.data?.response || "Message transmis à l'agent." })
  } catch {
    res.json({ response: "Agent temporairement indisponible. Réessaie dans un instant." })
  }
})

module.exports = router
