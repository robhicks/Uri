/**
 * Class to manage query part of URL
 */
export default class Query {
  /**
   * @param {string} f - query string
   * @param {object} ctx - context of uri instance
   * @return {instance} for chaining
   */
  constructor(f, ctx = {}) {
    Object.assign(this, ctx);
    this.ctx = ctx;
    this.set(f);
    return this;
  }

  /**
   * Add a query string
   * @param {object} obj {name: 'value'}
   * @return {instance} for chaining
   */
  add(obj = {}) {
    this._query = this._convert(obj, this._query[0], this._query[1]);
    return this.ctx;
  }

  /**
   * Remove the query string
   * @return {instance} for chaining
   */
  clear() {
    this._query = [[], []];
    return this.ctx;
  }

  _convert(obj, p = [], q = []) {
    for (let key in obj) {
      if (Array.isArray(obj[key])) {
        for (let i = 0; i < obj[key].length; i++) {
          let val = obj[key][i];
          p.push(key);
          q.push(val);
        }
      } else if(obj[key]) {
        p.push(key);
        q.push(obj[key]);
      }
    }
    return [p, q];
  }

  /**
   * Get the query string
   * @return {array} representing the query string
   */
  get() {
    let dict = {};
    let obj = this._query;

    for (let i = 0; i < obj[0].length; i++) {
      let k = obj[0][i];
      let v = obj[1][i];
      if (dict[k]) {
        dict[k].push(v);
      } else {
        dict[k] = [v];
      }
    }
    return dict;
  }

  getUrlTemplateQuery() {
    return this._urlTemplateQueryString;
  }

  /**
   * Merge with the query string - replaces query string values if they exist
   * @param {object} obj {name: 'value'}
   * @return {instance} for chaining
   */
  merge(obj) {
    let p = this._query[0];
    let q = this._query[1];
    for (let key in obj) {
      let kset = false;

      for(let i=0; i < p.length; i++) {
        let xKey = p[i];
        if(key === xKey) {
          if(kset) {
            p.splice(i, 1);
            q.splice(i, 1);
            continue;
          }
          if (Array.isArray(obj[key])) {
            q[i] = obj[key].shift();
          } else if (typeof obj[key] === 'undefined' || obj[key] === null) {
            p.splice(i, 1);
            q.splice(i, 1);
            delete obj[key];
          } else {
            q[i] = obj[key];
            delete obj[key];
          }
          kset = true;
        }
      }
    }
    this._query = this._convert(obj, this._query[0], this._query[1]);
    return this.ctx;
  }

  _parse(q = '') {
    let struct = [[], []];
    let pairs = q.split(/&|;/);

    for (let j = 0; j < pairs.length; j++) {
      let name, value, pair = pairs[j], nPair = pair.match(this.qRegEx);

      if(nPair && typeof nPair[nPair.length -1] !== 'undefined') {
        nPair.shift();
        for (let i = 0; i < nPair.length; i++) {
          let p = nPair[i];
          struct[i].push(decodeURIComponent(p.replace('+', ' ', 'g')));
        }
      }
    }
    return struct;
  }

  /**
   * Set with the query string - replaces existing query string
   * @param {obj} or {string} ...q
   * @return {instance} for chaining
   */
  set(...q) {
    let args = [...q];

    if (args.length === 1) {
      if (typeof args[0] === 'object') {
        this._query = this._convert(args[0]);
      } else {
        this._query = this._parse(args[0]);
      }
    } else if (args.length === 0) {
      this.clear();
    } else {
      let obj = {};
      obj[args[0]] = args[1];
      this.merge(obj);
    }
    return this.ctx;
  }

  /**
   * Set the url template query string vale
   * @param {string} url-template query string
   * @return {instance} for chaining
   */
  setUrlTemplateQuery(s) {
    this._urlTemplateQueryString = s;
  }

  /**
   * Get string representatio of the path or the uri
   * @param {boolen} uri - if true return string represention of uri
   * @return {string} query or uri as string
   */
  toString(uri) {
    if (uri) return this.ctx.toString();
    let pairs = [];
    let n = this._query[0];
    let v = this._query[1];

    for(let i = 0; i < n.length; i++) {
      pairs.push(encodeURIComponent(n[i]) + '=' + encodeURIComponent(v[i]));
    }
    return pairs.join('&');
   }
}
