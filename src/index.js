import LRU from './lru';
import 'source-map-support/register';
import 'babel-polyfill';

const versionRegExp = /^([^\d\.]*)(\.?\d+(?:\.\d+){0,3})[\.\-]?(.*)$/;

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
		if (typeof ver === undefined || ver === null || ver === '') {
			throw new Error(`Invalid version "${ver}"`);
		}

		const cachedVer = cache !== null && cache.get(ver);
		if (cachedVer instanceof Version) {
			ver = cachedVer;
		}

		if (ver instanceof Version) {
			for (const key of ['original', 'segments', 'major', 'minor', 'patch', 'build', 'tag']) {
				this[key] = ver[key];
			}
			return;
		}

		const v = Array.isArray(ver) ? ver.reduce((pv, cv, ci, a) => pv + (!!ci && +a[ci-1] ? '.' : '') + cv, '') : ver;
		const m = String(v).trim().match(versionRegExp);

		if (!m) {
			throw new Error(`Invalid version "${ver}"`);
		}

		this.original = ver;
		this.segments = m[2].split('.').map(segment => ~~segment);
		this.major    = this.segments[0] || 0;
		this.minor    = this.segments[1] || 0;
		this.patch    = this.segments[2] || 0;
		this.build    = this.segments[3] || 0;
		this.tag      = m[3] || '';

		if (cache !== null) {
			cache.set(ver, this);
		}
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
	 * Returns this version number as a semver compatible version.
	 * @returns {String}
	 * @access public
	 */
	toSemver() {
		return this.toString(3) + (this.tag ? '-' + this.tag : '');
	}

	/**
	 * Returns a formatted string of the version number.
	 * @param {Number} [numSegments] - The number of segments to format the version.
	 * @returns {String}
	 * @access public
	 */
	toString(numSegments) {
		numSegments = typeof numSegments === 'undefined' ? this.segments.length : Math.min(Math.max(~~numSegments, 0), 4);
		if (this.segments.length === numSegments) {
			return this.segments.join('.');
		}
		return [...this.segments, 0, 0, 0].slice(0, numSegments).join('.');
	}
}

/**
 * Checks if a version is valid and if it is, returns the parsed version
 * otherwise returns `null`.
 *
 * @param {String|Number|Array} ver - The version to parse.
 * @returns {Object|null}
 */
export function valid(ver) {
	try {
		return new Version(ver);
	} catch (e) {
		return null;
	}
}

/**
 * Returns the specified version's major version or `null`.
 * @param {String|Number|Array} ver - The version to parse.
 * @returns {Number|null}
 */
export function major(ver) {
	try {
		return (ver instanceof Version ? ver : new Version(ver)).major;
	} catch (e) {
		return null;
	}
}

/**
 * Returns the specified version's minor version or `null`.
 * @param {String|Number|Array} ver - The version to parse.
 * @returns {Number|null}
 */
export function minor(ver) {
	try {
		return (ver instanceof Version ? ver : new Version(ver)).minor;
	} catch (e) {
		return null;
	}
}

/**
 * Returns the specified version's patch version or `null`.
 * @param {String|Number|Array} ver - The version to parse.
 * @returns {Number|null}
 */
export function patch(ver) {
	try {
		return (ver instanceof Version ? ver : new Version(ver)).patch;
	} catch (e) {
		return null;
	}
}

/**
 * Returns the specified version's build version or `null`.
 * @param {String|Number|Array} ver - The version to parse.
 * @returns {Number|null}
 */
export function build(ver) {
	try {
		return (ver instanceof Version ? ver : new Version(ver)).build;
	} catch (e) {
		return null;
	}
}

/**
 * Returns the specified version's tag or `null`.
 * @param {String|Number|Array} ver - The version to parse.
 * @returns {String|null}
 */
export function tag(ver) {
	try {
		return (ver instanceof Version ? ver : new Version(ver)).tag;
	} catch (e) {
		return null;
	}
}

/**
 * Formats the specified version to the specified number of segments.
 * @param {String|Number|Array} ver - The version to parse.
 * @param {Number} [numSegments] - The number of segments to format the version.
 * If not specified, the version is formatted using the current number of segments.
 */
export function normalize(ver, numSegments) {
	try {
		return (ver instanceof Version ? ver : new Version(ver)).toString(numSegments);
	} catch (e) {
		return null;
	}
}

export function cmp(v1, comparator, v2) {
	//
}

export function compare(v1, v2) {
	//
}

export function eq(v1, v2) {
	//
}

export function neq(v1, v2) {
	//
}

export function gt(v1, v2) {
	//
}

export function gte(v1, v2) {
	//
}

export function lt(v1, v2) {
	//
}

export function lte(v1, v2) {
	//
}

export function defaultCompareFn(v1, v2) {
	//
}

export function sort(versions, compareFn=defaultCompareFn) {
	if (!Array.isArray(versions)) {
		throw new TypeError('Expected versions to be an array');
	}

	if (typeof compareFn !== 'function') {
		throw new TypeError('Expected compare function to be a function');
	}

	//
}

export function satisfies(ver, range) {
	//
}

export function rangeMin(range) {
	//
}

export function rangeMax(range) {
	//
}
