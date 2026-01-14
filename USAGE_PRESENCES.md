# 📋 Guide des Présences - Bot Discord

## ⚡ Commandes disponibles

### `/qui-est-la`
Affiche qui est présent aujourd'hui (en cours de journée).

### `/help-presences`
Montre toutes les commandes et comment utiliser le système.

### `/bureau` 
Marque ta présence au bureau pour aujourd'hui.

### `/absent`
Marque ton absence pour aujourd'hui.

### `/teletravail`
Marque que tu es en télétravail.

---

## 🎯 Comment ça marche

### Le message quotidien
Chaque soir à **23h45** (heure Guadeloupe), le bot poste automatiquement un message pour **demain**.

**Exemple de message :**
```
📅 Présences pour demain (Mardi 13 janvier)
──────────────────────────────
✅ Présents au bureau : 0
🏠 En télétravail : 0
❌ Absents : 0

Réagis avec :
✅ = Présent au bureau
🏠 = Télétravail
❌ = Absent
```

### Comment réagir
1. **Tu vois le message** → tu cliques sur une réaction
2. **Le bot met à jour** automatiquement le message en temps réel
3. **Chaque réaction compte** : ✅, 🏠, ou ❌

### Ce qui se passe la nuit
À 23h45, le bot :
1. ✅ Poste le message pour le lendemain
2. ✅ Remet les compteurs à zéro
3. ✅ Se schedule pour le jour suivant

---

## 🛠️ Pour les devs

### Variables d'environnement
```
PRESENCE_CHANNEL_ID=123456789  # Canal où poster les messages
```

### Si tu redémarres le bot
- Le système se relance automatiquement
- Il postera le message du jour si pas déjà fait
- Il schedule le prochain pour 23h45

### Logs à vérifier
```
📅 Scheduling daily message for [date]  # Prochaine planification
📅 Daily presence message posted         # Message posté
📅 Daily message updated                 # Mise à jour après réaction
```

---

## 📅 Workflow quotidien

**23h45** → Message pour demain est posté  
**Tout au long de la journée** → Les gens réagissent  
**En temps réel** → Le message se met à jour  
**23h45 (jour suivant)** → Nouveau message, cycle recommence

---

**Questions ?** → Ping @Marvin sur Discord
