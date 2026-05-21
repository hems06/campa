import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');

const COLLECTIONS = ['users', 'posts', 'comments', 'follows', 'likes', 'bookmarks', 'reports', 'notifications'];

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  for (const col of COLLECTIONS) {
    const filePath = path.join(DATA_DIR, `${col}.json`);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify([], null, 2));
    }
  }
}

ensureDataDir();

export function readCollection(name) {
  const filePath = path.join(DATA_DIR, `${name}.json`);
  if (!fs.existsSync(filePath)) return [];
  const data = fs.readFileSync(filePath, 'utf-8');
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function writeCollection(name, data) {
  const filePath = path.join(DATA_DIR, `${name}.json`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

export function findById(collection, id) {
  const data = readCollection(collection);
  return data.find(item => item.id === id) || null;
}

export function findByField(collection, field, value) {
  const data = readCollection(collection);
  return data.find(item => item[field] === value) || null;
}

export function addItem(collection, item) {
  const data = readCollection(collection);
  data.push(item);
  writeCollection(collection, data);
  return item;
}

export function updateItem(collection, id, updates) {
  const data = readCollection(collection);
  const index = data.findIndex(item => item.id === id);
  if (index === -1) return null;
  data[index] = { ...data[index], ...updates };
  writeCollection(collection, data);
  return data[index];
}

export function deleteItem(collection, id) {
  const data = readCollection(collection);
  const filtered = data.filter(item => item.id !== id);
  writeCollection(collection, filtered);
  return filtered.length < data.length;
}

export function filterItems(collection, predicate) {
  const data = readCollection(collection);
  return data.filter(predicate);
}
