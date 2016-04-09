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
	it('should create new version', () => {
		expect(() => {
			const v = new Version('1.2.3');
			expect(v).to.be.an.Object;
			expect(v.segments).to.deep.equal([1, 2, 3]);
			expect(v.major).to.equal(1);
			expect(v.minor).to.equal(2);
			expect(v.patch).to.equal(3);
			expect(v.build).to.equal(0);
			expect(v.tag).to.equal('');
			expect(v.toString()).to.equal('1.2.3');
			expect(v.toString(2)).to.equal('1.2');
		}).to.not.throw(Error);
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
		expect(new Version('1').toString()).to.equal('1');
		expect(new Version('1').toString(3)).to.equal('1.0.0');
		expect(new Version('1').toString(4)).to.equal('1.0.0.0');
		expect(new Version('1').toString(5)).to.equal('1.0.0.0');

		expect(new Version('1.2').toString()).to.equal('1.2');
		expect(new Version('1.2').toString(3)).to.equal('1.2.0');

		expect(new Version('1.2.3').toString()).to.equal('1.2.3');
		expect(new Version('1.2.3').toString(3)).to.equal('1.2.3');

		expect(new Version('1.2.3.4').toString()).to.equal('1.2.3.4');
		expect(new Version('1.2.3.4').toString(3)).to.equal('1.2.3');
	});
});

describe('valid', () => {
	it('should parse major versions', () => {
		testValid('1',        { segments: [1], major: 1, minor: 0, patch: 0, build: 0, tag: '' });
		testValid('1.',       { segments: [1], major: 1, minor: 0, patch: 0, build: 0, tag: '' });
		testValid('1beta',    { segments: [1], major: 1, minor: 0, patch: 0, build: 0, tag: 'beta' });
		testValid('1.beta',   { segments: [1], major: 1, minor: 0, patch: 0, build: 0, tag: 'beta' });
		testValid('1-beta',   { segments: [1], major: 1, minor: 0, patch: 0, build: 0, tag: 'beta' });
		testValid('1-beta2',  { segments: [1], major: 1, minor: 0, patch: 0, build: 0, tag: 'beta2' });
		testValid('1-beta.2', { segments: [1], major: 1, minor: 0, patch: 0, build: 0, tag: 'beta.2' });
	});

	it('should parse major and minor versions', () => {
		testValid('1.2',        { segments: [1, 2], major: 1, minor: 2, patch: 0, build: 0, tag: '' });
		testValid('1.2.',       { segments: [1, 2], major: 1, minor: 2, patch: 0, build: 0, tag: '' });
		testValid('1.2beta',    { segments: [1, 2], major: 1, minor: 2, patch: 0, build: 0, tag: 'beta' });
		testValid('1.2.beta',   { segments: [1, 2], major: 1, minor: 2, patch: 0, build: 0, tag: 'beta' });
		testValid('1.2-beta',   { segments: [1, 2], major: 1, minor: 2, patch: 0, build: 0, tag: 'beta' });
		testValid('1.2-beta2',  { segments: [1, 2], major: 1, minor: 2, patch: 0, build: 0, tag: 'beta2' });
		testValid('1.2-beta.2', { segments: [1, 2], major: 1, minor: 2, patch: 0, build: 0, tag: 'beta.2' });
	});

	it('should parse minor versions', () => {
		testValid('.2',        { segments: [0, 2], major: 0, minor: 2, patch: 0, build: 0, tag: '' });
		testValid('.2.',       { segments: [0, 2], major: 0, minor: 2, patch: 0, build: 0, tag: '' });
		testValid('.2beta',    { segments: [0, 2], major: 0, minor: 2, patch: 0, build: 0, tag: 'beta' });
		testValid('.2.beta',   { segments: [0, 2], major: 0, minor: 2, patch: 0, build: 0, tag: 'beta' });
		testValid('.2-beta',   { segments: [0, 2], major: 0, minor: 2, patch: 0, build: 0, tag: 'beta' });
		testValid('.2-beta2',  { segments: [0, 2], major: 0, minor: 2, patch: 0, build: 0, tag: 'beta2' });
		testValid('.2-beta.2', { segments: [0, 2], major: 0, minor: 2, patch: 0, build: 0, tag: 'beta.2' });
	});

	it('should parse major, minor, and patch versions', () => {
		testValid('1.2.3',        { segments: [1, 2, 3], major: 1, minor: 2, patch: 3, build: 0, tag: '' });
		testValid('1.2.3.',       { segments: [1, 2, 3], major: 1, minor: 2, patch: 3, build: 0, tag: '' });
		testValid('1.2.3beta',    { segments: [1, 2, 3], major: 1, minor: 2, patch: 3, build: 0, tag: 'beta' });
		testValid('1.2.3.beta',   { segments: [1, 2, 3], major: 1, minor: 2, patch: 3, build: 0, tag: 'beta' });
		testValid('1.2.3-beta',   { segments: [1, 2, 3], major: 1, minor: 2, patch: 3, build: 0, tag: 'beta' });
		testValid('1.2.3-beta2',  { segments: [1, 2, 3], major: 1, minor: 2, patch: 3, build: 0, tag: 'beta2' });
		testValid('1.2.3-beta.2', { segments: [1, 2, 3], major: 1, minor: 2, patch: 3, build: 0, tag: 'beta.2' });
	});

	it('should parse minor and patch versions', () => {
		testValid('.2.3',        { segments: [0, 2, 3], major: 0, minor: 2, patch: 3, build: 0, tag: '' });
		testValid('.2.3.',       { segments: [0, 2, 3], major: 0, minor: 2, patch: 3, build: 0, tag: '' });
		testValid('.2.3beta',    { segments: [0, 2, 3], major: 0, minor: 2, patch: 3, build: 0, tag: 'beta' });
		testValid('.2.3.beta',   { segments: [0, 2, 3], major: 0, minor: 2, patch: 3, build: 0, tag: 'beta' });
		testValid('.2.3-beta',   { segments: [0, 2, 3], major: 0, minor: 2, patch: 3, build: 0, tag: 'beta' });
		testValid('.2.3-beta2',  { segments: [0, 2, 3], major: 0, minor: 2, patch: 3, build: 0, tag: 'beta2' });
		testValid('.2.3-beta.2', { segments: [0, 2, 3], major: 0, minor: 2, patch: 3, build: 0, tag: 'beta.2' });
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
		testValid('v1',       { segments: [1], major: 1, minor: 0, patch: 0, build: 0, tag: '' });
		testValid('v1.2',     { segments: [1, 2], major: 1, minor: 2, patch: 0, build: 0, tag: '' });
		testValid('v1.2.3',   { segments: [1, 2, 3], major: 1, minor: 2, patch: 3, build: 0, tag: '' });
		testValid('v1.2.3.4', { segments: [1, 2, 3, 4], major: 1, minor: 2, patch: 3, build: 4, tag: '' });

		testValid('=1',       { segments: [1], major: 1, minor: 0, patch: 0, build: 0, tag: '' });
		testValid('=1.2',     { segments: [1, 2], major: 1, minor: 2, patch: 0, build: 0, tag: '' });
		testValid('=1.2.3',   { segments: [1, 2, 3], major: 1, minor: 2, patch: 3, build: 0, tag: '' });
		testValid('=1.2.3.4', { segments: [1, 2, 3, 4], major: 1, minor: 2, patch: 3, build: 4, tag: '' });
	});

	it('should parse version from array', () => {
		testValid([1],             { segments: [1], major: 1, minor: 0, patch: 0, build: 0, tag: '' });
		testValid([1, 2],          { segments: [1, 2], major: 1, minor: 2, patch: 0, build: 0, tag: '' });
		testValid([1, 2, 3],       { segments: [1, 2, 3], major: 1, minor: 2, patch: 3, build: 0, tag: '' });
		testValid([1, 2, 3, 4],    { segments: [1, 2, 3, 4], major: 1, minor: 2, patch: 3, build: 4, tag: '' });

		testValid(['v', 1],        { segments: [1], major: 1, minor: 0, patch: 0, build: 0, tag: '' });
		testValid(['v', '1'],      { segments: [1], major: 1, minor: 0, patch: 0, build: 0, tag: '' });

		testValid(['v', 1, 2],     { segments: [1, 2], major: 1, minor: 2, patch: 0, build: 0, tag: '' });
		testValid(['v', '1', '2'], { segments: [1, 2], major: 1, minor: 2, patch: 0, build: 0, tag: '' });

		testValid([1, 'beta'],     { segments: [1], major: 1, minor: 0, patch: 0, build: 0, tag: 'beta' });
		testValid(['1', 'beta'],   { segments: [1], major: 1, minor: 0, patch: 0, build: 0, tag: 'beta' });
	});

	it('should parse version from number', () => {
		testValid(1,  { segments: [1], major: 1, minor: 0, patch: 0, build: 0, tag: '' });
		testValid(-1,   { segments: [1], major: 1, minor: 0, patch: 0, build: 0, tag: '' });
		testValid(1.0, { segments: [1], major: 1, minor: 0, patch: 0, build: 0, tag: '' });
		testValid(0.2, { segments: [0, 2], major: 0, minor: 2, patch: 0, build: 0, tag: '' });
		testValid(1.2, { segments: [1, 2], major: 1, minor: 2, patch: 0, build: 0, tag: '' });
	});

	it('should return null for bad versions', () => {
		expect(version.valid('')).to.be.null;
		expect(version.valid('foo')).to.be.null;
		expect(version.valid(function () {})).to.be.null;
		expect(version.valid([])).to.be.null;
		expect(version.valid({})).to.be.null;
		expect(version.valid({a:1})).to.be.null;
		expect(version.valid()).to.be.null;
		expect(version.valid(null)).to.be.null;
	});
});

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

// TODO:
//	normalize()
//	major()
//	minor()
//	patch()
//	build()
//	tag()
//	cmp()
//	compare()
//	eq()
//	neq()
//	gt()
//	gte()
//	lt()
//	lte()
//	sort()
//	satisfies()
//	rangeMin()
//	rangeMax()
