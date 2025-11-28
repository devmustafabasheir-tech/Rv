// blacklist.js
const blacklist = new Set(); // استخدم مجموعة لتخزين التوكنات المرفوضة

// وظيفة لإضافة توكن إلى قائمة الحظر
function addToBlacklist(token) {
    blacklist.add(token);
}

// وظيفة للتحقق مما إذا كان التوكن مرفوضًا
function isTokenBlacklisted(token) {
    return blacklist.has(token);
}

module.exports = { addToBlacklist, isTokenBlacklisted };
