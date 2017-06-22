import TinyUri from '../src/TinyUri.js';

describe('TinyUri', () => {

  it('should parse a url into its parts', () => {
    let url = 'https://user:pass@big.example.com/path/to/file.xml?context=foo&credentials=bar';
    let uri = new TinyUri(url);
    expect(uri.scheme()).toBe('https');
    expect(uri.host()).toBe('big.example.com');
    expect(uri.authority()).toBe('user:pass@big.example.com');
    expect(uri.path.toString()).toBe('path/to/file.xml');
    expect(uri.query.toString()).toBe('context=foo&credentials=bar');
    // expect(uri.query.get()).toBe('foo')
  });

  it('should parse a url with url template tags into its parts', () => {
    let url = 'https://user:pass@big.example.com/quotetools/getHistoryDownload/{user}/download.csv{?webmasterId,startDay,startMonth,startYear,endDay,endMonth,endYear,isRanged,symbol}';
    let uri = new TinyUri(url);
    expect(uri.scheme()).toBe('https');
    expect(uri.host()).toBe('big.example.com');
    expect(uri.authority()).toBe('user:pass@big.example.com');
    expect(uri.path.toString()).toBe('quotetools/getHistoryDownload/{user}/download.csv');
    expect(Array.isArray(uri.path.get())).toBe(true);
    expect(uri.path.get()).toEqual(['quotetools', 'getHistoryDownload', '{user}', 'download.csv']);
    expect(uri.query.toString()).toBe('');
    expect(uri.query.getUrlTemplateQuery()).toBe('webmasterId,startDay,startMonth,startYear,endDay,endMonth,endYear,isRanged,symbol');
  });

  it('should parse a url into its parts even if query string not provided', () => {
    let url = 'https://user:pass@big.example.com/path/to/file.xml';
    let uri = new TinyUri(url);
    expect(uri.scheme()).toBe('https');
    expect(uri.host()).toBe('big.example.com');
    expect(uri.authority()).toBe('user:pass@big.example.com');
    expect(uri.path.toString()).toBe('path/to/file.xml');
    expect(uri.query.toString()).toBe('');
  });

  it('should convert the uri to a string', () => {
    let url = 'https://user:pass@big.example.com/path/to/file.xml?context=foo&credentials=bar';
    let uri = new TinyUri(url);
    expect(uri.toString()).toBe(url);
  });

  it('should convert the uri to a string without a trailing slash', () => {
    let url = 'https://big.example.com/';
    let uri = new TinyUri(url);
    expect(uri.toString()).toBe('https://big.example.com');
  });

  describe('Path', () => {
    it('should return the path', () => {
      let url = 'https://user:pass@big.example.com/path/to/file.xml';
      let uri = new TinyUri(url);

      expect(uri.path.toString()).toEqual('path/to/file.xml');
    });

    it('should replace the path', () => {
      let url = 'https://user:pass@big.example.com/path/to/file.xml';
      let uri = new TinyUri(url);

      expect(uri.path.replace('different/path/to/file.json').path.toString()).toEqual('different/path/to/file.json');
    });

    it('should replace the file part of the path', () => {
      let url = 'https://user:pass@big.example.com/path/to/file.xml';
      let uri = new TinyUri(url);

      expect(uri.path.replace('file.json', 'file').path.toString()).toEqual('path/to/file.json');
    });

    it('should remove the last segment of the path', () => {
      let url = 'https://user:pass@big.example.com/path/to/file.xml';
      let uri = new TinyUri(url);

      expect(uri.path.delete().path.toString()).toEqual('path/to');
    });

    it('should replace the first segment of the path', () => {
      let url = 'https://user:pass@big.example.com/path/to/file.xml';
      let uri = new TinyUri(url);

      expect(uri.path.replace('new-path', 0).path.toString()).toEqual('new-path/to/file.xml');
    });

    it('should replace the second segment of the path', () => {
      let url = 'https://user:pass@big.example.com/path/to/file.xml';
      let uri = new TinyUri(url);

      expect(uri.path.replace('new-to', 1).path.toString()).toEqual('path/new-to/file.xml');
    });

    it('should return the uri as a string', () => {
      let url = 'https://user:pass@big.example.com/path/to/file.xml';
      let uri = new TinyUri(url);

      expect(uri.path.replace('new-to', 1).path.toString(true)).toEqual('https://user:pass@big.example.com/path/new-to/file.xml');
    });

    it('should support patch chaining', () => {
      let url = 'https://user:pass@big.example.com/path/to/file.xml';
      let uri = new TinyUri(url);

      expect(uri.path.replace('new-path', 0).path.replace('new-to', 1).path.toString(true)).toEqual('https://user:pass@big.example.com/new-path/new-to/file.xml');
    });

  });

  describe('Query', () => {
    it('should set the query string', () => {
      let url = 'https://user:pass@big.example.com/path/to/file.xml?context=foo&credentials=bar';
      let uri = new TinyUri(url);
      uri.query.set({foo: 'bar'});
      expect(uri.query.toString()).toBe('foo=bar');
    });

    it('should return a url template query string', () => {
      let url = 'https://user:pass@big.example.com/path/to/file.xml{?userid,name}';
      let uri = new TinyUri(url);

      expect(uri.query.getUrlTemplateQuery()).toEqual('userid,name');
    });

    it('should add a query string properly on a naked host', () => {
      let url = 'https://big.example.com';
      let uri = new TinyUri(url);
      uri.query.add({foo: 'bar'});
      expect(uri.toString()).toEqual('https://big.example.com?foo=bar');
    });

    it('should clear to the query string', () => {
      let url = 'https://user:pass@big.example.com/path/to/file.xml?context=foo&credentials=bar';
      let uri = new TinyUri(url);
      expect(uri.query.clear().query.toString()).toBe('');
    });

    it('should append to the query string', () => {
      let url = 'https://user:pass@big.example.com/path/to/file.xml?context=foo&credentials=bar';
      let uri = new TinyUri(url);
      uri.query.add({foo: 'bar'});
      expect(uri.query.toString()).toBe('context=foo&credentials=bar&foo=bar');
    });

    it('should change/replace a query parameter', () => {
      let url = 'https://user:pass@big.example.com/path/to/file.xml?context=foo&credentials=bar';
      let uri = new TinyUri(url);
      uri.query.merge({context: 'bar'});
      expect(uri.query.toString()).toBe('context=bar&credentials=bar');
    });

    it('should, when cleared, return a proper url', () => {
      let url = 'https://user:pass@big.example.com/path/to/file.xml?context=foo&credentials=bar';
      let uri = new TinyUri(url);
      uri.query.clear();
      expect(uri.toString()).toEqual('https://user:pass@big.example.com/path/to/file.xml');
    });

  });

  it('should change the host', () => {
    let url = 'https://user:pass@big.example.com/path/to/file.xml?context=foo&credentials=bar';
    let uri = new TinyUri(url);
    uri.host('little.example.com');
    expect(uri.host()).toBe('little.example.com');
  });

  it('should change the scheme', () => {
    let url = 'https://user:pass@big.example.com/path/to/file.xml?context=foo&credentials=bar';
    let uri = new TinyUri(url);
    uri.scheme('http');
    expect(uri.scheme()).toBe('http');
  });

  it('should demonstrate chaining', () => {
    let url = 'https://user:pass@big.example.com/path/to/file.xml?context=foo&credentials=bar';
    let uri = new TinyUri(url);
    expect(uri.scheme().toString()).toBe('https');
    expect(uri.host().toString()).toBe('big.example.com');
    expect(uri.port().toString()).toBe('');
    expect(Array.isArray(uri.path.get())).toEqual(true);
    expect(uri.path.toString()).toEqual('path/to/file.xml');
    expect(uri.query).toEqual(jasmine.any(Object));
    expect(uri.query.add({foo: 'bar'}).query.toString()).toEqual('context=foo&credentials=bar&foo=bar');
    expect(uri.query.add({foo: 'bar'}).query.merge({foo: 'bars'}).query.toString()).toEqual('context=foo&credentials=bar&foo=bars');
    expect(uri.query.clear().query.add({foo: 'bar'}).query.merge({foo: 'bars'}).query.toString()).toEqual('foo=bars');
    expect(uri.query.clear().query.add({foo: 'bar'}).query.merge({foo: 'bars'}).query.toString(true)).toEqual('https://user:pass@big.example.com/path/to/file.xml?foo=bars');
  });

});