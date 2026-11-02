# OpenQuota

**Ton quota Claude, toujours sous les yeux.** OpenQuota est un mod pour Claude qui affiche en direct combien de ton quota d'utilisation tu as consommé — pour la session de 5 heures et pour la semaine — juste au-dessus de la zone où tu tapes ton message. Plus besoin d'aller dans *Paramètres → Utilisation* pour savoir où tu en es.

```
Session 5 h  █████████░░░  74 %  ↻ 1 h 20     Semaine  █████░░░░░░░  41 %  ↻ 3 j 4 h     [Réduire]
```

---

## ✨ Ce que ça fait

| Où | Ce que tu vois |
| --- | --- |
| **Sur ordinateur** (appli de bureau, terminal) | Une bande au-dessus de la zone de saisie avec deux barres colorées : **Session 5 h** et **Semaine**, le pourcentage utilisé et le temps avant réinitialisation. |
| **Sur mobile** (appli Claude iOS / Android) | Une ligne d'état collée à la zone de saisie : `Quota · 5 h 74 % (↻ 1 h 20) · Sem. 41 % (↻ 3 j 4 h)` |
| **Partout** | La commande **`/quota`** affiche le détail complet. |

- 🟢 **Vert** sous 60 % · 🟠 **Orange** de 60 à 85 % · 🔴 **Rouge** au-delà de 85 %
- Un bouton **Réduire** ramène la bande à une seule ligne discrète (ton choix est retenu).
- La mise à jour est automatique après chaque réponse de Claude, et dès qu'une fenêtre de quota bouge d'un point.

## 🔒 Confidentialité

OpenQuota **n'envoie rien nulle part**. Il ne fait aucune requête réseau : il lit uniquement les chiffres de quota que Claude reçoit déjà avec chaque réponse — les mêmes que la page *Paramètres → Utilisation*, en plus précis (au dixième de pourcent). Aucune donnée personnelle, aucun pistage. Le code fait moins de 200 lignes et se lit en quelques minutes : [`hooks/register.tsx`](hooks/register.tsx).

## 📦 Installation

### Dans l'appli Claude (ordinateur, web ou mobile)

Le plus simple : télécharge le fichier [**`openquota.plugin`**](https://github.com/DA-Crea/OpenQuota/raw/main/openquota.plugin) (bouton *Download raw file* sur la page du fichier), glisse-le dans une conversation avec Claude, puis clique sur **Save plugin** et **Continue**. Le mod est alors enregistré sur ton compte et toujours actif.

### Dans l'appli de bureau

Clique sur **+** à côté de la zone de saisie, puis **Plugins** → **Add marketplace** et entre :

```
DA-Crea/OpenQuota
```

puis **Add plugin** → **openquota**.

### Dans un terminal (Claude Code)

À l'invite d'une session :

```
/plugin install openquota --marketplace DA-Crea/OpenQuota
```

Ou depuis un shell :

```
claude plugin install openquota --marketplace DA-Crea/OpenQuota
```

Réponds `y` pour ajouter la marketplace, puis choisis la portée **user** (Entrée) : OpenQuota sera actif dans toutes tes prochaines sessions.

## ❓ Questions fréquentes

**La bande dit « envoie un message pour le charger ».**
C'est normal au tout début d'une conversation : les chiffres arrivent avec la première réponse de Claude.

**Je ne vois rien du tout.**
Le quota n'existe qu'avec un abonnement **Pro** ou **Max**. Avec une clé API ou une offre sans limite de session, il n'y a pas de quota à afficher.

**Pourquoi pas de bande sur mobile ?**
L'appli mobile ne dessine pas encore d'élément au-dessus de la zone de saisie pour les mods. OpenQuota utilise donc la ligne d'état, qui est l'emplacement le plus proche disponible.

**Les chiffres diffèrent un peu de la page Utilisation.**
La page Utilisation arrondit ; OpenQuota affiche la valeur exacte reçue.

## 🛠️ Pour les curieux

```
openquota/
├── .claude-plugin/
│   ├── plugin.json        ← fiche d'identité du mod
│   └── marketplace.json   ← permet l'installation en une ligne
├── hooks/
│   ├── hooks.json
│   └── register.tsx       ← tout le code du mod
├── types/index.d.ts       ← types de l'état retenu
└── tests/quota.test.tsx   ← tests
```

Vérifier et tester : `claude plugin validate .` puis `claude plugin test .`

---

## 🇬🇧 In English

**OpenQuota** shows your Claude usage quota — the 5-hour session window and the weekly window — right above the prompt box on desktop, and in the status line next to the prompt on mobile. Type `/quota` anywhere for details. It makes no network requests: it only reads the rate-limit figures Claude already receives with each reply.

Install: `/plugin install openquota --marketplace DA-Crea/OpenQuota`

## Licence

[MIT](LICENSE) © 2026 DA-Crea
