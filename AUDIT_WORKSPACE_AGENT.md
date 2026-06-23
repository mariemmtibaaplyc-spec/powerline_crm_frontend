# Audit de Connectivité du Workspace Agent

Cet audit détaille l'état de connexion de chaque fonctionnalité de l'espace de travail agent (Workspace) avec le backend NestJS, la base de données PostgreSQL et le serveur Asterisk (AMI/WebRTC).

---

## 📊 Tableau Récapitulatif de Connectivité

| Fonctionnalité / Composant | Statut | Type de Connexion | Fichiers Sources Cibles |
| :--- | :---: | :--- | :--- |
| **Identité de l'agent** | 🟢 Connecté | Session utilisateur (`useSessionStore`/`useAuthStore`) | `agent-workspace-provider.tsx` |
| **Statut de l'agent** | 🟢 Connecté | REST API (`PATCH /agent-statuses`) & WebSockets (`agent.status.changed`) | `workspace.store.ts` & `use-workspace-socket.ts` |
| **Appels Téléphoniques** | 🟢 Connecté | REST API (`POST /calls`), WebSockets (`call.*`) & WebRTC (`SIP.js`) | `sip-phone.provider.tsx` & `agent-call-control-panel.tsx` |
| **Fiche Client (Prospect)** | 🟢 Connecté | WebSockets (`call.contact.popup` transmet le contact DB réel) | `use-workspace-socket.ts` |
| **Qualifications** | 🟢 Connecté | REST API (`GET /campaigns/:id/qualifications` & `PATCH /calls/:id/end`) | `workspace.store.ts` & `workspace.api.ts` |
| **Création de Rappels (Callbacks)** | 🟢 Connecté | REST API (`PATCH /calls/:id/end` avec payload `appointment`) | `workspace.store.ts` |
| **Création de RDV (Appointments)** | 🟢 Connecté | REST API (`PATCH /calls/:id/end` avec payload `appointment`) | `workspace.store.ts` |
| **Liste des Rappels (Lecture)** | 🔴 Simulé | Mock local (`createMockReminders()`) | `workspace.store.ts` & `reminders.mock.ts` |
| **Historique des Appels (Lecture)**| 🔴 Simulé | Mock local (`createMockHistory()`) | `workspace.store.ts` & `history.mock.ts` |

---

## 🔍 Analyse Détaillée par Module

### 1. Gestion de la Session et Identité Agent
* **Ce qui est Connecté** : Le nom, prénom, l'ID et l'extension SIP proviennent de la session de connexion réelle de l'agent (`useSessionStore` et `useAuthStore`). Lors du chargement de la page, `initFromSession` est appelé avec ces informations.
* **Ce qui est Simulé** : L'avatar/photo de l'agent et quelques statistiques décoratives globales proviennent de `MOCK_AGENT_IDENTITY`.

### 2. Gestion du Statut Agent (Disponible, Pause, Wrap-Up)
* **Ce qui est Connecté** :
  * Le passage en pause ou disponible appelle les API réelles du backend (`PATCH /agent-statuses/:id/available`, `paused`, `offline`).
  * Les statuts sont synchronisés en temps réel via le namespace WebSocket `/agents` (événement `agent.status.changed`).
  * À la connexion, l'agent est automatiquement forcé en statut `PAUSED` sur le backend pour éviter qu'il reçoive des appels prédictifs avant d'avoir cliqué sur "Reprendre".
* **Ce qui est Simulé** : Le menu "Simuler" dans la barre de contrôle permet aux développeurs de forcer artificiellement un état local (ex: Ringing, In Call) uniquement pour tester le rendu de l'interface en local.

### 3. Gestion des Appels (WebRTC & Signalisation)
* **Ce qui est Connecté** :
  * **Appel Manuel** : L'envoi du numéro appelle `POST /calls` sur le backend, qui déclenche un AMI Originate vers le canal de l'agent.
  * **Signalisation WebRTC** : Le provider `SipPhoneProvider` s'enregistre via WSS auprès d'Asterisk avec les identifiants réels récupérés via `GET /telephony/webrtc-credentials`.
  * **Décroché (Auto-Answer)** : L'UA `SIP.js` intercepte l'INVITE d'Asterisk et décroche immédiatement en arrière-plan (sans sonnerie pour le prédictif, et avec sonnerie pour le manuel via early media).
  * **Raccroché** : L'appui sur le bouton *Raccrocher* coupe la session SIP locale (`session.bye()`) et appelle l'API backend `PATCH /calls/:id/hangup` pour raccrocher le canal côté Asterisk (AMI) de manière sécurisée.

### 4. Fiche Client (Prospect)
* **Ce qui est Connecté** : Les informations affichées dans la fiche client (`client-sheet.tsx`) proviennent du contact réel associé à l'appel. À la seconde où Asterisk envoie l'appel à l'agent, le serveur backend pousse l'événement WebSocket `call.contact.popup` contenant toutes les données de la base de données.
* **Ce qui est Simulé** : La fiche est initialisée par défaut avec `DEFAULT_AGENT_PROSPECT` (un profil de test) lorsqu'aucun appel n'est actif.

### 5. Qualifications & Résultats d'Appel
* **Ce qui est Connecté** :
  * Les qualifications affichées dans le panneau sont récupérées depuis le backend via `GET /campaigns/:id/qualifications` en fonction de la campagne active de l'appel.
  * Le clic sur une qualification pour clore l'appel appelle `PATCH /calls/:id/end` avec l'ID de la qualification pour enregistrer la fin de l'appel en base de données.

### 6. Rappels, Rendez-vous et Historique (Lectures)
* **Ce qui est Simulé (En Lecture)** :
  * **Historique des appels** : L'onglet affiche de faux appels générés en mémoire via `createMockHistory()`. Il n'y a pas d'appel vers un endpoint du type `GET /calls/history` pour charger les vrais appels passés par l'agent depuis la base de données.
  * **Liste des rappels** : L'onglet affiche de faux rappels planifiés via `createMockReminders()`.
* **Ce qui est Connecté (En Écriture)** : La programmation d'un rappel (callback) ou d'un rendez-vous (appointment) depuis le formulaire de qualification envoie bien les données de date, d'heure et de note au backend via l'API `endCall`, ce qui l'enregistre en base de données.

---

## 🛠️ Recommandations pour les prochaines étapes de développement

Si vous souhaitez connecter les derniers éléments simulés :
1. **Historique réel** : Créer un endpoint `GET /calls/my-history` sur le backend pour renvoyer les appels de l'agent connecté et remplacer `createMockHistory` dans le store.
2. **Rappels réels** : Créer un endpoint `GET /appointments/my-reminders` (filtré sur les rappels planifiés de l'agent) pour alimenter la liste de gauche au lieu de `createMockReminders`.
