/* @name InsertProduct */
INSERT INTO productsMs (name, price, description, stock, seller_id)
VALUES (:name!, :price!, :description!, :stock!, :seller_id!)
    RETURNING *;

/* @name GetProductById */
SELECT * FROM productsMs
         WHERE id = :id!;

/* @name GetAllProduct */
SELECT id as productId,
       name,
       price,
       description,
       stock,
       seller_id as sellerId
FROM productsMs
    LIMIT :limit! OFFSET :offset!;

/* @name GetTotalProductsCount */
SELECT COUNT(*) FROM productsMs;