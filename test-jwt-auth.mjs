import { testAuthFunctions } from './lib/auth.ts';

console.log('Testing JWT authentication functions...');

const results = testAuthFunctions();

console.log('\nTest Results:');
console.log('Password verification:', results.passwordVerification ? '✅ PASS' : '❌ FAIL');
console.log('JWT creation:', results.jwtCreation ? '✅ PASS' : '❌ FAIL');
console.log('JWT verification:', results.jwtVerification ? '✅ PASS' : '❌ FAIL');
console.log('Invalid JWT rejection:', results.invalidJwtRejection ? '✅ PASS' : '❌ FAIL');

const allPass = Object.values(results).every(result => result === true);
console.log('\nOverall:', allPass ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED');