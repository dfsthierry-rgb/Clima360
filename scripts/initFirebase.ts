// Firebase Database Config and Wipe script
// Run with: npx tsx scripts/initFirebase.ts

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, writeBatch, doc, setDoc } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';
import fs from 'fs';
import path from 'path';

// Read config
const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

// Initialize Firebase
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);
const auth = getAuth(app);

async function cleanCollections() {
  console.log('Cleaning all existing surveys...');
  const snap = await getDocs(collection(db, 'surveys'));
  let batch = writeBatch(db);
  let count = 0;
  
  for (const document of snap.docs) {
    batch.delete(document.ref);
    count++;
    if (count === 500) {
      await batch.commit();
      batch = writeBatch(db);
      count = 0;
    }
  }
  if (count > 0) {
    await batch.commit();
  }
  console.log(`Deleted ${snap.docs.length} surveys from the database.`);

  console.log('Initializing empty schema in config...');
  await setDoc(doc(db, 'config', 'global'), {
    headcounts: {},
    lastUploadDate: null
  });

  console.log('DB wiped and initialized with empty schema based on firebase-blueprint.json.');
  process.exit(0);
}

cleanCollections().catch(err => {
  console.error("Initialization Failed:", err);
  process.exit(1);
});
