/*
 * Based on lru
 * MIT licensed
 * Copyright (c) 2016 Chris O'Hara <cohara87@gmail.com>
 * https://github.com/chriso/lru
 */

/**
 * A least recently used cache object.
 */
export default class LRU {
	/**
	 * Creates the LRU cache object.
	 * @param {Number} [maxSize=100] - The maximum number of objects to cache.
	 */
	constructor(maxSize=100) {
		this._maxSize = Math.max(~~maxSize, 1);
		this.head = null;
		this.tail = null;
		this.cache = new Map;
	}

	/**
	 * Returns the current LRU size.
	 * @returns {Number} The current LRU size.
	 * @access public
	 */
	get size() {
		return this.cache.size;
	}

	/**
	 * Returns the new LRU max size.
	 * @returns {Number} The current max LRU size limit.
	 * @access public
	 */
	get maxSize() {
		return this._maxSize;
	}

	/**
	 * Sets the new LRU max size.
	 * @param {Number} newMax - The new max LRU size limit.
	 * @access public
	 */
	set maxSize(newMax) {
		newMax = Math.max(~~newMax, 1);
		if (newMax < this._maxSize) {
			while (this.tail && this.cache.size > newMax) {
				this.remove(this.tail);
			}
		}
		this._maxSize = newMax;
	}

	/**
	 * Gets a value for the given key or `undefined` if not found.
	 * @param {*} key - The key of the element to retrieve.
	 * @returns {*} The value or `undefined`.
	 * @access public
	 */
	get(key) {
		if (!this.cache.has(key)) {
			return;
		}

		const elem = this.cache.get(key);

		if (this.head !== key) {
			if (key === this.tail) {
				this.tail = elem.next;
				this.cache.get(this.tail).prev = null;
			} else {
				// set prev.next -> elem.next:
				this.cache.get(elem.prev).next = elem.next;
			}

			// set elem.next.prev -> elem.prev:
			this.cache.get(elem.next).prev = elem.prev;

			// elem is the new head
			this.cache.get(this.head).next = key;
			elem.prev = this.head;
			elem.next = null;
			this.head = key;
		}

		return elem.value;
	}

	/**
	 * Sets a value for the given key.
	 * @param {*} key - The key of the element to add to the LRU.
	 * @param {*} value - The element value.
	 * @returns {*} The original value.
	 * @access public
	 */
	set(key, value) {
		let elem;

		if (this.cache.has(key)) {
			elem = this.cache.get(key);
			elem.value = value;

			// if it's already the head, there's nothing more to do:
			if (key === this.head) {
				return value;
			}

			this.unlink(key, elem);
		} else {
			// eviction is only possible if the key didn't already exist:
			if (this.cache.size === this._maxSize && this.tail) {
				this.remove(this.tail);
			}

			elem = { value: value, next: null, prev: null };
			this.cache.set(key, elem);
		}

		elem.next = null;
		elem.prev = this.head;

		if (this.head) {
			this.cache.get(this.head).next = key;
		}
		this.head = key;

		if (!this.tail) {
			this.tail = key;
		}

		return value;
	}

	/**
	 * Removes an element from the cache.
	 * @param {*} key - The key of the element to unlink.
	 * @returns {*} The removed element's value.
	 * @access public
	 */
	remove(key) {
		if (this.cache.has(key)) {
			const elem = this.cache.get(key);
			this.cache.delete(key);
			this.unlink(key, elem);
			return elem.value;
		}
	}

	/**
	 * Unlinks an element from the linked list. Used when evicting an element or
	 * promoting an element to the most recently accessed position.
	 * @param {*} key - The key of the element to unlink.
	 * @param {Object} elem - The element to unlink.
	 * @access private
	 */
	unlink(key, elem) {
		if (this.cache.size === 0) {
			this.head = this.tail = null;
		} else if (this.head === key) {
			this.head = elem.prev;
			this.cache.get(this.head).next = null;
		} else if (this.tail === key) {
			this.tail = elem.next;
			this.cache.get(this.tail).prev = null;
		} else {
			this.cache.get(elem.prev).next = elem.next;
			this.cache.get(elem.next).prev = elem.prev;
		}
	}
}
