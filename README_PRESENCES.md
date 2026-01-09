# Système de Présences Bureau

## 🎯 Fonctionnalités

- **Message quotidien** posté chaque soir à 17h30
- **Réactions emoji** pour marquer sa présence :
  - ✅ Présent au bureau
  - ❌ Absent  
  - 🏠 Télétravail
- **Mise à jour en temps réel** du message avec les stats
- **Reset automatique** à minuit
- **Base de données JSON** pour stocker l'historique

## 🚀 Installation

1. **Configurer l'environnement** :
   ```bash
   # Ajouter dans .env
   PRESENCE_CHANNEL_ID=votre_id_de_canal
   ```

2. **Démarrer le bot** :
   ```bash
   npm run dev
   ```

## 📁 Structure

```
src/
├── services/
│   └── presences.ts      # Logique de gestion des présences
├── commands/
│   └── presences.ts      # Gestion des réactions et messages
└── server.ts             # Intégration avec le bot Discord

data/
└── presences.json        # Base de données JSON
```

## 🔧 Configuration

### Channel de présence
- Créer un channel Discord dédié (ex: `#presences-bureau`)
- Ajouter son ID dans `PRESENCE_CHANNEL_ID`

### Horaires
- Message quotidien : 17h30 (modifiable dans `DAILY_MESSAGE_TIME`)
- Reset quotidien : 00h00

## 📊 Format des données

```json
{
  "2025-01-09": {
    "user_id_1": {
      "userId": "user_id_1",
      "username": "Marvin",
      "status": "present",
      "timestamp": "2025-01-09T17:30:00.000Z"
    }
  }
}
```

## 🎮 Commandes

- Les membres réagissent simplement aux emojis
- Le bot gère automatiquement l'exclusivité (un seul choix par utilisateur)
- Stats mises à jour en temps réel

## 🔍 Développement

### Ajouter de nouveaux statuts
1. Ajouter l'emoji dans `EMOJI_STATUS_MAP`
2. Ajouter le statut dans `STATUS_EMOJI_MAP`
3. Mettre à jour `generatePresenceSummary()`

### Personnaliser le message
Modifier `generatePresenceSummary()` dans `presences.ts`
