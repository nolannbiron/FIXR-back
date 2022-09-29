export default () => {
    /** String */
    Object.defineProperties(String.prototype, {
        __capitalizeAll: {
            value: function () {
                return this.split('')
                    .map((c: string) => c[0].toUpperCase())
                    .join('');
            },
            enumerable: false,
        },
        __capitalize: {
            value: function () {
                return this.charAt(0).toUpperCase() + this.slice(1);
            },
            enumerable: false,
        },
        __lowerCase: {
            value: function () {
                return this.charAt(0).toLowerCase() + this.slice(1);
            },
            enumerable: false,
        },
        __lowerCaseAll: {
            value: function () {
                return this.split('')
                    .map((c: string) => c[0].toLowerCase())
                    .join('');
            },
            enumerable: false,
        },
        __doesContains: {
            value: function (types: Record<string, any>) {
                let regex = '';

                if (types.letters === undefined) types.letters = 1;
                if (types.letters) regex += 'a-zA-Z';

                if (types.numbers === undefined) types.numbers = 1;
                if (types.numbers) regex += '0-9';

                if (types.symbols === undefined) types.symbols = 0;
                if (types.symbols) regex += '\\!\\@\\#\\$\\%\\^\\&\\*\\(\\)\\_\\+\\-\\=\\{\\}\\[\\]\\|\\:\\;\\<\\>\\?\\,\\.\\/\\~\\`';

                if (types.spaces === undefined) types.spaces = 1;
                if (types.spaces) regex += '\\s';

                return !new RegExp('^[' + regex + ']*$', 'g').test(this);
            },
            enumerable: false,
        },
    });
    /** Number */
    Object.defineProperties(Number.prototype, {
        __format: {
            value: function (language = 'fr') {
                const formatter = new Intl.NumberFormat(language, { style: 'decimal' });
                return formatter.format(this);
            },
            enumerable: false,
        },
    });
    /** Object */
    Object.defineProperties(Object.prototype, {
        __resolvePath: {
            value: function (path: string | string[], separator = '.') {
                const properties = Array.isArray(path) ? path : path.split(separator);
                return properties.reduce((prev, curr) => prev && prev[curr], this);
            },
            enumerable: false,
        },
        __toQueryString: {
            value: function (separator = '&') {
                return (
                    '?' +
                    Object.keys(this)
                        .map((key) => `${key}=${this[key]}`)
                        .join(separator)
                );
            },
        },
    });
    /** Array */
    Object.defineProperties(Array.prototype, {
        __isOverlapping: {
            value: function (isOverlapping: (elem: any, pe: any) => any, createProcessedElement: any) {
                if (!Array.isArray(this)) return false;
                if (!isOverlapping) return false;

                const processedElements: any[] = [];
                return this.some((elem) => {
                    const ret = processedElements.some((pe) => isOverlapping(elem, pe));
                    processedElements.push(typeof createProcessedElement === 'function' ? createProcessedElement(elem) : elem);
                    return ret;
                });
            },
            enumerable: false,
        },
    });

    /** ----- Statics ----- */
    Array.constructor().__validateLength = function (message: string, length = 1) {
        return function (value: string) {
            if (!Array.isArray(value) || value.length < length) throw { success: false, message };
        };
    };
};
