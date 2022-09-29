import mongoose, { PipelineStage } from 'mongoose';
import { isDate } from './ObjectUtils';

function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

class AggregateUtils {
    static DEFAULT_MAX_AMOUNT = 200;
    _db: any;
    _defaultQuery: {
        $and: any[];
        $or: any[];
        name: any;
    };
    _activateLookup = true;
    _aggregateType: any;
    _endQuery: any;
    _totalCountQuery: any;
    _overideMaximumAmount: any;
    _req: any;
    _page: any;
    _amount: any;
    _searchValue: any;
    _sortField: any;
    _sortOrder: any;
    _filterList: any;
    _filterListKeys: any;
    _filter: any;
    _maxAmount: any;
    _aggregateSearch: any;
    _aggregate: any;
    _count: any;
    _lookup: any[];
    _filterQuery:
        | {
              $and: any[];
              $or: any[];
          }
        | any;
    _lookupsortField: any;
    _result: any;

    constructor(db: any, req: any, defaultQuery: any, opts?: Record<string, any>) {
        this._db = db;
        this._defaultQuery = defaultQuery;
        this._activateLookup = true;
        this._aggregateType = 'both';
        if (opts) {
            this._activateLookup = opts.activateLookup !== undefined ? opts.activateLookup : true;
            this._aggregateType = opts.aggregateType !== undefined ? opts.aggregateType : 'both';
            this._aggregateType = 'both';
            this._endQuery = opts.endQuery;
            this._totalCountQuery = opts.totalCountQuery;
            this._overideMaximumAmount = opts.overideMaximumAmount;
        }

        this._req = req;
        const param = req.query;
        this._page = param.page;
        this._amount = param.amount;
        this._searchValue = param.search;
        this._sortField = param.sortField;
        this._sortOrder = param.sortOrder;
        this._filter = param.filter;

        this._maxAmount = this._overideMaximumAmount ? this._overideMaximumAmount : AggregateUtils.DEFAULT_MAX_AMOUNT;

        this._aggregate = [];
        this._count = [];
        this._lookup = db.AggregateLookup();
        if (db.AggregateFilter) this._filterList = db.AggregateFilter();
        if (this._filterList) this._filterListKeys = Object.keys(this._filterList);
        this._filterQuery = {};
        this._lookup.map((elem) => (elem.keep = elem.keep === undefined ? true : elem.keep));
        this._aggregateSearch = db.AggregateSearch();
        if (!Array.isArray(this._aggregateSearch)) this._aggregateSearch = [];
        //this._lookupSearchValue = this.lookupContains(db.AggregateSearch()); // not used for now
        // need to be a list of search values : where the db is going to search for the value searchValue
        console.log(this._aggregateSearch);
        this._lookupsortField = this.lookupContains(this._sortField);
    }

    async launch() {
        if (this._filterList) this.buildFilterQuery();
        if (Object.keys(this._defaultQuery).length || Object.keys(this._filterQuery).length) {
            const filter = { ...this._filterQuery, ...this._defaultQuery };
            filter.$and = [];
            if (Array.isArray(this._filterQuery.$and)) this._filterQuery.$and.forEach((elem: any) => filter.$and.push(elem));
            if (Array.isArray(this._defaultQuery.$and)) this._defaultQuery.$and.forEach((elem) => filter.$and.push(elem));
            if (!filter.$and.length) delete filter.$and;
            this.addAggregate('both', { $match: filter });
        }
        this.addAggregate('both', { $project: this._db.AggregateProject({ userId: this._req?.user?._id }) });

        if (this._filterList.isDeleted) {
            this.addAggregate('both', {
                $match: { isDeleted: { $ne: true } },
            });
        }

        this._lookup.forEach((elem) => {
            if (elem.required && elem.beforeMatch) this.aggregateLookup(elem);
        }); /** Lookup every beforeMatch elem */
        if (this._endQuery && Object.keys(this._endQuery).length) this.addAggregate('both', { $match: this._endQuery });
        this._lookup.forEach((elem) => {
            if (elem.required && elem.beforeSearch) this.aggregateLookup(elem);
        }); /** Lookup every beforeSearch elem */
        this.aggregateSearch();
        this.aggregateSort();

        this.aggregatePages();

        this._lookup.forEach((elem) => {
            if (elem.required) this.aggregateLookup(elem);
        }); /* Populate all required elem */
        this.addAggregate('main', { $addFields: { id: '$_id' } });

        this.hideFields();
        this._lookup.forEach((elem) => {
            if (elem.done && !elem.keep)
                this.addAggregate('main', {
                    $set: { [elem.let]: '$' + elem.let + '.id' },
                });
        }); /* UnPopulate every elem with keep: false */
        this.addAggregate('count', this._totalCountQuery ? this._totalCountQuery : { $group: { _id: null, total: { $sum: 1 } } });

        const promises = [];
        if (this._aggregateType === 'both' || this._aggregateType === 'main') promises.push(this._db.aggregate(this._aggregate).collation({ locale: 'en_US', numericOrdering: true }));
        if (this._aggregateType === 'both' || this._aggregateType === 'count') promises.push(this._db.aggregate(this._count).collation({ locale: 'en_US', numericOrdering: true }));
        console.log(this);
        this._result = await Promise.all(promises);

        if (!Array.isArray(this._result) || this._result.length < promises.length) throw { success: false, message: 'Invalid aggregate' };
    }

    getResult(pos: any) {
        if (Array.isArray(this._result[pos]) && this._result[pos][0] && this._result[pos][0]._id === null) return this._result[pos][0];
        else return this._result[pos];
    }

    formatResult(path: any) {
        const result0 = this.getResult(0);
        const result1 = this.getResult(1).total;
        return {
            [path]: result0 ? result0 : [],
            total: result1 ? result1 : 0,
        };
    }

    getQueryFilterData(queryObj: any, filterObj: any) {
        const ret: Record<string, any> = {};
        switch (filterObj) {
            case 'object':
                if (queryObj.$geoWithin && typeof queryObj.$geoWithin === 'object') ret.$geoWithin = queryObj.$geoWithin;
                break;
            case 'string':
                if (queryObj.$exists !== undefined && typeof queryObj.$exists === 'boolean') ret.$exists = queryObj.$exists;
                if (queryObj.$ne !== undefined && typeof queryObj.$ne === 'string') ret.$ne = queryObj.$ne;
                if (queryObj.$eq !== undefined && typeof queryObj.$eq === 'string') ret.$eq = queryObj.$eq;
                if (queryObj.$in !== undefined && Array.isArray(queryObj.$in) && queryObj.$in.every((elem: any) => typeof elem === 'string')) ret.$in = queryObj.$in;
                break;
            case 'number':
                if (queryObj.$exists !== undefined && typeof queryObj.$exists === 'boolean') ret.$exists = queryObj.$exists;
                if (queryObj.$gt !== undefined && typeof queryObj.$gt === 'number') ret.$gt = queryObj.$gt;
                if (queryObj.$lt !== undefined && typeof queryObj.$lt === 'number') ret.$lt = queryObj.$lt;
                if (queryObj.$in !== undefined && Array.isArray(queryObj.$in) && queryObj.$in.every((elem: any) => typeof elem === 'number')) ret.$in = queryObj.$in;
                break;
            case 'date':
                if (queryObj.$gt && isDate(queryObj.$gt)) ret.$gt = new Date(queryObj.$gt);
                if (queryObj.$lt && isDate(queryObj.$lt)) ret.$lt = new Date(queryObj.$lt);
                if (queryObj.$ne !== undefined && isDate(queryObj.$ne)) ret.$ne = new Date(queryObj.$ne);
                if (queryObj.$exists !== undefined && typeof queryObj.$exists === 'boolean') ret.$exists = queryObj.$exists;
                break;
            case 'objectId':
                if (queryObj.$exists !== undefined && typeof queryObj.$exists === 'boolean') ret.$exists = queryObj.$exists;
                break;
            case 'array':
                if (queryObj.$size !== undefined && typeof queryObj.$size === 'string') {
                    ret.$exists = true;
                    if (queryObj.$size === 'fill') ret.$ne = [];
                    if (queryObj.$size === 'empty') ret.$size = 0;
                }
                if (queryObj.$in !== undefined && Array.isArray(queryObj.$in) && queryObj.$in.every((elem: any) => typeof elem === 'object' || typeof elem === 'string')) ret.$in = queryObj.$in;
                break;
        }
        if (Object.keys(ret).length === 0) return undefined;

        return ret;
    }

    handleFilterQuery(key: any, query: any, filter: any) {
        /** Pre format */
        if (filter === 'date' && typeof query === 'string') query = new Date(query);

        const queryPrototype = Object.prototype.toString.call(query);
        const filterPrototype = Object.prototype.toString.call(filter);
        /** Add filter */
        if (filterPrototype === '[object Function]') {
            filter(query, this._filterQuery, this._req);
        } else if (queryPrototype === '[object Object]') {
            /** Handle object query */
            const queryObj = this.getQueryFilterData(query, filter);
            if (!queryObj) throw { success: false, message: 'Invalid query : filter : ' + key + ' : Invalid options : ' + JSON.stringify(query[key]) };
            this._filterQuery[key] = queryObj;
        } else {
            if (queryPrototype === '[object String]' && filter === 'objectId') {
                this._filterQuery[key] = new mongoose.Types.ObjectId(query);
            } else {
                if (queryPrototype !== '[object ' + capitalize(filter) + ']') throw { success: false, message: 'Invalid query : filter : ' + key + ' : Invalid type' };
                /** Query equal */
                this._filterQuery[key] = query;
            }
        }
    }
    buildFilterQuery() {
        if (!this._filterList || !Array.isArray(this._filterListKeys) || !this._filterListKeys.length) return;
        if (!this._filter) return;

        const filterJson = typeof this._filter === 'string' ? JSON.parse(this._filter) : this._filter;
        if (!filterJson) throw { success: false, message: 'Invalid query filter' };
        const keys = Object.keys(filterJson);
        if (!Array.isArray(keys) || keys.length === 0) return;

        keys.forEach((key) => {
            if (!this._filterListKeys.some((filterKey: any) => key === filterKey)) throw { success: false, message: 'Invalid query : filter : ' + key + ' is not an available filter' };
            this.handleFilterQuery(key, filterJson[key], this._filterList[key]);
        });
    }

    addAggregate(type: any, obj: any) {
        if ((this._aggregateType === 'main' || this._aggregateType === 'both') && (type === 'main' || type === 'both')) this._aggregate.push(obj);
        if ((this._aggregateType === 'count' || this._aggregateType === 'both') && (type === 'count' || type === 'both')) this._count.push(obj);
    }

    lookupContains(searchValue: string) {
        if (this._lookup) return this._lookup.find((elem) => elem.let === searchValue);
        return undefined;
    }

    aggregateLookup(lookupElem: any) {
        if (this._activateLookup && lookupElem && !lookupElem.done) {
            lookupElem.done = true;
            if (lookupElem.isArray === undefined) lookupElem.isArray = false;
            const as = lookupElem.as !== undefined ? lookupElem.as : lookupElem.let;

            const pipeline: PipelineStage[] = [{ $match: { $expr: { $in: [lookupElem.matchValue === undefined ? '$_id' : '$' + lookupElem.matchValue, lookupElem.isArray ? '$$id' : ['$$id']] } } }];

            pipeline.push(lookupElem.project !== undefined ? { $project: { _id: 0, id: '$_id', ...lookupElem.project } } : { $project: { _id: 0, id: '$_id', name: 1 } });

            this.addAggregate(lookupElem.requiredCount ? 'both' : 'main', {
                $lookup: {
                    from: lookupElem.db,
                    let: { id: '$' + lookupElem.let },
                    pipeline,
                    as,
                },
            });

            if (!lookupElem.isArray)
                this.addAggregate('both', {
                    $unwind: { path: '$' + as, preserveNullAndEmptyArrays: true },
                });
        }
    }

    aggregateSearch() {
        if (this._searchValue !== undefined && this._searchValue !== '') {
            this._searchValue = this._searchValue?.replaceAll('+', ''); /** Phone search not working with + */
            this._searchValue = this._searchValue.trim();
            const regex = { $regex: '.*' + this._searchValue + '.*', $options: 'i' };
            this._defaultQuery.name = regex;

            const array: any[] = [];
            this._aggregateSearch.forEach((elem: any) => array.push({ [elem]: regex }));
            if (Array.isArray(array) && array.length) this.addAggregate('both', { $match: { $or: array } });
        }
    }

    aggregateSort() {
        const defaultSort = this._db.AggregateDefaultSort();
        let sort = defaultSort;
        if (this._sortField !== undefined) {
            if (this._sortOrder === 'ascending' || this._sortOrder === 'asc' || this._sortOrder === '1') this._sortOrder = 1;
            if (this._sortOrder === 'descending' || this._sortOrder === 'desc' || this._sortOrder === '-1') this._sortOrder = -1;
            if (this._sortOrder === undefined || (this._sortOrder !== -1 && this._sortOrder !== 1)) this._sortOrder = 1;
            if (this._lookupsortField) this.aggregateLookup(this._lookupsortField);

            const formattedsortField = this._lookupsortField ? this._sortField + '.name' : this._sortField;
            if (Object.keys(defaultSort) && !Object.keys(defaultSort).some((elem) => elem === this._sortField)) sort = { [formattedsortField]: this._sortOrder, ...defaultSort };
            else sort = { [formattedsortField]: this._sortOrder };
        }
        this.addAggregate('main', { $sort: { ...sort, _id: 1 } });
    }

    aggregatePages() {
        if (this._amount === undefined || this._amount > this._maxAmount) {
            this._amount = this._maxAmount;
        }
        if (this._page === undefined) this._page = 0;

        if (this._page !== undefined && this._amount !== undefined) {
            const from = parseInt(this._page) * parseInt(this._amount);
            const to = parseInt(this._amount);
            if (from > 0) this.addAggregate('main', { $skip: from });
            this.addAggregate('main', { $limit: to });
        }
    }

    hideFields() {
        let unsets = [];
        if (this._db.HideFields) unsets = this._db.HideFields();
        unsets.push('_id');
        this.addAggregate('main', { $unset: unsets });
    }
}
export default AggregateUtils;
