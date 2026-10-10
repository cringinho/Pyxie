/**
 * Bridge de Compatibilidade Matrimonial
 * Delega chamadas para o módulo desacoplado src/modules/marriage/marriageManager.js
 */
const marriageManager = require('../modules/marriage/marriageManager');

function getSpouseId(userId) {
  return marriageManager.getSpouseId(userId);
}

function endMarriage(userId) {
  return marriageManager.endMarriage(userId);
}

function createMarriageRequest(requesterId, targetId, guildId) {
  return marriageManager.createMarriageProposal(requesterId, targetId, guildId);
}

function resolveMarriageRequest(requestId, targetId, accepted) {
  return marriageManager.resolveMarriageProposal(requestId, targetId, accepted);
}

function cancelMarriageRequest(requestId, requesterId) {
  return marriageManager.cancelMarriageProposal(requestId, requesterId);
}

module.exports = {
  getSpouseId,
  endMarriage,
  createMarriageRequest,
  resolveMarriageRequest,
  cancelMarriageRequest,
};