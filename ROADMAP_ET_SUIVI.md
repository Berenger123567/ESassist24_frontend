# Suivi du Projet ÉLECTRO ASSIST 24H (Mobile Flutter & Web React)

> **Dernière mise à jour :** 17 novembre 2026 — Mobile v1 complété (COM/CLI/PRO/EVA), tests automatisés, VEN hors périmètre v1  
> **Source de vérité :** `ELECTRO_ASSIST_24H_Specifications_front_back_v1.docx` & Cahier de cadrage  
> **Méthodologie :** Respect strict des normes (Tokens imposés Section 12, WCAG 2.2 AA, États sémantiques, Fiches écrans COM / CLI / PRO / EVA / VEN / ADM).

---

## 📌 1. Vue d'ensemble du périmètre Frontend

L'objectif est de développer le Frontend complet en deux grandes étapes :
1. **Étape 1 : Application Mobile Flutter** (Android / iOS)
   - Emplacement : `mobile_app/`
   - Gestionnaire d'état : **Riverpod**
   - Navigation : **GoRouter**
   - Parcours complets :
     - **Commun (COM)** : Accueil, Auth OTP, Création de compte multi-rôle
     - **Client (CLI)** : Déclaration de panne, liste artisans, mission, devis, checklist, Mobile Money, avis 5 critères
     - **Électricien (PRO)** : Dossier CIP/diplômes, missions, code arrivée client, devis chiffré, checklist 6 points, solde net
     - **Évaluateur Technique (EVA)** : Tableau d'évaluation, grille terrain C15-100 & VAT éliminatoire, PV officiel
     - **Vendeur / Quincaillerie (VEN)** : Espace magasin, catalogue matériel certifié, commandes chantiers, code PIN de remise
2. **Étape 2 : Espace Administrateur Web React**
   - Emplacement : `web_admin/` (prévu après la finalisation mobile)
   - Stack : React + TypeScript + Vite + react-admin / Refine
   - Fiches : **ADM-01 à ADM-14**

---

## 📊 2. Tableau de Bord d'Avancement Global

| Statut | Signification |
| :---: | :--- |
| ✅ | **Fait & Validé (0 erreur d'analyse - `dart analyze`)** |
| 🔄 | **En cours d'intégration** |
| ⏳ | **À faire (Planifié)** |

---

## 📋 3. Détail par Module et Fiche d'Écran

### Phase 0 : Socle Commun & Charte Visuelle Imposée ✅
- [x] **Couleurs officielles (Section 12 Table 89)** :
  - Bleu nuit (principale) : `#0B2545`
  - Jaune électrique (accent) : `#F2B705`
  - Fond clair : `#F4F6F8`
  - Texte : `#1B1B1B`
  - États : Succès `#1E8E5A`, Alerte `#C62828`, Avertissement `#E08A00`
- [x] **Badges & Niveaux (Section 12 Table 90)** :
  - En attente `#E08A00`, Vérifié `#1565C0`, Certifié ÉLECTRO ASSIST `#1E8E5A`, Suspendu `#C62828`
  - Niveaux : Bronze `#B87333`, Argent `#9CA3AF`, Or `#D4A017`, Platine `#5B6C7D`
- [x] **Typographie (Section 12.3)** : Poppins (Titres), Inter (Texte courant).
- [x] **Composants (Section 12.3)** : Boutons 48dp (coins arrondis 12dp), Cartes (coins arrondis 16dp).

---

### Phase 1 : Parcours Commun & Authentification (COM) ✅
- [x] **COM-01 — Bienvenue** (`welcome_screen.dart` : promesse officielle imposée, logo, liens conditions & confidentialité, redirection automatique si session restaurée).
- [x] **COM-02 — Saisie du téléphone** (`phone_input_screen.dart` : indicatif `+229`, validation 8 à 10 chiffres, choix SMS ou WhatsApp, case d'acceptation obligatoire, bouton bloqué sans consentement).
- [x] **COM-03 — Saisie du code OTP** (`otp_verification_screen.dart` : code à 6 chiffres, compte à rebours 5 min [300s], décompte des 3 essais max, code de démonstration `123456` visible uniquement en debug).
- [x] **COM-04 — Création du compte** (`create_account_screen.dart` : nom, prénom, commune au Bénin, rôles Client et Électricien ; les rôles Évaluateur et Administrateur sont créés sur invitation uniquement).
- [x] **COM-05 — Notifications** (`notifications_screen.dart` : liste, indicateur non-lu, marquage lu, navigation vers la mission concernée).
- [x] **COM-06 — Messagerie (liste)** (`conversations_screen.dart` : conversations par mission, compteur de messages non lus).
- [x] **COM-07 — Messagerie (conversation)** (`conversation_screen.dart` : bulles, envoi, horodatage, marquage lu).
- [x] **COM-08 — Profil & paramètres** (`profile_settings_screen.dart` : identité, consentements, droits APDP, textes légaux, déconnexion).
- [x] **Session persistée** (`session_storage.dart` : `flutter_secure_storage`, restauration au lancement, effacement à la déconnexion, aucun jeton stocké à ce stade).

---

### Phase 2 : Parcours Client (CLI) ✅
- [x] **CLI-01 — Accueil client Map-First** (`client_map_home_screen.dart` : carte vectorielle Cotonou, 7 états FSM [idle→declaringFault→selectPro→waitingConfirmation→proEnRoute→quoteReview→completed], radar pulsé, véhicule animé, code PIN 4821, devis FCFA, avis 5 critères).
- [x] **CLI-01b — Accueil classique** (`home_screen.dart` : bouton principal → `/client/map`, grille spécialités, garantie commerciale).
- [x] **CLI-02 — Déclarer une panne** (`create_request_screen.dart` : les 5 spécialités officielles Table 87 avec `BUILDING_REPAIR` présélectionné, 3 niveaux d'urgence [Urgent, Aujourd'hui, Planifié], description 10-1000 car., photos 1 à 3).
- [x] **CLI-03 — Professionnels à proximité** (`electricians_list_screen.dart` : tri par note/distance, badges Vérifié/Certifié, délai estimé).
- [x] **CLI-04 — Profil public d'un électricien** (`electrician_detail_screen.dart` : mention légale du badge interne, décomposition des notes, avis récents).
- [x] **CLI-05 — Attente d'acceptation** (`waiting_acceptance_screen.dart` : compte à rebours de réponse de l'artisan, bouton annulation, acceptation).
- [x] **CLI-06 — Suivi de mission en direct** (`mission_tracking_screen.dart` : frise des 6 étapes [Acceptée, Arrivée, Devis, Travaux, Terminée, Clôturée], **code de mission à 4 chiffres à donner à l'arrivée (`4821`)**, carte artisan).
- [x] **CLI-07 — Devis chiffré** (`quote_screen.dart` : lignes main-d'œuvre & fournitures, validité 24h, boutons Accepter/Refuser, règle des travaux autorisés).
- [x] **CLI-08 — Compte rendu & réception** (`completion_receipt_screen.dart` : photos avant/après, checklist sécurité, mention légale de non-renonciation aux droits).
- [x] **CLI-09 — Paiement Mobile Money** (`payment_screen.dart` : MTN MoMo, Moov Money, Celtiis Cash, simulation push USSD, reçu numérique).
- [x] **CLI-10 — Avis post-mission** (`review_screen.dart` : notation des 5 critères officiels pondérés [Qualité 30%, Sécurité 20%, Délais 20%, Devis 15%, Comportement 15%], favoris).
- [x] **CLI-13 — Signaler un problème** (`report_claim_screen.dart` : les 6 motifs officiels Table 88, dossier #REC-2026).
- [x] **CLI-11 — Mes missions** (`my_missions_screen.dart` : filtres Toutes / En cours / Terminées / En litige, montants FCFA, accès au suivi).
- [x] **CLI-12 — Mes favoris** (`favorites_screen.dart` + `favorites_provider.dart` : ajout/retrait depuis la fiche professionnel, liste dédiée, état vide).
- [x] **CLI-14 — Réclamations & garantie** (`warranty_claims_screen.dart` : garantie commerciale 30 jours, exclusions, suivi des dossiers, assistance et demande de prise en charge).

---

### Phase 3 : Parcours Électricien Professionnel (PRO) ✅
- [x] **PRO-01 — Constitution du dossier** (`pro_dossier_screen.dart` : CIP, diplômes, photos, zones d'intervention, spécialités, mention frais d'examen).
- [x] **PRO-02 — Statut du dossier** (`pro_status_screen.dart` : badge Vérifié, contrôle des pièces, état évaluation pratique, règle d'admission stricte).
- [x] **PRO-03 — Tableau de bord artisan Map-First** (`pro_map_home_screen.dart` : carte vectorielle Cotonou, 7 états FSM [idle→requestIncoming→enRoute→onSite→executing→quoting→completed], toggle disponibilité, pavé PIN 4821, checklist 6 points éliminatoires, devis contradictoire, gains nets MTN MoMo).
- [x] **PRO-03b — Accueil classique** (`home_screen.dart` : bouton → `/pro/map`, dossier de conformité).
- [x] **PRO-05 & PRO-06 — Demandes reçues & Détail** (`pro_requests_screen.dart` : urgence, zone approximative, acceptation avec révélation d'adresse / refus).
- [x] **PRO-07 — Mission en cours & Code d'arrivée** (`pro_mission_active_screen.dart` : "Je pars", **saisie et validation du code client à 4 chiffres à l'arrivée (`4821`)**, étapes d'exécution).
- [x] **PRO-08 — Établissement du devis** (`pro_quote_create_screen.dart` : ajout dynamique de lignes main-d'œuvre/fournitures, total automatique en FCFA, soumission).
- [x] **PRO-09 — Compte rendu & Checklist de sécurité** (`pro_checklist_screen.dart` : les 6 points de contrôle Section 5, absence de tension critique, mesure résistance terre en Ohms, mention CONTRELEC).
- [x] **PRO-10 — Revenus et paiements** (`pro_earnings_screen.dart` : net encaissé, prélèvement commission 10%, historique des règlements).
- [x] **PRO-04 — Profil professionnel** (`pro_profile_screen.dart` : identité, expérience déclarée, spécialités vérifiées, zones d'intervention, réalisations, rappel de confidentialité).
- [x] **PRO-11 — Avis reçus** (`pro_reviews_screen.dart` : note globale, avis authentifiés, droit de réponse, contestation transmise à la modération).
- [x] **PRO-12 — Niveau et progression** (`pro_level_screen.dart` : niveau Or, critères du niveau Platine, avantages, avertissement sur les seuils indicatifs).
- [x] **PRO-13 — Abonnement** (`pro_subscription_screen.dart` : formule Pro / Premium, changement, arrêt du renouvellement, mention Mobile Money).
- [x] **PRO-14 — Suspension & recours** (`pro_suspension_screen.dart` : motif et durée de la suspension, suivi du recours, dépôt d'un recours motivé).

---

### Phase 4 : Parcours Évaluateur Technique (EVA) ✅
- [x] **EVA-01 — Mes évaluations** (`evaluator_dashboard_screen.dart` : liste des électriciens candidats assignés par zone, statut À planifier/Validé, accréditation).
- [x] **EVA-02 — Grille d'évaluation pratique** (`evaluation_grid_screen.dart` : critères éliminatoires [Consignation, VAT], équilibrage tableau, protections modulaires, mesure résistance boucle de terre en Ohms $\Omega$, recommandation badge Certifié ÉLECTRO ASSIST).
- [x] **EVA-03 — Historique des évaluations** (`evaluation_history_screen.dart` : procès-verbaux validés, détails par critère, téléchargement du PV officiel signé).

---

### Phase 5 : Parcours Vendeur / Quincaillerie (VEN) — hors périmètre v1
> Conservé pour démonstration : la spécification v1 couvre les parcours COM, CLI, PRO et EVA.
> L'accès à cet espace reste disponible uniquement via le raccourci de debug de l'écran de bienvenue.
- [x] **VEN-01 — Espace Magasin & Dashboard** (`vendor_dashboard_screen.dart` : profil quincaillerie [IFU, RCCM, Akpakpa Cotonou], indicateurs ventes FCFA, commandes du jour).
- [x] **VEN-02 — Catalogue Matériel Électrique** (`vendor_catalog_screen.dart` : protections Legrand/Schneider, câbles cuivre TH, piquets de terre, prises IP55, inverseurs de source, stocks et prix FCFA).
- [x] **VEN-03 — Commandes de Fournitures de Chantiers** (`vendor_orders_screen.dart` : commandes passées par les électriciens certifiés pour leurs interventions en cours).
- [x] **VEN-04 — Détail Commande & Validation Retrait** (`vendor_order_detail_screen.dart` : contrôle des pièces commandées, validation par saisie du code PIN de retrait à 4 chiffres, déblocage des fonds marchands et émission du bon de livraison BL).

---

### Phase 6 : Espace Web Administrateur React (ADM) ⏳
- [⏳] **ADM-01 à ADM-14 — Centre de confiance, audit, validation des pièces, litiges**.

---

## 🎯 4. Contrôle Qualité Actuel

### Analyse statique et formatage
- `flutter analyze` : **No issues found!**
- `dart format lib test` : appliqué sur l'ensemble du code (76 fichiers).

### Tests automatisés (`flutter test`) — 27 tests, tous verts
- `test/features/auth/auth_notifier_test.dart` : validation du numéro (vide, 7 chiffres, 11 chiffres, valide), OTP (code incomplet, code erroné, verrouillage à 3 essais, réinitialisation, code de démo), restauration de session, mise à jour du profil, déconnexion.
- `test/widget_test.dart` : parcours COM-01 → COM-02 (« Continuer » ouvre la saisie du téléphone).
- `test/screens/new_screens_smoke_test.dart` : rendu des 12 écrans ajoutés sur un petit téléphone (320 × 568 dp), sans débordement.

### Corrections de qualité apportées
- Session persistée via `flutter_secure_storage` (Keystore / Keychain), restauration au lancement, effacement à la déconnexion.
- OTP : code de démonstration `123456` accepté tant que le backend n'est pas branché, 3 essais gérés dans le provider, indice visible uniquement en mode debug.
- Rôles à l'inscription limités à Client / Électricien (COM-04) ; évaluateur et vendeur accessibles en debug.
- Contrastes WCAG 2.2 AA : `accentDark` `#C79500` → `#8A6100` (5,5:1), étoiles de notation et textes porteurs d'information ajustés.
- Zones tactiles de 48 dp minimum pour les liens légaux et les actions secondaires.
- Débordements corrigés : `AppButton` (libellé sur plusieurs lignes), cartes missions, favoris, réclamations, avis pro, `ListTile` dans `profile_settings_screen.dart`.
- IDs de mission propagés (`completion_receipt_screen.dart`, `mission_tracking_screen.dart`), formatage FCFA centralisé (`AppFormatters`), identifiants de demande via `uuid`.
- Libellés d'application Android / iOS : « ÉLECTRO ASSIST 24H ».

---

## 🔜 5. Prochaines Étapes

| Priorité | Tâche | Périmètre |
|:---:|:---|:---|
| 🔥 1 | **Backend NestJS** : API REST, OTP SMS/WhatsApp, missions, devis, paiements Mobile Money, notifications | `backend/` |
| 🔥 2 | **Branchement du client API mobile** : remplacer les données simulées, stockage des jetons, gestion des erreurs réseau | `mobile_app/lib/core/api/` |
| 3 | **Web Admin React** (ADM-01 à ADM-14) : centre de confiance, validation des pièces, litiges, suspensons | `web_admin/` (Vite + React + TS) |
| 4 | **Mode hors-ligne** et cache des missions actives | `mobile_app/` |
| 5 | **Map-First Évaluateur** (hors périmètre v1) : FSM idle→navigating→onSiteEval→pvSigned | `evaluator_map_screen.dart` |
| 6 | **Map-First Vendeur** (hors périmètre v1) : FSM idle→orderReady→awaitingPickup→delivered | `vendor_map_screen.dart` |
