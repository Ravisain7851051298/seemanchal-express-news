const mysql = require('mysql2/promise');
const crypto = require('crypto');
let pool;
const registry = new Map();
const tableIdInfo = new Map();
const tableColumns = new Map();

async function getTableColumns(table) {
  if (tableColumns.has(table)) return tableColumns.get(table);
  try {
    const [cols] = await getPool().query(`SHOW COLUMNS FROM ${sqlName(table)}`);
    if (cols && cols.length) {
      const set = new Set(cols.map((c) => c.Field.toLowerCase()));
      tableColumns.set(table, set);
      return set;
    }
  } catch { }
  return new Set();
}

async function getTableIdInfo(table) {
  if (tableIdInfo.has(table)) return tableIdInfo.get(table);
  try {
    const [cols] = await getPool().query(`SHOW COLUMNS FROM ${sqlName(table)} LIKE '_id'`);
    if (cols && cols.length) {
      const extra = String(cols[0].Extra || '').toLowerCase();
      const type = String(cols[0].Type || '').toLowerCase();
      const info = {
        isAutoIncrement: extra.includes('auto_increment'),
        isVarchar: type.includes('varchar') || type.includes('char'),
      };
      tableIdInfo.set(table, info);
      return info;
    }
  } catch { }
  return { isAutoIncrement: false, isVarchar: true };
}

const isValidId = (v) => {
  const s = String(v ?? '').trim();
  return (/^\d+$/.test(s) && Number(s) > 0) || /^[0-9a-fA-F]{24}$/.test(s);
};

const ObjectId = class ObjectId {
  constructor(value) {
    this.value = value || crypto.randomBytes(12).toString('hex');
  }
  toString() {
    return String(this.value);
  }
};
ObjectId.isValid = isValidId;

function getPool() {
  if (!pool) {
    throw new Error('MySQL is not connected. Configure MYSQL_HOST, MYSQL_DATABASE, MYSQL_USER and MYSQL_PASSWORD.');
  }
  return pool;
}

function pathGet(obj, path) {
  return path.split('.').reduce((v, k) => (v == null ? undefined : v[k]), obj);
}

function pathSet(obj, path, value) {
  const parts = path.split('.');
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!cur[parts[i]] || typeof cur[parts[i]] !== 'object') cur[parts[i]] = {};
    cur = cur[parts[i]];
  }
  cur[parts[parts.length - 1]] = value;
}

function plain(v) {
  if (v == null) return v;
  if (v instanceof ModelInstance) return v.toObject();
  if (Array.isArray(v)) return v.map(plain);
  if (typeof v === 'object' && !(v instanceof Date)) {
    const o = {};
    for (const [k, x] of Object.entries(v)) o[k] = plain(x);
    return o;
  }
  return v;
}

function scalarType(def) {
  if (def === String || def?.type === String) return 'TEXT';
  if (def === Number || def?.type === Number) return 'DOUBLE';
  if (def === Boolean || def?.type === Boolean) return 'TINYINT(1)';
  if (def === Date || def?.type === Date) return 'DATETIME(3)';
  return 'JSON';
}

function isDescriptor(x) {
  return (
    x &&
    typeof x === 'object' &&
    ('type' in x ||
      'default' in x ||
      'required' in x ||
      'enum' in x ||
      'ref' in x ||
      'unique' in x ||
      'index' in x ||
      'min' in x ||
      'max' in x ||
      'trim' in x ||
      'lowercase' in x ||
      'uppercase' in x ||
      'select' in x ||
      'maxlength' in x)
  );
}

function nestedDefaults(value) {
  if (isDescriptor(value)) {
    if (value.default !== undefined) return getDefault({ def: value });
    if (Array.isArray(value.type)) return [];
    if (value.type && typeof value.type === 'object') return nestedDefaults(value.type);
    return undefined;
  }
  if (Array.isArray(value)) return [];
  if (value && typeof value === 'object') {
    const out = {};
    let has = false;
    for (const [key, child] of Object.entries(value)) {
      const d = nestedDefaults(child);
      if (d !== undefined) {
        out[key] = d;
        has = true;
      }
    }
    return has ? out : undefined;
  }
  return undefined;
}

function analyzeFields(def, prefix = '') {
  const fields = [];
  for (const [key, val] of Object.entries(def || {})) {
    if (key === '__v') continue;
    const name = prefix ? `${prefix}.${key}` : key;
    if (isDescriptor(val)) {
      const t = val.type;
      const array = Array.isArray(t);
      const nested = t && typeof t === 'object' && t !== Date && t !== String && t !== Number && t !== Boolean && !array;
      fields.push({
        name,
        key,
        def: val,
        kind: array ? 'json' : nested ? 'json' : t === ObjectId || t?.name === 'ObjectId' ? 'id' : t === String ? 'string' : t === Number ? 'number' : t === Boolean ? 'boolean' : t === Date ? 'date' : 'json',
      });
    } else if (Array.isArray(val)) {
      const itemDef = val[0] || {};
      const ref = itemDef?.ref || (isDescriptor(itemDef) ? itemDef.ref : undefined);
      fields.push({
        name,
        key,
        def: { type: Array, default: [], ref },
        kind: 'json',
      });
    } else if (val && typeof val === 'object') {
      const defaults = nestedDefaults(val);
      fields.push({ name, key, def: { type: Object, ...(defaults !== undefined ? { default: defaults } : {}) }, kind: 'json' });
    } else {
      fields.push({ name, key, def: { type: val?.constructor }, kind: 'json' });
    }
  }
  return fields;
}

function sqlType(field) {
  if (field.kind === 'id') return 'BIGINT UNSIGNED';
  if (field.kind === 'string') return 'TEXT';
  if (field.kind === 'number') return 'DOUBLE';
  if (field.kind === 'boolean') return 'TINYINT(1)';
  if (field.kind === 'date') return 'DATETIME(3)';
  return 'JSON';
}

function sqlName(name) {
  return '`' + String(name).replace(/`/g, '``') + '`';
}

function modelTable(name) {
  const simple = name.toLowerCase();
  const raw = name.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase();
  const overrides = {
    category: 'categories',
    inquiry: 'inquiries',
    gallary: 'galleries',
    story: 'stories',
    event: 'events',
    user: 'users',
    membership: 'memberships',
    membership_setting: 'membership_settings',
    donation_setting: 'donation_settings',
    email_setting: 'email_settings',
    ngo_setting: 'ngo_settings',
    mission_vision: 'mission_visions',
    team_member: 'team_members',
    token_blacklist: 'token_blacklists',
    event_rsvp: 'event_rsvps',
    certificate: 'certificates',
    volunteer: 'volunteers',
    complaint: 'complaints',
    feedback: 'feedbacks',
    donation: 'donations',
    campaign: 'campaigns',
    program: 'programs',
    service: 'services',
    blog: 'blogs',
    legaldocument: 'legaldocuments',
    legal_document: 'legaldocuments',
    legaldocumentacceptance: 'legaldocumentacceptances',
    legal_document_acceptance: 'legaldocumentacceptances',
    legaldocumentversion: 'legaldocumentversions',
    legal_document_version: 'legaldocumentversions',
    sitesettings: 'sitesettings',
    site_settings: 'sitesettings',
    adminactivitylog: 'adminactivitylogs',
    admin_activity_log: 'adminactivitylogs',
  };
  return overrides[simple] || overrides[raw] || (raw.endsWith('s') ? raw : raw + 's');
}

function getDefault(field) {
  const d = field.def?.default;
  if (d === undefined) return Array.isArray(field.def?.type) || field.def?.type === Array ? [] : undefined;
  try {
    return typeof d === 'function' ? (d === Date.now ? new Date() : d()) : structuredClone(d);
  } catch {
    return d;
  }
}

function normalizeRow(Model, row, isUpdate = false) {
  const out = {};
  if (row._id != null && String(row._id).trim() !== '') {
    out._id = String(row._id);
    out.id = String(row._id);
  }
  for (const f of Model._fields) {
    let v = pathGet(row, f.name);
    if (v === undefined && !isUpdate) v = getDefault(f);
    if (v === undefined) {
      // In updates, only set null if explicitly present and not a hidden unselected field (e.g. password)
      if (isUpdate && f.name in row && f.def?.select !== false) {
        out[f.key] = null;
      }
      continue;
    }
    if (f.def?.unique && !f.def?.required && (v === '' || v === null)) {
      out[f.key] = null;
    } else if (f.kind === 'json') {
      out[f.key] = v == null ? null : JSON.stringify(v);
    } else if (f.kind === 'boolean') {
      out[f.key] = v == null ? null : v ? 1 : 0;
    } else if (f.kind === 'date' && v != null) {
      out[f.key] = v instanceof Date ? v : new Date(v);
    } else if (f.kind === 'id' && v != null) {
      out[f.key] = String(v);
    } else {
      out[f.key] = v;
    }
  }
  if (Model._timestamps) {
    const ts = Model._timestampOptions || { createdAt: true, updatedAt: true };
    if (!isUpdate && ts.createdAt !== false) out.createdAt = row.createdAt || new Date();
    if (ts.updatedAt !== false) out.updatedAt = new Date();
  }
  return out;
}

function decodeRow(Model, row) {
  if (!row) return row;
  const out = {};
  for (const f of Model._fields) {
    let v = row[f.key];
    if (v === undefined) continue;
    if (f.kind === 'json' && typeof v === 'string') {
      try {
        v = JSON.parse(v);
      } catch { }
    }
    if (f.kind === 'boolean' && v !== null) v = !!v;
    if (f.kind === 'date' && v !== null) v = new Date(v);
    if (f.kind === 'id' && v !== null) v = String(v);
    pathSet(out, f.name, v);
  }
  out._id = String(row._id);
  out.id = String(row._id);
  if (Model._timestamps) {
    const ts = Model._timestampOptions || { createdAt: true, updatedAt: true };
    if (ts.createdAt !== false) out.createdAt = row.createdAt;
    if (ts.updatedAt !== false) out.updatedAt = row.updatedAt;
  }
  return new ModelInstance(Model, out);
}

function toComp(v) {
  if (v instanceof Date) return v.getTime();
  if (typeof v === 'string' && !isNaN(Date.parse(v)) && isNaN(Number(v))) return Date.parse(v);
  return v;
}

function matches(doc, filter = {}) {
  for (const [key, expected] of Object.entries(filter || {})) {
    if (key === '$or') {
      if (!expected.some((x) => matches(doc, x))) return false;
      continue;
    }
    if (key === '$and') {
      if (!expected.every((x) => matches(doc, x))) return false;
      continue;
    }
    const actual = pathGet(doc, key);
    if (expected && typeof expected === 'object' && !Array.isArray(expected) && !(expected instanceof Date)) {
      for (const [op, val] of Object.entries(expected)) {
        if (op === '$ne' && String(actual) === String(val)) return false;
        if (op === '$in') {
          if (Array.isArray(actual)) {
            if (!actual.some((a) => val.some((v) => String(v) === String(a)))) return false;
          } else if (!val.some((x) => String(x) === String(actual))) {
            return false;
          }
        }
        if (op === '$nin' && val.some((x) => String(x) === String(actual))) return false;
        if (op === '$gt' && !(toComp(actual) > toComp(val))) return false;
        if (op === '$gte' && !(toComp(actual) >= toComp(val))) return false;
        if (op === '$lt' && !(toComp(actual) < toComp(val))) return false;
        if (op === '$lte' && !(toComp(actual) <= toComp(val))) return false;
        if (op === '$exists' && (actual !== undefined) !== !!val) return false;
        if (op === '$regex') {
          const re = new RegExp(val, expected.$options || '');
          if (Array.isArray(actual)) {
            if (!actual.some((a) => re.test(String(a ?? '')))) return false;
          } else if (!re.test(String(actual ?? ''))) {
            return false;
          }
        }
      }
    } else if (Array.isArray(actual) && !Array.isArray(expected)) {
      if (!actual.some((a) => String(a ?? '') === String(expected ?? ''))) return false;
    } else if (expected instanceof Date && actual instanceof Date) {
      if (expected.getTime() !== actual.getTime()) return false;
    } else if (String(actual ?? '') !== String(expected ?? '')) {
      return false;
    }
  }
  return true;
}

class Schema {
  constructor(def, options = {}) {
    this.definition = def || {};
    this.options = options;
    this._pres = [];
    this.methods = {};
    this.statics = {};
    this._indexes = [];
  }
  pre(event, fn) {
    this._pres.push({ event, fn });
    return this;
  }
  index(keys, opts = {}) {
    this._indexes.push({ keys, opts });
    return this;
  }
}
Schema.Types = { ObjectId, Mixed: Object };

class ModelInstance {
  constructor(Model, data = {}) {
    this.$model = Model;
    Object.assign(this, data);
    this.$originalPassword = data.password;
  }
  get id() {
    return this._id ? String(this._id) : undefined;
  }
  set id(v) {
    this._id = v != null ? String(v) : v;
  }
  isModified(key) {
    if (key === 'password') {
      if (!this.password) return false;
      return this.password !== this.$originalPassword;
    }
    return true;
  }
  toObject() {
    const o = {};
    for (const k of Object.keys(this)) {
      if (!k.startsWith('$')) o[k] = plain(this[k]);
    }
    if (this._id != null) {
      o._id = String(this._id);
      o.id = String(this._id);
    }
    return o;
  }
  toJSON() {
    return this.toObject();
  }
  async populate(path, fields) {
    const M = this.$model;
    const f = M._fields.find((x) => x.name === path);
    let ref = f?.def?.ref;
    if (!ref && Array.isArray(f?.def?.type) && f.def.type[0]?.ref) {
      ref = f.def.type[0].ref;
    }
    const Related = registry.get(ref);
    const val = pathGet(this, path);
    if (Related && val != null) {
      const isArray = Array.isArray(val);
      const rawIds = isArray ? val : [val];
      const ids = rawIds
        .map((x) => (x && typeof x === 'object' ? x._id || x.id : x))
        .filter((x) => x != null && String(x).trim() !== '');

      if (ids.length) {
        const relatedRows = await Related.find({ _id: { $in: ids } });
        const byId = new Map(relatedRows.map((item) => [String(item._id), item.toObject()]));
        const project = (r) => {
          if (!r || !fields) return r;
          const wanted = String(fields).split(/\s+/).filter(Boolean).map((x) => x.replace(/^\+/, ''));
          if (!wanted.length) return r;
          const picked = { _id: r._id };
          for (const k of wanted) if (r[k] !== undefined) picked[k] = r[k];
          return picked;
        };
        const resolved = isArray
          ? ids.map((id) => project(byId.get(String(id)))).filter(Boolean)
          : project(byId.get(String(ids[0])));

        pathSet(this, path, resolved);
      }
    }
    return this;
  }
  async save() {
    const M = this.$model;
    for (const hook of M._schema._pres) {
      if (hook.event === 'save') await hook.fn.call(this);
    }
    const id = this._id;
    const isUpdate = Boolean(id && String(id).trim() !== '');
    const data = normalizeRow(M, this.toObject(), isUpdate);
    const existingCols = await getTableColumns(M.table);
    if (isUpdate) {
      const cols = Object.keys(data).filter((k) => k !== '_id' && (existingCols.size === 0 || existingCols.has(k.toLowerCase())));
      if (cols.length) {
        await getPool().execute(
          `UPDATE ${sqlName(M.table)} SET ${cols.map((k) => `${sqlName(k)}=?`).join(',')} WHERE _id=?`,
          [...cols.map((k) => data[k]), id]
        );
      }
    } else {
      const info = await getTableIdInfo(M.table);
      const isAuto = info?.isAutoIncrement;
      if (!isAuto && (!this._id || String(this._id).trim() === '')) {
        this._id = new ObjectId().value;
      }
      if (this._id) {
        data._id = String(this._id);
      }
      const cols = Object.keys(data).filter((k) => {
        if (isAuto && k === '_id') return false;
        if (data[k] === undefined) return false;
        return existingCols.size === 0 || existingCols.has(k.toLowerCase());
      });
      if (cols.length) {
        const [r] = await getPool().execute(
          `INSERT INTO ${sqlName(M.table)} (${cols.map(sqlName).join(',')}) VALUES (${cols.map(() => '?').join(',')})`,
          cols.map((k) => data[k])
        );
        if (isAuto && r.insertId) {
          this._id = String(r.insertId);
        }
      } else {
        const [r] = await getPool().execute(`INSERT INTO ${sqlName(M.table)} () VALUES ()`);
        if (isAuto && r.insertId) {
          this._id = String(r.insertId);
        }
      }
      this.createdAt = data.createdAt;
    }
    if (M._timestampOptions?.updatedAt !== false) this.updatedAt = data.updatedAt;
    this.$originalPassword = this.password;
    return this;
  }
  async deleteOne() {
    const M = this.$model;
    if (this._id) {
      await getPool().execute(`DELETE FROM ${sqlName(M.table)} WHERE _id=?`, [String(this._id)]);
    }
    return { acknowledged: true, deletedCount: 1 };
  }
}

class Query {
  constructor(Model, kind, filter, extra = {}) {
    this.Model = Model;
    this.kind = kind;
    this.filter = filter || {};
    this.extra = extra;
    this._sort = null;
    this._skip = 0;
    this._limit = null;
    this._select = null;
    this._pop = [];
    this._lean = false;
  }
  sort(v) {
    this._sort = v;
    return this;
  }
  skip(v) {
    this._skip = Number(v) || 0;
    return this;
  }
  limit(v) {
    this._limit = Number(v) || 0;
    return this;
  }
  select(v) {
    this._select = typeof v === 'string' ? v.split(/\s+/).filter(Boolean) : v;
    return this;
  }
  populate(path, fields) {
    this._pop.push({
      path: typeof path === 'string' ? path : path.path,
      fields: typeof path === 'string' ? fields : path.select,
    });
    return this;
  }
  lean() {
    this._lean = true;
    return this;
  }
  then(resolve, reject) {
    return this.exec().then(resolve, reject);
  }
  catch(reject) {
    return this.exec().catch(reject);
  }
  async exec() {
    const M = this.Model;
    let rows;
    if (this.kind === 'id') {
      let idVal = this.filter;
      if (idVal && typeof idVal === 'object' && idVal._id !== undefined) {
        idVal = idVal._id;
      }
      if (idVal == null || idVal === '') {
        return null;
      }
      const [r] = await getPool().execute(`SELECT * FROM ${sqlName(M.table)} WHERE _id=? LIMIT 1`, [String(idVal)]);
      rows = r.map((x) => decodeRow(M, x));
    } else {
      const [r] = await getPool().query(`SELECT * FROM ${sqlName(M.table)}`);
      rows = r.map((x) => decodeRow(M, x)).filter((x) => matches(x, this.filter));
    }
    if (this._sort) {
      const es = Object.entries(this._sort);
      rows.sort((a, b) => {
        for (const [k, d] of es) {
          const av = toComp(pathGet(a, k));
          const bv = toComp(pathGet(b, k));
          if (av == null && bv != null) return -1 * d;
          if (av != null && bv == null) return 1 * d;
          if (av < bv) return -1 * d;
          if (av > bv) return 1 * d;
        }
        return 0;
      });
    }
    if (this._skip) rows = rows.slice(this._skip);
    if (this._limit != null) rows = rows.slice(0, this._limit);
    if (this._select) {
      rows = rows.map((row) => {
        const tokens = this._select;
        const positive = tokens.filter((k) => !k.startsWith('-') && !k.startsWith('+'));
        const negative = tokens.filter((k) => k.startsWith('-')).map((k) => k.slice(1));
        const plus = tokens.filter((k) => k.startsWith('+')).map((k) => k.slice(1));
        let o;
        if (positive.length) {
          o = { _id: row._id };
          for (const k of positive) {
            const key = k.replace(/^\+/, '');
            if (pathGet(row, key) !== undefined) pathSet(o, key, pathGet(row, key));
          }
        } else {
          o = row.toObject();
          for (const f of M._fields) {
            if (f.def?.select === false && !plus.includes(f.name)) delete o[f.name];
          }
          for (const k of negative) delete o[k];
          for (const k of plus) if (pathGet(row, k) !== undefined) pathSet(o, k, pathGet(row, k));
        }
        if (row.createdAt) o.createdAt = row.createdAt;
        if (row.updatedAt) o.updatedAt = row.updatedAt;
        return new ModelInstance(M, o);
      });
    } else {
      rows = rows.map((row) => {
        for (const f of M._fields) {
          if (f.def?.select === false) delete row[f.name];
        }
        return row;
      });
    }
    for (const pop of this._pop) {
      rows = await Promise.all(
        rows.map(async (row) => {
          const f = M._fields.find((x) => x.name === pop.path);
          const ref = f?.def?.ref;
          if (!ref) return row;
          const Related = registry.get(ref);
          if (!Related) return row;
          const val = pathGet(row, pop.path);
          if (val == null) return row;
          const isArray = Array.isArray(val);
          const relatedRows = isArray
            ? await Related.find({ _id: { $in: val } })
            : [await Related.findById(val)].filter(Boolean);
          const byId = new Map(relatedRows.map((item) => [String(item._id), item.toObject()]));
          const project = (r) => {
            if (!r || !pop.fields) return r;
            const fields = String(pop.fields).split(/\s+/).filter(Boolean);
            const picked = { _id: r._id };
            for (const k of fields) if (r[k] !== undefined) picked[k] = r[k];
            return picked;
          };
          pathSet(row, pop.path, isArray ? val.map((id) => project(byId.get(String(id)))).filter(Boolean) : project(byId.get(String(val))));
          return row;
        })
      );
    }
    if (this.kind === 'one' || this.kind === 'id') {
      const result = rows[0] || null;
      return result ? (this._lean ? result.toObject() : result) : null;
    }
    return this._lean ? rows.map((x) => x.toObject()) : rows;
  }
}

class ActionQuery {
  constructor(handler) {
    this.handler = handler;
    this._pop = [];
    this._lean = false;
    this._select = null;
  }
  populate(path, fields) {
    this._pop.push({
      path: typeof path === 'string' ? path : path.path,
      fields: typeof path === 'string' ? fields : path.select,
    });
    return this;
  }
  select(v) {
    this._select = typeof v === 'string' ? v.split(/\s+/).filter(Boolean) : v;
    return this;
  }
  lean() {
    this._lean = true;
    return this;
  }
  then(resolve, reject) {
    return this.exec().then(resolve, reject);
  }
  catch(reject) {
    return this.exec().catch(reject);
  }
  async exec() {
    let result = await this.handler();
    if (result && this._pop.length) {
      for (const p of this._pop) await result.populate(p.path, p.fields);
    }
    if (this._lean && result?.toObject) return result.toObject();
    return result;
  }
}

function evalExpr(expr, r) {
  if (expr == null) return expr;
  if (typeof expr === 'number' || typeof expr === 'boolean') return expr;
  if (typeof expr === 'string') {
    return expr.startsWith('$') ? pathGet(r, expr.slice(1)) : expr;
  }
  if (typeof expr === 'object') {
    if (expr.$ifNull) {
      const value = evalExpr(expr.$ifNull[0], r);
      return value !== undefined && value !== null && value !== '' ? value : evalExpr(expr.$ifNull[1], r);
    }
    if (expr.$dateToString) {
      const spec = expr.$dateToString;
      const raw = evalExpr(spec.date, r);
      if (raw == null) return null;
      const d = raw instanceof Date ? raw : new Date(raw);
      if (Number.isNaN(d.getTime())) return null;
      const yyyy = String(d.getUTCFullYear());
      const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
      const dd = String(d.getUTCDate()).padStart(2, '0');
      return String(spec.format || '%Y-%m-%d').replace('%Y', yyyy).replace('%m', mm).replace('%d', dd);
    }
    if (expr.$cond) {
      const cond = Array.isArray(expr.$cond) ? expr.$cond[0] : expr.$cond.if;
      const thenVal = Array.isArray(expr.$cond) ? expr.$cond[1] : expr.$cond.then;
      const elseVal = Array.isArray(expr.$cond) ? expr.$cond[2] : expr.$cond.else;
      let pass = false;
      if (cond?.$eq) {
        const left = evalExpr(cond.$eq[0], r);
        const right = evalExpr(cond.$eq[1], r);
        pass = String(left ?? '') === String(right ?? '');
      } else if (cond?.$ne) {
        const left = evalExpr(cond.$ne[0], r);
        const right = evalExpr(cond.$ne[1], r);
        pass = String(left ?? '') !== String(right ?? '');
      }
      return pass ? evalExpr(thenVal, r) : evalExpr(elseVal, r);
    }
    if (expr.$year) {
      const raw = evalExpr(expr.$year, r);
      if (raw == null) return null;
      const d = raw instanceof Date ? raw : new Date(raw);
      return Number.isNaN(d.getTime()) ? null : d.getUTCFullYear();
    }
    if (expr.$month) {
      const raw = evalExpr(expr.$month, r);
      if (raw == null) return null;
      const d = raw instanceof Date ? raw : new Date(raw);
      return Number.isNaN(d.getTime()) ? null : d.getUTCMonth() + 1;
    }
    if (expr.$dayOfMonth) {
      const raw = evalExpr(expr.$dayOfMonth, r);
      if (raw == null) return null;
      const d = raw instanceof Date ? raw : new Date(raw);
      return Number.isNaN(d.getTime()) ? null : d.getUTCDate();
    }
  }
  return expr;
}

function model(name, schema) {
  if (registry.has(name)) return registry.get(name);
  const M = class extends ModelInstance { };
  M.modelName = name;
  M.table = modelTable(name);
  M._schema = schema;
  M._fields = analyzeFields(schema.definition);
  M._timestamps = !!schema.options.timestamps;
  M._timestampOptions = typeof schema.options.timestamps === 'object'
    ? { createdAt: schema.options.timestamps.createdAt !== false, updatedAt: schema.options.timestamps.updatedAt !== false }
    : { createdAt: true, updatedAt: true };
  M._indexes = schema._indexes;
  for (const [k, v] of Object.entries(schema.methods || {})) {
    M.prototype[k] = v;
    ModelInstance.prototype[k] = v;
  }
  for (const [k, v] of Object.entries(schema.statics || {})) {
    M[k] = v;
  }
  M.find = (f = {}) => new Query(M, 'many', f);
  M.findOne = (f = {}) => new Query(M, 'one', f);
  M.findById = (id) => new Query(M, 'id', id);

  M._updateById = async (id, updates = {}, opts = {}) => {
    const old = await M.findById(id);
    if (!old) return null;
    const u = updates.$set || updates;
    for (const [k, v] of Object.entries(u)) {
      if (k !== '$set' && k !== '$inc' && k !== '$unset' && k !== '$setOnInsert') {
        pathSet(old, k, v);
      }
    }
    if (updates.$inc) {
      for (const [k, v] of Object.entries(updates.$inc)) {
        pathSet(old, k, (Number(pathGet(old, k)) || 0) + Number(v));
      }
    }
    if (updates.$unset) {
      for (const k of Object.keys(updates.$unset)) {
        pathSet(old, k, undefined);
      }
    }
    await old.save();
    return opts.new || opts.returnDocument === 'after' ? old : M.findById(id);
  };

  M.findByIdAndUpdate = (id, updates = {}, opts = {}) => new ActionQuery(() => M._updateById(id, updates, opts));
  M._findOneAndUpdate = async (f, u, o = {}) => {
    const old = await M.findOne(f);
    if (old) return M._updateById(old._id, u, o);
    if (o.upsert) {
      const data = { ...(u.$setOnInsert || {}), ...(u.$set || {}) };
      return M.create({ ...f, ...data });
    }
    return null;
  };
  M.findOneAndUpdate = (f, u, o = {}) => new ActionQuery(() => M._findOneAndUpdate(f, u, o));
  M.findByIdAndDelete = async (id) => {
    const old = await M.findById(id);
    if (old) await M.deleteOne({ _id: id });
    return old;
  };
  M.findOneAndDelete = async (f) => {
    const old = await M.findOne(f);
    if (old) await M.deleteOne({ _id: old._id });
    return old;
  };
  M.findByIdAndRemove = M.findByIdAndDelete;
  M.deleteOne = async (f) => {
    const old = await M.findOne(f);
    if (!old) return { deletedCount: 0 };
    await getPool().execute(`DELETE FROM ${sqlName(M.table)} WHERE _id=?`, [old._id]);
    return { deletedCount: 1 };
  };
  M.deleteMany = async (f) => {
    const rows = await M.find(f);
    for (const row of rows) await M.deleteOne({ _id: row._id });
    return { deletedCount: rows.length };
  };
  M.updateOne = async (f, u, o = {}) => {
    const old = await M.findOne(f);
    if (!old) {
      if (o.upsert) {
        await M.create({ ...f, ...(u.$setOnInsert || {}), ...(u.$set || {}) });
        return { matchedCount: 0, modifiedCount: 0, upsertedCount: 1 };
      }
      return { matchedCount: 0, modifiedCount: 0 };
    }
    await M._updateById(old._id, u, { new: true });
    return { matchedCount: 1, modifiedCount: 1 };
  };
  M.updateMany = async (f, u, o = {}) => {
    const rows = await M.find(f);
    let count = 0;
    for (const row of rows) {
      await M._updateById(row._id, u, o);
      count++;
    }
    return { matchedCount: count, modifiedCount: count };
  };
  M.countDocuments = async (f) => (await M.find(f)).length;
  M.exists = async (f) => {
    const x = await M.findOne(f);
    return x ? { _id: x._id } : null;
  };
  M.create = async (data) => {
    if (Array.isArray(data)) return Promise.all(data.map((x) => M.create(x)));
    const row = new ModelInstance(M, {});
    for (const f of M._fields) {
      const d = getDefault(f);
      if (d !== undefined) pathSet(row, f.name, d);
    }
    Object.assign(row, data);
    for (const f of M._fields) {
      const d = f.def || {};
      let v = pathGet(row, f.name);
      if (v !== undefined && typeof v === 'string') {
        if (d.trim) v = v.trim();
        if (d.lowercase) v = v.toLowerCase();
        if (d.uppercase) v = v.toUpperCase();
        pathSet(row, f.name, v);
      }
      if (d.required && (v === undefined || v === null || v === '')) {
        throw new Error(`${f.name} is required`);
      }
      if (d.enum && v != null && !d.enum.includes(v)) {
        throw new Error(`${f.name} must be one of ${d.enum.join(', ')}`);
      }
    }
    await row.save();
    return row;
  };
  M.insertMany = M.create;
  M.aggregate = async (pipeline) => {
    let rows = await M.find().lean();
    for (const stage of pipeline) {
      if (stage.$match) {
        rows = rows.filter((r) => matches(r, stage.$match));
      } else if (stage.$group) {
        const spec = stage.$group;
        const groups = new Map();
        for (const r of rows) {
          let key;
          if (spec._id === null) {
            key = null;
          } else if (spec._id && typeof spec._id === 'object' && Object.keys(spec._id).some((k) => k.startsWith('$'))) {
            key = evalExpr(spec._id, r);
          } else if (typeof spec._id === 'string' && spec._id.startsWith('$')) {
            key = pathGet(r, spec._id.slice(1));
          } else if (spec._id && typeof spec._id === 'object') {
            key = {};
            for (const [k, v] of Object.entries(spec._id)) {
              key[k] = evalExpr(v, r);
            }
          } else {
            key = evalExpr(spec._id, r);
          }

          const ks = JSON.stringify(key);
          if (!groups.has(ks)) {
            const o = { _id: key };
            for (const [field, expr] of Object.entries(spec)) {
              if (field === '_id') continue;
              if (expr.$sum !== undefined) o[field] = 0;
              else if (expr.$max !== undefined) o[field] = null;
              else if (expr.$min !== undefined) o[field] = null;
            }
            groups.set(ks, o);
          }
          const g = groups.get(ks);
          for (const [field, expr] of Object.entries(spec)) {
            if (field === '_id') continue;
            if (expr.$sum !== undefined) {
              if (expr.$sum === 1) {
                g[field] = (g[field] || 0) + 1;
              } else if (typeof expr.$sum === 'string') {
                g[field] = (g[field] || 0) + (Number(pathGet(r, expr.$sum.slice(1))) || 0);
              } else if (typeof expr.$sum === 'object') {
                const val = evalExpr(expr.$sum, r);
                g[field] = (g[field] || 0) + (Number(val) || 0);
              }
            } else if (expr.$max !== undefined) {
              const val = evalExpr(expr.$max, r);
              if (val != null && (g[field] == null || val > g[field])) {
                g[field] = val;
              }
            } else if (expr.$min !== undefined) {
              const val = evalExpr(expr.$min, r);
              if (val != null && (g[field] == null || val < g[field])) {
                g[field] = val;
              }
            }
          }
        }
        rows = [...groups.values()];
      } else if (stage.$sort) {
        const entries = Object.entries(stage.$sort);
        rows.sort((a, b) => {
          for (const [k, d] of entries) {
            const av = toComp(pathGet(a, k));
            const bv = toComp(pathGet(b, k));
            if (av < bv) return -1 * d;
            if (av > bv) return 1 * d;
          }
          return 0;
        });
      } else if (stage.$limit) {
        rows = rows.slice(0, stage.$limit);
      }
    }
    return rows;
  };
  M.createIndexes = async () => { };
  registry.set(name, M);
  return M;
}

const odm = {
  Schema,
  Types: Schema.Types,
  model,
  isValidObjectId: isValidId,
  connection: { on() { } },
};

async function connect() {
  const { MYSQL_HOST, MYSQL_PORT, MYSQL_DATABASE, MYSQL_USER, MYSQL_PASSWORD, MYSQL_CONNECTION_LIMIT } = process.env;
  const missing = ['MYSQL_HOST', 'MYSQL_DATABASE', 'MYSQL_USER'].filter((k) => !process.env[k]);
  if (process.env.MYSQL_PASSWORD === undefined) {
    missing.push('MYSQL_PASSWORD');
  }
  if (missing.length) {
    throw new Error(`Missing MySQL environment variables: ${missing.join(', ')}`);
  }
  pool = mysql.createPool({
    host: MYSQL_HOST,
    port: Number(MYSQL_PORT || 3306),
    database: MYSQL_DATABASE,
    user: MYSQL_USER,
    password: MYSQL_PASSWORD,
    waitForConnections: true,
    connectionLimit: Number(MYSQL_CONNECTION_LIMIT || 5),
    queueLimit: 0,
    dateStrings: false,
    decimalNumbers: true,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
  });

  pool.on('error', (err) => {
    console.error('MySQL unexpected pool error:', err.message);
  });

  await pool.query('SELECT 1');
  await syncSchema();
  return pool;
}

async function syncSchema() {
  for (const M of registry.values()) {
    const cols = ['`_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY'];
    for (const f of M._fields) {
      const col = f.key;
      if (col === '_id') continue;
      cols.push(`${sqlName(col)} ${sqlType(f)} NULL`);
    }
    if (M._timestamps) {
      if (M._timestampOptions.createdAt) cols.push('`createdAt` DATETIME(3) NULL');
      if (M._timestampOptions.updatedAt) cols.push('`updatedAt` DATETIME(3) NULL');
    }
    for (const f of M._fields) {
      if (f.def?.index && !f.def?.unique) {
        const prefix = f.kind === 'string' ? '(191)' : '';
        cols.push(`KEY ${sqlName('idx_' + M.table + '_' + f.key)} (${sqlName(f.key)}${prefix})`);
      }
      if (f.def?.unique) {
        const prefix = f.kind === 'string' ? '(191)' : '';
        cols.push(`UNIQUE KEY ${sqlName('uq_' + M.table + '_' + f.key)} (${sqlName(f.key)}${prefix})`);
      }
    }
    for (const ix of M._indexes) {
      const entries = Object.entries(ix.keys);
      const isTextIndex = entries.some(([, direction]) => direction === 'text');
      // JSON columns cannot be indexed directly in MySQL. Text search indexes
      // are created only over scalar text columns; JSON arrays stay in the row.
      const usableEntries = entries.filter(([key]) => {
        const field = M._fields.find((x) => x.key === key);
        return !field || field.kind !== 'json';
      });
      if (!usableEntries.length) continue;
      const indexCols = usableEntries.map(([k, d]) => {
        const field = M._fields.find((x) => x.key === k);
        const prefix = !isTextIndex && field?.kind === 'string' ? '(191)' : '';
        return `${sqlName(k)}${prefix}${isTextIndex ? '' : ` ${d === -1 ? 'DESC' : 'ASC'}`}`;
      }).join(',');
      const keyType = ix.opts?.unique ? 'UNIQUE KEY' : isTextIndex ? 'FULLTEXT KEY' : 'KEY';
      const prefixName = ix.opts?.unique ? 'uq_' : isTextIndex ? 'ft_' : 'idx_';
      cols.push(`${keyType} ${sqlName(prefixName + M.table + '_' + usableEntries.map(([k]) => k).join('_'))} (${indexCols})`);
    }
    await pool.query(
      `CREATE TABLE IF NOT EXISTS ${sqlName(M.table)} (${cols.join(',')}) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
    );

    try {
      const [existingCols] = await pool.query(`SHOW COLUMNS FROM ${sqlName(M.table)}`);
      if (existingCols && existingCols.length) {
        const existingColNames = new Set(existingCols.map((c) => c.Field.toLowerCase()));
        tableColumns.set(M.table, existingColNames);

        const idCol = existingCols.find((c) => c.Field === '_id');
        if (idCol) {
          const extra = String(idCol.Extra || '').toLowerCase();
          const type = String(idCol.Type || '').toLowerCase();
          tableIdInfo.set(M.table, {
            isAutoIncrement: extra.includes('auto_increment'),
            isVarchar: type.includes('varchar') || type.includes('char'),
          });
        }

        // Add any missing columns from model fields to existing table
        for (const f of M._fields) {
          if (f.key === '_id') continue;
          if (!existingColNames.has(f.key.toLowerCase())) {
            try {
              await pool.query(`ALTER TABLE ${sqlName(M.table)} ADD COLUMN ${sqlName(f.key)} ${sqlType(f)} NULL`);
              console.log(`[MySQL ODM] Added missing column ${f.key} to table ${M.table}`);
              existingColNames.add(f.key.toLowerCase());
            } catch (colErr) {
              console.warn(`[MySQL ODM] Failed adding column ${f.key} to ${M.table}:`, colErr.message);
            }
          }
        }

        // Timestamps check
        if (M._timestamps) {
          if (M._timestampOptions.createdAt && !existingColNames.has('createdat')) {
            try {
              await pool.query(`ALTER TABLE ${sqlName(M.table)} ADD COLUMN \`createdAt\` DATETIME(3) NULL`);
              existingColNames.add('createdat');
            } catch { }
          }
          if (M._timestampOptions.updatedAt && !existingColNames.has('updatedat')) {
            try {
              await pool.query(`ALTER TABLE ${sqlName(M.table)} ADD COLUMN \`updatedAt\` DATETIME(3) NULL`);
              existingColNames.add('updatedat');
            } catch { }
          }
        }
      }
    } catch (err) {
      console.warn(`[MySQL ODM] Error syncing columns for ${M.table}:`, err.message);
    }

    // Auto-heal empty _id rows if any exist in tables
    try {
      const [emptyRows] = await pool.query(`SELECT _id FROM ${sqlName(M.table)} WHERE _id = ''`);
      if (emptyRows && emptyRows.length > 0) {
        for (let i = 0; i < emptyRows.length; i++) {
          const generatedId = new ObjectId().value;
          await pool.query(`UPDATE ${sqlName(M.table)} SET _id = ? WHERE _id = '' LIMIT 1`, [generatedId]);
          console.log(`[MySQL ODM] Auto-repaired empty _id in table ${M.table} -> ${generatedId}`);
        }
      }
    } catch { }
  }
}

module.exports = { ...odm, connect, getPool };
