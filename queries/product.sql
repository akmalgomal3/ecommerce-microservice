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

/* @name UpdateProduct */
UPDATE productsMs
SET
    name = COALESCE(:name, name),
    price = COALESCE(:price, price),
    description = COALESCE(:description, description),
    stock = COALESCE(:stock, stock),
    updated_at = :updated_at!
WHERE id = :id!
RETURNING *;