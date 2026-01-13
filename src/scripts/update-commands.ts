// src/scripts/update-commands.ts
import { REST, Routes } from 'discord.js';

const commands = [
  {
    name: 'bureau',
    description: 'Présent au bureau (avec option temps)',
    options: [
      {
        name: 'temps',
        type: 3,
        description: 'Ex: "de 9h à 17h", "à 14h30", "toute la journée"',
        required: false
      }
    ]
  },
  {
    name: 'absent',
    description: 'Absent (avec option temps)',
    options: [
      {
        name: 'temps',
        type: 3,
        description: 'Ex: "demain de 10 à 12", "toute la journée"',
        required: false
      }
    ]
  },
  {
    name: 'teletravail',
    description: 'En télétravail (avec option temps)',
    options: [
      {
        name: 'temps',
        type: 3,
        description: 'Ex: "de 14h à 18h", "après-midi"',
        required: false
      }
    ]
  },
  {
    name: 'qui-est-la',
    description: 'Afficher qui est présent (avec option date)',
    options: [
      {
        name: 'date',
        type: 3,
        description: 'Ex: "demain", "lundi", "la semaine prochaine"',
        required: false
      }
    ]
  },
  {
    name: 'help-presences',
    description: 'Afficher l\'aide des commandes de présence'
  }
];

async function updateCommands() {
  // Load environment variables
  require('dotenv').config();

  const token = process.env.DISCORD_TOKEN;
  const clientId = process.env.APP_ID; // Use APP_ID instead of DISCORD_CLIENT_ID

  if (!token) {
    console.error('❌ DISCORD_TOKEN non défini dans le .env');
    return;
  }

  if (!clientId) {
    console.error('❌ APP_ID non défini dans le .env');
    return;
  }

  const rest = new REST({ version: '10' }).setToken(token);

  try {
    console.log('🔄 Mise à jour des commandes slash...');
    console.log('Token:', token ? 'Set' : 'Not set');
    console.log('Client ID:', clientId);

    await rest.put(
      Routes.applicationCommands(clientId),
      { body: commands }
    );

    console.log('✅ Commandes slash mises à jour avec succès !');
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour des commandes:', error);
  }
}

updateCommands();
