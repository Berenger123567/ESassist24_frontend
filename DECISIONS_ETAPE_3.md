# ÉTAPE 3 — RÉPONSES AUX 20 QUESTIONS

> **Projet :** ÉLECTRO ASSIST 24H
> **Étape concernée :** Étape 3 — Centre de confiance : vérification
> **Date :** 19 novembre 2026
> **Source de vérité :** `ELECTRO_ASSIST_24H_Doc1_Plan_de_travail.docx` (§7.1, §8, §9.1, §11 É3, §12, §13)
> **Statut :** décisions proposées, à figer dans OpenAPI avant le développement des écrans A-03, A-04, A-05 et A-12.
> **Contrat de référence :** `backend@106c383` (branche `main`), récupéré depuis GitHub le 19 novembre 2026.

## Constat préalable

Aucune route É3 n'existe dans l'`openapi.json` du commit `106c383`. Le contrat s'arrête à É2 pour les parcours métier, mais inclut déjà l'authentification admin, les invitations, les demandes de droits et les documents (`/auth/*`, `/admin/auth/*`, `/admin/invitations/*`, `/me/data-requests`, `/pro/documents/*`). Les modèles `audit_logs`, `devices`, `notifications` et l'idempotence n'existent pas. Il s'agit donc de **figer le contrat É3**, pas de le lire.

Deux règles du plan commandent beaucoup de réponses :

- §9.1 : « Contraintes portées par la base de données, pas seulement par le code. »
- É3, tests : « Seul un administrateur peut faire passer un dossier à Vérifié ; refus sans motif rejeté ; chaque consultation de pièce écrit une ligne d'audit ; journal impossible à modifier. »

---

## 1. Routes É3, verbes, rôles et codes d'erreur

| Verbe | Chemin exact | Rôle | Erreurs attendues |
|---|---|---|---|
| GET | `/api/v1/admin/verifications` | A | 400 `VALIDATION_ERROR`, 401 `UNAUTHORIZED`, 403 `FORBIDDEN` / `IP_NOT_ALLOWED`, 429 `RATE_LIMITED` |
| GET | `/api/v1/admin/verifications/{id}` | A | 401, 403, 404 `NOT_FOUND` |
| GET | `/api/v1/admin/documents/{id}/view-url` | A | 401, 403, 404 `NOT_FOUND`, 409 `CONFLICT` (pièce non consultable), 429, 503 `INTERNAL_ERROR` (stockage) |
| POST | `/api/v1/admin/verifications/{id}/decision` | A | 400 `VALIDATION_ERROR`, 401, 403, 404, 409 `INVALID_STATUS_TRANSITION`, 409 `IDEMPOTENCY_CONFLICT`, 429 |
| GET | `/api/v1/admin/audit-logs` | A | 400, 401, 403 |
| POST | `/api/v1/devices` | T | 400, 401, 409 `CONFLICT` (appareil lié à un autre compte) |
| GET | `/api/v1/notifications` | T | 400, 401 |

Le seul code explicitement imposé par le document est `INVALID_STATUS_TRANSITION`. Les autres suivent le fichier `error-codes.ts` existant. Ajouter seulement trois codes : `IP_NOT_ALLOWED`, `IDEMPOTENCY_CONFLICT`, et éventuellement `DOCUMENT_NOT_AVAILABLE`. Le catalogue complet relève du Document 2, qui reste manquant.

---

## 2. File de vérification : PENDING seulement ou tous les statuts ?

**PENDING par défaut, filtres sur tous les statuts.** A-03 décrit « Dossiers en attente, filtres, ancienneté » : la file par défaut est donc PENDING. Mais l'administrateur doit pouvoir retrouver un dossier déjà traité.

Contrat proposé : `?status=PENDING` par défaut, `status` acceptant plusieurs valeurs séparées par virgule, `sort=oldest` par défaut, `cursor` + `limit` (20/50). Réponse avec `ageDays`, `slaDueAt` et `overdue` calculés par l'API. Le tri par ancienneté et l'alerte de dépassement viennent du serveur, jamais du front.

**Point bloquant :** le §13 exige, avant É3, de fixer « les délais cibles de validation d'un dossier ». Sans ce chiffre, `slaDueAt` et l'alerte ne peuvent pas être implémentés. Proposition : 48 heures ouvrées, à confirmer.

---

## 3. Décisions : ADMIN seul ou aussi EVALUATOR ?

**ADMIN uniquement.** Le catalogue É3 donne le rôle A à la route de décision, et le test de passage dit explicitement « seul un administrateur peut faire passer un dossier à Vérifié ». L'évaluateur intervient en É4 (`/evaluator/*`), sur la grille pratique, pas sur les pièces d'identité. Ne pas lui ouvrir A-04.

---

## 4. Statuts de décision : VERIFIED, REFUSED et COMPLEMENT_REQUESTED ?

**Trois valeurs de décision, mais pas un nouveau statut professionnel.**

A-04 parle bien de « Vérifié, Refusé, complément demandé », alors que la machine à états §7.1 ne connaît que PENDING → VERIFIED / REFUSED, et que l'enum Prisma `ProfessionalStatus` contient déjà `PENDING, VERIFIED, CERTIFIED, SUSPENDED, REFUSED`. Il ne faut pas inventer `COMPLEMENT_REQUESTED` dans cet enum.

Modèle recommandé :

- `decision` : `VERIFIED | REFUSED | COMPLEMENT_REQUESTED` ;
- en cas de complément, le dossier **reste PENDING** ;
- on stocke `complementRequestedAt`, `complementDueAt`, les pièces demandées et le message ;
- E-04 affiche « En attente » avec la mention « compléments demandés » ;
- quand le professionnel redépose, `submittedAt` et le compteur SLA repartent ; le temps d'attente côté professionnel ne compte pas comme retard administrateur.

Cela respecte à la fois A-04, la machine à états et l'enum existant.

---

## 5. Motif : texte libre, liste prédéfinie, ou les deux ?

**Les deux, structuré.** Un `reasonCode` obligatoire dans une liste fixe, plus un `reasonText` obligatoire pour `REFUSED` et `COMPLEMENT_REQUESTED`. Pour `VERIFIED`, le texte est facultatif.

Codes proposés, alignés sur l'enum `DocumentType` existant (`ID_CARD`, `PROFILE_PHOTO`, `DIPLOMA`, `PROFESSIONAL_CERTIFICATE`, `REFERENCE_LETTER`, `WORK_PHOTO`) :

- `DOCUMENT_MISSING`
- `DOCUMENT_UNREADABLE`
- `DOCUMENT_EXPIRED`
- `DOCUMENT_MISMATCH`
- `EXPERIENCE_INSUFFICIENT`
- `SPECIALTY_NOT_JUSTIFIED`
- `ZONE_NOT_COVERED`
- `OTHER`

Le code permet les statistiques de A-02 et les filtres ; le texte porte le détail. Pour un complément, `requestedItems[]` référence les `DocumentType` concernés et le message précise ce qui est attendu.

---

## 6. Longueur du motif de décision

Le document est muet. Proposition : **20 à 1 000 caractères**, texte brut, espaces de début et de fin supprimés, HTML refusé. L'API renvoie `400 VALIDATION_ERROR` avec `details: { min: 20, max: 1000 }`. La même règle s'applique au message de complément. À figer dans le Document 2.

---

## 7. Journalisation de la consultation d'une pièce

**À la création du lien signé, obligatoirement.** L'API ne peut pas garantir l'ouverture réelle d'une URL présignée S3 : une fois le lien émis, le fichier est servi par le stockage, hors de l'application.

- Action audit : `DOCUMENT.VIEW_LINK_ISSUED`, avec acteur, dossier, document, expiration, IP, user-agent, session.
- Si le client ou le juriste exige la preuve d'ouverture, ajouter un endpoint de redirection qui journalise `DOCUMENT.VIEWED` puis redirige vers le lien signé. C'est une route supplémentaire, à ne pas ajouter en É3 sans besoin explicite.
- Ne jamais stocker l'URL signée elle-même dans l'audit : c'est un secret temporaire.
- Journaliser aussi les refus d'accès.

---

## 8. Durée de validité du lien de consultation

**5 minutes**, plus court que les 10 minutes du téléversement É2, parce qu'une pièce d'identité est plus sensible en lecture qu'en écriture. En-têtes `Cache-Control: no-store`, lien lié au document et à la session admin.

Attention : une URL présignée n'est pas « à usage unique » par nature, elle est réutilisable pendant sa durée de vie. Si l'usage unique est exigé, il faut un jeton à usage unique servi par l'API avant redirection. Pour É3, recommandation : 5 minutes de validité, sans promesse d'usage unique.

---

## 9. Champs d'une ligne d'audit

Oui à tous les champs, avec deux réserves.

| Champ | Statut |
|---|---|
| `actorId`, `actorRole` (rôle au moment de l'action) | Obligatoire |
| `action` (`VERIFICATION.DECIDED`, `DOCUMENT.VIEW_LINK_ISSUED`…) | Obligatoire |
| `targetType`, `targetId` | Obligatoire |
| `before`, `after` (JSONB) | Obligatoire, données sensibles masquées |
| `ip`, `userAgent` | Obligatoire |
| `sessionId`, `requestId` | Obligatoire |
| `deviceId` | Facultatif |
| `result` (`SUCCESS` / `DENIED`) et `reason` | Recommandé |
| `createdAt` | Obligatoire, UTC |

Ne jamais écrire dans l'audit un numéro de pièce complet, une photo ou une URL signée. `before` / `after` doivent être des diffs redacted. L'IP et l'user-agent sont des données personnelles : leur durée de conservation est à valider avec le juriste (§9.1).

---

## 10. Garantie append-only : trigger et chaînage de hash ?

**Le trigger et les privilèges sont obligatoires ; le chaînage est recommandé, pas indispensable en É3.**

Le §9.1 est clair : les contraintes sont portées par la base, pas seulement par le code. Donc :

- rôle applicatif sans `UPDATE` ni `DELETE` sur `audit_logs` ;
- trigger `BEFORE UPDATE OR DELETE` qui lève une exception ;
- rôle de migration distinct du rôle applicatif, sinon le propriétaire peut désactiver le trigger ;
- `id BIGSERIAL` plutôt qu'UUID pour garantir un ordre d'insertion monotone.

Le chaînage `prevHash` + `hash` est une preuve de manipulation plus forte, mais il coûte cher en sérialisation. Recommandation : avant le pilote (É10), pas comme condition de passage É3. « Aucune route de modification » ne suffit pas : c'est exactement ce que §9.1 interdit.

---

## 11. Enregistrement des appareils

**Tous les champs, pas seulement l'identifiant.**

Modèle `devices` : `id`, `userId`, `deviceId` (UUID stable généré par le client), `platform` (`WEB | ANDROID | IOS`), `pushProvider` (`FCM | EXPO | WEB_PUSH`), `pushToken`, `pushSubscription` (JSON pour Web Push : endpoint, p256dh, auth), `appVersion`, `osVersion`, `locale`, `notificationsEnabled`, `lastSeenAt`, `createdAt`, `updatedAt`, `revokedAt`.

Contraintes : unique `(userId, deviceId)` ; token unique par fournisseur ; upsert idempotent sur `POST /devices`. Le modèle `Session` existant stocke déjà `ip`, `userAgent`, `clientPlatform`, `clientDeviceId` : réutiliser ces valeurs pour l'audit.

**Lacune du catalogue :** aucune route pour supprimer ou désactiver un appareil. Il faut soit ajouter `DELETE /api/v1/devices/{id}`, soit désactiver l'appareil courant à la déconnexion. À trancher maintenant, sinon les tokens morts s'accumulent.

---

## 12. Fournisseur de notifications

**Outbox en base + worker BullMQ + adaptateurs.** Ce n'est pas « un fournisseur à brancher plus tard » : l'outbox est l'architecture, le fournisseur est un détail derrière une interface.

- Mobile : FCM direct, ou Expo Push Service si le projet reste en Expo managé (il encapsule FCM et APNs).
- Web : Web Push avec clés VAPID.
- SMS et email : repli pour événements critiques uniquement, pas le canal par défaut.
- Ne pas confondre avec le canal des codes OTP (SMS/WhatsApp), qui reste une décision É1 distincte.

Le contrat front ne dépend pas du fournisseur : il enregistre `platform`, `pushProvider`, `pushToken` ou `pushSubscription`, et c'est tout.

---

## 13. Contenu des notifications

**Oui : générique, sans donnée sensible, avec un lien vers l'écran concerné.**

Titre et corps du type « Votre dossier a été mis à jour », jamais « refusé car pièce illisible », jamais un nom, un montant, une adresse ou un motif. Payload : `type`, `entityId`, `route` (deep link). Le détail est récupéré après authentification.

Les modèles de texte sont rendus côté serveur, pas dans le front, pour éviter les fuites et garder la cohérence. La liste `GET /notifications` reste disponible dans l'application, ce qui compense la fiabilité limitée des notifications navigateur (§12).

---

## 14. Échéances des rappels de pièces

**J-30, J-14, J-7 et J-1, plus J0.** Le document dit seulement « un rappel est envoyé avant échéance » ; les seuils sont donc une décision. Les rendre configurables, pas codés en dur.

Un rappel par couple `(documentId, seuil)`, avec contrainte unique pour éviter les doublons si le job rejoue. Alerter aussi l'administrateur (A-05) et afficher « pièces proches de l'expiration » sur E-04.

**Règle métier à figer :** à l'expiration, la pièce passe `EXPIRED` (`DocumentStatus` existe déjà), mais le profil **ne change pas automatiquement** de statut. La machine à états ne prévoit pas `VERIFIED → PENDING` sur expiration. C'est à l'administrateur de décider d'une demande de complément ou d'une suspension.

---

## 15. Implémentation des rappels

**BullMQ, job répétable quotidien.** Le plan impose Redis + BullMQ pour les tâches de fond, et un timer interne n'est pas sûr en multi-instance (doublons). `@nestjs/schedule` est acceptable seulement avec un verrou en base, donc autant utiliser BullMQ, déjà prévu par l'architecture.

À noter : `bullmq` et `@nestjs/bullmq` ne sont pas encore dans le `package.json` du backend, seul `ioredis` est présent. Il faut les ajouter. Un déclenchement manuel réservé aux opérations peut exister, mais il doit être journalisé et ne remplace pas le job planifié.

---

## 16. Portée de la restriction IP

**Toutes les routes de données `/admin/*`, pas seulement la vérification.** A-01 et la fiche rôle disent « accès restreint par adresse IP si la plage est connue », pas « restriction de la seule file de vérification ».

**Conflit à résoudre :** `/admin/auth/login` est partagé entre A et V (É1), et l'évaluateur doit pouvoir se connecter depuis le mobile. Si on filtre cette route par IP, on casse V-01 mobile.

Recommandation :

- filtre IP sur les routes `/admin/*` après authentification, pour le rôle ADMIN ;
- pas de filtre sur `/admin/auth/*` (déjà protégé par mot de passe, TOTP et limitation de débit) ;
- pas de filtre sur `/evaluator/*`, utilisé sur mobile ;
- si le client exige un filtre aussi à la connexion admin, créer une route de connexion admin distincte plutôt que bloquer l'évaluateur.

---

## 17. Liste globale ou par administrateur ?

**Liste globale en configuration pour la v1** : `ADMIN_IP_ALLOWLIST` en CIDR, plusieurs valeurs séparées par virgule. Pas de liste par administrateur : complexité et risque de verrouillage pour un gain faible.

Échec fermé en production ; en développement, contournement explicite et journalisé. Toute tentative refusée est auditée. Une liste par administrateur pourra venir plus tard si le besoin est réel.

---

## 18. Faire confiance à `X-Forwarded-For` ?

**Oui, mais uniquement derrière le proxy connu.** Caddy est prévu dans l'infrastructure. Il faut configurer `trust proxy` sur l'adresse ou le CIDR de Caddy, jamais `true` en aveugle, sinon n'importe quel client peut usurper son IP via l'en-tête.

Concrètement, `main.ts` ne configure rien aujourd'hui : `req.ip` renverra l'IP du conteneur Caddy, ce qui casserait à la fois la liste d'autorisation et la limitation de débit. À corriger avec `app.set('trust proxy', ...)` sur l'instance Express, en visant le réseau Docker de Caddy. Tester explicitement une requête avec un `X-Forwarded-For` forgé.

---

## 19. Quelles IP autoriser en développement, test et production ?

Le document est muet. Proposition :

| Environnement | Valeur |
|---|---|
| Développement | `127.0.0.1/32`, `::1/128`, éventuellement le LAN privé |
| Test / CI | IP de sortie du runner, ou liste vide avec `NODE_ENV=test` et avertissement explicite |
| Production | IP statiques du bureau ou du VPN, en `/32`, au moins deux personnes |

Jamais `0.0.0.0/0` en production. Les opérateurs béninois ont souvent des IP dynamiques : la solution propre est un VPN à sortie fixe (WireGuard), pas une plage large. Ces valeurs sont des emplacements à remplir dans le runbook, pas des secrets à coder.

---

## 20. Faut-il ajouter `/me/professional-profile/status` ?

**Non.** Le §8 prévoit déjà `GET /pro/profile` avec « Profil professionnel et statut » (É2). Un endpoint de statut séparé duplique la source de vérité et complique le cache.

Mais il y a un vrai problème de contrat : le backend expose aujourd'hui **trois** routes pour le même objet :

- `GET /api/v1/me/professional-profile` (« compat ») ;
- `GET,PATCH /api/v1/professionals/me` (« alias spec 8.2 ») ;
- et le plan prévoit `/api/v1/pro/profile`.

Il faut choisir une route canonique, par exemple `/pro/profile` conformément au plan, marquer les alias `deprecated: true` dans OpenAPI, et les supprimer avant É10. Le front ne doit consommer que la canonique.

Réponse E-04 : `GET /pro/profile` doit renvoyer `status`, `decidedAt`, `decisionReason`, `complement` (items, message, dates) et les pièces proches de l'expiration ; `GET /pro/documents` fournit la liste détaillée. Aucun nouvel endpoint nécessaire.

---

## Points de contrat à corriger avant de coder É3

1. **Les 7 routes É3 sont absentes** de l'`openapi.json` actuel.
2. **Triplication du profil professionnel** : choisir une route canonique, déprécier les alias.
3. **Pas d'idempotence implémentée** : table + middleware requis pour la décision.
4. **Pas de modèles** `audit_logs`, `devices`, `notifications` ; l'idempotence n'est pas implémentée. En revanche, `AdminCredential`, `AdminInvitation` et les routes TOTP existent depuis `106c383`.
5. **Pas de route de lecture des notifications** (`PATCH /notifications/{id}/read`) ni de suppression d'appareil.
6. **Préfixe `/api/v1` déjà présent dans les chemins OpenAPI** : le client généré doit être configuré avec l'origine seule, sinon on obtient `/api/v1/api/v1/...`.
7. **Délai cible de validation non fixé** : prérequis explicite du §13 pour É3.

## Décisions à figer maintenant

- Décision réservée au rôle ADMIN.
- Trois valeurs de décision, sans nouveau statut professionnel.
- Motif structuré, 20 à 1 000 caractères.
- Lien de consultation de 5 minutes, journalisé à l'émission.
- Audit append-only par privilèges et trigger.
- Appareils complets : identifiant, token, plateforme, version.
- Outbox + BullMQ + FCM / Web Push.
- Rappels J-30, J-14, J-7, J-1.
- Restriction IP globale sur les routes admin, évaluateur exempté.
- `trust proxy` limité à Caddy.
- Pas de nouvel endpoint de statut, mais une route de profil canonique.
