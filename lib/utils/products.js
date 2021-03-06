import URL from "url-parse";

export function normalizeUrl(url) {
    return url.indexOf("://") === -1 ? "http://" + url : url;
}

export function getHostname(url) {
    if (!url) return url;
    return new URL(normalizeUrl(url)).hostname;
}

export function isTeamMember(product, user) {
    return product.team.some(u => u == user.id);
}
