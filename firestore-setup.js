/**
 * Firestore Setup Script for Network-Based Auto Check-In
 * 
 * This script creates the necessary Firestore documents for the auto check-in feature.
 * Run this once to set up the network whitelist configuration.
 * 
 * Usage:
 * 1. Make sure Firebase is initialized in your project
 * 2. Run this script from the Firebase console or a Node.js environment
 * 3. Update the allowedRanges array with your office IP ranges
 */

import { doc, setDoc } from 'firebase/firestore';
import { db } from './src/firebase/config';

async function setupNetworkWhitelist() {
  try {
    const settingsRef = doc(db, 'settings', 'networkWhitelist');
    
    await setDoc(settingsRef, {
      enabled: true,
      allowedRanges: [
        // Add your office IP ranges here
        // Examples (replace with your actual IPs):
        '192.168.1.0/24',      // Office LAN CIDR notation
        '10.0.0.0/16',         // Office network range
        '203.0.113.45',        // Specific office external IP
        
        // More examples:
        // '172.16.0.0/12'     // Private network range
        // '198.51.100.0/24'   // Another office location
      ],
      description: 'Allowed IP ranges for automatic office network check-in',
      lastUpdated: new Date().toISOString(),
      updatedBy: 'system'
    });

    console.log('✅ Network whitelist configured successfully');
    console.log('Configure your IP ranges in Firestore: settings/networkWhitelist');
  } catch (error) {
    console.error('❌ Failed to setup network whitelist:', error);
  }
}

// Firestore Security Rules to add:
/*
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Settings collection - admins only can write, authenticated users can read
    match /settings/{document} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
*/

console.log('To run this setup:');
console.log('1. Open Firebase Console > Firestore Database');
console.log('2. Create a new collection: "settings"');
console.log('3. Create a document with ID: "networkWhitelist"');
console.log('4. Add the following fields:');
console.log('   - enabled: boolean (true)');
console.log('   - allowedRanges: array (add your IP ranges)');
console.log('   - description: string');
console.log('   - lastUpdated: timestamp');
console.log('\nExample allowedRanges:');
console.log('   ["192.168.1.0/24", "10.0.0.0/16", "203.0.113.45"]');

export { setupNetworkWhitelist };
