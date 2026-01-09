/**
 * Ask CareBow Audit Module - DEV ONLY
 *
 * This module provides test harnesses for validating Ask CareBow
 * safety and format rules. It should NEVER be imported in production.
 *
 * Usage:
 *   if (__DEV__) {
 *     const { runAskCareBowAudit } = require('./audit');
 *     runAskCareBowAudit().then(report => console.log(report));
 *   }
 */

export {
  runAskCareBowAudit,
  runSingleAuditTest,
  getAuditTestCases,
  TEST_CASES,
} from './runAudit';

export type {
  AuditCheckResult,
  AuditTestResult,
  AuditReport,
} from './runAudit';
