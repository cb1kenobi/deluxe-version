import LRU from './lru';
import 'source-map-support/register';
import 'babel-polyfill';

const versionRegExp = /^([^\d\.]*)(\.?\d+(?:\.\d+){0,3})?[\.\-]?(.*)$/;

let cache = new LRU(20);

/**
 * Various options.
 */
export const options = Object.defineProperties({}, {
	lruMaxSize: {
		get: () => cache.max,
		set: newMax => {
			newMax = Math.max(newMax, 0);
			if (newMax === 0) {
				cache = null;
			} else if (!cache) {
				cache = new LRU(newMax);
			} else {
				cache.maxSize = newMax;
			}
		},
		enumerable: true
	}
});

/**
 * Parses and represents a version number.
 */
export default class Version {
	/**
	 * Parses the version number.
	 * @param {String|Array|Number} ver - The version number to represent.
	 */
	constructor(ver) {
		if (typeof ver === 'undefined' || ver === null || ver === '') {
			ver = 0;
		}

		if (typeof ver !== 'number' && typeof ver !== 'string' && !Array.isArray(ver) && !(ver instanceof Version)) {
			throw new TypeError(`Invalid version ${ver}`);
		}

		const cachedVer = cache !== null && cache.get(ver);
		if (cachedVer instanceof Version) {
			ver = cachedVer;
		}

		if (ver instanceof Version) {
			for (const key of Object.keys(ver)) {
				this[key] = ver[key];
			}
		} else {
			const v = Array.isArray(ver) ? (ver.reduce((pv, cv, ci, a) => pv + (!!ci && +a[ci-1] ? '.' : '') + cv, '') || '0') : ver;
			const m = String(v).trim().match(versionRegExp);

			if (!m) {
				throw new Error(`Invalid version "${ver}"`);
			}

			this.original = ver;
			this.segments = [...(m[2] || '').split('.').map(segment => ~~segment), 0, 0, 0, 0].slice(0, 4);
			this.major    = this.segments[0];
			this.minor    = this.segments[1];
			this.patch    = this.segments[2];
			this.build    = this.segments[3];
			this.tag      = typeof m[2] === 'undefined' ? m[1] : (m[3] || '');
		}

		if (cache !== null) {
			cache.set(ver, this);
		}
	}

	/**
	 * Returns a formatted string of the version number.
	 * @param {Number} [numSegments] - The number of segments to format the version. Minimum of 1 segment. Maximum of 4 segments.
	 * @returns {String}
	 * @access public
	 */
	normalize(numSegments) {
		numSegments = typeof numSegments === 'undefined' ? 4 : Math.min(Math.max(~~numSegments, 1), 4);
		if (this.segments.length === numSegments) {
			return this.segments.join('.');
		}
		return this.segments.slice(0, numSegments).join('.');
	}

	/**
	 * Returns a unique string representation of this version that is suitable
	 * for sorting.
	 * @param {Number} [digits=6] The number of digits of the largest segment.
	 * @returns {String}
	 * @access public
	 */
	toUnique(digits=6) {
		let id = '';
		for (let ver of [ this.major, this.minor, this.patch, this.build ]) {
			ver = String(ver);
			if (ver.length > digits) {
				throw new Error(`Version segment is ${ver.length} digit${ver.length === 1 ? '' : 's'}, however max digits is set to ${digits}.`);
			}
			id += ver.padStart(digits, '0');
		}
		return id + (this.tag ? '-' + this.tag : '');
	}

	/**
	 * Returns the version number as an array without the tag.
	 * @returns {Array<Number>}
	 * @access public
	 */
	toArray() {
		return this.segments.slice();
	}

	/**
	 * Returns this version number as a semver compatible version.
	 * @returns {String}
	 * @access public
	 */
	toSemver() {
		return this.normalize(3) + (this.tag ? '-' + this.tag : '');
	}

	/**
	 * Returns a formatted string of the version number and tag.
	 * @returns {String}
	 * @access public
	 */
	toString() {
		return this.normalize() + (this.tag ? '-' + this.tag : '');
	}
}

/**
 * Returns a version instance.
 * @param {String|Number|Array|Version} ver - The version to parse.
 * @returns {Version}
 */
export function valid(ver) {
	return ver instanceof Version ? ver : new Version(ver);
}

/**
 * Returns the specified version's major version.
 * @param {String|Number|Array|Version} ver - The version to parse.
 * @returns {Number}
 */
export function major(ver) {
	return valid(ver).major;
}

/**
 * Returns the specified version's minor version.
 * @param {String|Number|Array|Version} ver - The version to parse.
 * @returns {Number}
 */
export function minor(ver) {
	return valid(ver).minor;
}

/**
 * Returns the specified version's patch version.
 * @param {String|Number|Array|Version} ver - The version to parse.
 * @returns {Number}
 */
export function patch(ver) {
	return valid(ver).patch;
}

/**
 * Returns the specified version's build version.
 * @param {String|Number|Array|Version} ver - The version to parse.
 * @returns {Number}
 */
export function build(ver) {
	return valid(ver).build;
}

/**
 * Returns the specified version's tag.
 * @param {String|Number|Array|Version} ver - The version to parse.
 * @returns {String}
 */
export function tag(ver) {
	return valid(ver).tag;
}

/**
 * Formats the specified version to the specified number of segments.
 * @param {String|Number|Array|Version} ver - The version to parse.
 * @param {Number} [numSegments] - The number of segments to format the version.
 * If not specified, the version is formatted using the current number of segments.
 * Minimum of 1 segment. Maximum of 4 segments.
 * @returns {String}
 */
export function normalize(ver, numSegments) {
	return valid(ver).normalize(numSegments);
}

/**
 * Returns the difference between each segments of the version number.
 * @param {String|Number|Array|Version} v1 - The first version to compare against.
 * @param {String|Number|Array|Version} v2 - The second version to compare with.
 * @returns {Array<Number>|null}
 */
export function delta(v1, v2) {
	v1 = valid(v1);
	v2 = valid(v2);

	const d = [];
	for (let i = 0; i < 4; i++) {
		d[i] = ~~v1.segments[i] - ~~v2.segments[i];
	}
	return d;
}

/**
 * Compares two versions and returns 0 if they are the same, 1 if the first
 * version is greater, or -1 if the second version is greater.
 * @param {String|Number|Array|Version} v1 - The first version to compare against.
 * @param {String|Number|Array|Version} v2 - The second version to compare with.
 * @returns {Number}
 */
export function compare(v1, v2) {
	v1 = valid(v1);
	v2 = valid(v2);

	const d = delta(v1, v2);

	for (let i = 0; i < 4; i++) {
		if (d[i] > 0) {
			return 1;
		}
		if (d[i] < 0) {
			return -1;
		}
	}

	if (!v1.tag && !v2.tag) {
		return 0;
	}

	if (!v1.tag) {
		return 1;
	}

	if (!v2.tag) {
		return -1;
	}

	return v1.tag > v2.tag ? 1 : v1.tag < v2.tag ? -1 : 0;
}

/**
 * Same as `compare()`, but in reverse. When passed into `sort()`, returns the
 * an array of versions in descending order.
 * @param {String|Number|Array|Version} v1 - The first version to compare against.
 * @param {String|Number|Array|Version} v2 - The second version to compare with.
 * @returns {Number}
 */
export function rcompare(v1, v2) {
	return compare(v1, v2) * -1;
}

/**
 * Compares two versions based on the specified comparator.
 * @param {String|Number|Array|Version} v1 - The first version to compare against.
 * @param {String} comparator - Must be '===', '==', '!==', '!=', '<', '<=', '>', or '>='.
 * @param {String|Number|Array|Version} v2 - The second version to compare with.
 * @returns {Boolean}
 */
export function cmp(v1, comparator, v2) {
	const result = compare(v1, v2);

	switch (comparator) {
		case '===':
		case '==':
			return result === 0;
		case '!==':
		case '!=':
			return result !== 0;
		case '<':
		case '<=':
			return result !== 1;
		case '>':
		case '>=':
			return result !== -1;
	}

	throw new Error(`Invalid comparator "${comparator}`);
}

/**
 * Returns true if both versions are equal.
 * @param {String|Number|Array|Version} v1 - The first version to compare against.
 * @param {String|Number|Array|Version} v2 - The second version to compare with.
 * @returns {Boolean}
 */
export function eq(v1, v2) {
	return compare(v1, v2) === 0;
}

/**
 * Returns true if both versions are not equal.
 * @param {String|Number|Array|Version} v1 - The first version to compare against.
 * @param {String|Number|Array|Version} v2 - The second version to compare with.
 * @returns {Boolean}
 */
export function neq(v1, v2) {
	return compare(v1, v2) !== 0;
}

/**
 * Returns true if both first version is greater than the second version.
 * @param {String|Number|Array|Version} v1 - The first version to compare against.
 * @param {String|Number|Array|Version} v2 - The second version to compare with.
 * @returns {Boolean}
 */
export function gt(v1, v2) {
	return compare(v1, v2) === 1;
}

/**
 * Returns true if both first version is greater than or equal to the second version.
 * @param {String|Number|Array|Version} v1 - The first version to compare against.
 * @param {String|Number|Array|Version} v2 - The second version to compare with.
 * @returns {Boolean}
 */
export function gte(v1, v2) {
	return compare(v1, v2) !== -1;
}

/**
 * Returns true if both first version is less than the second version.
 * @param {String|Number|Array|Version} v1 - The first version to compare against.
 * @param {String|Number|Array|Version} v2 - The second version to compare with.
 * @returns {Boolean}
 */
export function lt(v1, v2) {
	return compare(v1, v2) === -1;
}

/**
 * Returns true if both first version is less than or equal to the second version.
 * @param {String|Number|Array|Version} v1 - The first version to compare against.
 * @param {String|Number|Array|Version} v2 - The second version to compare with.
 * @returns {Boolean}
 */
export function lte(v1, v2) {
	return compare(v1, v2) !== -1;
}

/**
 * Sorts the input array of versions.
 * @param {Array} vers - An array of zero or more version numbers to sort.
 * @returns {Array}
 */
export function sort(vers, compareFn=compare) {
	if (!Array.isArray(vers)) {
		throw new TypeError('Expected versions to be an array');
	}

	if (typeof compareFn !== 'function') {
		throw new TypeError('Expected compare function to be a function');
	}

	// check that each element is a valid version
	for (const v of vers) {
		valid(v);
	}

	return vers.sort(compareFn);
}

export function parseRanges(str) {
	//
}

export function rangeMin(range) {
	//
}

export function rangeMax(range) {
	//
}

export function satisfies(ver, range) {
	//
}
