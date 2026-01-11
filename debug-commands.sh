#!/bin/bash

# Script de debug pour comprendre l'erreur
if [ -z "$APP_ID" ] || [ -z "$DISCORD_TOKEN" ] || [ -z "$GUILD_ID" ]; then
    echo "❌ Variables d'environnement manquantes"
    exit 1
fi

# Test 1 : Vérifier que le bot peut accéder au serveur
echo "🔍 Test 1 : Vérification accès serveur..."
response=$(curl -s -w "\n%{http_code}" -X GET "https://discord.com/api/v10/guilds/$GUILD_ID" \
  -H "Authorization: Bot $DISCORD_TOKEN")

http_code="${response##*$'\n'}"
body="${response%$'\n'*}"

echo "Status: $http_code"
if [ "$http_code" = "200" ]; then
    echo "✅ Le bot peut accéder au serveur"
    echo "Nom du serveur: $(echo "$body" | jq -r '.name')"
else
    echo "❌ Le bot ne peut PAS accéder au serveur"
    echo "Réponse: $body"
fi

echo ""
echo "🔍 Test 2 : Vérification membre bot..."
response=$(curl -s -w "\n%{http_code}" -X GET "https://discord.com/api/v10/guilds/$GUILD_ID/members/$APP_ID" \
  -H "Authorization: Bot $DISCORD_TOKEN")

http_code="${response##*$'\n'}"
body="${response%$'\n'*}"

echo "Status: $http_code"
if [ "$http_code" = "200" ]; then
    echo "✅ Le bot est bien membre du serveur"
    echo "Rôles: $(echo "$body" | jq -r '.roles[]')"
else
    echo "❌ Le bot n'est PAS membre du serveur"
    echo "Réponse: $body"
fi

echo ""
echo "🔍 Test 3 : Vérification permissions bot..."
response=$(curl -s -w "\n%{http_code}" -X GET "https://discord.com/api/v10/guilds/$GUILD_ID/members/$APP_ID" \
  -H "Authorization: Bot $DISCORD_TOKEN")

http_code="${response##*$'\n'}"
body="${response%$'\n'*}"

if [ "$http_code" = "200" ]; then
    echo "Permissions (si disponibles):"
    echo "$body" | jq '.permissions // "Non disponible"'
fi

echo ""
echo "🔍 Test 4 : Tentative d'enregistrement (erreur complète)..."
commands='[
  {
    "name": "bureau",
    "description": "Marquer ta présence au bureau pour demain"
  }
]'

response=$(curl -s -w "\n%{http_code}" -X POST "https://discord.com/api/v10/applications/$APP_ID/guilds/$GUILD_ID/commands" \
  -H "Authorization: Bot $DISCORD_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$commands")

http_code="${response##*$'\n'}"
body="${response%$'\n'*}"

echo "Status: $http_code"
echo "Réponse complète: $body"
