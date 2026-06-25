let fs = null, path = null, DB_PATH = null;
try {
  fs = require('fs');
  path = require('path');
  DB_PATH = path.resolve(process.cwd(), 'tests/mock_db.json');
} catch (e) {
  // Not running in Node.js environment (e.g., Edge/Client build)
}

export function readDb() {
  if (!fs || !DB_PATH) {
    return {
      user_profiles: [],
      points_ledger: [],
      orders: [],
      order_items: [],
      subscriptions: []
    };
  }
  if (!fs.existsSync(DB_PATH)) {
    const initialDb = {
      user_profiles: [],
      points_ledger: [],
      orders: [],
      order_items: [],
      subscriptions: []
    };
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    fs.writeFileSync(DB_PATH, JSON.stringify(initialDb, null, 2), 'utf-8');
    return initialDb;
  }
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
  } catch (e) {
    return {};
  }
}

export function writeDb(db) {
  if (fs && DB_PATH) {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
  }
}

export class MockQueryBuilder {
  constructor(table, clientUser = null) {
    this.table = table;
    this.clientUser = clientUser;
    this.filters = [];
    this.sortField = null;
    this.sortAscending = true;
    this.limitVal = null;
    this.isSingle = false;
    this.selectFields = null;
  }

  select(fields = "*", options = {}) {
    this.selectFields = fields;
    this.countOption = options.count;
    this.headOption = options.head;
    return this;
  }

  eq(column, value) {
    this.filters.push({ type: 'eq', column, value });
    return this;
  }

  neq(column, value) {
    this.filters.push({ type: 'neq', column, value });
    return this;
  }

  or(filtersString) {
    this.filters.push({ type: 'or', filter: filtersString });
    return this;
  }

  order(column, { ascending = true } = {}) {
    this.sortField = column;
    this.sortAscending = ascending;
    return this;
  }

  limit(count) {
    this.limitVal = count;
    return this;
  }

  single() {
    this.isSingle = true;
    return this;
  }

  async then(onfulfilled, onrejected) {
    try {
      const res = await this.execute();
      return onfulfilled(res);
    } catch (err) {
      if (onrejected) return onrejected(err);
      return onfulfilled({ data: null, error: err });
    }
  }

  async execute() {
    const db = readDb();
    let data = db[this.table] || [];

    // Filter by user context if applicable
    if (this.clientUser) {
      if (this.table === 'user_profiles') {
        data = data.filter(p => p.id === this.clientUser.id);
      } else if (this.table === 'points_ledger') {
        data = data.filter(l => l.user_id === this.clientUser.id);
      } else if (this.table === 'orders') {
        data = data.filter(o => o.user_id === this.clientUser.id);
      }
    }

    // Apply filters
    for (const filter of this.filters) {
      if (filter.type === 'eq') {
        data = data.filter(row => {
          const val = row[filter.column];
          if (typeof val === 'string' && typeof filter.value === 'string') {
            return val.trim().toLowerCase() === filter.value.trim().toLowerCase();
          }
          return val === filter.value;
        });
      } else if (filter.type === 'neq') {
        data = data.filter(row => row[filter.column] !== filter.value);
      } else if (filter.type === 'or') {
        const parts = filter.filter.split(',');
        data = data.filter(row => {
          return parts.some(part => {
            if (part === 'category.is.null') return row.category === null || row.category === undefined;
            if (part.startsWith('category.neq.')) {
              const val = part.split('.').pop();
              return row.category !== val;
            }
            return true;
          });
        });
      }
    }

    // Apply sorting
    if (this.sortField) {
      data = [...data].sort((a, b) => {
        let valA = a[this.sortField];
        let valB = b[this.sortField];
        if (typeof valA === 'string') {
          return this.sortAscending ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        return this.sortAscending ? valA - valB : valB - valA;
      });
    }

    // Apply limit
    if (this.limitVal !== null) {
      data = data.slice(0, this.limitVal);
    }

    let resultData = data;
    if (this.isSingle) {
      resultData = data[0] || null;
    }

    if (this.headOption) {
      return { data: null, count: data.length, error: null };
    }

    return { data: resultData, count: data.length, error: null };
  }

  async insert(payload) {
    const db = readDb();
    if (!db[this.table]) db[this.table] = [];

    const isArray = Array.isArray(payload);
    const itemsToInsert = isArray ? payload : [payload];
    const insertedItems = [];

    for (let item of itemsToInsert) {
      const copy = { ...item };
      if (this.table === 'orders' && !copy.id) {
        copy.id = `order-${Math.floor(Math.random() * 1000000)}`;
      }
      if (!copy.created_at) {
        copy.created_at = new Date().toISOString();
      }
      db[this.table].push(copy);
      insertedItems.push(copy);
    }

    writeDb(db);

    const returnData = isArray ? insertedItems : insertedItems[0];
    
    // Support chainable methods after insert
    const originalExecute = this.execute.bind(this);
    this.execute = async () => {
      if (this.isSingle) return { data: insertedItems[0], error: null };
      return { data: returnData, error: null };
    };
    return this;
  }

  async update(payload) {
    const db = readDb();
    let data = db[this.table] || [];

    const updatedRows = [];

    for (let row of data) {
      let matches = true;
      if (this.clientUser) {
        if (this.table === 'user_profiles' && row.id !== this.clientUser.id) matches = false;
        if (this.table === 'points_ledger' && row.user_id !== this.clientUser.id) matches = false;
      }
      for (const filter of this.filters) {
        if (filter.type === 'eq') {
          const val = row[filter.column];
          if (typeof val === 'string' && typeof filter.value === 'string') {
            if (val.trim().toLowerCase() !== filter.value.trim().toLowerCase()) matches = false;
          } else if (val !== filter.value) {
            matches = false;
          }
        }
      }
      if (matches) {
        Object.assign(row, payload);
        updatedRows.push(row);
      }
    }

    writeDb(db);

    this.execute = async () => {
      if (this.isSingle) return { data: updatedRows[0] || null, error: null };
      return { data: updatedRows, error: null };
    };
    return this;
  }

  async delete() {
    const db = readDb();
    let data = db[this.table] || [];
    const remaining = [];
    const deleted = [];

    for (let row of data) {
      let matches = true;
      for (const filter of this.filters) {
        if (filter.type === 'eq') {
          const val = row[filter.column];
          if (typeof val === 'string' && typeof filter.value === 'string') {
            if (val.trim().toLowerCase() !== filter.value.trim().toLowerCase()) matches = false;
          } else if (val !== filter.value) {
            matches = false;
          }
        }
      }
      if (matches) {
        deleted.push(row);
      } else {
        remaining.push(row);
      }
    }

    db[this.table] = remaining;
    writeDb(db);

    this.execute = async () => {
      return { data: deleted, error: null };
    };
    return this;
  }
}

export class MockSupabaseClient {
  constructor(supabaseUrl, supabaseKey, options = {}, realClient = null) {
    this.supabaseUrl = supabaseUrl;
    this.supabaseKey = supabaseKey;
    this.options = options;
    this.realClient = realClient;
    
    this.auth = realClient ? realClient.auth : {
      signUp: async () => ({ data: { user: null }, error: new Error("Mock auth not implemented") }),
      signInWithPassword: async () => ({ data: { session: null }, error: new Error("Mock auth not implemented") }),
      getSession: async () => ({ data: { session: null } }),
      getUser: async () => ({ data: { user: null } }),
      signOut: async () => ({})
    };
  }

  from(table) {
    const mockTables = ['user_profiles', 'points_ledger', 'orders', 'order_items', 'subscriptions'];
    if (mockTables.includes(table)) {
      const builder = new MockQueryBuilder(table);
      const originalExecute = builder.execute.bind(builder);
      builder.execute = async () => {
        if (this.realClient && this.options?.global?.headers?.Authorization) {
          try {
            const { data: { user } } = await this.realClient.auth.getUser();
            builder.clientUser = user;
          } catch (e) {
            // Ignore error
          }
        } else if (this.realClient) {
          try {
            const { data: { session } } = await this.realClient.auth.getSession();
            if (session?.user) {
              builder.clientUser = session.user;
            }
          } catch (e) {
            // Ignore error
          }
        }
        return originalExecute();
      };
      return builder;
    }

    if (this.realClient) {
      return this.realClient.from(table);
    }
    
    return new MockQueryBuilder(table);
  }

  rpc(name, params) {
    if (this.realClient) {
      return this.realClient.rpc(name, params);
    }
    return {
      then: (cb) => cb({ data: null, error: new Error("Mock RPC not implemented") })
    };
  }

  channel(name) {
    if (this.realClient) {
      return this.realClient.channel(name);
    }
    return {
      on: () => ({ on: () => ({ subscribe: () => ({}) }) }),
      subscribe: () => ({})
    };
  }

  removeChannel(ch) {
    if (this.realClient) {
      return this.realClient.removeChannel(ch);
    }
  }
}
