import type { Request, Response, NextFunction } from "express";
import { db } from "../db/index.js";
import { eq, and, desc } from "drizzle-orm";
import { products } from "../db/schema.js";


const listProduct = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const cat = typeof req.query.category === "string" ? req.query.category.trim() : ""

        const activeOnly = eq(products.active, true)
        const whereClause = cat ? and(activeOnly, eq(products.category, cat)) : activeOnly

        const rows = await db
        .select()
        .from(products)
        .where(whereClause)
        .orderBy(desc(products.createdAt))

        res.json({products: rows})
    } catch (error) {
        next(error)
    }
}

const getCategory = async(_req: Request, res: Response, next: NextFunction) => {
    try {
        const rows = await db
            .select({category: products.category})
            .from(products)
            .where(eq(products.active, true))

            const category = [...new Set(rows.map((row) => row.category))].sort((a,b) => a.localeCompare(b))

            res.json({category})
    } catch (error) {
        next(error)
    }
}

const getProductBySlug = async(req: Request, res: Response, next: NextFunction) => {

    try {
        const slug = req.params.slug as string
        const [row] = await db
            .select()
            .from(products)
            .where(eq(products.slug, slug))
            .limit(1)

        if(!row || !row.active) return res.status(404).json({error: "Not found"})

        res.json({product : row})

    } catch (error) {
        next(error)
    }
}

export {
    listProduct,
    getCategory,
    getProductBySlug
}