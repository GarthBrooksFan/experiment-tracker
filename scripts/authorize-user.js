#!/usr/bin/env node

/**
 * Helper script to authorize users for the Experiment Tracker
 * Usage: node scripts/authorize-user.js <github-username>
 */

console.log('🔐 User Authorization Helper');
console.log('To authorize users, use the API endpoint:');
console.log('');
console.log('curl -X POST http://localhost:3000/api/admin/users \\');
console.log('  -H "Content-Type: application/json" \\');
console.log('  -d \'{"githubUsername": "their-username", "authorize": true}\'');
console.log('');
console.log('Or list all users:');
console.log('curl http://localhost:3000/api/admin/users');
