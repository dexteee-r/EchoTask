# 👩‍💻 EchoTask — Documentation Développeurs

Ce dépôt contient le code source de **EchoTask**, une PWA minimaliste orientée **voix + texte** pour la gestion de tâches.

---

## 🚀 Stack technique

- **Frontend** : React + Vite + TypeScript  
- **Stockage local** : IndexedDB (via Dexie)  
- **STT** : 
  - Local : Web Speech API (navigateur)  
  - Cloud : Whisper API (OpenAI, configurable)  
- **i18n** : système maison avec fichiers JSON (FR/EN/AR)  
- **UI** : CSS minimal + composants custom (Toast, LanguageSwitch, etc.)  
- **PWA** : manifest + service worker pour offline  

---

## ⚙️ Installation

```bash
# cloner
git clone https://github.com/<user>/EchoTask.git
cd EchoTask/echotask

# installer dépendances
npm install

# lancer en dev
npm run dev

# build prod
npm run build
```

## 📂 Arborescence
```
echotask/
 ├─ public/              # Manifest, icons, service worker
 ├─ src/
 │   ├─ db.ts            # Gestion IndexedDB (Dexie)
 │   ├─ stt.ts           # Speech-to-text (local + cloud)
 │   ├─ rewrite.ts       # Réécriture IA (local + cloud)
 │   ├─ i18n.tsx         # Contexte & provider i18n
 │   ├─ locales/         # JSON des traductions
 │   ├─ ui/              # Composants UI (Toast, LanguageSwitch, etc.)
 │   ├─ App.tsx          # Composant principal
 │   ├─ main.tsx         # Bootstrap React
 │   └─ styles.css       # Styles globaux
 └─ package.json
```

## 🌳 Branches Git

* ```main``` → branche stable (déploiement prod / PWA installable).
* ```develop``` → branche active de développement (nouvelles features, tests).

Workflow recommandé :

```
git checkout develop
git pull origin develop
git checkout -b feature/<nom>
# dev...
git push origin feature/<nom>
# ouvrir une PR vers develop
```

## 🧪 Tests 

## 🛠 Roadmap

## 📄 Licence

MIT