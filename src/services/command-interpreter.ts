// src/services/command-interpreter.ts
import Letta from '@letta-ai/letta-client';

export interface CommandResult {
  action: 'create' | 'update' | 'delete' | 'bulk_create' | 'query';
  entries: PresenceEntry[];
  queryResult?: QueryResult; // Pour les commandes de lecture (qui-est-la)
}

export interface PresenceEntry {
  date: string;        // YYYY-MM-DD
  userId: string;
  username: string;
  status: 'present' | 'absent' | 'teletravail';
  startTime?: string;  // HH:mm
  endTime?: string;    // HH:mm
}

export interface QueryResult {
  summary: string;     // Texte formaté à afficher
  entries: PresenceEntry[]; // Données brutes si besoin
}

const COMMAND_SYSTEM_PROMPT = `			
  Tu es un expert en interprétation de commandes slash Discord et gestionnaire de calendrier Google Calendar.
  
  ## Tâche principale
  Analyser une commande slash avec ses paramètres, extraire les informations pour créer/modifier des présences, ou interroger les présences existantes, et synchroniser avec Google Calendar.
  
  ## Format de sortie JSON attendu
  
  POUR LES COMMANDES D'ÉCRITURE (/bureau, /absent, /teletravail):
  {
    "action": "create" | "update" | "delete" | "bulk_create",
    "entries": [
      {
        "date": "YYYY-MM-DD",
        "userId": "string",
        "username": "string", 
        "status": "present" | "absent" | "teletravail",
        "startTime": "HH:mm" | null,
        "endTime": "HH:mm" | null
      }
    ]
  }
  
  POUR LA COMMANDE DE LECTURE (/qui-est-la):
  {
    "action": "query",
    "entries": [],
    "queryResult": {
      "summary": "Texte formaté avec les présences",
      "entries": [ ... ]  // Liste détaillée si besoin
    }
  }
  
  ## Règles d'interprétation
  - /bureau [quand?] → status: "present"
  - /absent [quand?] → status: "absent" 
  - /teletravail [quand?] → status: "teletravail"
  - /qui-est-la [date?] → action: "query" + retourne les présences
  - "à 14h30" → startTime: "14:30"
  - "de 8h à midi" → startTime: "08:00", endTime: "12:00"
  - "du lundi au vendredi" → créer 5 entrées pour chaque jour
  - "la semaine prochaine" → calculer les dates de la semaine prochaine
  - "demain" → date du lendemain
  - "aujourd'hui" → date du jour
  
  ## Workflow Google Calendar
  
  POUR LES COMMANDES D'ÉCRITURE:
  1. ✅ Vérifier les événements existants dans le calendrier pour ces dates
  2. ✅ Modifier ou supprimer les événements en conflit (même nom d'utilisateur)
  3. ✅ Créer les nouveaux événements avec :
     - Titre: "[username] - [status]" (ex: "Marvin - Bureau", "Zoe - Absent")
     - Date/heure: selon les paramètres fournis
     - Description: contient l'ID Discord pour référence
  
  POUR LA COMMANDE DE LECTURE (/qui-est-la):
  1. ✅ Interroger Google Calendar pour la date demandée (ou aujourd'hui par défaut)
  2. ✅ Filtrer les événements par utilisateur si un nom est précisé
  3. ✅ Retourner un résumé formaté avec:
     - Liste des présences par personne
     - Heures de présence/absence/télétravail
     - Format clair et lisible
  
  ## Important
  - Base-toi sur la date de référence fournie pour calculer les dates futures
  - Retourne toujours des dates au format YYYY-MM-DD
  - Retourne les heures au format HH:mm (24h)
  - Si tu ne comprends pas un paramètre, demande des clarifications
  - Pense toujours à l'impact sur Google Calendar quand tu interprètes les dates/heures
  - Pour /qui-est-la sans paramètre: retourne les présences du jour actuel
  - Pour /qui-est-la avec date: retourne les présences pour cette date spécifique
`;

export async function interpretCommand(
  command: string,
  parameters: string[],
  user: { id: string, username: string }
) {
  const client = new Letta({ apiKey: process.env.LETTA_API_KEY, baseURL: process.env.LETTA_BASE_URL });
  // Date de référence (heure locale Guadeloupe)
  const referenceDate = getGuadeloupeDateTime();

  const prompt = `
    Commande slash reçue: /${command} ${parameters.join(' ')}
    Utilisateur: ${user.username} (${user.id})
    Date de référence: ${referenceDate.iso} (Guadeloupe: ${referenceDate.local})
    
    Analyse cette commande, récupère les évènements du calendrier, crée ou modifie les évènement selon la commande et retourne UNIQUEMENT le JSON structuré pour la mise à jour des présences.
  `;

  const response = await client.agents.messages.create(process.env.COMMAND_AGENT_ID!, { messages: [{ content: prompt, role: 'user' }] });

  // Parcourir tous les messages pour trouver le dernier assistant_message
  const assistantMessage = response.messages.find(msg => msg.message_type === "assistant_message");

  if (!assistantMessage) {
    console.error('❌ Erreur: Aucun assistant_message trouvé dans la réponse');
    console.error('Types de messages reçus:', response.messages.map(m => m.message_type).join(', '));
    return { action: 'error', message: 'L\'agent n\'a pas retourné de réponse valide' };
  }

  const content = (assistantMessage as any).content;

  // Convertir le contenu en string
  let textContent = '';
  if (typeof content === 'string') {
    textContent = content;
  } else if (Array.isArray(content)) {
    textContent = content
      .map(item => typeof item === 'string' ? item : (item as any).text)
      .filter(Boolean)
      .join('');
  }

  // Extraire le JSON du texte (gère les cas où l'agent ajoute du texte avant/après)
  const jsonMatch = textContent.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.error('❌ Erreur: Aucun JSON trouvé dans la réponse de l\'agent');
    console.error('Contenu reçu:', textContent);
    throw new Error(`Aucun JSON trouvé dans la réponse. L'agent a retourné: "${textContent.substring(0, 200)}..."`);
  }

  try {
    return JSON.parse(jsonMatch[0]);
  } catch (parseError: unknown) {
    console.error('❌ Erreur: Le JSON extrait est invalide');
    console.error('JSON extrait:', jsonMatch[0]);
    const errorMessage = parseError instanceof Error ? parseError.message : String(parseError);
    throw new Error(`JSON invalide extrait de la réponse: ${errorMessage}`);
  }
}

function getGuadeloupeDateTime(): { iso: string; local: string; timezone: string } {
  const GUADALOUPE_OFFSET = -4; // GMT-4
  const now = new Date();

  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const guadeloupeTime = new Date(utc + (GUADALOUPE_OFFSET * 3600000));

  return {
    iso: now.toISOString(),
    local: guadeloupeTime.toLocaleString('fr-FR', {
      timeZone: 'America/Guadeloupe',
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    }),
    timezone: 'America/Guadeloupe'
  };
}
