import ModelUtils from './ModelsUtils';

const findByString = function (obj: Record<string, any>, str: string) {
    try {
        str = str.replace(/\[(\w+)\]/g, '.$1'); /** convert indexes to properties */
        str = str.replace(/^\./, ''); /** strip a leading dot */
        const arr = str.split('.');
        for (let i = 0; i < arr.length; ++i) {
            const key = arr[i];
            if (key in obj) obj = obj[key];
            else throw {};
        }
    } catch (error) {
        throw { success: false, message: 'Invalid permissions' };
    }
    return obj;
};

function isNumeric(str: number) {
    if (typeof str != 'string') return false;
    return !isNaN(str) && !isNaN(parseInt(str));
}

function between(min: number, max: number) {
    if (min === undefined || max === undefined || min > max) throw { success: false, message: 'Internal error : between' };
    if (max === min) return max;
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function isDate(date: Date) {
    return date instanceof Date && !isNaN(date.getTime());
}

function generateAuthCode(min = 100000, max = 999999) {
    return between(min, max);
}

// function resolvePath(data, path, separator = '.') {
//     const properties = Array.isArray(path) ? path : path.split(separator)
//     return properties.reduce((prev, curr) => prev && prev[curr], data)
// }

function addArray(array: any[], arrayElement: Record<string, any>, document: any, opts = { fullElement: false }) {
    if (!arrayElement || !arrayElement._id) throw { success: false, message: 'Invalid ' + document.constructor.modelName };
    if (!Array.isArray(array)) array = [];

    if (!opts.fullElement && array.some((elem) => ModelUtils.isEq(elem, arrayElement._id)))
        throw { success: false, message: 'Cannot add ' + arrayElement.constructor().modelName + ' to ' + document.constructor().modelName + '. Already exist' };
    if (array.length === 0) array.push(opts.fullElement ? arrayElement : arrayElement._id);
    else array[array.length] = opts.fullElement ? arrayElement : arrayElement._id;
}

export {
    findByString,
    isNumeric,
    between,
    generateAuthCode,
    //resolvePath,
    addArray,
    isDate,
};
