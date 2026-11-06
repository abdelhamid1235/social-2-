import mongoose, { CreateOptions, DeleteResult, FlattenMaps, HydratedDocument, MongooseUpdateQueryOptions, PopulateOptions, ProjectionType, QueryFilter, QueryOptions, Types, UpdateQuery, UpdateWithAggregationPipeline, UpdateWriteOpResult } from "mongoose";
import { AnyKeys, Model } from "mongoose";
import { IPaginate } from "../interface";

export abstract class DataBaseRepository<TRawDocType> {
    constructor(protected model : Model<TRawDocType>){};

    async create({ data }: { data: AnyKeys<TRawDocType>}): Promise<HydratedDocument<TRawDocType>>;
    async create({ data, options }: { data: AnyKeys<TRawDocType>[]; options?: CreateOptions }): Promise<HydratedDocument<TRawDocType>[]>;
    async create({ data, options }: { data: AnyKeys<TRawDocType> | AnyKeys<TRawDocType>[]; options?: CreateOptions }): Promise<HydratedDocument<TRawDocType> | HydratedDocument<TRawDocType>[]> {
        return await this.model.create(data as any, options);
    }
    async createOne({ data, options = {} }: {data: AnyKeys<TRawDocType>;options?: CreateOptions}): Promise<HydratedDocument<TRawDocType>> {
        const [doc] = await this.create({ data: [data], options });
        return doc as HydratedDocument<TRawDocType>;
    }

    async findOne({ filter, projection, options}: { filter: QueryFilter<TRawDocType>; projection?: ProjectionType<TRawDocType> | null | undefined; options: QueryOptions<TRawDocType> & { lean: true };}): Promise<FlattenMaps<TRawDocType> | null>;

    async findOne({filter,projection,options}: { filter: QueryFilter<TRawDocType>; projection?: ProjectionType<TRawDocType> | null | undefined; options?: (QueryOptions<TRawDocType> & { lean?: false }) | null | undefined;}): Promise<HydratedDocument<TRawDocType> | null>;

    async findOne({ filter = {}, projection, options}: { filter: QueryFilter<TRawDocType>; projection?: ProjectionType<TRawDocType> | null | undefined; options?: QueryOptions<TRawDocType> | null | undefined; }): Promise<HydratedDocument<TRawDocType> | FlattenMaps<TRawDocType> | undefined | null> {
        const doc = this.model.findOne(filter, projection);
        if (options?.populate) {
            doc.populate(options.populate as PopulateOptions[]);
        }
        if (options?.lean) {
            doc.lean(options.lean);
        }
        return await doc.exec() as HydratedDocument<TRawDocType> | FlattenMaps<TRawDocType> | undefined | null;
    }

    async findById({ id, projection, options }: { id: string | Types.ObjectId; projection?: ProjectionType<TRawDocType> | null | undefined; options: QueryOptions<TRawDocType> & { lean: true };}): Promise<FlattenMaps<TRawDocType> | null>;

    async findById({ id, projection, options}: { id: string | Types.ObjectId; projection?: ProjectionType<TRawDocType> | null | undefined; options?: (QueryOptions<TRawDocType> & { lean?: false }) | null | undefined;}): Promise<HydratedDocument<TRawDocType> | null>;

    async findById({ id, projection, options}: { id: string | Types.ObjectId; projection?: ProjectionType<TRawDocType> | null | undefined; options?: QueryOptions<TRawDocType> | null | undefined;}): Promise<HydratedDocument<TRawDocType> | FlattenMaps<TRawDocType> | undefined | null> {
        const doc = this.model.findById(id, projection);
        if (options?.populate) {
            doc.populate(options.populate as PopulateOptions[]);
        }
        if (options?.lean) {
            doc.lean(options.lean);
        }
        return await doc.exec() as HydratedDocument<TRawDocType> | FlattenMaps<TRawDocType> | undefined | null;
    }

    // find
    async find({ filter = {}, projection, options = {}}: {
        filter?: QueryFilter<TRawDocType>;
        projection?: ProjectionType<TRawDocType> | null | undefined;
        options?: QueryOptions<TRawDocType>;
    }): Promise<HydratedDocument<TRawDocType>[] | FlattenMaps<TRawDocType>[]> {
        const doc = this.model.find(filter, projection);
        if (options.select) {
            doc.select(options.select);
        }
        if (options.sort) {
            doc.sort(options.sort);
        }
        if (options.populate) {
            doc.populate(options.populate as PopulateOptions[]);
        }
        if (options.skip !== undefined) {
            doc.skip(options.skip);
        }
        if (options.limit !== undefined) {
            doc.limit(options.limit);
        }
        if (options.lean) {
            doc.lean(options.lean);
        }

        return await doc.exec() as HydratedDocument<TRawDocType>[] | FlattenMaps<TRawDocType>[];
    }

    // pagination

    async countDocuments({
        filter = {}
    }: {
        filter?: QueryFilter<TRawDocType>;
    } = {}): Promise<number> {
        return this.model.countDocuments(filter).exec();
    }

    async paginate({
        filter,
        projection,
        options,
        page,
        limit,
    }: {
        filter?: QueryFilter<TRawDocType>;
        projection?: ProjectionType<TRawDocType> | null | undefined;
        options: QueryOptions<TRawDocType> & { lean: true };
        page?: number;
        limit?: number;
    }): Promise<IPaginate<FlattenMaps<TRawDocType>>>;

async paginate({
    filter,
    projection,
    options,
    page,
    limit,
}: {
    filter?: QueryFilter<TRawDocType>;
    projection?: ProjectionType<TRawDocType> | null | undefined;
    options?: (QueryOptions<TRawDocType> & { lean?: false }) | null | undefined;
    page?: number;
    limit?: number;
}): Promise<IPaginate<HydratedDocument<TRawDocType>>>;

async paginate({
    filter = {},
    projection,
    options = {},
    page = 1,
    limit = 5,
}: {
    filter?: QueryFilter<TRawDocType>;
    projection?: ProjectionType<TRawDocType> | null | undefined;
    options?: QueryOptions<TRawDocType> | null | undefined;
    page?: number;
    limit?: number;
}): Promise<IPaginate<HydratedDocument<TRawDocType> | FlattenMaps<TRawDocType>>> {
    const skip = (page - 1) * limit;
    const count = await this.countDocuments({ filter });
    const pages = Math.ceil(count / limit);

    const docs = await this.find({
        filter,
        projection,
        options: {
            skip,
            limit,
            ...options
        }
    });

    return { count, limit, pages, currentPage: page, docs };
    }
    


    async updateOne(
        {
            filter = {},
            update,
            options
        }: {
            filter: QueryFilter<TRawDocType>;
            update: UpdateQuery<TRawDocType> | UpdateWithAggregationPipeline;
            options?: MongooseUpdateQueryOptions<TRawDocType> | null;
        }
    ): Promise<UpdateWriteOpResult> {
        return await this.model.updateOne(filter, update, options);
        }
        
    async updateMany(
        {
            filter = {},
            update,
            options
        }: {
            filter: QueryFilter<TRawDocType>;
            update: UpdateQuery<TRawDocType> | UpdateWithAggregationPipeline;
            options?: MongooseUpdateQueryOptions<TRawDocType> | null;
        }
    ): Promise<UpdateWriteOpResult> {
        return await this.model.updateMany(filter, update, options);
        }
        
        async findOneAndUpdate(
        {
            filter = {},
            update,
            options
        }: {
            filter?: QueryFilter<TRawDocType>;
            update?: UpdateQuery<TRawDocType>;
            options?: QueryOptions<TRawDocType> | null;
        }
    ): Promise<HydratedDocument<TRawDocType> | null> {
        return await this.model.findOneAndUpdate(filter, update, {
            returnDocument: 'after',
            ...options
        });
    }

        async findByIdAndUpdate(
        {
            _id,
            update,
            options
        }: {
            _id: mongoose.Types.ObjectId;
            update: UpdateQuery<TRawDocType>;
            options?: QueryOptions<TRawDocType> | null;
        }
    ): Promise<HydratedDocument<TRawDocType> | null> {
        return await this.model.findByIdAndUpdate(_id, update, {
            returnDocument: 'after',
            ...options
        });
    }
        
        // Delete

        async findByIdAndDelete(
        {
            _id
        }: {
            _id: mongoose.Types.ObjectId;
        }
    ): Promise<HydratedDocument<TRawDocType> | null> {
        return await this.model.findByIdAndDelete(_id);
    }
        
        async findOneAndDelete(
        {
            filter = {},
        }: {
            filter?: QueryFilter<TRawDocType>;
        }
    ): Promise<HydratedDocument<TRawDocType> | null> {
        return await this.model.findOneAndDelete(filter);
        }
        
        async deleteOne(
        {
            filter = {},
        }: {
            filter: QueryFilter<TRawDocType>;
        }
    ): Promise<DeleteResult> {
        return await this.model.deleteOne(filter);
        }

        async deleteMany(
        {
            filter = {},
        }: {
            filter: QueryFilter<TRawDocType>;
        }
    ): Promise<DeleteResult> {
        return await this.model.deleteMany(filter);
    }
        
}