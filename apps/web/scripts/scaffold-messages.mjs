import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const messagesDir = join(__dirname, "../messages");

function isTechnicalValue(value) {
    if (typeof value !== "string") return false;
    const v = value.trim();
    if (!v) return false;
    if (/^https?:\/\//i.test(v)) return true;
    if (/^\/[\w/.-]*/.test(v)) return true;
    if (/^[A-Z0-9_]+$/.test(v) && v.length <= 12) return true;
    return false;
}

function scaffoldLeaves(obj) {
    if (typeof obj === "string") {
        return isTechnicalValue(obj) ? obj : "[UNTRANSLATED]";
    }
    if (Array.isArray(obj)) {
        return obj.map((item) => scaffoldLeaves(item));
    }
    if (obj && typeof obj === "object") {
        const out = {};
        for (const [key, val] of Object.entries(obj)) {
            out[key] = scaffoldLeaves(val);
        }
        return out;
    }
    return obj;
}

function deepMergeMissing(target, source) {
    if (typeof source === "string") {
        if (typeof target === "string") return target;
        return isTechnicalValue(source) ? source : "[UNTRANSLATED]";
    }
    if (source && typeof source === "object" && !Array.isArray(source)) {
        const out = target && typeof target === "object" && !Array.isArray(target) ? { ...target } : {};
        for (const [key, val] of Object.entries(source)) {
            if (key in out) {
                out[key] = deepMergeMissing(out[key], val);
            } else {
                out[key] = scaffoldLeaves(val);
            }
        }
        return out;
    }
    return target ?? source;
}

const en = JSON.parse(readFileSync(join(messagesDir, "en.json"), "utf8"));

const ks = scaffoldLeaves(en);
writeFileSync(join(messagesDir, "ks.json"), `${JSON.stringify(ks, null, 4)}\n`, "utf8");

const ur = JSON.parse(readFileSync(join(messagesDir, "ur.json"), "utf8"));
const urMerged = deepMergeMissing(ur, en);
writeFileSync(join(messagesDir, "ur.json"), `${JSON.stringify(urMerged, null, 4)}\n`, "utf8");

console.log("Wrote ks.json and updated ur.json with missing keys.");
