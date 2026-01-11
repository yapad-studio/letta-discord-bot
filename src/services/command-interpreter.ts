// src/services/command-interpreter.ts
import { OpenAIAgent } from '@letta/code';

export interface CommandResult {
  action: 'create' | 'update' | 'delete' | 'bulk_create';
  entries: PresenceEntry[];
}

export interface PresenceEntry {
  date: string;        // YYYY-MM-DD
  userId: string;
  username: string;
  status: 'present' | 'absent' | 'teletravail';
  startTime?: string;  // HH:mm
  endTime?: string;    // HH:mm
}

export class CommandInterpreter {
  private agent: OpenAIAgent;
  
  constructor() {
    this.agent = new OpenAIAgent({
      name: "Command Interpreter",
      systemPrompt: this.getSystemPrompt(),
      model: "gpt-4o-mini",
      temperature: 0.3
    });
  }
  
  private getSystemPrompt(): string {
    return `
      Tu es un expert en interprétation de commandes slash Discord.
      
      ## Tâche
      Analyser une commande slash avec ses paramètres et extraire les informations pour créer/modifier des présences.
      
      ## Format de sortie JSON attendu
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
      
      ## Règles d'interprétation
      - /bureau → status: "present"
      - /absent → status: "absent" 
      - /teletravail → status: "teletravail"
      - "à 14h30" → startTime: "14:30"
      - "de 8h à midi" → startTime: "08:00", endTime: "12:00"
      - "du lundi au vendredi" → créer 5 entrées pour chaque jour
      - "la semaine prochaine" → calculer les dates de la semaine prochaine
      
      ## Important
      - Base-toi sur la date de référence fournie pour calculer les dates futures
      - Retourne toujours des dates au format YYYY-MM-DD
      - Retourne les heures au format HH:mm (24h)
      - Si tu ne comprends pas un paramètre, demande des clarifications
    `;
  }
  
  public async interpretCommand(
    command: string,
    parameters: string[],
    user: { id: string, username: string }
  ): Promise<CommandResult> {
    // Date de référence (heure locale Guadeloupe)
    const referenceDate = getGuadeloupeDateTime();
    
    const prompt = `
      Commande slash reçue: /${command} ${parameters.join(' ')}
      Utilisateur: ${user.username} (${user.id})
      Date de référence: ${referenceDate.iso} (Guadeloupe: ${referenceDate.local})
      
      Analyse cette commande et retourne le JSON structuré pour la mise à jour des présences.
    `;
    
    const response = await this.agent.sendMessage(prompt);
    return JSON.parse(response);
  }
}

interface DateTimeInfo {
  iso: string;
  local: string;
  timezone: string;
}

function getGuadeloupeDateTime(): DateTimeInfo {
  const GUADALOUPE_OFFSET = -4; // GMT-4
  const now = new Date();
  
  // Convertir en heure Guadeloupe
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