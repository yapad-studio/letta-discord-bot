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
    
    Analyse cette commande, récupère les évènements depuis google calendar avec get_events, et crée ou modifie l'évènement selon la commande. Réponds UNIQUEMENT le JSON structuré pour la mise à jour des présences.
  `;

  // Retry logic for API validation errors (e.g., finish_reason null)
  const maxRetries = 2;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await client.agents.messages.create(process.env.COMMAND_AGENT_ID!, { messages: [{ content: prompt, role: 'user' }], streaming: false });

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
        throw new Error(`Aucun JSON trouvé dans la réponse. L'agent a retourné: \"${textContent.substring(0, 200)}...\"`);
      }

      try {
        return JSON.parse(jsonMatch[0]);
      } catch (parseError: unknown) {
        console.error('❌ Erreur: Le JSON extrait est invalide');
        console.error('JSON extrait:', jsonMatch[0]);
        const errorMessage = parseError instanceof Error ? parseError.message : String(parseError);
        throw new Error(`JSON invalide extrait de la réponse: ${errorMessage}`);
      }
    } catch (error: any) {
      const isValidationError = error?.status === 400 && error?.error?.detail?.includes('finish_reason');
      if (isValidationError && attempt < maxRetries) {
        console.warn(`⚠️  API validation error (attempt ${attempt}/${maxRetries}), retrying...`);
        continue;
      }
      console.error('❌ Erreur API Letta:', error);
      return { action: 'error', message: 'L\'agent n\'a pas pu répondre, réessaye plus tard' };
    }
  }

  // Should never reach here, but fallback just in case
  return { action: 'error', message: 'L\'agent n\'a pas pu répondre après plusieurs tentatives' };
}

function getGuadeloupeDateTime(): { iso: string; local: string; timezone: string } {
  const now = new Date();
  return {
    iso: now.toISOString(),
    local: now.toLocaleString('fr-FR', {
      timeZone: 'America/Guadeloupe',
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    }),
    timezone: 'America/Guadeloupe'
  };
}
