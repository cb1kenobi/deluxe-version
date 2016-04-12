import Version, * as version from '../index';
import LRU from '../lru';

describe('LRU', () => {
	it('should not grow past max size', () => {
		const lru = new LRU(3);
		expect(lru.size).to.equal(0);
		lru.set('a', 1);
		expect(lru.size).to.equal(1);
		lru.set('b', 2);
		expect(lru.size).to.equal(2);
		lru.set('c', 3);
		expect(lru.size).to.equal(3);
		lru.set('d', 4);
		expect(lru.size).to.equal(3);
	});

	it('should return the value', () => {
		const lru = new LRU(2);
		expect(lru.set('a', 1)).to.equal(1);
		expect(lru.set('b', 2)).to.equal(2);
		expect(lru.set('c', 3)).to.equal(3);

		expect(lru.get('b')).to.equal(2);
		expect(lru.get('a')).to.be.undefined;
		expect(lru.set('a', 1)).to.equal(1);
	});

	it('should be invariant for set()', () => {
		const lru = new LRU(2);
		lru.set('a', 1);
	    lru.set('b', 2);
	    lru.set('c', 3);
	    lru.set('d', 4);
		expect(Array.from(lru.cache.keys())).to.deep.equal(['c', 'd']);
	});

	it('should update value', () => {
		const lru = new LRU(2);
		lru.set('a', 1);
		expect(lru.get('a')).to.equal(1);
	    lru.set('a', 2);
		expect(lru.get('a')).to.equal(2);
	});

	it('should update value and make most recently accessed', () => {
		const lru = new LRU(2);
		lru.set('a', 1);
	    lru.set('b', 2);
		lru.set('a', 3);
		lru.set('b', 4);

		expect(lru.get('b')).to.equal(4);
		expect(Array.from(lru.cache.keys())).to.deep.equal(['a', 'b']);
	});

	it('should be invariant for get()', () => {
		const lru = new LRU(2);
		lru.set('a', 1);
		lru.set('b', 2);

		expect(lru.get('a')).to.equal(1); // 'a' is most recent accessed

		lru.set('c', 3);
		expect(Array.from(lru.cache.keys())).to.deep.equal(['a', 'c']);
	});

	it('should be invariant after set(), get(), and remove()', () => {
		const lru = new LRU(2);
		lru.set('a', 1);
		lru.set('b', 2);

		expect(lru.get('a')).to.equal(1); // 'a' is most recent accessed

		lru.remove('a');

		lru.set('c', 3);
		lru.set('d', 4);
		expect(Array.from(lru.cache.keys())).to.deep.equal(['c', 'd']);
	});

	it('should remove an element', () => {
		const lru = new LRU(3);
		lru.set('a', 1);
		lru.set('b', 2);
		lru.set('c', 3);

		lru.remove('b');
		expect(Array.from(lru.cache.keys())).to.deep.equal(['a', 'c']);
	});

	it('should be invariant for get()', () => {
		const lru = new LRU(2);
		lru.set('a', 1);
		lru.set('b', 2);

		expect(lru.get('b')).to.equal(2); // 'b' is most recent accessed

		lru.set('c', 3);
		expect(Array.from(lru.cache.keys())).to.deep.equal(['b', 'c']);
	});

	it('should be invariant for corner case size == 1', () => {
		const lru = new LRU(1);
		lru.set('a', 1);
		lru.set('b', 2);

		expect(lru.get('b')).to.equal(2); // 'b' is most recent accessed

		lru.set('c', 3);
		expect(Array.from(lru.cache.keys())).to.deep.equal(['c']);
	});

	it('should return item value', () => {
		const lru = new LRU(2);
		expect(lru.set('a', 'b')).to.equal('b');
	});

	it('should increase max size limit', () => {
		const lru = new LRU(2);
		lru.set('a', 1);
		lru.set('b', 2);
		lru.set('c', 3);
		expect(Array.from(lru.cache.keys())).to.deep.equal(['b', 'c']);

		expect(lru.maxSize).to.equal(2);

		lru.maxSize = 3;
		lru.set('d', 4);
		lru.set('e', 5);
		expect(Array.from(lru.cache.keys())).to.deep.equal(['c', 'd', 'e']);
	});

	it('should reduce max size limit', () => {
		const lru = new LRU(3);
		lru.set('a', 1);
		lru.set('b', 2);
		lru.set('c', 3);
		lru.set('d', 4);
		expect(Array.from(lru.cache.keys())).to.deep.equal(['b', 'c', 'd']);

		lru.maxSize = 2;
		expect(Array.from(lru.cache.keys())).to.deep.equal(['c', 'd']);

		lru.set('e', 5);
		expect(Array.from(lru.cache.keys())).to.deep.equal(['d', 'e']);
	});
});

describe('Version', () => {
	before(function () {
		this.lruMaxSize = version.options.lruMaxSize;
		version.options.lruMaxSize = 0;
	});

	after(function () {
		version.options.lruMaxSize = this.lruMaxSize;
	});

	it('should create new version', () => {
		const v = new Version('1.2.3');
		expect(v).to.be.an.Object;
		expect(v.segments).to.deep.equal([1, 2, 3, 0]);
		expect(v.major).to.equal(1);
		expect(v.minor).to.equal(2);
		expect(v.patch).to.equal(3);
		expect(v.build).to.equal(0);
		expect(v.tag).to.equal('');
		expect(v.toString()).to.equal('1.2.3.0');
		expect(v.normalize(2)).to.equal('1.2');
	});

	it('should return unique version string', () => {
		expect(new Version('1').toUnique(6)).to.equal('000001000000000000000000');
		expect(new Version('1.0').toUnique(6)).to.equal('000001000000000000000000');
		expect(new Version('1.2').toUnique(6)).to.equal('000001000002000000000000');
		expect(new Version('1.2.3').toUnique(6)).to.equal('000001000002000003000000');
		expect(new Version('1.2.3.4').toUnique(6)).to.equal('000001000002000003000004');
		expect(new Version('1beta').toUnique(6)).to.equal('000001000000000000000000-beta');
		expect(new Version('1-beta').toUnique(6)).to.equal('000001000000000000000000-beta');
	});

	it('should return version as an array', () => {
		expect(new Version('1').toArray()).to.deep.equal([1, 0, 0, 0]);
		expect(new Version('1.2').toArray()).to.deep.equal([1, 2, 0, 0]);
		expect(new Version('1.2.3').toArray()).to.deep.equal([1, 2, 3, 0]);
		expect(new Version('1.2.3.4').toArray()).to.deep.equal([1, 2, 3, 4]);
	});

	it('should return version as a semantic version', () => {
		expect(new Version('.1').toSemver()).to.equal('0.1.0');
		expect(new Version('1').toSemver()).to.equal('1.0.0');
		expect(new Version('1.2').toSemver()).to.equal('1.2.0');
		expect(new Version('1.2.3').toSemver()).to.equal('1.2.3');
		expect(new Version('1.2.3.4').toSemver()).to.equal('1.2.3');
		expect(new Version('1beta').toSemver()).to.equal('1.0.0-beta');
		expect(new Version('1.2beta').toSemver()).to.equal('1.2.0-beta');
	});

	it('should format version number', () => {
		expect(new Version('1').toString()).to.equal('1.0.0.0');
		expect(new Version('1').normalize(3)).to.equal('1.0.0');
		expect(new Version('1').normalize(4)).to.equal('1.0.0.0');
		expect(new Version('1').normalize(5)).to.equal('1.0.0.0');

		expect(new Version('1.2').toString()).to.equal('1.2.0.0');
		expect(new Version('1.2').normalize(3)).to.equal('1.2.0');

		expect(new Version('1.2.3').toString()).to.equal('1.2.3.0');
		expect(new Version('1.2.3').normalize(3)).to.equal('1.2.3');

		expect(new Version('1.2.3.4').toString()).to.equal('1.2.3.4');
		expect(new Version('1.2.3.4').normalize(3)).to.equal('1.2.3');
	});

	it('should throw exception for invalid version type', () => {
		expect(() => {
			new Version(function () {});
		}).to.throw(TypeError);
	});
});

describe('valid()', () => {
	function testValid(ver, expected) {
		const v = version.valid(ver);
		expect(v).to.be.an.Object;
		expect(v.segments).to.deep.equal(expected.segments);
		expect(v.major).to.equal(expected.major);
		expect(v.minor).to.equal(expected.minor);
		expect(v.patch).to.equal(expected.patch);
		expect(v.build).to.equal(expected.build);
		expect(v.tag).to.equal(expected.tag);
	}

	before(function () {
		this.lruMaxSize = version.options.lruMaxSize;
		version.options.lruMaxSize = 0;
	});

	after(function () {
		version.options.lruMaxSize = this.lruMaxSize;
	});

	it('should parse major versions', () => {
		testValid('1',        { segments: [1, 0, 0, 0], major: 1, minor: 0, patch: 0, build: 0, tag: '' });
		testValid('1.',       { segments: [1, 0, 0, 0], major: 1, minor: 0, patch: 0, build: 0, tag: '' });
		testValid('1beta',    { segments: [1, 0, 0, 0], major: 1, minor: 0, patch: 0, build: 0, tag: 'beta' });
		testValid('1.beta',   { segments: [1, 0, 0, 0], major: 1, minor: 0, patch: 0, build: 0, tag: 'beta' });
		testValid('1-beta',   { segments: [1, 0, 0, 0], major: 1, minor: 0, patch: 0, build: 0, tag: 'beta' });
		testValid('1-beta2',  { segments: [1, 0, 0, 0], major: 1, minor: 0, patch: 0, build: 0, tag: 'beta2' });
		testValid('1-beta.2', { segments: [1, 0, 0, 0], major: 1, minor: 0, patch: 0, build: 0, tag: 'beta.2' });
	});

	it('should parse major and minor versions', () => {
		testValid('1.2',        { segments: [1, 2, 0, 0], major: 1, minor: 2, patch: 0, build: 0, tag: '' });
		testValid('1.2.',       { segments: [1, 2, 0, 0], major: 1, minor: 2, patch: 0, build: 0, tag: '' });
		testValid('1.2beta',    { segments: [1, 2, 0, 0], major: 1, minor: 2, patch: 0, build: 0, tag: 'beta' });
		testValid('1.2.beta',   { segments: [1, 2, 0, 0], major: 1, minor: 2, patch: 0, build: 0, tag: 'beta' });
		testValid('1.2-beta',   { segments: [1, 2, 0, 0], major: 1, minor: 2, patch: 0, build: 0, tag: 'beta' });
		testValid('1.2-beta2',  { segments: [1, 2, 0, 0], major: 1, minor: 2, patch: 0, build: 0, tag: 'beta2' });
		testValid('1.2-beta.2', { segments: [1, 2, 0, 0], major: 1, minor: 2, patch: 0, build: 0, tag: 'beta.2' });
	});

	it('should parse minor versions', () => {
		testValid('.2',        { segments: [0, 2, 0, 0], major: 0, minor: 2, patch: 0, build: 0, tag: '' });
		testValid('.2.',       { segments: [0, 2, 0, 0], major: 0, minor: 2, patch: 0, build: 0, tag: '' });
		testValid('.2beta',    { segments: [0, 2, 0, 0], major: 0, minor: 2, patch: 0, build: 0, tag: 'beta' });
		testValid('.2.beta',   { segments: [0, 2, 0, 0], major: 0, minor: 2, patch: 0, build: 0, tag: 'beta' });
		testValid('.2-beta',   { segments: [0, 2, 0, 0], major: 0, minor: 2, patch: 0, build: 0, tag: 'beta' });
		testValid('.2-beta2',  { segments: [0, 2, 0, 0], major: 0, minor: 2, patch: 0, build: 0, tag: 'beta2' });
		testValid('.2-beta.2', { segments: [0, 2, 0, 0], major: 0, minor: 2, patch: 0, build: 0, tag: 'beta.2' });
	});

	it('should parse major, minor, and patch versions', () => {
		testValid('1.2.3',        { segments: [1, 2, 3, 0], major: 1, minor: 2, patch: 3, build: 0, tag: '' });
		testValid('1.2.3.',       { segments: [1, 2, 3, 0], major: 1, minor: 2, patch: 3, build: 0, tag: '' });
		testValid('1.2.3beta',    { segments: [1, 2, 3, 0], major: 1, minor: 2, patch: 3, build: 0, tag: 'beta' });
		testValid('1.2.3.beta',   { segments: [1, 2, 3, 0], major: 1, minor: 2, patch: 3, build: 0, tag: 'beta' });
		testValid('1.2.3-beta',   { segments: [1, 2, 3, 0], major: 1, minor: 2, patch: 3, build: 0, tag: 'beta' });
		testValid('1.2.3-beta2',  { segments: [1, 2, 3, 0], major: 1, minor: 2, patch: 3, build: 0, tag: 'beta2' });
		testValid('1.2.3-beta.2', { segments: [1, 2, 3, 0], major: 1, minor: 2, patch: 3, build: 0, tag: 'beta.2' });
	});

	it('should parse minor and patch versions', () => {
		testValid('.2.3',        { segments: [0, 2, 3, 0], major: 0, minor: 2, patch: 3, build: 0, tag: '' });
		testValid('.2.3.',       { segments: [0, 2, 3, 0], major: 0, minor: 2, patch: 3, build: 0, tag: '' });
		testValid('.2.3beta',    { segments: [0, 2, 3, 0], major: 0, minor: 2, patch: 3, build: 0, tag: 'beta' });
		testValid('.2.3.beta',   { segments: [0, 2, 3, 0], major: 0, minor: 2, patch: 3, build: 0, tag: 'beta' });
		testValid('.2.3-beta',   { segments: [0, 2, 3, 0], major: 0, minor: 2, patch: 3, build: 0, tag: 'beta' });
		testValid('.2.3-beta2',  { segments: [0, 2, 3, 0], major: 0, minor: 2, patch: 3, build: 0, tag: 'beta2' });
		testValid('.2.3-beta.2', { segments: [0, 2, 3, 0], major: 0, minor: 2, patch: 3, build: 0, tag: 'beta.2' });
	});

	it('should parse major, minor, patch, and build versions', () => {
		testValid('1.2.3.4',        { segments: [1, 2, 3, 4], major: 1, minor: 2, patch: 3, build: 4, tag: '' });
		testValid('1.2.3.4.',       { segments: [1, 2, 3, 4], major: 1, minor: 2, patch: 3, build: 4, tag: '' });
		testValid('1.2.3.4beta',    { segments: [1, 2, 3, 4], major: 1, minor: 2, patch: 3, build: 4, tag: 'beta' });
		testValid('1.2.3.4.beta',   { segments: [1, 2, 3, 4], major: 1, minor: 2, patch: 3, build: 4, tag: 'beta' });
		testValid('1.2.3.4-beta',   { segments: [1, 2, 3, 4], major: 1, minor: 2, patch: 3, build: 4, tag: 'beta' });
		testValid('1.2.3.4-beta2',  { segments: [1, 2, 3, 4], major: 1, minor: 2, patch: 3, build: 4, tag: 'beta2' });
		testValid('1.2.3.4-beta.2', { segments: [1, 2, 3, 4], major: 1, minor: 2, patch: 3, build: 4, tag: 'beta.2' });
	});

	it('should parse minor, patch, and build versions', () => {
		testValid('.2.3.4',        { segments: [0, 2, 3, 4], major: 0, minor: 2, patch: 3, build: 4, tag: '' });
		testValid('.2.3.4.',       { segments: [0, 2, 3, 4], major: 0, minor: 2, patch: 3, build: 4, tag: '' });
		testValid('.2.3.4beta',    { segments: [0, 2, 3, 4], major: 0, minor: 2, patch: 3, build: 4, tag: 'beta' });
		testValid('.2.3.4.beta',   { segments: [0, 2, 3, 4], major: 0, minor: 2, patch: 3, build: 4, tag: 'beta' });
		testValid('.2.3.4-beta',   { segments: [0, 2, 3, 4], major: 0, minor: 2, patch: 3, build: 4, tag: 'beta' });
		testValid('.2.3.4-beta2',  { segments: [0, 2, 3, 4], major: 0, minor: 2, patch: 3, build: 4, tag: 'beta2' });
		testValid('.2.3.4-beta.2', { segments: [0, 2, 3, 4], major: 0, minor: 2, patch: 3, build: 4, tag: 'beta.2' });
	});

	it('should parse major, minor, patch, and build versions with prefix', () => {
		testValid('v1',       { segments: [1, 0, 0, 0], major: 1, minor: 0, patch: 0, build: 0, tag: '' });
		testValid('v1.2',     { segments: [1, 2, 0, 0], major: 1, minor: 2, patch: 0, build: 0, tag: '' });
		testValid('v1.2.3',   { segments: [1, 2, 3, 0], major: 1, minor: 2, patch: 3, build: 0, tag: '' });
		testValid('v1.2.3.4', { segments: [1, 2, 3, 4], major: 1, minor: 2, patch: 3, build: 4, tag: '' });

		testValid('=1',       { segments: [1, 0, 0, 0], major: 1, minor: 0, patch: 0, build: 0, tag: '' });
		testValid('=1.2',     { segments: [1, 2, 0, 0], major: 1, minor: 2, patch: 0, build: 0, tag: '' });
		testValid('=1.2.3',   { segments: [1, 2, 3, 0], major: 1, minor: 2, patch: 3, build: 0, tag: '' });
		testValid('=1.2.3.4', { segments: [1, 2, 3, 4], major: 1, minor: 2, patch: 3, build: 4, tag: '' });
	});

	it('should parse version from array', () => {
		testValid([1],             { segments: [1, 0, 0, 0], major: 1, minor: 0, patch: 0, build: 0, tag: '' });
		testValid([1, 2],          { segments: [1, 2, 0, 0], major: 1, minor: 2, patch: 0, build: 0, tag: '' });
		testValid([1, 2, 3],       { segments: [1, 2, 3, 0], major: 1, minor: 2, patch: 3, build: 0, tag: '' });
		testValid([1, 2, 3, 4],    { segments: [1, 2, 3, 4], major: 1, minor: 2, patch: 3, build: 4, tag: '' });

		testValid(['v', 1],        { segments: [1, 0, 0, 0], major: 1, minor: 0, patch: 0, build: 0, tag: '' });
		testValid(['v', '1'],      { segments: [1, 0, 0, 0], major: 1, minor: 0, patch: 0, build: 0, tag: '' });

		testValid(['v', 1, 2],     { segments: [1, 2, 0, 0], major: 1, minor: 2, patch: 0, build: 0, tag: '' });
		testValid(['v', '1', '2'], { segments: [1, 2, 0, 0], major: 1, minor: 2, patch: 0, build: 0, tag: '' });

		testValid([1, 'beta'],     { segments: [1, 0, 0, 0], major: 1, minor: 0, patch: 0, build: 0, tag: 'beta' });
		testValid(['1', 'beta'],   { segments: [1, 0, 0, 0], major: 1, minor: 0, patch: 0, build: 0, tag: 'beta' });
	});

	it('should parse version from number', () => {
		testValid(1,   { segments: [1, 0, 0, 0], major: 1, minor: 0, patch: 0, build: 0, tag: '' });
		testValid(-1,  { segments: [1, 0, 0, 0], major: 1, minor: 0, patch: 0, build: 0, tag: '' });
		testValid(1.0, { segments: [1, 0, 0, 0], major: 1, minor: 0, patch: 0, build: 0, tag: '' });
		testValid(0.2, { segments: [0, 2, 0, 0], major: 0, minor: 2, patch: 0, build: 0, tag: '' });
		testValid(1.2, { segments: [1, 2, 0, 0], major: 1, minor: 2, patch: 0, build: 0, tag: '' });
	});

	it('should parse version from empty values', () => {
		testValid(undefined, { segments: [0, 0, 0, 0], major: 0, minor: 0, patch: 0, build: 0, tag: '' });
		testValid(null,      { segments: [0, 0, 0, 0], major: 0, minor: 0, patch: 0, build: 0, tag: '' });
		testValid('',        { segments: [0, 0, 0, 0], major: 0, minor: 0, patch: 0, build: 0, tag: '' });
		testValid('foo',     { segments: [0, 0, 0, 0], major: 0, minor: 0, patch: 0, build: 0, tag: 'foo' });
		testValid([],        { segments: [0, 0, 0, 0], major: 0, minor: 0, patch: 0, build: 0, tag: '' });
	});

	it('should return null for bad versions', () => {
		expect(() => {
			version.valid(function () {});
		}).to.throw(TypeError);

		expect(() => {
			version.valid({});
		}).to.throw(TypeError);

		expect(() => {
			version.valid({ a: 1 });
		}).to.throw(TypeError);
	});
});

describe('normalize()', () => {
	before(function () {
		this.lruMaxSize = version.options.lruMaxSize;
		version.options.lruMaxSize = 0;
	});

	after(function () {
		version.options.lruMaxSize = this.lruMaxSize;
	});

	it('should normalize using default number of segments', () => {
		expect(version.normalize('1')).to.equal('1.0.0.0');
		expect(version.normalize('1.2')).to.equal('1.2.0.0');
		expect(version.normalize('1.2.3')).to.equal('1.2.3.0');
		expect(version.normalize('1.2.3.4')).to.equal('1.2.3.4');
	});

	it('should normalize using 1 segment', () => {
		expect(version.normalize('1', 1)).to.equal('1');
		expect(version.normalize('1.2', 1)).to.equal('1');
		expect(version.normalize('1.2.3', 1)).to.equal('1');
		expect(version.normalize('1.2.3.4', 1)).to.equal('1');
	});

	it('should normalize using 2 segments', () => {
		expect(version.normalize('1', 2)).to.equal('1.0');
		expect(version.normalize('1.2', 2)).to.equal('1.2');
		expect(version.normalize('1.2.3', 2)).to.equal('1.2');
		expect(version.normalize('1.2.3.4', 2)).to.equal('1.2');
	});

	it('should normalize using 3 segments', () => {
		expect(version.normalize('1', 3)).to.equal('1.0.0');
		expect(version.normalize('1.2', 3)).to.equal('1.2.0');
		expect(version.normalize('1.2.3', 3)).to.equal('1.2.3');
		expect(version.normalize('1.2.3.4', 3)).to.equal('1.2.3');
	});

	it('should normalize using 4 segments', () => {
		expect(version.normalize('1', 4)).to.equal('1.0.0.0');
		expect(version.normalize('1.2', 4)).to.equal('1.2.0.0');
		expect(version.normalize('1.2.3', 4)).to.equal('1.2.3.0');
		expect(version.normalize('1.2.3.4', 4)).to.equal('1.2.3.4');
	});

	it('should normalize empty versions', () => {
		expect(version.normalize()).to.equal('0.0.0.0');
		expect(version.normalize(null)).to.equal('0.0.0.0');
	});
});

describe('major()', () => {
	before(function () {
		this.lruMaxSize = version.options.lruMaxSize;
		version.options.lruMaxSize = 0;
	});

	after(function () {
		version.options.lruMaxSize = this.lruMaxSize;
	});

	it('should return major version', () => {
		expect(version.major('1')).to.equal(1);
		expect(version.major('2.1')).to.equal(2);
		expect(version.major('0.1')).to.equal(0);
		expect(version.major('.2')).to.equal(0);
	});
});

describe('minor()', () => {
	before(function () {
		this.lruMaxSize = version.options.lruMaxSize;
		version.options.lruMaxSize = 0;
	});

	after(function () {
		version.options.lruMaxSize = this.lruMaxSize;
	});

	it('should return minor version', () => {
		expect(version.minor('1')).to.equal(0);
		expect(version.minor('2.1')).to.equal(1);
		expect(version.minor('0.1')).to.equal(1);
		expect(version.minor('.2')).to.equal(2);
	});
});

describe('patch()', () => {
	before(function () {
		this.lruMaxSize = version.options.lruMaxSize;
		version.options.lruMaxSize = 0;
	});

	after(function () {
		version.options.lruMaxSize = this.lruMaxSize;
	});

	it('should return patch version', () => {
		expect(version.patch('1')).to.equal(0);
		expect(version.patch('1.2')).to.equal(0);
		expect(version.patch('1.2.3')).to.equal(3);
		expect(version.patch('.1.2')).to.equal(2);
	});
});

describe('build()', () => {
	before(function () {
		this.lruMaxSize = version.options.lruMaxSize;
		version.options.lruMaxSize = 0;
	});

	after(function () {
		version.options.lruMaxSize = this.lruMaxSize;
	});

	it('should return build version', () => {
		expect(version.build('1')).to.equal(0);
		expect(version.build('1.2')).to.equal(0);
		expect(version.build('1.2.3')).to.equal(0);
		expect(version.build('1.2.3.4')).to.equal(4);
		expect(version.build('.1.2.3')).to.equal(3);
	});
});

describe('tag()', () => {
	before(function () {
		this.lruMaxSize = version.options.lruMaxSize;
		version.options.lruMaxSize = 0;
	});

	after(function () {
		version.options.lruMaxSize = this.lruMaxSize;
	});

	it('should return tag version', () => {
		expect(version.tag('1')).to.equal('');
		expect(version.tag('1beta2')).to.equal('beta2');
		expect(version.tag('1.beta2')).to.equal('beta2');
		expect(version.tag('1-beta2')).to.equal('beta2');
		expect(version.tag('.1-beta2')).to.equal('beta2');
		expect(version.tag('1.2beta2')).to.equal('beta2');
		expect(version.tag('1.2.3beta2')).to.equal('beta2');
		expect(version.tag('1.2.3.beta2')).to.equal('beta2');
	});
});

describe('delta()', () => {
	before(function () {
		this.lruMaxSize = version.options.lruMaxSize;
		version.options.lruMaxSize = 0;
	});

	after(function () {
		version.options.lruMaxSize = this.lruMaxSize;
	});

	it('should return the delta between two valid versions', () => {
		expect(version.delta('1.2.3', '1.2.4')).to.deep.equal([0, 0, -1, 0]);
		expect(version.delta('1.2.3', '1.2.2')).to.deep.equal([0, 0, 1, 0]);
		expect(version.delta('0.2.5', '2.0.3')).to.deep.equal([-2, 2, 2, 0]);
		expect(version.delta('1.2.x', '0.1.5')).to.deep.equal([1, 1, -5, 0]);
	});

	it('should handle a bad version', () => {
		expect(version.delta('1.2.3')).to.deep.equal([1, 2, 3, 0]);
		expect(version.delta(null, '1.2.3')).to.deep.equal([-1, -2, -3, 0]);
	});

	it('should return null for empty versions', () => {
		expect(version.delta()).to.deep.equal([0, 0, 0, 0]);
		expect(version.delta(null)).to.deep.equal([0, 0, 0, 0]);
		expect(version.delta(null, null)).to.deep.equal([0, 0, 0, 0]);
	});
});

describe('compare()', () => {
	before(function () {
		this.lruMaxSize = version.options.lruMaxSize;
		version.options.lruMaxSize = 0;
	});

	after(function () {
		version.options.lruMaxSize = this.lruMaxSize;
	});

	it('should compare two valid versions', () => {
		expect(version.compare('0.2.3', '0.1.2')).to.equal(1);
		expect(version.compare('1.2.3', '1.2.0')).to.equal(1);
		expect(version.compare('1.2.3-beta2', '1.2.3-beta')).to.equal(1);

		expect(version.compare('0.2.3', '0.2.4')).to.equal(-1);
		expect(version.compare('1.2.3', '2.2.0')).to.equal(-1);
		expect(version.compare('1.2.3-beta', '1.2.3-beta2')).to.equal(-1);

		expect(version.compare('2', '2')).to.equal(0);
		expect(version.compare('1.2.3', '1.2.3')).to.equal(0);
		expect(version.compare('.5', '.5')).to.equal(0);
		expect(version.compare('1.2.3-beta3', '1.2.3-beta3')).to.equal(0);
	});

	it('should handle a bad version', () => {
		expect(version.compare('1.2.3', null)).to.equal(1);
		expect(version.compare(null, '1.2.3')).to.equal(-1);
	});

	it('should return null for empty versions', () => {
		expect(version.compare()).to.equal(0);
		expect(version.compare(null)).to.equal(0);
		expect(version.compare(null, null)).to.equal(0);
	});
});

describe('cmp()', () => {
	before(function () {
		this.lruMaxSize = version.options.lruMaxSize;
		version.options.lruMaxSize = 0;
	});

	after(function () {
		version.options.lruMaxSize = this.lruMaxSize;
	});

	it('should compare two versions', () => {
		expect(version.cmp('1.2.3', '==', '1.2.3')).to.be.true;
		expect(version.cmp('1.2.3', '===', '1.2.3')).to.be.true;

		expect(version.cmp('1.2', '!=', '1.2.3')).to.be.true;
		expect(version.cmp('1.2', '!==', '1.2.3')).to.be.true;

		expect(version.cmp('1.2', '<', '1.2.3')).to.be.true;
		expect(version.cmp('1.2', '<=', '1.2.3')).to.be.true;
		expect(version.cmp('1.2.3', '<=', '1.2.3')).to.be.true;

		expect(version.cmp('1.2.5', '>', '1.2.3')).to.be.true;
		expect(version.cmp('1.2.5', '>=', '1.2.3')).to.be.true;
		expect(version.cmp('1.2.3', '>=', '1.2.3')).to.be.true;

		expect(version.cmp('1.2.3-beta', '!==', '1.2.3')).to.be.true;
		expect(version.cmp('1.2.3', '>', '1.2.3-beta')).to.be.true;
		expect(version.cmp('1.2.3', '>=', '1.2.3-beta')).to.be.true;
	});

	it('should compare two versions with tags', () => {
		expect(version.cmp('1.2.3', '!==', '1.2.3-beta')).to.be.true;
		expect(version.cmp('1.2.3-beta', '<', '1.2.3')).to.be.true;
		expect(version.cmp('1.2.3-beta', '<=', '1.2.3')).to.be.true;

		expect(version.cmp('1.2.3-beta', '===', '1.2.3-beta')).to.be.true;
		expect(version.cmp('1.2.3-beta', '!==', '1.2.3-beta2')).to.be.true;
		expect(version.cmp('1.2.3-beta', '<', '1.2.3-beta2')).to.be.true;
		expect(version.cmp('1.2.3-beta', '<=', '1.2.3-beta')).to.be.true;
		expect(version.cmp('1.2.3-beta', '<=', '1.2.3-beta2')).to.be.true;
		expect(version.cmp('1.2.3-beta2', '>', '1.2.3-beta')).to.be.true;
		expect(version.cmp('1.2.3-beta', '>=', '1.2.3-beta')).to.be.true;
		expect(version.cmp('1.2.3-beta2', '>=', '1.2.3-beta')).to.be.true;
	});

	it('should compare empty versions', () => {
		expect(version.cmp('1.2.3', '!==', null)).to.be.true;
		expect(version.cmp(null, '!==', '1.2.3')).to.be.true;
		expect(version.cmp(null, '===', null)).to.be.true;
	});
});

describe('sort()', () => {
	before(function () {
		this.lruMaxSize = version.options.lruMaxSize;
		version.options.lruMaxSize = 0;
	});

	after(function () {
		version.options.lruMaxSize = this.lruMaxSize;
	});

	it('should sort an empty array of versions', () => {
		expect(version.sort([])).to.deep.equal([]);
	});

	it('should throw error if arguments are invalid', () => {
		expect(() => {
			version.sort();
		}).to.throw(TypeError);

		expect(() => {
			version.sort(null);
		}).to.throw(TypeError);

		expect(() => {
			version.sort(function () {});
		}).to.throw(TypeError);

		expect(() => {
			version.sort(123);
		}).to.throw(TypeError);

		expect(() => {
			version.sort('foo');
		}).to.throw(TypeError);

		expect(() => {
			version.sort([], 'not a function');
		}).to.throw(TypeError);

		expect(() => {
			version.sort([ function () {} ]);
		}).to.throw(TypeError);
	});

	function shuffle(arr) {
		arr = arr.slice();
		for (let i = arr.length - 1; i >= 0; i--) {
			let j = Math.floor(Math.random() * i);
			let tmp = arr[i];
			arr[i] = arr[j];
			arr[j] = tmp;
		}
		return arr;
	}

	// borrowed from https://github.com/quentinrossetti/version-sort/blob/master/test/index.js
	const versions = [
		'1.1.0',
		'1.1.4.5687',
		'2.4alpha',
		'2.4beta',
		'2.4',
		'2.4.2',
		'2.4.20alpha',
		'2.4.20beta',
		'2.4.20rc1',
		'2.4.20rc2',
		'2.4.20'
	];

	it('should sort an array of versions ascending', () => {
		expect(version.sort(shuffle(versions))).to.deep.equal(versions);

		const versionObjs = versions.map(v => new Version(v));
		expect(version.sort(shuffle(versionObjs))).to.deep.equal(versionObjs);
	});

	it('should sort an array of versions descending', () => {
		const rversions = versions.slice().reverse();
		expect(version.sort(shuffle(versions), version.rcompare)).to.deep.equal(rversions);

		const rversionObjs = rversions.map(v => new Version(v));
		expect(version.sort(shuffle(rversionObjs), version.rcompare)).to.deep.equal(rversionObjs);
	});
});

//	parseRanges()
//	rangeMin()
//	rangeMax()
//	satisfies()
