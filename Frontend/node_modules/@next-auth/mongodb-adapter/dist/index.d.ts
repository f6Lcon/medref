/**
 * <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", padding: 16}}>
 *  <p style={{fontWeight: "normal"}}>Official <a href="https://www.mongodb.com">MongoDB</a> adapter for Auth.js / NextAuth.js.</p>
 *  <a href="https://www.mongodb.com">
 *   <img style={{display: "block"}} src="https://authjs.dev/img/adapters/mongodb.svg" width="30" />
 *  </a>
 * </div>
 *
 * ## Installation
 *
 * ```bash npm2yarn2pnpm
 * npm install next-auth @next-auth/mongodb-adapter mongodb
 * ```
 *
 * @module @next-auth/mongodb-adapter
 */
import { ObjectId } from "mongodb";
import type { Adapter } from "next-auth/adapters";
import type { MongoClient } from "mongodb";
/** This is the interface of the MongoDB adapter options. */
export interface MongoDBAdapterOptions {
    /**
     * The name of the {@link https://www.mongodb.com/docs/manual/core/databases-and-collections/#collections MongoDB collections}.
     */
    collections?: {
        Users?: string;
        Accounts?: string;
        Sessions?: string;
        VerificationTokens?: string;
    };
    /**
     * The name you want to give to the MongoDB database
     */
    databaseName?: string;
}
export declare const defaultCollections: Required<Required<MongoDBAdapterOptions>["collections"]>;
export declare const format: {
    /** Takes a mongoDB object and returns a plain old JavaScript object */
    from<T = Record<string, unknown>>(object: Record<string, any>): T;
    /** Takes a plain old JavaScript object and turns it into a mongoDB object */
    to<T_1 = Record<string, unknown>>(object: Record<string, any>): T_1 & {
        _id: ObjectId;
    };
};
/** @internal */
export declare function _id(hex?: string): ObjectId;
/**
 * ## Setup
 *
 * The MongoDB adapter does not handle connections automatically, so you will have to make sure that you pass the Adapter a `MongoClient` that is connected already. Below you can see an example how to do this.
 *
 * ### Add the MongoDB client
 *
 * ```ts
 * // This approach is taken from https://github.com/vercel/next.js/tree/canary/examples/with-mongodb
 * import { MongoClient } from "mongodb"
 *
 * if (!process.env.MONGODB_URI) {
 *   throw new Error('Invalid/Missing environment variable: "MONGODB_URI"')
 * }
 *
 * const uri = process.env.MONGODB_URI
 * const options = {}
 *
 * let client
 * let clientPromise: Promise<MongoClient>
 *
 * if (process.env.NODE_ENV === "development") {
 *   // In development mode, use a global variable so that the value
 *   // is preserved across module reloads caused by HMR (Hot Module Replacement).
 *   if (!global._mongoClientPromise) {
 *     client = new MongoClient(uri, options)
 *     global._mongoClientPromise = client.connect()
 *   }
 *   clientPromise = global._mongoClientPromise
 * } else {
 *   // In production mode, it's best to not use a global variable.
 *   client = new MongoClient(uri, options)
 *   clientPromise = client.connect()
 * }
 *
 * // Export a module-scoped MongoClient promise. By doing this in a
 * // separate module, the client can be shared across functions.
 * export default clientPromise
 * ```
 *
 * ### Configure Auth.js
 *
 * ```js
 * import NextAuth from "next-auth"
 * import { MongoDBAdapter } from "@next-auth/mongodb-adapter"
 * import clientPromise from "../../../lib/mongodb"
 *
 * // For more information on each option (and a full list of options) go to
 * // https://authjs.dev/reference/providers/oauth
 * export default NextAuth({
 *   adapter: MongoDBAdapter(clientPromise),
 *   ...
 * })
 * ```
 **/
export declare function MongoDBAdapter(client: Promise<MongoClient>, options?: MongoDBAdapterOptions): Adapter;
