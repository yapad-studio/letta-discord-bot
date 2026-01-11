#!/bin/bash

# Script d'enregistrement des commandes Discord globales (une par une)
# Usage: ./register-commands.sh

# Vérifie que les variables d'environnement sont définies
if [ -z "$APP_ID" ]; then
    echo "❌ Erreur: APP_ID n'est pas défini dans l'environnement"
    echo "Utilise: export APP_ID='ton_app_id'"
    exit 1
fi

if [ -z "$DISCORD_TOKEN" ]; then
    echo "❌ Erreur: DISCORD_TOKEN n'est pas défini dans l'environnement"
    echo "Utilise: export DISCORD_TOKEN='ton_token_bot'"
    exit 1
fi

# URL de l'API Discord (commandes globales)
url="https://discord.com/api/v10/applications/$APP_ID/commands"

echo "🔧 Enregistrement des commandes slash globales..."
echo "App ID: $APP_ID"
echo "Bot Token: ${DISCORD_TOKEN:0:5}***"

# Fonction pour enregistrer une commande
register_command() {
    local name="$1"
    local description="$2"
    
    # Format JSON pour UNE seule commande
    local command="{\"name\": \"$name\", \"type\": 1, \"description\": \"$description\"}"
    
    echo "📝 Enregistrement de la commande: /$name"
    
    # Envoi de la requête HTTP avec curl
    response=$(curl -s -w "\n%{http_code}" -X POST "$url" \
      -H "Authorization: Bot $DISCORD_TOKEN" \
      -H "Content-Type: application/json" \
      -d "$command")
    
    # Extraction du code HTTP
    http_code="${response##*$'\n'}"
    body="${response%$'\n'*}"
    
    # Vérification de la réponse
    if [ "$http_code" = "200" ]; then
        echo "  ✅ Commande /$name enregistrée avec succès!"
    else
        echo "  ❌ Erreur lors de l'enregistrement de /$name"
        echo "     Status: $http_code"
        echo "     Réponse: $body"
    fi
    echo ""
}

# Enregistrement des commandes une par une
register_command "bureau" "Marquer ta presence au bureau pour demain"
register_command "absent" "Marquer ton absence pour demain"
register_command "teletravail" "Marquer ton teletravail pour demain"
register_command "qui-est-la" "Afficher les presences de demain"
register_command "help-presences" "Aide pour les commandes de presence"

echo "🎉 Enregistrement des commandes terminé!"
