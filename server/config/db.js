import {neon} from "@neondatabase/serverless";

const Sql = neon(`${process.env.DATABASE_URL}`);

export default Sql;