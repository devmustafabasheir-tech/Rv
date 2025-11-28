 const blacklist = new Set();  

 function addToBlacklist(token) {
    blacklist.add(token);
}

 function isTokenBlacklisted(token) {
    return blacklist.has(token);
}

module.exports = { addToBlacklist, isTokenBlacklisted };
